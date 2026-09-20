#!/usr/bin/env python3
"""Fix sitemap URLs and lastmod dates.

Two passes over the rendered sitemap:

1. /path/index.html -> /path/ so locs match the canonical URLs.
2. Replace Quarto's render timestamp in <lastmod> with the date the page's
   source .qmd was last committed. Quarto stamps every URL with the build
   time, so a rebuild resets all 86 dates at once and Google learns lastmod
   carries no information.

Runs unconditionally (local, CI, Netlify) so every environment produces the
same sitemap as production. Fails the render if the result still contains
index.html locs, so a Quarto sitemap-format change cannot silently ship an
unfixed sitemap.

Pages whose source or git history cannot be resolved keep Quarto's timestamp,
and the summary line reports how many.

A shallow clone has to be detected explicitly rather than inferred from that
count. Netlify clones with --depth 1, and in a shallow clone the boundary
commit is grafted parentless, so its diff is against the empty tree and
`git log --name-only` attributes the whole tree to that one commit. Every page
would get the same date and the summary would still read "86 from git" - the
exact failure this script exists to prevent, wearing a healthy-looking log
line. So the clone is deepened first, and if that is not possible the git pass
is abandoned outright.
"""
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

sitemap = os.path.join(os.environ.get("QUARTO_PROJECT_OUTPUT_DIR", "_site"), "sitemap.xml")
if not os.path.isfile(sitemap):
    print(f"Warning: sitemap.xml not found at {sitemap}")
    sys.exit(0)

print("Fixing sitemap URLs to match canonical format...")
with open(sitemap) as f:
    content = f.read()

fixed = content.count("/index.html</loc>")
content = content.replace("/index.html</loc>", "/</loc>")

if "index.html" in content:
    print("ERROR: sitemap still contains index.html after fixing (format drift?)", file=sys.stderr)
    sys.exit(1)

print(f"Sitemap fixed: {fixed} index.html suffixes removed")


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], capture_output=True, text=True)


def is_shallow() -> bool:
    return git("rev-parse", "--is-shallow-repository").stdout.strip() == "true"


def git_commit_dates() -> dict[str, str]:
    """Map every tracked path to the ISO date of the commit that last touched it.

    One `git log` pass over the whole history; entries are newest-first, so the
    first date seen for a path wins. Returns {} when the history is unavailable
    or too shallow to be trusted, in which case every page keeps the timestamp
    Quarto wrote.
    """
    try:
        shallow = is_shallow()
    except OSError as exc:
        print(f"Warning: git unavailable ({exc}); keeping render timestamps")
        return {}

    if shallow:
        print("Shallow clone detected; fetching full history for lastmod dates...")
        git("fetch", "--unshallow", "--quiet")
        if is_shallow():
            print(
                "Warning: could not deepen the clone; keeping render timestamps. "
                "Every page would otherwise share the boundary commit's date.",
                file=sys.stderr,
            )
            return {}

    # core.quotePath=false keeps non-ASCII paths literal; git would otherwise
    # emit them C-quoted and they would not match the file names on disk.
    result = git("-c", "core.quotePath=false", "log", "--format=%x01%cI", "--name-only")
    if result.returncode != 0:
        print(f"Warning: git log failed ({result.stderr.strip()}); keeping render timestamps")
        return {}

    dates: dict[str, str] = {}
    current = None
    for line in result.stdout.splitlines():
        if line.startswith("\x01"):
            current = line[1:]
        elif line and current:
            dates.setdefault(line, current)
    return dates


def source_for(loc: str) -> Path | None:
    """Resolve a sitemap loc back to the .qmd/.md file that produced it."""
    path = urlparse(loc).path.strip("/")
    base = Path(path) if path else Path()
    candidates = [base / "index.qmd", base / "index.md"]
    if path:
        candidates += [base.with_suffix(".qmd"), base.with_suffix(".md")]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


def to_utc(iso: str) -> str:
    """Normalize a git ISO date to the UTC form Quarto already emits."""
    return datetime.fromisoformat(iso).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


commit_dates = git_commit_dates()
from_git = 0
fallback: list[str] = []


def set_lastmod(match: re.Match) -> str:
    """Rewrite one <loc>/<lastmod> pair with the source file's commit date."""
    global from_git
    loc = match.group("loc")
    source = source_for(loc)
    committed = commit_dates.get(source.as_posix()) if source else None
    if committed is None:
        fallback.append(loc)
        return match.group(0)
    from_git += 1
    return match.group("before") + to_utc(committed) + match.group("after")


content = re.sub(
    r"(?P<before><loc>(?P<loc>[^<]+)</loc>\s*<lastmod>)[^<]*(?P<after></lastmod>)",
    set_lastmod,
    content,
)

with open(sitemap, "w") as f:
    f.write(content)

print(f"Sitemap lastmod: {from_git} from git, {len(fallback)} kept render timestamp")
for loc in fallback[:10]:
    print(f"  no commit date: {loc}")
if len(fallback) > 10:
    print(f"  ... and {len(fallback) - 10} more")
