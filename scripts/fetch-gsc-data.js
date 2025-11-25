#!/usr/bin/env node
/**
 * Fetch Google Search Console data and save to JSON files
 * Run via GitHub Actions on a schedule or manually
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function main() {
  // Setup authentication
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
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
            dailyRes.data.rows.reduce((sum, r) => sum + r.position, 0) / dailyRes.data.rows.length : 0
        },
        topQueries: queriesRes.data.rows || [],
        topPages: pagesRes.data.rows || [],
        byCountry: countriesRes.data.rows || [],
        byDevice: devicesRes.data.rows || [],
        dailyPerformance: dailyRes.data.rows || [],
        sitemaps
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
