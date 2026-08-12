/**
 * HubSense — Share Encoder
 * Encodes game results into shareable URL parameters.
 * Creates score card data for OG image generation and Canvas-based PNG export.
 */

import type { GameType, DifficultyType, ModeType } from "./seedGenerator";
import type { LeaderboardEntry } from "./leaderboard";

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
      username: data.u ?? "???",
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
  theme?: "dark" | "glass";
}

export function generateScoreCardCanvas(options: ScoreCardOptions): HTMLCanvasElement {
  const { payload, accentColor = "#6366f1" } = options;
  const W = 1200;
  const H = 630;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#09090b");
  gradient.addColorStop(1, "#131316");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Accent glow
  const radial = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 500);
  radial.addColorStop(0, `${accentColor}22`);
  radial.addColorStop(1, "transparent");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = `${accentColor}44`;
  ctx.lineWidth = 2;
  roundRect(ctx, 20, 20, W - 40, H - 40, 24);
  ctx.stroke();

  // Logo/Title
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("HubSense", 60, 80);

  // Game type pill
  const gameName = payload.gameType.toUpperCase();
  ctx.font = "bold 18px system-ui, sans-serif";
  ctx.fillStyle = accentColor;
  ctx.fillText(`${gameName} · ${payload.difficulty.toUpperCase()} · ${payload.mode.toUpperCase()}`, 60, 120);

  // Username
  ctx.font = "bold 48px system-ui, sans-serif";
  ctx.fillStyle = "#fafafa";
  ctx.fillText(payload.username, 60, 210);

  // Score
  ctx.font = "bold 140px system-ui, sans-serif";
  ctx.fillStyle = accentColor;
  ctx.fillText(payload.totalScore.toFixed(1), 60, 400);

  ctx.font = "bold 48px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText("/50", 260 + payload.totalScore.toString().length * 40, 380);

  // Round scores bar
  const barY = 460;
  const barW = (W - 120) / 5;
  payload.roundScores.forEach((s, i) => {
    const x = 60 + i * barW;
    const filled = (s / 10) * (barW - 20);

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, x, barY, barW - 12, 50, 8);
    ctx.fill();

    ctx.fillStyle = `${accentColor}cc`;
    if (filled > 0) {
      roundRect(ctx, x, barY, filled, 50, 8);
      ctx.fill();
    }

    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`R${i + 1}: ${s.toFixed(1)}`, x + 8, barY + 30);
  });

  // Date
  const dateStr = payload.dateSeed ?? new Date(payload.timestamp).toLocaleDateString("tr-TR");
  ctx.font = "16px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText(`everythinghub.com.tr · ${dateStr}`, 60, H - 40);

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

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas to blob failed"));
    }, "image/png");
  });
}

// ─── Copy to Clipboard ────────────────────────────────────────────────────────
export async function copyShareUrl(payload: SharePayload): Promise<void> {
  const url = buildShareUrl(payload);
  await navigator.clipboard.writeText(url);
}

// ─── Share via Web Share API ──────────────────────────────────────────────────
export async function nativeShare(payload: SharePayload): Promise<boolean> {
  if (!navigator.share) return false;

  const gameName =
    payload.gameType.charAt(0).toUpperCase() + payload.gameType.slice(1);
  const url = buildShareUrl(payload);

  try {
    await navigator.share({
      title: `HubSense ${gameName} — ${payload.totalScore.toFixed(1)}/50`,
      text: `${payload.username} olarak HubSense ${gameName} oyununda ${payload.totalScore.toFixed(1)}/50 puan aldım! Senin skorun nedir?`,
      url,
    });
    return true;
  } catch {
    return false;
  }
}

// ─── Twitter/X Share ──────────────────────────────────────────────────────────
export function buildTwitterShareUrl(payload: SharePayload): string {
  const gameName =
    payload.gameType.charAt(0).toUpperCase() + payload.gameType.slice(1);
  const url = buildShareUrl(payload);
  const text = `${payload.username} olarak HubSense ${gameName} oyununda ${payload.totalScore.toFixed(1)}/50 puan aldım!\n\n${url}\n\n#HubSense #EverythingHub`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
