"use client";

import { tools, Tool } from "./tools-registry";

export interface ToolUsageEntry {
  slug: string;
  count: number;
  lastUsed: number;
}

const STORAGE_KEY = "everythinghub_tool_analytics_v2";
const FAVORITES_KEY = "everythinghub_user_favorites_v1";

// Curated baseline global utility weights for all 38 tools
export const BASE_TOOL_WEIGHTS: Record<string, number> = {
  "yt-playlist-length": 98,
  "spotify-playlist-analyzer": 96,
  "qr-code-studio": 94,
  "image-compressor": 93,
  "currency-exchange-converter": 91,
  "ip-network-info": 89,
  "favicon-extractor": 88,
  "json-formatter": 87,
  "mock-data-generator": 86,
  "markdown-studio": 85,
  "dns-lookup-tool": 84,
  "weather-air-quality": 83,
  "audio-spectrum-studio": 82,
  "world-countries-explorer": 81,
  "trivia-quiz-arena": 80,
  "crypto-hash-studio": 79,
  "barcode-generator": 78,
  "jwt-debugger": 77,
  "bpm-tapper": 76,
  "sql-to-types": 75,
  "curl-to-code": 74,
  "smart-dictionary": 73,
  "book-isbn-finder": 72,
  "exif-purger": 71,
  "yt-thumbnail-downloader": 70,
  "yt-timestamp-generator": 69,
  "spotify-profile-analyzer": 68,
  "image-converter": 67,
  "color-picker": 66,
  "css-gradient-generator": 65,
  "base64-encoder": 64,
  "regex-tester": 63,
  "cron-expression-studio": 62,
  "case-converter": 61,
  "word-counter": 60,
  "unit-converter": 59,
  "percentage-calculator": 58,
  "api-playground": 57,
};

// User Favorites Management
export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(slug: string): boolean {
  if (typeof window === "undefined" || !slug) return false;
  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(slug);
    let isFav = false;
    if (index >= 0) {
      favorites.splice(index, 1);
      isFav = false;
    } else {
      favorites.push(slug);
      isFav = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new Event("hub-tool-analytics-updated"));
    return isFav;
  } catch {
    return false;
  }
}

export function isFavorite(slug: string): boolean {
  if (typeof window === "undefined") return false;
  const favs = getFavorites();
  return favs.includes(slug);
}

// Record Tool Usage with Time & Interaction Signals
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
  } catch {}
}

// Multi-Factor Hybrid Ranking Formula
export function getToolScore(
  slug: string,
  usageData: Record<string, ToolUsageEntry>,
  favorites: string[]
): number {
  const baseWeight = BASE_TOOL_WEIGHTS[slug] ?? 50;
  const isFav = favorites.includes(slug);
  const favBonus = isFav ? 500 : 0;

  const toolObj = tools.find((t) => t.slug === slug);
  const discoveryBonus = toolObj?.newBadge ? 25 : 0;

  if (!usageData[slug]) {
    return baseWeight + favBonus + discoveryBonus;
  }

  const entry = usageData[slug];
  const now = Date.now();
  const daysAgo = Math.max(0, (now - entry.lastUsed) / (1000 * 60 * 60 * 24));

  // Exponential Time Decay (7-day half life)
  const recencyFactor = Math.exp(-Math.LN2 * (daysAgo / 7));
  const personalUsageScore = Math.min(150, entry.count * 18) * (0.4 + 0.6 * recencyFactor);

  return baseWeight * 0.4 + personalUsageScore + favBonus + discoveryBonus;
}

export type SortOption = "recommended" | "favorites" | "popular" | "newest" | "alphabetical";

// Dynamically rank tools based on personalization signals and selected sort option
export function rankTools(toolList: Tool[], sortMode: SortOption = "recommended"): Tool[] {
  if (typeof window === "undefined") {
    return [...toolList].sort((a, b) => (BASE_TOOL_WEIGHTS[b.slug] ?? 50) - (BASE_TOOL_WEIGHTS[a.slug] ?? 50));
  }

  try {
    const rawAnalytics = localStorage.getItem(STORAGE_KEY);
    const usageData: Record<string, ToolUsageEntry> = rawAnalytics ? JSON.parse(rawAnalytics) : {};
    const favorites = getFavorites();

    const sorted = [...toolList];

    switch (sortMode) {
      case "favorites":
        return sorted.sort((a, b) => {
          const aFav = favorites.includes(a.slug) ? 1 : 0;
          const bFav = favorites.includes(b.slug) ? 1 : 0;
          if (aFav !== bFav) return bFav - aFav;
          return getToolScore(b.slug, usageData, favorites) - getToolScore(a.slug, usageData, favorites);
        });

      case "popular":
        return sorted.sort((a, b) => {
          const countA = (usageData[a.slug]?.count || 0) * 10 + (BASE_TOOL_WEIGHTS[a.slug] || 50);
          const countB = (usageData[b.slug]?.count || 0) * 10 + (BASE_TOOL_WEIGHTS[b.slug] || 50);
          return countB - countA;
        });

      case "newest":
        return sorted.sort((a, b) => {
          const aNew = a.newBadge ? 1 : 0;
          const bNew = b.newBadge ? 1 : 0;
          if (aNew !== bNew) return bNew - aNew;
          return (BASE_TOOL_WEIGHTS[b.slug] ?? 50) - (BASE_TOOL_WEIGHTS[a.slug] ?? 50);
        });

      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      case "recommended":
      default:
        return sorted.sort((a, b) => {
          const scoreA = getToolScore(a.slug, usageData, favorites);
          const scoreB = getToolScore(b.slug, usageData, favorites);
          return scoreB - scoreA;
        });
    }
  } catch {
    return [...toolList].sort((a, b) => (BASE_TOOL_WEIGHTS[b.slug] ?? 50) - (BASE_TOOL_WEIGHTS[a.slug] ?? 50));
  }
}

export function getTop4QuickAccessTools(): Tool[] {
  const ranked = rankTools(tools, "recommended");
  return ranked.slice(0, 4);
}
