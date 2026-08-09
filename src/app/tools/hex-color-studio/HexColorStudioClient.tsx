"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Pipette,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Eye,
  ShieldCheck,
  Layers,
  FileCode2,
  Download,
  Shuffle,
  Contrast,
  CheckCircle2,
  XCircle,
  Hash,
  Activity,
  Maximize2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { HorizontalScrollContainer } from "@/components/shared/HorizontalScrollContainer";
import { StudioDropdown } from "@/components/shared/StudioDropdown";

// Named Colors Catalog for proximity matching
const COLOR_NAMES: { name: string; hex: string }[] = [
  { name: "Obsidian Black", hex: "#09090b" },
  { name: "Charcoal Slate", hex: "#18181b" },
  { name: "Royal Indigo", hex: "#6366f1" },
  { name: "Electric Violet", hex: "#8b5cf6" },
  { name: "Cyberpunk Purple", hex: "#a855f7" },
  { name: "Orchid Magenta", hex: "#d946ef" },
  { name: "Neon Pink", hex: "#ec4899" },
  { name: "Rose Crimson", hex: "#f43f5e" },
  { name: "Burgundy Bordo", hex: "#990000" },
  { name: "Wine Red", hex: "#881337" },
  { name: "Ruby Red", hex: "#e11d48" },
  { name: "Coral Sunset", hex: "#f97316" },
  { name: "Amber Gold", hex: "#f59e0b" },
  { name: "Solar Yellow", hex: "#eab308" },
  { name: "Lime Zing", hex: "#84cc16" },
  { name: "Emerald Mint", hex: "#10b981" },
  { name: "Teal Lagoon", hex: "#14b8a6" },
  { name: "Cyan Ice", hex: "#06b6d4" },
  { name: "Sky Azure", hex: "#0ea5e9" },
  { name: "Cobalt Blue", hex: "#3b82f6" },
  { name: "Sapphire Deep", hex: "#1d4ed8" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Zinc Silver", hex: "#71717a" },
];

interface RgbColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HslColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

interface HsvColor {
  h: number;
  s: number;
  v: number;
}

interface CmykColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

// Convert HEX string to RGBA object
function hexToRgba(hexStr: string): RgbColor {
  let clean = hexStr.replace(/^#/, "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("") + "ff";
  } else if (clean.length === 4) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (clean.length === 6) {
    clean += "ff";
  }

  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 99, g: 102, b: 241, a: 1 };

  return {
    r: (num >> 24) & 255,
    g: (num >> 16) & 255,
    b: (num >> 8) & 255,
    a: Math.round(((num & 255) / 255) * 100) / 100,
  };
}

// Convert RGBA to 6-char HEX
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number, a = 1): HslColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a,
  };
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hNorm = (h % 360 + 360) % 360 / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tAdj = t;
    if (tAdj < 0) tAdj += 1;
    if (tAdj > 1) tAdj -= 1;
    if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
    if (tAdj < 1 / 2) return q;
    if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);

  return { r, g, b };
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      case bN:
        h = (rN - gN) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// Convert RGB to CMYK
function rgbToCmyk(r: number, g: number, b: number): CmykColor {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const k = 1 - Math.max(rN, gN, bN);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rN - k) / (1 - k);
  const m = (1 - gN - k) / (1 - k);
  const y = (1 - bN - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// Convert RGB to OKLCH approximation
function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  // sRGB to linear RGB
  const toLinear = (c: number) => {
    const v = c / 255;
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  };
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return {
    l: Math.round(L * 100) / 100,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(H * 10) / 10,
  };
}

// Relative Luminance for WCAG
function getRelativeLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Contrast Ratio
function getContrastRatio(rgb1: RgbColor, rgb2: RgbColor): number {
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return Math.round(((brightest + 0.05) / (darkest + 0.05)) * 100) / 100;
}

