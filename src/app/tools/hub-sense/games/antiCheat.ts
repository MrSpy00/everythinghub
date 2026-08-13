/**
 * HubSense — Anti-Cheat, Security & Content Moderation System
 * 
 * Tier 1: Multilingual Smart Profanity / Toxicity / Leetspeak Normalizer
 * Tier 2: Flexible Mixed-Case Nickname Validation (Alphanumeric, _, -, .)
 * Tier 3: Client-side validation (dynamic rounds, score bounds, rate limit, replay detection)
 * Tier 4: HMAC-SHA256 cryptographic signature (WebCrypto API)
 * Tier 5: Score obfuscation in localStorage (base64 + XOR cipher)
 */

import type { GameType, DifficultyType, ModeType } from "./seedGenerator";

// ─── Constants ────────────────────────────────────────────────────────────────
const RATE_LIMIT_MS = 25_000; // 25s between submissions
const MAX_SUBMISSIONS_PER_SESSION = 15;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_\-\.]+$/;

const RESERVED_WORDS = new Set([
  "admin", "root", "hubsense", "system", "mod", "moderator",
  "staff", "bot", "null", "undefined", "test", "hack", "cheat",
  "everythinghub", "aegissoft"
]);

// ─── Smart Multilingual Toxicity & Profanity Filter ───────────────────────────
const BANNED_PATTERNS = [
  // Turkish profanities & slurs
  "orospu", "pic", "sik", "yarrak", "amk", "aq", "got", "ibne", "pezevenk",
  "kahpe", "kancik", "yarram", "siktir", "dalyarak", "amcik", "tasak",
  "gavat", "bok", "gotlek", "pust", "fahise", "oc", "sokuk", "yarrag",
  // English profanities & slurs
  "fuck", "shit", "bitch", "cunt", "asshole", "dick", "pussy", "nigger",
  "nigga", "faggot", "bastard", "cock", "slut", "whore", "nazi", "hitler",
  "retard", "fck", "b1tch", "d1ck", "cnt", "penis", "vagina", "porn"
];

function normalizeLeetspeak(input: string): string {
  let str = input.toLowerCase();

  // Character translations
  const charMap: Record<string, string> = {
    "@": "a",
    "4": "a",
    "8": "b",
    "3": "e",
    "€": "e",
    "1": "i",
    "!": "i",
    "|": "i",
    "0": "o",
    "5": "s",
    "$": "s",
    "7": "t",
    "+": "t",
    "9": "g",
    "ü": "u",
    "ö": "o",
    "ı": "i",
    "ş": "s",
    "ç": "c",
    "ğ": "g",
  };

  str = str.split("").map((c) => charMap[c] || c).join("");

  // Remove non-alphanumeric separators for continuous check
  const lettersOnly = str.replace(/[^a-z0-9]/g, "");

  // Collapse consecutive identical characters (e.g., "fuuuuck" -> "fuck")
  const collapsed = lettersOnly.replace(/(.)\1+/g, "$1");

  return `${lettersOnly} ${collapsed}`;
}

export function containsProfanity(rawUsername: string): boolean {
  const normalized = normalizeLeetspeak(rawUsername);
  return BANNED_PATTERNS.some((badWord) => {
    // Exact or substring match in normalized strings
    return normalized.includes(badWord);
  });
}

// XOR key for obfuscation
const XOR_KEY = "HubSense_2026_Aegis_Salt_v2";

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
const HMAC_KEY_MATERIAL = "HubSense_ScoreGuard_2026_v3_by_aegisSoft";

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

export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "anon_device";
  let id = localStorage.getItem("hubsense_player_id");
  if (!id) {
    id = "pid_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem("hubsense_player_id", id);
  }
  return id;
}

export async function signScore(payload: ScorePayload): Promise<string> {
  const key = await getHmacKey();
  const enc = new TextEncoder();
  const pid = payload.playerId || "";
  const message = `${payload.username}|${payload.totalScore.toFixed(2)}|${payload.gameType}|${payload.difficulty}|${payload.seed}|${payload.timestamp}|${payload.roundScores.join(",")}|${pid}`;
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
  playerId?: string;
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
  const playerId = getOrCreatePlayerId();

  const payload: ScorePayload = {
    username: username.trim(),
    totalScore,
    gameType,
    difficulty,
    mode,
    seed,
    dateSeed,
    timestamp,
    roundScores: roundScores.map((s) => parseFloat(s.toFixed(2))),
    signature: "",
    clientVersion: "2.0.0",
    playerId,
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
  const trimmed = username.trim();

  if (trimmed.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: `En az ${USERNAME_MIN_LENGTH} karakter gerekli` };
  }
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: `En fazla ${USERNAME_MAX_LENGTH} karakter` };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return { valid: false, error: "Sadece harf, rakam, _, - ve . kullanılabilir" };
  }
  if (RESERVED_WORDS.has(trimmed.toLowerCase())) {
    return { valid: false, error: "Bu kullanıcı adı rezerve edilmiştir" };
  }
  if (containsProfanity(trimmed)) {
    return { valid: false, error: "Uygunsuz veya hakaret içeren rumuzlar kullanılamaz" };
  }

  return { valid: true };
}

