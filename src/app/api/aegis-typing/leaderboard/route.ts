// ============================================================
// aegisTyping — Leaderboard API Route
// POST: Submit score | GET: Fetch leaderboard
// Serverless, Edge-compatible, using Vercel KV (fallback: in-memory)
// ============================================================
import { NextRequest, NextResponse } from "next/server";

// In-memory fallback (persists only for server lifetime)
// For production: replace with Vercel KV / Upstash Redis
const inMemoryStore: LeaderboardEntry[] = [];

interface LeaderboardEntry {
  nickname: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  modeValue: number | string;
  language: string;
  hash: string;
  timestamp: number;
  rank?: number;
}

// Validate score hash (basic - true validation would re-compute)
function isValidSubmission(body: unknown): body is LeaderboardEntry {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.wpm !== "number" || b.wpm <= 0 || b.wpm > 350) return false;
  if (typeof b.accuracy !== "number" || b.accuracy < 0 || b.accuracy > 100) return false;
  if (typeof b.mode !== "string") return false;
  if (typeof b.hash !== "string" || b.hash.length < 8) return false;
  if (typeof b.nickname !== "string") return false;
  if (typeof b.timestamp !== "number") return false;
  // Anti-cheat: reject scores that are impossibly high for accuracy
  if (b.wpm > 250 && (b.accuracy as number) > 99.9) return false;
  return true;
}

function getPeriodStart(period: string): number {
  const now = Date.now();
  if (period === "daily") return now - 24 * 60 * 60 * 1000;
  if (period === "weekly") return now - 7 * 24 * 60 * 60 * 1000;
  return 0; // all-time
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "alltime";
  const mode = searchParams.get("mode");
  const modeValue = searchParams.get("modeValue");
  const lang = searchParams.get("lang");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  const periodStart = getPeriodStart(period);

  let filtered = inMemoryStore.filter((e) => e.timestamp >= periodStart);

  if (mode) filtered = filtered.filter((e) => e.mode === mode);
  if (modeValue) filtered = filtered.filter((e) => String(e.modeValue) === modeValue);
  if (lang) filtered = filtered.filter((e) => e.language === lang);

  // Sort by WPM desc
  const sorted = filtered
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, limit)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return NextResponse.json(
    { entries: sorted, total: sorted.length, period },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!isValidSubmission(body)) {
      return NextResponse.json(
        { error: "Geçersiz skor verisi" },
        { status: 400 }
      );
    }

    const entry: LeaderboardEntry = {
      nickname: String(body.nickname).slice(0, 20).replace(/[<>"'&]/g, "") || "Anonim",
      wpm: Math.round(body.wpm * 10) / 10,
      rawWpm: typeof body.rawWpm === "number" ? body.rawWpm : body.wpm,
      accuracy: Math.round(body.accuracy * 10) / 10,
      consistency: typeof body.consistency === "number" ? body.consistency : 0,
      mode: String(body.mode),
      modeValue: body.modeValue,
      language: String(body.language).slice(0, 20),
      hash: String(body.hash),
      timestamp: Date.now(),
    };

    // Deduplicate: prevent same hash from being submitted twice
    const isDuplicate = inMemoryStore.some((e) => e.hash === entry.hash);
    if (isDuplicate) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    // Rate limiting: max 10 entries per minute per IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentFromIp = inMemoryStore.filter(
      (e) => e.timestamp >= oneMinuteAgo && (e as any)._ip === clientIp
    );

    if (recentFromIp.length >= 10) {
      return NextResponse.json(
        { error: "Çok fazla istek" },
        { status: 429 }
      );
    }

    (entry as any)._ip = clientIp;
    inMemoryStore.push(entry);

    // Keep max 5000 entries in memory
    if (inMemoryStore.length > 5000) {
      inMemoryStore.sort((a, b) => b.wpm - a.wpm);
      inMemoryStore.splice(5000);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "İstek işlenemedi" },
      { status: 500 }
    );
  }
}