// Color Blindness Simulation
function simulateColorBlindness(r: number, g: number, b: number, type: "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia"): string {
  let simR = r;
  let simG = g;
  let simB = b;

  if (type === "protanopia") {
    simR = 0.56667 * r + 0.43333 * g + 0.0 * b;
    simG = 0.55833 * r + 0.44167 * g + 0.0 * b;
    simB = 0.0 * r + 0.24167 * g + 0.75833 * b;
  } else if (type === "deuteranopia") {
    simR = 0.625 * r + 0.375 * g + 0.0 * b;
    simG = 0.7 * r + 0.3 * g + 0.0 * b;
    simB = 0.0 * r + 0.3 * g + 0.7 * b;
  } else if (type === "tritanopia") {
    simR = 0.95 * r + 0.05 * g + 0.0 * b;
    simG = 0.0 * r + 0.43333 * g + 0.56667 * b;
    simB = 0.0 * r + 0.475 * g + 0.525 * b;
  } else if (type === "achromatopsia") {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    simR = gray;
    simG = gray;
    simB = gray;
  }

  return rgbToHex(Math.min(255, simR), Math.min(255, simG), Math.min(255, simB));
}

// Find nearest named color
function getNearestNamedColor(hex: string): { name: string; hex: string; distance: number } {
  const currentRgb = hexToRgba(hex);
  let best = COLOR_NAMES[0];
  let minDistance = Infinity;

  for (const item of COLOR_NAMES) {
    const c = hexToRgba(item.hex);
    const d = Math.sqrt(
      Math.pow(currentRgb.r - c.r, 2) +
      Math.pow(currentRgb.g - c.g, 2) +
      Math.pow(currentRgb.b - c.b, 2)
    );
    if (d < minDistance) {
      minDistance = d;
      best = item;
    }
  }

  return { ...best, distance: Math.round(minDistance) };
}

