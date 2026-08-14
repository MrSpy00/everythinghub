// ============================================================
// aegisTyping — Type Definitions
// ============================================================

// ─── Test Modes ────────────────────────────────────────────
export type TestMode =
  | "time"
  | "words"
  | "quote"
  | "custom"
  | "zen"
  | "code"
  | "learn"
  | "challenge";

// ─── Funbox / Challenge Modifiers ──────────────────────────
export type Funbox =
  | "none"
  | "mirror"
  | "backwards"
  | "blind"
  | "sudden-death"
  | "stop-on-error"
  | "ghost-race"
  | "no-backspace"
  | "chasing-beam"
  | "neon-rain";

// ─── Caret Styles ──────────────────────────────────────────
export type CaretStyle = "block" | "line" | "underscore" | "off";

// ─── Sound Packs ───────────────────────────────────────────
export type SoundPack = "mechanical" | "soft" | "typewriter" | "silent";

// ─── Keyboard Layouts ──────────────────────────────────────
export type KeyboardLayout =
  | "qwerty"
  | "qwertz"
  | "azerty"
  | "dvorak"
  | "colemak"
  | "tr-f"
  | "workman";

// ─── Word Difficulty Tiers ─────────────────────────────────
export type WordTier = "common" | "advanced" | "technical";

// ─── Theme Names ───────────────────────────────────────────
export type ThemeName =
  // Dark
  | "default"
  | "midnight"
  | "charcoal"
  | "void"
  | "abyss"
  // Neon
  | "cyber"
  | "matrix"
  | "aurora"
  | "synthwave"
  | "ultraviolet"
  // Light
  | "paper"
  | "ivory"
  | "cloud"
  | "daylight"
  | "minimal-light"
  // Nature
  | "forest"
  | "ocean"
  | "sakura"
  | "desert"
  | "arctic"
  // Retro
  | "terminal"
  | "amber"
  | "crt"
  // Custom
  | "custom";

// ─── Font Choices ──────────────────────────────────────────
export type TypingFont =
  | "geist-mono"
  | "jetbrains-mono"
  | "fira-code"
  | "courier";

// ─── Leaderboard Periods ───────────────────────────────────
export type LeaderboardPeriod = "daily" | "weekly" | "alltime";

// ─── Word State (per word in the arena) ────────────────────
export type WordState = "pending" | "active" | "correct" | "incorrect";

// ─── Character State ───────────────────────────────────────
export type CharState = "pending" | "correct" | "incorrect" | "extra";

// ─── Language Info ─────────────────────────────────────────
export interface LanguageInfo {
  locale: string; // e.g. "tr-q"
  lang: string; // display name e.g. "Türkçe (Q)"
  flag: string; // 2-letter country code e.g. "TR"
  rtl: boolean;
  layout?: KeyboardLayout; // suggested layout
  hasQuotes?: boolean;
  hasAdvanced?: boolean;
}

// ─── Word List Data (JSON file shape) ──────────────────────
export interface WordListData {
  locale: string;
  lang: string;
  flag: string;
  rtl: boolean;
  words: {
    common: string[];
    advanced?: string[];
    technical?: string[];
    numbers?: string[];
  };
  quotes?: Array<{
    text: string;
    author?: string;
    source?: string;
  }>;
}

// ─── Individual Word Object ────────────────────────────────
export interface WordObject {
  original: string;
  typed: string;
  state: WordState;
  chars: CharObject[];
}

export interface CharObject {
  char: string;
  state: CharState;
}

// ─── Keystroke Record ──────────────────────────────────────
export interface KeystrokeRecord {
  key: string;
  timestamp: number; // performance.now()
  delta: number; // ms since last keystroke
  correct: boolean;
}

// ─── Anti-Cheat Report ─────────────────────────────────────
export interface AntiCheatReport {
  suspicious: boolean;
  flags: string[];
  variance: number;
  mean: number;
  pasteAttempts: number;
  blurCount: number;
  wpmCap: number;
}

// ─── Test Result ───────────────────────────────────────────
export interface TestResult {
  id: string;
  wpm: number; // net WPM
  rawWpm: number;
  accuracy: number; // 0-100
  consistency: number; // 0-100
  errors: number;
  cpm: number;
  keystrokes: number; // total keydown count
  duration: number; // seconds
  mode: TestMode;
  modeValue: number | string; // e.g. 60 for time60, 25 for words25
  language: string; // locale
  funbox: Funbox;
  timestamp: number;
  hash: string; // Web Crypto SHA-256
  antiCheat: AntiCheatReport;
  wpmTimeline: number[]; // WPM per second
  errorPositions: number[]; // char indices where errors occurred
  nickname?: string;
}

// ─── Local High Score ──────────────────────────────────────
export interface LocalHighScore {
  mode: TestMode;
  modeValue: number | string;
  language: string;
  wpm: number;
  accuracy: number;
  timestamp: number;
}

