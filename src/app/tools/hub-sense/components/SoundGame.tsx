"use client";

/**
 * HubSense — Sound Game Component (Studio Synthesizer Edition)
 * High-precision psychoacoustic tone synthesizer with logarithmic slider,
 * real-time continuous pitch gliding (zero stutter), harmonic waveform visualizer,
 * and full bilingual (TR/EN) support.
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
  const activeGainRef = useRef<GainNode | null>(null);

  const currentFreq = sliderValToFreq(sliderVal);
  const noteName = freqToNoteName(currentFreq);

  const stopTone = useCallback(() => {
    if (activeGainRef.current && audioCtx && audioCtx.state === "running") {
      try {
        activeGainRef.current.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.04);
        setTimeout(() => {
          if (activeOscRef.current) {
            try {
              activeOscRef.current.stop();
              activeOscRef.current.disconnect();
            } catch {}
            activeOscRef.current = null;
          }
          activeGainRef.current = null;
        }, 50);
      } catch {
        if (activeOscRef.current) {
          try {
            activeOscRef.current.stop();
            activeOscRef.current.disconnect();
          } catch {}
          activeOscRef.current = null;
        }
        activeGainRef.current = null;
      }
    } else if (activeOscRef.current) {
      try {
        activeOscRef.current.stop();
        activeOscRef.current.disconnect();
      } catch {}
      activeOscRef.current = null;
      activeGainRef.current = null;
    }
    setIsPlaying(false);
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
  }, [audioCtx]);

  const startContinuousTone = useCallback(
    async (freq: number) => {
      let ctx = audioCtx;
      if (!ctx || ctx.state === "closed") {
        ctx = await onInitAudio();
      }
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      if (activeOscRef.current && activeGainRef.current) {
        activeOscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.015);
        return;
      }

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        activeOscRef.current = osc;
        activeGainRef.current = gain;
        setIsPlaying(true);
      } catch {}
    },
    [audioCtx, onInitAudio]
  );

  const togglePlay = () => {
    if (isPlaying) {
      stopTone();
    } else {
      startContinuousTone(currentFreq);
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = setTimeout(() => {
        stopTone();
      }, 1500);
    }
  };

  const handleNudge = (deltaHz: number) => {
    SoundFX.click();
    const nextFreq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, currentFreq + deltaHz));
    setSliderVal(freqToSliderVal(nextFreq));
    startContinuousTone(nextFreq);
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    playTimeoutRef.current = setTimeout(() => {
      stopTone();
    }, 700);
  };

  const handleSubmit = () => {
    stopTone();
    SoundFX.click();
    const result = scoreSound(targetFreq, currentFreq);
    onSubmit(result);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopTone();
    };
  }, [stopTone]);

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

        {/* Dynamic Spectrum Waveform Visualizer & Play Trigger */}
        <div className="relative w-full h-24 sm:h-28 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center p-3 mb-6 shadow-inner">
          {/* Animated Waveform Bars */}
          <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full h-full">
            {barHeights.map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: `${h * 100}%` }}
                transition={{ duration: 0.06 }}
                className="flex-1 rounded-full"
                style={{
                  background: isPlaying
                    ? `linear-gradient(to top, #6366f1, #a855f7)`
                    : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>

          {/* Central Play/Stop Trigger */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={togglePlay}
              data-cursor={isPlaying ? t.sound.stopTone : t.sound.playTone}
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
            data-cursor={`${Math.round(currentFreq)} Hz · ${t.sound.erbScale}`}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setSliderVal(v);
              startContinuousTone(sliderValToFreq(v));
            }}
            onPointerUp={() => {
              if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
              playTimeoutRef.current = setTimeout(() => {
                stopTone();
              }, 1000);
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
                data-cursor="-10 Hz"
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 shadow-sm transition-transform active:scale-95"
              >
                -10Hz
              </button>
              <button
                onClick={() => handleNudge(-1)}
                data-cursor="-1 Hz"
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 shadow-sm transition-transform active:scale-95"
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
                data-cursor="+1 Hz"
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 shadow-sm transition-transform active:scale-95"
              >
                +1Hz
              </button>
              <button
                onClick={() => handleNudge(+10)}
                data-cursor="+10 Hz"
                className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 shadow-sm transition-transform active:scale-95"
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
          data-cursor={t.sound.confirm}
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
}

export function SoundDisplay({
  freq,
  onHide,
  audioCtx,
  onInitAudio,
  roundNumber = 1,
  totalRounds = 5,
}: SoundDisplayProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [isPlaying, setIsPlaying] = useState(false);

  const playStimulus = useCallback(async () => {
    let ctx = audioCtx;
    if (!ctx || ctx.state === "closed") {
      ctx = await onInitAudio();
    }
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + 1.2);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);

      setIsPlaying(true);

      setTimeout(() => {
        setIsPlaying(false);
        setTimeout(onHide, 400);
      }, 1300);
    } catch {
      onHide();
    }
  }, [audioCtx, onInitAudio, freq, onHide]);

  useEffect(() => {
    const timer = setTimeout(playStimulus, 400);
    return () => clearTimeout(timer);
  }, [playStimulus]);

  return (
    <div
      className="hubsense-game-arena relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 select-none flex flex-col justify-between p-6 sm:p-8 backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(30,27,75,0.85) 0%, rgba(9,9,11,0.95) 85%)",
      }}
      data-no-custom-cursor="true"
    >
      <div className="flex items-center justify-between">
        <div className="px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/15 text-sm font-bold text-white font-mono shadow-lg">
          {roundNumber} / {totalRounds}
        </div>
        <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold shadow-lg">
          {t.sound.revealSubtitle}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center my-auto">
        <motion.div
          animate={{ scale: isPlaying ? [1, 1.15, 1] : 1 }}
          transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.8 }}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] mb-6"
        >
          <Play className="w-10 h-10 text-indigo-300 fill-indigo-300" />
        </motion.div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight text-center">
          {isPlaying ? t.sound.revealPrompt : t.sound.revealSubtitle}
        </h3>
        <p className="text-xs text-white/50 mt-1 font-mono">
          {isPlaying ? t.sound.revealPrompt : t.sound.revealSubtitle}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/50">
          {t.watermark} · {t.disciplines.sound.label}
        </div>
        <button
          onClick={playStimulus}
          className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95"
        >
          {t.sound.playTone}
        </button>
      </div>
    </div>
  );
}
