"use client";
// ============================================================
// aegisTyping — Anti-Cheat Hook
// Tracks paste attempts, blur events, and keystroke timing
// ============================================================
import { useRef, useCallback } from "react";
import type { KeystrokeRecord } from "../types";
import { analyzeKeystrokes, generateResultHash } from "../utils/antiCheatUtils";

export function useAntiCheat(options: {
  preventPaste: boolean;
  tabSwitchDetection: boolean;
}) {
  const pasteAttemptsRef = useRef(0);
  const blurCountRef = useRef(0);
  const keystrokesRef = useRef<KeystrokeRecord[]>([]);
  const isTestActiveRef = useRef(false);
  const lastKeyTimeRef = useRef<number>(0);

  // ─── Start / Stop Tracking ────────────────────────────
  const startTracking = useCallback(() => {
    isTestActiveRef.current = true;
    pasteAttemptsRef.current = 0;
    blurCountRef.current = 0;
    keystrokesRef.current = [];
    lastKeyTimeRef.current = 0;
  }, []);

  const stopTracking = useCallback(() => {
    isTestActiveRef.current = false;
  }, []);

  const reset = useCallback(() => {
    pasteAttemptsRef.current = 0;
    blurCountRef.current = 0;
    keystrokesRef.current = [];
    lastKeyTimeRef.current = 0;
    isTestActiveRef.current = false;
  }, []);

  // ─── Record Paste Attempt ─────────────────────────────
  const recordPasteAttempt = useCallback(() => {
    if (options.preventPaste && isTestActiveRef.current) {
      pasteAttemptsRef.current++;
    }
  }, [options.preventPaste]);

  // ─── Record Blur Event ────────────────────────────────
  const recordBlur = useCallback(() => {
    if (options.tabSwitchDetection && isTestActiveRef.current) {
      blurCountRef.current++;
    }
  }, [options.tabSwitchDetection]);

  // ─── Record Keystroke ─────────────────────────────────
  const recordKeystroke = useCallback(
    (key: string, correct: boolean, timestamp: number) => {
      const delta =
        lastKeyTimeRef.current > 0 ? timestamp - lastKeyTimeRef.current : 0;
      lastKeyTimeRef.current = timestamp;

      keystrokesRef.current.push({
        key,
        timestamp,
        delta,
        correct,
      });
    },
    []
  );

  // ─── Generate Final Report ────────────────────────────
  const generateReport = useCallback(
    (finalWpm: number, finalAccuracy: number) => {
      return analyzeKeystrokes(
        keystrokesRef.current,
        pasteAttemptsRef.current,
        blurCountRef.current,
        finalWpm,
        finalAccuracy
      );
    },
    []
  );

  // ─── Generate Result Hash ─────────────────────────────
  const generateHash = useCallback(
    async (payload: {
      wpm: number;
      accuracy: number;
      mode: string;
      language: string;
      timestamp: number;
      duration: number;
      errors: number;
    }) => {
      return generateResultHash(payload);
    },
    []
  );

  // ─── Getters ──────────────────────────────────────────
  const getKeystrokes = useCallback(() => keystrokesRef.current, []);
  const getPasteAttempts = useCallback(() => pasteAttemptsRef.current, []);
  const getBlurCount = useCallback(() => blurCountRef.current, []);

  return {
    startTracking,
    stopTracking,
    reset,
    recordPasteAttempt,
    recordBlur,
    recordKeystroke,
    generateReport,
    generateHash,
    getKeystrokes,
    getPasteAttempts,
    getBlurCount,
  };
}
