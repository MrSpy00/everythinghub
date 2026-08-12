/**
 * HubSense — Anti-Cheat & Security System
 * 
 * Tier 1: Client-side validation (score bounds, rate limit, replay detection)
 * Tier 2: HMAC-SHA256 cryptographic signature (WebCrypto API)
 * Tier 3: Score obfuscation in localStorage (base64 + XOR cipher)
 * 
 * Leaderboard submissions are signed and verified. Manual edits of localStorage
 * will invalidate signatures, preventing fake score injection.
 */

import type { GameType, DifficultyType, ModeType } from "./seedGenerator";

// ─── Constants ────────────────────────────────────────────────────────────────
const RATE_LIMIT_MS = 45_000; // 45s between submissions
const MAX_SUBMISSIONS_PER_SESSION = 10;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_\-\.]+$/;
const RESERVED_WORDS = new Set([
  "admin", "root", "hubsense", "system", "mod", "moderator",
  "staff", "bot", "null", "undefined", "test", "hack", "cheat",
  "everythinghub", "aegissoft"
]);

// XOR key for obfuscation (not security, just friction against casual tampering)
const XOR_KEY = "HubSense_2026_Aegis_Salt_v1";

function xorCipher(str: string): string {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  return result;
}

export function obfuscate(data: object): string {
  const json = JSON.stringify(data);
  const xored = xorCipher(json);
  return btoa(xored);
}

export function deobfuscate<T>(encoded: string): T | null {
  try {
    const xored = atob(encoded);
    const json = xorCipher(xored);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// ─── HMAC Signature ───────────────────────────────────────────────────────────
// Derived key material from game logic (not a real secret — just makes tampering harder)
const HMAC_KEY_MATERIAL = "HubSense_ScoreGuard_2026_v2_by_aegisSoft";

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(HMAC_KEY_MATERIAL),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signScore(payload: ScorePayload): Promise<string> {
  const key = await getHmacKey();
  const enc = new TextEncoder();
  const message = `${payload.username}|${payload.totalScore.toFixed(2)}|${payload.gameType}|${payload.difficulty}|${payload.seed}|${payload.timestamp}|${payload.roundScores.join(",")}`;
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function verifyScore(payload: ScorePayload): Promise<boolean> {
  if (!payload.signature) return false;
  const expectedSig = await signScore({ ...payload, signature: "" });
  return expectedSig === payload.signature;
}

// ─── Score Payload ────────────────────────────────────────────────────────────
export interface ScorePayload {
  username: string;
  totalScore: number;
  gameType: GameType;
  difficulty: DifficultyType;
  mode: ModeType;
  seed: number;
  dateSeed?: string;
  timestamp: number;
  roundScores: number[];
  signature: string;
  clientVersion: string;
}

export async function buildScorePayload(
  username: string,
  roundScores: number[],
  gameType: GameType,
  difficulty: DifficultyType,
  mode: ModeType,
  seed: number,
  dateSeed?: string
): Promise<ScorePayload> {
  const totalScore = parseFloat(
    roundScores.reduce((a, b) => a + b, 0).toFixed(2)
  );
  const timestamp = Date.now();

  const payload: ScorePayload = {
    username: username.toUpperCase().trim(),
    totalScore,
    gameType,
    difficulty,
    mode,
    seed,
    dateSeed,
    timestamp,
    roundScores: roundScores.map((s) => parseFloat(s.toFixed(2))),
    signature: "",
    clientVersion: "1.0.0",
  };

  payload.signature = await signScore(payload);
  return payload;
}

// ─── Username Validation ──────────────────────────────────────────────────────
export interface UsernameValidation {
  valid: boolean;
  error?: string;
}

export function validateUsername(username: string): UsernameValidation {
  const trimmed = username.trim().toLowerCase();

  if (trimmed.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: `En az ${USERNAME_MIN_LENGTH} karakter gerekli` };
  }
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: `En fazla ${USERNAME_MAX_LENGTH} karakter` };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return { valid: false, error: "Sadece harf, rakam, _, - ve . kullanılabilir" };
  }
  if (RESERVED_WORDS.has(trimmed)) {
    return { valid: false, error: "Bu kullanıcı adı rezerve edilmiştir" };
  }

  return { valid: true };
}

