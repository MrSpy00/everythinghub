"use client";
// ============================================================
// aegisTyping — Live Stats Bar
// Displays Net WPM, Accuracy, Countdown Timer, and Error Count
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
  const h = 22;
  const w = 70;
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.slice(-20).map((v, i, arr) => {
    const x = (i / Math.max(arr.length - 1, 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="opacity-75">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
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
        className="text-[11px] font-semibold uppercase tracking-wider leading-none"
        style={{ color: color ?? "var(--at-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-bold tabular-nums leading-tight mt-1 font-mono tracking-tight"
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
  accentColor = "var(--at-accent, #22d3ee)",
}: LiveStatsBarProps) {
  const isVisible = !hideStats && (phase === "running" || phase === "paused");

  // Timer countdown display
  const timerDisplay = useMemo(() => {
    if (mode === "time") {
      return `${Math.max(0, Math.ceil(remainingSeconds))}`;
    } else if (mode === "words") {
      return `${wordCount.total}/${modeValue}`;
    } else if (mode === "zen") {
      return formatDuration(elapsedSeconds);
    }
    return formatDuration(elapsedSeconds);
  }, [mode, remainingSeconds, wordCount, modeValue, elapsedSeconds]);

  const timerLabel = useMemo(() => {
    if (mode === "time") return "Kalan Süre (sn)";
    if (mode === "words") return "Kelime";
    return "Geçen Süre";
  }, [mode]);

  // Progress bar for time mode countdown
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
          transition={{ duration: 0.18 }}
          className="relative flex items-center justify-between gap-4 mb-5 pb-3 border-b border-white/5"
        >
          <div className="flex items-center gap-7">
            <StatItem label="Net WPM" value={Math.round(liveWpm)} color={accentColor} />
            <StatItem
              label="Doğruluk"
              value={`${liveAccuracy.toFixed(1)}%`}
            />
            {totalErrors > 0 && (
              <StatItem
                label="Hatalar"
                value={totalErrors}
                color="var(--at-error, #ef4444)"
              />
            )}
          </div>

          <div className="flex items-center gap-5">
            {/* Sparkline live chart */}
            <Sparkline data={wpmTimeline} color={accentColor} />

            {/* Timer Countdown */}
            <div className="flex flex-col items-end">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--at-muted)" }}
              >
                {timerLabel}
              </span>
              <span
                className="text-2xl font-bold tabular-nums font-mono leading-tight mt-1"
                style={{
                  color:
                    mode === "time" && remainingSeconds <= 5
                      ? "var(--at-error, #ef4444)"
                      : "var(--at-text)",
                }}
              >
                {timerDisplay}
              </span>
            </div>
          </div>

          {/* Progress bar for time mode */}
          {progressPercent !== null && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden rounded-full">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    remainingSeconds <= 5
                      ? "var(--at-error, #ef4444)"
                      : accentColor,
                  width: `${progressPercent}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
