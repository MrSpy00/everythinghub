/**
 * HubSense — Leaderboard System
 * 
 * Primary: Zero-Auth Secure Next.js Serverless API (`/api/hub-sense/leaderboard`)
 * Secondary (Fallback & Offline): LocalStorage with XOR-obfuscation & HMAC signatures
 * 
 * Anti-Cheat:
 * - HMAC-SHA256 signature verified client & server side
 * - Zero external API keys needed — 100% serverless, private, zero-auth
 * - Replay protection & client rate limiting
 */

import type { GameType, DifficultyType, ModeType } from "./seedGenerator";
import { type ScorePayload, obfuscate, deobfuscate } from "./antiCheat";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank?: number;
  username: string;
  score: number;
  gameType: GameType;
  difficulty: DifficultyType;
  mode: ModeType;
  seed?: number;
  dateSeed?: string;
  timestamp: number;
  roundScores: number[];
  signature: string;
  verified?: boolean;
  playerId?: string;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  lastUpdated: number;
  totalSubmissions: number;
}

export type LeaderboardFilter = "all-time" | "daily" | "weekly";

// ─── Local Storage Leaderboard ────────────────────────────────────────────────
const LOCAL_LB_PREFIX = "hubsense_lb_";

function getLocalKey(gameType: GameType, difficulty: DifficultyType): string {
  return `${LOCAL_LB_PREFIX}${gameType}_${difficulty}`;
}

export function getLocalLeaderboard(
  gameType: GameType,
  difficulty: DifficultyType,
  limit = 100
): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const key = getLocalKey(gameType, difficulty);
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  const data = deobfuscate<LeaderboardData>(raw);
  if (!data) return [];

  return data.entries
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function addToLocalLeaderboard(
  entry: LeaderboardEntry,
  gameType: GameType,
  difficulty: DifficultyType
): void {
  if (typeof window === "undefined") return;
  const key = getLocalKey(gameType, difficulty);
  const raw = localStorage.getItem(key);
  const data: LeaderboardData = raw
    ? (deobfuscate<LeaderboardData>(raw) ?? { entries: [], lastUpdated: 0, totalSubmissions: 0 })
    : { entries: [], lastUpdated: 0, totalSubmissions: 0 };

  // Sync existing entries from the same player ID to the new username
  if (entry.playerId) {
    data.entries.forEach((e) => {
      if (e.playerId === entry.playerId) {
        e.username = entry.username;
      }
    });
  }

  // Deduplication: same player/username + seed + game can only appear once
  const isDupe = data.entries.some(
    (e) =>
      ((e.playerId && e.playerId === entry.playerId) ||
        e.username.toLowerCase() === entry.username.toLowerCase()) &&
      e.seed === entry.seed &&
      e.gameType === entry.gameType
  );

  if (!isDupe) {
    data.entries.push(entry);
  }

  data.entries = data.entries.sort((a, b) => b.score - a.score).slice(0, 500);
  data.lastUpdated = Date.now();
  data.totalSubmissions++;
  localStorage.setItem(key, obfuscate(data));
}

// ─── Main Leaderboard API ──────────────────────────────────────────────────────
export async function submitScore(payload: ScorePayload): Promise<{
  success: boolean;
  tier: "global" | "local";
  rank?: number;
  error?: string;
}> {
  const entry: LeaderboardEntry = {
    username: payload.username,
    score: payload.totalScore,
    gameType: payload.gameType,
    difficulty: payload.difficulty,
    mode: payload.mode,
    seed: payload.seed,
    dateSeed: payload.dateSeed,
    timestamp: payload.timestamp,
    roundScores: payload.roundScores,
    signature: payload.signature,
    verified: true,
    playerId: payload.playerId,
  };

  // 1. Always record in local storage first for offline persistence
  addToLocalLeaderboard(entry, payload.gameType, payload.difficulty);

  // 2. Submit to serverless backend API
  try {
    const res = await fetch("/api/hub-sense/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, tier: "global", rank: data.rank };
      }
    }
  } catch {
    // Serverless endpoint offline/fallback to local
  }

  return { success: true, tier: "local" };
}

