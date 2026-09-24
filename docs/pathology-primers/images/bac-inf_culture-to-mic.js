// Skeleton for bac-inf_culture-to-mic.excalidraw and .png; edit here, then regenerate both with
// node scripts/render-excalidraw.mjs (usage at the top of that file).
window.buildSkeleton = () => {
  const F = 5; // Excalifont
  const INK = "#1e1e1e";
  const GOLD = "#ffd43b"; // S. aureus colonies
  const GREY = "#ced4da"; // S. epidermidis colonies
  const PINK = "#ffc9c9"; // some other species
  const AGAR = "#f8f9fa";
  const CLOUDY = "#ffec99";
  const els = [];
  const base = { strokeColor: INK, roughness: 1, strokeWidth: 2 };

  const text = (x, y, t, size = 20, extra = {}) =>
    els.push({ type: "text", x, y, text: t, fontSize: size, fontFamily: F, strokeColor: INK, ...extra });

  // Centered label: transparent box whose label is centered horizontally.
  const label = (x, y, w, t, size = 20) =>
    els.push({
      type: "rectangle", x, y, width: w, height: 24 * t.split("\n").length + 10,
      strokeColor: "transparent", backgroundColor: "transparent",
      label: { text: t, fontSize: size, fontFamily: F, strokeColor: INK, verticalAlign: "top" },
    });

  const arrow = (x1, y1, x2, y2, t, extra = {}) => {
    if (t) label(Math.min(x1, x2) - 10, Math.min(y1, y2) - 26 * t.split("\n").length - 10, Math.abs(x2 - x1) + 20, t, 18);
    els.push({
      type: "arrow", x: x1, y: y1, width: x2 - x1, height: y2 - y1,
      points: [[0, 0], [x2 - x1, y2 - y1]], ...base, endArrowhead: "arrow",

      ...extra,
    });
  };

  const circle = (cx, cy, d, fill, extra = {}) =>
    els.push({
      type: "ellipse", x: cx - d / 2, y: cy - d / 2, width: d, height: d,
      backgroundColor: fill, fillStyle: "solid", ...base, strokeWidth: 1, ...extra,
    });

  const plate = (cx, cy, r, colonies) => {
    circle(cx, cy, 2 * r, AGAR, { strokeWidth: 2 });
    colonies.forEach(([dx, dy, d, c]) => circle(cx + dx, cy + dy, d, c));
  };

  const tube = (x, y, fill) =>
    els.push({
      type: "rectangle", x, y, width: 56, height: 140, ...base,
      backgroundColor: fill, fillStyle: "solid", roundness: { type: 3 },
    });

  const box = (x, y, w, h, extra = {}) =>
    els.push({ type: "rectangle", x, y, width: w, height: h, ...base, roundness: { type: 3 }, ...extra });

  // ---- Top: from patient sample to MIC -------------------------------------
  const cy = 120;
  tube(0, 50, "#f1f3f5");
  label(-62, 205, 180, "patient sample\n(blood, urine,\nsputum)");

  arrow(70, cy, 200, cy, "grow on\nagar");

  const mixed = [
    [-45, -40, 20, GOLD], [20, -55, 16, GREY], [50, -15, 22, PINK], [-60, 10, 16, GREY],
    [-20, 5, 22, GOLD], [30, 30, 18, GOLD], [-35, 50, 18, PINK], [5, 60, 16, GREY],
    [60, 35, 16, GOLD], [-5, -25, 16, PINK], [15, -5, 14, GREY],
  ];
  plate(300, cy, 95, mixed);
  label(170, -95, 260, "colony: grew from one\ncolony-forming unit (CFU)");
  arrow(300, -40, 258, 67, null, { strokeWidth: 1 });
  label(160, 230, 280, "culture:\nbacteria grown on agar");

  arrow(410, cy, 560, cy, "pick one\ncolony, regrow");

  const pure = [
    [-50, -35, 20, GOLD], [5, -60, 18, GOLD], [45, -30, 22, GOLD], [-60, 15, 18, GOLD],
    [-15, 0, 22, GOLD], [30, 20, 18, GOLD], [-30, 50, 20, GOLD], [15, 60, 16, GOLD],
    [60, 50, 16, GOLD], [-10, -35, 16, GOLD], [55, -5, 14, GOLD],
  ];
  plate(660, cy, 95, pure);
  label(545, 230, 230, "isolate:\npure culture from\none colony");

  arrow(770, cy, 890, cy, "suspend\n3–5 colonies,\ndilute");
  tube(905, 50, CLOUDY);
  label(838, 205, 190, "inoculum:\n5 × 10⁵ CFU/mL");

  arrow(975, cy, 1075, cy, "into\neach well");

  const conc = ["0.5", "1", "2", "4", "8", "16"];
  conc.forEach((c, i) => {
    const wx = 1118 + i * 66;
    circle(wx, cy, 56, i < 3 ? CLOUDY : "#ffffff", { strokeWidth: 2 });
    label(wx - 30, 58, 60, c, 18);
  });
  text(1090, 20, "drug in mg/L", 18);
  label(1075, 205, 200, "cloudy well:\nbacteria grew");
  label(1270, 205, 210, "MIC = 4 mg/L,\nthe lowest clear well");
  arrow(1316, 200, 1316, 154, null, { strokeWidth: 1 });

  // ---- Bottom left: the same patient over time ------------------------------
  text(0, 360, "the same patient in a trial, over time");
  const small = [
    [-25, -20, 16, GOLD], [15, -30, 14, GOLD], [25, 5, 16, GOLD], [-30, 15, 14, GOLD],
    [0, 0, 16, GOLD], [5, 30, 14, GOLD],
  ];
  plate(130, 470, 55, small);
  plate(450, 470, 55, small);
  arrow(195, 470, 385, 470, "compared", { strokeStyle: "dashed", strokeWidth: 1 });
  arrow(0, 560, 640, 560, null, { strokeWidth: 1 });
  text(650, 546, "time", 18);
  label(0, 580, 260, "day 1: index isolate,\nfrom the culture that\nqualified the patient");
  label(320, 580, 260, "day 7: repeat isolate,\nfrom a later sample");

  // ---- Bottom right: where an isolate belongs -------------------------------
  box(740, 350, 740, 390);
  text(760, 362, "family Staphylococcaceae");
  box(765, 405, 690, 315);
  text(785, 417, "genus Staphylococcus");
  box(790, 460, 440, 240);
  text(810, 472, "species S. aureus");
  box(1250, 460, 185, 240);
  text(1265, 472, "species\nS. epidermidis");

  box(810, 520, 195, 160, { strokeStyle: "dashed", strokeWidth: 1 });
  text(825, 530, "strain");
  [[850, 590], [900, 600], [950, 585]].forEach(([x, y]) => circle(x, y, 26, GOLD));
  label(815, 630, 185, "isolates");

  box(1020, 520, 195, 160, { strokeStyle: "dashed", strokeWidth: 1 });
  text(1035, 530, "strain");
  [[1075, 595], [1135, 590]].forEach(([x, y]) => circle(x, y, 26, GOLD));

  box(1265, 545, 155, 135, { strokeStyle: "dashed", strokeWidth: 1 });
  text(1280, 555, "strain");
  [[1310, 620], [1360, 615]].forEach(([x, y]) => circle(x, y, 26, GREY));

  return els;
};
