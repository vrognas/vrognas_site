#!/usr/bin/env python3
"""Replace the rendered "Published" date with a "Modified" date taken from git.

Quarto renders the frontmatter `date:` as "Published", which went stale the
moment a page was rewritten. Every page now shows a single date, labelled
Modified, derived from the last commit that touched its source. Keeping such a
field accurate by hand does not scale, and deriving it from file mtime is wrong
in CI: Netlify clones fresh, so every mtime is the checkout time and every page
would claim it changed at build time.

Git is the only reliable source, which is why this mirrors fix-sitemap.py: one
`git log` pass for the whole tree, then patch the rendered output.

It runs POST-render and never edits a .qmd. That is deliberate. Quarto keys its
freeze cache on a hash of the source file, so stamping frontmatter would
invalidate the freeze of any page carrying an executable cell. The build server
has no R, so the next deploy would die on "Unable to locate an installed
version of R" - a failure this project has already hit once from a one-word
prose edit. Patching output keeps sources byte-stable and the freeze valid.

Pages whose source or git history cannot be resolved are left alone, as are
pages that carry no date at all. The dcterms.date meta tag is moved to the same
git date so the machine-readable date agrees with the visible one.

If the date block cannot be found on ANY page the script fails the render, so a
Quarto markup change cannot silently stop stamping dates.
"""
import os
import re
import subprocess
import sys
from pathlib import Path

OUT = Path(os.environ.get("QUARTO_PROJECT_OUTPUT_DIR", "_site"))
if not OUT.is_dir():
    print(f"Warning: output dir not found at {OUT}")
    sys.exit(0)


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], capture_output=True, text=True)


def is_shallow() -> bool:
    return git("rev-parse", "--is-shallow-repository").stdout.strip() == "true"


def git_commit_dates() -> dict[str, str]:
    """Map every tracked path to the ISO date of the commit that last touched it.

    Same shallow-clone guard as fix-sitemap.py: in a --depth 1 clone the
    boundary commit is grafted parentless, so `git log --name-only` attributes
    the entire tree to it and every page would share one date.
    """
    try:
        shallow = is_shallow()
    except OSError as exc:
        print(f"Warning: git unavailable ({exc}); skipping modified dates")
        return {}

    if shallow:
        print("Shallow clone detected; fetching full history for modified dates...")
        git("fetch", "--unshallow", "--quiet")
        if is_shallow():
            print(
                "Warning: could not deepen the clone; skipping modified dates. "
                "Every page would otherwise share the boundary commit's date.",
                file=sys.stderr,
            )
            return {}

    result = git("-c", "core.quotePath=false", "log", "--format=%x01%cI", "--name-only")
    if result.returncode != 0:
        print(f"Warning: git log failed ({result.stderr.strip()}); skipping modified dates")
        return {}

    dates: dict[str, str] = {}
    current = None
    for line in result.stdout.splitlines():
        if line.startswith("\x01"):
            current = line[1:]
        elif line and current:
            dates.setdefault(line, current)
    return dates


MONTHS = ("January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December")


def pretty(iso: str) -> str:
    """2026-09-21T23:39:57+02:00 -> 'September 21, 2026' (Quarto's format)."""
    y, m, d = iso[:10].split("-")
    return f"{MONTHS[int(m) - 1]} {int(d)}, {y}"


def source_for(page: Path) -> Path | None:
    """Resolve a rendered page back to the .qmd/.md that produced it."""
    rel = page.relative_to(OUT).parent
    candidates = [rel / "index.qmd", rel / "index.md"]
    # the site root renders to _site/index.html, whose parent is "." and has no
    # name to give a suffix to; only non-root pages have a <page>.qmd form
    if rel.name:
        candidates += [rel.with_suffix(".qmd"), rel.with_suffix(".md")]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


PUBLISHED = re.compile(
    r'(<div>\s*<div class="quarto-title-meta-heading">Published</div>\s*'
    r'<div class="quarto-title-meta-contents">\s*<p class="date">([^<]*)</p>\s*'
    r"</div>\s*</div>)",
    re.S,
)
EXISTING = re.compile(
    r'<div>\s*<div class="quarto-title-meta-heading">Modified</div>\s*'
    r'<div class="quarto-title-meta-contents">\s*<p class="date-modified">([^<]*)</p>\s*'
    r"</div>\s*</div>",
    re.S,
)

dates = git_commit_dates()
if not dates:
    sys.exit(0)

stamped = no_source = no_block = 0
for page in sorted(OUT.rglob("*.html")):
    try:
        html = page.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        continue
    if "quarto-title-meta" not in html:
        continue

    src = source_for(page)
    if src is None:
        no_source += 1
        continue
    iso = dates.get(src.as_posix())
    if iso is None:
        no_source += 1
        continue

    has_published = bool(PUBLISHED.search(html))
    has_modified = bool(EXISTING.search(html))
    if not has_published and not has_modified:
        no_block += 1
        continue

    block = (
        '<div>\n    <div class="quarto-title-meta-heading">Modified</div>\n'
        '    <div class="quarto-title-meta-contents">\n'
        f'      <p class="date-modified">{pretty(iso)}</p>\n'
        "    </div>\n  </div>"
    )
    # Replace whichever block the page has with a single Modified block, so a
    # second run over already-stamped output is a no-op rather than a failure.
    # Quarto emits Modified only when the page declares date-modified itself;
    # after one pass it is the block this script wrote.
    if has_published:
        html = EXISTING.sub("", html)
        html = PUBLISHED.sub(lambda _: block, html, count=1)
    else:
        html = EXISTING.sub(lambda _: block, html, count=1)
    html = re.sub(
        r'(<meta name="dcterms.date" content=")[^"]*(")',
        lambda mm: mm.group(1) + iso[:10] + mm.group(2),
        html,
        count=1,
    )
    page.write_text(html, encoding="utf-8")
    stamped += 1

print(f"Modified dates: {stamped} pages stamped from git")
if no_source or no_block:
    print(f"  skipped: {no_source} without git history, {no_block} without a date block")

if stamped == 0:
    print(
        "ERROR: no page received a Modified date; the date block markup "
        "may have changed (format drift?)",
        file=sys.stderr,
    )
    sys.exit(1)