// ─── Dynamic Score Bounds Validation (1 to 20 rounds) ──────────────────────────
export function validateScoreBounds(roundScores: number[]): boolean {
  if (roundScores.length < 1 || roundScores.length > 20) return false;
  return roundScores.every((s) => s >= 0 && s <= 10.05);
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
export interface RateLimitStatus {
  allowed: boolean;
  remainingMs?: number;
  reason?: string;
}

const SUBMISSION_TIMESTAMPS_KEY = "hubsense_submit_ts";
const LAST_SUBMIT_KEY = "hubsense_last_submit";

export function checkRateLimit(): RateLimitStatus {
  if (typeof window === "undefined") return { allowed: true };

  const now = Date.now();
  const lastSubmitStr = localStorage.getItem(LAST_SUBMIT_KEY);
  if (lastSubmitStr) {
    const lastSubmit = parseInt(lastSubmitStr, 10);
    const elapsed = now - lastSubmit;
    if (elapsed < RATE_LIMIT_MS) {
      const remainingMs = RATE_LIMIT_MS - elapsed;
      return {
        allowed: false,
        remainingMs,
        reason: `Lütfen ${Math.ceil(remainingMs / 1000)} saniye bekleyin`,
      };
    }
  }

  // Session flood check
  const rawTimestamps = sessionStorage.getItem(SUBMISSION_TIMESTAMPS_KEY);
  const timestamps: number[] = rawTimestamps ? JSON.parse(rawTimestamps) : [];
  const recent = timestamps.filter((t) => now - t < 300_000); // last 5 min

  if (recent.length >= MAX_SUBMISSIONS_PER_SESSION) {
    return {
      allowed: false,
      reason: "Oturum başına maksimum skor gönderim limitine ulaşıldı",
    };
  }

  return { allowed: true };
}

export function recordSubmission(): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  localStorage.setItem(LAST_SUBMIT_KEY, now.toString());

  const rawTimestamps = sessionStorage.getItem(SUBMISSION_TIMESTAMPS_KEY);
  const timestamps: number[] = rawTimestamps ? JSON.parse(rawTimestamps) : [];
  timestamps.push(now);
  sessionStorage.setItem(SUBMISSION_TIMESTAMPS_KEY, JSON.stringify(timestamps.slice(-20)));
}

// ─── Replay Protection ────────────────────────────────────────────────────────
const RECORDED_SEEDS_KEY = "hubsense_played_seeds";

export function recordSeed(gameType: GameType, seed: number, username: string): void {
  if (typeof window === "undefined") return;
  const key = `${RECORDED_SEEDS_KEY}_${gameType}`;
  const raw = localStorage.getItem(key);
  const seeds: string[] = raw ? JSON.parse(raw) : [];
  const entry = `${seed}_${username.trim().toLowerCase()}`;
  if (!seeds.includes(entry)) {
    seeds.push(entry);
    localStorage.setItem(key, JSON.stringify(seeds.slice(-50)));
  }
}

export function isReplay(gameType: GameType, seed: number, username: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `${RECORDED_SEEDS_KEY}_${gameType}`;
  const raw = localStorage.getItem(key);
  if (!raw) return false;
  const seeds: string[] = JSON.parse(raw);
  const entry = `${seed}_${username.trim().toLowerCase()}`;
  return seeds.includes(entry);
}

// ─── Personal Best Tracker ────────────────────────────────────────────────────
const PB_STORAGE_KEY = "hubsense_pb";

export interface PersonalBest {
  score: number;
  date: string;
  roundScores: number[];
}

export type PersonalBestStore = {
  [game in GameType]?: {
    [diff in DifficultyType]?: PersonalBest;
  };
};

export function getPersonalBests(): PersonalBestStore {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(PB_STORAGE_KEY);
  if (!raw) return {};
  return deobfuscate<PersonalBestStore>(raw) || {};
}

export function updatePersonalBest(
  gameType: GameType,
  difficulty: DifficultyType,
  roundScores: number[]
): { isNewRecord: boolean; previousBest: number } {
  if (typeof window === "undefined") return { isNewRecord: false, previousBest: 0 };

  const store = getPersonalBests();
  const current = store[gameType]?.[difficulty]?.score || 0;
  const newScore = parseFloat(
    roundScores.reduce((a, b) => a + b, 0).toFixed(2)
  );

  if (newScore > current) {
    if (!store[gameType]) store[gameType] = {};
    store[gameType]![difficulty] = {
      score: newScore,
      date: new Date().toISOString(),
      roundScores,
    };
    localStorage.setItem(PB_STORAGE_KEY, obfuscate(store));
    return { isNewRecord: true, previousBest: current };
  }

  return { isNewRecord: false, previousBest: current };
}
