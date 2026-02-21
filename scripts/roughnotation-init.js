/**
 * RoughNotation initializer for vrognas.com
 *
 * Usage in Quarto markdown:
 *   [text]{.rn-underline}
 *   [text]{.rn-highlight}
 *   [text]{.rn-box}
 *   [text]{.rn-circle}
 *   [text]{.rn-strike}
 *   [text]{.rn-crossed}
 *   [text]{.rn-bracket}
 *
 * Override any option via data attributes:
 *   [text]{.rn-underline data-rn-color="blue" data-rn-stroke-width="2"}
 *
 * Available data attributes:
 *   data-rn-color           CSS color string (overrides theme default)
 *   data-rn-stroke-width    number (px)
 *   data-rn-padding         number or "top,right,bottom,left"
 *   data-rn-iterations      number (higher = rougher)
 *   data-rn-animate         "true" | "false"  (default: false)
 *   data-rn-brackets        "left" | "right" | "top" | "bottom" or comma-separated
 *   data-rn-multiline       "true" | "false"  (default: true)
 *
 * Theme colors are defined as CSS custom properties in theme-light.scss / theme-dark.scss:
 *   --rn-underline-color
 *   --rn-highlight-color
 */

import { annotate } from "https://unpkg.com/rough-notation?module";

const ANNOTATIONS = {
  "rn-underline": {
    type: "underline",
    light: "#dc3545",
    dark: "#f07c7b",
    padding: 1,
  },
  "rn-highlight": {
    type: "highlight",
    light: "#fff176",
    dark: "rgba(255,241,118,0.35)",
  },
  "rn-box": { type: "box", light: "currentColor", dark: "currentColor" },
  "rn-circle": { type: "circle", light: "currentColor", dark: "currentColor" },
  "rn-strike": {
    type: "strike-through",
    light: "currentColor",
    dark: "currentColor",
  },
  "rn-crossed": {
    type: "crossed-off",
    light: "currentColor",
    dark: "currentColor",
  },
  "rn-bracket": {
    type: "bracket",
    light: "currentColor",
    dark: "currentColor",
  },
  "red-underline": {
    type: "underline",
    light: "#dc3545",
    dark: "#f07c7b",
    padding: 1,
  },
};

const isDark = () => document.body.classList.contains("quarto-dark");

const parsePadding = (value, fallback = 5) => {
  if (!value) return fallback;
  const parts = value.split(",").map(Number);
  return parts.length === 1 ? parts[0] : parts;
};

function buildOptions(el, defaults) {
  const { dataset: d } = el;
  const options = {
    type: defaults.type,
    color: d.rnColor ?? (isDark() ? defaults.dark : defaults.light),
    strokeWidth: Number(d.rnStrokeWidth) || 1,
    padding: parsePadding(d.rnPadding, defaults.padding ?? 5),
    iterations: Number(d.rnIterations) || 2,
    animate: d.rnAnimate === "true",
    multiline: d.rnMultiline !== "false",
  };
  if (defaults.type === "bracket") {
    options.brackets = d.rnBrackets?.split(",") ?? ["right"];
  }
  return options;
}

function collectAnnotatedElements() {
  return Object.entries(ANNOTATIONS).flatMap(([cls, defaults]) =>
    [...document.querySelectorAll(`.${cls}`)].map((el) => ({ el, defaults })),
  );
}

let instances = [];

function annotateAll() {
  instances.forEach((a) => a.remove());

  instances = collectAnnotatedElements().map(({ el, defaults }) => {
    const annotation = annotate(el, buildOptions(el, defaults));
    annotation.show();
    return annotation;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  annotateAll();
  new MutationObserver(annotateAll).observe(document.body, {
    attributeFilter: ["class"],
  });
});
