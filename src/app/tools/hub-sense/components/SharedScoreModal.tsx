"use client";

/**
 * HubSense — Shared Score Modal (Centered Liquid Glass Studio Edition)
 * Displays an incoming shared friend score with full bilingual (TR/EN) support.
 */

import React from "react";
import { motion } from "framer-motion";
import { Swords, X, Play } from "lucide-react";
import { type SharePayload } from "../games/shareEncoder";
import { getScoreTier } from "../games/leaderboard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";
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
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const tier = getScoreTier(payload.totalScore);
  const gameConfig = GAME_CONFIGS[payload.gameType] || GAME_CONFIGS.color;
  const accentColor = gameConfig.accent;
  const gameInfo = t.disciplines[payload.gameType];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Liquid Glass Backdrop Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <motion.div
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 16, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md rounded-3xl bg-zinc-950/85 border border-white/15 backdrop-blur-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={t.sharedModal.close}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Challenge Header */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div
            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
            style={{
              background: `${accentColor}18`,
              color: accentColor,
              border: `1px solid ${accentColor}44`,
            }}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{t.sharedModal.badge}</span>
          </div>

          <h3 className="text-xl font-extrabold text-white mt-1">
            {t.sharedModal.challengeTitle(payload.username)}
          </h3>
          <p className="text-xs text-white/50">
            {t.sharedModal.challengeSubtitle(
              gameInfo.label,
              t.difficulties[payload.difficulty].label
            )}
          </p>
        </div>

        {/* Score Card Display */}
        <div
          className="p-6 rounded-3xl border flex flex-col items-center text-center gap-2 relative overflow-hidden shadow-inner"
          style={{
            borderColor: `${accentColor}30`,
            background: `radial-gradient(ellipse at center, ${accentColor}15, rgba(0,0,0,0.4) 80%)`,
          }}
        >
          <span
            className="text-xs font-black uppercase tracking-widest"
            style={{ color: tier.color }}
          >
            {tier.label}
          </span>

          <div className="flex items-baseline justify-center gap-1">
            <span
              className="text-6xl font-black font-mono tracking-tight"
              style={{ color: tier.color }}
            >
              {payload.totalScore.toFixed(1)}
            </span>
            <span className="text-lg text-white/30 font-bold">/ 50</span>
          </div>

          <p className="text-xs text-white/60 mt-1 max-w-xs">{tier.message}</p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAcceptChallenge}
            className="w-full py-4 rounded-2xl font-extrabold text-sm text-white border flex items-center justify-center gap-2 shadow-2xl transition-all"
            style={{
              background: `${accentColor}25`,
              borderColor: `${accentColor}66`,
              boxShadow: `0 0 30px ${accentColor}30`,
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.sharedModal.acceptChallenge}</span>
          </motion.button>

          <button
            onClick={onClose}
            className="py-2.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {t.sharedModal.close}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
