// ============================================================
// aegisTyping — Stats Calculator
// ============================================================
import type { KeystrokeRecord, TestResult, TestMode, Funbox, AntiCheatReport } from "../types";

// ─── Net WPM ───────────────────────────────────────────────
// Standard: (correct chars / 5 - uncorrected errors) / minutes
export function calcNetWpm(
  correctChars: number,
  uncorrectedErrors: number,
  durationSeconds: number
): number {
  if (durationSeconds === 0) return 0;
  const minutes = durationSeconds / 60;
  const wpm = (correctChars / 5 - uncorrectedErrors) / minutes;
  return Math.max(0, Math.round(wpm * 10) / 10);
}

// ─── Raw WPM ───────────────────────────────────────────────
// All typed chars (including errors) / 5 / minutes
export function calcRawWpm(
  totalTypedChars: number,
  durationSeconds: number
): number {
  if (durationSeconds === 0) return 0;
  const minutes = durationSeconds / 60;
  return Math.max(0, Math.round((totalTypedChars / 5 / minutes) * 10) / 10);
}

// ─── Accuracy ──────────────────────────────────────────────
export function calcAccuracy(
  correctChars: number,
  totalTypedChars: number
): number {
  if (totalTypedChars === 0) return 100;
  return Math.round((correctChars / totalTypedChars) * 1000) / 10;
}

// ─── CPM ───────────────────────────────────────────────────
export function calcCpm(
  correctChars: number,
  durationSeconds: number
): number {
  if (durationSeconds === 0) return 0;
  const minutes = durationSeconds / 60;
  return Math.round(correctChars / minutes);
}

// ─── Consistency ───────────────────────────────────────────
// Based on per-second WPM standard deviation vs mean
// Returns 0–100 (100 = perfectly consistent)
export function calcConsistency(wpmTimeline: number[]): number {
  if (wpmTimeline.length < 2) return 100;

  const valid = wpmTimeline.filter((v) => v > 0);
  if (valid.length < 2) return 100;

  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  if (mean === 0) return 100;

  const variance =
    valid.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / valid.length;
  const stddev = Math.sqrt(variance);
  const cv = stddev / mean; // coefficient of variation

  const consistency = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  return consistency;
}

// ─── Per-Second WPM Timeline ───────────────────────────────
export function buildWpmTimeline(
  keystrokes: KeystrokeRecord[],
  startTimestamp: number,
  durationSeconds: number
): number[] {
  const timeline: number[] = [];
  const totalSeconds = Math.ceil(durationSeconds);

  for (let sec = 1; sec <= totalSeconds; sec++) {
    const windowStart = startTimestamp + (sec - 1) * 1000;
    const windowEnd = startTimestamp + sec * 1000;

    const correctInWindow = keystrokes.filter(
      (k) =>
        k.timestamp >= windowStart &&
        k.timestamp < windowEnd &&
        k.correct
    ).length;

    // Convert correct chars in this second to WPM
    const wpm = Math.round((correctInWindow / 5) * 60);
    timeline.push(wpm);
  }

  return timeline;
}

// ─── Error Positions ──────────────────────────────────────
export function extractErrorPositions(
  keystrokes: KeystrokeRecord[]
): number[] {
  return keystrokes
    .filter((k) => !k.correct)
    .map((_, i) => i);
}

// ─── Generate Test ID ──────────────────────────────────────
// Simple nanoid-like without external deps
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Assemble Final Test Result ───────────────────────────
export function assembleTestResult(params: {
  correctChars: number;
  totalTypedChars: number;
  uncorrectedErrors: number;
  totalErrors: number;
  keystrokes: KeystrokeRecord[];
  startTimestamp: number;
  durationSeconds: number;
  mode: TestMode;
  modeValue: number | string;
  language: string;
  funbox: Funbox;
  antiCheat: AntiCheatReport;
  wpmTimeline: number[];
  nickname: string;
}): Omit<TestResult, "hash"> {
  const {
    correctChars,
    totalTypedChars,
    uncorrectedErrors,
    totalErrors,
    keystrokes,
    durationSeconds,
    mode,
    modeValue,
    language,
    funbox,
    antiCheat,
    wpmTimeline,
    nickname,
  } = params;

  return {
    id: generateId(),
    wpm: calcNetWpm(correctChars, uncorrectedErrors, durationSeconds),
    rawWpm: calcRawWpm(totalTypedChars, durationSeconds),
    accuracy: calcAccuracy(correctChars, totalTypedChars),
    consistency: calcConsistency(wpmTimeline),
    errors: totalErrors,
    cpm: calcCpm(correctChars, durationSeconds),
    keystrokes: keystrokes.length,
    duration: Math.round(durationSeconds * 10) / 10,
    mode,
    modeValue,
    language,
    funbox,
    timestamp: Date.now(),
    antiCheat,
    wpmTimeline,
    errorPositions: extractErrorPositions(keystrokes),
    nickname,
  };
}

// ─── Smooth WPM (rolling 5-word average) ──────────────────
export function smoothWpm(
  correctCharsTyped: number,
  durationSeconds: number,
  smoothWindowMs = 5000
): number {
  if (durationSeconds === 0) return 0;
  // Use actual elapsed time capped to smooth window
  const effectiveDuration = Math.min(durationSeconds, smoothWindowMs / 1000);
  const minutes = effectiveDuration / 60;
  if (minutes === 0) return 0;
  return Math.max(0, Math.round(correctCharsTyped / 5 / minutes));
}

// ─── Live WPM (full elapsed) ───────────────────────────────
export function liveNetWpm(
  correctChars: number,
  uncorrectedErrors: number,
  elapsedSeconds: number
): number {
  return calcNetWpm(correctChars, uncorrectedErrors, elapsedSeconds);
}

// ─── Format WPM for Display ───────────────────────────────
export function formatWpm(wpm: number): string {
  return Math.round(wpm).toString();
}

// ─── Format Accuracy for Display ──────────────────────────
export function formatAccuracy(acc: number): string {
  return acc.toFixed(1) + "%";
}

// ─── Lerp for Smooth UI Updates ───────────────────────────
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