export function HexColorStudioClient() {
  const { lang } = useLanguage();
  const isTurkish = lang === "tr";

  const [hexInput, setHexInput] = useState("#8b5cf6");
  const [blendColor, setBlendColor] = useState("#990000");
  const [blendRatio, setBlendRatio] = useState(50);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [colorHistory, setColorHistory] = useState<string[]>([
    "#8b5cf6",
    "#6366f1",
    "#990000",
    "#10b981",
    "#f59e0b",
    "#06b6d4",
  ]);

  const rgb = useMemo(() => hexToRgba(hexInput), [hexInput]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);
  const oklch = useMemo(() => rgbToOklch(rgb.r, rgb.g, rgb.b), [rgb]);
  const namedColor = useMemo(() => getNearestNamedColor(hexInput), [hexInput]);

  // Color Harmonies
  const harmonies = useMemo(() => {
    const makeHex = (h: number, s: number, l: number) => {
      const c = hslToRgb(h, s, l);
      return rgbToHex(c.r, c.g, c.b);
    };

    return {
      complementary: makeHex(hsl.h + 180, hsl.s, hsl.l),
      split1: makeHex(hsl.h + 150, hsl.s, hsl.l),
      split2: makeHex(hsl.h + 210, hsl.s, hsl.l),
      analogous1: makeHex(hsl.h - 30, hsl.s, hsl.l),
      analogous2: makeHex(hsl.h + 30, hsl.s, hsl.l),
      triadic1: makeHex(hsl.h + 120, hsl.s, hsl.l),
      triadic2: makeHex(hsl.h + 240, hsl.s, hsl.l),
      tetradic1: makeHex(hsl.h + 90, hsl.s, hsl.l),
      tetradic2: makeHex(hsl.h + 180, hsl.s, hsl.l),
      tetradic3: makeHex(hsl.h + 270, hsl.s, hsl.l),
    };
  }, [hsl]);

  // Tailwind 50-950 Palette Matrix
  const tailwindScale = useMemo(() => {
    const stops = [
      { step: "50", l: 96 },
      { step: "100", l: 90 },
      { step: "200", l: 80 },
      { step: "300", l: 70 },
      { step: "400", l: 60 },
      { step: "500", l: 50 },
      { step: "600", l: 40 },
      { step: "700", l: 30 },
      { step: "800", l: 20 },
      { step: "900", l: 12 },
      { step: "950", l: 6 },
    ];

    return stops.map((st) => {
      const c = hslToRgb(hsl.h, hsl.s, st.l);
      return {
        step: st.step,
        hex: rgbToHex(c.r, c.g, c.b),
        l: st.l,
      };
    });
  }, [hsl]);

  // WCAG Contrast Ratios
  const contrastVsWhite = useMemo(() => getContrastRatio(rgb, { r: 255, g: 255, b: 255, a: 1 }), [rgb]);
  const contrastVsBlack = useMemo(() => getContrastRatio(rgb, { r: 0, g: 0, b: 0, a: 1 }), [rgb]);
  const contrastVsObsidian = useMemo(() => getContrastRatio(rgb, { r: 9, g: 9, b: 11, a: 1 }), [rgb]);

  // Blended Color Calculation
  const blendedHex = useMemo(() => {
    const bRgb = hexToRgba(blendColor);
    const factor = blendRatio / 100;
    const r = Math.round(rgb.r * (1 - factor) + bRgb.r * factor);
    const g = Math.round(rgb.g * (1 - factor) + bRgb.g * factor);
    const b = Math.round(rgb.b * (1 - factor) + bRgb.b * factor);
    return rgbToHex(r, g, b);
  }, [rgb, blendColor, blendRatio]);

  // Multi-Color Palette Mixer State (2 to 6 colors)
  const [mixPalette, setMixPalette] = useState<Array<{ id: string; hex: string; weight: number }>>([
    { id: "1", hex: "#6366f1", weight: 50 },
    { id: "2", hex: "#ec4899", weight: 50 },
  ]);
  const [mixAlgorithm, setMixAlgorithm] = useState<"oklch" | "rgb" | "subtractive">("oklch");
  const [mixSteps, setMixSteps] = useState<number>(5);

  // Multi-Color Blended Result Calculation
  const multiBlendedHex = useMemo(() => {
    if (mixPalette.length === 0) return "#000000";
    const totalWeight = mixPalette.reduce((acc, c) => acc + c.weight, 0) || 1;

    let rAcc = 0;
    let gAcc = 0;
    let bAcc = 0;

    mixPalette.forEach((item) => {
      const cRgb = hexToRgba(item.hex);
      const w = item.weight / totalWeight;

      if (mixAlgorithm === "rgb") {
        rAcc += cRgb.r * w;
        gAcc += cRgb.g * w;
        bAcc += cRgb.b * w;
      } else if (mixAlgorithm === "subtractive") {
        // Subtractive CMY approximation
        const c = (255 - cRgb.r) * w;
        const m = (255 - cRgb.g) * w;
        const y = (255 - cRgb.b) * w;
        rAcc += c;
        gAcc += m;
        bAcc += y;
      } else {
        // OKLCH / Linear gamma blending
        rAcc += Math.pow(cRgb.r / 255, 2.2) * w;
        gAcc += Math.pow(cRgb.g / 255, 2.2) * w;
        bAcc += Math.pow(cRgb.b / 255, 2.2) * w;
      }
    });

    if (mixAlgorithm === "subtractive") {
      return rgbToHex(Math.max(0, 255 - rAcc), Math.max(0, 255 - gAcc), Math.max(0, 255 - bAcc));
    } else if (mixAlgorithm === "oklch") {
      return rgbToHex(
        Math.round(Math.pow(rAcc, 1 / 2.2) * 255),
        Math.round(Math.pow(gAcc, 1 / 2.2) * 255),
        Math.round(Math.pow(bAcc, 1 / 2.2) * 255)
      );
    }
    return rgbToHex(Math.round(rAcc), Math.round(gAcc), Math.round(bAcc));
  }, [mixPalette, mixAlgorithm]);

  // Intermediate Gradient Steps between first & last color in palette
  const blendedGradientSteps = useMemo(() => {
    if (mixPalette.length < 2) return [];
    const c1 = hexToRgba(mixPalette[0].hex);
    const c2 = hexToRgba(mixPalette[mixPalette.length - 1].hex);
    const steps: string[] = [];

    for (let i = 0; i < mixSteps; i++) {
      const factor = i / (mixSteps - 1);
      const r = Math.round(c1.r * (1 - factor) + c2.r * factor);
      const g = Math.round(c1.g * (1 - factor) + c2.g * factor);
      const b = Math.round(c1.b * (1 - factor) + c2.b * factor);
      steps.push(rgbToHex(r, g, b));
    }
    return steps;
  }, [mixPalette, mixSteps]);

  const handleAddMixColor = () => {
    if (mixPalette.length >= 6) {
      toast.warning(isTurkish ? "Maksimum 6 renk karıştırılabilir." : "Maximum 6 colors can be mixed.");
      return;
    }
    const colors = ["#10b981", "#f59e0b", "#06b6d4", "#a855f7", "#ef4444", "#3b82f6"];
    const nextHex = colors[mixPalette.length % colors.length];
    setMixPalette((prev) => [...prev, { id: String(Date.now()), hex: nextHex, weight: 50 }]);
    toast.success(isTurkish ? "Karışıma yeni renk eklendi!" : "Added new color to blend!");
  };

  const handleRemoveMixColor = (id: string) => {
    if (mixPalette.length <= 2) {
      toast.warning(isTurkish ? "En az 2 renk gereklidir." : "At least 2 colors required.");
      return;
    }
    setMixPalette((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateMixColor = (id: string, newHex: string) => {
    setMixPalette((prev) => prev.map((c) => (c.id === id ? { ...c, hex: newHex } : c)));
  };

  const handleUpdateMixWeight = (id: string, weight: number) => {
    setMixPalette((prev) => prev.map((c) => (c.id === id ? { ...c, weight } : c)));
  };

  const handleColorChange = (newHex: string) => {
    setHexInput(newHex);
    if (!colorHistory.includes(newHex)) {
      setColorHistory((prev) => [newHex, ...prev.slice(0, 11)]);
    }
  };

  const handleCopy = (text: string, formatName: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedFormat(formatName);
    toast.success(`${text} ${isTurkish ? "panoya kopyalandı!" : "copied to clipboard!"}`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleRandomize = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    handleColorChange(randomHex);
    toast.info(isTurkish ? "Rastgele renk üretildi!" : "Random color generated!");
  };

  const exportTailwindConfig = () => {
    const configObj = tailwindScale.reduce((acc, curr) => {
      acc[curr.step] = curr.hex;
      return acc;
    }, {} as Record<string, string>);
    const str = `// Tailwind CSS Color Architecture\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: ${JSON.stringify(configObj, null, 10)}\n      }\n    }\n  }\n};`;
    handleCopy(str, "Tailwind Config");
  };

  const downloadTailwindJson = () => {
    const configObj = tailwindScale.reduce((acc, curr) => {
      acc[curr.step] = curr.hex;
      return acc;
    }, {} as Record<string, string>);
    const blob = new Blob([JSON.stringify({ brandPalette: configObj }, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tailwind-palette-${hexInput.replace("#", "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isTurkish ? "JSON dosyası başarıyla indirildi!" : "JSON file downloaded successfully!");
  };

  const exportCssVariables = () => {
    const css = `:root {\n  --color-brand-hex: ${hexInput};\n  --color-brand-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n  --color-brand-hsl: ${hsl.h}deg ${hsl.s}% ${hsl.l}%;\n  --color-brand-oklch: oklch(${oklch.l} ${oklch.c} ${oklch.h});\n}`;
    handleCopy(css, "CSS Variables");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-xl">
          <Palette className="h-4 w-4 text-indigo-400" />
          <span>{isTurkish ? "Universal Color Engineering Studio Pro" : "Universal Color Engineering Studio Pro"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isTurkish ? "Kapsamlı HEX Kodu & Renk Mimarisi Stüdyosu" : "Universal HEX & Color Architecture Studio"}
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          {isTurkish
            ? "HEX, RGB, HSL, CMYK, OKLCH dönüşümleri, WCAG 2.1 erişilebilirlik kontrast testleri, renk körlüğü simülasyonu ve Tailwind renk paleti mimarı."
            : "Real-time conversions across HEX, RGB, HSL, CMYK, OKLCH, WCAG 2.1 contrast inspector, color blindness simulator, and Tailwind color architecture."}
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Hero Color Inspector & Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Visual Swatch Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Pipette className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isTurkish ? "Aktif Renk & Yakın İsim" : "Active Color & Nearest Name"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRandomize}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  title={isTurkish ? "Rastgele Renk" : "Random Color"}
                >
                  <Shuffle className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{isTurkish ? "Rastgele" : "Random"}</span>
                </button>
              </div>
            </div>

            {/* Giant Swatch Display */}
            <div
              className="relative h-44 sm:h-52 w-full rounded-2xl shadow-2xl flex flex-col justify-between p-5 border border-white/15 transition-all duration-300 overflow-hidden"
              style={{ backgroundColor: hexInput }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-3 py-1 rounded-xl text-xs font-black backdrop-blur-xl border"
                  style={{
                    backgroundColor: rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 128 ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.2)",
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#ffffff",
                  }}
                >
                  {namedColor.name}
                </span>
                <span
                  className="text-[11px] font-mono font-bold backdrop-blur-xl px-2.5 py-0.5 rounded-lg text-white/90 border border-white/20"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                >
                  ΔE {namedColor.distance}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div
                    className="text-3xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-md"
                    style={{
                      color: rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 128 ? "#09090b" : "#ffffff",
                    }}
                  >
                    {hexInput.toUpperCase()}
                  </div>
                  <div
                    className="text-xs font-mono opacity-80"
                    style={{
                      color: rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 128 ? "#09090b" : "#ffffff",
                    }}
                  >
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(hexInput, "HEX")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/60 border border-white/20 text-xs font-bold text-white backdrop-blur-2xl hover:bg-black/80 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  {copiedFormat === "HEX" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedFormat === "HEX" ? (isTurkish ? "Kopyalandı" : "Copied") : "HEX Kopyala"}</span>
                </button>
              </div>
            </div>

            {/* Interactive Color Inputs & Sliders */}
            <div className="space-y-4 border-t border-white/10 pt-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Hash className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#8B5CF6"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm font-mono font-bold text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <input
                  type="color"
                  value={rgbToHex(rgb.r, rgb.g, rgb.b)}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-10 w-14 rounded-2xl bg-transparent cursor-pointer border border-white/10"
                />
              </div>

              {/* H, S, L Interactive Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
                    <span>Hue ({isTurkish ? "Renk Tonu" : "Hue"})</span>
                    <span className="font-mono text-white">{hsl.h}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={(e) => {
                      const newHsl = { ...hsl, h: Number(e.target.value) };
                      const c = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                      handleColorChange(rgbToHex(c.r, c.g, c.b));
                    }}
                    className="w-full accent-indigo-500 h-2 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
                    <span>Saturation ({isTurkish ? "Doygunluk" : "Saturation"})</span>
                    <span className="font-mono text-white">%{hsl.s}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) => {
                      const newHsl = { ...hsl, s: Number(e.target.value) };
                      const c = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                      handleColorChange(rgbToHex(c.r, c.g, c.b));
                    }}
                    className="w-full accent-indigo-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
                    <span>Lightness ({isTurkish ? "Açıklık / Parlaklık" : "Lightness"})</span>
                    <span className="font-mono text-white">%{hsl.l}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) => {
                      const newHsl = { ...hsl, l: Number(e.target.value) };
                      const c = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                      handleColorChange(rgbToHex(c.r, c.g, c.b));
                    }}
                    className="w-full accent-indigo-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Quick History Palette */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                {isTurkish ? "Son Kullanılan Renk Geçmişi:" : "Recently Picked Palette History:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {colorHistory.map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleColorChange(h)}
                    className="h-7 w-7 rounded-xl border border-white/15 hover:scale-110 transition-transform cursor-pointer shadow-sm relative group"
                    style={{ backgroundColor: h }}
                    title={h}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Color Harmonies Matrix */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>{isTurkish ? "Renk Uyumları & Harmoniler" : "Color Harmonies & Palette Modes"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Complementary */}
              <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
                <div className="text-xs font-semibold text-zinc-400">{isTurkish ? "Tamamlayıcı (Zıt)" : "Complementary"}</div>
                <div className="flex gap-2">
                  <div
                    onClick={() => handleCopy(hexInput, "Base")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90 flex items-center justify-center font-mono text-[10px] font-bold text-white/90 shadow-sm"
                    style={{ backgroundColor: hexInput }}
                  >
                    Base
                  </div>
                  <div
                    onClick={() => handleCopy(harmonies.complementary, "Complementary")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90 flex items-center justify-center font-mono text-[10px] font-bold text-white/90 shadow-sm"
                    style={{ backgroundColor: harmonies.complementary }}
                  >
                    180°
                  </div>
                </div>
              </div>

              {/* Analogous */}
              <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
                <div className="text-xs font-semibold text-zinc-400">{isTurkish ? "Analog (Komşu)" : "Analogous"}</div>
                <div className="flex gap-1.5">
                  <div
                    onClick={() => handleCopy(harmonies.analogous1, "Analogous 1")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: harmonies.analogous1 }}
                  />
                  <div
                    onClick={() => handleCopy(hexInput, "Base")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: hexInput }}
                  />
                  <div
                    onClick={() => handleCopy(harmonies.analogous2, "Analogous 2")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: harmonies.analogous2 }}
                  />
                </div>
              </div>

              {/* Triadic */}
              <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
                <div className="text-xs font-semibold text-zinc-400">{isTurkish ? "Üçlü Denge (Triadic)" : "Triadic"}</div>
                <div className="flex gap-1.5">
                  <div
                    onClick={() => handleCopy(hexInput, "Base")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: hexInput }}
                  />
                  <div
                    onClick={() => handleCopy(harmonies.triadic1, "Triadic 1")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: harmonies.triadic1 }}
                  />
                  <div
                    onClick={() => handleCopy(harmonies.triadic2, "Triadic 2")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: harmonies.triadic2 }}
                  />
                </div>
              </div>

              {/* Tetradic */}
              <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
                <div className="text-xs font-semibold text-zinc-400">{isTurkish ? "Dörtlü Denge (Tetradic)" : "Tetradic"}</div>
                <div className="flex gap-1.5">
                  <div
                    onClick={() => handleCopy(hexInput, "Base")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: hexInput }}
                  />
                  <div
                    onClick={() => handleCopy(harmonies.tetradic1, "Tetradic 1")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: harmonies.tetradic1 }}
                  />
                  <div
                    onClick={() => handleCopy(harmonies.tetradic2, "Tetradic 2")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: harmonies.tetradic2 }}
                  />
                  <div
                    onClick={() => handleCopy(harmonies.tetradic3, "Tetradic 3")}
                    className="h-10 flex-1 rounded-xl cursor-pointer border border-white/10 hover:opacity-90"
                    style={{ backgroundColor: harmonies.tetradic3 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Multi-Format Converter, Tailwind 50-950, Contrast & Simulator */}
        <div className="lg:col-span-6 space-y-6">
          {/* Universal Color Codes Matrix */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-indigo-400" />
                {isTurkish ? "Evrensel Renk Formatları" : "Universal Color Codes"}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">1-Click Copy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { label: "HEX", val: hexInput.toUpperCase() },
                { label: "RGB", val: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
                { label: "RGBA", val: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})` },
                { label: "HSL", val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
                { label: "HSV / HSB", val: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
                { label: "CMYK (Print)", val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
                { label: "OKLCH (CSS Color 4)", val: `oklch(${oklch.l} ${oklch.c} ${oklch.h})` },
                { label: "Decimal Int", val: `${(rgb.r << 16) + (rgb.g << 8) + rgb.b}` },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopy(item.val, item.label)}
                  className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-zinc-400 block">{item.label}</span>
                    <span className="font-mono text-xs font-bold text-white truncate block">{item.val}</span>
                  </div>
                  {copiedFormat === item.label ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Quick Export Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={exportCssVariables}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-bold text-zinc-200 transition-all cursor-pointer text-center"
              >
                CSS Variables
              </button>
              <button
                onClick={exportTailwindConfig}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-xs font-bold text-indigo-300 transition-all cursor-pointer text-center"
              >
                Tailwind Config
              </button>
            </div>
          </div>

          {/* Tailwind 50-950 Palette Matrix */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>{isTurkish ? "Tailwind 50 - 950 Ton Mimarisi" : "Tailwind 50 - 950 Scale Matrix"}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportTailwindConfig}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  title={isTurkish ? "JSON formatını panoya kopyalar" : "Copy JSON to clipboard"}
                >
                  <Copy className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{isTurkish ? "JSON Kopyala" : "Copy JSON"}</span>
                </button>
                <button
                  onClick={downloadTailwindJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400 transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                  title={isTurkish ? "Paleti .json dosyası olarak bilgisayarınıza indirir" : "Downloads palette as .json file"}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isTurkish ? "JSON İndir" : "Download JSON"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
              {tailwindScale.map((item) => (
                <div
                  key={item.step}
                  onClick={() => handleCopy(item.hex, item.step)}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                  title={`${item.step}: ${item.hex}`}
                >
                  <div
                    className="h-10 sm:h-12 w-full rounded-lg border border-white/10 group-hover:scale-105 transition-transform shadow-sm"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white font-bold">
                    {item.step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WCAG Accessibility & Contrast Laboratory */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Contrast className="h-4 w-4 text-indigo-400" />
              <span>{isTurkish ? "WCAG 2.1 Erişilebilirlik & Kontrast Skoru" : "WCAG 2.1 Contrast Laboratory"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* vs White */}
              <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">vs White (#FFF)</span>
                  <span className="font-mono text-sm font-black text-white">{contrastVsWhite}:1</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  {contrastVsWhite >= 4.5 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> AA Pass
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> AA Fail
                    </span>
                  )}
                  {contrastVsWhite >= 7.0 && (
                    <span className="text-emerald-300 text-[10px] bg-emerald-500/10 px-1.5 rounded">AAA</span>
                  )}
                </div>
              </div>

              {/* vs Black */}
              <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">vs Black (#000)</span>
                  <span className="font-mono text-sm font-black text-white">{contrastVsBlack}:1</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  {contrastVsBlack >= 4.5 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> AA Pass
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> AA Fail
                    </span>
                  )}
                  {contrastVsBlack >= 7.0 && (
                    <span className="text-emerald-300 text-[10px] bg-emerald-500/10 px-1.5 rounded">AAA</span>
                  )}
                </div>
              </div>

              {/* vs Obsidian Dark */}
              <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">vs Dark (#09090B)</span>
                  <span className="font-mono text-sm font-black text-white">{contrastVsObsidian}:1</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  {contrastVsObsidian >= 4.5 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> AA Pass
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> AA Fail
                    </span>
                  )}
                  {contrastVsObsidian >= 7.0 && (
                    <span className="text-emerald-300 text-[10px] bg-emerald-500/10 px-1.5 rounded">AAA</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Color Blindness Vision Deficiency Simulator */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-400" />
              <span>{isTurkish ? "Renk Körlüğü Simülasyonu (CVD)" : "Color Vision Deficiency Simulator"}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { type: "protanopia" as const, name: isTurkish ? "Protanopi (Kırmızı)" : "Protanopia" },
                { type: "deuteranopia" as const, name: isTurkish ? "Deuteranopi (Yeşil)" : "Deuteranopia" },
                { type: "tritanopia" as const, name: isTurkish ? "Tritanopi (Mavi)" : "Tritanopia" },
                { type: "achromatopsia" as const, name: isTurkish ? "Akromatopsi (Gri)" : "Achromatopsia" },
              ].map((sim) => {
                const simHex = simulateColorBlindness(rgb.r, rgb.g, rgb.b, sim.type);
                return (
                  <div
                    key={sim.type}
                    onClick={() => handleCopy(simHex, sim.name)}
                    className="p-2.5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center gap-2 cursor-pointer hover:border-white/20 transition-all"
                  >
                    <div
                      className="h-10 w-full rounded-xl border border-white/10 shadow-sm"
                      style={{ backgroundColor: simHex }}
                    />
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-zinc-300 block truncate">{sim.name}</span>
                      <span className="font-mono text-[9px] text-zinc-500">{simHex}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Multi-Color Palette Mixer & Blender Studio */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {isTurkish ? "Gelişmiş Çoklu Renk Karıştırıcı & Blender" : "Advanced Multi-Color Palette Mixer & Blender"}
                </h3>
              </div>

              {/* Blend Algorithm Switcher */}
              <div className="flex gap-1.5">
                {[
                  { id: "oklch", label: "OKLCH (Doğal)" },
                  { id: "rgb", label: "Linear RGB" },
                  { id: "subtractive", label: isTurkish ? "Pigment Boya" : "Pigment" },
                ].map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => setMixAlgorithm(algo.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      mixAlgorithm === algo.id
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                        : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-white"
                    }`}
                  >
                    {algo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Color Palette Inputs with Sliders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{isTurkish ? "Karışım Paleti & Ağırlık Oranları" : "Palette Colors & Weight Distribution"}</span>
                <button
                  onClick={handleAddMixColor}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                >
                  + {isTurkish ? "Renk Ekle" : "Add Color"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mixPalette.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 shadow-inner"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input
                        type="color"
                        value={item.hex}
                        onChange={(e) => handleUpdateMixColor(item.id, e.target.value)}
                        className="h-8 w-8 rounded-lg border border-white/20 bg-transparent cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          type="text"
                          value={item.hex}
                          onChange={(e) => handleUpdateMixColor(item.id, e.target.value)}
                          className="w-20 bg-transparent font-mono text-xs font-bold text-white uppercase focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={item.weight}
                            onChange={(e) => handleUpdateMixWeight(item.id, Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="font-mono text-[10px] text-zinc-400 w-7 text-right">%{item.weight}</span>
                        </div>
                      </div>
                    </div>

                    {mixPalette.length > 2 && (
                      <button
                        onClick={() => handleRemoveMixColor(item.id)}
                        className="text-zinc-500 hover:text-rose-400 text-xs p-1 cursor-pointer transition-colors"
                        title={isTurkish ? "Rengi Kaldır" : "Remove Color"}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Spectrum Preview */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{isTurkish ? "Geçiş Spektrumu & Ara Tonlar" : "Gradient Transition Steps"}</span>
                <span className="font-mono text-indigo-400 font-bold">{mixSteps} {isTurkish ? "Adım" : "Steps"}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {blendedGradientSteps.map((stepHex, sIdx) => (
                  <div
                    key={sIdx}
                    onClick={() => handleCopy(stepHex, `Step ${sIdx + 1}`)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/40 transition-all cursor-pointer group"
                    title={stepHex}
                  >
                    <div
                      className="h-9 w-full rounded-lg border border-white/10 shadow-sm group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: stepHex }}
                    />
                    <span className="font-mono text-[10px] font-bold text-zinc-300 group-hover:text-white">
                      {stepHex.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Multi-Blended Result Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <div
                  className="h-12 w-16 rounded-xl border border-white/20 shadow-lg shrink-0"
                  style={{ backgroundColor: multiBlendedHex }}
                />
                <div>
                  <span className="text-[11px] font-semibold text-indigo-300 block">
                    {isTurkish ? "Çoklu Karışım Sonucu (Ağırlıklı Ortalama)" : "Multi-Blended Final Color"}
                  </span>
                  <span className="font-mono text-base font-extrabold text-white">
                    {multiBlendedHex.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleColorChange(multiBlendedHex)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer"
                >
                  {isTurkish ? "Ana Renk Yap" : "Set as Base"}
                </button>
                <button
                  onClick={() => handleCopy(multiBlendedHex, "Multi-Blended Result")}
                  className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 transition-all cursor-pointer shadow-md"
                  title={isTurkish ? "HEX Kopyala" : "Copy HEX"}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
