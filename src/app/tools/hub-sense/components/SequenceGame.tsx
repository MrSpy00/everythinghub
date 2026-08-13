"use client";

/**
 * HubSense — Sequence Game Component (Studio Matrix Edition)
 * 4-Pad Harmonic Working Memory Matrix with multi-sensory feedback,
 * tactile audio-visual pads, and full bilingual (TR/EN) support.
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
import { RotateCcw, Check, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";
import { toast } from "sonner";

interface SequenceGameProps {
  targetSequence: number[];
  onSubmit: (result: SequenceScoreResult) => void;
  roundNumber?: number;
  totalRounds?: number;
  roundTimerSeconds?: number;
}

export function SequenceGame({
  targetSequence,
  onSubmit,
  roundNumber = 1,
  totalRounds = 5,
  roundTimerSeconds = 0,
}: SequenceGameProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);

  // Per-Round Countdown Timer
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    roundTimerSeconds && roundTimerSeconds > 0 ? roundTimerSeconds : null
  );

  useEffect(() => {
    if (!roundTimerSeconds || roundTimerSeconds <= 0) {
      setSecondsLeft(null);
      return;
    }
    setSecondsLeft(roundTimerSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundNumber, roundTimerSeconds]);

  const handlePadPress = useCallback(
    (node: SequenceNode) => {
      SoundFX.padPress(node.freq);
      setActivePad(node.id);
      setTimeout(() => setActivePad(null), 180);

      const nextSeq = [...playerSequence, node.id];
      setPlayerSequence(nextSeq);

      if (nextSeq.length === targetSequence.length) {
        setTimeout(() => {
          const result = scoreSequence(targetSequence, nextSeq);
          if (result.isPerfect) {
            SoundFX.successRound();
          } else {
            SoundFX.failRound();
          }
          onSubmit(result);
        }, 350);
      }
    },
    [playerSequence, targetSequence, onSubmit]
  );

  const handleClear = () => {
    SoundFX.click();
    setPlayerSequence([]);
  };

  const handleForceSubmit = useCallback(() => {
    SoundFX.click();
    const result = scoreSequence(targetSequence, playerSequence);
    if (result.isPerfect) {
      SoundFX.successRound();
    } else {
      SoundFX.failRound();
    }
    onSubmit(result);
  }, [targetSequence, playerSequence, onSubmit]);

  // Auto-submit when time expires
  useEffect(() => {
    if (secondsLeft === 0) {
      SoundFX.failRound();
      toast.warning(t.timeUpToast);
      handleForceSubmit();
    }
  }, [secondsLeft, handleForceSubmit, t.timeUpToast]);

  const nodeLabels = [
    t.sequence.nodes.c4,
    t.sequence.nodes.e4,
    t.sequence.nodes.g4,
    t.sequence.nodes.c5,
  ];

  return (
    <div
      className="hubsense-game-arena relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 select-none flex flex-col justify-between p-6 sm:p-8 backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(80,7,36,0.7) 0%, rgba(9,9,11,0.85) 80%)",
      }}
      data-no-custom-cursor="true"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between w-full">
        {secondsLeft !== null ? (
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-xl border text-xs font-mono font-extrabold shadow-lg transition-all duration-300 ${
              secondsLeft <= 10
                ? "bg-rose-500/25 border-rose-500/60 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                : "bg-white/[0.05] border-white/15 text-white/90"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 shrink-0 ${secondsLeft <= 10 ? "text-rose-400" : "text-pink-300"}`} />
            <span>{secondsLeft}s</span>
          </div>
        ) : (
          <div />
        )}

        {/* Input step dots */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
          {targetSequence.map((_, i) => {
            const hasInput = i < playerSequence.length;
            const enteredNode = hasInput ? SEQUENCE_NODES[playerSequence[i]] : null;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: hasInput ? 1.2 : 1,
                  backgroundColor: enteredNode
                    ? enteredNode.color
                    : "rgba(255, 255, 255, 0.15)",
                }}
                className="w-3.5 h-3.5 rounded-full border border-white/20 transition-all"
                style={{
                  boxShadow: enteredNode ? `0 0 12px ${enteredNode.glow}` : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Main 2x2 Pad Matrix */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="grid grid-cols-2 gap-3.5 w-full max-w-[320px] sm:max-w-[360px] aspect-square">
          {SEQUENCE_NODES.map((node, idx) => {
            const isActive = activePad === node.id;
            return (
              <motion.button
                key={node.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => handlePadPress(node)}
                data-cursor={`${nodeLabels[idx] || node.label} · ${node.note} (${Math.round(node.freq)}Hz)`}
                className="relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-3xl border-2 transition-all text-white overflow-hidden shadow-xl"
                style={{
                  background: isActive
                    ? node.glow
                    : "rgba(255, 255, 255, 0.03)",
                  borderColor: isActive ? node.color : "rgba(255, 255, 255, 0.1)",
                  boxShadow: isActive ? `0 0 45px ${node.glow}` : "none",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl mb-2 shadow-inner"
                  style={{
                    background: `${node.color}25`,
                    color: node.color,
                    border: `1px solid ${node.color}55`,
                  }}
                >
                  {node.label[0]}
                </div>
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                  {nodeLabels[idx] || node.label}
                </span>
                <span className="text-[11px] text-white/50 font-mono mt-0.5">
                  {node.note} · {Math.round(node.freq)}Hz
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mt-5 w-full max-w-[320px] sm:max-w-[360px]">
          <button
            onClick={handleClear}
            disabled={playerSequence.length === 0}
            data-cursor={t.sequence.reset}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-white/70 disabled:opacity-30 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.sequence.reset}</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-white/[0.03] backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.sequence.label}
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleForceSubmit}
          disabled={playerSequence.length === 0}
          data-cursor={t.sequence.confirm}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl border-2 border-white/80 hover:bg-zinc-100 transition-all disabled:opacity-30 group"
          style={{
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(236,72,153,0.4)",
          }}
          title={t.sequence.confirm}
        >
          <Check className="w-7 h-7 stroke-[3] text-zinc-900 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Sequence Display (Stimulus Reveal Phase) ─────────────────────────────────
interface SequenceDisplayProps {
  sequence: number[];
  onHide: () => void;
  speedMs?: number;
  roundNumber?: number;
  totalRounds?: number;
}

export function SequenceDisplay({
  sequence,
  onHide,
  speedMs = 700,
  roundNumber = 1,
  totalRounds = 5,
}: SequenceDisplayProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

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
      }, 450);
    }

    return () => clearTimeout(timeoutId);
  }, [stepIndex, sequence, onHide, speedMs]);

  const nodeLabels = [
    t.sequence.nodes.c4,
    t.sequence.nodes.e4,
    t.sequence.nodes.g4,
    t.sequence.nodes.c5,
  ];

  return (
    <motion.div
      className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between p-6 sm:p-10 select-none backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(80,7,36,0.8) 0%, rgba(9,9,11,0.9) 80%)",
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-end w-full">
        <div className="text-right">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tighter text-pink-300 drop-shadow-lg">
            {stepIndex + 1} / {sequence.length}
          </div>
          <div className="text-xs sm:text-sm font-medium text-pink-200">
            {t.sequence.revealSubtitle}
          </div>
        </div>
      </div>

      {/* Center 2x2 Glowing Stimulus Grid */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="grid grid-cols-2 gap-4 w-full max-w-[300px] sm:max-w-[340px] aspect-square pointer-events-none">
          {SEQUENCE_NODES.map((node, idx) => {
            const isGlowing = highlightedStep === node.id;
            return (
              <motion.div
                key={node.id}
                animate={{
                  scale: isGlowing ? 1.08 : 1,
                  borderColor: isGlowing ? node.color : "rgba(255,255,255,0.08)",
                  backgroundColor: isGlowing ? node.glow : "rgba(255,255,255,0.02)",
                  boxShadow: isGlowing ? `0 0 50px ${node.glow}` : "none",
                }}
                transition={{ duration: 0.1 }}
                className="flex flex-col items-center justify-center rounded-3xl border-2 p-5 text-white shadow-xl"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl mb-2"
                  style={{
                    background: `${node.color}25`,
                    color: node.color,
                  }}
                >
                  {node.label[0]}
                </div>
                <span className="font-extrabold text-sm text-white">
                  {nodeLabels[idx] || node.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-white/[0.03] backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.sequence.label}
        </div>
      </div>
    </motion.div>
  );
}
