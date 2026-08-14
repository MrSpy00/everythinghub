"use client";
// ============================================================
// aegisTyping — Web Audio Engine (Procedural Synthesis)
// 100% Client-side AudioContext procedural synthesis
// ============================================================
import { useRef, useCallback } from "react";
import type { SoundPack } from "../types";

interface AudioPreset {
  freq: number;
  freq2: number;
  duration: number;
  type: OscillatorType;
  gainAttack: number;
  gainDecay: number;
  distortion: boolean;
}

const PRESETS: Record<
  SoundPack,
  { key: AudioPreset; error: AudioPreset; word: AudioPreset; finish: AudioPreset }
> = {
  silent: {
    key: { freq: 0, freq2: 0, duration: 0, type: "sine", gainAttack: 0, gainDecay: 0, distortion: false },
    error: { freq: 240, freq2: 190, duration: 0.1, type: "sine", gainAttack: 0.005, gainDecay: 0.09, distortion: false },
    word: { freq: 0, freq2: 0, duration: 0, type: "sine", gainAttack: 0, gainDecay: 0, distortion: false },
    finish: { freq: 660, freq2: 990, duration: 0.35, type: "sine", gainAttack: 0.01, gainDecay: 0.34, distortion: false },
  },
  mechanical: {
    key: { freq: 2600, freq2: 1700, duration: 0.03, type: "square", gainAttack: 0.001, gainDecay: 0.028, distortion: false },
    error: { freq: 220, freq2: 160, duration: 0.12, type: "sawtooth", gainAttack: 0.005, gainDecay: 0.11, distortion: true },
    word: { freq: 1400, freq2: 1200, duration: 0.04, type: "sine", gainAttack: 0.002, gainDecay: 0.038, distortion: false },
    finish: { freq: 880, freq2: 1320, duration: 0.4, type: "sine", gainAttack: 0.01, gainDecay: 0.38, distortion: false },
  },
  soft: {
    key: { freq: 1400, freq2: 1100, duration: 0.035, type: "sine", gainAttack: 0.002, gainDecay: 0.03, distortion: false },
    error: { freq: 260, freq2: 200, duration: 0.09, type: "sine", gainAttack: 0.004, gainDecay: 0.085, distortion: false },
    word: { freq: 1100, freq2: 950, duration: 0.05, type: "sine", gainAttack: 0.003, gainDecay: 0.045, distortion: false },
    finish: { freq: 660, freq2: 1100, duration: 0.4, type: "sine", gainAttack: 0.015, gainDecay: 0.38, distortion: false },
  },
  typewriter: {
    key: { freq: 3000, freq2: 1800, duration: 0.025, type: "square", gainAttack: 0.0005, gainDecay: 0.02, distortion: true },
    error: { freq: 180, freq2: 130, duration: 0.14, type: "sawtooth", gainAttack: 0.003, gainDecay: 0.13, distortion: true },
    word: { freq: 2200, freq2: 1500, duration: 0.03, type: "square", gainAttack: 0.001, gainDecay: 0.025, distortion: false },
    finish: { freq: 1200, freq2: 1800, duration: 0.3, type: "square", gainAttack: 0.005, gainDecay: 0.28, distortion: false },
  },
};

export function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const packRef = useRef<SoundPack>("silent");
  const volumeRef = useRef<number>(0.3);
  const soundOnErrorRef = useRef<boolean>(true);

  // Lazy AudioContext initialization
  const getCtx = useCallback((): AudioContext | null => {
    try {
      if (typeof window === "undefined") return null;
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;

      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new AudioCtxClass();
      }
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {});
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  // ─── Core Synthesis ───────────────────────────────────
  const playPreset = useCallback(
    (preset: AudioPreset, volMultiplier = 1) => {
      if (preset.freq === 0) return;
      const ctx = getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const vol = Math.max(0.01, Math.min(1, volumeRef.current * volMultiplier));

      try {
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(vol, now + preset.gainAttack);
        gainNode.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, vol * 0.05),
          now + preset.gainAttack + preset.gainDecay
        );

        if (preset.distortion) {
          const waveshaper = ctx.createWaveShaper();
          const curve = new Float32Array(256);
          for (let i = 0; i < 256; i++) {
            const x = (i * 2) / 256 - 1;
            curve[i] = ((Math.PI + 180) * x) / (Math.PI + 180 * Math.abs(x));
          }
          waveshaper.curve = curve;
          waveshaper.oversample = "2x";
          gainNode.connect(waveshaper);
          waveshaper.connect(ctx.destination);
        } else {
          gainNode.connect(ctx.destination);
        }

        // Main oscillator
        const osc = ctx.createOscillator();
        osc.type = preset.type;
        const freqVariation = 1 + (Math.random() - 0.5) * 0.06;
        osc.frequency.setValueAtTime(preset.freq * freqVariation, now);
        osc.frequency.exponentialRampToValueAtTime(
          preset.freq2 * freqVariation,
          now + preset.duration
        );
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + preset.duration + 0.01);
      } catch {
        // audio play error handled safely
      }
    },
    [getCtx]
  );

  // ─── Public API ───────────────────────────────────────
  const playKeyClick = useCallback(
    (isShift = false) => {
      if (packRef.current === "silent") return;
      const preset = { ...PRESETS[packRef.current].key };
      if (isShift) {
        preset.freq *= 1.2;
        preset.freq2 *= 1.2;
      }
      playPreset(preset, 0.7);
    },
    [playPreset]
  );

  const playError = useCallback(() => {
    if (!soundOnErrorRef.current) return;
    // Always play error tone even if general key clicking is silent
    const errorPreset =
      packRef.current !== "silent"
        ? PRESETS[packRef.current].error
        : PRESETS.silent.error;
    playPreset(errorPreset, 0.8);
  }, [playPreset]);

  const playWordComplete = useCallback(() => {
    if (packRef.current === "silent") return;
    playPreset(PRESETS[packRef.current].word, 0.4);
  }, [playPreset]);

  const playTestFinish = useCallback(() => {
    const preset =
      packRef.current !== "silent"
        ? PRESETS[packRef.current].finish
        : PRESETS.silent.finish;
    playPreset(preset, 0.9);
  }, [playPreset]);

  const setSoundPack = useCallback((pack: SoundPack) => {
    packRef.current = pack;
  }, []);

  const setVolume = useCallback((vol: number) => {
    volumeRef.current = vol;
  }, []);

  const setSoundOnError = useCallback((enabled: boolean) => {
    soundOnErrorRef.current = enabled;
  }, []);

  return {
    playKeyClick,
    playError,
    playWordComplete,
    playTestFinish,
    setSoundPack,
    setVolume,
    setSoundOnError,
  };
}
