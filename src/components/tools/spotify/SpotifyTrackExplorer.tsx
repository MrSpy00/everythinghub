"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Play, Pause, Flame, Zap, Clock, Star, ExternalLink, ShieldAlert } from "lucide-react";
import { SpotifyTrack, formatKeyAndCamelot } from "@/lib/spotify-analyzer";
import { cn } from "@/lib/utils";

interface SpotifyTrackExplorerProps {
  tracks: SpotifyTrack[];
  isTurkish?: boolean;
}

export function SpotifyTrackExplorer({ tracks, isTurkish = true }: SpotifyTrackExplorerProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "bpm" | "energy" | "popularity" | "duration">("default");
  const [filterExplicit, setFilterExplicit] = useState(false);
  const [filterInstrumental, setFilterInstrumental] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const filteredTracks = useMemo(() => {
    return tracks
      .filter((t) => {
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = t.name.toLowerCase().includes(q);
          const matchArtist = t.artists.some((a) => a.name.toLowerCase().includes(q));
          const matchAlbum = t.albumName.toLowerCase().includes(q);
          if (!matchTitle && !matchArtist && !matchAlbum) return false;
        }
        if (filterExplicit && !t.explicit) return false;
        if (filterInstrumental && t.audioFeatures.instrumentalness < 0.5) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "bpm") return b.audioFeatures.tempo - a.audioFeatures.tempo;
        if (sortBy === "energy") return b.audioFeatures.energy - a.audioFeatures.energy;
        if (sortBy === "popularity") return b.popularity - a.popularity;
        if (sortBy === "duration") return b.durationMs - a.durationMs;
        return 0;
      });
  }, [tracks, search, sortBy, filterExplicit, filterInstrumental]);

  const togglePlayPreview = (trackId: string, previewUrl?: string | null) => {
    if (!previewUrl) return;
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(trackId);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTurkish ? "Şarkı, sanatçı veya albüm ara..." : "Search tracks, artists, or albums..."}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
          />
        </div>

        {/* Sort & Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-white/90 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="default">{isTurkish ? "Sıralama: Varsayılan" : "Sort: Default"}</option>
            <option value="bpm">{isTurkish ? "BPM (Hız) Yüksek" : "Sort: Highest BPM"}</option>
            <option value="energy">{isTurkish ? "Enerji Yüksek" : "Sort: Highest Energy"}</option>
            <option value="popularity">{isTurkish ? "Popülerlik Yüksek" : "Sort: Highest Popularity"}</option>
            <option value="duration">{isTurkish ? "En Uzun Süre" : "Sort: Longest Duration"}</option>
          </select>

          {/* Explicit Toggle */}
          <button
            onClick={() => setFilterExplicit(!filterExplicit)}
            className={cn(
              "px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all",
              filterExplicit
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]"
            )}
          >
            Explicit
          </button>

          {/* Instrumental Toggle */}
          <button
            onClick={() => setFilterInstrumental(!filterInstrumental)}
            className={cn(
              "px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all",
              filterInstrumental
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]"
            )}
          >
            {isTurkish ? "Enstrümantal" : "Instrumental"}
          </button>
        </div>
      </div>

      {/* Track Count Badge */}
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{filteredTracks.length} / {tracks.length} {isTurkish ? "Parça Gösteriliyor" : "Tracks Displayed"}</span>
      </div>

      {/* Tracks Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-white/80">
          <thead>
            <tr className="border-b border-white/10 text-white/50 uppercase font-mono tracking-wider">
              <th className="pb-3 pl-3">#</th>
              <th className="pb-3">{isTurkish ? "Şarkı & Sanatçı" : "Track & Artist"}</th>
              <th className="pb-3">{isTurkish ? "Albüm" : "Album"}</th>
              <th className="pb-3">BPM</th>
              <th className="pb-3">Key</th>
              <th className="pb-3">Enerji</th>
              <th className="pb-3">Popülerlik</th>
              <th className="pb-3 pr-3 text-right">Süre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTracks.map((t, idx) => {
              const { name: keyName, camelot } = formatKeyAndCamelot(t.audioFeatures.key, t.audioFeatures.mode);
              const durSec = Math.round(t.durationMs / 1000);
              const m = Math.floor(durSec / 60);
              const s = String(durSec % 60).padStart(2, "0");

              return (
                <tr key={t.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="py-3 pl-3 font-mono text-white/40">{idx + 1}</td>

                  {/* Title & Artwork */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.albumCover}
                        alt={t.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                            {t.name}
                          </span>
                          {t.explicit && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              EXPLICIT
                            </span>
                          )}
                        </div>
                        <p className="text-white/60">{t.artists.map((a) => a.name).join(", ")}</p>
                      </div>
                    </div>
                  </td>

                  {/* Album */}
                  <td className="py-3 pr-4 text-white/60 truncate max-w-[140px]">{t.albumName}</td>

                  {/* BPM */}
                  <td className="py-3 pr-4 font-mono font-bold text-emerald-400">{t.audioFeatures.tempo}</td>

                  {/* Key */}
                  <td className="py-3 pr-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {camelot}
                    </span>
                  </td>

                  {/* Energy */}
                  <td className="py-3 pr-4 font-mono text-amber-400">%{Math.round(t.audioFeatures.energy * 100)}</td>

                  {/* Popularity */}
                  <td className="py-3 pr-4 font-mono text-cyan-400">{t.popularity}</td>

                  {/* Duration */}
                  <td className="py-3 pr-3 text-right font-mono text-white/60">{m}:{s}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
