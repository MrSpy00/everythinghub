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
  easy: { minMs: 600, maxMs: 8000 },
  hard: { minMs: 350, maxMs: 14000 },
  brutal: { minMs: 200, maxMs: 20000 },
};

export function generateTargetTime(
  seed: number,
  roundIndex: number,
  difficulty: "easy" | "hard" | "brutal"
): number {
  const cfg = TIME_CONFIGS[difficulty];
  const roundSeed = (seed ^ ((roundIndex + 1) * 0x7feb352d) ^ 0xa431be45) >>> 0;
  let s = roundSeed;
  const rng = () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
  
  // Alternate between micro-pulses, medium holds, and endurance holds across rounds
  const BUCKETS = [
    { min: Math.max(cfg.minMs, 250), max: 1200 },
    { min: 1400, max: 3800 },
    { min: 4000, max: 8500 },
    { min: 8800, max: Math.min(cfg.maxMs, 18000) },
  ];

  const bucketIndex = (roundIndex + Math.floor(seed % 4)) % BUCKETS.length;
  const bucket = BUCKETS[bucketIndex];

  const pseudo = rng();
  const rawTarget = Math.round(bucket.min + pseudo * (bucket.max - bucket.min));
  // Round to clean 10ms or 50ms steps for pleasant target display
  return Math.round(rawTarget / 10) * 10;
}

// ─── Format helpers ───────────────────────────────────────────────────────────
export function formatMs(ms: number): string {
  const rounded = Math.round(ms);
  if (rounded < 1000) return `${rounded}ms`;
  const s = (rounded / 1000).toFixed(2);
  return `${s}s`;
}
