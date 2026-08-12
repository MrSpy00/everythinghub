"use client";

/**
 * HubSense — Sensory Insights & Perception Profile Modal (Centered Liquid Glass Studio Edition)
 * Scientific breakdown of sensory memory, perception age estimation,
 * and cognitive domain balance with full bilingual (TR/EN) support.
 */

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Palette,
  Volume2,
  Clock,
  Shapes,
  Zap,
  Sparkles,
  X,
} from "lucide-react";
import { getPersonalBests } from "../games/antiCheat";
import type { GameType } from "../games/seedGenerator";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";

interface SensoryInsightsProps {
  onClose: () => void;
}

export function SensoryInsights({ onClose }: SensoryInsightsProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;
  const pbs = getPersonalBests();

  const DISCIPLINES: {
    type: GameType;
    icon: React.ReactNode;
    color: string;
  }[] = [
    { type: "color", icon: <Palette className="w-4 h-4 text-indigo-400" />, color: "#6366f1" },
    { type: "sound", icon: <Volume2 className="w-4 h-4 text-violet-400" />, color: "#8b5cf6" },
    { type: "time", icon: <Clock className="w-4 h-4 text-emerald-400" />, color: "#10b981" },
    { type: "shape", icon: <Shapes className="w-4 h-4 text-amber-400" />, color: "#f59e0b" },
    { type: "sequence", icon: <Zap className="w-4 h-4 text-pink-400" />, color: "#ec4899" },
  ];

  // Compute stats across all games
  const gameStats = DISCIPLINES.map(({ type, icon, color }) => {
    const easy = pbs[type]?.easy?.score || 0;
    const hard = pbs[type]?.hard?.score || 0;
    const brutal = pbs[type]?.brutal?.score || 0;
    const maxScore = Math.max(easy, hard, brutal);
    const avgScore =
      [easy, hard, brutal].filter((s) => s > 0).reduce((a, b) => a + b, 0) /
        Math.max(1, [easy, hard, brutal].filter((s) => s > 0).length) || 0;

    return {
      game: type,
      info: t.disciplines[type],
      icon,
      color,
      maxScore,
      avgScore,
      percentage: Math.min(100, Math.round((maxScore / 50) * 100)),
    };
  });

  const overallMax =
    gameStats.reduce((acc, curr) => acc + curr.maxScore, 0) /
    Math.max(1, gameStats.length);

  // Perception Age Estimation
  let estimatedAge = 35;
  if (overallMax > 0) {
    estimatedAge = Math.max(18, Math.round(55 - (overallMax / 50) * 35));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Translucent Liquid Glass Backdrop (WebGL dots visible!) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Centered Liquid Glass Modal Dialog */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] rounded-3xl bg-zinc-950/55 border border-white/20 backdrop-blur-3xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg leading-tight">
                {t.insights.title}
              </h2>
              <p className="text-xs text-white/50">{t.insights.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={t.totalResult.menuReturn}
            className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white/[0.05] hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sensory Age Hero Card */}
          <div className="p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.08] to-transparent flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.insights.ageHeroTitle}</span>
              </div>
              <div className="text-5xl font-black text-white tabular-nums tracking-tight">
                {overallMax > 0 ? `${estimatedAge}` : "--"}
                <span className="text-2xl font-medium text-white/40 ml-1.5">
                  {t.insights.ageSuffix}
                </span>
              </div>
              <p className="text-xs text-white/50 max-w-xs mt-1">
                {overallMax >= 40
                  ? t.insights.ageTiers.peak
                  : overallMax >= 25
                  ? t.insights.ageTiers.average
                  : t.insights.ageTiers.novice}
              </p>
            </div>

            {/* Quick Score Badge */}
            <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
              <span className="text-xs text-white/40 mb-0.5">{t.insights.overallAverage}</span>
              <span className="text-3xl font-black text-indigo-400 tabular-nums">
                {overallMax.toFixed(1)}
              </span>
              <span className="text-[10px] text-white/30">{t.insights.pointsOutOfFifty}</span>
            </div>
          </div>

          {/* Sensory Balance Breakdown */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/40 px-1">
              {t.insights.breakdownTitle}
            </h3>

            <div className="space-y-3">
              {gameStats.map(({ game, info, icon, color, maxScore, percentage }) => (
                <div
                  key={game}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${color}18`,
                          border: `1px solid ${color}33`,
                        }}
                      >
                        {icon}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-white">
                          {info.label}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono">
                          {info.metric}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      {maxScore > 0 ? (
                        <div>
                          <span className="text-base font-extrabold text-white">
                            {maxScore.toFixed(1)}
                          </span>
                          <span className="text-xs text-white/40"> / 50</span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/30">{t.insights.notPlayed}</span>
                      )}
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>

                  {/* Science Context */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/50 leading-relaxed">
                    <strong className="text-white/80 block mb-0.5">
                      {info.scienceTitle}
                    </strong>
                    {info.scienceDesc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