// ─── Global Leaderboard Entry ──────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  wpm: number;
  accuracy: number;
  consistency: number;
  mode: TestMode;
  modeValue: number | string;
  language: string;
  timestamp: number;
  hash: string;
}

// ─── Settings ──────────────────────────────────────────────
export interface AegisTypingSettings {
  // Appearance
  theme: ThemeName;
  customThemeBg?: string;
  customThemeText?: string;
  fontSize: number; // 14-26
  fontFamily: TypingFont;
  lineCount: 1 | 2 | 3;

  // Caret
  caretStyle: CaretStyle;
  caretColor: string; // hex
  smoothCaret: boolean;
  caretTrail: boolean;
  caretTrailLength: number; // 3-10

  // Test Options
  punctuation: boolean;
  numbers: boolean;
  capitalization: boolean;
  strictMode: boolean;
  suddenDeath: boolean;
  confidenceMode: boolean; // no backspace

  // Sound
  soundPack: SoundPack;
  volume: number; // 0-1
  soundOnError: boolean;

  // Anti-cheat
  preventPaste: boolean;
  tabSwitchDetection: boolean;

  // Visual Effects
  showCaretTrail: boolean;
  wordFadeAnimation: boolean;
  finishConfetti: boolean;
  showLiveGraph: boolean;
  reducedMotion: boolean;

  // Keyboard
  keyboardLayout: KeyboardLayout;
  showKeyboardOverlay: boolean;

  // Misc
  nickname: string;
  showTimerProgress: boolean;
  blindMode: boolean;
  hideStats: boolean; // hide during test
}

export const DEFAULT_SETTINGS: AegisTypingSettings = {
  theme: "default",
  fontSize: 18,
  fontFamily: "geist-mono",
  lineCount: 3,

  caretStyle: "line",
  caretColor: "#22d3ee",
  smoothCaret: true,
  caretTrail: false,
  caretTrailLength: 5,

  punctuation: false,
  numbers: false,
  capitalization: true,
  strictMode: false,
  suddenDeath: false,
  confidenceMode: false,

  soundPack: "silent",
  volume: 0.3,
  soundOnError: true,

  preventPaste: true,
  tabSwitchDetection: true,

  showCaretTrail: false,
  wordFadeAnimation: true,
  finishConfetti: true,
  showLiveGraph: true,
  reducedMotion: false,

  keyboardLayout: "qwerty",
  showKeyboardOverlay: false,

  nickname: "Anonim",
  showTimerProgress: true,
  blindMode: false,
  hideStats: false,
};

// ─── Test State Machine ────────────────────────────────────
export type TestPhase = "idle" | "countdown" | "running" | "finished" | "paused";

// ─── Adaptive Learning Stats ───────────────────────────────
export interface AdaptiveKeyStats {
  [key: string]: {
    attempts: number;
    errors: number;
    avgDelta: number; // average ms per keystroke
  };
}

// ─── Lesson Definition ─────────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  description: string;
  keys: string[]; // keys introduced in this lesson
  allKeys: string[]; // all keys available
  targetWpm: number;
  targetAccuracy: number;
}

// ─── Speed Tier ────────────────────────────────────────────
export type SpeedTier =
  | "beginner"
  | "novice"
  | "intermediate"
  | "skilled"
  | "advanced"
  | "expert"
  | "master"
  | "legend";

export function getSpeedTier(wpm: number): SpeedTier {
  if (wpm < 20) return "beginner";
  if (wpm < 40) return "novice";
  if (wpm < 60) return "intermediate";
  if (wpm < 80) return "skilled";
  if (wpm < 100) return "advanced";
  if (wpm < 130) return "expert";
  if (wpm < 180) return "master";
  return "legend";
}

export const SPEED_TIER_LABELS: Record<SpeedTier, { label: string; color: string; description: string }> = {
  beginner: { label: "Başlangıç", color: "#94a3b8", description: "< 20 WPM" },
  novice: { label: "Acemi", color: "#64748b", description: "20–39 WPM" },
  intermediate: { label: "Orta", color: "#22c55e", description: "40–59 WPM" },
  skilled: { label: "İyi", color: "#3b82f6", description: "60–79 WPM" },
  advanced: { label: "İleri", color: "#8b5cf6", description: "80–99 WPM" },
  expert: { label: "Uzman", color: "#f59e0b", description: "100–129 WPM" },
  master: { label: "Usta", color: "#ef4444", description: "130–179 WPM" },
  legend: { label: "Efsane", color: "#22d3ee", description: "180+ WPM" },
};

// ─── Theme Definition ──────────────────────────────────────
export interface ThemeDefinition {
  name: ThemeName;
  label: string;
  group: "dark" | "neon" | "light" | "nature" | "retro" | "custom";
  vars: {
    bg: string;
    surface: string;
    border: string;
    text: string;
    muted: string;
    correct: string;
    error: string;
    pending: string;
    caret: string;
    highlight: string;
    accent: string;
  };
}
