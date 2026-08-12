/**
 * HubSense — Time Scoring Engine
 * Players hold a button to match a target duration.
 * Scoring: exponential decay based on relative error.
 */

export interface TimeScoreResult {
  score: number; // 0-10
  targetMs: number;
  guessMs: number;
  absoluteErrorMs: number;
  relativeError: number; // 0-1
  percentAccuracy: number;
  earlyOrLate: "early" | "late" | "perfect";
}

export function scoreTime(targetMs: number, guessMs: number): TimeScoreResult {
  const absoluteErrorMs = Math.abs(targetMs - guessMs);
  const relativeError = absoluteErrorMs / targetMs;

  // Exponential decay: perfect = 10, 50% off = ~3.2, 100%+ off = ~0
  const raw = Math.exp(-relativeError * 2.3);
  const score = parseFloat((Math.min(10, raw * 10)).toFixed(2));
  const percentAccuracy = parseFloat(((score / 10) * 100).toFixed(1));

  const earlyOrLate: "early" | "late" | "perfect" =
    absoluteErrorMs < 50 ? "perfect" : guessMs < targetMs ? "early" : "late";

  return {
    score,
    targetMs,
    guessMs,
    absoluteErrorMs: Math.round(absoluteErrorMs),
    relativeError: parseFloat(relativeError.toFixed(3)),
    percentAccuracy,
    earlyOrLate,
  };
}

// ─── Time Generation ──────────────────────────────────────────────────────────
export const TIME_CONFIGS = {
  easy: { minMs: 1500, maxMs: 6000 },
  hard: { minMs: 1000, maxMs: 8000 },
  brutal: { minMs: 500, maxMs: 10000 },
};

export function generateTargetTime(
  seed: number,
  roundIndex: number,
  difficulty: "easy" | "hard" | "brutal"
): number {
  const cfg = TIME_CONFIGS[difficulty];
  const pseudo = (Math.sin(seed * 12345 + roundIndex * 67891 + 11111) * 0.5 + 0.5);
  return Math.round(cfg.minMs + pseudo * (cfg.maxMs - cfg.minMs));
}

// ─── Format helpers ───────────────────────────────────────────────────────────
export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = (ms / 1000).toFixed(2);
  return `${s}s`;
}
