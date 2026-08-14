"use client";
// ============================================================
// aegisTyping — Adaptive Learning Hook (Keybr-style)
// ============================================================
import { useCallback, useRef } from "react";
import type { AdaptiveKeyStats } from "../types";

export interface LessonDef {
  id: string;
  title: string;
  description: string;
  keys: string[];
  allKeys: string[];
  targetWpm: number;
  targetAccuracy: number;
  sampleWords: string[];
}

export const LESSONS: LessonDef[] = [
  {
    id: "homerow",
    title: "Ev Sırası (Home Row)",
    description: "A S D F ve J K L ; temel parmak pozisyonu",
    keys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    allKeys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    targetWpm: 25,
    targetAccuracy: 95,
    sampleWords: [
      "asdf", "jkl;", "sad", "fads", "lass", "fall", "glad", "lads", "flask",
      "salsa", "salad", "alfalfa", "mask", "alas", "dada", "flak", "skal",
      "all", "ask", "fall", "flask", "jack", "half", "flash", "hall", "fall"
    ],
  },
  {
    id: "upperrow",
    title: "Üst Sıra (Top Row)",
    description: "Q W E R T ve Y U I O P üst tuş uzanımları",
    keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    allKeys: ["a", "s", "d", "f", "j", "k", "l", ";", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    targetWpm: 35,
    targetAccuracy: 93,
    sampleWords: [
      "wire", "type", "port", "tree", "pour", "power", "tower", "quiet", "root",
      "peer", "equip", "pure", "trip", "prep", "post", "wrap", "quote", "write",
      "water", "outer", "proper", "report", "writer", "require", "people", "output"
    ],
  },
  {
    id: "bottomrow",
    title: "Alt Sıra (Bottom Row)",
    description: "Z X C V ve B N M alt tuş uzanımları",
    keys: ["z", "x", "c", "v", "b", "n", "m"],
    allKeys: ["a", "s", "d", "f", "j", "k", "l", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "z", "x", "c", "v", "b", "n", "m"],
    targetWpm: 40,
    targetAccuracy: 92,
    sampleWords: [
      "man", "scan", "calm", "zoom", "ban", "cab", "zinc", "moon", "mob",
      "vacuum", "mix", "buzz", "maze", "size", "climb", "verb", "back", "next",
      "box", "van", "zone", "basic", "cover", "carbon", "common", "combine"
    ],
  },
  {
    id: "numbers",
    title: "Rakamlar & Noktalama",
    description: "1-0 sayı satırı ve temel noktalama işaretleri",
    keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", ",", "!", "?"],
    allKeys: ["a","s","d","f","j","k","l","q","w","e","r","t","y","u","i","o","p","z","x","c","v","b","n","m","1","2","3","4","5","6","7","8","9","0",".",",","!","?"],
    targetWpm: 35,
    targetAccuracy: 90,
    sampleWords: [
      "kod42", "2026", "test99", "100km", "500ms", "24saat", "365gün", "10fast",
      "80wpm", "1999", "madde1.", "adım2,", "oran: %50", "hız=120", "sayı: 3.14",
      "fiyat: 450", "kod: 7890", "ip: 192.168.1.1", "yıl: 2025!"
    ],
  },
  {
    id: "capitals",
    title: "Büyük Harfler",
    description: "Shift tuşu ile büyük harf geçişleri",
    keys: ["A","S","D","F","J","K","L","Q","W","E","R","T","Y","U","I","O","P","Z","X","C","V","B","N","M"],
    allKeys: ["a","s","d","f","j","k","l","q","w","e","r","t","y","u","i","o","p","z","x","c","v","b","n","m","A","S","D","F","J","K","L","Q","W","E","R","T","Y","U","I","O","P","Z","X","C","V","B","N","M"],
    targetWpm: 45,
    targetAccuracy: 90,
    sampleWords: [
      "Türkiye", "EverythingHub", "Aegis", "Ankara", "İstanbul", "Avrupa", "Asya",
      "React", "NextJS", "TypeScript", "JavaScript", "Python", "Linux", "Windows",
      "Google", "DeepMind", "Antigravity", "Studio", "Terminal", "Developer"
    ],
  },
  {
    id: "mixed",
    title: "Karma İleri Seviye",
    description: "Tüm klavye, harfler, sayılar ve semboller bir arada",
    keys: [],
    allKeys: [],
    targetWpm: 60,
    targetAccuracy: 92,
    sampleWords: [
      "hızlı", "yazma", "pratiği", "parmak", "hafızasını", "geliştirir.", "Her",
      "gün", "15", "dakika", "çalışmak,", "yazma", "hızınızı", "2", "katına",
      "çıkarabilir!", "Doğruluk", "oranı", "%98", "üzerinde", "olduğunda,", "hız",
      "kendiliğinden", "artacaktır.", "AegisTyping", "ile", "profesyonel", "yazın."
    ],
  },
];

/**
 * Generate drill words for a specific lesson
 */
export function generateLessonWords(lessonId: string, count = 80): string[] {
  const lesson = LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0];
  const pool = lesson.sampleWords;
  const result: string[] = [];

  while (result.length < count) {
    const w = pool[Math.floor(Math.random() * pool.length)];
    result.push(w);
  }

  return result.slice(0, count);
}

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

  return {
    loadStats,
    recordKeystroke,
    getWeakestKeys,
  };
}
