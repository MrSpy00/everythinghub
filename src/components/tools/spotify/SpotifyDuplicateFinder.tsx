"use client";

import React, { useState } from "react";
import { CopyCheck, CheckCircle2, AlertCircle, Trash2, Copy, Check } from "lucide-react";
import { SpotifyTrack } from "@/lib/spotify-analyzer";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface DuplicatePair {
  originalTrack: SpotifyTrack;
  duplicateTrack: SpotifyTrack;
  reason: string;
}

interface SpotifyDuplicateFinderProps {
  duplicates: DuplicatePair[];
  isTurkish?: boolean;
}

export function SpotifyDuplicateFinder({ duplicates, isTurkish = true }: SpotifyDuplicateFinderProps) {
  const [copied, setCopied] = useState(false);

  if (!duplicates || duplicates.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 backdrop-blur-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isTurkish ? "Kopya Şarkı Tespiti & Temizleyici" : "Duplicate Track Scanner & Cleaner"}
            </h3>
            <p className="text-xs text-emerald-400 font-medium">
              {isTurkish ? "Harika! Çalma listesinde hiçbir mükerrer/kopya şarkı bulunamadı." : "Great news! Zero duplicate tracks found in this playlist."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleCopyCleanList = () => {
    const text = duplicates.map((d) => `${d.duplicateTrack.name} - ${d.duplicateTrack.artists[0]?.name}`).join("\n");
    copyToClipboard(text);
    setCopied(true);
    toast.success(isTurkish ? "Kopya parça isimleri kopyalandı!" : "Duplicate track titles copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 backdrop-blur-xl">
            <CopyCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isTurkish ? "Kopya Şarkı Tespiti & Temizleyici" : "Duplicate Track Scanner & Cleaner"}
            </h3>
            <p className="text-xs text-amber-400 font-medium">
              {isTurkish ? `Çalma listesinde ${duplicates.length} adet mükerrer parça bulundu.` : `Found ${duplicates.length} duplicate tracks in this playlist.`}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyCleanList}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-white hover:bg-white/[0.1] active:scale-95 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/70" />}
          <span>{copied ? (isTurkish ? "Kopyalandı" : "Copied") : (isTurkish ? "Kopya Listesini Kopyala" : "Copy Duplicates List")}</span>
        </button>
      </div>

      {/* Duplicate Pairs List */}
      <div className="space-y-3">
        {duplicates.map((pair, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white/[0.02] border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={pair.duplicateTrack.albumCover}
                alt={pair.duplicateTrack.name}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white">{pair.duplicateTrack.name}</h4>
                <p className="text-xs text-white/60">{pair.duplicateTrack.artists.map((a) => a.name).join(", ")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {pair.reason}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
