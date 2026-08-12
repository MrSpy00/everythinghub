/**
 * HubSense — High-Entropy Deterministic Seed & Session Engine
 * Uses SplitMix32 / Mulberry32 with Weyl sequence hashing for maximum entropy,
 * zero clustering, and uniform distribution across all 5 perception disciplines.
 */

// ─── High-Entropy SplitMix32 PRNG ─────────────────────────────────────────────
export function createRNG(seed: number) {
  let s = (seed ^ 0x6d2b79f5) >>> 0;
  return (): number => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
}

export function getRoundEntropy(seed: number, roundIndex: number, offset = 0): number {
  const rng = createRNG((seed ^ ((roundIndex + 1) * 0x85ebca6b) ^ (offset * 0xc2b2ae35)) >>> 0);
  return rng();
}

// ─── Date-based seed (Daily Challenge) ───────────────────────────────────────
export function getDailySeed(date?: Date): number {
  const d = date ?? new Date();
  const utcDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  let hash = 5381;
  for (let i = 0; i < utcDate.length; i++) {
    hash = ((hash << 5) + hash + utcDate.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ─── Random seed (Solo play) ─────────────────────────────────────────────────
export function getRandomSeed(): number {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0];
  }
  return Math.floor(Math.random() * 0xffffffff);
}

// ─── Daily Date Helpers ───────────────────────────────────────────────────────
export function getTodayUTCString(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function getNextUTCMidnight(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
}

export function getMsUntilNextUTCMidnight(): number {
  return getNextUTCMidnight().getTime() - Date.now();
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Round Configs ────────────────────────────────────────────────────────────
export const DEFAULT_ROUNDS_COUNT = 5;
export const ROUND_OPTIONS = [3, 5, 10] as const;
export const MAX_SCORE_PER_ROUND = 10;

export type GameType = "color" | "sound" | "time" | "shape" | "sequence";
export type DifficultyType = "easy" | "hard" | "brutal";
export type ModeType = "solo" | "daily" | "challenge";

export interface GameSession {
  gameType: GameType;
  difficulty: DifficultyType;
  mode: ModeType;
  seed: number;
  dateSeed?: string; // for daily
  startedAt: number;
  totalRounds: number;
}

export function createGameSession(
  gameType: GameType,
  difficulty: DifficultyType,
  mode: ModeType,
  totalRounds = DEFAULT_ROUNDS_COUNT
): GameSession {
  const isDaily = mode === "daily";
  const seed = isDaily ? getDailySeed() : getRandomSeed();
  const dateSeed = isDaily ? getTodayUTCString() : undefined;

  return {
    gameType,
    difficulty,
    mode,
    seed,
    dateSeed,
    startedAt: Date.now(),
    totalRounds: isDaily ? DEFAULT_ROUNDS_COUNT : Math.max(1, Math.min(20, totalRounds)),
  };
}
