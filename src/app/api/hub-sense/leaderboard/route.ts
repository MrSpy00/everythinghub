import { NextRequest, NextResponse } from "next/server";
import {
  type ScorePayload,
  validateUsername,
  validateScoreBounds,
} from "@/app/tools/hub-sense/games/antiCheat";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── In-Memory Storage & Rate Limit Cache ─────────────────────────────────────
interface StoredEntry {
  username: string;
  score: number;
  gameType: string;
  difficulty: string;
  mode: string;
  seed: number;
  dateSeed?: string;
  timestamp: number;
  roundScores: number[];
  signature: string;
  playerId?: string;
}

// Global benchmark seed entries for initial cold-start consistency
const INITIAL_BENCHMARKS: Record<string, StoredEntry[]> = {
  color_easy: [
    { username: "Aegis_Prime", score: 49.4, gameType: "color", difficulty: "easy", mode: "solo", seed: 101, timestamp: Date.now() - 3600000, roundScores: [9.9, 9.9, 9.9, 9.9, 9.8], signature: "initial_1" },
    { username: "ChronoMaster", score: 48.2, gameType: "color", difficulty: "easy", mode: "solo", seed: 102, timestamp: Date.now() - 7200000, roundScores: [9.7, 9.6, 9.6, 9.7, 9.6], signature: "initial_2" },
    { username: "Synapse_Pro", score: 46.8, gameType: "color", difficulty: "easy", mode: "solo", seed: 103, timestamp: Date.now() - 14400000, roundScores: [9.4, 9.3, 9.4, 9.4, 9.3], signature: "initial_3" },
  ],
  sound_easy: [
    { username: "PitchPerfect", score: 49.6, gameType: "sound", difficulty: "easy", mode: "solo", seed: 201, timestamp: Date.now() - 3600000, roundScores: [9.9, 10.0, 9.9, 9.9, 9.9], signature: "initial_s1" },
    { username: "HarmonicBeats", score: 47.9, gameType: "sound", difficulty: "easy", mode: "solo", seed: 202, timestamp: Date.now() - 7200000, roundScores: [9.6, 9.6, 9.5, 9.6, 9.6], signature: "initial_s2" },
  ],
  time_easy: [
    { username: "QuantumClock", score: 49.1, gameType: "time", difficulty: "easy", mode: "solo", seed: 301, timestamp: Date.now() - 3600000, roundScores: [9.8, 9.8, 9.8, 9.9, 9.9], signature: "initial_t1" },
    { username: "MillisecMind", score: 47.5, gameType: "time", difficulty: "easy", mode: "solo", seed: 302, timestamp: Date.now() - 7200000, roundScores: [9.5, 9.5, 9.5, 9.5, 9.5], signature: "initial_t2" },
  ],
};

// Global in-memory leaderboard partitioned by game_difficulty
const memoryLeaderboards: Record<string, StoredEntry[]> = { ...INITIAL_BENCHMARKS };
const rateLimitMap: Map<string, number> = new Map();
const seenSubmissions: Set<string> = new Set();

const HMAC_KEY_MATERIAL = "HubSense_ScoreGuard_2026_v3_by_aegisSoft";

