#!/usr/bin/env python3
"""Assert structural invariants of the rendered site.

Navigation here is hand-maintained on purpose (no `listing:`, no `contents: auto`),
which buys full control over ordering and labels but means adding a page takes three
synced edits: the file, the `_quarto.yml` sidebar entry, and the hub card. Nothing
reconciled those three, so the site accumulated an orphan page published with no nav,
a sidebar entry pointing at a draft that the prune step deletes, two broken images,
and redirects aimed at pages that no longer exist.

This script is the reconciliation step. It runs after `quarto render` and fails the
build on any of those four classes of defect.

Usage: python scripts/check-site.py [output_dir]
"""
import os
import re
import sys
import io
import posixpath

SITE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get(
    "QUARTO_PROJECT_OUTPUT_DIR", "_site"
)

failures = []


def fail(check, msg):
    failures.append((check, msg))


def read(path):
    return io.open(path, encoding="utf-8", errors="ignore").read()


if not os.path.isdir(SITE):
    print(f"Output dir not found: {SITE}")
    sys.exit(1)

html_files = []
for root, _, files in os.walk(SITE):
    for fn in files:
        if fn.endswith(".html"):
            html_files.append(os.path.join(root, fn))


def resolve(root, ref):
    """Resolve a page-relative or site-root-relative reference to a path under SITE."""
    ref = ref.split("#")[0].split("?")[0]
    if not ref:
        return None
    if ref.startswith("/"):
        return posixpath.normpath(posixpath.join(SITE, ref.lstrip("/")))
    return posixpath.normpath(posixpath.join(root.replace(os.sep, "/"), ref))


# ---------------------------------------------------------------- 1. dead links
for p in html_files:
    root = os.path.dirname(p)
    h = read(p)
    rel = p.replace(os.sep, "/")[len(SITE) + 1 :]

    for src in re.findall(r'<img[^>]*src="([^"]+)"', h):
        if src.startswith(("http", "data:", "//")):
            continue
        t = resolve(root, src)
        if t and not os.path.exists(t):
            fail("dead-image", f"{rel} -> {src}")

    for href in re.findall(r'<a[^>]*href="([^"]+)"', h):
        if href.startswith(("http", "mailto:", "#", "data:", "//", "javascript:")):
            continue
        t = resolve(root, href)
        if t is None:
            continue
        if os.path.isdir(t):
            t = posixpath.join(t, "index.html")
        if not os.path.exists(t):
            fail("dead-link", f"{rel} -> {href}")

# --------------------------------------------- 2. nav entries pointing at nothing
# A `draft: true` page renders as a headless shell that prune-empty-drafts.py
# deletes, so a sidebar entry naming it emits a rel=next/prev link to a 404.
quarto_yml = read("_quarto.yml")
for href in re.findall(r"href:\s*(\S+\.qmd)", quarto_yml):
    if not os.path.exists(href):
        fail("nav-missing-source", f"_quarto.yml references {href}, which does not exist")
        continue
    src = read(href)
    if re.search(r"^draft:\s*true", src, re.M):
        fail("nav-points-at-draft", f"_quarto.yml references {href}, which is draft: true")

# ------------------------------------------- 3. published pages absent from nav
# Every rendered page under docs/ should be reachable from the hand-written nav.
nav_targets = {
    h.replace("\\", "/") for h in re.findall(r"href:\s*(\S+\.qmd)", quarto_yml)
}
for p in html_files:
    rel = p.replace(os.sep, "/")[len(SITE) + 1 :]
    if not rel.startswith("docs/") or not rel.endswith("index.html"):
        continue
    qmd = rel[: -len("index.html")] + "index.qmd"
    if qmd not in nav_targets:
        fail("orphan-page", f"{rel} is published but absent from _quarto.yml")

# ------------------------------------------- 4. redirects aimed at missing pages
if os.path.exists("_redirects"):
    for ln, line in enumerate(read("_redirects").split("\n"), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        _, to = parts[0], parts[1]
        status = parts[2] if len(parts) > 2 else "301"
        if status.startswith("4") or "*" in to or ":splat" in to:
            continue  # 410s are intentional; wildcards cannot be resolved statically
        if not to.startswith("/"):
            continue
        t = posixpath.normpath(posixpath.join(SITE, to.lstrip("/")))
        if os.path.isdir(t):
            t = posixpath.join(t, "index.html")
        elif not t.endswith(".html"):
            t = t + "/index.html" if os.path.isdir(t) else t
        if not os.path.exists(t):
            fail("redirect-to-404", f"_redirects:{ln} -> {to}")

# ---------------------------------------------------------------------- report
if failures:
    by_check = {}
    for check, msg in failures:
        by_check.setdefault(check, []).append(msg)
    print(f"check-site: FAILED with {len(failures)} problem(s)\n")
    for check, msgs in sorted(by_check.items()):
        print(f"  [{check}] {len(msgs)}")
        for m in msgs[:25]:
            print(f"      {m}")
        if len(msgs) > 25:
            print(f"      ... and {len(msgs) - 25} more")
        print()
    sys.exit(1)

print(f"check-site: OK ({len(html_files)} pages checked)")
