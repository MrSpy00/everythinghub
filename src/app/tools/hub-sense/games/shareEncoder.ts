/**
 * HubSense — Share Encoder & Canvas Scorecard Generator
 * Encodes game results into shareable URL parameters.
 * Creates score card data for dynamic OG images and direct high-res PNG downloads.
 */

import type { GameType, DifficultyType, ModeType } from "./seedGenerator";

// ─── Share Payload ─────────────────────────────────────────────────────────────
export interface SharePayload {
  username: string;
  totalScore: number;
  roundScores: number[];
  gameType: GameType;
  difficulty: DifficultyType;
  mode: ModeType;
  dateSeed?: string;
  timestamp: number;
}

// ─── URL Encode/Decode ─────────────────────────────────────────────────────────
export function encodeSharePayload(payload: SharePayload): string {
  const compact = {
    u: payload.username,
    s: Math.round(payload.totalScore * 100) / 100,
    r: payload.roundScores.map((v) => Math.round(v * 100) / 100),
    g: payload.gameType,
    d: payload.difficulty,
    m: payload.mode,
    dt: payload.dateSeed,
    t: payload.timestamp,
  };
  const json = JSON.stringify(compact);
  return btoa(encodeURIComponent(json));
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    return {
      username: data.u ?? "ANONIM",
      totalScore: data.s ?? 0,
      roundScores: data.r ?? [0, 0, 0, 0, 0],
      gameType: data.g ?? "color",
      difficulty: data.d ?? "easy",
      mode: data.m ?? "solo",
      dateSeed: data.dt,
      timestamp: data.t ?? Date.now(),
    };
  } catch {
    return null;
  }
}

// ─── Share URL ────────────────────────────────────────────────────────────────
const BASE_URL = "https://www.everythinghub.com.tr/tools/hub-sense";

export function buildShareUrl(payload: SharePayload): string {
  const encoded = encodeSharePayload(payload);
  return `${BASE_URL}?share=${encoded}`;
}

export function buildChallengeUrl(
  gameType: GameType,
  difficulty: DifficultyType,
  seed: number
): string {
  const data = btoa(JSON.stringify({ g: gameType, d: difficulty, seed }));
  return `${BASE_URL}?challenge=${data}`;
}

export function parseChallengeUrl(encoded: string): {
  gameType: GameType;
  difficulty: DifficultyType;
  seed: number;
} | null {
  try {
    const data = JSON.parse(atob(encoded));
    return {
      gameType: data.g,
      difficulty: data.d,
      seed: data.seed,
    };
  } catch {
    return null;
  }
}

// ─── OG Image URL ─────────────────────────────────────────────────────────────
export function buildOgImageUrl(payload: SharePayload): string {
  const encoded = encodeSharePayload(payload);
  return `https://www.everythinghub.com.tr/api/hub-sense/og?data=${encoded}`;
}

// ─── Canvas Score Card Generator ──────────────────────────────────────────────
export interface ScoreCardOptions {
  payload: SharePayload;
  accentColor?: string;
}

const ACCENT_COLORS: Record<GameType, string> = {
  color: "#6366f1",
  sound: "#8b5cf6",
  time: "#10b981",
  shape: "#f59e0b",
  sequence: "#ec4899",
};

export function generateScoreCardCanvas(options: ScoreCardOptions): HTMLCanvasElement {
  const { payload } = options;
  const accentColor = options.accentColor || ACCENT_COLORS[payload.gameType] || "#6366f1";
  const W = 1200;
  const H = 630;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Dark background
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#09090b");
  gradient.addColorStop(1, "#121217");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Accent radial glow
  const radial = ctx.createRadialGradient(W * 0.7, H * 0.3, 50, W * 0.7, H * 0.3, 600);
  radial.addColorStop(0, `${accentColor}25`);
  radial.addColorStop(1, "transparent");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, W, H);

  // Border card
  ctx.strokeStyle = `${accentColor}44`;
  ctx.lineWidth = 3;
  roundRect(ctx, 24, 24, W - 48, H - 48, 28);
  ctx.stroke();

  // Branding
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText("EverythingHub", 64, 84);

  ctx.fillStyle = accentColor;
  ctx.fillText("HubSense", 240, 84);

  // Game & Mode Pill
  const gameName = payload.gameType.toUpperCase();
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = accentColor;
  ctx.fillText(
    `${gameName} · ${payload.difficulty.toUpperCase()} · ${payload.mode.toUpperCase()}`,
    64,
    130
  );

  // Player Username
  ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(payload.username, 64, 210);

  // Huge Score Number
  ctx.font = "bold 140px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = accentColor;
  const scoreText = payload.totalScore.toFixed(1);
  ctx.fillText(scoreText, 64, 380);

  // /50 Total
  const textWidth = ctx.measureText(scoreText).width;
  ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.fillText("/50", 74 + textWidth, 360);

  // Round Bars Breakdown
  const barY = 440;
  const barTotalWidth = W - 128;
  const barWidth = (barTotalWidth - 4 * 16) / 5;

  payload.roundScores.forEach((score, idx) => {
    const x = 64 + idx * (barWidth + 16);

    // Track
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    roundRect(ctx, x, barY, barWidth, 64, 12);
    ctx.fill();

    // Fill
    const fillHeight = Math.max(8, (score / 10) * 64);
    ctx.fillStyle = `${accentColor}dd`;
    roundRect(ctx, x, barY + (64 - fillHeight), barWidth, fillHeight, 12);
    ctx.fill();

    // Score label
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`R${idx + 1}: ${score.toFixed(1)}`, x + 16, barY + 38);
  });

  // Footer URL & Date
  const dateStr =
    payload.dateSeed ??
    new Date(payload.timestamp).toLocaleDateString("tr-TR");
  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fillText(`www.everythinghub.com.tr/tools/hub-sense · ${dateStr}`, 64, H - 44);

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Direct PNG Download ──────────────────────────────────────────────────────
export async function downloadScoreCardImage(payload: SharePayload): Promise<void> {
  const canvas = generateScoreCardCanvas({ payload });
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HubSense_${payload.gameType}_${payload.username}_${payload.totalScore.toFixed(1)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}

// ─── Share Via Socials ────────────────────────────────────────────────────────
export async function nativeShare(payload: SharePayload): Promise<boolean> {
  if (!navigator.share) return false;

  const gameName =
    payload.gameType.charAt(0).toUpperCase() + payload.gameType.slice(1);
  const url = buildShareUrl(payload);

  try {
    await navigator.share({
      title: `HubSense ${gameName} — ${payload.totalScore.toFixed(1)}/50`,
      text: `${payload.username} olarak HubSense ${gameName} oyununda ${payload.totalScore.toFixed(1)}/50 puan aldım! Sen de dene:`,
      url,
    });
    return true;
  } catch {
    return false;
  }
}

export function buildTwitterShareUrl(payload: SharePayload): string {
  const gameName =
    payload.gameType.charAt(0).toUpperCase() + payload.gameType.slice(1);
  const url = buildShareUrl(payload);
  const text = `${payload.username} olarak HubSense ${gameName} duyu hafızası oyununda 50 üzerinden ${payload.totalScore.toFixed(1)} puan aldım! Sen ne kadar hatırlıyorsun?\n\n${url}\n\n#HubSense #EverythingHub`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppShareUrl(payload: SharePayload): string {
  const gameName =
    payload.gameType.charAt(0).toUpperCase() + payload.gameType.slice(1);
  const url = buildShareUrl(payload);
  const text = `HubSense ${gameName} oyununda ${payload.totalScore.toFixed(1)}/50 puan yaptım! Bakalım beni geçebilecek misin:\n${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
