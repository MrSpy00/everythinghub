"use client";

/**
 * HubSense — Sound Game Component
 * Frequency slider with ERB psychoacoustic scoring
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  scoreSound,
  freqToNoteName,
  type SoundScoreResult,
} from "../games/soundScoring";
import { Play, Volume2 } from "lucide-react";

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
}

export function SoundGame({
  targetFreq,
  onSubmit,
  audioCtx,
  onInitAudio,
}: SoundGameProps) {
  const [sliderVal, setSliderVal] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentFreq = sliderValToFreq(sliderVal);
  const noteName = freqToNoteName(currentFreq);

  const playTone = useCallback(
    async (freq: number, duration = 1000) => {
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
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + duration / 1000 - 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);

      setIsPlaying(true);
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = setTimeout(() => setIsPlaying(false), duration);
    },
    [audioCtx, onInitAudio]
  );

  const handlePreview = () => playTone(currentFreq, 800);

  // Visualizer bars
  const BARS = 32;
  const barHeights = Array.from({ length: BARS }, (_, i) => {
    // Simulate waveform based on current freq
    const t = i / BARS;
    const wave = Math.sin(t * Math.PI * 4 + currentFreq / 200) * 0.5 + 0.5;
    return isPlaying ? wave : 0.1 + wave * 0.1;
  });

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto">
      {/* Frequency Display */}
      <div className="text-center">
        <div className="text-5xl font-bold tabular-nums text-white">
          {Math.round(currentFreq)}
          <span className="text-2xl text-white/40 ml-1">Hz</span>
        </div>
        <div className="text-sm text-white/40 font-mono mt-1">{noteName}</div>
      </div>

      {/* Waveform Visualizer */}
      <div
        className="flex items-center justify-center gap-0.5 h-16 px-4 rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        {barHeights.map((h, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: `${100 / BARS - 0.5}%`,
              background: isPlaying
                ? `rgba(99,102,241,${0.4 + h * 0.6})`
                : "rgba(255,255,255,0.15)",
            }}
            animate={{ height: `${Math.max(4, h * 56)}px` }}
            transition={{ duration: 0.05, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Frequency Slider */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-white/30 font-mono">
          <span>{MIN_FREQ}Hz</span>
          <span>{MAX_FREQ}Hz</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={sliderVal}
          onChange={(e) => setSliderVal(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #6366f1 ${sliderVal * 100}%, rgba(255,255,255,0.1) ${sliderVal * 100}%)`,
          }}
        />
        {/* Frequency reference marks */}
        <div className="flex justify-between text-[10px] text-white/20 font-mono px-1">
          {[100, 200, 500, 1000, 2000].map((f) => (
            <button
              key={f}
              onClick={() => setSliderVal(freqToSliderVal(f))}
              className="hover:text-white/50 transition-colors"
            >
              {f < 1000 ? `${f}` : `${f / 1000}k`}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Button */}
      <button
        onClick={handlePreview}
        className="flex items-center justify-center gap-2 py-3 rounded-xl
          bg-white/[0.04] border border-white/10 text-white/60 hover:text-white
          hover:bg-white/[0.08] transition-all"
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 animate-pulse text-indigo-400" />
            <span className="text-sm">Çalıyor...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span className="text-sm">Sesi duyur (önizleme)</span>
          </>
        )}
      </button>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onSubmit(scoreSound(targetFreq, currentFreq))}
        className="w-full py-4 rounded-2xl font-bold text-base tracking-wide
          bg-white/[0.06] border border-indigo-500/30 text-white backdrop-blur-xl
          hover:bg-indigo-500/10 hover:border-indigo-400/50 transition-all"
      >
        Bu frekansı seç
      </motion.button>
    </div>
  );
}

// ─── Sound Display (Stimulus) ─────────────────────────────────────────────────
interface SoundDisplayProps {
  freq: number;
  onHide: () => void;
  audioCtx: AudioContext | null;
  onInitAudio: () => Promise<AudioContext>;
}

export function SoundDisplay({ freq, onHide, audioCtx, onInitAudio }: SoundDisplayProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function play() {
      let ctx = audioCtx;
      if (!ctx || ctx.state === "closed") ctx = await onInitAudio();
      if (ctx.state === "suspended") await ctx.resume();

      const duration = 1.5;
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
      setTimeout(() => {
        if (!cancelled) {
          setPlaying(false);
          onHide();
        }
      }, duration * 1000 + 300);
    }

    play();
    return () => {
      cancelled = true;
    };
  }, [audioCtx, freq, onHide, onInitAudio]);

  const BARS = 48;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090b]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-center gap-0.5 h-24">
        {Array.from({ length: BARS }).map((_, i) => {
          const t = i / BARS;
          const wave = Math.abs(Math.sin(t * Math.PI * 6 + Date.now() / 500));
          return (
            <motion.div
              key={i}
              className="rounded-full bg-indigo-400"
              style={{ width: 5 }}
              animate={{
                height: playing ? `${16 + wave * 80}px` : "4px",
                opacity: playing ? 0.6 + wave * 0.4 : 0.2,
              }}
              transition={{
                duration: 0.1,
                repeat: playing ? Infinity : 0,
                repeatType: "mirror",
                delay: (i / BARS) * 0.5,
              }}
            />
          );
        })}
      </div>
      <p className="text-white/40 text-sm mt-6 font-mono">
        {playing ? "Dikkatle dinle..." : ""}
      </p>
    </motion.div>
  );
}
