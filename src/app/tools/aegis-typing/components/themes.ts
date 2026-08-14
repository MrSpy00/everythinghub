"use client";
// ============================================================
// aegisTyping — Theme Definitions & CSS Variable Engine
// 30+ themes with zero-flicker CSS variable swap & high contrast
// ============================================================
import type { ThemeName, ThemeDefinition } from "../types";

export const THEMES: ThemeDefinition[] = [
  // ─── Dark Group ─────────────────────────────────────────
  {
    name: "default",
    label: "Aegis Studio",
    group: "dark",
    vars: {
      bg: "transparent",
      surface: "rgba(18, 18, 24, 0.5)",
      border: "rgba(255, 255, 255, 0.1)",
      text: "#ffffff",
      muted: "#94a3b8",
      correct: "#22c55e",
      error: "#ef4444",
      pending: "rgba(255, 255, 255, 0.45)",
      caret: "#22d3ee",
      highlight: "rgba(34,211,238,0.12)",
      accent: "#22d3ee",
    },
  },
  {
    name: "midnight",
    label: "Gece Yarısı",
    group: "dark",
    vars: {
      bg: "transparent",
      surface: "rgba(15, 23, 42, 0.55)",
      border: "rgba(148, 163, 184, 0.15)",
      text: "#f8fafc",
      muted: "#94a3b8",
      correct: "#38bdf8",
      error: "#f87171",
      pending: "rgba(226, 232, 240, 0.45)",
      caret: "#818cf8",
      highlight: "rgba(129,140,248,0.14)",
      accent: "#818cf8",
    },
  },
  {
    name: "charcoal",
    label: "Mangal",
    group: "dark",
    vars: {
      bg: "transparent",
      surface: "rgba(28, 28, 28, 0.55)",
      border: "rgba(255, 255, 255, 0.12)",
      text: "#f5f5f5",
      muted: "#a3a3a3",
      correct: "#4ade80",
      error: "#f87171",
      pending: "rgba(229, 229, 229, 0.45)",
      caret: "#facc15",
      highlight: "rgba(250,204,21,0.12)",
      accent: "#facc15",
    },
  },
  {
    name: "void",
    label: "Yokluk (Void)",
    group: "dark",
    vars: {
      bg: "transparent",
      surface: "rgba(10, 10, 10, 0.6)",
      border: "rgba(255, 255, 255, 0.1)",
      text: "#ffffff",
      muted: "#a1a1aa",
      correct: "#00ff88",
      error: "#ff3333",
      pending: "rgba(255, 255, 255, 0.45)",
      caret: "#00e5ff",
      highlight: "rgba(0,229,255,0.12)",
      accent: "#00e5ff",
    },
  },
  {
    name: "abyss",
    label: "Uçurum (Abyss)",
    group: "dark",
    vars: {
      bg: "transparent",
      surface: "rgba(13, 20, 37, 0.55)",
      border: "rgba(56, 189, 248, 0.15)",
      text: "#f0f6fc",
      muted: "#7dd3fc",
      correct: "#2dd4bf",
      error: "#fb7185",
      pending: "rgba(224, 242, 254, 0.45)",
      caret: "#38bdf8",
      highlight: "rgba(56,189,248,0.12)",
      accent: "#38bdf8",
    },
  },
  // ─── Neon Group ─────────────────────────────────────────
  {
    name: "cyber",
    label: "Siber (Cyberpunk)",
    group: "neon",
    vars: {
      bg: "transparent",
      surface: "rgba(10, 10, 26, 0.55)",
      border: "rgba(0, 204, 255, 0.2)",
      text: "#e0f2fe",
      muted: "#7dd3fc",
      correct: "#00ff99",
      error: "#ff0066",
      pending: "rgba(224, 242, 254, 0.45)",
      caret: "#00f0ff",
      highlight: "rgba(0,240,255,0.15)",
      accent: "#00f0ff",
    },
  },
  {
    name: "matrix",
    label: "Matris (Matrix)",
    group: "neon",
    vars: {
      bg: "transparent",
      surface: "rgba(0, 20, 0, 0.6)",
      border: "rgba(34, 197, 94, 0.25)",
      text: "#86efac",
      muted: "#4ade80",
      correct: "#22c55e",
      error: "#ef4444",
      pending: "rgba(134, 239, 172, 0.45)",
      caret: "#22c55e",
      highlight: "rgba(34,197,94,0.15)",
      accent: "#22c55e",
    },
  },
  {
    name: "aurora",
    label: "Kuzey Işıkları",
    group: "neon",
    vars: {
      bg: "transparent",
      surface: "rgba(6, 9, 31, 0.55)",
      border: "rgba(139, 233, 253, 0.2)",
      text: "#f0fdf4",
      muted: "#86efac",
      correct: "#50fa7b",
      error: "#ff79c6",
      pending: "rgba(240, 253, 244, 0.45)",
      caret: "#8be9fd",
      highlight: "rgba(139,233,253,0.15)",
      accent: "#8be9fd",
    },
  },
  {
    name: "synthwave",
    label: "Synthwave",
    group: "neon",
    vars: {
      bg: "transparent",
      surface: "rgba(22, 10, 42, 0.55)",
      border: "rgba(249, 42, 173, 0.25)",
      text: "#fdf2f8",
      muted: "#f472b6",
      correct: "#72f1b8",
      error: "#fe4450",
      pending: "rgba(253, 242, 248, 0.45)",
      caret: "#f92aad",
      highlight: "rgba(249,42,173,0.15)",
      accent: "#f92aad",
    },
  },
  {
    name: "ultraviolet",
    label: "Ultraviyole",
    group: "neon",
    vars: {
      bg: "transparent",
      surface: "rgba(16, 0, 40, 0.55)",
      border: "rgba(204, 85, 255, 0.25)",
      text: "#faf5ff",
      muted: "#c084fc",
      correct: "#4ade80",
      error: "#f43f5e",
      pending: "rgba(250, 245, 255, 0.45)",
      caret: "#cc55ff",
      highlight: "rgba(204,85,255,0.15)",
      accent: "#cc55ff",
    },
  },
  // ─── Light Group ─────────────────────────────────────────
  {
    name: "paper",
    label: "Kağıt",
    group: "light",
    vars: {
      bg: "transparent",
      surface: "rgba(245, 245, 240, 0.7)",
      border: "rgba(0, 0, 0, 0.12)",
      text: "#1c1917",
      muted: "#57534e",
      correct: "#15803d",
      error: "#dc2626",
      pending: "rgba(41, 37, 36, 0.45)",
      caret: "#0284c7",
      highlight: "rgba(2,132,199,0.12)",
      accent: "#0284c7",
    },
  },
  {
    name: "ivory",
    label: "Fildişi",
    group: "light",
    vars: {
      bg: "transparent",
      surface: "rgba(255, 255, 255, 0.75)",
      border: "rgba(0, 0, 0, 0.1)",
      text: "#0f172a",
      muted: "#475569",
      correct: "#16a34a",
      error: "#e11d48",
      pending: "rgba(15, 23, 42, 0.45)",
      caret: "#6366f1",
      highlight: "rgba(99,102,241,0.12)",
      accent: "#6366f1",
    },
  },
  {
    name: "cloud",
    label: "Bulut",
    group: "light",
    vars: {
      bg: "transparent",
      surface: "rgba(241, 245, 249, 0.7)",
      border: "rgba(0, 0, 0, 0.1)",
      text: "#0f172a",
      muted: "#475569",
      correct: "#059669",
      error: "#e11d48",
      pending: "rgba(15, 23, 42, 0.45)",
      caret: "#0ea5e9",
      highlight: "rgba(14,165,233,0.12)",
      accent: "#0ea5e9",
    },
  },
  {
    name: "daylight",
    label: "Gün Işığı",
    group: "light",
    vars: {
      bg: "transparent",
      surface: "rgba(254, 249, 195, 0.65)",
      border: "rgba(202, 138, 4, 0.2)",
      text: "#451a03",
      muted: "#78350f",
      correct: "#16a34a",
      error: "#dc2626",
      pending: "rgba(69, 26, 3, 0.45)",
      caret: "#d97706",
      highlight: "rgba(217,119,6,0.12)",
      accent: "#d97706",
    },
  },
  {
    name: "minimal-light",
    label: "Minimal Açık",
    group: "light",
    vars: {
      bg: "transparent",
      surface: "rgba(255, 255, 255, 0.8)",
      border: "rgba(0, 0, 0, 0.1)",
      text: "#18181b",
      muted: "#52525b",
      correct: "#16a34a",
      error: "#ef4444",
      pending: "rgba(24, 24, 27, 0.45)",
      caret: "#09090b",
      highlight: "rgba(0,0,0,0.08)",
      accent: "#09090b",
    },
  },
  // ─── Nature Group ────────────────────────────────────────
  {
    name: "forest",
    label: "Orman (Forest)",
    group: "nature",
    vars: {
      bg: "transparent",
      surface: "rgba(12, 26, 18, 0.55)",
      border: "rgba(52, 211, 153, 0.2)",
      text: "#f0fdf4",
      muted: "#6ee7b7",
      correct: "#34d399",
      error: "#f87171",
      pending: "rgba(240, 253, 244, 0.45)",
      caret: "#34d399",
      highlight: "rgba(52,211,153,0.12)",
      accent: "#34d399",
    },
  },
  {
    name: "ocean",
    label: "Okyanus (Ocean)",
    group: "nature",
    vars: {
      bg: "transparent",
      surface: "rgba(10, 22, 38, 0.55)",
      border: "rgba(56, 189, 248, 0.2)",
      text: "#f0f9ff",
      muted: "#7dd3fc",
      correct: "#38bdf8",
      error: "#f87171",
      pending: "rgba(240, 249, 255, 0.45)",
      caret: "#38bdf8",
      highlight: "rgba(56,189,248,0.12)",
      accent: "#38bdf8",
    },
  },
  {
    name: "sakura",
    label: "Sakura",
    group: "nature",
    vars: {
      bg: "transparent",
      surface: "rgba(36, 16, 26, 0.55)",
      border: "rgba(244, 114, 182, 0.2)",
      text: "#fff1f2",
      muted: "#f472b6",
      correct: "#4ade80",
      error: "#fb7185",
      pending: "rgba(255, 241, 242, 0.45)",
      caret: "#f472b6",
      highlight: "rgba(244,114,182,0.12)",
      accent: "#f472b6",
    },
  },
  {
    name: "desert",
    label: "Çöl (Desert)",
    group: "nature",
    vars: {
      bg: "transparent",
      surface: "rgba(35, 24, 15, 0.55)",
      border: "rgba(251, 191, 36, 0.2)",
      text: "#fffbeb",
      muted: "#fcd34d",
      correct: "#4ade80",
      error: "#f87171",
      pending: "rgba(255, 251, 235, 0.45)",
      caret: "#fbbf24",
      highlight: "rgba(251,191,36,0.12)",
      accent: "#fbbf24",
    },
  },
  {
    name: "arctic",
    label: "Kutup (Arctic)",
    group: "nature",
    vars: {
      bg: "transparent",
      surface: "rgba(15, 28, 42, 0.55)",
      border: "rgba(165, 243, 252, 0.2)",
      text: "#f0fdfa",
      muted: "#67e8f9",
      correct: "#2dd4bf",
      error: "#fb7185",
      pending: "rgba(240, 253, 250, 0.45)",
      caret: "#a5f3fc",
      highlight: "rgba(165,243,252,0.12)",
      accent: "#a5f3fc",
    },
  },
  // ─── Retro Group ─────────────────────────────────────────
  {
    name: "terminal",
    label: "Terminal Yeşil",
    group: "retro",
    vars: {
      bg: "transparent",
      surface: "rgba(8, 20, 8, 0.6)",
      border: "rgba(74, 222, 128, 0.2)",
      text: "#4ade80",
      muted: "#22c55e",
      correct: "#86efac",
      error: "#f87171",
      pending: "rgba(74, 222, 128, 0.45)",
      caret: "#4ade80",
      highlight: "rgba(74,222,128,0.15)",
      accent: "#4ade80",
    },
  },
  {
    name: "amber",
    label: "Amber CRT",
    group: "retro",
    vars: {
      bg: "transparent",
      surface: "rgba(28, 16, 0, 0.6)",
      border: "rgba(251, 191, 36, 0.25)",
      text: "#fbbf24",
      muted: "#f59e0b",
      correct: "#fde68a",
      error: "#ef4444",
      pending: "rgba(251, 191, 36, 0.45)",
      caret: "#fbbf24",
      highlight: "rgba(251,191,36,0.15)",
      accent: "#fbbf24",
    },
  },
  {
    name: "crt",
    label: "CRT Monitör",
    group: "retro",
    vars: {
      bg: "transparent",
      surface: "rgba(6, 18, 14, 0.6)",
      border: "rgba(52, 211, 153, 0.2)",
      text: "#34d399",
      muted: "#10b981",
      correct: "#a7f3d0",
      error: "#f43f5e",
      pending: "rgba(52, 211, 153, 0.45)",
      caret: "#34d399",
      highlight: "rgba(52,211,153,0.15)",
      accent: "#34d399",
    },
  },
];

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
      vars.pending = customOverride.text + "77";
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

export function getThemesByGroup(): Record<string, ThemeDefinition[]> {
  const groups: Record<string, ThemeDefinition[]> = {};
  for (const t of THEMES) {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  }
  return groups;
}
