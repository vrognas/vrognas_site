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

### Styling and Themes

- Dual theme support (light/dark) with custom SCSS files
- Images should be optimized and use appropriate formats (`.avif` preferred for photos)
- Code blocks are set to fold by default with copy functionality enabled
