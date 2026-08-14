"use client";
// ============================================================
// aegisTyping — Typing Arena
// GPU-accelerated smooth word & character renderer
// Clean line containment with zero awkward half-line clippings.
// Pure liquid glassmorphism.
// ============================================================
import React, { useRef, useEffect, useMemo, useState } from "react";
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
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const FONT_MAP: Record<TypingFont, string> = {
  "geist-mono": 'var(--font-geist-mono, "Geist Mono", monospace)',
  "jetbrains-mono": '"JetBrains Mono", monospace',
  "fira-code": '"Fira Code", monospace',
  courier: '"Courier New", monospace',
};

const LINE_HEIGHT_MULTIPLIER = 1.65;

// Individual Character with state-based styling
const CharSpan = React.memo(function CharSpan({
  char,
  state,
  blindMode,
}: {
  char: string;
  state: "pending" | "correct" | "incorrect" | "extra";
  blindMode: boolean;
}) {
  let color = "var(--at-pending, rgba(255,255,255,0.45))";
  let bg = "transparent";

  if (blindMode && (state === "correct" || state === "incorrect")) {
    color = "transparent";
  } else if (state === "correct") {
    color = "var(--at-correct, #22c55e)";
  } else if (state === "incorrect") {
    color = "var(--at-error, #ef4444)";
    bg = "rgba(239, 68, 68, 0.22)";
  } else if (state === "extra") {
    color = "#f87171";
    bg = "rgba(239, 68, 68, 0.3)";
  }

  return (
    <span
      className="inline-block transition-colors duration-75 rounded-[3px]"
      style={{
        color,
        background: bg,
        letterSpacing: "0.02em",
        textShadow:
          state === "correct"
            ? "0 0 12px rgba(34, 197, 94, 0.45)"
            : state === "incorrect"
            ? "0 0 12px rgba(239, 68, 68, 0.5)"
            : "none",
      }}
    >
      {char}
    </span>
  );
});

export function TypingArena({
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
  inputRef,
}: TypingArenaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  const lineHeight = fontSize * LINE_HEIGHT_MULTIPLIER;
  const viewportHeight = lineHeight * lineCount;

  // Auto focus input on mount & click
  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  // Keep hidden input focused when typing anywhere
  const handleContainerClick = () => {
    inputRef?.current?.focus();
  };

  // ─── Caret Positioning & Line Scrolling ─────────────────
  useEffect(() => {
    if (!wordsWrapperRef.current || !caretRef.current || caretStyle === "off") return;

    const currentWordEl = wordsWrapperRef.current.querySelector(
      `[data-word-index="${caretPosition.wordIndex}"]`
    ) as HTMLElement | null;

    if (!currentWordEl) return;

    const charSpans = currentWordEl.querySelectorAll("span");
    const wrapperRect = wordsWrapperRef.current.getBoundingClientRect();

    let x = 0;
    let y = 0;

    if (caretPosition.charIndex < charSpans.length) {
      const charEl = charSpans[caretPosition.charIndex] as HTMLElement;
      if (charEl) {
        const charRect = charEl.getBoundingClientRect();
        x = charRect.left - wrapperRect.left;
        y = charRect.top - wrapperRect.top;
      }
    } else if (charSpans.length > 0) {
      const lastCharEl = charSpans[charSpans.length - 1] as HTMLElement;
      const lastCharRect = lastCharEl.getBoundingClientRect();
      x = lastCharRect.right - wrapperRect.left;
      y = lastCharRect.top - wrapperRect.top;
    } else {
      const wordRect = currentWordEl.getBoundingClientRect();
      x = wordRect.left - wrapperRect.left;
      y = wordRect.top - wrapperRect.top;
    }

    caretRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    // Calculate line-based scroll: keep current active line inside visible window
    const activeLine = Math.floor(y / lineHeight);
    if (activeLine >= lineCount - 1 && activeLine > 0) {
      const newScroll = (activeLine - (lineCount > 1 ? 1 : 0)) * lineHeight;
      setScrollY(newScroll);
    } else if (activeLine === 0) {
      setScrollY(0);
    }
  }, [caretPosition, words, caretStyle, lineHeight, lineCount]);

  // ─── Caret Dimensions & Styling ─────────────────────────
  const caretDimensions = useMemo(() => {
    const charH = fontSize * LINE_HEIGHT_MULTIPLIER;
    switch (caretStyle) {
      case "line":
        return { width: "3px", height: `${charH * 0.72}px`, background: caretColor, borderRadius: "2px" };
      case "block":
        return { width: `${fontSize * 0.62}px`, height: `${charH * 0.78}px`, background: caretColor, opacity: 0.35, borderRadius: "3px" };
      case "underscore":
        return { width: `${fontSize * 0.62}px`, height: "3.5px", background: caretColor, marginTop: `${charH * 0.72}px`, borderRadius: "2px" };
      default:
        return { width: "0", height: "0" };
    }
  }, [caretStyle, caretColor, fontSize]);

  // ─── Dynamic Font and Container Styles ───────────────────
  const wordsStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      lineHeight: `${lineHeight}px`,
      fontFamily: FONT_MAP[fontFamily],
      direction: rtl ? ("rtl" as const) : ("ltr" as const),
      transform: `${funbox === "mirror" ? "scaleX(-1) " : ""}translateY(-${scrollY}px)`,
      transition: "transform 140ms cubic-bezier(0.16, 1, 0.3, 1)",
    }),
    [fontSize, lineHeight, fontFamily, rtl, funbox, scrollY]
  );

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-text overflow-hidden py-1"
      onClick={handleContainerClick}
      style={{
        height: `${viewportHeight}px`,
      }}
      aria-label="Yazma alanı"
      role="textbox"
      aria-multiline="true"
    >
      {/* Hidden input for keyboard capture (mobile-friendly) */}
      <input
        ref={inputRef}
        className="absolute opacity-0 w-0 h-0 left-0 top-0 pointer-events-none"
        aria-hidden="true"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        onPaste={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
      />

      {/* Words container */}
      <div
        ref={wordsWrapperRef}
        className="relative flex flex-wrap gap-x-3.5 content-start will-change-transform"
        style={wordsStyle}
      >
        {/* Caret */}
        {caretStyle !== "off" && (
          <div
            ref={caretRef}
            className="absolute top-0 left-0 pointer-events-none z-20"
            style={{
              ...caretDimensions,
              boxShadow: `0 0 12px ${caretColor}`,
              transition:
                smoothCaret && !reducedMotion
                  ? "transform 70ms cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
              animation:
                caretStyle === "line" && phase === "idle"
                  ? "aegis-caret-blink 1s step-end infinite"
                  : "none",
            }}
          />
        )}

        {/* Words */}
        {words.map((word, absIdx) => {
          const isActive = absIdx === currentWordIndex;
          const isDone = absIdx < currentWordIndex;

          return (
            <div
              key={`${absIdx}-${word.original}`}
              data-word-index={absIdx}
              className="relative inline-flex items-center rounded-lg px-0.5"
              style={{
                background: isActive ? "var(--at-highlight, rgba(34,211,238,0.1))" : "transparent",
                transition: "background 90ms ease, opacity 90ms ease",
                opacity: isDone ? 0.4 : 1,
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

      {/* Countdown overlay */}
      {phase === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center z-30 backdrop-blur-md rounded-3xl bg-black/40">
          <p
            className="text-6xl font-bold tabular-nums animate-pulse"
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
}
