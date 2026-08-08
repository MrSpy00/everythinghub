"use client";

import React from "react";
import { Disc3, Compass, Info } from "lucide-react";

interface KeyDistItem {
  keyName: string;
  camelot: string;
  count: number;
  percentage: number;
}

interface SpotifyKeyWheelProps {
  keyDistribution: KeyDistItem[];
  isTurkish?: boolean;
}

export function SpotifyKeyWheel({ keyDistribution, isTurkish = true }: SpotifyKeyWheelProps) {
  const topKey = keyDistribution[0] || { keyName: "A Minör", camelot: "8A", percentage: 25 };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-300 backdrop-blur-xl">
            <Disc3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isTurkish ? "Camelot & Müzikal Anahtar (Key) Dağılımı" : "Camelot & Musical Key Wheel"}
            </h3>
            <p className="text-xs text-white/60">
              {isTurkish ? "DJ harmonik geçiş ve müzikal ton analiz çarkı" : "Harmonic mixing & Pitch Class key wheel for DJs and producers"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-3 py-1.5 rounded-full">
          <Compass className="w-4 h-4" />
          <span>{isTurkish ? `Dominant Ton: ${topKey.keyName} (${topKey.camelot})` : `Dominant Key: ${topKey.keyName} (${topKey.camelot})`}</span>
        </div>
      </div>

      {/* Key Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {keyDistribution.map((k, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center justify-center font-mono font-bold text-xs">
                {k.camelot}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{k.keyName}</span>
                <span className="text-[11px] text-white/50">{k.count} {isTurkish ? "Parça" : "Tracks"}</span>
              </div>
            </div>

            <span className="font-mono text-sm font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
              %{k.percentage}
            </span>
          </div>
        ))}
      </div>

      {/* DJ Harmonic Tip Footnote */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/70">
        <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <span>
          {isTurkish
            ? "DJ Harmonik İpucu: Camelot tekerleğindeki aynı veya bitişik numaralı tonlar (örn. 8A ile 8B, 7A veya 9A) kesintisiz ve detonesiz miks yapmaya uygundur."
            : "DJ Harmonic Mixing Tip: Tracks sharing the same or adjacent Camelot numbers (e.g. 8A with 8B, 7A, or 9A) blend seamlessly without harmonic clashes."}
        </span>
      </div>
    </div>
  );
}
