"use client";

/**
 * HubSense — Sequence Game Component
 * Harmonic short-term memory matrix game with multi-sensory feedback.
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  SEQUENCE_NODES,
  scoreSequence,
  type SequenceNode,
  type SequenceScoreResult,
} from "../games/sequenceScoring";
import { SoundFX, playSynthesizedTone } from "../games/soundEffects";
import { Zap, RotateCcw, CheckCircle2 } from "lucide-react";

interface SequenceGameProps {
  targetSequence: number[];
  onSubmit: (result: SequenceScoreResult) => void;
  difficulty?: "easy" | "hard" | "brutal";
}

export function SequenceGame({
  targetSequence,
  onSubmit,
}: SequenceGameProps) {
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);

  const handlePadPress = useCallback(
    (node: SequenceNode) => {
      SoundFX.padPress(node.freq);
      setActivePad(node.id);
      setTimeout(() => setActivePad(null), 200);

      const nextSeq = [...playerSequence, node.id];
      setPlayerSequence(nextSeq);

      // If length reached or mistake made on brutal
      if (nextSeq.length === targetSequence.length) {
        setTimeout(() => {
          const result = scoreSequence(targetSequence, nextSeq);
          if (result.isPerfect) {
            SoundFX.successRound();
          } else {
            SoundFX.failRound();
          }
          onSubmit(result);
        }, 400);
      }
    },
    [playerSequence, targetSequence, onSubmit]
  );

  const handleClear = () => {
    SoundFX.toggle();
    setPlayerSequence([]);
  };

  const handleForceSubmit = () => {
    const result = scoreSequence(targetSequence, playerSequence);
    if (result.isPerfect) {
      SoundFX.successRound();
    } else {
      SoundFX.failRound();
    }
    onSubmit(result);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto select-none">
      {/* Progress & instructions */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
          <Zap className="w-3.5 h-3.5 text-pink-400" />
          <span>
            {playerSequence.length} / {targetSequence.length} Adım Girildi
          </span>
        </div>

        {/* Input step dots */}
        <div className="flex items-center gap-2 min-h-6">
          {targetSequence.map((_, i) => {
            const hasInput = i < playerSequence.length;
            const enteredNode = hasInput ? SEQUENCE_NODES[playerSequence[i]] : null;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: hasInput ? 1.15 : 1,
                  backgroundColor: enteredNode
                    ? enteredNode.color
                    : "rgba(255, 255, 255, 0.1)",
                }}
                className="w-4 h-4 rounded-full border border-white/20 transition-colors"
                style={{
                  boxShadow: enteredNode ? `0 0 10px ${enteredNode.glow}` : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 2x2 Interactive Pad Matrix */}
      <div className="grid grid-cols-2 gap-3.5 w-full max-w-[340px] aspect-square">
        {SEQUENCE_NODES.map((node) => {
          const isActive = activePad === node.id;
          return (
            <motion.button
              key={node.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => handlePadPress(node)}
              className="relative flex flex-col items-center justify-center p-6 rounded-3xl border transition-all text-white overflow-hidden"
              style={{
                background: isActive
                  ? node.glow
                  : "rgba(255, 255, 255, 0.03)",
                borderColor: isActive ? node.color : "rgba(255, 255, 255, 0.1)",
                boxShadow: isActive ? `0 0 35px ${node.glow}` : "none",
              }}
            >
              {/* Inner glowing pulse */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg mb-2"
                style={{
                  background: `${node.color}22`,
                  color: node.color,
                  border: `1px solid ${node.color}44`,
                }}
              >
                {node.label[0]}
              </div>
              <span className="font-semibold text-sm tracking-wide text-white/90">
                {node.label}
              </span>
              <span className="text-[10px] text-white/40 font-mono mt-0.5">
                {node.note} · {Math.round(node.freq)}Hz
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-3 w-full max-w-[340px]">
        <button
          onClick={handleClear}
          disabled={playerSequence.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl
            bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all
            text-xs text-white/60 disabled:opacity-30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Temizle</span>
        </button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleForceSubmit}
          disabled={playerSequence.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl
            font-bold text-xs text-white border transition-all disabled:opacity-30"
          style={{
            background: "rgba(236, 72, 153, 0.15)",
            borderColor: "rgba(236, 72, 153, 0.4)",
            boxShadow: "0 0 20px rgba(236, 72, 153, 0.2)",
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
          <span>Tamamla</span>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Sequence Display (Stimulus / Reveal Phase) ───────────────────────────────
interface SequenceDisplayProps {
  sequence: number[];
  onHide: () => void;
  speedMs?: number;
}

export function SequenceDisplay({
  sequence,
  onHide,
  speedMs = 700,
}: SequenceDisplayProps) {
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (stepIndex < sequence.length) {
      const nodeId = sequence[stepIndex];
      const node = SEQUENCE_NODES[nodeId];

      setHighlightedStep(nodeId);
      playSynthesizedTone(node.freq, speedMs * 0.7, 0.35);

      timeoutId = setTimeout(() => {
        setHighlightedStep(null);
        timeoutId = setTimeout(() => {
          setStepIndex((s) => s + 1);
        }, 150);
      }, speedMs * 0.75);
    } else {
      timeoutId = setTimeout(() => {
        onHide();
      }, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [stepIndex, sequence, onHide, speedMs]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090b] px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-white/40 text-sm font-mono mb-4">
        Sırayı ve Sesleri Hatırla
      </div>

      {/* Active step progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {sequence.map((nodeId, idx) => {
          const isPassed = idx < stepIndex;
          const isCurrent = idx === stepIndex && highlightedStep !== null;
          const node = SEQUENCE_NODES[nodeId];
          return (
            <motion.div
              key={idx}
              animate={{
                scale: isCurrent ? 1.4 : 1,
                backgroundColor: isCurrent || isPassed ? node.color : "rgba(255,255,255,0.1)",
              }}
              className="w-3.5 h-3.5 rounded-full border border-white/20"
              style={{
                boxShadow: isCurrent ? `0 0 15px ${node.glow}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* 2x2 Glowing Stimulus Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[320px] aspect-square pointer-events-none">
        {SEQUENCE_NODES.map((node) => {
          const isGlowing = highlightedStep === node.id;
          return (
            <motion.div
              key={node.id}
              animate={{
                scale: isGlowing ? 1.05 : 1,
                borderColor: isGlowing ? node.color : "rgba(255,255,255,0.08)",
                backgroundColor: isGlowing ? node.glow : "rgba(255,255,255,0.02)",
                boxShadow: isGlowing ? `0 0 45px ${node.glow}` : "none",
              }}
              transition={{ duration: 0.1 }}
              className="flex flex-col items-center justify-center rounded-3xl border p-5 text-white"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg mb-2"
                style={{
                  background: `${node.color}22`,
                  color: node.color,
                }}
              >
                {node.label[0]}
              </div>
              <span className="font-semibold text-sm">{node.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