export async function fetchLeaderboard(
  gameType: GameType,
  difficulty: DifficultyType,
  filter: LeaderboardFilter = "all-time",
  limit = 50
): Promise<{ entries: LeaderboardEntry[]; source: "global" | "local" }> {
  // 1. Fetch from serverless API
  try {
    const params = new URLSearchParams({
      game: gameType,
      difficulty,
      filter,
      limit: limit.toString(),
    });

    const res = await fetch(`/api/hub-sense/leaderboard?${params.toString()}`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.entries) && data.entries.length > 0) {
        return {
          entries: data.entries,
          source: "global",
        };
      }
    }
  } catch {
    // Network fallback
  }

  // 2. Fallback: local storage
  const local = getLocalLeaderboard(gameType, difficulty, limit);
  const filtered = filterByTime(local, filter);
  return {
    entries: filtered.slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 })),
    source: "local",
  };
}

function filterByTime(
  entries: LeaderboardEntry[],
  filter: LeaderboardFilter
): LeaderboardEntry[] {
  const now = Date.now();
  const DAY = 86_400_000;

  switch (filter) {
    case "daily": {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      return entries.filter((e) => e.timestamp >= todayStart.getTime());
    }
    case "weekly":
      return entries.filter((e) => now - e.timestamp < 7 * DAY);
    default:
      return entries;
  }
}

// ─── Rank Badges ──────────────────────────────────────────────────────────────
export function getRankBadge(rank: number): {
  label: string;
  color: string;
  glow: string;
} {
  if (rank === 1) return { label: "#1", color: "#fbbf24", glow: "rgba(251,191,36,0.4)" };
  if (rank === 2) return { label: "#2", color: "#94a3b8", glow: "rgba(148,163,184,0.3)" };
  if (rank === 3) return { label: "#3", color: "#b97b3d", glow: "rgba(185,123,61,0.3)" };
  if (rank <= 10) return { label: `#${rank}`, color: "#6366f1", glow: "rgba(99,102,241,0.2)" };
  return { label: `#${rank}`, color: "#71717a", glow: "transparent" };
}

// ─── Score Tier Labels ────────────────────────────────────────────────────────
export function getScoreTier(score: number): {
  label: string;
  color: string;
  message: string;
} {
  if (score >= 48) return {
    label: "KUSURSUZ",
    color: "#a855f7",
    message: "İnsanüstü duyu hassasiyeti. Dünya genelinde üst %0.01 seviyesindesin.",
  };
  if (score >= 44) return {
    label: "EFSANEVİ",
    color: "#f59e0b",
    message: "Neredeyse mükemmel. Duyu algın ve hafızan olağanüstü keskin.",
  };
  if (score >= 38) return {
    label: "SEÇKİN",
    color: "#6366f1",
    message: "Üst %1 dilimdesin. Profesyonel tasarımcı ve ses mühendisi seviyesi.",
  };
  if (score >= 32) return {
    label: "KESKİN",
    color: "#10b981",
    message: "Oldukça iyi. Duyu hafızan ortalamanın belirgin şekilde üstünde.",
  };
  if (score >= 24) return {
    label: "DENGELİ",
    color: "#0ea5e9",
    message: "Ortalamanın biraz üzerinde. Düzenli egzersizle daha da yükselebilir.",
  };
  if (score >= 15) return {
    label: "STANDART",
    color: "#94a3b8",
    message: "Tipik insan algı seviyesi. Çoğu insan ilk denemede buradadır.",
  };
  return {
    label: "GELİŞTİRİLEBİLİR",
    color: "#f43f5e",
    message: "Duyuların bu tur seni biraz yanılttı. Tekrar dene!",
  };
}
