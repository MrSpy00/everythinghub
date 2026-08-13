/**
 * HubSense — Sound Scoring Engine
 * Uses ERB (Equivalent Rectangular Bandwidth) psychoacoustic model.
 * ERB captures how humans perceive pitch differences — not linearly,
 * but logarithmically in a way that matches auditory filter bandwidth.
 *
 * Score: 0-10 per round.
 */

// ─── ERB Rate (Bark-like scale) ───────────────────────────────────────────────
// ERB rate: E(f) = 21.4 * log10(0.00437 * f + 1)
export function freqToERB(freq: number): number {
  return 21.4 * Math.log10(0.00437 * freq + 1);
}

export function erbToFreq(erb: number): number {
  return (Math.pow(10, erb / 21.4) - 1) / 0.00437;
}

// ─── Cents (semitone subdivisions) ───────────────────────────────────────────
export function freqToCents(freq: number): number {
  // A4 = 440Hz reference, 1 semitone = 100 cents
  return 1200 * Math.log2(freq / 440);
}

export function centDifference(f1: number, f2: number): number {
  return Math.abs(freqToCents(f1) - freqToCents(f2));
}

// ─── Score Calculation ────────────────────────────────────────────────────────
export interface SoundScoreResult {
  score: number; // 0-10
  erbDistance: number;
  centDiff: number;
  semitoneError: number;
  targetFreq: number;
  guessFreq: number;
  targetNote: string;
  guessNote: string;
  percentAccuracy: number;
}

// Musical note names
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function freqToNoteName(freq: number): string {
  const midi = Math.round(12 * Math.log2(freq / 440) + 69);
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

// Max ERB distance for score=0 threshold
const MAX_ERB_DISTANCE = 8; // ~covers 80Hz–2000Hz range max mismatch

export function scoreSound(targetFreq: number, guessFreq: number): SoundScoreResult {
  const targetERB = freqToERB(targetFreq);
  const guessERB = freqToERB(guessFreq);
  const erbDist = Math.abs(targetERB - guessERB);
  const cents = centDifference(targetFreq, guessFreq);
  const semitoneError = cents / 100;

  // Smooth exponential decay score
  const raw = Math.exp(-erbDist / (MAX_ERB_DISTANCE * 0.35));
  const score = parseFloat((raw * 10).toFixed(2));
  const percentAccuracy = parseFloat(((score / 10) * 100).toFixed(1));

  return {
    score,
    erbDistance: parseFloat(erbDist.toFixed(3)),
    centDiff: parseFloat(cents.toFixed(1)),
    semitoneError: parseFloat(semitoneError.toFixed(2)),
    targetFreq,
    guessFreq,
    targetNote: freqToNoteName(targetFreq),
    guessNote: freqToNoteName(guessFreq),
    percentAccuracy,
  };
}

// ─── Frequency Generation ─────────────────────────────────────────────────────
export interface SoundGameConfig {
  minFreq: number;
  maxFreq: number;
  displayMin: number;
  displayMax: number;
}

export const SOUND_CONFIGS: Record<string, SoundGameConfig> = {
  easy: { minFreq: 120, maxFreq: 2400, displayMin: 80, displayMax: 3500 },
  hard: { minFreq: 90, maxFreq: 3200, displayMin: 80, displayMax: 3500 },
  brutal: { minFreq: 80, maxFreq: 4200, displayMin: 80, displayMax: 3500 },
};

// Generate dynamic, acoustically-diverse frequencies across rounds
export function generateFrequency(
  seed: number,
  roundIndex: number,
  difficulty: "easy" | "hard" | "brutal"
): number {
  const config = SOUND_CONFIGS[difficulty];
  const roundSeed = (seed ^ ((roundIndex + 1) * 0x7feb352d) ^ 0xb9e248a1) >>> 0;
  let s = roundSeed;
  const rng = () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
  
  // Partition frequency spectrum into 4 distinct acoustic register bands per round
  const BANDS = [
    { min: Math.max(config.minFreq, 80), max: 240 },
    { min: 240, max: 680 },
    { min: 680, max: 1800 },
    { min: 1800, max: Math.min(config.maxFreq, 4200) },
  ];

  const bandIndex = (roundIndex + Math.floor(seed % 4)) % BANDS.length;
  const targetBand = BANDS[bandIndex];

  const pseudo = rng();
  const logMin = Math.log(targetBand.min);
  const logMax = Math.log(targetBand.max);
  const freq = Math.exp(logMin + pseudo * (logMax - logMin));
  
  return parseFloat(freq.toFixed(1));
}

// ─── Web Audio Tone Player ────────────────────────────────────────────────────
export function createTonePlayer(audioCtx: AudioContext) {
  return {
    play(freq: number, durationMs: number, volume = 0.4): void {
      const startTime = audioCtx.currentTime;
      const duration = durationMs / 1000;

      // Primary Fundamental Oscillator (Sine)
      const osc1 = audioCtx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, startTime);

      // Warm Overtone Oscillator (Triangle - 1 octave higher at lower volume)
      const osc2 = audioCtx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      const gain1 = audioCtx.createGain();
      const gain2 = audioCtx.createGain();
      const masterGain = audioCtx.createGain();

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(masterGain);
      gain2.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      // Envelopes: Smooth 15ms attack + exponential decay curve
      gain1.gain.setValueAtTime(0, startTime);
      gain1.gain.linearRampToValueAtTime(volume * 0.8, startTime + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0005, startTime + duration);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    },

    playChord(freqs: number[], durationMs: number, volume = 0.3): void {
      freqs.forEach((f) => this.play(f, durationMs, volume / freqs.length));
    },

    playSuccess(): void {
      // Ascending pleasant chord
      this.play(523.25, 200, 0.3); // C5
      setTimeout(() => this.play(659.25, 200, 0.3), 100); // E5
      setTimeout(() => this.play(783.99, 300, 0.3), 200); // G5
    },

    playFail(): void {
      // Descending tone
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    },

    playClick(): void {
      this.play(800, 50, 0.15);
    },

    playLaunch(): void {
      // Ambient pad chord
      [261.63, 329.63, 392.0, 523.25].forEach((f, i) => {
        setTimeout(() => this.play(f, 800, 0.08), i * 80);
      });
    },
  };
}
