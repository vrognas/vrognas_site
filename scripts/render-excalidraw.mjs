// Render an Excalidraw skeleton to <out>.excalidraw and <out>.png (white background, 2x scale).
// The skeleton is a script defining window.buildSkeleton(), which returns element skeletons:
//
//   node scripts/render-excalidraw.mjs docs/pathology-primers/images/bac-inf_culture-to-mic.js docs/pathology-primers/images/bac-inf_culture-to-mic
//
// Needs playwright-core (npm install --no-save playwright-core) and a Playwright headless Chromium
// (npx playwright-core install chromium-headless-shell). The newest one installed is used; set
// CHROMIUM_PATH to use another. Excalidraw is fetched from esm.sh at run time, so this needs network.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const [, , figJs, outBase] = process.argv;
const pw = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
const shell = fs.existsSync(pw) && fs.readdirSync(pw).filter((d) => d.startsWith("chromium_headless_shell-")).sort().pop();
const executablePath =
  process.env.CHROMIUM_PATH ?? (shell ? path.join(pw, shell, "chrome-headless-shell-win64", "chrome-headless-shell.exe") : undefined);
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();
page.on("console", (m) => console.log("[page]", m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.setContent("<html><body></body></html>");
await page.addScriptTag({
  content: 'window.EXCALIDRAW_ASSET_PATH="https://unpkg.com/@excalidraw/excalidraw@0.18.0/dist/prod/";',
});
await page.addScriptTag({
  type: "module",
  content: `import * as X from "https://esm.sh/@excalidraw/excalidraw@0.18.0?deps=react@18.3.1,react-dom@18.3.1";
            window.X = X; window.ready = true;`,
});
await page.waitForFunction(() => window.ready, null, { timeout: 180000 });
await page.addScriptTag({ content: fs.readFileSync(figJs, "utf8") });

const res = await page.evaluate(async () => {
  const X = window.X;
  const skel = window.buildSkeleton();
  const bg = { exportBackground: true, viewBackgroundColor: "#ffffff" };

  // Load the font subsets before measuring text, by exporting a throwaway text element.
  const chars = skel.map((e) => (e.text || "") + (e.label?.text || "")).join(" ");
  const warm = X.convertToExcalidrawElements([{ type: "text", x: 0, y: 0, text: chars, fontSize: 20, fontFamily: 5 }]);
  await X.exportToBlob({ elements: warm, appState: bg, files: null, mimeType: "image/png" });
  await document.fonts.ready;

  const elements = X.convertToExcalidrawElements(skel, { regenerateIds: false });
  const blob = await X.exportToBlob({
    elements,
    appState: { ...bg, exportScale: 2 },
    files: null,
    mimeType: "image/png",
    exportPadding: 20,
  });
  const png = await new Promise((r) => {
    const fr = new FileReader();
    fr.onload = () => r(fr.result.split(",")[1]);
    fr.readAsDataURL(blob);
  });
  const json = X.serializeAsJSON(elements, bg, {}, "local");
  const fonts = [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family);
  return { png, json, fonts: [...new Set(fonts)] };
});

fs.writeFileSync(outBase + ".png", Buffer.from(res.png, "base64"));
fs.writeFileSync(outBase + ".excalidraw", res.json);
console.log("loaded fonts:", res.fonts.join(", "));
await browser.close();
