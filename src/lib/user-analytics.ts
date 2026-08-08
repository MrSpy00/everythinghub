"use client";

import { tools, Tool } from "./tools-registry";

export interface ToolUsageEntry {
  slug: string;
  count: number;
  lastUsed: number;
}

const STORAGE_KEY = "hub_tool_analytics_v1";

// Platform default top 4 tools (when user has zero history)
export const DEFAULT_TOP_4_SLUGS = [
  "yt-playlist-length",
  "spotify-playlist-analyzer",
  "image-compressor",
  "json-formatter",
];

// Record a tool visit / action
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
  } catch {
    // Fail silently on storage restrictions
  }
}

// Get user's top 4 tools (or platform default if user history < 4)
export function getTop4QuickAccessTools(): Tool[] {
  if (typeof window === "undefined") {
    return DEFAULT_TOP_4_SLUGS.map((slug) => tools.find((t) => t.slug === slug)!).filter(Boolean);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_TOP_4_SLUGS.map((slug) => tools.find((t) => t.slug === slug)!).filter(Boolean);
    }

    const data: Record<string, ToolUsageEntry> = JSON.parse(raw);
    const entries = Object.values(data);

    if (entries.length === 0) {
      return DEFAULT_TOP_4_SLUGS.map((slug) => tools.find((t) => t.slug === slug)!).filter(Boolean);
    }

    // Rank formula: score = count * 10 + recencyBonus
    const now = Date.now();
    const scored = entries
      .map((entry) => {
        const hoursAgo = (now - entry.lastUsed) / (1000 * 60 * 60);
        // Recency bonus: recent visits get extra points
        const recencyBonus = hoursAgo < 24 ? 50 : hoursAgo < 168 ? 20 : 5;
        const score = entry.count * 10 + recencyBonus;
        return { slug: entry.slug, score };
      })
      .sort((a, b) => b.score - a.score);

    const userSlugs = scored.map((s) => s.slug);

    // Merge user's top tools with default tools to guarantee 4 items
    const combinedSlugs = Array.from(new Set([...userSlugs, ...DEFAULT_TOP_4_SLUGS])).slice(0, 4);

    const result = combinedSlugs.map((slug) => tools.find((t) => t.slug === slug)!).filter(Boolean);
    return result;
  } catch {
    return DEFAULT_TOP_4_SLUGS.map((slug) => tools.find((t) => t.slug === slug)!).filter(Boolean);
  }
}
