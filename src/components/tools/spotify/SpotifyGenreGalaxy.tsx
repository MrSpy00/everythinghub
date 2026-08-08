"use client";

import React from "react";
import { motion } from "framer-motion";
import { Radio, Sparkles, Layers, Tag } from "lucide-react";
import { DominantMood } from "@/lib/spotify-analyzer";

interface SpotifyGenreGalaxyProps {
  genres: { genre: string; count: number; percentage: number }[];
  mood: DominantMood;
  isTurkish?: boolean;
}

export function SpotifyGenreGalaxy({ genres, mood, isTurkish = true }: SpotifyGenreGalaxyProps) {
  const genreColors = [
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#ef4444",
  ];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 backdrop-blur-xl">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isTurkish ? "Tür Galaksisi & Mood Vibe Sınıflandırıcı" : "Genre Galaxy & Mood Vibe Classifier"}
            </h3>
            <p className="text-xs text-white/60">
              {isTurkish ? "Chosic standartlarında tür kümelenmesi ve atmosfer haritası" : "Genre taxonomy & sonic mood analysis based on Chosic"}
            </p>
          </div>
        </div>
      </div>

      {/* Mood Vibe Highlight Card */}
      <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>{isTurkish ? "Baskın Atmosfer Tag'i" : "Dominant Mood Vibe Tag"}</span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
            {isTurkish ? mood.labelTr : mood.labelEn}
          </span>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          {isTurkish ? mood.descriptionTr : mood.descriptionEn}
        </p>
      </div>

      {/* Genre Distribution Bars & Cluster Pills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-white/70">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            {isTurkish ? "Tür Dağılım Çubuğu" : "Genre Share Spectrum"}
          </span>
          <span>{genres.length} {isTurkish ? "Alt Tür Kümesi" : "Sub-genres"}</span>
        </div>

        {/* Multi-segment Spectrum Bar */}
        <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden flex shadow-inner">
          {genres.map((g, idx) => (
            <motion.div
              key={g.genre}
              initial={{ width: 0 }}
              animate={{ width: `${g.percentage}%` }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              style={{ backgroundColor: genreColors[idx % genreColors.length] }}
              title={`${g.genre}: %${g.percentage}`}
              className="h-full border-r border-black/20 first:rounded-l-full last:rounded-r-full"
            />
          ))}
        </div>

        {/* Interactive Genre Chips Grid */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          {genres.map((g, idx) => {
            const color = genreColors[idx % genreColors.length];
            return (
              <div
                key={g.genre}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.08] transition-all"
              >
                <Tag className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-xs font-semibold text-white/90">{g.genre}</span>
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white/80">
                  %{g.percentage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
