"use client";
// ============================================================
// aegisTyping — Keyboard Overlay (Visual Keyboard)
// SVG-based keyboard with heatmap, finger zones, and live highlights
// ============================================================
import React from "react";
import { motion } from "framer-motion";

interface KeyboardOverlayProps {
  show: boolean;
  pressedKey?: string;
  errorMap?: Record<string, number>;
  layout?: string;
}

// Finger zone colors (subtle)
const FINGER_COLORS = {
  pinky:  "rgba(167,139,250,0.15)",
  ring:   "rgba(96,165,250,0.15)",
  middle: "rgba(52,211,153,0.15)",
  index:  "rgba(251,191,36,0.15)",
  thumb:  "rgba(156,163,175,0.10)",
};

interface KeyDef {
  key: string;
  label?: string;
  w?: number; // width multiplier (default 1)
  finger: keyof typeof FINGER_COLORS;
  homeRow?: boolean;
}

const QWERTY_ROWS: KeyDef[][] = [
  // Number row
  [
    { key: "`", finger: "pinky" }, { key: "1", finger: "pinky" }, { key: "2", finger: "ring" },
    { key: "3", finger: "middle" }, { key: "4", finger: "index" }, { key: "5", finger: "index" },
    { key: "6", finger: "index" }, { key: "7", finger: "index" }, { key: "8", finger: "middle" },
    { key: "9", finger: "ring" }, { key: "0", finger: "pinky" }, { key: "-", finger: "pinky" },
    { key: "=", finger: "pinky" }, { key: "Backspace", label: "⌫", w: 2, finger: "pinky" },
  ],
  // Top row
  [
    { key: "Tab", w: 1.5, finger: "pinky" },
    { key: "q", finger: "pinky" }, { key: "w", finger: "ring" }, { key: "e", finger: "middle" },
    { key: "r", finger: "index" }, { key: "t", finger: "index" }, { key: "y", finger: "index" },
    { key: "u", finger: "index" }, { key: "i", finger: "middle" }, { key: "o", finger: "ring" },
    { key: "p", finger: "pinky" }, { key: "[", finger: "pinky" }, { key: "]", finger: "pinky" },
    { key: "\\", w: 1.5, finger: "pinky" },
  ],
  // Home row
  [
    { key: "CapsLock", label: "Caps", w: 1.75, finger: "pinky" },
    { key: "a", finger: "pinky", homeRow: true }, { key: "s", finger: "ring", homeRow: true },
    { key: "d", finger: "middle", homeRow: true }, { key: "f", finger: "index", homeRow: true },
    { key: "g", finger: "index", homeRow: true }, { key: "h", finger: "index", homeRow: true },
    { key: "j", finger: "index", homeRow: true }, { key: "k", finger: "middle", homeRow: true },
    { key: "l", finger: "ring", homeRow: true }, { key: ";", finger: "pinky", homeRow: true },
    { key: "'", finger: "pinky", homeRow: true },
    { key: "Enter", label: "↵", w: 2.25, finger: "pinky" },
  ],
  // Bottom row
  [
    { key: "Shift", label: "Shift", w: 2.25, finger: "pinky" },
    { key: "z", finger: "pinky" }, { key: "x", finger: "ring" }, { key: "c", finger: "middle" },
    { key: "v", finger: "index" }, { key: "b", finger: "index" }, { key: "n", finger: "index" },
    { key: "m", finger: "index" }, { key: ",", finger: "middle" }, { key: ".", finger: "ring" },
    { key: "/", finger: "pinky" },
    { key: "Shift", label: "Shift", w: 2.75, finger: "pinky" },
  ],
  // Space row
  [
    { key: "Ctrl", label: "Ctrl", w: 1.5, finger: "pinky" },
    { key: "Alt", label: "Alt", w: 1.25, finger: "thumb" },
    { key: " ", label: "Boşluk", w: 6.5, finger: "thumb" },
    { key: "Alt", label: "Alt", w: 1.25, finger: "thumb" },
    { key: "Ctrl", label: "Ctrl", w: 1.5, finger: "pinky" },
  ],
];

const KEY_W = 36; // base key width px
const KEY_H = 32; // key height px
const KEY_GAP = 3;

export const KeyboardOverlay = React.memo(function KeyboardOverlay({
  show,
  pressedKey,
  errorMap = {},
}: KeyboardOverlayProps) {
  if (!show) return null;

  // Get max error count for normalization
  const maxErrors = Math.max(...Object.values(errorMap), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mt-4 overflow-x-auto pb-2"
      style={{ maxWidth: "100%" }}
      aria-hidden="true"
    >
      <div className="inline-block min-w-fit">
        {QWERTY_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex" style={{ gap: KEY_GAP, marginBottom: KEY_GAP }}>
            {row.map((keyDef, ki) => {
              const w = (keyDef.w ?? 1) * KEY_W + ((keyDef.w ?? 1) - 1) * KEY_GAP;
              const isPressed =
                pressedKey?.toLowerCase() === keyDef.key.toLowerCase() ||
                (pressedKey === " " && keyDef.key === " ");
              const errorCount = errorMap[keyDef.key.toLowerCase()] ?? 0;
              const errorIntensity = errorCount / maxErrors;

              // Determine background
              let bg = FINGER_COLORS[keyDef.finger];
              if (errorIntensity > 0) {
                bg = `rgba(239,68,68,${errorIntensity * 0.6})`;
              }
              if (keyDef.homeRow) {
                bg = bg.replace("0.15", "0.25").replace("0.10", "0.20");
              }
              if (isPressed) {
                bg = "var(--at-accent)";
              }

              return (
                <motion.div
                  key={`${keyDef.key}-${ki}`}
                  animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 25 }}
                  className="rounded flex items-center justify-center text-center select-none"
                  style={{
                    width: w,
                    height: KEY_H,
                    background: bg,
                    border: `1px solid ${isPressed ? "var(--at-accent)" : keyDef.homeRow ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}`,
                    fontSize: w > 50 ? 10 : 11,
                    fontFamily: "monospace",
                    color: isPressed ? "var(--at-bg)" : "var(--at-muted)",
                    fontWeight: keyDef.homeRow ? 700 : 400,
                    cursor: "default",
                    flexShrink: 0,
                    position: "relative",
                    boxShadow: keyDef.homeRow
                      ? "inset 0 -2px 0 rgba(255,255,255,0.1)"
                      : "none",
                  }}
                >
                  {keyDef.label ?? keyDef.key.toUpperCase()}

                  {/* Home row bump */}
                  {(keyDef.key === "f" || keyDef.key === "j") && !isPressed && (
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.3)" }}
                    />
                  )}

                  {/* Error count badge */}
                  {errorCount > 0 && !isPressed && (
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold"
                      style={{ background: "#ef4444", color: "#fff" }}
                    >
                      {errorCount > 9 ? "9+" : errorCount}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-2 px-1">
          {Object.entries(FINGER_COLORS).slice(0, 4).map(([finger, color]) => (
            <div key={finger} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: color, border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <span className="text-[9px]" style={{ color: "var(--at-muted)" }}>
                {finger === "pinky" ? "Serçe" : finger === "ring" ? "Yüzük" : finger === "middle" ? "Orta" : "İşaret"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});
