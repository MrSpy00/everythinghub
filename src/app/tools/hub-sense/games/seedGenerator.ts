/**
 * HubSense — Deterministic Seed Generator
 * Generates reproducible game seeds from date (for Daily challenges)
 * or from random (for Solo play).
 *
 * Daily: All players worldwide see the same stimuli.
 * Solo: Fresh randomness each game.
 */

// ─── Date-based seed (Daily Challenge) ───────────────────────────────────────
export function getDailySeed(date?: Date): number {
  const d = date ?? new Date();
  // Use UTC date to normalize across timezones
  const utcDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  // Simple DJB2-like hash of the date string
  let hash = 5381;
  for (let i = 0; i < utcDate.length; i++) {
    hash = ((hash << 5) + hash + utcDate.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ─── Random seed (Solo play) ─────────────────────────────────────────────────
export function getRandomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

// ─── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
export function createRNG(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Daily Date Helpers ───────────────────────────────────────────────────────
export function getTodayUTCString(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function getNextUTCMidnight(): Date {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return nextMidnight;
}

export function getMsUntilNextUTCMidnight(): number {
  return getNextUTCMidnight().getTime() - Date.now();
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Round Configs ────────────────────────────────────────────────────────────
export const ROUNDS_COUNT = 5;
export const MAX_SCORE_PER_ROUND = 10;
export const MAX_TOTAL_SCORE = ROUNDS_COUNT * MAX_SCORE_PER_ROUND; // 50

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
}

export function createGameSession(
  gameType: GameType,
  difficulty: DifficultyType,
  mode: ModeType
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
  };
}
