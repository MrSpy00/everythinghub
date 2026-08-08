import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(totalSeconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  short: string;
} {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}d`);
  parts.push(`${seconds}sn`);

  const fullParts: string[] = [];
  if (days > 0) fullParts.push(`${days} gün`);
  if (hours > 0) fullParts.push(`${hours} saat`);
  if (minutes > 0) fullParts.push(`${minutes} dakika`);
  if (seconds > 0 || fullParts.length === 0) fullParts.push(`${seconds} saniye`);

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted: fullParts.join(", "),
    short: parts.join(" "),
  };
}

export function formatDurationAtSpeed(totalSeconds: number, speed: number): string {
  const adjusted = totalSeconds / speed;
  const { days, hours, minutes, seconds } = formatDuration(adjusted);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}d`);
  parts.push(`${seconds}sn`);
  return parts.join(" ");
}

export function parseYouTubeUrl(url: string): { type: "playlist" | "video" | "channel" | null; id: string | null } {
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (playlistMatch) return { type: "playlist", id: playlistMatch[1] };

  const videoMatch = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (videoMatch) return { type: "video", id: videoMatch[1] };

  const channelMatch = url.match(/(?:channel\/|@)([a-zA-Z0-9_-]+)/);
  if (channelMatch) return { type: "channel", id: channelMatch[1] };

  return { type: null, id: null };
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return Promise.resolve(ok);
  } catch {
    document.body.removeChild(textarea);
    return Promise.resolve(false);
  }
}
