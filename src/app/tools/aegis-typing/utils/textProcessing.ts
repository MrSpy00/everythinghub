// ============================================================
// aegisTyping — Text Processing Utilities
// ============================================================
import type { WordObject, CharObject, CharState } from "../types";

// ─── Unicode-Safe Character Split ─────────────────────────
// Uses Intl.Segmenter for grapheme cluster support (emoji, CJK, combining chars)
export function splitGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  // Fallback for older environments
  return Array.from(text);
}

// ─── Build Word Objects ────────────────────────────────────
export function buildWordObjects(words: string[]): WordObject[] {
  return words.map((word) => ({
    original: word,
    typed: "",
    state: "pending",
    chars: splitGraphemes(word).map((char) => ({
      char,
      state: "pending" as CharState,
    })),
  }));
}

// ─── Update Char States for a Word ────────────────────────
export function computeCharStates(
  original: string,
  typed: string
): CharObject[] {
  const origChars = splitGraphemes(original);
  const typedChars = splitGraphemes(typed);
  const result: CharObject[] = [];

  for (let i = 0; i < origChars.length; i++) {
    const state: CharState =
      i >= typedChars.length
        ? "pending"
        : typedChars[i] === origChars[i]
        ? "correct"
        : "incorrect";
    result.push({ char: origChars[i], state });
  }

  // Extra typed chars beyond word length
  for (let i = origChars.length; i < typedChars.length; i++) {
    result.push({ char: typedChars[i], state: "extra" });
  }

  return result;
}

// ─── RTL Detection ─────────────────────────────────────────
const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "yi"]);

export function isRtlLocale(locale: string): boolean {
  const base = locale.split("-")[0];
  return RTL_LOCALES.has(base);
}

// ─── Inject Punctuation ────────────────────────────────────
export function injectPunctuation(words: string[], density = 0.2): string[] {
  return words.map((word, i) => {
    if (i === 0 || Math.random() > density) return word;
    const r = Math.random();
    if (r < 0.35) return word + ",";
    if (r < 0.55) return word + ".";
    if (r < 0.65) return word + ";";
    if (r < 0.72) return word + "!";
    if (r < 0.79) return word + "?";
    if (r < 0.84) return word + ":";
    if (r < 0.88) return `"${word}"`;
    if (r < 0.92) return `'${word}'`;
    if (r < 0.96) return word + "-";
    return `(${word})`;
  });
}

// ─── Inject Numbers ────────────────────────────────────────
export function injectNumbers(words: string[], density = 0.15): string[] {
  const result: string[] = [];
  for (const word of words) {
    result.push(word);
    if (Math.random() < density) {
      const num = Math.floor(Math.random() * 9999) + 1;
      result.push(String(num));
    }
  }
  return result;
}

// ─── Capitalize First Letter ──────────────────────────────
export function capitalizeWords(words: string[], density = 0.1): string[] {
  return words.map((word, i) => {
    if (i === 0 || Math.random() < density) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  });
}

// ─── Mirror Text (Funbox) ──────────────────────────────────
export function mirrorWord(word: string): string {
  return splitGraphemes(word).reverse().join("");
}

// ─── Scramble Word ─────────────────────────────────────────
export function scrambleWord(word: string): string {
  const chars = splitGraphemes(word);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// ─── Seeded Shuffle (reproducible word lists) ─────────────
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Random Weighted Pick ─────────────────────────────────
export function weightedRandom<T>(
  items: T[],
  weights: number[]
): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ─── Quote Chunker ─────────────────────────────────────────
export function chunkQuote(text: string, maxWords = 40): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words;
  // Take a random chunk
  const start = Math.floor(Math.random() * (words.length - maxWords));
  return words.slice(start, start + maxWords);
}

// ─── Is Word Correct ───────────────────────────────────────
export function isWordCorrect(word: WordObject): boolean {
  if (word.typed.length !== word.original.length) return false;
  return word.typed === word.original;
}

// ─── Count Word Errors ─────────────────────────────────────
export function countWordErrors(word: WordObject): number {
  const origChars = splitGraphemes(word.original);
  const typedChars = splitGraphemes(word.typed);
  let errors = 0;
  const maxLen = Math.max(origChars.length, typedChars.length);
  for (let i = 0; i < maxLen; i++) {
    if (origChars[i] !== typedChars[i]) errors++;
  }
  return errors;
}

// ─── Generate Word Slice for Viewport ─────────────────────
export function getVisibleWords(
  words: WordObject[],
  currentIndex: number,
  lineCount: number,
  avgWordsPerLine = 8
): { start: number; end: number } {
  const visibleCount = lineCount * avgWordsPerLine;
  const start = Math.max(0, Math.floor(currentIndex / avgWordsPerLine) * avgWordsPerLine - avgWordsPerLine);
  const end = Math.min(words.length, start + visibleCount + avgWordsPerLine * 2);
  return { start, end };
}

// ─── Format Duration ───────────────────────────────────────
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Truncate Text ─────────────────────────────────────────
export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}
