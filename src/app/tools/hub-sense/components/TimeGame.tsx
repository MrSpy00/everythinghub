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
import { Clock, Clock as ClockIcon, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";
import { toast } from "sonner";

interface TimeGameProps {
  targetMs: number;
  onSubmit: (result: TimeScoreResult) => void;
  roundNumber?: number;
  totalRounds?: number;
  roundTimerSeconds?: number;
}

export function TimeGame({
  targetMs,
  onSubmit,
  roundNumber = 1,
  totalRounds = 5,
  roundTimerSeconds = 0,
}: TimeGameProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [phase, setPhase] = useState<"ready" | "holding" | "done">("ready");
  const [holdMs, setHoldMs] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Per-Round Countdown Timer
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    roundTimerSeconds && roundTimerSeconds > 0 ? roundTimerSeconds : null
  );

  useEffect(() => {
    if (!roundTimerSeconds || roundTimerSeconds <= 0) {
      setSecondsLeft(null);
      return;
    }
    setSecondsLeft(roundTimerSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundNumber, roundTimerSeconds]);

  // Auto-submit on timer expiry
  useEffect(() => {
    if (secondsLeft === 0 && phase !== "done") {
      setPhase("done");
      SoundFX.failRound();
      toast.warning(t.timeUpToast);
      const elapsed = holdMs > 0 ? holdMs : 0;
      const result = scoreTime(targetMs, elapsed);
      onSubmit(result);
    }
  }, [secondsLeft, phase, holdMs, targetMs, onSubmit, t.timeUpToast]);

  const startHold = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      if ("pointerId" in e.nativeEvent) {
        try {
          (e.currentTarget as HTMLElement).setPointerCapture((e.nativeEvent as PointerEvent).pointerId);
        } catch {
          // Ignore pointer capture fallback
        }
      }
      if (phase !== "ready") return;
      setPhase("holding");
      setHoldMs(0);
      SoundFX.click();
      triggerHaptic(30);
      startTimeRef.current = performance.now();

      const updateLoop = () => {
        if (startTimeRef.current === null) return;
        const now = performance.now();
        const elapsed = Math.round(now - startTimeRef.current);
        setHoldMs(elapsed);

        const ratio = Math.min(1, elapsed / (targetMs * 1.5));
        setProgress(ratio);

        animFrameRef.current = requestAnimationFrame(updateLoop);
      };

      animFrameRef.current = requestAnimationFrame(updateLoop);
    },
    [phase, targetMs]
  );

  const endHold = useCallback(() => {
    if (phase !== "holding" || startTimeRef.current === null) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const now = performance.now();
    const elapsed = Math.round(now - startTimeRef.current);
    startTimeRef.current = null;
    setHoldMs(elapsed);
    setPhase("done");

    SoundFX.click();
    triggerHaptic(60);

    const result = scoreTime(targetMs, elapsed);
    onSubmit(result);
  }, [phase, targetMs, onSubmit]);

  // Global window release listeners so releasing pointer anywhere immediately submits
  useEffect(() => {
    if (phase !== "holding") return;

    const handleGlobalRelease = () => {
      endHold();
    };

    window.addEventListener("pointerup", handleGlobalRelease);
    window.addEventListener("pointercancel", handleGlobalRelease);
    window.addEventListener("touchend", handleGlobalRelease);
    window.addEventListener("touchcancel", handleGlobalRelease);
    window.addEventListener("mouseup", handleGlobalRelease);

    return () => {
      window.removeEventListener("pointerup", handleGlobalRelease);
      window.removeEventListener("pointercancel", handleGlobalRelease);
      window.removeEventListener("touchend", handleGlobalRelease);
      window.removeEventListener("touchcancel", handleGlobalRelease);
      window.removeEventListener("mouseup", handleGlobalRelease);
    };
  }, [phase, endHold]);

  return (
    <div
      className="hubsense-game-arena relative w-full min-h-[480px] sm:min-h-[580px] h-auto rounded-3xl overflow-hidden shadow-2xl border border-white/15 select-none flex flex-col justify-between p-4 sm:p-8 backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(6,78,59,0.7) 0%, rgba(9,9,11,0.85) 80%)",
      }}
      data-no-custom-cursor="true"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full">
        {secondsLeft !== null ? (
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-xl border text-xs font-mono font-extrabold shadow-lg transition-all duration-300 ${
              secondsLeft <= 10
                ? "bg-rose-500/25 border-rose-500/60 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                : "bg-white/[0.05] border-white/15 text-white/90"
            }`}
          >
            <ClockIcon className={`w-3.5 h-3.5 shrink-0 ${secondsLeft <= 10 ? "text-rose-400" : "text-emerald-300"}`} />
            <span>{secondsLeft}s</span>
          </div>
        ) : (
          <div />
        )}

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
              onTouchStart={startHold}
              onTouchEnd={endHold}
              onTouchCancel={endHold}
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
      className="relative w-full min-h-[480px] sm:min-h-[580px] h-auto rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between p-4 sm:p-10 select-none backdrop-blur-3xl"
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
