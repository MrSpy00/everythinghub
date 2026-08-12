"use client";

/**
 * HubSense — Sound Game Component (Studio Synthesizer Edition)
 * High-precision psychoacoustic tone synthesizer with logarithmic slider,
 * real-time harmonic waveform visualizer, and full bilingual (TR/EN) support.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  scoreSound,
  freqToNoteName,
  type SoundScoreResult,
} from "../games/soundScoring";
import { SoundFX } from "../games/soundEffects";
import { Play, Square, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";

const MIN_FREQ = 80;
const MAX_FREQ = 2000;

function freqToSliderVal(freq: number): number {
  const logMin = Math.log(MIN_FREQ);
  const logMax = Math.log(MAX_FREQ);
  return (Math.log(freq) - logMin) / (logMax - logMin);
}

function sliderValToFreq(val: number): number {
  const logMin = Math.log(MIN_FREQ);
  const logMax = Math.log(MAX_FREQ);
  return Math.exp(logMin + val * (logMax - logMin));
}

interface SoundGameProps {
  targetFreq: number;
  onSubmit: (result: SoundScoreResult) => void;
  audioCtx: AudioContext | null;
  onInitAudio: () => Promise<AudioContext>;
  roundNumber?: number;
  totalRounds?: number;
}

export function SoundGame({
  targetFreq,
  onSubmit,
  audioCtx,
  onInitAudio,
  roundNumber = 1,
  totalRounds = 5,
}: SoundGameProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [sliderVal, setSliderVal] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeOscRef = useRef<OscillatorNode | null>(null);

  const currentFreq = sliderValToFreq(sliderVal);
  const noteName = freqToNoteName(currentFreq);

  const stopTone = useCallback(() => {
    if (activeOscRef.current) {
      try {
        activeOscRef.current.stop();
        activeOscRef.current.disconnect();
      } catch {}
      activeOscRef.current = null;
    }
    setIsPlaying(false);
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
  }, []);

  const playTone = useCallback(
    async (freq: number, duration = 1200) => {
      stopTone();
      let ctx = audioCtx;
      if (!ctx || ctx.state === "closed") {
        ctx = await onInitAudio();
      }
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + duration / 1000 - 0.06);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
      activeOscRef.current = osc;

      setIsPlaying(true);
      playTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
        activeOscRef.current = null;
      }, duration);
    },
    [audioCtx, onInitAudio, stopTone]
  );

  const togglePlay = () => {
    if (isPlaying) {
      stopTone();
    } else {
      playTone(currentFreq, 1400);
    }
  };

  const handleNudge = (deltaHz: number) => {
    SoundFX.click();
    const nextFreq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, currentFreq + deltaHz));
    setSliderVal(freqToSliderVal(nextFreq));
    playTone(nextFreq, 500);
  };

  const handleSubmit = () => {
    stopTone();
    SoundFX.click();
    const result = scoreSound(targetFreq, currentFreq);
    onSubmit(result);
  };

  // 36-band waveform bars
  const BARS = 36;
  const barHeights = Array.from({ length: BARS }, (_, i) => {
    const t = i / BARS;
    const wave = Math.sin(t * Math.PI * 4 + currentFreq / 150) * 0.5 + 0.5;
    return isPlaying ? 0.2 + wave * 0.8 : 0.08 + wave * 0.12;
  });

  return (
    <div
      className="hubsense-game-arena relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 select-none flex flex-col justify-between p-6 sm:p-8 backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(30,27,75,0.7) 0%, rgba(9,9,11,0.85) 85%)",
      }}
      data-no-custom-cursor="true"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/15 text-sm font-bold text-white font-mono shadow-lg">
          {roundNumber} / {totalRounds}
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold shadow-lg">
            {noteName}
          </div>
        </div>
      </div>

      {/* Main Center Synthesizer Stage */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-lg mx-auto">
        {/* Big Frequency Display */}
        <motion.div
          animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6"
        >
          <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white flex items-baseline justify-center gap-1">
            <span>{Math.round(currentFreq)}</span>
            <span className="text-2xl sm:text-3xl text-indigo-400 font-normal">Hz</span>
          </div>
          <div className="text-xs text-white/40 font-mono mt-1">
            {t.sound.erbScale} · {noteName}
          </div>
        </motion.div>

        {/* Waveform Visualizer & Play Button */}
        <div className="w-full relative mb-6">
          <div className="flex items-center justify-center gap-1 h-20 px-4 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden shadow-inner">
            {barHeights.map((h, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: `${100 / BARS - 0.4}%`,
                  background: isPlaying
                    ? "linear-gradient(to top, #6366f1, #a855f7)"
                    : "rgba(255,255,255,0.15)",
                }}
                animate={{ height: `${Math.max(6, h * 68)}px` }}
                transition={{ duration: 0.08, ease: "easeOut" }}
              />
            ))}
          </div>

          {/* Central Play/Stop Trigger */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={togglePlay}
              className="pointer-events-auto px-5 py-2.5 rounded-full bg-indigo-500/80 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md border border-white/20 transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{t.sound.stopTone}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.sound.playTone}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Precision Frequency Slider */}
        <div className="w-full flex flex-col gap-3">
          <input
            type="range"
            min={0}
            max={1}
            step={0.0005}
            value={sliderVal}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setSliderVal(v);
              playTone(sliderValToFreq(v), 300);
            }}
            className="w-full h-3 rounded-full appearance-none cursor-pointer touch-none shadow-inner"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${sliderVal * 100}%, rgba(255,255,255,0.1) ${sliderVal * 100}%)`,
            }}
          />

          {/* Stepper Buttons (-10, -1, +1, +10 Hz) */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex gap-1.5">
              <button
                onClick={() => handleNudge(-10)}
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 shadow-sm"
              >
                -10Hz
              </button>
              <button
                onClick={() => handleNudge(-1)}
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 shadow-sm"
              >
                -1Hz
              </button>
            </div>

            <div className="text-[10px] text-white/40 font-mono">
              {t.sound.freqRange}
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => handleNudge(+1)}
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 shadow-sm"
              >
                +1Hz
              </button>
              <button
                onClick={() => handleNudge(+10)}
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 shadow-sm"
              >
                +10Hz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Floating Submit Button */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-white/[0.03] backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.sound.label}
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleSubmit}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl border-2 border-white/80 hover:bg-zinc-100 transition-all group"
          style={{
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(99,102,241,0.4)",
          }}
          title={t.sound.confirm}
        >
          <Check className="w-7 h-7 stroke-[3] text-zinc-900 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Sound Display (Stimulus Reveal Phase) ────────────────────────────────────
interface SoundDisplayProps {
  freq: number;
  onHide: () => void;
  audioCtx: AudioContext | null;
  onInitAudio: () => Promise<AudioContext>;
  roundNumber?: number;
  totalRounds?: number;
  durationMs?: number;
}

export function SoundDisplay({
  freq,
  onHide,
  audioCtx,
  onInitAudio,
  roundNumber = 1,
  totalRounds = 5,
  durationMs = 2000,
}: SoundDisplayProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMs / 1000);

  useEffect(() => {
    let cancelled = false;
    async function play() {
      let ctx = audioCtx;
      if (!ctx || ctx.state === "closed") ctx = await onInitAudio();
      if (ctx.state === "suspended") await ctx.resume();

      const duration = durationMs / 1000;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.5, ctx.currentTime + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);

      setPlaying(true);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (durationMs - elapsed) / 1000);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          if (!cancelled) {
            setPlaying(false);
            onHide();
          }
        }
      }, 16);
    }

    play();
    return () => {
      cancelled = true;
    };
  }, [audioCtx, durationMs, freq, onHide, onInitAudio]);

  const BARS = 48;

  return (
    <motion.div
      className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between p-6 sm:p-10 select-none backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(46,16,101,0.8) 0%, rgba(9,9,11,0.9) 80%)",
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Header: Round (Left) & Countdown (Right) */}
      <div className="flex items-start justify-between">
        <div className="px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/15 text-sm font-bold text-white font-mono shadow-lg">
          {roundNumber} / {totalRounds}
        </div>

        <div className="text-right">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white drop-shadow-lg">
            {timeLeft.toFixed(2)}
          </div>
          <div className="text-xs sm:text-sm font-medium text-white/70">
            {t.sound.revealSubtitle}
          </div>
        </div>
      </div>

      {/* Center Harmonic Visualizer */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="flex items-center justify-center gap-1 h-32 w-full max-w-md">
          {Array.from({ length: BARS }).map((_, i) => {
            const tr = i / BARS;
            const wave = Math.abs(Math.sin(tr * Math.PI * 6 + Date.now() / 300));
            return (
              <motion.div
                key={i}
                className="rounded-full bg-indigo-400"
                style={{ width: `${100 / BARS - 0.5}%` }}
                animate={{
                  height: playing ? `${12 + wave * 110}px` : "6px",
                  opacity: playing ? 0.6 + wave * 0.4 : 0.2,
                }}
                transition={{
                  duration: 0.1,
                  repeat: playing ? Infinity : 0,
                  repeatType: "mirror",
                  delay: (i / BARS) * 0.2,
                }}
              />
            );
          })}
        </div>
        <p className="text-indigo-300 text-sm font-bold mt-6 tracking-wide drop-shadow">
          {playing ? t.sound.revealPrompt : ""}
        </p>
      </div>

      {/* Bottom Bar & Progress */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-white/[0.03] backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.sound.label}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
        <motion.div
          className="h-full bg-indigo-500"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: durationMs / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
