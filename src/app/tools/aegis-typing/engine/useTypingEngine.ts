"use client";
// ============================================================
// aegisTyping — Typing Engine
// Millisecond precision timer, accurate countdown, code generator,
// adaptive lesson drills, diacritic support, and anti-cheat telemetry.
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import {
  TestMode,
  Funbox,
  AegisTypingSettings,
  WordListData,
  TestResult,
  TestPhase,
  WordObject,
} from "../types";
import {
  buildWordObjects,
  computeCharStates,
  injectPunctuation,
  injectNumbers,
  capitalizeWords,
} from "../utils/textProcessing";
import { assembleTestResult, liveNetWpm } from "../utils/statsCalculator";
import { useAntiCheat } from "./useAntiCheat";
import { useAudioEngine } from "./useAudioEngine";
import { generateCodeWords, SupportedCodeLang } from "../utils/codeGenerator";
import { generateLessonWords } from "./useAdaptiveLearning";

function generateHash(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildWords(
  wordListData: WordListData | null,
  mode: TestMode,
  modeValue: number | string,
  settings: AegisTypingSettings,
  funbox: Funbox,
  customText?: string
): WordObject[] {
  let rawWords: string[] = [];

  if (mode === "custom" && customText && customText.trim().length > 0) {
    rawWords = customText.trim().split(/\s+/).filter(Boolean);
  } else if (mode === "code") {
    const lang = (String(modeValue || "js") as SupportedCodeLang);
    rawWords = generateCodeWords(lang, 120);
  } else if (mode === "learn") {
    const lessonId = String(modeValue || "homerow");
    rawWords = generateLessonWords(lessonId, 100);
  } else if (mode === "quote" && wordListData?.quotes && wordListData.quotes.length > 0) {
    const quotes = wordListData.quotes;
    let filtered = quotes;
    if (modeValue === "short") {
      filtered = quotes.filter((q) => q.text.length < 100);
    } else if (modeValue === "medium") {
      filtered = quotes.filter((q) => q.text.length >= 100 && q.text.length < 250);
    } else if (modeValue === "long") {
      filtered = quotes.filter((q) => q.text.length >= 250);
    }
    const chosen =
      filtered.length > 0
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : quotes[Math.floor(Math.random() * quotes.length)];
    rawWords = chosen.text.split(/\s+/).filter(Boolean);
  } else if (wordListData) {
    const pool = [
      ...(wordListData.words.common ?? []),
      ...(settings.punctuation || settings.numbers
        ? wordListData.words.advanced ?? []
        : []),
    ];
    if (pool.length === 0) {
      pool.push("the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog");
    }
    const count =
      mode === "words" && !isNaN(Number(modeValue)) ? Number(modeValue) : 100;
    rawWords = [];
    for (let i = 0; i < Math.max(count * 2, 100); i++) {
      rawWords.push(pool[Math.floor(Math.random() * pool.length)]);
    }
  } else {
    rawWords = ["yazma", "hızı", "testi", "pratik", "kelime", "hız", "öğrenme", "stüdyo", "odaklanma", "gelişim", "performans", "klavye"];
  }

  if (mode !== "code" && mode !== "quote" && mode !== "learn") {
    if (settings.punctuation) rawWords = injectPunctuation(rawWords);
    if (settings.numbers) rawWords = injectNumbers(rawWords);
    if (settings.capitalization) rawWords = capitalizeWords(rawWords);
  }

  if (funbox === "backwards") {
    rawWords = rawWords.map((w) => w.split("").reverse().join(""));
  }

  return buildWordObjects(rawWords);
}

export function useTypingEngine(options: {
  mode: TestMode;
  modeValue: number | string;
  language: string;
  funbox: Funbox;
  settings: AegisTypingSettings;
  wordListData: WordListData | null;
  lessonId?: string;
  customText?: string;
  onTestComplete?: (result: TestResult) => void;
}) {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [words, setWords] = useState<WordObject[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [caretPosition, setCaretPosition] = useState({ wordIndex: 0, charIndex: 0 });
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const initialTargetTime =
    options.mode === "time" ? Number(options.modeValue) || 60 : 0;
  const [remainingSeconds, setRemainingSeconds] = useState(initialTargetTime);

  const [wordCount, setWordCount] = useState({ correct: 0, total: 0 });
  const [correctChars, setCorrectChars] = useState(0);
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [wpmTimeline, setWpmTimeline] = useState<number[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const rAFRef = useRef<number | null>(null);
  const currentTypedRef = useRef<string>("");
  const phaseRef = useRef<TestPhase>("idle");
  const correctCharsRef = useRef(0);
  const totalTypedRef = useRef(0);
  const totalErrorsRef = useRef(0);
  const wpmTimelineRef = useRef<number[]>([]);

  const antiCheat = useAntiCheat({
    preventPaste: options.settings.preventPaste,
    tabSwitchDetection: options.settings.tabSwitchDetection,
  });
  const audio = useAudioEngine();

  // ─── Reset / Rebuild State ────────────────────────────────
  const resetState = useCallback(() => {
    setPhase("idle");
    phaseRef.current = "idle";
    setCurrentWordIndex(0);
    setCaretPosition({ wordIndex: 0, charIndex: 0 });
    setElapsedSeconds(0);
    const target = options.mode === "time" ? Number(options.modeValue) || 60 : 0;
    setRemainingSeconds(target);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setCorrectChars(0);
    setTotalTypedChars(0);
    setTotalErrors(0);
    setWordCount({ correct: 0, total: 0 });
    setWpmTimeline([]);
    currentTypedRef.current = "";
    correctCharsRef.current = 0;
    totalTypedRef.current = 0;
    totalErrorsRef.current = 0;
    wpmTimelineRef.current = [];
    startTimeRef.current = null;
    if (rAFRef.current) {
      cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    }
  }, [options.mode, options.modeValue]);

  useEffect(() => {
    const built = buildWords(
      options.wordListData,
      options.mode,
      options.modeValue,
      options.settings,
      options.funbox,
      options.customText
    );
    setWords(built);
    resetState();
  }, [
    options.mode,
    options.modeValue,
    options.settings,
    options.funbox,
    options.customText,
    options.wordListData,
    resetState,
  ]);

  // Sync target countdown when modeValue changes in idle
  useEffect(() => {
    if (phase === "idle" && options.mode === "time") {
      const target = Number(options.modeValue) || 60;
      setRemainingSeconds(target);
    }
  }, [options.mode, options.modeValue, phase]);

  // ─── End Test ─────────────────────────────────────────────
  const endTest = useCallback(() => {
    if (phaseRef.current === "finished") return;
    setPhase("finished");
    phaseRef.current = "finished";

    if (rAFRef.current) {
      cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    }

    const elapsed = startTimeRef.current
      ? (performance.now() - startTimeRef.current) / 1000
      : 0;

    const partial = assembleTestResult({
      correctChars: correctCharsRef.current,
      totalTypedChars: totalTypedRef.current,
      uncorrectedErrors: totalErrorsRef.current,
      totalErrors: totalErrorsRef.current,
      keystrokes: antiCheat.getKeystrokes(),
      startTimestamp: startTimeRef.current ?? Date.now(),
      durationSeconds: elapsed,
      mode: options.mode,
      modeValue: options.modeValue,
      language: options.language,
      funbox: options.funbox,
      antiCheat: antiCheat.generateReport(
        liveNetWpm(correctCharsRef.current, totalErrorsRef.current, elapsed),
        totalTypedRef.current > 0
          ? (correctCharsRef.current / totalTypedRef.current) * 100
          : 100
      ),
      wpmTimeline: wpmTimelineRef.current,
      nickname: options.settings.nickname,
    });

    const result: TestResult = {
      ...partial,
      hash: generateHash(),
    };

    audio.playTestFinish();
    options.onTestComplete?.(result);
  }, [antiCheat, audio, options]);

  // ─── RAF tick ref ─────────────────────────────────────────
  const tickRef = useRef<() => void>(() => {});

  const tick = useCallback(() => {
    if (phaseRef.current !== "running" || !startTimeRef.current) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    setElapsedSeconds(elapsed);

    if (options.mode === "time") {
      const targetTime = Number(options.modeValue) || 60;
      const remaining = Math.max(0, targetTime - elapsed);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        endTest();
        return;
      }
    }

    const wpm = liveNetWpm(correctCharsRef.current, totalErrorsRef.current, elapsed);
    setLiveWpm(wpm);

    const acc =
      totalTypedRef.current > 0
        ? ((totalTypedRef.current - totalErrorsRef.current) / totalTypedRef.current) * 100
        : 100;
    setLiveAccuracy(Math.max(0, acc));

    const secIdx = Math.floor(elapsed);
    if (secIdx >= wpmTimelineRef.current.length) {
      wpmTimelineRef.current = [...wpmTimelineRef.current, wpm];
      setWpmTimeline([...wpmTimelineRef.current]);
    }

    rAFRef.current = requestAnimationFrame(() => tickRef.current());
  }, [options.mode, options.modeValue, endTest]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // ─── Start test ─────────────────────────────────────────
  const startTest = useCallback(() => {
    if (phaseRef.current !== "idle") return;

    setPhase("running");
    phaseRef.current = "running";
    startTimeRef.current = performance.now();
    antiCheat.startTracking();
    rAFRef.current = requestAnimationFrame(() => tickRef.current());
  }, [antiCheat]);

  // ─── Reset test ─────────────────────────────────────────
  const resetTest = useCallback(() => {
    const built = buildWords(
      options.wordListData,
      options.mode,
      options.modeValue,
      options.settings,
      options.funbox,
      options.customText
    );
    setWords(built);
    resetState();
  }, [
    options.wordListData,
    options.mode,
    options.modeValue,
    options.settings,
    options.funbox,
    options.customText,
    resetState,
  ]);

  // ─── Handle Key Down ────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ignored keys
      if (
        e.key === "Tab" ||
        e.key === "Alt" ||
        e.key === "Control" ||
        e.key === "Meta" ||
        e.key === "CapsLock" ||
        e.key === "Shift" ||
        e.key === "Escape"
      ) {
        return;
      }

      // Start on first keypress
      if (phaseRef.current === "idle") {
        startTest();
      }

      if (phaseRef.current !== "running") return;

      const currentWordObj = words[currentWordIndex];
      if (!currentWordObj) return;

      const targetWord = currentWordObj.original;
      let typed = currentTypedRef.current;

      // ── Spacebar (Word Submit) ──────────────────────────
      if (e.key === " ") {
        e.preventDefault();
        if (typed.length === 0) return; // Don't advance on empty space

        const isExactMatch = typed === targetWord;
        const nextWordIndex = currentWordIndex + 1;

        // Calculate correct chars in this word
        let matchCount = 0;
        for (let i = 0; i < Math.min(typed.length, targetWord.length); i++) {
          if (typed[i] === targetWord[i]) matchCount++;
        }
        if (isExactMatch) matchCount += 1; // count the space

        correctCharsRef.current += matchCount;
        totalTypedRef.current += 1; // space typed
        setCorrectChars(correctCharsRef.current);
        setTotalTypedChars(totalTypedRef.current);

        currentTypedRef.current = "";

        // Mark word completed
        setWords((prev) => {
          const updated = [...prev];
          if (updated[currentWordIndex]) {
            updated[currentWordIndex] = {
              ...updated[currentWordIndex],
              typed,
              state: isExactMatch ? "correct" : "incorrect",
              chars: computeCharStates(targetWord, typed),
            };
          }
          return updated;
        });

        setWordCount((prev) => ({
          correct: prev.correct + (isExactMatch ? 1 : 0),
          total: prev.total + 1,
        }));

        setCurrentWordIndex(nextWordIndex);
        setCaretPosition({ wordIndex: nextWordIndex, charIndex: 0 });

        // End condition: words mode reached
        if (options.mode === "words") {
          const targetWordCount = Number(options.modeValue) || 25;
          if (nextWordIndex >= targetWordCount || nextWordIndex >= words.length) {
            endTest();
          }
        } else if (nextWordIndex >= words.length) {
          endTest();
        }
        return;
      }

      // ── Backspace ───────────────────────────────────────
      if (e.key === "Backspace") {
        e.preventDefault();
        if (options.funbox === "no-backspace" || options.settings.confidenceMode) {
          return; // No backspace in confidence/challenge mode
        }

        if (typed.length > 0) {
          typed = typed.slice(0, -1);
          currentTypedRef.current = typed;
          setCaretPosition({ wordIndex: currentWordIndex, charIndex: typed.length });

          setWords((prev) => {
            const updated = [...prev];
            if (updated[currentWordIndex]) {
              updated[currentWordIndex] = {
                ...updated[currentWordIndex],
                typed,
                chars: computeCharStates(targetWord, typed),
              };
            }
            return updated;
          });
        }
        return;
      }

      // ── Printable Chars ─────────────────────────────────
      if (e.key.length === 1) {
        e.preventDefault();
        const nextChar = e.key;
        const targetChar = targetWord[typed.length];
        const isCorrect = targetChar === nextChar;

        antiCheat.recordKeystroke(nextChar, isCorrect, performance.now());
        totalTypedRef.current += 1;
        setTotalTypedChars(totalTypedRef.current);

        if (isCorrect) {
          audio.playKeyClick(e.shiftKey);
        } else {
          totalErrorsRef.current += 1;
          setTotalErrors(totalErrorsRef.current);
          audio.playError();

          // Sudden death challenge: 1 error = reset
          if (options.funbox === "sudden-death" || options.settings.suddenDeath) {
            resetTest();
            return;
          }

          // Stop on error: prevent advance until correct
          if (options.funbox === "stop-on-error") {
            return;
          }
        }

        typed += nextChar;
        currentTypedRef.current = typed;
        setCaretPosition({ wordIndex: currentWordIndex, charIndex: typed.length });

        setWords((prev) => {
          const updated = [...prev];
          if (updated[currentWordIndex]) {
            updated[currentWordIndex] = {
              ...updated[currentWordIndex],
              typed,
              chars: computeCharStates(targetWord, typed),
            };
          }
          return updated;
        });

        // If strict mode and wrong, reset
        if (options.settings.strictMode && !isCorrect) {
          resetTest();
          return;
        }
      }
    },
    [
      words,
      currentWordIndex,
      startTest,
      endTest,
      resetTest,
      antiCheat,
      audio,
      options,
    ]
  );

  return {
    phase,
    words,
    currentWordIndex,
    caretPosition,
    liveWpm,
    liveAccuracy,
    elapsedSeconds,
    remainingSeconds,
    totalErrors,
    wordCount,
    correctChars,
    totalTypedChars,
    wpmTimeline,
    startTest,
    resetTest,
    handleKeyDown,
  };
}
