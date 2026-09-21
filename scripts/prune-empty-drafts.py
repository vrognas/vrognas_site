#!/usr/bin/env python3
"""Delete rendered pages that have no <head>.

Quarto's default draft-mode ("gone") writes every `draft: true` page as an
empty shell - `<!DOCTYPE html><html></html>`, no <head>, no content - while
keeping the URL. Two problems follow:

1. The URL serves a blank 200. Google indexes that as a real page;
   /docs/tools-of-the-trade/git/ is "Submitted and indexed" as exactly this.
2. netlify-plugin-inline-critical-css fails the whole build trying to insert a
   <style> node into a document that has no <head>.

Removing the shells makes those URLs 404, which is what a page with no content
should return. The .qmd sources are untouched and stay in the repo as drafts.

Every removal is printed, so if Quarto ever starts emitting headless HTML for
some other reason it shows up in the build log instead of silently deleting
real pages.
"""
import os
import sys
from pathlib import Path

output_dir = Path(os.environ.get("QUARTO_PROJECT_OUTPUT_DIR", "_site"))
if not output_dir.is_dir():
    print(f"Warning: output dir not found at {output_dir}")
    sys.exit(0)

removed = []
for page in sorted(output_dir.rglob("*.html")):
    if "<head" not in page.read_text(encoding="utf-8", errors="ignore").lower():
        page.unlink()
        removed.append(page.relative_to(output_dir).as_posix())

print(f"Pruned {len(removed)} empty draft pages")
for path in removed:
    print(f"  removed: {path}")
