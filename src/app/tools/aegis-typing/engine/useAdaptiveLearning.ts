"use client";
// ============================================================
// aegisTyping — Adaptive Learning Hook (Keybr-style)
// ============================================================
import { useCallback, useRef } from "react";
import type { AdaptiveKeyStats } from "../types";
import { weightedRandom } from "../utils/textProcessing";

// ─── Lessons (QWERTY-based) ───────────────────────────────
export const LESSONS = [
  {
    id: "homerow",
    title: "Ana Sıra",
    description: "ASDF ve JKL; tuşlarını öğren",
    keys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    allKeys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    targetWpm: 20,
    targetAccuracy: 95,
  },
  {
    id: "upper",
    title: "Üst Sıra",
    description: "QWERT ve YUIOP tuşlarını ekle",
    keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    allKeys: ["a", "s", "d", "f", "j", "k", "l", ";", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    targetWpm: 30,
    targetAccuracy: 93,
  },
  {
    id: "lower",
    title: "Alt Sıra",
    description: "ZXCV ve BNM tuşlarını ekle",
    keys: ["z", "x", "c", "v", "b", "n", "m", ",", "."],
    allKeys: ["a", "s", "d", "f", "j", "k", "l", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "z", "x", "c", "v", "b", "n", "m"],
    targetWpm: 40,
    targetAccuracy: 93,
  },
  {
    id: "numbers",
    title: "Sayılar",
    description: "1-0 rakamlarını ekle",
    keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    allKeys: ["a","s","d","f","j","k","l","q","w","e","r","t","y","u","i","o","p","z","x","c","v","b","n","m","1","2","3","4","5","6","7","8","9","0"],
    targetWpm: 40,
    targetAccuracy: 90,
  },
  {
    id: "capitals",
    title: "Büyük Harfler",
    description: "Shift + harf kombinasyonları",
    keys: ["A","S","D","F","J","K","L","Q","W","E","R","T","Y","U","I","O","P","Z","X","C","V","B","N","M"],
    allKeys: ["a","s","d","f","j","k","l","q","w","e","r","t","y","u","i","o","p","z","x","c","v","b","n","m","A","S","D","F","J","K","L","Q","W","E","R","T","Y","U","I","O","P","Z","X","C","V","B","N","M"],
    targetWpm: 45,
    targetAccuracy: 90,
  },
  {
    id: "punctuation",
    title: "Noktalama",
    description: "Noktalama işaretleri ve özel karakterler",
    keys: [".", ",", "!", "?", ";", ":", "-", "'", '"', "(", ")"],
    allKeys: ["a","s","d","f","j","k","l","q","w","e","r","t","y","u","i","o","p","z","x","c","v","b","n","m",".",",","!","?",";",":"," -","'",'"'],
    targetWpm: 40,
    targetAccuracy: 88,
  },
  {
    id: "mixed",
    title: "Tam Pratik",
    description: "Tüm tuşlar — kelimeler ve cümleler",
    keys: [],
    allKeys: [],
    targetWpm: 60,
    targetAccuracy: 90,
  },
];

// ─── Word Generator for Adaptive Learning ─────────────────
// Generates words using only the allowed keys for current lesson
const SYLLABLES = {
  simple: ["as", "ad", "fa", "da", "sa", "ka", "la", "ja", "ak"],
  cv: ["at", "if", "ask", "sad", "lad", "add", "fad", "jab", "jag", "lag", "lads"],
};

function generateAdaptiveWord(
  allowedKeys: string[],
  adaptiveStats: AdaptiveKeyStats,
  minLen = 3,
  maxLen = 7
): string {
  const lowerAllowed = allowedKeys.map((k) => k.toLowerCase()).filter((k) => k.length === 1 && /[a-z]/.test(k));
  
  if (lowerAllowed.length === 0) return "asdf";

  // Weight keys by error rate (more errors = higher weight = more practice)
  const weights = lowerAllowed.map((k) => {
    const stats = adaptiveStats[k];
    if (!stats || stats.attempts === 0) return 1;
    const errorRate = stats.errors / stats.attempts;
    return 1 + errorRate * 4;
  });

  const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
  let word = "";
  for (let i = 0; i < len; i++) {
    word += weightedRandom(lowerAllowed, weights);
  }
  return word;
}

// ─── Hook ─────────────────────────────────────────────────
export function useAdaptiveLearning() {
  const statsRef = useRef<AdaptiveKeyStats>({});

  const loadStats = useCallback((stats: AdaptiveKeyStats) => {
    statsRef.current = stats;
  }, []);

  const recordKeystroke = useCallback((key: string, wasError: boolean, delta: number) => {
    const k = key.toLowerCase();
    const existing = statsRef.current[k] ?? { attempts: 0, errors: 0, avgDelta: 0 };
    const attempts = existing.attempts + 1;
    const errors = existing.errors + (wasError ? 1 : 0);
    const avgDelta = (existing.avgDelta * existing.attempts + delta) / attempts;
    statsRef.current[k] = { attempts, errors, avgDelta };
  }, []);

  const generateAdaptiveWords = useCallback(
    (lessonId: string, count = 30): string[] => {
      const lesson = LESSONS.find((l) => l.id === lessonId);
      if (!lesson) return [];

      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(generateAdaptiveWord(lesson.allKeys, statsRef.current));
      }
      return words;
    },
    []
  );

  const getWeakestKeys = useCallback((topN = 5): string[] => {
    const entries = Object.entries(statsRef.current)
      .filter(([, stats]) => stats.attempts >= 5)
      .map(([key, stats]) => ({
        key,
        errorRate: stats.errors / stats.attempts,
      }))
      .sort((a, b) => b.errorRate - a.errorRate);
    return entries.slice(0, topN).map((e) => e.key);
  }, []);

  const getLessonProgress = useCallback((lessonId: string) => {
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (!lesson) return { mastered: false, avgAccuracy: 0 };

    const relevantKeys = lesson.allKeys.filter((k) => k.length === 1);
    if (relevantKeys.length === 0) return { mastered: false, avgAccuracy: 0 };

    const stats = relevantKeys
      .map((k) => statsRef.current[k.toLowerCase()])
      .filter(Boolean);

    if (stats.length === 0) return { mastered: false, avgAccuracy: 0 };

    const avgErrorRate =
      stats.reduce((sum, s) => sum + s!.errors / s!.attempts, 0) / stats.length;
    const avgAccuracy = Math.round((1 - avgErrorRate) * 100);
    const mastered = avgAccuracy >= lesson.targetAccuracy;

    return { mastered, avgAccuracy };
  }, []);

  const getCurrentStats = useCallback(() => statsRef.current, []);

  return {
    loadStats,
    recordKeystroke,
    generateAdaptiveWords,
    getWeakestKeys,
    getLessonProgress,
    getCurrentStats,
    LESSONS,
  };
}
