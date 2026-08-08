"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, History, Sparkles } from "lucide-react";

interface DecadeItem {
  decade: string;
  count: number;
  percentage: number;
}

interface SpotifyDecadeTimelineProps {
  decadeDistribution: DecadeItem[];
  isTurkish?: boolean;
}

export function SpotifyDecadeTimeline({ decadeDistribution, isTurkish = true }: SpotifyDecadeTimelineProps) {
  const maxPct = Math.max(...decadeDistribution.map((d) => d.percentage), 1);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-300 backdrop-blur-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isTurkish ? "Zaman Tüneli & On Yıllık Çıkış Yılları" : "Decade Timeline & Release Distribution"}
            </h3>
            <p className="text-xs text-white/60">
              {isTurkish ? "Şarkıların çıkış tarihlerinin kronolojik dönemsel dağılımı" : "Chronological release decade breakdown & track age metrics"}
            </p>
          </div>
        </div>
      </div>

      {/* Decade Bars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {decadeDistribution.map((d, i) => {
          const heightRatio = Math.max(0.15, d.percentage / maxPct);

          return (
            <div
              key={d.decade}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-end h-44 space-y-3 hover:bg-white/[0.06] transition-all"
            >
              <span className="font-mono text-xs font-bold text-pink-400">%{d.percentage}</span>

              {/* Vertical Bar */}
              <div className="w-full max-w-[32px] h-24 bg-white/10 rounded-xl overflow-hidden flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightRatio * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="w-full bg-gradient-to-t from-pink-600 to-rose-400 rounded-xl shadow-[0_0_10px_rgba(236,72,153,0.4)]"
                />
              </div>

              <span className="font-bold text-sm text-white">{d.decade}</span>
              <span className="text-[11px] text-white/50">{d.count} {isTurkish ? "Parça" : "Tracks"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
