"use client";
// ============================================================
// aegisTyping — Local Storage Engine (Type-safe)
// ============================================================
import { useCallback, useRef } from "react";
import type {
  AegisTypingSettings,
  TestResult,
  LocalHighScore,
  AdaptiveKeyStats,
  TestMode,
} from "../types";
import { DEFAULT_SETTINGS } from "../types";

const KEYS = {
  SETTINGS: "aegisTyping_settings",
  HISTORY: "aegisTyping_history",
  HIGH_SCORES: "aegisTyping_highscores",
  ADAPTIVE_STATS: "aegisTyping_adaptive",
  NICKNAME: "aegisTyping_nickname",
  ONBOARDING_DONE: "aegisTyping_onboarding",
} as const;

const MAX_HISTORY_ENTRIES = 100;
const MAX_HIGH_SCORES = 50;

// ─── Safe JSON parse ──────────────────────────────────────
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

// ─── Hook ─────────────────────────────────────────────────
export function useLocalStorage() {
  // ── Settings ──────────────────────────────────────────
  const loadSettings = useCallback((): AegisTypingSettings => {
    const stored = safeGet<Partial<AegisTypingSettings>>(KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...stored };
  }, []);

  const saveSettings = useCallback((settings: AegisTypingSettings): void => {
    safeSet(KEYS.SETTINGS, settings);
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
      const key = `${result.mode}_${result.modeValue}_${result.language}`;

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

  const getHighScoreForMode = useCallback(
    (mode: TestMode, modeValue: number | string, language: string): number => {
      const scores = safeGet<LocalHighScore[]>(KEYS.HIGH_SCORES, []);
      const score = scores.find(
        (s) =>
          s.mode === mode &&
          s.modeValue === modeValue &&
          s.language === language
      );
      return score?.wpm ?? 0;
    },
    []
  );

  // ── Adaptive Stats ────────────────────────────────────
  const loadAdaptiveStats = useCallback((): AdaptiveKeyStats => {
    return safeGet<AdaptiveKeyStats>(KEYS.ADAPTIVE_STATS, {});
  }, []);

  const updateAdaptiveStats = useCallback(
    (key: string, wasError: boolean, delta: number): void => {
      const stats = safeGet<AdaptiveKeyStats>(KEYS.ADAPTIVE_STATS, {});
      const existing = stats[key] ?? { attempts: 0, errors: 0, avgDelta: 0 };
      const attempts = existing.attempts + 1;
      const errors = existing.errors + (wasError ? 1 : 0);
      const avgDelta =
        (existing.avgDelta * existing.attempts + delta) / attempts;
      stats[key] = { attempts, errors, avgDelta };
      safeSet(KEYS.ADAPTIVE_STATS, stats);
    },
    []
  );

  const resetAdaptiveStats = useCallback((): void => {
    safeSet(KEYS.ADAPTIVE_STATS, {});
  }, []);

  // ── Nickname ──────────────────────────────────────────
  const loadNickname = useCallback((): string => {
    return safeGet<string>(KEYS.NICKNAME, "Anonim");
  }, []);

  const saveNickname = useCallback((name: string): void => {
    safeSet(KEYS.NICKNAME, name.slice(0, 20));
  }, []);

  // ── Onboarding ────────────────────────────────────────
  const isOnboardingDone = useCallback((): boolean => {
    return safeGet<boolean>(KEYS.ONBOARDING_DONE, false);
  }, []);

  const markOnboardingDone = useCallback((): void => {
    safeSet(KEYS.ONBOARDING_DONE, true);
  }, []);

  // ── Stats Summary ─────────────────────────────────────
  const getStatsSummary = useCallback(() => {
    const history = safeGet<TestResult[]>(KEYS.HISTORY, []);
    if (history.length === 0) {
      return { tests: 0, avgWpm: 0, bestWpm: 0, avgAccuracy: 0, totalTime: 0 };
    }
    const tests = history.length;
    const avgWpm = Math.round(
      history.reduce((sum, r) => sum + r.wpm, 0) / tests
    );
    const bestWpm = Math.max(...history.map((r) => r.wpm));
    const avgAccuracy =
      Math.round(
        (history.reduce((sum, r) => sum + r.accuracy, 0) / tests) * 10
      ) / 10;
    const totalTime = Math.round(
      history.reduce((sum, r) => sum + r.duration, 0)
    );
    return { tests, avgWpm, bestWpm, avgAccuracy, totalTime };
  }, []);

  return {
    loadSettings,
    saveSettings,
    loadHistory,
    saveResult,
    clearHistory,
    loadHighScores,
    checkAndSaveHighScore,
    getHighScoreForMode,
    loadAdaptiveStats,
    updateAdaptiveStats,
    resetAdaptiveStats,
    loadNickname,
    saveNickname,
    isOnboardingDone,
    markOnboardingDone,
    getStatsSummary,
  };
}
