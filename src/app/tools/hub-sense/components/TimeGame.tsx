"use client";

/**
 * HubSense — Time Game Component (Studio Chrono Edition)
 * Precision temporal perception analyzer with high-speed 60fps clock,
 * radial SVG progress meter, tactile press & hold, and full bilingual (TR/EN) support.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scoreTime, type TimeScoreResult, formatMs } from "../games/timeScoring";
import { SoundFX, triggerHaptic } from "../games/soundEffects";
import { Clock, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";

interface TimeGameProps {
  targetMs: number;
  onSubmit: (result: TimeScoreResult) => void;
  roundNumber?: number;
  totalRounds?: number;
}

export function TimeGame({
  targetMs,
  onSubmit,
  roundNumber = 1,
  totalRounds = 5,
}: TimeGameProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [phase, setPhase] = useState<"ready" | "holding" | "done">("ready");
  const [holdMs, setHoldMs] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startHold = useCallback(() => {
    if (phase !== "ready") return;
    setPhase("holding");
    SoundFX.click();
    triggerHaptic(30);
    startTimeRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const elapsed = Math.round(now - (startTimeRef.current ?? now));
      const p = Math.min(elapsed / (targetMs * 2), 1);
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

    const elapsed = Math.round(performance.now() - startTimeRef.current);
    setHoldMs(elapsed);
    setPhase("done");
    SoundFX.padPress(520);
    triggerHaptic(60);

    setTimeout(() => {
      onSubmit(scoreTime(targetMs, elapsed));
    }, 450);
  }, [phase, targetMs, onSubmit]);

  return (
    <div
      className="hubsense-game-arena relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 select-none flex flex-col justify-between p-6 sm:p-8 backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(6,78,59,0.7) 0%, rgba(9,9,11,0.85) 80%)",
      }}
      data-no-custom-cursor="true"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-end w-full">
        <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold shadow-lg">
          {t.time.modelName}
        </div>
      </div>

      {/* Main Center Chrono Stage */}
      <div className="flex flex-col items-center justify-center my-auto">
        {/* Radial Chrono Ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Outer track */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            {/* Animated progress ring */}
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={phase === "done" ? "#34d399" : "#10b981"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${52 * 2 * Math.PI}`}
              style={{
                strokeDashoffset: `${52 * 2 * Math.PI * (1 - progress)}`,
                filter: "drop-shadow(0 0 12px rgba(16,185,129,0.5))",
              }}
            />
          </svg>

          {/* Central Interactive Chrono Pad */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: phase === "ready" ? 1.04 : 1 }}
              whileTap={{ scale: 0.96 }}
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerCancel={endHold}
              disabled={phase === "done"}
              data-cursor={phase === "ready" ? t.time.holdButton : phase === "holding" ? t.time.releasePrompt : formatMs(holdMs)}
              className="w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-center p-4 border-2 transition-all shadow-2xl select-none touch-none"
              style={{
                background:
                  phase === "holding"
                    ? "radial-gradient(circle at center, rgba(16,185,129,0.35), rgba(16,185,129,0.1))"
                    : "rgba(255,255,255,0.04)",
                borderColor: phase === "holding" ? "#10b981" : "rgba(255,255,255,0.15)",
                boxShadow:
                  phase === "holding"
                    ? "0 0 45px rgba(16,185,129,0.4)"
                    : "0 10px 30px rgba(0,0,0,0.5)",
              }}
            >
              <AnimatePresence mode="wait">
                {phase === "ready" && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <Clock className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-sm font-extrabold tracking-wider text-white">
                      {t.time.holdButton}
                    </span>
                    <span className="text-[10px] text-white/40 mt-0.5">
                      {t.time.holdInstruction}
                    </span>
                  </motion.div>
                )}

                {phase === "holding" && (
                  <motion.div
                    key="holding"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-300">
                      {formatMs(holdMs)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400/80 animate-pulse mt-1">
                      {t.time.releasePrompt}
                    </span>
                  </motion.div>
                )}

                {phase === "done" && (
                  <motion.div
                    key="done"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                      {formatMs(holdMs)}
                    </span>
                    <span className="text-[10px] text-white/50 mt-1">
                      {t.time.calculating}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <p className="text-white/60 text-xs text-center max-w-xs leading-relaxed">
          {t.time.weberLawDesc}
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-white/[0.03] backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.time.label}
        </div>
      </div>
    </div>
  );
}

// ─── Time Display (Stimulus Reveal Phase) ──────────────────────────────────────
interface TimeDisplayProps {
  targetMs: number;
  onHide: () => void;
  roundNumber?: number;
  totalRounds?: number;
}

export function TimeDisplay({
  targetMs,
  onHide,
  roundNumber = 1,
  totalRounds = 5,
}: TimeDisplayProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const p = elapsed / targetMs;
      setProgress(Math.min(1, p));
      if (p >= 1) {
        clearInterval(interval);
        setTimeout(onHide, 250);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [targetMs, onHide]);

  return (
    <motion.div
      className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between p-6 sm:p-10 select-none backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(6,78,59,0.8) 0%, rgba(9,9,11,0.9) 80%)",
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Header */}
      <div className="flex items-start justify-end w-full">
        <div className="text-right">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white drop-shadow-lg">
            {t.disciplines.time.label}
          </div>
          <div className="text-xs sm:text-sm font-medium text-emerald-300">
            {t.time.revealSubtitle}
          </div>
        </div>
      </div>

      {/* Center Pulsing Orb */}
      <div className="flex flex-col items-center justify-center my-auto">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-full border-4 border-emerald-400/80 bg-emerald-500/20 flex items-center justify-center shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow: "0 0 60px rgba(16,185,129,0.5), inset 0 0 30px rgba(16,185,129,0.3)",
          }}
        >
          <Sparkles className="w-10 h-10 text-emerald-300" />
        </motion.div>
        <p className="text-emerald-300 text-sm font-bold mt-6 tracking-wide drop-shadow">
          {t.time.revealPrompt}
        </p>
      </div>

      {/* Bottom Progress */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-white/[0.03] backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.time.label}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
        <motion.div
          className="h-full bg-emerald-400"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </motion.div>
  );
}
