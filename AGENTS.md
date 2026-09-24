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

### Purpose

Every page is a glanceable entry into, or refresher of, its field. It should give the reader
enough intuition to judge whether a result is relevant and plausible, to critique work done in
the field, and to see where a study is thin or particularly strong. In practice: say where a
number comes from and how well it is known, what that uncertainty does downstream, and what a
careful study would do about a method's weak points. Prefer figures, worked numbers and orders
of magnitude to bare definitions. The sourcing rules below still apply to every such claim.

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

### Non-breaking spaces

**Units take a literal non-breaking space (U+00A0), not an ordinary one:**
`130 mL/min/1.73 m^2^`, `50 years`, `4.5 MU`. The source files are full of them
and they are deliberate — a number must never be orphaned from its unit across a
line break.

Two consequences when editing:

- **Matching text will fail if you assume ordinary spaces.** Search with a
  whitespace class (`[\s  ]`) or normalise before comparing. U+202F
  (narrow no-break space) also appears.
- **Preserve them when rewriting a sentence**, and add them to any new
  number-unit pair you introduce.

Percentages and bare nouns attach normally: `17.9%`, `20 patients`, `day 28`.

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

### Plain English and medical terms

Prefer plain English. When a medical term is useful, introduce it the way an abbreviation is
introduced: the plain words in the running text, the term in parentheses on first use, and the
term alone after that. So "itching (pruritus)", then "pruritus"; "gallstones (cholelithiasis)",
then "cholelithiasis". Where a medical term adds nothing for the reader, use the plain words only.

### Sources and claims

Having the right source for the right claim matters more than anything else on this site.

- **Context, not topic.** A source supports a claim only if it makes that claim in the same
  context: the same drug or class, population, setting and endpoint. A finding about one drug is
  not a finding about its class; a result in dogs, volunteers or one trial is not a general rule.
- **Evidence strength.** A single primary study is weak evidence. General statements (mechanisms,
  "usually", class-wide behavior, recommended practice) need a review, a tutorial (e.g. the CPT:
  Pharmacometrics & Systems Pharmacology tutorials), a guideline, or a highly cited paper. A single
  study may be cited for its own result only when the sentence says so ("In an analysis of 1,042
  patients, ...").
- **Reuse strong sources.** One good review cited for several claims beats a different primary
  paper per sentence.
- **Keep the number of citations low.** A page should rest on a few strong sources, not a
  citation per sentence. When one source carries a whole paragraph, cite it once, at the end of
  the paragraph. Cite one source per claim, not a stack. Where a detail would need a source of its
  own, prefer cutting the detail to adding the source.
- **One entry per DOI** in `refs.bib`. Search by DOI before adding a key, and reuse the existing key.
- Prefer the nine clinical pharmacology and pharmacometrics journals the site draws on
  (Br J Clin Pharmacol, Clin Pharmacol Drug Dev, Clin Pharmacokinet, Clin Pharmacol Ther,
  CPT Pharmacometrics Syst Pharmacol, J Clin Pharmacol, J Pharmacokinet Pharmacodyn,
  Transl Clin Pharmacol, AAPS J), and verify every DOI against Crossref.

### ATC page template

Level-2 and deeper ATC pages follow the structure of `atc/j/j01/`:

1. **How do they work?** Mechanism of action, class by class.
2. **The challenge**, as a heading named after it (J01: *Resistance*), only where one is obvious.
3. **Efficacy**: how it is measured. The endpoint (clinical score, biomarker, clinical event),
   its data type (continuous, ordinal or categorical, binary, count, time-to-event), and what
   that implies for the model.
4. **Safety**: the common adverse effects, and the class's recurring safety constraint, such as
   an exposure ceiling (keep the AUC low), nephrotoxicity or QT prolongation.

A section appears only when there is sourced content for it; small pages are not padded.

**Drug page or disease page?** Safety belongs to the drug class, so it goes on the ATC page. For
efficacy, ask whether the measurement would stay the same if a different drug class treated the
disease. If yes, it is the disease's endpoint (HbA1c, PASI, seizure counts, RECIST) and belongs in
the pathology primer; the ATC page names it and links there. If it follows from how the drug works
(INR for warfarin, anti-factor Xa activity, intragastric pH, PK/PD indices, receptor occupancy), it
belongs on the ATC page. Likewise, how clinical studies are designed for a disease (endpoints,
duration, population) goes in the primer, and studies driven by the drug class (thorough QT, DDI
studies for strong CYP inhibitors) go on the ATC page.
Letter pages hold the level-2 table and only notes that span several subgroups, with no
mechanism section. The drug class belongs on the ATC page; the disease (pathophysiology,
diagnosis, clinical course, treatment strategy) belongs in the matching pathology primer, and
the two link to each other rather than repeat.

### Styling and Themes

- Dual theme support (light/dark) with custom SCSS files
- Images should be optimized and use appropriate formats (`.avif` preferred for photos)
- Code blocks are set to fold by default with copy functionality enabled

### Figures

Figure sources live beside their output in `docs/concepts/images/`, and are not published
(Quarto only copies files a page references). Diagrams are `.excalidraw`; generated plots
are `.R` scripts run by hand, never Quarto code cells, which keeps their page out of the
freeze cache and away from the "Netlify has no R" failure. Regenerate with, for example:

```bash
Rscript docs/concepts/images/gfr-indexing.R   # from the repo root
```

A diagram can also be built from a script: `docs/pathology-primers/images/bac-inf_culture-to-mic.js`
writes its `.excalidraw` and `.png` through `node scripts/render-excalidraw.mjs` (usage at the top of
that file). Edit the script, not the `.excalidraw`, or the next run overwrites the edit.

Generated plots stay in the device default sans, not the hand-drawn face the
`.excalidraw` diagrams use. A quantitative surface should not look sketched.
