'use client';
// ============================================================
// aegisTyping — Typing Engine (Rewritten for correctness)
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TestMode, Funbox, AegisTypingSettings, WordListData, TestResult,
  TestPhase, WordObject
} from '../types';
import { buildWordObjects, computeCharStates, injectPunctuation, injectNumbers, capitalizeWords } from '../utils/textProcessing';
import { assembleTestResult, liveNetWpm } from '../utils/statsCalculator';
import { useAntiCheat } from './useAntiCheat';
import { useAudioEngine } from './useAudioEngine';

function generateHash(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildWords(
  wordListData: WordListData | null,
  mode: TestMode,
  modeValue: number | string,
  settings: AegisTypingSettings,
  funbox: Funbox,
  customText?: string,
): WordObject[] {
  let rawWords: string[] = [];

  if (customText) {
    rawWords = customText.split(/\s+/).filter(Boolean);
  } else if (wordListData) {
    const pool = [
      ...(wordListData.words.common ?? []),
      ...(settings.punctuation || settings.numbers ? (wordListData.words.advanced ?? []) : []),
    ];
    const count = mode === 'words' && typeof modeValue === 'number' ? modeValue : 60;
    // Random selection
    rawWords = [];
    for (let i = 0; i < Math.max(count * 2, 80); i++) {
      rawWords.push(pool[Math.floor(Math.random() * pool.length)]);
    }
  }

  if (settings.punctuation) rawWords = injectPunctuation(rawWords);
  if (settings.numbers) rawWords = injectNumbers(rawWords);
  if (settings.capitalization) rawWords = capitalizeWords(rawWords);

  if (funbox === 'backwards') {
    rawWords = rawWords.map(w => w.split('').reverse().join(''));
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
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [words, setWords] = useState<WordObject[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [caretPosition, setCaretPosition] = useState({ wordIndex: 0, charIndex: 0 });
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(
    options.mode === 'time' && typeof options.modeValue === 'number' ? options.modeValue : 0
  );
  const [wordCount, setWordCount] = useState({ correct: 0, total: 0 });
  const [correctChars, setCorrectChars] = useState(0);
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [wpmTimeline, setWpmTimeline] = useState<number[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const rAFRef = useRef<number | null>(null);
  const currentTypedRef = useRef<string>('');
  const phaseRef = useRef<TestPhase>('idle');
  const correctCharsRef = useRef(0);
  const totalTypedRef = useRef(0);
  const totalErrorsRef = useRef(0);
  const wpmTimelineRef = useRef<number[]>([]);

  const antiCheat = useAntiCheat({ preventPaste: options.settings.preventPaste, tabSwitchDetection: options.settings.tabSwitchDetection });
  const audio = useAudioEngine();

  // ─── Rebuild words on option changes ──────────────────────
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.mode, options.modeValue, options.language, options.funbox,
      options.wordListData, options.customText,
      options.settings.punctuation, options.settings.numbers, options.settings.capitalization]);

  function resetState() {
    setPhase('idle');
    phaseRef.current = 'idle';
    setCurrentWordIndex(0);
    setCaretPosition({ wordIndex: 0, charIndex: 0 });
    setElapsedSeconds(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setCorrectChars(0);
    setTotalTypedChars(0);
    setTotalErrors(0);
    setWordCount({ correct: 0, total: 0 });
    setWpmTimeline([]);
    currentTypedRef.current = '';
    correctCharsRef.current = 0;
    totalTypedRef.current = 0;
    totalErrorsRef.current = 0;
    wpmTimelineRef.current = [];
    startTimeRef.current = null;
    if (rAFRef.current) {
      cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    }
    if (options.mode === 'time' && typeof options.modeValue === 'number') {
      setRemainingSeconds(options.modeValue);
    }
  }

  // ─── Build final result & call onTestComplete ───────────────
  const endTest = useCallback(() => {
    if (phaseRef.current === 'finished') return;
    setPhase('finished');
    phaseRef.current = 'finished';
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
      antiCheat: antiCheat.generateReport(liveNetWpm(correctCharsRef.current, totalErrorsRef.current, elapsed), totalTypedRef.current > 0 ? (correctCharsRef.current / totalTypedRef.current) * 100 : 100),
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

  // ─── RAF tick ─────────────────────────────────────────────
  const tick = useCallback(() => {
    if (phaseRef.current !== 'running' || !startTimeRef.current) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;

    setElapsedSeconds(elapsed);

    if (options.mode === 'time' && typeof options.modeValue === 'number') {
      const remaining = Math.max(0, options.modeValue - elapsed);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        endTest();
        return;
      }
    }

    const wpm = liveNetWpm(correctCharsRef.current, totalErrorsRef.current, elapsed);
    setLiveWpm(wpm);

    const acc = totalTypedRef.current > 0
      ? ((totalTypedRef.current - totalErrorsRef.current) / totalTypedRef.current) * 100
      : 100;
    setLiveAccuracy(Math.max(0, acc));

    const secIdx = Math.floor(elapsed);
    if (secIdx >= wpmTimelineRef.current.length) {
      wpmTimelineRef.current = [...wpmTimelineRef.current, wpm];
      setWpmTimeline([...wpmTimelineRef.current]);
    }

    rAFRef.current = requestAnimationFrame(tick);
  }, [options.mode, options.modeValue, endTest]);

  // ─── Start test ─────────────────────────────────────────
  const startTest = useCallback(() => {
    if (phaseRef.current !== 'idle') return;

    setPhase('running');
    phaseRef.current = 'running';
    startTimeRef.current = performance.now();
    antiCheat.startTracking();
    rAFRef.current = requestAnimationFrame(tick);
  }, [antiCheat, tick]);

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
    antiCheat.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, antiCheat]);

  const pauseTest = useCallback(() => {
    if (phaseRef.current === 'running') {
      setPhase('paused');
      phaseRef.current = 'paused';
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
        rAFRef.current = null;
      }
    }
  }, []);

  const resumeTest = useCallback(() => {
    if (phaseRef.current === 'paused') {
      // Adjust start time to account for pause duration
      const pausedElapsed = elapsedSeconds;
      startTimeRef.current = performance.now() - pausedElapsed * 1000;
      setPhase('running');
      phaseRef.current = 'running';
      rAFRef.current = requestAnimationFrame(tick);
    }
  }, [elapsedSeconds, tick]);

  // ─── Key handler ──────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const currentPhase = phaseRef.current;

    if (currentPhase === 'idle') {
      startTest();
    }

    if (currentPhase === 'finished') return;

    const isModifier = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Enter', 'Escape'].includes(e.key);
    if (isModifier) return;

    e.preventDefault();
    antiCheat.recordKeystroke(e.key, true, performance.now());

    if (phaseRef.current !== 'running') return;

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    // ─── Backspace ──────────────────────────
    if (e.key === 'Backspace') {
      if (options.settings.confidenceMode) return;
      if (options.funbox === 'no-backspace') return;

      if (currentTypedRef.current.length > 0) {
        currentTypedRef.current = currentTypedRef.current.slice(0, -1);
        const newCharIndex = currentTypedRef.current.length;
        setCaretPosition({ wordIndex: currentWordIndex, charIndex: newCharIndex });

        // Update char states
        setWords(prev => {
          const updated = [...prev];
          updated[currentWordIndex] = {
            ...updated[currentWordIndex],
            typed: currentTypedRef.current,
            chars: computeCharStates(updated[currentWordIndex].original, currentTypedRef.current),
          };
          return updated;
        });
      } else if (currentWordIndex > 0) {
        // Go back to previous word
        const prevIdx = currentWordIndex - 1;
        setCurrentWordIndex(prevIdx);
        currentTypedRef.current = words[prevIdx]?.typed ?? '';
        const prevCharIdx = currentTypedRef.current.length;
        setCaretPosition({ wordIndex: prevIdx, charIndex: prevCharIdx });
      }
      return;
    }

    // ─── Space (advance word) ───────────────
    if (e.key === ' ') {
      if (currentTypedRef.current.length === 0) return;

      const isCorrect = currentTypedRef.current === currentWord.original;
      setWordCount(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));

      setWords(prev => {
        const updated = [...prev];
        updated[currentWordIndex] = {
          ...updated[currentWordIndex],
          typed: currentTypedRef.current,
          state: isCorrect ? 'correct' : 'incorrect',
          chars: computeCharStates(updated[currentWordIndex].original, currentTypedRef.current),
        };
        return updated;
      });

      const nextIdx = currentWordIndex + 1;
      currentTypedRef.current = '';
      setCurrentWordIndex(nextIdx);
      setCaretPosition({ wordIndex: nextIdx, charIndex: 0 });

      audio.playWordComplete();

      // Check word mode end
      if (options.mode === 'words' && nextIdx >= Number(options.modeValue)) {
        endTest();
      }

      // Auto-extend words if near end
      if (nextIdx >= words.length - 10 && options.mode !== 'words' && options.mode !== 'quote' && options.mode !== 'custom') {
        setWords(prev => {
          const extension = buildWords(
            options.wordListData, options.mode, options.modeValue,
            options.settings, options.funbox, options.customText
          ).slice(0, 30);
          return [...prev, ...extension];
        });
      }

      return;
    }

    // ─── Normal character ────────────────────
    const typed = currentTypedRef.current + e.key;
    const expectedChar = currentWord.original[currentTypedRef.current.length];
    const isCorrectChar = e.key === expectedChar;

    totalTypedRef.current += 1;
    totalTypedRef.current = totalTypedRef.current;
    setTotalTypedChars(prev => prev + 1);

    if (isCorrectChar) {
      correctCharsRef.current += 1;
      setCorrectChars(prev => prev + 1);
      audio.playKeyClick();
    } else {
      totalErrorsRef.current += 1;
      setTotalErrors(prev => prev + 1);
      audio.playError();

      if (options.funbox === 'sudden-death' || options.settings.strictMode) {
        endTest();
        return;
      }
      if (options.funbox === 'stop-on-error') {
        return;
      }
    }

    currentTypedRef.current = typed;
    setCaretPosition({ wordIndex: currentWordIndex, charIndex: typed.length });

    setWords(prev => {
      const updated = [...prev];
      if (updated[currentWordIndex]) {
        updated[currentWordIndex] = {
          ...updated[currentWordIndex],
          typed,
          chars: computeCharStates(updated[currentWordIndex].original, typed),
        };
      }
      return updated;
    });
  }, [words, currentWordIndex, options, startTest, audio, antiCheat, endTest]);

  const handleInput = useCallback(() => {
    // Mobile input handled via keydown events on the hidden input
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  return {
    phase,
    words,
    currentWordIndex,
    caretPosition,
    liveWpm,
    liveAccuracy,
    elapsedSeconds,
    remainingSeconds,
    wordCount,
    correctChars,
    totalTypedChars,
    totalErrors,
    wpmTimeline,
    handleKeyDown,
    handleInput,
    startTest,
    resetTest,
    pauseTest,
    resumeTest,
  };
}
