"use client";
// ============================================================
// aegisTyping — Theme Definitions & CSS Variable Engine
// 30+ themes with zero-flicker CSS variable swap
// ============================================================
import type { ThemeName, ThemeDefinition } from "../types";

export const THEMES: ThemeDefinition[] = [
  // ─── Dark Group ─────────────────────────────────────────
  {
    name: "default",
    label: "Aegis",
    group: "dark",
    vars: {
      bg: "#09090b",
      surface: "#131316",
      border: "#27272a",
      text: "#fafafa",
      muted: "#71717a",
      correct: "#22c55e",
      error: "#ef4444",
      pending: "#71717a",
      caret: "#22d3ee",
      highlight: "rgba(34,211,238,0.08)",
      accent: "#22d3ee",
    },
  },
  {
    name: "midnight",
    label: "Gece Yarısı",
    group: "dark",
    vars: {
      bg: "#020617",
      surface: "#0f172a",
      border: "#1e293b",
      text: "#e2e8f0",
      muted: "#64748b",
      correct: "#34d399",
      error: "#f87171",
      pending: "#475569",
      caret: "#818cf8",
      highlight: "rgba(129,140,248,0.1)",
      accent: "#818cf8",
    },
  },
  {
    name: "charcoal",
    label: "Mangal",
    group: "dark",
    vars: {
      bg: "#1c1c1c",
      surface: "#262626",
      border: "#3f3f3f",
      text: "#e5e5e5",
      muted: "#737373",
      correct: "#4ade80",
      error: "#f87171",
      pending: "#525252",
      caret: "#facc15",
      highlight: "rgba(250,204,21,0.08)",
      accent: "#facc15",
    },
  },
  {
    name: "void",
    label: "Yokluk",
    group: "dark",
    vars: {
      bg: "#000000",
      surface: "#0a0a0a",
      border: "#1a1a1a",
      text: "#ffffff",
      muted: "#555555",
      correct: "#00ff88",
      error: "#ff3333",
      pending: "#333333",
      caret: "#00aaff",
      highlight: "rgba(0,170,255,0.07)",
      accent: "#00aaff",
    },
  },
  {
    name: "abyss",
    label: "Uçurum",
    group: "dark",
    vars: {
      bg: "#050a18",
      surface: "#0d1425",
      border: "#1a2540",
      text: "#c5d4f0",
      muted: "#4a5a80",
      correct: "#5eead4",
      error: "#fb7185",
      pending: "#2a3a60",
      caret: "#38bdf8",
      highlight: "rgba(56,189,248,0.1)",
      accent: "#38bdf8",
    },
  },
  // ─── Neon Group ─────────────────────────────────────────
  {
    name: "cyber",
    label: "Siber",
    group: "neon",
    vars: {
      bg: "#04040f",
      surface: "#0a0a1a",
      border: "#1a1a3a",
      text: "#e0f0ff",
      muted: "#4a6080",
      correct: "#00ff99",
      error: "#ff0066",
      pending: "#223366",
      caret: "#00ccff",
      highlight: "rgba(0,204,255,0.12)",
      accent: "#00ccff",
    },
  },
  {
    name: "matrix",
    label: "Matris",
    group: "neon",
    vars: {
      bg: "#000500",
      surface: "#001a00",
      border: "#003300",
      text: "#00cc44",
      muted: "#005500",
      correct: "#00ff00",
      error: "#ff0000",
      pending: "#003300",
      caret: "#00ff44",
      highlight: "rgba(0,255,0,0.08)",
      accent: "#00ff00",
    },
  },
  {
    name: "aurora",
    label: "Kuzey Işıkları",
    group: "neon",
    vars: {
      bg: "#010512",
      surface: "#06091f",
      border: "#111a3a",
      text: "#d0e8ff",
      muted: "#3a5080",
      correct: "#50fa7b",
      error: "#ff79c6",
      pending: "#1a2a50",
      caret: "#8be9fd",
      highlight: "rgba(139,233,253,0.1)",
      accent: "#8be9fd",
    },
  },
  {
    name: "synthwave",
    label: "Synthwave",
    group: "neon",
    vars: {
      bg: "#0d001a",
      surface: "#160a2a",
      border: "#2a1a40",
      text: "#f0d0ff",
      muted: "#7a4a99",
      correct: "#72f1b8",
      error: "#fe4450",
      pending: "#3a1a55",
      caret: "#f92aad",
      highlight: "rgba(249,42,173,0.1)",
      accent: "#f92aad",
    },
  },
  {
    name: "ultraviolet",
    label: "Ultraviyole",
    group: "neon",
    vars: {
      bg: "#07001a",
      surface: "#100028",
      border: "#200050",
      text: "#e8d5ff",
      muted: "#6633aa",
      correct: "#66ff99",
      error: "#ff4488",
      pending: "#330066",
      caret: "#cc55ff",
      highlight: "rgba(204,85,255,0.12)",
      accent: "#cc55ff",
    },
  },
  // ─── Light Group ─────────────────────────────────────────
  {
    name: "paper",
    label: "Kağıt",
    group: "light",
    vars: {
      bg: "#f8f5f0",
      surface: "#ede9e3",
      border: "#d8d2c8",
      text: "#2d2520",
      muted: "#8b7d70",
      correct: "#166534",
      error: "#991b1b",
      pending: "#a0907f",
      caret: "#2563eb",
      highlight: "rgba(37,99,235,0.08)",
      accent: "#2563eb",
    },
  },
  {
    name: "ivory",
    label: "Fildişi",
    group: "light",
    vars: {
      bg: "#fffff0",
      surface: "#f5f5dc",
      border: "#e0ddc0",
      text: "#2a2a1a",
      muted: "#8a8a6a",
      correct: "#15803d",
      error: "#b91c1c",
      pending: "#a0a080",
      caret: "#d97706",
      highlight: "rgba(217,119,6,0.08)",
      accent: "#d97706",
    },
  },
  {
    name: "cloud",
    label: "Bulut",
    group: "light",
    vars: {
      bg: "#f0f4ff",
      surface: "#e8eeff",
      border: "#c8d0ee",
      text: "#1a2050",
      muted: "#6070a8",
      correct: "#15803d",
      error: "#dc2626",
      pending: "#8090cc",
      caret: "#4f46e5",
      highlight: "rgba(79,70,229,0.08)",
      accent: "#4f46e5",
    },
  },
  {
    name: "daylight",
    label: "Gün Işığı",
    group: "light",
    vars: {
      bg: "#fefce8",
      surface: "#fef9c3",
      border: "#fde68a",
      text: "#1c1917",
      muted: "#78716c",
      correct: "#15803d",
      error: "#dc2626",
      pending: "#a8a29e",
      caret: "#ea580c",
      highlight: "rgba(234,88,12,0.08)",
      accent: "#ea580c",
    },
  },
  {
    name: "minimal-light",
    label: "Minimal Açık",
    group: "light",
    vars: {
      bg: "#ffffff",
      surface: "#f8f8f8",
      border: "#e8e8e8",
      text: "#111111",
      muted: "#999999",
      correct: "#16a34a",
      error: "#dc2626",
      pending: "#aaaaaa",
      caret: "#000000",
      highlight: "rgba(0,0,0,0.05)",
      accent: "#000000",
    },
  },
  // ─── Nature Group ─────────────────────────────────────────
  {
    name: "forest",
    label: "Orman",
    group: "nature",
    vars: {
      bg: "#0a1a0a",
      surface: "#122012",
      border: "#1e3a1e",
      text: "#d4f0d4",
      muted: "#4a7a4a",
      correct: "#86efac",
      error: "#fca5a5",
      pending: "#2a502a",
      caret: "#4ade80",
      highlight: "rgba(74,222,128,0.1)",
      accent: "#4ade80",
    },
  },
  {
    name: "ocean",
    label: "Okyanus",
    group: "nature",
    vars: {
      bg: "#020d18",
      surface: "#041828",
      border: "#0a3050",
      text: "#cce8f8",
      muted: "#3a7098",
      correct: "#67e8f9",
      error: "#f87171",
      pending: "#1a4a68",
      caret: "#22d3ee",
      highlight: "rgba(34,211,238,0.1)",
      accent: "#22d3ee",
    },
  },
  {
    name: "sakura",
    label: "Kiraz Çiçeği",
    group: "nature",
    vars: {
      bg: "#1a0812",
      surface: "#28101e",
      border: "#401830",
      text: "#ffe4ef",
      muted: "#8a4060",
      correct: "#f9a8d4",
      error: "#fb7185",
      pending: "#5a2040",
      caret: "#f472b6",
      highlight: "rgba(244,114,182,0.1)",
      accent: "#f472b6",
    },
  },
  {
    name: "desert",
    label: "Çöl",
    group: "nature",
    vars: {
      bg: "#1a1005",
      surface: "#2a1c08",
      border: "#48300f",
      text: "#fde8b8",
      muted: "#8a6030",
      correct: "#fbbf24",
      error: "#f87171",
      pending: "#5a3a10",
      caret: "#f59e0b",
      highlight: "rgba(245,158,11,0.1)",
      accent: "#f59e0b",
    },
  },
  {
    name: "arctic",
    label: "Arktik",
    group: "nature",
    vars: {
      bg: "#050f1a",
      surface: "#0a1a2a",
      border: "#0f2a40",
      text: "#d8eeff",
      muted: "#4a7090",
      correct: "#93c5fd",
      error: "#fda4af",
      pending: "#1a3a55",
      caret: "#60a5fa",
      highlight: "rgba(96,165,250,0.1)",
      accent: "#60a5fa",
    },
  },
  // ─── Retro Group ─────────────────────────────────────────
  {
    name: "terminal",
    label: "Terminal",
    group: "retro",
    vars: {
      bg: "#001100",
      surface: "#001800",
      border: "#002800",
      text: "#00cc00",
      muted: "#006600",
      correct: "#00ff00",
      error: "#cc0000",
      pending: "#004400",
      caret: "#00ff00",
      highlight: "rgba(0,255,0,0.07)",
      accent: "#00ff00",
    },
  },
  {
    name: "amber",
    label: "Kehribar",
    group: "retro",
    vars: {
      bg: "#0d0800",
      surface: "#1a1000",
      border: "#2a1a00",
      text: "#ffb300",
      muted: "#664a00",
      correct: "#ffcc00",
      error: "#ff4400",
      pending: "#443200",
      caret: "#ffd700",
      highlight: "rgba(255,215,0,0.08)",
      accent: "#ffd700",
    },
  },
  {
    name: "crt",
    label: "CRT Ekran",
    group: "retro",
    vars: {
      bg: "#050505",
      surface: "#0f0f0f",
      border: "#1f1f1f",
      text: "#e0e0c0",
      muted: "#606050",
      correct: "#a0e0a0",
      error: "#e0a0a0",
      pending: "#404040",
      caret: "#e0e000",
      highlight: "rgba(224,224,0,0.07)",
      accent: "#e0e000",
    },
  },
  {
    name: "custom",
    label: "Özel",
    group: "custom",
    vars: {
      bg: "#09090b",
      surface: "#131316",
      border: "#27272a",
      text: "#fafafa",
      muted: "#71717a",
      correct: "#22c55e",
      error: "#ef4444",
      pending: "#71717a",
      caret: "#22d3ee",
      highlight: "rgba(34,211,238,0.08)",
      accent: "#22d3ee",
    },
  },
];

