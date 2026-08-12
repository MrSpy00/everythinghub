"use client";

/**
 * HubSense — Shared Score Modal
 * Displays an incoming shared friend score and lets the recipient accept the challenge.
 */

import React from "react";
import { motion } from "framer-motion";
import {
  Swords,
  X,
  Zap,
} from "lucide-react";
import { type SharePayload } from "../games/shareEncoder";
import { getScoreTier } from "../games/leaderboard";
import { GAME_CONFIGS } from "../HubSenseClient";

interface SharedScoreModalProps {
  payload: SharePayload;
  onAcceptChallenge: () => void;
  onClose: () => void;
}

export function SharedScoreModal({
  payload,
  onAcceptChallenge,
  onClose,
}: SharedScoreModalProps) {
  const tier = getScoreTier(payload.totalScore);
  const gameConfig = GAME_CONFIGS[payload.gameType] || GAME_CONFIGS.color;
  const accentColor = gameConfig.accent;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-[#121216] border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Challenge Header */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{
              background: `${accentColor}18`,
              color: accentColor,
              border: `1px solid ${accentColor}44`,
            }}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Meydan Okuma Geldi!</span>
          </div>

          <h3 className="text-xl font-bold text-white mt-1">
            <span className="text-white/80">{payload.username}</span> sana meydan
            okuyor
          </h3>
          <p className="text-xs text-white/40">
            {gameConfig.label} oyunu · {payload.difficulty.toUpperCase()} modu
          </p>
        </div>

        {/* Score Card Display */}
        <div
          className="p-6 rounded-2xl border flex flex-col items-center text-center gap-3 relative overflow-hidden"
          style={{
            borderColor: `${accentColor}30`,
            background: `radial-gradient(ellipse at center, ${accentColor}10, transparent 80%)`,
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: tier.color }}
          >
            {tier.label}
          </span>

          <div className="flex items-baseline justify-center gap-1">
            <span
              className="text-6xl font-black tabular-nums tracking-tight"
              style={{ color: tier.color }}
            >
              {payload.totalScore.toFixed(1)}
            </span>
            <span className="text-lg text-white/30 font-bold">/50</span>
          </div>

          <p className="text-xs text-white/50 max-w-xs">{tier.message}</p>

          {/* Round Breakdown */}
          <div className="grid grid-cols-5 gap-1.5 w-full pt-3 border-t border-white/[0.06]">
            {payload.roundScores.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-white/30 font-mono">R{i + 1}</span>
                <span className="text-xs font-bold text-white/80 tabular-nums">
                  {s.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action CTA */}
        <div className="flex flex-col gap-2.5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAcceptChallenge}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide text-white border transition-all flex items-center justify-center gap-2"
            style={{
              background: `${accentColor}25`,
              borderColor: `${accentColor}50`,
              boxShadow: `0 0 30px ${accentColor}33`,
            }}
          >
            <Zap className="w-4 h-4" />
            <span>Meydan Okumayı Kabul Et & Oyna</span>
          </motion.button>

          <button
            onClick={onClose}
            className="w-full py-3 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Ana Menüye Dön
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
