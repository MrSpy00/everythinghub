// ============================================================
// aegisTyping — Anti-Cheat Utilities
// ============================================================
import type { AntiCheatReport, KeystrokeRecord } from "../types";

// ─── Constants ─────────────────────────────────────────────
const MAX_HONEST_WPM = 250; // ~250 WPM = world record territory
const MIN_KEY_INTERVAL_MS = 10; // faster than physically possible
const BOT_VARIANCE_THRESHOLD = 15; // ms — bots are unnaturally consistent
const BOT_MEAN_THRESHOLD = 50; // ms between keys — >1200 CPM
const HIGH_ACCURACY_WPM_FLAG = 150; // 100% accuracy above this WPM = suspicious

// ─── Variance Calculation ──────────────────────────────────
function calcVariance(values: number[]): number {
  if (values.length < 2) return Infinity;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

function calcMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ─── Pattern Detection (repeated intervals) ────────────────
function hasRepeatingPattern(deltas: number[], windowSize = 8): boolean {
  if (deltas.length < windowSize * 2) return false;
  for (let i = 0; i < deltas.length - windowSize; i++) {
    const window1 = deltas.slice(i, i + windowSize);
    const window2 = deltas.slice(i + windowSize, i + windowSize * 2);
    const diff = window1.reduce(
      (sum, v, j) => sum + Math.abs(v - window2[j]),
      0
    );
    const avgDiff = diff / windowSize;
    if (avgDiff < 5) return true; // identical pattern detected
  }
  return false;
}

// ─── Analyze Keystroke Timing ─────────────────────────────
export function analyzeKeystrokes(
  keystrokes: KeystrokeRecord[],
  pasteAttempts: number,
  blurCount: number,
  finalWpm: number,
  finalAccuracy: number
): AntiCheatReport {
  const flags: string[] = [];
  const deltas = keystrokes.map((k) => k.delta).filter((d) => d > 0 && d < 5000);

  const variance = deltas.length > 2 ? calcVariance(deltas) : Infinity;
  const mean = deltas.length > 0 ? calcMean(deltas) : Infinity;

  // Flag: paste attempts
  if (pasteAttempts > 0) {
    flags.push(`paste_attempt:${pasteAttempts}`);
  }

  // Flag: tab/window switch
  if (blurCount >= 3) {
    flags.push(`blur_count:${blurCount}`);
  }

  // Flag: WPM too high
  if (finalWpm > MAX_HONEST_WPM) {
    flags.push(`wpm_ceiling:${finalWpm}`);
  }

  // Flag: perfect accuracy + very high WPM
  if (finalAccuracy >= 99.9 && finalWpm > HIGH_ACCURACY_WPM_FLAG) {
    flags.push(`perfect_acc_high_wpm:${finalWpm}`);
  }

  // Flag: variance too low (bot-like consistency)
  if (variance < BOT_VARIANCE_THRESHOLD && deltas.length > 20) {
    flags.push(`low_variance:${variance.toFixed(1)}`);
  }

  // Flag: mean delta too low
  if (mean < BOT_MEAN_THRESHOLD && deltas.length > 20) {
    flags.push(`low_mean_delta:${mean.toFixed(1)}`);
  }

  // Flag: impossibly fast individual keystrokes
  const tooFastCount = keystrokes.filter(
    (k) => k.delta > 0 && k.delta < MIN_KEY_INTERVAL_MS
  ).length;
  if (tooFastCount > 5) {
    flags.push(`too_fast_keystrokes:${tooFastCount}`);
  }

  // Flag: repeating pattern detection
  if (hasRepeatingPattern(deltas)) {
    flags.push("repeating_pattern");
  }

  const suspicious = flags.length > 0;

  return {
    suspicious,
    flags,
    variance: Math.round(variance * 10) / 10,
    mean: Math.round(mean * 10) / 10,
    pasteAttempts,
    blurCount,
    wpmCap: MAX_HONEST_WPM,
  };
}

// ─── Generate Result Hash (Web Crypto) ────────────────────
export async function generateResultHash(payload: {
  wpm: number;
  accuracy: number;
  mode: string;
  language: string;
  timestamp: number;
  duration: number;
  errors: number;
}): Promise<string> {
  const salt = "aegisTyping-2026-EverythingHub";
  const data = `${salt}|${payload.wpm}|${payload.accuracy}|${payload.mode}|${payload.language}|${payload.timestamp}|${payload.duration}|${payload.errors}`;

  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback: simple non-cryptographic hash
    let h = 5381;
    for (let i = 0; i < data.length; i++) {
      h = (h << 5) + h + data.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h).toString(16).padStart(64, "0");
  }
}

// ─── Encode Result for Share URL ──────────────────────────
export function encodeResultForUrl(result: {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  modeValue: number | string;
  language: string;
  duration: number;
  funbox: string;
  hash: string;
  suspicious: boolean;
}): string {
  try {
    const payload = btoa(encodeURIComponent(JSON.stringify(result)));
    return payload;
  } catch {
    return "";
  }
}

// ─── Decode Result from Share URL ─────────────────────────
export function decodeResultFromUrl(encoded: string): Record<string, unknown> | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}

// ─── Suspicious Warning Message ───────────────────────────
export function getSuspiciousMessage(report: AntiCheatReport): string | null {
  if (!report.suspicious) return null;
  if (report.flags.some((f) => f.startsWith("paste_attempt"))) {
    return "Yapıştırma girişimi tespit edildi. Sonuç geçersiz sayılabilir.";
  }
  if (report.flags.some((f) => f.startsWith("wpm_ceiling"))) {
    return "Olağandışı yüksek WPM tespit edildi. Sonuç geçersiz sayılabilir.";
  }
  if (report.flags.some((f) => f.startsWith("low_variance"))) {
    return "Olağandışı tutarlı tuş vuruşları. Otomatik giriş tespit edilmiş olabilir.";
  }
  return "Şüpheli aktivite tespit edildi. Sonuç liderboard'a kabul edilmeyebilir.";
}
