/**
 * HubSense — Color Scoring Engine
 * Uses CIELAB Delta-E 2000 (most perceptually accurate color distance)
 * Score: 0-10 per round. 0 = max error, 10 = perfect.
 */

// ─── sRGB → Linear ───────────────────────────────────────────────────────────
function srgbToLinear(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

// ─── Linear RGB → XYZ (D65 illuminant) ──────────────────────────────────────
function rgbToXYZ(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  // D65 reference matrix
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  const z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;
  return [x, y, z];
}

// ─── XYZ → CIELAB ────────────────────────────────────────────────────────────
const D65 = { x: 0.95047, y: 1.0, z: 1.08883 };

function fLab(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const fx = fLab(x / D65.x);
  const fy = fLab(y / D65.y);
  const fz = fLab(z / D65.z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// ─── RGB → LAB ───────────────────────────────────────────────────────────────
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const [x, y, z] = rgbToXYZ(r, g, b);
  return xyzToLab(x, y, z);
}

// ─── CIEDE2000 Delta-E ───────────────────────────────────────────────────────
export function deltaE2000(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  const kL = 1, kC = 1, kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cavg = (C1 + C2) / 2;
  const C7 = Math.pow(Cavg, 7);
  const G = 0.5 * (1 - Math.sqrt(C7 / (C7 + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = Math.atan2(b1, a1p) * (180 / Math.PI) + (b1 < 0 || (b1 === 0 && a1p < 0) ? 360 : 0);
  const h2p = Math.atan2(b2, a2p) * (180 / Math.PI) + (b2 < 0 || (b2 === 0 && a2p < 0) ? 360 : 0);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * (Math.PI / 180));

  const Lp = (L1 + L2) / 2;
  const Cp = (C1p + C2p) / 2;

  let Hp: number;
  if (C1p * C2p === 0) {
    Hp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    Hp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    Hp = (h1p + h2p + 360) / 2;
  } else {
    Hp = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(((Hp - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * Hp * Math.PI) / 180) +
    0.32 * Math.cos(((3 * Hp + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * Hp - 63) * Math.PI) / 180);

  const SL = 1 + 0.015 * Math.pow(Lp - 50, 2) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
  const SC = 1 + 0.045 * Cp;
  const SH = 1 + 0.015 * Cp * T;

  const Cp7 = Math.pow(Cp, 7);
  const RC = 2 * Math.sqrt(Cp7 / (Cp7 + Math.pow(25, 7)));
  const dTheta = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2));
  const RT = -Math.sin((2 * dTheta * Math.PI) / 180) * RC;

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
      Math.pow(dCp / (kC * SC), 2) +
      Math.pow(dHp / (kH * SH), 2) +
      RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}

// ─── HSB → RGB ───────────────────────────────────────────────────────────────
export function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  // h: 0-360, s: 0-100, b: 0-100
  s /= 100;
  b /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

// ─── HSB → hex ───────────────────────────────────────────────────────────────
export function hsbToHex(h: number, s: number, b: number): string {
  const [r, g, b_] = hsbToRgb(h, s, b);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b_.toString(16).padStart(2, "0")}`;
}

// ─── Score Calculation ────────────────────────────────────────────────────────
export interface ColorScoreResult {
  score: number; // 0-10
  deltaE: number;
  percentAccuracy: number;
  targetHSB: { h: number; s: number; b: number };
  guessHSB: { h: number; s: number; b: number };
  targetHex: string;
  guessHex: string;
}

const MAX_DELTA_E = 100; // above this = 0 score

export function scoreColor(
  targetH: number,
  targetS: number,
  targetB: number,
  guessH: number,
  guessS: number,
  guessB: number
): ColorScoreResult {
  const targetRGB = hsbToRgb(targetH, targetS, targetB);
  const guessRGB = hsbToRgb(guessH, guessS, guessB);

  const targetLab = rgbToLab(...targetRGB);
  const guessLab = rgbToLab(...guessRGB);

  const dE = deltaE2000(targetLab, guessLab);
  // Non-linear score curve — penalizes large errors more
  const raw = Math.max(0, 1 - dE / MAX_DELTA_E);
  const score = parseFloat((Math.pow(raw, 0.7) * 10).toFixed(2));
  const percentAccuracy = parseFloat(((score / 10) * 100).toFixed(1));

  return {
    score,
    deltaE: parseFloat(dE.toFixed(2)),
    percentAccuracy,
    targetHSB: { h: targetH, s: targetS, b: targetB },
    guessHSB: { h: guessH, s: guessS, b: guessB },
    targetHex: hsbToHex(targetH, targetS, targetB),
    guessHex: hsbToHex(guessH, guessS, guessB),
  };
}

// ─── Color Blindness Simulation ───────────────────────────────────────────────
export type ColorBlindType = "none" | "protanopia" | "deuteranopia" | "tritanopia";

export function simulateColorBlindness(
  r: number, g: number, b: number,
  type: ColorBlindType
): [number, number, number] {
  if (type === "none") return [r, g, b];

  // LMS simulation matrices
  const matrices: Record<Exclude<ColorBlindType, "none">, number[][]> = {
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
  };

  const m = matrices[type];
  const rn = Math.round(m[0][0] * r + m[0][1] * g + m[0][2] * b);
  const gn = Math.round(m[1][0] * r + m[1][1] * g + m[1][2] * b);
  const bn = Math.round(m[2][0] * r + m[2][1] * g + m[2][2] * b);

  return [
    Math.min(255, Math.max(0, rn)),
    Math.min(255, Math.max(0, gn)),
    Math.min(255, Math.max(0, bn)),
  ];
}
