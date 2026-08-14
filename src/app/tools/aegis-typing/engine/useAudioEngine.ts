"use client";
// ============================================================
// aegisTyping — Web Audio Engine (Procedural Synthesis)
// No external files needed — 100% AudioContext synthesis
// ============================================================
import { useRef, useCallback, useEffect } from "react";
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

const PRESETS: Record<SoundPack, { key: AudioPreset; error: AudioPreset; word: AudioPreset; finish: AudioPreset }> = {
  mechanical: {
    key: { freq: 2800, freq2: 1800, duration: 0.035, type: "square", gainAttack: 0.001, gainDecay: 0.03, distortion: false },
    error: { freq: 220, freq2: 180, duration: 0.12, type: "sawtooth", gainAttack: 0.005, gainDecay: 0.11, distortion: true },
    word: { freq: 1400, freq2: 1200, duration: 0.05, type: "sine", gainAttack: 0.002, gainDecay: 0.04, distortion: false },
    finish: { freq: 880, freq2: 1320, duration: 0.4, type: "sine", gainAttack: 0.01, gainDecay: 0.38, distortion: false },
  },
  soft: {
    key: { freq: 1600, freq2: 1400, duration: 0.04, type: "sine", gainAttack: 0.002, gainDecay: 0.035, distortion: false },
    error: { freq: 280, freq2: 240, duration: 0.1, type: "sine", gainAttack: 0.004, gainDecay: 0.09, distortion: false },
    word: { freq: 1200, freq2: 1000, duration: 0.06, type: "sine", gainAttack: 0.003, gainDecay: 0.055, distortion: false },
    finish: { freq: 660, freq2: 1100, duration: 0.5, type: "sine", gainAttack: 0.015, gainDecay: 0.48, distortion: false },
  },
  typewriter: {
    key: { freq: 3200, freq2: 2000, duration: 0.025, type: "square", gainAttack: 0.0005, gainDecay: 0.02, distortion: true },
    error: { freq: 180, freq2: 140, duration: 0.15, type: "sawtooth", gainAttack: 0.003, gainDecay: 0.14, distortion: true },
    word: { freq: 2400, freq2: 1600, duration: 0.03, type: "square", gainAttack: 0.001, gainDecay: 0.025, distortion: false },
    finish: { freq: 1200, freq2: 1800, duration: 0.3, type: "square", gainAttack: 0.005, gainDecay: 0.28, distortion: false },
  },
  silent: {
    key: { freq: 0, freq2: 0, duration: 0, type: "sine", gainAttack: 0, gainDecay: 0, distortion: false },
    error: { freq: 0, freq2: 0, duration: 0, type: "sine", gainAttack: 0, gainDecay: 0, distortion: false },
    word: { freq: 0, freq2: 0, duration: 0, type: "sine", gainAttack: 0, gainDecay: 0, distortion: false },
    finish: { freq: 0, freq2: 0, duration: 0, type: "sine", gainAttack: 0, gainDecay: 0, distortion: false },
  },
};

export function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const packRef = useRef<SoundPack>("mechanical");
  const volumeRef = useRef<number>(0.4);
  const soundOnErrorRef = useRef<boolean>(true);

  // Lazy AudioContext initialization (must be post-user-interaction)
  const getCtx = useCallback((): AudioContext | null => {
    if (packRef.current === "silent") return null;
    try {
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new AudioContext();
      }
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  // ─── Core Synthesis ───────────────────────────────────
  const playPreset = useCallback((preset: AudioPreset, volMultiplier = 1) => {
    if (packRef.current === "silent" || preset.freq === 0) return;
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const vol = volumeRef.current * volMultiplier;

    try {
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(vol, now + preset.gainAttack);
      gainNode.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, vol * 0.1),
        now + preset.gainAttack + preset.gainDecay
      );

      if (preset.distortion) {
        const waveshaper = ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          const x = (i * 2) / 256 - 1;
          curve[i] = ((Math.PI + 200) * x) / (Math.PI + 200 * Math.abs(x));
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
      // Slight frequency randomization for natural feel
      const freqVariation = 1 + (Math.random() - 0.5) * 0.08;
      osc.frequency.setValueAtTime(preset.freq * freqVariation, now);
      osc.frequency.exponentialRampToValueAtTime(
        preset.freq2 * freqVariation,
        now + preset.duration
      );
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + preset.duration + 0.01);
    } catch {
      // Ignore audio errors
    }
  }, [getCtx]);

  // ─── Public API ───────────────────────────────────────
  const playKeyClick = useCallback((isShift = false) => {
    const preset = { ...PRESETS[packRef.current].key };
    if (isShift) {
      preset.freq *= 1.2;
      preset.freq2 *= 1.2;
    }
    playPreset(preset, 0.8);
  }, [playPreset]);

  const playError = useCallback(() => {
    if (!soundOnErrorRef.current) return;
    playPreset(PRESETS[packRef.current].error, 0.7);
  }, [playPreset]);

  const playWordComplete = useCallback(() => {
    playPreset(PRESETS[packRef.current].word, 0.5);
  }, [playPreset]);

  const playTestFinish = useCallback(() => {
    const preset = PRESETS[packRef.current].finish;
    const ctx = getCtx();
    if (!ctx || packRef.current === "silent") return;

    const now = ctx.currentTime;
    const vol = volumeRef.current;

    // Ascending chord: root + 5th + octave
    const freqs = [preset.freq, preset.freq * 1.5, preset.freq * 2];
    freqs.forEach((freq, i) => {
      try {
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, now + i * 0.12);
        gainNode.gain.linearRampToValueAtTime(vol * 0.6, now + i * 0.12 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + preset.duration);
        gainNode.connect(ctx.destination);

        const osc = ctx.createOscillator();
        osc.type = preset.type;
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        osc.connect(gainNode);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + preset.duration + 0.05);
      } catch {}
    });
  }, [getCtx]);

  const playCountdown = useCallback((isLast = false) => {
    const ctx = getCtx();
    if (!ctx || packRef.current === "silent") return;
    const now = ctx.currentTime;
    const freq = isLast ? 1760 : 880;
    try {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volumeRef.current * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      gain.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }, [getCtx]);

  // ─── Config setters ───────────────────────────────────
  const setSoundPack = useCallback((pack: SoundPack) => {
    packRef.current = pack;
  }, []);

  const setVolume = useCallback((vol: number) => {
    volumeRef.current = Math.max(0, Math.min(1, vol));
  }, []);

  const setSoundOnError = useCallback((enabled: boolean) => {
    soundOnErrorRef.current = enabled;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close();
      }
    };
  }, []);

  return {
    playKeyClick,
    playError,
    playWordComplete,
    playTestFinish,
    playCountdown,
    setSoundPack,
    setVolume,
    setSoundOnError,
  };
}