async function verifyHmac(payload: ScorePayload): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(HMAC_KEY_MATERIAL),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    const pid = payload.playerId || "";
    const message = `${payload.username}|${payload.totalScore.toFixed(2)}|${payload.gameType}|${payload.difficulty}|${payload.seed}|${payload.timestamp}|${payload.roundScores.join(",")}|${pid}`;
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    const calculatedSig = btoa(String.fromCharCode(...new Uint8Array(sig)));
    return calculatedSig === payload.signature;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const game = searchParams.get("game") || "color";
    const difficulty = searchParams.get("difficulty") || "easy";
    const filter = searchParams.get("filter") || "all-time";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const partitionKey = `${game}_${difficulty}`;
    const allEntries = memoryLeaderboards[partitionKey] || [];

    const now = Date.now();
    const DAY = 86_400_000;

    let filtered = allEntries;
    if (filter === "daily") {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      filtered = allEntries.filter((e) => e.timestamp >= todayStart.getTime());
    } else if (filter === "weekly") {
      filtered = allEntries.filter((e) => now - e.timestamp < 7 * DAY);
    }

    const sorted = [...filtered].sort((a, b) => b.score - a.score).slice(0, limit);
    const entriesWithRank = sorted.map((e, index) => ({
      ...e,
      rank: index + 1,
      verified: true,
    }));

    return NextResponse.json(
      {
        success: true,
        entries: entriesWithRank,
        total: allEntries.length,
        source: "server",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Skorlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Client IP rate-limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const lastTime = rateLimitMap.get(ip) || 0;
    const now = Date.now();
    if (now - lastTime < 15_000) {
      return NextResponse.json(
        { success: false, error: "Lütfen iki gönderim arasında 15 saniye bekleyin." },
        { status: 429 }
      );
    }

    const payload: ScorePayload = await req.json();

    // 1. Username validation
    const userCheck = validateUsername(payload.username);
    if (!userCheck.valid) {
      return NextResponse.json(
        { success: false, error: userCheck.error || "Geçersiz kullanıcı adı" },
        { status: 400 }
      );
    }

    // 2. Score bounds validation
    if (!validateScoreBounds(payload.roundScores)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz tur skorları" },
        { status: 400 }
      );
    }

    const computedRawTotal = payload.roundScores.reduce((a, b) => a + b, 0);
    const computedNormalizedTotal =
      (computedRawTotal / (payload.roundScores.length * 10)) * 50;

    const isMatch =
      Math.abs(computedNormalizedTotal - payload.totalScore) <= 0.08 ||
      Math.abs(computedRawTotal - payload.totalScore) <= 0.08;

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Toplam skor tutarsız" },
        { status: 400 }
      );
    }

    // 3. Cryptographic HMAC validation
    const isSigValid = await verifyHmac(payload);
    if (!isSigValid) {
      return NextResponse.json(
        { success: false, error: "Kriptografik skor imzası doğrulanamadı" },
        { status: 403 }
      );
    }

    // 4. Replay & deduplication check
    const dedupKey = `${payload.playerId || payload.username.toLowerCase()}_${payload.gameType}_${payload.seed}`;
    if (seenSubmissions.has(dedupKey)) {
      return NextResponse.json(
        { success: false, error: "Bu oturum skoru daha önce kaydedildi." },
        { status: 409 }
      );
    }

    // Record submission
    seenSubmissions.add(dedupKey);
    rateLimitMap.set(ip, now);

    const partitionKey = `${payload.gameType}_${payload.difficulty}`;
    if (!memoryLeaderboards[partitionKey]) {
      memoryLeaderboards[partitionKey] = [];
    }

    // Smart username syncing across all existing records for this player ID
    if (payload.playerId) {
      Object.keys(memoryLeaderboards).forEach((pkey) => {
        memoryLeaderboards[pkey].forEach((e) => {
          if (e.playerId === payload.playerId) {
            e.username = payload.username.trim();
          }
        });
      });
    }

    const newEntry: StoredEntry = {
      username: payload.username.trim(),
      score: payload.totalScore,
      gameType: payload.gameType,
      difficulty: payload.difficulty,
      mode: payload.mode,
      seed: payload.seed,
      dateSeed: payload.dateSeed,
      timestamp: payload.timestamp || now,
      roundScores: payload.roundScores,
      signature: payload.signature,
      playerId: payload.playerId,
    };

    memoryLeaderboards[partitionKey].push(newEntry);
    memoryLeaderboards[partitionKey].sort((a, b) => b.score - a.score);

    // Keep top 1000 in memory
    if (memoryLeaderboards[partitionKey].length > 1000) {
      memoryLeaderboards[partitionKey] = memoryLeaderboards[partitionKey].slice(0, 1000);
    }

    const rank =
      memoryLeaderboards[partitionKey].findIndex(
        (e) => e.signature === payload.signature
      ) + 1;

    return NextResponse.json({
      success: true,
      rank,
      entry: newEntry,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Skor gönderimi işlenirken hata oluştu" },
      { status: 500 }
    );
  }
}