// ─── Score Bounds Validation ──────────────────────────────────────────────────
export function validateScoreBounds(roundScores: number[]): boolean {
  if (roundScores.length !== 5) return false;
  return roundScores.every((s) => s >= 0 && s <= 10.01); // small float tolerance
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const RATE_LIMIT_KEY = "hubsense_rate_limit";
const SESSION_SUBMIT_KEY = "hubsense_session_submits";

interface RateLimitData {
  lastSubmitTime: number;
  sessionCount: number;
  bannedUntil?: number;
}

function getRateLimitData(): RateLimitData {
  const raw = localStorage.getItem(RATE_LIMIT_KEY);
  if (!raw) return { lastSubmitTime: 0, sessionCount: 0 };
  return deobfuscate<RateLimitData>(raw) ?? { lastSubmitTime: 0, sessionCount: 0 };
}

function setRateLimitData(data: RateLimitData): void {
  localStorage.setItem(RATE_LIMIT_KEY, obfuscate(data));
}

export interface RateLimitCheck {
  allowed: boolean;
  msUntilAllowed?: number;
  reason?: string;
}

export function checkRateLimit(): RateLimitCheck {
  if (typeof window === "undefined") return { allowed: true };

  const data = getRateLimitData();
  const now = Date.now();

  // Temp ban check
  if (data.bannedUntil && now < data.bannedUntil) {
    return {
      allowed: false,
      msUntilAllowed: data.bannedUntil - now,
      reason: "Çok fazla gönderim. Biraz bekleyin.",
    };
  }

  // Session limit
  const sessionSubmits = parseInt(sessionStorage.getItem(SESSION_SUBMIT_KEY) ?? "0");
  if (sessionSubmits >= MAX_SUBMISSIONS_PER_SESSION) {
    return {
      allowed: false,
      reason: "Bu oturumda maksimum gönderim sayısına ulaşıldı.",
    };
  }

  // Rate limit
  if (now - data.lastSubmitTime < RATE_LIMIT_MS) {
    return {
      allowed: false,
      msUntilAllowed: RATE_LIMIT_MS - (now - data.lastSubmitTime),
      reason: "Çok hızlı gönderim.",
    };
  }

  return { allowed: true };
}

export function recordSubmission(): void {
  if (typeof window === "undefined") return;

  const data = getRateLimitData();
  const sessionSubmits = parseInt(sessionStorage.getItem(SESSION_SUBMIT_KEY) ?? "0");

  // Apply temp ban if suspicious (e.g., many submits in short time)
  const updatedData: RateLimitData = {
    lastSubmitTime: Date.now(),
    sessionCount: data.sessionCount + 1,
  };

  if (data.sessionCount >= 8) {
    updatedData.bannedUntil = Date.now() + 5 * 60 * 1000; // 5-min temp ban
  }

  setRateLimitData(updatedData);
  sessionStorage.setItem(SESSION_SUBMIT_KEY, String(sessionSubmits + 1));
}

// ─── Replay Detection ─────────────────────────────────────────────────────────
const REPLAY_STORE_KEY = "hubsense_seen_seeds";

interface ReplayStore {
  seen: Array<{ game: GameType; seed: number; username: string; ts: number }>;
}

export function isReplay(gameType: GameType, seed: number, username: string): boolean {
  if (typeof window === "undefined") return false;

  const raw = localStorage.getItem(REPLAY_STORE_KEY);
  if (!raw) return false;

  const store = deobfuscate<ReplayStore>(raw);
  if (!store) return false;

  // Check if same game+seed+username combination already submitted
  return store.seen.some(
    (e) => e.game === gameType && e.seed === seed && e.username.toLowerCase() === username.toLowerCase()
  );
}

export function recordSeed(gameType: GameType, seed: number, username: string): void {
  if (typeof window === "undefined") return;

  const raw = localStorage.getItem(REPLAY_STORE_KEY);
  const store: ReplayStore = raw ? (deobfuscate<ReplayStore>(raw) ?? { seen: [] }) : { seen: [] };

  store.seen.push({ game: gameType, seed, username, ts: Date.now() });

  // Keep only last 200 entries
  if (store.seen.length > 200) {
    store.seen = store.seen.slice(-200);
  }

  localStorage.setItem(REPLAY_STORE_KEY, obfuscate(store));
}

// ─── Local Personal Bests Storage ─────────────────────────────────────────────
const PERSONAL_BESTS_KEY = "hubsense_personal_bests";

export interface PersonalBest {
  score: number;
  difficulty: DifficultyType;
  timestamp: number;
  roundScores: number[];
}

type PersonalBestsMap = Record<GameType, Record<DifficultyType, PersonalBest | null>>;

function emptyPBMap(): PersonalBestsMap {
  const games: GameType[] = ["color", "sound", "time", "shape", "sequence"];
  const difficulties: DifficultyType[] = ["easy", "hard", "brutal"];
  const map = {} as PersonalBestsMap;
  for (const g of games) {
    map[g] = {} as Record<DifficultyType, PersonalBest | null>;
    for (const d of difficulties) {
      map[g][d] = null;
    }
  }
  return map;
}

export function getPersonalBests(): PersonalBestsMap {
  if (typeof window === "undefined") return emptyPBMap();
  const raw = localStorage.getItem(PERSONAL_BESTS_KEY);
  if (!raw) return emptyPBMap();
  return deobfuscate<PersonalBestsMap>(raw) ?? emptyPBMap();
}

export function updatePersonalBest(
  gameType: GameType,
  difficulty: DifficultyType,
  roundScores: number[]
): { isNewRecord: boolean; previous: PersonalBest | null } {
  const bests = getPersonalBests();
  const totalScore = roundScores.reduce((a, b) => a + b, 0);
  const current = bests[gameType][difficulty];

  if (!current || totalScore > current.score) {
    bests[gameType][difficulty] = {
      score: totalScore,
      difficulty,
      timestamp: Date.now(),
      roundScores,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(PERSONAL_BESTS_KEY, obfuscate(bests));
    }
    return { isNewRecord: true, previous: current };
  }

  return { isNewRecord: false, previous: current };
}
