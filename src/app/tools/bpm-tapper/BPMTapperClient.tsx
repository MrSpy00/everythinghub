"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Activity,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Volume2,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";

export function BPMTapperClient() {
  const [bpm, setBpm] = useState<number | null>(null);
  const [taps, setTaps] = useState<number[]>([]);
  const [consistency, setConsistency] = useState<number | null>(null);

  // Metronome State
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [metroBpm, setMetroBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState(4); // 4/4
  const [currentBeat, setCurrentBeat] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<any>(null);

  // Handle BPM Tap
  const handleTap = () => {
    const now = performance.now();
    setTaps((prev) => {
      // If last tap was more than 3 seconds ago, reset
      if (prev.length > 0 && now - prev[prev.length - 1] > 3000) {
        return [now];
      }
      const updated = [...prev, now].slice(-16); // keep last 16 taps

      if (updated.length > 1) {
        const intervals: number[] = [];
        for (let i = 1; i < updated.length; i++) {
          intervals.push(updated[i] - updated[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgInterval);
        setBpm(calculatedBpm);
        setMetroBpm(calculatedBpm);

        // Standard Deviation Consistency
        const variance =
          intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        const score = Math.max(0, Math.min(100, Math.round(100 - (stdDev / avgInterval) * 100)));
        setConsistency(score);
      }
      return updated;
    });
  };

  const handleReset = () => {
    setTaps([]);
    setBpm(null);
    setConsistency(null);
    toast.success("BPM sayacı sıfırlandı.");
  };

  // Keyboard Space listener for Tap
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Web Audio Metronome Tick
  const playClick = (isAccent: boolean) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  // Metronome Timer Loop
  useEffect(() => {
    if (!isMetronomeActive) {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      return;
    }

    const intervalMs = 60000 / metroBpm;
    let beat = 0;

    timerIdRef.current = setInterval(() => {
      playClick(beat % timeSignature === 0);
      setCurrentBeat(beat % timeSignature);
      beat++;
    }, intervalMs);

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [isMetronomeActive, metroBpm, timeSignature]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xl mb-3">
          <Music className="h-3.5 w-3.5 text-emerald-400" />
          <span>Precision Tempo & Metronome Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Hassas BPM Tapper & Akıllı Metronom
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Space tuşuna basarak veya butona dokunarak anlık BPM hesaplayın, tutarlılık sapmasını görün ve Web Audio akıllı metronom ile ritim tutun.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Big Tap Area */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-8 shadow-2xl flex flex-col items-center justify-between min-h-[460px]">
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-white">Canlı Tempo Sayacı</span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Sıfırla</span>
              </button>
            </div>

            {/* Tap Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleTap}
              className="my-6 h-48 w-48 rounded-full border-4 border-emerald-500/40 bg-emerald-500/10 backdrop-blur-2xl flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/10 hover:border-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer select-none"
            >
              <div className="text-5xl font-black text-white font-mono tracking-tighter">
                {bpm !== null ? bpm : "--"}
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-widest">
                TAP (Space)
              </div>
            </motion.button>

            {/* Metrics */}
            <div className="w-full grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                <span className="text-[11px] text-zinc-400 block mb-1">Toplam Vuruş</span>
                <span className="text-sm font-bold text-white font-mono">{taps.length} Tap</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                <span className="text-[11px] text-zinc-400 block mb-1">Ritim Tutarlılığı</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {consistency !== null ? `%${consistency}` : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Precision Web Audio Metronome */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-8 shadow-2xl space-y-6 flex flex-col justify-between min-h-[460px]">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Web Audio Metronom</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {timeSignature}/4 Zaman
              </span>
            </div>

            {/* Metronome Beat Pulsing Indicator */}
            <div className="flex justify-center gap-3 my-4">
              {Array.from({ length: timeSignature }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm transition-all ${
                    isMetronomeActive && currentBeat === idx
                      ? idx === 0
                        ? "bg-amber-400 text-black scale-110 shadow-lg shadow-amber-400/30"
                        : "bg-emerald-400 text-black scale-110 shadow-lg shadow-emerald-400/30"
                      : "bg-white/[0.04] text-zinc-500 border border-white/10"
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Slider & Signature Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Metronom Temposu</span>
                  <span className="font-mono text-emerald-400 font-bold">{metroBpm} BPM</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={280}
                  value={metroBpm}
                  onChange={(e) => setMetroBpm(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Ölçü Zamanı</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 6].map((sig) => (
                    <button
                      key={sig}
                      onClick={() => setTimeSignature(sig)}
                      className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                        timeSignature === sig
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                      }`}
                    >
                      {sig}/4
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start / Stop Toggle */}
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition-all shadow-xl ${
                  isMetronomeActive
                    ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                    : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                }`}
              >
                {isMetronomeActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isMetronomeActive ? "Metronomu Durdur" : "Metronomu Başlat"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
