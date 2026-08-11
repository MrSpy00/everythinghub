"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Play,
  Pause,
  Copy,
  Check,
  ExternalLink,
  Volume2,
  VolumeX,
  Music2,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotifyTrack } from "@/lib/spotify-analyzer";
import { formatKeyAndCamelot } from "@/lib/spotify-analyzer";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface SpotifyTrackExplorerProps {
  tracks: SpotifyTrack[];
  isTurkish?: boolean;
}

export function SpotifyTrackExplorer({ tracks = [], isTurkish: propIsTurkish }: SpotifyTrackExplorerProps) {
  const { lang } = useLanguage();
  const isTurkish = propIsTurkish !== undefined ? propIsTurkish : lang === "tr";

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "bpm" | "energy" | "popularity" | "duration">("default");
  const [filterExplicit, setFilterExplicit] = useState(false);
  const [filterInstrumental, setFilterInstrumental] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef?.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlayPreview = (previewUrl: string | null | undefined, trackId: string) => {
    if (!previewUrl) {
      toast.info(isTurkish ? "Bu parçanın 30 sn önizlemesi bulunmuyor." : "30s preview not available for this track.");
      return;
    }

    if (playingTrackId === trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(previewUrl);
    audioRef.current = audio;
    audio.volume = 0.6;
    audio.play().catch((err: unknown) => console.warn('Audio playback blocked:', err));
    setPlayingTrackId(trackId);

    audio.onended = () => {
      setPlayingTrackId(null);
    };
  };

  const handleCopyLink = async (trackId: string, trackUrl: string) => {
    await copyToClipboard(trackUrl);
    setCopiedTrackId(trackId);
    toast.success(isTurkish ? "Parça bağlantısı kopyalandı!" : "Track link copied!");
    setTimeout(() => setCopiedTrackId(null), 2000);
  };

  const sortOptions = [
    { id: "default" as const, label: isTurkish ? "Sıralama: Varsayılan" : "Sort: Default" },
    { id: "bpm" as const, label: isTurkish ? "BPM (Hız) Yüksek" : "Sort: Highest BPM" },
    { id: "energy" as const, label: isTurkish ? "Enerji Yüksek" : "Sort: Highest Energy" },
    { id: "popularity" as const, label: isTurkish ? "Popülerlik Yüksek" : "Sort: Highest Popularity" },
    { id: "duration" as const, label: isTurkish ? "En Uzun Süre" : "Sort: Longest Duration" },
  ];

  const currentSortLabel = sortOptions.find((o) => o.id === sortBy)?.label || (isTurkish ? "Sıralama: Varsayılan" : "Sort: Default");

  // Filtering & Sorting
  const filteredTracks = useMemo(() => {
    let list = tracks.filter((t) => {
      const matchSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.artists.some((a) => a.name.toLowerCase().includes(search.toLowerCase())) ||
        t.albumName.toLowerCase().includes(search.toLowerCase());

      const matchExplicit = !filterExplicit || t.explicit;
      const matchInstrumental = !filterInstrumental || (t.audioFeatures?.instrumentalness ?? 0) > 0.5;

      return matchSearch && matchExplicit && matchInstrumental;
    });

    if (sortBy === "bpm") {
      list = [...list].sort((a, b) => (b.audioFeatures?.tempo ?? 0) - (a.audioFeatures?.tempo ?? 0));
    } else if (sortBy === "energy") {
      list = [...list].sort((a, b) => (b.audioFeatures?.energy ?? 0) - (a.audioFeatures?.energy ?? 0));
    } else if (sortBy === "popularity") {
      list = [...list].sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "duration") {
      list = [...list].sort((a, b) => b.durationMs - a.durationMs);
    }

    return list;
  }, [tracks, search, sortBy, filterExplicit, filterInstrumental]);

  return (
    <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
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
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all"
          />
        </div>

        {/* Sort & Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Floating Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-bold text-zinc-300 hover:text-white hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentSortLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${sortDropdownOpen ? "rotate-180 text-white" : ""}`} />
            </button>

            <AnimatePresence>
              {sortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-52 z-50 rounded-2xl border border-white/15 bg-[#12141c] p-1.5 shadow-2xl backdrop-blur-3xl"
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.id);
                        setSortDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sortBy === opt.id
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Explicit Toggle */}
          <button
            onClick={() => setFilterExplicit(!filterExplicit)}
            className={cn(
              "px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
              filterExplicit
                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                : "bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]"
            )}
          >
            Explicit
          </button>

          {/* Instrumental Toggle */}
          <button
            onClick={() => setFilterInstrumental(!filterInstrumental)}
            className={cn(
              "px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
              filterInstrumental
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
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

      {/* Tracks Table (Natural Vertical Scroll) */}
      <div className="w-full overflow-x-auto select-none">
        <table className="w-full text-left text-xs text-white/80 min-w-[760px]">
          <thead>
            <tr className="border-b border-white/10 text-white/50 uppercase font-mono tracking-wider">
              <th className="pb-3 pl-3 w-12 text-center">#</th>
              <th className="pb-3 min-w-[240px]">{isTurkish ? "Şarkı & Sanatçı" : "Track & Artist"}</th>
              <th className="pb-3 min-w-[160px]">{isTurkish ? "Albüm" : "Album"}</th>
              <th className="pb-3 w-20 text-center">BPM</th>
              <th className="pb-3 w-20 text-center">Key</th>
              <th className="pb-3 w-20 text-center">{isTurkish ? "Enerji" : "Energy"}</th>
              <th className="pb-3 w-20 text-center">{isTurkish ? "Popülerlik" : "Popularity"}</th>
              <th className="pb-3 pr-4 w-28 text-right">{isTurkish ? "İşlemler" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTracks.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-zinc-500 text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-zinc-600" />
                  <span>{isTurkish ? 'Sonuç bulunamadı' : 'No results found'}</span>
                </div>
              </td></tr>
            ) : (
              filteredTracks.map((t, idx) => {
                const keyVal = t.audioFeatures?.key ?? 0;
              const modeVal = t.audioFeatures?.mode ?? 1;
              const { camelot } = formatKeyAndCamelot(keyVal, modeVal);
              const durSec = Math.round((t.durationMs || 180000) / 1000);
              const m = Math.floor(durSec / 60);
              const s = String(durSec % 60).padStart(2, "0");
              const isPlaying = playingTrackId === t.id;
              const isCopied = copiedTrackId === t.id;
              const spotifyTrackUrl = `https://open.spotify.com/track/${t.id}`;
              const artistsList = t.artists || [{ name: "Unknown Artist" }];

              return (
                <tr
                  key={t.id + idx}
                  className={cn(
                    "hover:bg-white/[0.04] transition-colors group",
                    isPlaying && "bg-emerald-500/[0.08]"
                  )}
                >
                  {/* Track # & Play Button */}
                  <td className="py-3 pl-3 text-center">
                    <div className="flex items-center justify-center">
                      {t.previewUrl ? (
                        <button
                          onClick={() => handlePlayPreview(t.previewUrl, t.id)}
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer",
                            isPlaying
                              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                              : "bg-white/[0.06] text-white hover:bg-emerald-500 hover:text-black group-hover:scale-105"
                          )}
                          title={isPlaying ? "Durdur" : "30sn Önizle"}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
                        </button>
                      ) : (
                        <span className="font-mono text-white/40 text-xs">{idx + 1}</span>
                      )}
                    </div>
                  </td>

                  {/* Track Title & Artist */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.albumCover}
                        alt={t.name}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0 shadow-md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={spotifyTrackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-white truncate hover:text-emerald-300 transition-colors"
                          >
                            {t.name}
                          </a>
                          {t.explicit && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white/70">
                              E
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {artistsList.map((a) => a.name).join(", ")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Album Name */}
                  <td className="py-3 pr-4 text-white/60 truncate max-w-[180px]">
                    {t.albumName}
                  </td>

                  {/* BPM */}
                  <td className="py-3 text-center font-mono font-bold text-emerald-400">
                    {t.audioFeatures?.tempo ? Math.round(t.audioFeatures.tempo) : "—"}
                  </td>

                  {/* Camelot / Key */}
                  <td className="py-3 text-center font-mono font-bold text-violet-400">
                    <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                      {camelot}
                    </span>
                  </td>

                  {/* Energy Meter */}
                  <td className="py-3 text-center">
                    <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-amber-400 font-bold">
                        %{Math.round((t.audioFeatures?.energy ?? 0.5) * 100)}
                      </span>
                    </div>
                  </td>

                  {/* Popularity Index */}
                  <td className="py-3 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-xs text-white/80">
                      <span>{t.popularity}</span>
                      <span className="text-white/40 text-[10px]">/100</span>
                    </div>
                  </td>

                  {/* Actions (Copy Link & Open in Spotify) */}
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleCopyLink(t.id, spotifyTrackUrl)}
                        className="p-1.5 rounded-lg bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                        title={isTurkish ? "Spotify Bağlantısını Kopyala" : "Copy Spotify Link"}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <a
                        href={spotifyTrackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-white transition-all cursor-pointer"
                        title={isTurkish ? "Spotify'da Dinle" : "Open in Spotify"}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
