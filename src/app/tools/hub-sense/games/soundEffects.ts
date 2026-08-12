/**
 * HubSense — Procedural Web Audio Sound Engine
 * Zero external audio assets (100% synthesized client-side via Web Audio API).
 * Latency-free, works offline, and unlocks safely on touch/click gestures.
 */

let globalAudioCtx: AudioContext | null = null;
let isAudioMuted = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!globalAudioCtx || globalAudioCtx.state === "closed") {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  return globalAudioCtx;
}

export async function unlockAudio(): Promise<AudioContext | null> {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      // ignore
    }
  }
  return ctx;
}

export function setSoundMuted(muted: boolean): void {
  isAudioMuted = muted;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("hubsense_muted", muted ? "1" : "0");
    } catch {
      // ignore
    }
  }
}

export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("hubsense_muted") === "1";
  } catch {
    return isAudioMuted;
  }
}

/**
 * Plays a synthesized sine/triangle tone with exponential envelope.
 */
export function playSynthesizedTone(
  freq: number,
  durationMs: number,
  volume = 0.3,
  type: OscillatorType = "sine"
): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const attack = 0.02;
    const release = 0.05;
    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.setValueAtTime(volume, Math.max(now + attack, now + duration - release));
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // AudioContext failure fallback
  }
}

/**
 * Triggers light haptic feedback on mobile if supported.
 */
export function triggerHaptic(pattern: number | number[] = 15): void {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

/**
 * Sound effects presets
 */
export const SoundFX = {
  click: () => {
    playSynthesizedTone(750, 40, 0.12, "sine");
    triggerHaptic(10);
  },
  toggle: () => {
    playSynthesizedTone(950, 60, 0.15, "triangle");
    triggerHaptic(12);
  },
  padPress: (freq: number) => {
    playSynthesizedTone(freq, 250, 0.35, "sine");
    triggerHaptic(20);
  },
  successRound: () => {
    // Ascending triad (C5 - E5 - G5)
    setTimeout(() => playSynthesizedTone(523.25, 140, 0.25), 0);
    setTimeout(() => playSynthesizedTone(659.25, 140, 0.25), 100);
    setTimeout(() => playSynthesizedTone(783.99, 260, 0.3), 200);
    triggerHaptic([30, 40, 50]);
  },
  failRound: () => {
    // Descending tone
    const ctx = getAudioContext();
    if (ctx && !isSoundMuted()) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch {
        playSynthesizedTone(180, 250, 0.2);
      }
    }
    triggerHaptic(60);
  },
  gameComplete: () => {
    // Triumphant chord progression
    const chords = [
      [523.25, 659.25, 783.99], // C
      [587.33, 739.99, 880.0], // D
      [659.25, 830.61, 987.77], // E
      [1046.5, 1318.5, 1567.98], // High C
    ];
    chords.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach((f) => playSynthesizedTone(f, 350, 0.15));
      }, i * 160);
    });
    triggerHaptic([40, 50, 60, 100]);
  },
};
