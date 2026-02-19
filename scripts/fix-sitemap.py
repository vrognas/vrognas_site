#!/usr/bin/env python3
"""Fix sitemap URLs: /path/index.html -> /path/ to match canonical URLs"""
import os, sys

if not os.environ.get("NETLIFY"):
    sys.exit(0)

sitemap = "_site/sitemap.xml"
if not os.path.isfile(sitemap):
    print(f"Warning: sitemap.xml not found at {sitemap}")
    sys.exit(0)

print("Fixing sitemap URLs to match canonical format...")
with open(sitemap) as f:
    content = f.read()
content = content.replace("/index.html</loc>", "/</loc>")
with open(sitemap, "w") as f:
    f.write(content)
print("Sitemap fixed: index.html suffixes removed")
