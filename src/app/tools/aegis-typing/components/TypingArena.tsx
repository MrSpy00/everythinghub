"use client";
// ============================================================
// aegisTyping — Typing Arena
// Core visual component where the typing happens
// ============================================================
import React, { useRef, useEffect, useMemo } from "react";
import type {
  WordObject,
  TestPhase,
  CaretStyle,
  TypingFont,
  Funbox,
} from "../types";

interface TypingArenaProps {
  words: WordObject[];
  currentWordIndex: number;
  caretPosition: { wordIndex: number; charIndex: number };
  phase: TestPhase;
  caretStyle: CaretStyle;
  caretColor: string;
  smoothCaret: boolean;
  caretTrail: boolean;
  caretTrailLength: number;
  fontSize: number;
  fontFamily: TypingFont;
  lineCount: number;
  rtl: boolean;
  blindMode: boolean;
  funbox: Funbox;
  wordFadeAnimation: boolean;
  reducedMotion: boolean;
  onKeyDown: (e: KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const FONT_MAP: Record<TypingFont, string> = {
  "geist-mono": "var(--font-geist-mono), 'Courier New', monospace",
  "jetbrains-mono": "'JetBrains Mono', 'Courier New', monospace",
  "fira-code": "'Fira Code', 'Courier New', monospace",
  courier: "'Courier New', Courier, monospace",
};

const LINE_HEIGHT_MULTIPLIER = 1.75;

function CharSpan({
  char,
  state,
  blindMode,
}: {
  char: string;
  state: "pending" | "correct" | "incorrect" | "extra";
  blindMode: boolean;
}) {
  const color = useMemo(() => {
    if (blindMode && (state === "correct" || state === "incorrect")) {
      return "transparent";
    }
    switch (state) {
      case "correct":
        return "var(--at-correct)";
      case "incorrect":
        return "var(--at-error)";
      case "extra":
        return "#dc2626";
      default:
        return "var(--at-pending)";
    }
  }, [state, blindMode]);

  return (
    <span
      style={{
        color,
        position: "relative",
        transition: blindMode ? "none" : "color 80ms ease",
      }}
    >
      {char === " " ? "\u00a0" : char}
    </span>
  );
}

export const TypingArena = React.memo(function TypingArena({
  words,
  currentWordIndex,
  caretPosition,
  phase,
  caretStyle,
  caretColor,
  smoothCaret,
  fontSize,
  fontFamily,
  lineCount,
  rtl,
  blindMode,
  funbox,
  reducedMotion,
  onKeyDown,
  onFocus,
  onBlur,
  inputRef: externalInputRef,
}: TypingArenaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef ?? internalInputRef;
  const caretRef = useRef<HTMLDivElement>(null);

  // ─── Focus management ──────────────────────────────────────
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // ─── Keyboard events ───────────────────────────────────────
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handler = (e: KeyboardEvent) => {
      // Prevent browser shortcuts during test
      if (phase === "running" || phase === "idle") {
        if (e.key === "Tab") {
          e.preventDefault();
        }
      }
      onKeyDown(e);
    };

    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [onKeyDown, phase, inputRef]);

  // ─── Auto-focus when test starts ───────────────────────────
  useEffect(() => {
    if (phase === "idle" || phase === "running") {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [phase, inputRef]);

  // ─── Caret DOM positioning ─────────────────────────────────
  useEffect(() => {
    if (caretStyle === "off" || !containerRef.current || !caretRef.current) return;

    const wordEls = containerRef.current.querySelectorAll<HTMLElement>("[data-word-index]");
    const wordEl = wordEls[caretPosition.wordIndex];
    if (!wordEl) return;

    const charEls = wordEl.querySelectorAll<HTMLElement>("span");
    const charEl = charEls[caretPosition.charIndex];

    let left: number;
    let top: number;

    if (charEl) {
      const charRect = charEl.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      left = charRect.left - containerRect.left;
      top = charRect.top - containerRect.top;
    } else if (charEls.length > 0) {
      // End of word
      const lastChar = charEls[charEls.length - 1];
      const lastRect = lastChar.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      left = lastRect.right - containerRect.left;
      top = lastRect.top - containerRect.top;
    } else {
      const wordRect = wordEl.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      left = wordRect.left - containerRect.left;
      top = wordRect.top - containerRect.top;
    }

    const caret = caretRef.current;
    caret.style.transform = `translate(${left}px, ${top}px)`;
  }, [caretPosition, caretStyle, words]);

  // ─── Funbox transforms ─────────────────────────────────────
  const containerStyle = useMemo(() => {
    const base: React.CSSProperties = {
      fontFamily: FONT_MAP[fontFamily],
      fontSize: fontSize,
      lineHeight: LINE_HEIGHT_MULTIPLIER,
      direction: rtl ? "rtl" : "ltr",
    };

    if (funbox === "mirror") {
      base.transform = "scaleX(-1)";
    }

    return base;
  }, [fontFamily, fontSize, rtl, funbox]);

  // ─── Visible word range (windowing) ────────────────────────
  const { startIdx, endIdx } = useMemo(() => {
    const wordsPerLine = 8;
    const visibleLines = lineCount + 1;
    const currentLine = Math.floor(currentWordIndex / wordsPerLine);
    const start = Math.max(0, (currentLine - 1) * wordsPerLine);
    const end = Math.min(words.length, start + visibleLines * wordsPerLine + wordsPerLine);
    return { startIdx: start, endIdx: end };
  }, [currentWordIndex, lineCount, words.length]);

  const visibleWords = words.slice(startIdx, endIdx);

  // ─── Caret dimensions ──────────────────────────────────────
  const caretDimensions = useMemo(() => {
    switch (caretStyle) {
      case "block":
        return {
          width: `${fontSize * 0.6}px`,
          height: `${fontSize * LINE_HEIGHT_MULTIPLIER}px`,
          opacity: 0.75,
          borderRadius: "2px",
          background: caretColor,
          border: "none",
        };
      case "line":
        return {
          width: "2px",
          height: `${fontSize * LINE_HEIGHT_MULTIPLIER}px`,
          background: caretColor,
          borderRadius: "1px",
          opacity: 1,
        };
      case "underscore":
        return {
          width: `${fontSize * 0.6}px`,
          height: "2px",
          background: caretColor,
          marginTop: `${fontSize * LINE_HEIGHT_MULTIPLIER - 2}px`,
          borderRadius: "1px",
        };
      default:
        return { display: "none" as const };
    }
  }, [caretStyle, caretColor, fontSize]);

  return (
    <div
      className="relative select-none cursor-text overflow-hidden"
      onClick={handleContainerClick}
      style={{
        height: `${fontSize * LINE_HEIGHT_MULTIPLIER * lineCount + 16}px`,
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 100%)",
      }}
      aria-label="Yazma alanı"
      role="textbox"
      aria-multiline="true"
    >
      {/* Hidden input for keyboard capture (mobile-friendly) */}
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className="absolute opacity-0 w-0 h-0 left-0 top-0"
        aria-hidden="true"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
        tabIndex={0}
        readOnly
        onFocus={onFocus}
        onBlur={onBlur}
        onPaste={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
      />

      {/* Word display */}
      <div
        ref={containerRef}
        className="relative flex flex-wrap gap-x-3 content-start"
        style={containerStyle}
      >
        {/* Caret */}
        {caretStyle !== "off" && (
          <div
            ref={caretRef}
            className="absolute top-0 left-0 pointer-events-none z-10"
            style={{
              ...caretDimensions,
              transition:
                smoothCaret && !reducedMotion
                  ? "transform 60ms cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
              animation:
                caretStyle === "line" && !reducedMotion
                  ? "aegis-caret-blink 1s step-end infinite"
                  : "none",
            }}
          />
        )}

        {/* Words */}
        {visibleWords.map((word, relIdx) => {
          const absIdx = startIdx + relIdx;
          const isActive = absIdx === currentWordIndex;
          const isDone = absIdx < currentWordIndex;

          return (
            <div
              key={`${absIdx}-${word.original}`}
              data-word-index={absIdx}
              className="relative inline-flex items-center rounded"
              style={{
                padding: "2px 1px",
                background: isActive
                  ? "var(--at-highlight)"
                  : "transparent",
                transition: "background 120ms ease",
                opacity: isDone ? 0.6 : 1,
              }}
            >
              {word.chars.map((ch, ci) => (
                <CharSpan
                  key={ci}
                  char={ch.char}
                  state={ch.state}
                  blindMode={blindMode}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Idle overlay */}
      {phase === "idle" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--at-muted)" }}
          >
            Yazmaya başlamak için tıkla veya bir tuşa bas
          </p>
        </div>
      )}

      {/* Countdown overlay */}
      {phase === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center z-20 backdrop-blur-sm rounded-2xl">
          <p
            className="text-6xl font-bold tabular-nums"
            style={{ color: "var(--at-accent)" }}
          >
            3
          </p>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes aegis-caret-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
});
