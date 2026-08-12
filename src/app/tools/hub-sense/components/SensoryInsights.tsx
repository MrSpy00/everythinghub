"use client";

/**
 * HubSense — Sensory Insights & Perception Profile
 * Scientific breakdown of sensory memory, perception age estimation,
 * and cognitive domain balance.
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
  Info,
  X,
} from "lucide-react";
import { getPersonalBests } from "../games/antiCheat";
import type { GameType } from "../games/seedGenerator";

interface SensoryInsightsProps {
  onClose: () => void;
}

const GAME_INFO: Record<
  GameType,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    scienceTitle: string;
    scienceDesc: string;
    metric: string;
  }
> = {
  color: {
    label: "Renk Hafızası",
    icon: <Palette className="w-4 h-4 text-indigo-400" />,
    color: "#6366f1",
    scienceTitle: "CIELAB Delta-E 2000 Standardı",
    scienceDesc:
      "İnsan gözünün koni hücreleri (LMS) ve görsel korteksteki renk algısını en kusursuz modelleyen uluslararası CIE renk farkı formülü.",
    metric: "Delta-E Sapma",
  },
  sound: {
    label: "Ses & Frekans",
    icon: <Volume2 className="w-4 h-4 text-violet-400" />,
    color: "#8b5cf6",
    scienceTitle: "ERB Psikokustik Filtreleme",
    scienceDesc:
      "Koklear baziler zarın frekans bant genişliğini (Equivalent Rectangular Bandwidth) modelleyerek perde hassasiyetini ölçer.",
    metric: "Sent & ERB Mesafe",
  },
  time: {
    label: "Zaman Algısı",
    icon: <Clock className="w-4 h-4 text-emerald-400" />,
    color: "#10b981",
    scienceTitle: "Weber-Fechner İç Saat Yasası",
    scienceDesc:
      "Beynin suplementer motor alanı ve bazal gangliyonlarındaki sirkadiyen & aralık zamanlama tutarlılığını test eder.",
    metric: "Milisaniye Hata Oranı",
  },
  shape: {
    label: "Şekil & Geometri",
    icon: <Shapes className="w-4 h-4 text-amber-400" />,
    color: "#f59e0b",
    scienceTitle: "IoU & Afinite Dönüşüm Geometrisi",
    scienceDesc:
      "Görsel-uzamsal çalışma belleğindeki nesne konturu, döndürme ve ölçek parametrelerinin Intersection-over-Union çakışması.",
    metric: "IoU & Derece Hatası",
  },
  sequence: {
    label: "Harmonik Dizi",
    icon: <Zap className="w-4 h-4 text-pink-400" />,
    color: "#ec4899",
    scienceTitle: "İki Duyulu Fonolojik Döngü",
    scienceDesc:
      "Prefrontal korteksin görsel ve işitsel çalışma belleğini aynı anda koordine etme kapasitesini (Dual Working Memory) ölçer.",
    metric: "Sıralı Doğruluk",
  },
};

export function SensoryInsights({ onClose }: SensoryInsightsProps) {
  const pbs = getPersonalBests();

  // Compute stats across all games
  const gameStats = (Object.keys(GAME_INFO) as GameType[]).map((g) => {
    const easy = pbs[g]?.easy?.score || 0;
    const hard = pbs[g]?.hard?.score || 0;
    const brutal = pbs[g]?.brutal?.score || 0;
    const maxScore = Math.max(easy, hard, brutal);
    const avgScore =
      [easy, hard, brutal].filter((s) => s > 0).reduce((a, b) => a + b, 0) /
        Math.max(1, [easy, hard, brutal].filter((s) => s > 0).length) || 0;

    return {
      game: g,
      info: GAME_INFO[g],
      maxScore,
      avgScore,
      percentage: Math.min(100, Math.round((maxScore / 50) * 100)),
    };
  });

  const overallMax =
    gameStats.reduce((acc, curr) => acc + curr.maxScore, 0) /
    Math.max(1, gameStats.length);

  // Perception Age Estimation
  // 50 score = 19 y/o peak, 25 score = 35 y/o, 10 score = 50+ y/o
  let estimatedAge = 35;
  if (overallMax > 0) {
    estimatedAge = Math.max(18, Math.round(55 - (overallMax / 50) * 35));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#09090b]/95 backdrop-blur-2xl overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">Duyu Profili & Bilim</h2>
            <p className="text-xs text-white/40">Bilişsel algı analizi ve metrikler</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
        {/* Sensory Age Hero Card */}
        <div className="p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.08] to-transparent flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bilişsel Duyu Yaşı</span>
            </div>
            <div className="text-5xl font-black text-white tabular-nums tracking-tight">
              {overallMax > 0 ? `${estimatedAge}` : "--"}
              <span className="text-2xl font-medium text-white/40 ml-1.5">yaş</span>
            </div>
            <p className="text-xs text-white/50 max-w-xs mt-1">
              {overallMax >= 40
                ? "Duyuların en üst %1 insan seviyesinde reaktif ve keskin."
                : overallMax >= 25
                ? "Duyuların ortalama bir yetişkin algı düzeyinde dengeli."
                : "Birkaç oyun oynayarak duyu profilini oluşturmaya başla."}
            </p>
          </div>

          {/* Quick Score Badge */}
          <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-xs text-white/40 mb-0.5">Genel Ortalama</span>
            <span className="text-3xl font-bold text-indigo-400 tabular-nums">
              {overallMax.toFixed(1)}
            </span>
            <span className="text-[10px] text-white/30">/ 50 Puan</span>
          </div>
        </div>

        {/* Sensory Balance Breakdown */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 px-1">
            Duyu Alanları & En İyi Skorlar
          </h3>

          <div className="grid gap-3">
            {gameStats.map(({ game, info, maxScore, percentage }) => (
              <div
                key={game}
                className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${info.color}15`,
                        border: `1px solid ${info.color}30`,
                      }}
                    >
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">
                        {info.label}
                      </div>
                      <div className="text-[10px] text-white/30 font-mono">
                        {info.metric}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-base text-white tabular-nums">
                      {maxScore > 0 ? maxScore.toFixed(1) : "--"}
                      <span className="text-xs text-white/30 ml-0.5">/50</span>
                    </div>
                    <div className="text-[10px] text-white/40">
                      {percentage > 0 ? `%${percentage} Hassasiyet` : "Oynanmadı"}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: info.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>

                {/* Science description */}
                <div className="pt-2 border-t border-white/[0.04] flex items-start gap-2 text-[11px] text-white/40 leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white/60">{info.scienceTitle}:</strong>{" "}
                    {info.scienceDesc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center py-4 text-xs text-white/30">
          EverythingHub HubSense · Bilimsel Bilişsel Duyu Arenası
        </div>
      </div>
    </motion.div>
  );
}
