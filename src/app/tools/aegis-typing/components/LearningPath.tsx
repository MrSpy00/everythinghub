"use client";
// ============================================================
// aegisTyping — Learning Path Component
// Adaptive lesson-based typing practice (Keybr-style)
// ============================================================
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, Target } from "lucide-react";
import { LESSONS } from "../engine/useAdaptiveLearning";
import type { AdaptiveKeyStats } from "../types";

interface LearningPathProps {
  currentLesson: string;
  onLessonSelect: (id: string) => void;
  adaptiveStats: AdaptiveKeyStats;
  getLessonProgress: (id: string) => { mastered: boolean; avgAccuracy: number };
  getWeakestKeys: (n: number) => string[];
}

function ProgressBar({ value, color = "var(--at-accent)" }: { value: number; color?: string }) {
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

function KeyBadge({
  char,
  errorRate,
}: {
  char: string;
  errorRate: number;
}) {
  const color =
    errorRate > 0.3
      ? "#ef4444"
      : errorRate > 0.15
      ? "#f59e0b"
      : "#22c55e";

  return (
    <div
      className="flex flex-col items-center gap-1 p-2 rounded-xl"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}30`,
        minWidth: "36px",
      }}
    >
      <span className="font-mono text-sm font-bold" style={{ color }}>
        {char.toUpperCase()}
      </span>
      <span className="text-[9px]" style={{ color }}>
        {Math.round(errorRate * 100)}%
      </span>
    </div>
  );
}

export function LearningPath({
  currentLesson,
  onLessonSelect,
  adaptiveStats,
  getLessonProgress,
  getWeakestKeys,
}: LearningPathProps) {
  const weakestKeys = getWeakestKeys(8);

  return (
    <div className="space-y-6">
      {/* Weak keys panel */}
      {weakestKeys.length > 0 && (
        <div
          className="p-4 rounded-2xl space-y-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-2">
            <Target size={15} style={{ color: "var(--at-accent)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--at-text)" }}>
              Gelişim Gereken Tuşlar
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakestKeys.map((key) => {
              const stats = adaptiveStats[key];
              const errorRate =
                stats && stats.attempts > 0 ? stats.errors / stats.attempts : 0;
              return (
                <KeyBadge key={key} char={key} errorRate={errorRate} />
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson list */}
      <div className="space-y-2">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--at-muted)" }}
        >
          Ders Planı
        </p>
        {LESSONS.map((lesson, i) => {
          const { mastered, avgAccuracy } = getLessonProgress(lesson.id);
          const isActive = currentLesson === lesson.id;
          const isUnlocked =
            i === 0 ||
            getLessonProgress(LESSONS[i - 1].id).mastered;

          return (
            <motion.button
              key={lesson.id}
              onClick={() => isUnlocked && onLessonSelect(lesson.id)}
              disabled={!isUnlocked}
              whileHover={isUnlocked ? { scale: 1.01, x: 2 } : {}}
              whileTap={isUnlocked ? { scale: 0.99 } : {}}
              className="w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all focus:outline-none disabled:opacity-40"
              style={{
                background: isActive
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  isActive
                    ? "var(--at-accent)"
                    : "rgba(255,255,255,0.06)"
                }`,
              }}
              aria-pressed={isActive}
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {mastered ? (
                  <CheckCircle2 size={18} style={{ color: "var(--at-correct)" }} />
                ) : isActive ? (
                  <Circle size={18} style={{ color: "var(--at-accent)" }} />
                ) : (
                  <Circle size={18} style={{ color: "var(--at-muted)" }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: isActive ? "var(--at-text)" : "var(--at-muted)" }}
                  >
                    {lesson.title}
                  </p>
                  <span className="text-xs font-mono" style={{ color: "var(--at-muted)" }}>
                    {avgAccuracy > 0 ? `${avgAccuracy}%` : "—"}
                  </span>
                </div>

                <p className="text-xs" style={{ color: "var(--at-muted)" }}>
                  {lesson.description}
                </p>

                {/* Keys preview */}
                <div className="flex gap-1 flex-wrap">
                  {lesson.keys.slice(0, 12).map((k) => (
                    <span
                      key={k}
                      className="text-[9px] font-mono px-1 rounded"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--at-muted)",
                      }}
                    >
                      {k.toUpperCase()}
                    </span>
                  ))}
                  {lesson.keys.length > 12 && (
                    <span
                      className="text-[9px] font-mono px-1 rounded"
                      style={{ color: "var(--at-muted)" }}
                    >
                      +{lesson.keys.length - 12}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {avgAccuracy > 0 && (
                  <ProgressBar
                    value={avgAccuracy}
                    color={
                      mastered
                        ? "var(--at-correct)"
                        : "var(--at-accent)"
                    }
                  />
                )}
              </div>

              <ChevronRight
                size={14}
                style={{ color: isActive ? "var(--at-accent)" : "var(--at-muted)", flexShrink: 0 }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Stats summary */}
      {Object.keys(adaptiveStats).length > 0 && (
        <div
          className="p-4 rounded-2xl space-y-2"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--at-muted)" }}
          >
            İstatistiklerim
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Toplam Tuş",
                value: Object.values(adaptiveStats).reduce((a, s) => a + s.attempts, 0),
              },
              {
                label: "Ortalama Hata",
                value:
                  Object.values(adaptiveStats).length > 0
                    ? `${Math.round(
                        (Object.values(adaptiveStats).reduce(
                          (a, s) => a + s.errors / Math.max(s.attempts, 1),
                          0
                        ) /
                          Object.values(adaptiveStats).length) *
                          100
                      )}%`
                    : "—",
              },
              {
                label: "Öğrenilen Tuş",
                value: Object.keys(adaptiveStats).filter((k) => {
                  const s = adaptiveStats[k];
                  return s.attempts >= 10 && s.errors / s.attempts < 0.1;
                }).length,
              },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs" style={{ color: "var(--at-muted)" }}>
                  {label}
                </p>
                <p className="text-lg font-bold tabular-nums font-mono" style={{ color: "var(--at-text)" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
