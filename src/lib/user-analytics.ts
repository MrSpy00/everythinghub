"use client";

import { tools, Tool } from "./tools-registry";

export interface ToolUsageEntry {
  slug: string;
  count: number;
  lastUsed: number;
}

const STORAGE_KEY = "everythinghub_tool_analytics_v2";

// Baseline engagement weights for all studio tools (curated global popularity)
export const BASE_TOOL_WEIGHTS: Record<string, number> = {
  "yt-playlist-length": 98,
  "spotify-playlist-analyzer": 95,
  "qr-code-studio": 93,
  "image-compressor": 92,
  "currency-exchange-converter": 90,
  "ip-network-info": 88,
  "favicon-extractor": 87,
  "json-formatter": 86,
  "mock-data-generator": 85,
  "markdown-studio": 84,
  "dns-lookup-tool": 83,
  "weather-air-quality": 82,
  "audio-spectrum-studio": 81,
  "world-countries-explorer": 80,
  "trivia-quiz-arena": 79,
  "crypto-hash-studio": 78,
  "barcode-generator": 77,
  "jwt-debugger": 76,
  "bpm-tapper": 75,
  "sql-to-types": 74,
  "curl-to-code": 73,
  "smart-dictionary": 72,
  "book-isbn-finder": 71,
  "exif-purger": 70,
  "yt-thumbnail-downloader": 69,
  "yt-timestamp-generator": 68,
  "spotify-profile-analyzer": 67,
  "image-converter": 66,
  "color-picker": 65,
  "css-gradient-generator": 64,
  "base64-encoder": 63,
  "regex-tester": 62,
  "cron-expression-studio": 61,
  "case-converter": 60,
  "word-counter": 59,
  "unit-converter": 58,
  "percentage-calculator": 57,
  "api-playground": 56,
};

// Platform default top 4 tools
export const DEFAULT_TOP_4_SLUGS = [
  "yt-playlist-length",
  "spotify-playlist-analyzer",
  "qr-code-studio",
  "image-compressor",
];

// Record a tool visit / execution
export function trackToolUsage(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, ToolUsageEntry> = raw ? JSON.parse(raw) : {};

    const existing = data[slug] || { slug, count: 0, lastUsed: 0 };
    data[slug] = {
      slug,
      count: existing.count + 1,
      lastUsed: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("hub-tool-analytics-updated"));
  } catch {
    // Fail silently on storage restrictions
  }
}

// Calculate dynamic score for a tool
export function getToolScore(slug: string, usageData?: Record<string, ToolUsageEntry>): number {
  const baseWeight = BASE_TOOL_WEIGHTS[slug] ?? 50;
  if (!usageData || !usageData[slug]) {
    return baseWeight;
  }

  const entry = usageData[slug];
  const now = Date.now();
  const hoursAgo = Math.max(0, (now - entry.lastUsed) / (1000 * 60 * 60));

  // Dynamic recency bonus
  let recencyBonus = 0;
  if (hoursAgo < 2) {
    recencyBonus = 80;
  } else if (hoursAgo < 24) {
    recencyBonus = 45;
  } else if (hoursAgo < 72) {
    recencyBonus = 25;
  } else if (hoursAgo < 168) {
    recencyBonus = 10;
  }

  // Final weighted ranking formula
  return baseWeight + entry.count * 20 + recencyBonus;
}

// Dynamically rank any list of tools
export function rankTools(toolList: Tool[]): Tool[] {
  if (typeof window === "undefined") {
    return [...toolList].sort((a, b) => (BASE_TOOL_WEIGHTS[b.slug] ?? 50) - (BASE_TOOL_WEIGHTS[a.slug] ?? 50));
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, ToolUsageEntry> = raw ? JSON.parse(raw) : {};

    return [...toolList].sort((a, b) => {
      const scoreA = getToolScore(a.slug, data);
      const scoreB = getToolScore(b.slug, data);
      return scoreB - scoreA;
    });
  } catch {
    return [...toolList].sort((a, b) => (BASE_TOOL_WEIGHTS[b.slug] ?? 50) - (BASE_TOOL_WEIGHTS[a.slug] ?? 50));
  }
}

// Get user's top 4 quick access tools
export function getTop4QuickAccessTools(): Tool[] {
  const ranked = rankTools(tools);
  return ranked.slice(0, 4);
}