// ─── Apply Theme to DOM ─────────────────────────────────────
export function applyTheme(
  themeName: ThemeName,
  customOverride?: { bg?: string; text?: string; accent?: string }
): void {
  const theme = THEMES.find((t) => t.name === themeName) ?? THEMES[0];
  const vars = { ...theme.vars };

  if (customOverride) {
    if (customOverride.bg) {
      vars.bg = customOverride.bg;
      vars.surface = customOverride.bg;
    }
    if (customOverride.text) {
      vars.text = customOverride.text;
      vars.pending = customOverride.text + "55";
    }
    if (customOverride.accent) {
      vars.caret = customOverride.accent;
      vars.accent = customOverride.accent;
      vars.correct = customOverride.accent;
    }
  }

  const root = document.documentElement;
  root.style.setProperty("--at-bg", vars.bg);
  root.style.setProperty("--at-surface", vars.surface);
  root.style.setProperty("--at-border", vars.border);
  root.style.setProperty("--at-text", vars.text);
  root.style.setProperty("--at-muted", vars.muted);
  root.style.setProperty("--at-correct", vars.correct);
  root.style.setProperty("--at-error", vars.error);
  root.style.setProperty("--at-pending", vars.pending);
  root.style.setProperty("--at-caret", vars.caret);
  root.style.setProperty("--at-highlight", vars.highlight);
  root.style.setProperty("--at-accent", vars.accent);
}

export function getThemesByGroup(): Record<
  string,
  ThemeDefinition[]
> {
  const groups: Record<string, ThemeDefinition[]> = {};
  for (const t of THEMES) {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  }
  return groups;
}
