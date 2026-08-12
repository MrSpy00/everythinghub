/**
 * HubSense — Sequence Scoring Engine
 * Harmonic auditory-visual sequence memory game.
 * 4 harmonic nodes with specific pitches (C4, E4, G4, C5 major chord).
 * 
 * Round lengths: R1=3, R2=4, R3=5, R4=6, R5=7 steps.
 * Score: 0-10 based on correct prefix sequence matches.
 */

import { createRNG } from "./seedGenerator";

export interface SequenceNode {
  id: number;
  label: string;
  note: string;
  freq: number;
  color: string;
  glow: string;
}

export const SEQUENCE_NODES: SequenceNode[] = [
  {
    id: 0,
    label: "Alfa",
    note: "C4",
    freq: 261.63,
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: 1,
    label: "Beta",
    note: "E4",
    freq: 329.63,
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: 2,
    label: "Gama",
    note: "G4",
    freq: 392.0,
    color: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.4)",
  },
  {
    id: 3,
    label: "Delta",
    note: "C5",
    freq: 523.25,
    color: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.4)",
  },
];

export interface SequenceScoreResult {
  score: number; // 0-10
  targetSequence: number[];
  guessSequence: number[];
  matchedCount: number;
  totalSteps: number;
  percentAccuracy: number;
  isPerfect: boolean;
}

export function generateSequence(
  seed: number,
  roundIndex: number,
  difficulty: "easy" | "hard" | "brutal"
): number[] {
  const baseLength = 3 + roundIndex; // 3 to 7
  const length = difficulty === "brutal" ? baseLength + 1 : baseLength;
  const seq: number[] = [];
  const rng = createRNG((seed ^ ((roundIndex + 1) * 0x9e3779b9) ^ 0x5bd1e995) >>> 0);

  for (let i = 0; i < length; i++) {
    let nodeIndex = Math.floor(rng() * 4);
    // Prevent 3x consecutive repeats of the same pad
    if (i >= 2 && nodeIndex === seq[i - 1] && nodeIndex === seq[i - 2]) {
      nodeIndex = (nodeIndex + 1 + Math.floor(rng() * 3)) % 4;
    }
    seq.push(nodeIndex);
  }

  return seq;
}

export function scoreSequence(
  targetSequence: number[],
  guessSequence: number[]
): SequenceScoreResult {
  const totalSteps = targetSequence.length;
  let matchedCount = 0;

  for (let i = 0; i < totalSteps; i++) {
    if (i < guessSequence.length && guessSequence[i] === targetSequence[i]) {
      matchedCount++;
    } else {
      break; // Sequential prefix matching
    }
  }

  const rawFraction = totalSteps > 0 ? matchedCount / totalSteps : 0;
  const score = parseFloat((rawFraction * 10).toFixed(2));
  const percentAccuracy = parseFloat((rawFraction * 100).toFixed(1));

  return {
    score,
    targetSequence,
    guessSequence,
    matchedCount,
    totalSteps,
    percentAccuracy,
    isPerfect: matchedCount === totalSteps && guessSequence.length === totalSteps,
  };
}
