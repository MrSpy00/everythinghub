"use client";
// ============================================================
// aegisTyping — Live Stats Bar
// Shows WPM, accuracy, timer, errors during test
// ============================================================
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TestPhase, TestMode } from "../types";
import { formatDuration } from "../utils/textProcessing";

interface LiveStatsBarProps {
  phase: TestPhase;
  liveWpm: number;
  liveAccuracy: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  totalErrors: number;
  wordCount: { correct: number; total: number };
  mode: TestMode;
  modeValue: number | string;
  hideStats: boolean;
  wpmTimeline: number[];
  accentColor?: string;
}

// Tiny inline sparkline (SVG, 60x20px)
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const h = 20;
  const w = 60;
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.slice(-15).map((v, i, arr) => {
    const x = (i / Math.max(arr.length - 1, 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-xs font-medium leading-none"
        style={{ color: color ?? "var(--at-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-xl font-bold tabular-nums leading-tight mt-0.5 font-mono"
        style={{ color: color ?? "var(--at-text)" }}
      >
        {value}
      </span>
    </div>
  );
}

export const LiveStatsBar = React.memo(function LiveStatsBar({
  phase,
  liveWpm,
  liveAccuracy,
  elapsedSeconds,
  remainingSeconds,
  totalErrors,
  wordCount,
  mode,
  modeValue,
  hideStats,
  wpmTimeline,
  accentColor = "var(--at-accent)",
}: LiveStatsBarProps) {
  const isVisible = !hideStats && (phase === "running" || phase === "paused");

  // Timer display
  const timerDisplay = useMemo(() => {
    if (mode === "time") {
      return `${Math.ceil(remainingSeconds)}`;
    } else if (mode === "words") {
      return `${wordCount.total}/${modeValue}`;
    } else if (mode === "zen") {
      return formatDuration(elapsedSeconds);
    }
    return formatDuration(elapsedSeconds);
  }, [mode, remainingSeconds, wordCount, modeValue, elapsedSeconds]);

  const timerLabel = useMemo(() => {
    if (mode === "time") return "sn";
    if (mode === "words") return "kelime";
    return "süre";
  }, [mode]);

  // Progress bar for time mode
  const progressPercent = useMemo(() => {
    if (mode !== "time" || typeof modeValue !== "number") return null;
    return Math.max(0, Math.min(100, (remainingSeconds / modeValue) * 100));
  }, [mode, modeValue, remainingSeconds]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between gap-4 mb-4"
        >
          <div className="flex items-center gap-6">
            <StatItem label="WPM" value={Math.round(liveWpm)} color={accentColor} />
            <StatItem
              label="Doğruluk"
              value={`${liveAccuracy.toFixed(1)}%`}
            />
            {totalErrors > 0 && (
              <StatItem
                label="Hata"
                value={totalErrors}
                color="var(--at-error)"
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Sparkline */}
            <Sparkline data={wpmTimeline} color={accentColor} />

            {/* Timer */}
            <div className="flex flex-col items-end">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--at-muted)" }}
              >
                {timerLabel}
              </span>
              <span
                className="text-2xl font-bold tabular-nums font-mono leading-tight"
                style={{
                  color:
                    progressPercent !== null && progressPercent < 20
                      ? "var(--at-error)"
                      : "var(--at-text)",
                }}
              >
                {timerDisplay}
              </span>
            </div>
          </div>

          {/* Progress bar for time mode */}
          {progressPercent !== null && (
            <div className="absolute bottom-0 left-0 right-0 h-px">
              <motion.div
                className="h-full"
                style={{ background: accentColor, width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
