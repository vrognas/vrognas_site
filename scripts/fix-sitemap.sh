#!/bin/bash
# Post-render script to fix sitemap URLs
# Converts /path/index.html → /path/ to match canonical URLs

SITEMAP="_site/sitemap.xml"

if [ -f "$SITEMAP" ]; then
    echo "Fixing sitemap URLs to match canonical format..."

    # Replace index.html with trailing slash in sitemap
    # This ensures sitemap URLs match the canonical URLs
    sed -i 's|/index\.html</loc>|/</loc>|g' "$SITEMAP"

    echo "Sitemap fixed: index.html suffixes removed"
else
    echo "Warning: sitemap.xml not found at $SITEMAP"
fi
