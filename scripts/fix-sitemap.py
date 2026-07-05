#!/usr/bin/env python3
"""Fix sitemap URLs: /path/index.html -> /path/ to match canonical URLs.

Runs unconditionally (local, CI, Netlify) so every environment produces the
same sitemap as production. Fails the render if the result still contains
index.html locs, so a Quarto sitemap-format change cannot silently ship an
unfixed sitemap.
"""
import os
import sys

sitemap = "_site/sitemap.xml"
if not os.path.isfile(sitemap):
    print(f"Warning: sitemap.xml not found at {sitemap}")
    sys.exit(0)

print("Fixing sitemap URLs to match canonical format...")
with open(sitemap) as f:
    content = f.read()

fixed = content.count("/index.html</loc>")
content = content.replace("/index.html</loc>", "/</loc>")
with open(sitemap, "w") as f:
    f.write(content)

if "index.html" in content:
    print("ERROR: sitemap still contains index.html after fixing (format drift?)", file=sys.stderr)
    sys.exit(1)

print(f"Sitemap fixed: {fixed} index.html suffixes removed")
