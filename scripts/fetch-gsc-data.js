#!/usr/bin/env node
/**
 * Fetch Google Search Console data and save to JSON files
 * Run via GitHub Actions on a schedule or manually
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Rate limit helper - URL Inspection API has quota limits
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch and parse sitemap XML to get all URLs
async function fetchSitemapUrls(sitemapUrl) {
  return new Promise((resolve, reject) => {
    https.get(sitemapUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Simple XML parsing for <loc> tags
        const urls = [];
        const locMatches = data.matchAll(/<loc>([^<]+)<\/loc>/g);
        for (const match of locMatches) {
          urls.push(match[1]);
        }
        resolve(urls);
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  // Setup authentication - need webmasters scope for URL inspection
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });

  const client = await auth.getClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth: client });

  // Get list of sites
  console.log('Fetching site list...');
  const sitesRes = await searchconsole.sites.list();
  const sites = sitesRes.data.siteEntry || [];

  if (sites.length === 0) {
    console.log('No sites found. Make sure the service account has access to your Search Console property.');
    console.log('Service account email should be added as a user in Search Console settings.');
    process.exit(1);
  }

  console.log(`Found ${sites.length} site(s):`);
  sites.forEach(s => console.log(`  - ${s.siteUrl} (${s.permissionLevel})`));

  // Save sites list
  fs.writeFileSync(
    path.join(DATA_DIR, 'gsc-sites.json'),
    JSON.stringify({ fetchedAt: new Date().toISOString(), sites }, null, 2)
  );

  // Fetch data for each site
  for (const site of sites) {
    const siteUrl = site.siteUrl;
    const safeName = siteUrl.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    console.log(`\nFetching data for ${siteUrl}...`);

    // Calculate date range (last 28 days, excluding last 3 days for data freshness)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 28);

    const dateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };

    try {
      // Fetch search analytics - top queries
      console.log('  Fetching top queries...');
      const queriesRes = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          ...dateRange,
          dimensions: ['query'],
          rowLimit: 100,
          dataState: 'final'
        }
      });

      // Fetch search analytics - top pages
      console.log('  Fetching top pages...');
      const pagesRes = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          ...dateRange,
          dimensions: ['page'],
          rowLimit: 100,
          dataState: 'final'
        }
      });

      // Fetch search analytics - by country
      console.log('  Fetching by country...');
      const countriesRes = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          ...dateRange,
          dimensions: ['country'],
          rowLimit: 50,
          dataState: 'final'
        }
      });

      // Fetch search analytics - by device
      console.log('  Fetching by device...');
      const devicesRes = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          ...dateRange,
          dimensions: ['device'],
          dataState: 'final'
        }
      });

      // Fetch search analytics - daily totals
      console.log('  Fetching daily performance...');
      const dailyRes = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          ...dateRange,
          dimensions: ['date'],
          dataState: 'final'
        }
      });

      // Fetch sitemaps
      console.log('  Fetching sitemaps...');
      let sitemaps = [];
      try {
        const sitemapsRes = await searchconsole.sitemaps.list({ siteUrl });
        sitemaps = sitemapsRes.data.sitemap || [];
      } catch (e) {
        console.log('    (No sitemaps or access denied)');
      }

      // Collect all URLs to inspect (from sitemaps and top pages)
      console.log('  Collecting URLs for indexing inspection...');
      let urlsToInspect = new Set();

      // Add URLs from sitemaps
      for (const sitemap of sitemaps) {
        if (sitemap.path) {
          try {
            const sitemapUrls = await fetchSitemapUrls(sitemap.path);
            sitemapUrls.forEach(url => urlsToInspect.add(url));
            console.log(`    Found ${sitemapUrls.length} URLs in ${sitemap.path}`);
          } catch (e) {
            console.log(`    Could not fetch sitemap ${sitemap.path}: ${e.message}`);
          }
        }
      }

      // Add top pages from search analytics
      (pagesRes.data.rows || []).forEach(row => {
        if (row.keys && row.keys[0]) {
          urlsToInspect.add(row.keys[0]);
        }
      });

      console.log(`  Total unique URLs to inspect: ${urlsToInspect.size}`);

      // Inspect URLs for indexing status (with rate limiting)
      console.log('  Inspecting URL indexing status...');
      const indexingResults = [];
      const indexingIssues = [];
      let inspectedCount = 0;

      for (const inspectionUrl of urlsToInspect) {
        try {
          // Rate limit: ~1 request per 100ms to stay well under quota
          await sleep(100);

          const inspectRes = await searchconsole.urlInspection.index.inspect({
            requestBody: {
              inspectionUrl,
              siteUrl
            }
          });

          const result = inspectRes.data.inspectionResult;
          inspectedCount++;

          const indexStatus = result?.indexStatusResult;
          const pageUrl = inspectionUrl;

          // Store result
          const urlResult = {
            url: pageUrl,
            verdict: indexStatus?.verdict || 'UNKNOWN',
            coverageState: indexStatus?.coverageState || 'UNKNOWN',
            robotsTxtState: indexStatus?.robotsTxtState,
            indexingState: indexStatus?.indexingState,
            lastCrawlTime: indexStatus?.lastCrawlTime,
            pageFetchState: indexStatus?.pageFetchState,
            crawledAs: indexStatus?.crawledAs,
            referringUrls: indexStatus?.referringUrls
          };

          indexingResults.push(urlResult);

          // Track issues (anything not indexed or with problems)
          if (indexStatus?.verdict !== 'PASS' || indexStatus?.coverageState !== 'Submitted and indexed') {
            indexingIssues.push({
              url: pageUrl,
              verdict: indexStatus?.verdict,
              coverageState: indexStatus?.coverageState,
              reason: indexStatus?.coverageState || indexStatus?.verdict || 'Unknown issue'
            });
          }

          // Progress indicator every 50 URLs
          if (inspectedCount % 50 === 0) {
            console.log(`    Inspected ${inspectedCount}/${urlsToInspect.size} URLs...`);
          }

        } catch (e) {
          // Log but continue on individual URL errors
          if (e.message.includes('quota') || e.message.includes('rate')) {
            console.log(`    Rate limit hit after ${inspectedCount} URLs, stopping inspection`);
            break;
          }
          indexingResults.push({
            url: inspectionUrl,
            verdict: 'ERROR',
            error: e.message
          });
        }
      }

      console.log(`  Inspected ${inspectedCount} URLs, found ${indexingIssues.length} with issues`);

      // Aggregate issues by type
      const issuesByType = {};
      for (const issue of indexingIssues) {
        const key = issue.reason || 'Unknown';
        if (!issuesByType[key]) {
          issuesByType[key] = [];
        }
        issuesByType[key].push(issue.url);
      }

      // Compile all data
      const siteData = {
        fetchedAt: new Date().toISOString(),
        siteUrl,
        dateRange,
        summary: {
          totalClicks: dailyRes.data.rows?.reduce((sum, r) => sum + r.clicks, 0) || 0,
          totalImpressions: dailyRes.data.rows?.reduce((sum, r) => sum + r.impressions, 0) || 0,
          avgCtr: dailyRes.data.rows?.length ?
            dailyRes.data.rows.reduce((sum, r) => sum + r.ctr, 0) / dailyRes.data.rows.length : 0,
          avgPosition: dailyRes.data.rows?.length ?
            dailyRes.data.rows.reduce((sum, r) => sum + r.position, 0) / dailyRes.data.rows.length : 0,
          totalUrlsInspected: inspectedCount,
          urlsWithIssues: indexingIssues.length
        },
        topQueries: queriesRes.data.rows || [],
        topPages: pagesRes.data.rows || [],
        byCountry: countriesRes.data.rows || [],
        byDevice: devicesRes.data.rows || [],
        dailyPerformance: dailyRes.data.rows || [],
        sitemaps,
        // Indexing status data
        indexing: {
          inspectedAt: new Date().toISOString(),
          totalInspected: inspectedCount,
          issueCount: indexingIssues.length,
          issuesByType,
          issues: indexingIssues,
          allResults: indexingResults
        }
      };

      // Save site data
      const filename = `gsc-${safeName}.json`;
      fs.writeFileSync(
        path.join(DATA_DIR, filename),
        JSON.stringify(siteData, null, 2)
      );
      console.log(`  Saved to data/${filename}`);

    } catch (error) {
      console.error(`  Error fetching data for ${siteUrl}:`, error.message);
    }
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
