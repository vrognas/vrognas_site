# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Viktor Rognås's personal website built with Quarto and deployed on Netlify. The site serves as a professional hub containing:

- CV/Resume and professional background
- Portfolio of scientific and software development projects
- Documentation and educational content related to pharmacometrics, clinical pharmacology, and drug development
- Tools and resources for pharmaceutical modeling and analysis

## Build and Development Commands

### Build the site

```bash
quarto render
```

### Preview during development

```bash
quarto preview
```

### Install dependencies

```bash
npm install
```

## Project Architecture

### Content Structure

- **Source files**: Content is written in `.qmd` (Quarto Markdown) files in the `docs/` directory
- **Output**: Generated HTML files are placed in `_site/` directory
- **Configuration**: `_quarto.yml` contains the main site configuration including navigation, themes, and formatting options

### Key Directories

- `docs/`: Main content organized by topic areas:
  - `aux/`: Auxiliary skills (data visualization, communication, coding practices)
  - `concepts/`: Pharmacokinetics, pharmacodynamics, clinical studies concepts
  - `modeling/`: Mathematical modeling techniques and goodness-of-fit approaches
  - `pathology-primers/`: Disease state overviews
  - `pharmacopeia/`: Drug classification and mechanism information
  - `tools-of-the-trade/`: Technical tools and software guides
- `images/`: Site-wide images and assets
- `_site/`: Generated static site (do not edit directly)
- `_freeze/`: Quarto's computational cache

### Specialized Content Features

- **Bibliography**: Uses `refs.bib` for citations with `clinical-microbiology-and-infection.csl` style
- **Mathematical content**: Includes pharmacokinetic operators loaded via `pk-operators.html`
- **Code execution**: Quarto documents can include executable R, Python, and other code blocks
- **Cross-references**: Extensive internal linking between concepts and topics

### Deployment

- **Platform**: Netlify with automatic deployments from GitHub
- **Plugin**: Uses `@quarto/netlify-plugin-quarto` for Quarto-specific build process
- **Performance**: Includes Lighthouse CI for performance monitoring
- **Redirects**: Historical URL redirects defined in `netlify.toml`

## Content Guidelines

### File Naming

- Use descriptive, lowercase names with hyphens (e.g., `hepatic-impairment-studies.qmd`)
- Organize content files within appropriate subdirectories under `docs/`

### Navigation

- Main navigation is defined in `_quarto.yml` sidebar configurations
- Each major section has its own sidebar with hierarchical organization
- Update navigation when adding new content files
- **Navigation is hand-maintained on purpose.** Do not introduce Quarto `listing:` blocks
  or `contents: auto` sidebars; the manual trees exist to control ordering (the ATC letter
  sequence, absorption → distribution → elimination) and the curated card blurbs.
  Adding a page therefore takes three synced edits: the file, the `_quarto.yml` sidebar
  entry, and the parent hub's `.index-card`. `scripts/check-site.py` (run in CI after
  `quarto render`) fails the build if they drift apart.
- **There is deliberately no `/docs/` landing page.** The "Encyclopædia" navbar entry is a
  `menu:` with no `href:`, so clicking it expands the dropdown rather than navigating.
  Do not add `docs/index.qmd`, and do not add a `_redirects` rule pointing at `/docs/`.

### Cross-linking

The sidebar handles hierarchy; prose handles relevance. Link *sideways*, never *upwards*.

- **Do not add parent/"Part of" links.** The sidebar and the breadcrumb already show a
  page's place in the tree, so restating it in prose is redundant.
- **`## See also`.** A plain bulleted list placed immediately *above* the existing
  `## References` block, one line per target, each saying why the reader would go there.
  Prefer weaving the link into the prose where it has a natural home — that is the house
  style in `docs/pharmacopeia/` and `docs/concepts/clinpharm-studies/`.

Use relative paths (`../cdisc/index.qmd`). Note that `@sec-` cross-references resolve
**within a document only** in a `type: website` project — to link a section on another
page, write a markdown anchor (`../../pk/1_absorption/index.qmd#sec-bcs`).

### Drug names

Where a named drug has an ATC code, give it inline in parentheses on first mention:
`Pembrolizumab (Keytruda, L01FF02)`, `Metformin, A10BA02`. This is what joins the
pathology primers to the Pharmacopœia. **Always verify the code against the WHO ATC/DDD
index** (<https://atcddd.fhi.no/atc_ddd_index/>, level-4 group pages list the substances)
— it is the register of record, and never write a code from memory. The Swedish
[FASS registry](https://fass.se/health/atc) mirrors the same hierarchy and is easier to
browse, but it is a mirror, not the authority. Where a substance has two codes, use the
one matching the indication under discussion (methotrexate is L01BA01 as an antineoplastic
but L04AX03 as an immunosuppressant, which is the relevant one for RA and psoriasis).

**ATC page URLs.** Pages under `docs/pharmacopeia/atc/` use pure lowercase ATC codes, one
path segment per level, so any code maps to exactly one predictable URL:
`atc/a/a10/a10b/a10ba/a10ba02/`. The descriptive name lives in the page `title:`, the
sidebar label and the breadcrumb — never in the path. When adding a page at depth, add
every intermediate level too, or truncating the URL will 404.

### Styling and Themes

- Dual theme support (light/dark) with custom SCSS files
- Images should be optimized and use appropriate formats (`.avif` preferred for photos)
- Code blocks are set to fold by default with copy functionality enabled
