#!/usr/bin/env python3
"""Remove duplicate canonical tags (first occurrence points to homepage)"""
import os, re, sys
from pathlib import Path

if not os.environ.get("NETLIFY"):
    sys.exit(0)

print("Fixing duplicate canonical tags...")
# Match the homepage canonical tag (with or without self-closing slash)
pattern = re.compile(r'<link rel="canonical" href="https://vrognas\.com/"[^>]*/?\>[^\n]*\n?')

for html_file in Path("_site").rglob("*.html"):
    content = html_file.read_text(encoding="utf-8", errors="ignore")
    count = content.count('<link rel="canonical"')
    if count > 1:
        print(f"  Fixing {html_file} (found {count} canonical tags)")
        content = pattern.sub("", content, count=1)
        html_file.write_text(content, encoding="utf-8")

print("Done fixing canonical tags!")
