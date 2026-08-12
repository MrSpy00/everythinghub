"use client";

/**
 * HubSense — Time Game Component
 * Hold a button to match a target duration.
 */

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scoreTime, type TimeScoreResult, formatMs } from "../games/timeScoring";

interface TimeGameProps {
  targetMs: number;
  onSubmit: (result: TimeScoreResult) => void;
}

export function TimeGame({ targetMs, onSubmit }: TimeGameProps) {
  const [phase, setPhase] = useState<"ready" | "holding" | "done">("ready");
  const [holdMs, setHoldMs] = useState(0);
  const [progress, setProgress] = useState(0); // 0-1 visual fill
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startHold = useCallback(() => {
    if (phase !== "ready") return;
    setPhase("holding");
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const p = Math.min(elapsed / (targetMs * 2), 1); // visual: double target = full
      setHoldMs(elapsed);
      setProgress(p);
      if (p < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, [phase, targetMs]);

  const endHold = useCallback(() => {
    if (phase !== "holding" || !startTimeRef.current) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const elapsed = Date.now() - startTimeRef.current;
    setHoldMs(elapsed);
    setPhase("done");

    setTimeout(() => {
      onSubmit(scoreTime(targetMs, elapsed));
    }, 600);
  }, [phase, targetMs, onSubmit]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Target time display */}
      <div className="text-center">
        <div className="text-sm text-white/40 mb-1">Hedef süre</div>
        <div className="text-4xl font-bold tabular-nums text-white">
          {formatMs(targetMs)}
        </div>
      </div>

      {/* Circular progress indicator */}
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <motion.circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={phase === "done" ? "#10b981" : "#6366f1"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${44 * 2 * Math.PI}`}
            animate={{
              strokeDashoffset: `${44 * 2 * Math.PI * (1 - progress)}`,
            }}
            transition={{ duration: 0.05 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <AnimatePresence mode="wait">
            {phase === "ready" && (
              <motion.p
                key="ready"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-white/50 text-sm text-center leading-tight"
              >
                Butonu basılı tut,<br />hedef süre dolunca bırak
              </motion.p>
            )}
            {phase === "holding" && (
              <motion.div
                key="holding"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold tabular-nums text-white">
                  {formatMs(holdMs)}
                </div>
                <div className="text-xs text-indigo-400 mt-1 animate-pulse">Basılı tut...</div>
              </motion.div>
            )}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                  {formatMs(holdMs)}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {holdMs < targetMs ? "Erken bıraktın" : "Geç bıraktın"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hold button */}
      <motion.button
        className="w-40 h-40 rounded-full font-bold text-lg tracking-wide
          border-2 border-white/10 text-white select-none touch-none
          transition-all relative overflow-hidden"
        style={{
          background:
            phase === "holding"
              ? "radial-gradient(circle at center, rgba(99,102,241,0.3), rgba(99,102,241,0.05))"
              : "rgba(255,255,255,0.04)",
          borderColor: phase === "holding" ? "#6366f1" : undefined,
        }}
        animate={{
          scale: phase === "holding" ? 1.05 : 1,
          boxShadow: phase === "holding"
            ? "0 0 40px rgba(99,102,241,0.3)"
            : "none",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={(e) => { e.preventDefault(); startHold(); }}
        onTouchEnd={(e) => { e.preventDefault(); endHold(); }}
        disabled={phase === "done"}
      >
        {phase === "ready" ? "BASILI TUT" : phase === "holding" ? "BIRAK" : "TAMAM"}

        {/* Ripple effect when holding */}
        {phase === "holding" && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
}

// ─── Time Display (Stimulus) ──────────────────────────────────────────────────
interface TimeDisplayProps {
  targetMs: number;
  onHide: () => void;
}

export function TimeDisplay({ targetMs, onHide }: TimeDisplayProps) {
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const p = (Date.now() - startTime) / targetMs;
      setProgress(Math.min(1, p));
      if (p >= 1) {
        clearInterval(interval);
        setTimeout(onHide, 300);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [targetMs, onHide]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090b]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-white/30 text-sm mb-8">Bu süreyi aklında tut</div>

      {/* Linear progress bar */}
      <div className="w-64 h-3 bg-white/05 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-500 rounded-full"
          style={{ originX: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.016, ease: "linear" }}
        />
      </div>

      <div className="text-white/20 text-lg font-mono mt-4 tabular-nums">
        {formatMs(Math.round(progress * targetMs))}
      </div>
    </motion.div>
  );
}
