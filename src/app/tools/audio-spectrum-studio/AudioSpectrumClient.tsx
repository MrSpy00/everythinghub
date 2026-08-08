"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Activity,
  Sliders,
  Sparkles,
  Radio,
  Play,
  Square,
  Waves,
} from "lucide-react";
import { toast } from "sonner";

export function AudioSpectrumClient() {
  const [sourceMode, setSourceMode] = useState<"mic" | "synth">("synth");
  const [isPlaying, setIsPlaying] = useState(false);
  const [freq, setFreq] = useState(440); // 440 Hz (A4)
  const [waveType, setWaveType] = useState<OscillatorType>("sine");
  const [gainLevel, setGainLevel] = useState(0.2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize Web Audio Engine
  const startAudioEngine = async () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Analyser Setup
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyserRef.current = analyser;

      if (sourceMode === "synth") {
        // Oscillator Setup
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainLevel, ctx.currentTime);

        osc.connect(gain);
        gain.connect(analyser);
        analyser.connect(ctx.destination);

        osc.start();
        oscRef.current = osc;
        gainNodeRef.current = gain;
      } else {
        // Microphone Setup
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStreamRef.current = stream;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
      }

      setIsPlaying(true);
      toast.success(sourceMode === "synth" ? `${freq}Hz ton başlatıldı!` : "Mikrofon spektrumu aktif!");
      drawVisualizer();
    } catch (err) {
      toast.error("Ses motoru başlatılamadı veya mikrofon izni verilmedi.");
    }
  };

  const stopAudioEngine = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
      } catch {}
      oscRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsPlaying(false);
  };

  // Canvas Waveform & FFT Drawing Loop
  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);

      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      ctx.fillStyle = "#0a0b0e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw FFT Frequency Bars (Bottom half)
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barX = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (freqData[i] / 255) * (canvas.height * 0.45);
        ctx.fillStyle = `rgba(16, 185, 129, ${freqData[i] / 255 + 0.1})`;
        ctx.fillRect(barX, canvas.height - barHeight, barWidth, barHeight);
        barX += barWidth + 1;
      }

      // 2. Draw Oscilloscope Waveform Line (Top half)
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#06b6d4";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * (canvas.height * 0.35)) + 30;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
    };

    render();
  };

  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      oscRef.current.type = waveType;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(gainLevel, audioCtxRef.current.currentTime);
    }
  }, [freq, waveType, gainLevel]);

  useEffect(() => {
    return () => {
      stopAudioEngine();
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-xl mb-3">
          <Waves className="h-3.5 w-3.5 text-cyan-400" />
          <span>Web Audio API Laboratory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Web Audio Osiloskop & Spektrum Analizörü
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Mikrofon sinyalini veya saf ton dalgalarını gerçek zamanlı osiloskop ve FFT frekans spektrumu ile donanım hızlandırmalı analiz edin.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Ses Kaynağı</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    stopAudioEngine();
                    setSourceMode("synth");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    sourceMode === "synth"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                  }`}
                >
                  <Radio className="h-3.5 w-3.5" />
                  <span>Saf Ton Üreteci</span>
                </button>
                <button
                  onClick={() => {
                    stopAudioEngine();
                    setSourceMode("mic");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                    sourceMode === "mic"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Canlı Mikrofon</span>
                </button>
              </div>
            </div>

            {sourceMode === "synth" && (
              <div className="space-y-4 border-t border-white/10 pt-4">
                {/* Wave Type */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Dalga Formu (Waveform)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["sine", "square", "sawtooth", "triangle"] as OscillatorType[]).map((w) => (
                      <button
                        key={w}
                        onClick={() => setWaveType(w)}
                        className={`rounded-lg py-1.5 text-[11px] font-semibold capitalize transition-all ${
                          waveType === w
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency Slider */}
                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>Frekans</span>
                    <span className="font-mono text-cyan-400">{freq} Hz (A4 Standart: 440Hz)</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={2000}
                    value={freq}
                    onChange={(e) => setFreq(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Gain Level */}
                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>Ses Seviyesi</span>
                    <span className="font-mono text-cyan-400">{Math.round(gainLevel * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.01}
                    value={gainLevel}
                    onChange={(e) => setGainLevel(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Start / Stop Toggle */}
            <div className="border-t border-white/10 pt-4">
              {!isPlaying ? (
                <button
                  onClick={startAudioEngine}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-lg"
                >
                  <Play className="h-4 w-4" />
                  <span>Ses Motorunu Başlat</span>
                </button>
              ) : (
                <button
                  onClick={stopAudioEngine}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/40 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition-all shadow-lg"
                >
                  <Square className="h-4 w-4" />
                  <span>Durdur</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Canvas Spectrum & Oscilloscope Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col items-center justify-between min-h-[440px]">
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                <span>Canlı Dalga Formu & FFT Spektrumu</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {isPlaying ? "Canlı 60 FPS" : "Beklemede"}
              </span>
            </div>

            {/* Canvas Box */}
            <div className="w-full rounded-2xl border border-white/10 bg-black/60 p-2 shadow-inner">
              <canvas
                ref={canvasRef}
                width={640}
                height={320}
                className="w-full h-auto rounded-xl"
              />
            </div>

            <div className="w-full text-[11px] text-zinc-500 text-center font-mono mt-3">
              Üst Çizgi: Zaman Alanı Osiloskop | Alt Sütunlar: FFT Frekans Spektrumu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
