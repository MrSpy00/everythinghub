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
  easy: { minFreq: 200, maxFreq: 1500, displayMin: 80, displayMax: 2000 },
  hard: { minFreq: 100, maxFreq: 1800, displayMin: 80, displayMax: 2000 },
  brutal: { minFreq: 80, maxFreq: 2000, displayMin: 80, displayMax: 2000 },
};

// Generate musically-meaningful frequency (from equal temperament)
export function generateFrequency(
  seed: number,
  roundIndex: number,
  difficulty: "easy" | "hard" | "brutal"
): number {
  const config = SOUND_CONFIGS[difficulty];
  // Use seed + round to get deterministic but varied frequencies
  const pseudo = Math.sin(seed * 9301 + roundIndex * 49297 + 233995) * 0.5 + 0.5;
  // Map to frequency range with logarithmic distribution (sounds natural)
  const logMin = Math.log(config.minFreq);
  const logMax = Math.log(config.maxFreq);
  return Math.exp(logMin + pseudo * (logMax - logMin));
}

// ─── Web Audio Tone Player ────────────────────────────────────────────────────
export function createTonePlayer(audioCtx: AudioContext) {
  return {
    play(freq: number, durationMs: number, volume = 0.5): void {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Smooth attack/release to avoid clicking
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.03);
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime + durationMs / 1000 - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + durationMs / 1000);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + durationMs / 1000);
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
