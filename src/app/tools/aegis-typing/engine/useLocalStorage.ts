"use client";
// ============================================================
// aegisTyping — Local Storage Engine (Type-safe)
// Complete session persistence, settings, history and high scores
// ============================================================
import { useCallback } from "react";
import type {
  AegisTypingSettings,
  TestResult,
  LocalHighScore,
  AdaptiveKeyStats,
  TestMode,
  Funbox,
} from "../types";
import { DEFAULT_SETTINGS } from "../types";

export interface SavedSession {
  mode: TestMode;
  modeValue: number | string;
  language: string;
  funbox: Funbox;
  currentLesson: string;
}

const KEYS = {
  SETTINGS: "aegisTyping_settings",
  HISTORY: "aegisTyping_history",
  HIGH_SCORES: "aegisTyping_highscores",
  ADAPTIVE_STATS: "aegisTyping_adaptive",
  SESSION: "aegisTyping_session",
} as const;

const MAX_HISTORY_ENTRIES = 100;
const MAX_HIGH_SCORES = 50;

function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or private mode
  }
}

export function useLocalStorage() {
  // ── Settings ──────────────────────────────────────────
  const loadSettings = useCallback((): AegisTypingSettings => {
    const stored = safeGet<Partial<AegisTypingSettings>>(KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...stored };
  }, []);

  const saveSettings = useCallback((settings: AegisTypingSettings): void => {
    safeSet(KEYS.SETTINGS, settings);
  }, []);

  // ── Session State (Mode, Value, Language) ───────────────
  const loadSession = useCallback((): SavedSession => {
    return safeGet<SavedSession>(KEYS.SESSION, {
      mode: "time",
      modeValue: 60,
      language: "tr-q",
      funbox: "none",
      currentLesson: "homerow",
    });
  }, []);

  const saveSession = useCallback((session: SavedSession): void => {
    safeSet(KEYS.SESSION, session);
  }, []);

  // ── Test History ──────────────────────────────────────
  const loadHistory = useCallback((): TestResult[] => {
    return safeGet<TestResult[]>(KEYS.HISTORY, []);
  }, []);

  const saveResult = useCallback((result: TestResult): void => {
    const history = safeGet<TestResult[]>(KEYS.HISTORY, []);
    const updated = [result, ...history].slice(0, MAX_HISTORY_ENTRIES);
    safeSet(KEYS.HISTORY, updated);
  }, []);

  const clearHistory = useCallback((): void => {
    safeSet(KEYS.HISTORY, []);
  }, []);

  // ── High Scores ───────────────────────────────────────
  const loadHighScores = useCallback((): LocalHighScore[] => {
    return safeGet<LocalHighScore[]>(KEYS.HIGH_SCORES, []);
  }, []);

  const checkAndSaveHighScore = useCallback(
    (result: TestResult): { isNewRecord: boolean; prevBest: number } => {
      const scores = safeGet<LocalHighScore[]>(KEYS.HIGH_SCORES, []);

      const existing = scores.find(
        (s) =>
          s.mode === result.mode &&
          s.modeValue === result.modeValue &&
          s.language === result.language
      );

      const prevBest = existing?.wpm ?? 0;
      const isNewRecord =
        result.wpm > prevBest && !result.antiCheat.suspicious;

      if (isNewRecord || !existing) {
        const newScore: LocalHighScore = {
          mode: result.mode,
          modeValue: result.modeValue,
          language: result.language,
          wpm: result.wpm,
          accuracy: result.accuracy,
          timestamp: result.timestamp,
        };

        const filtered = scores.filter(
          (s) =>
            !(
              s.mode === result.mode &&
              s.modeValue === result.modeValue &&
              s.language === result.language
            )
        );

        const updated = [newScore, ...filtered].slice(0, MAX_HIGH_SCORES);
        safeSet(KEYS.HIGH_SCORES, updated);
      }

      return { isNewRecord, prevBest };
    },
    []
  );

  // ── Adaptive Key Stats ─────────────────────────────────
  const loadAdaptiveStats = useCallback((): AdaptiveKeyStats => {
    return safeGet<AdaptiveKeyStats>(KEYS.ADAPTIVE_STATS, {});
  }, []);

  const saveAdaptiveStats = useCallback((stats: AdaptiveKeyStats): void => {
    safeSet(KEYS.ADAPTIVE_STATS, stats);
  }, []);

  return {
    loadSettings,
    saveSettings,
    loadSession,
    saveSession,
    loadHistory,
    saveResult,
    clearHistory,
    loadHighScores,
    checkAndSaveHighScore,
    loadAdaptiveStats,
    saveAdaptiveStats,
  };
}
