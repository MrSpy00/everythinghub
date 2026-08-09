"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, Play, Pause, ExternalLink, Copy, Check, Music } from "lucide-react";
import { SpotifyTrack, formatKeyAndCamelot } from "@/lib/spotify-analyzer";
import { copyToClipboard, cn } from "@/lib/utils";
import { toast } from "sonner";
import { HorizontalScrollContainer } from "@/components/shared/HorizontalScrollContainer";

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
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayPreview = (trackId: string, previewUrl?: string | null) => {
    if (!previewUrl) return;

    if (playingTrackId === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(previewUrl);
      audioRef.current = newAudio;
      newAudio.play().catch((err) => console.log("Audio play error:", err));
      setPlayingTrackId(trackId);

      newAudio.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const handleCopyTrackLink = async (trackId: string, trackName: string) => {
    const trackUrl = `https://open.spotify.com/track/${trackId}`;
    await copyToClipboard(trackUrl);
    setCopiedTrackId(trackId);
    toast.success(isTurkish ? `"${trackName}" bağlantısı kopyalandı!` : `Copied link for "${trackName}"!`);
    setTimeout(() => setCopiedTrackId(null), 2000);
  };

  const filteredTracks = useMemo(() => {
    const tList = tracks || [];
    return tList
      .filter((t) => {
        if (!t) return false;
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = (t.name || "").toLowerCase().includes(q);
          const matchArtist = (t.artists || []).some((a) => (a.name || "").toLowerCase().includes(q));
          const matchAlbum = (t.albumName || "").toLowerCase().includes(q);
          if (!matchTitle && !matchArtist && !matchAlbum) return false;
        }
        if (filterExplicit && !t.explicit) return false;
        if (filterInstrumental && (t.audioFeatures?.instrumentalness ?? 0) < 0.5) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "bpm") return (b.audioFeatures?.tempo ?? 120) - (a.audioFeatures?.tempo ?? 120);
        if (sortBy === "energy") return (b.audioFeatures?.energy ?? 0.5) - (a.audioFeatures?.energy ?? 0.5);
        if (sortBy === "popularity") return (b.popularity ?? 0) - (a.popularity ?? 0);
        if (sortBy === "duration") return (b.durationMs ?? 0) - (a.durationMs ?? 0);
        return 0;
      });
  }, [tracks, search, sortBy, filterExplicit, filterInstrumental]);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
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
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.07] transition-all"
          />
        </div>

        {/* Sort & Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80 focus:outline-none focus:border-emerald-500/30 cursor-pointer"
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
              "px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all",
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

      {/* Tracks Table */}
      <HorizontalScrollContainer className="w-full">
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
              <th className="pb-3 pr-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTracks.map((t, idx) => {
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
                <tr key={t.id || idx} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-3 pl-3 font-mono text-white/40">{idx + 1}</td>

                  {/* Title & Artwork with Preview Player */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0 group/cover cursor-pointer" onClick={() => togglePlayPreview(t.id, t.previewUrl)}>
                        <img
                          src={t.albumCover || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"}
                          alt={t.name || "Track"}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-sm"
                        />
                        {t.previewUrl && (
                          <div className={cn(
                            "absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center transition-opacity",
                            isPlaying ? "opacity-100" : "opacity-0 group-hover/cover:opacity-100"
                          )}>
                            {isPlaying ? (
                              <Pause className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {/* Direct Spotify Link for Track Name */}
                          <a
                            href={spotifyTrackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "font-bold text-sm transition-colors hover:underline underline-offset-4 flex items-center gap-1",
                              isPlaying ? "text-emerald-400" : "text-white group-hover:text-emerald-300"
                            )}
                          >
                            <span>{t.name || "Untitled Track"}</span>
                            <ExternalLink className="w-3 h-3 opacity-50 hover:opacity-100 shrink-0" />
                          </a>

                          {t.explicit && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/15 text-rose-300 border border-rose-500/20">
                              EXPLICIT
                            </span>
                          )}
                        </div>

                        {/* Artists with clickable Spotify search links */}
                        <p className="text-white/60">
                          {artistsList.map((a, aIdx) => (
                            <React.Fragment key={a.name || aIdx}>
                              {aIdx > 0 && ", "}
                              <a
                                href={`https://open.spotify.com/search/${encodeURIComponent(a.name || "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white hover:underline transition-colors"
                              >
                                {a.name || "Artist"}
                              </a>
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Album */}
                  <td className="py-3 pr-4 text-white/60 truncate max-w-[140px]">{t.albumName || "Album"}</td>

                  {/* BPM */}
                  <td className="py-3 pr-4 font-mono font-bold text-emerald-400/90">{t.audioFeatures?.tempo ?? 120}</td>

                  {/* Key */}
                  <td className="py-3 pr-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {camelot}
                    </span>
                  </td>

                  {/* Energy */}
                  <td className="py-3 pr-4 font-mono text-amber-300">%{Math.round((t.audioFeatures?.energy ?? 0.5) * 100)}</td>

                  {/* Popularity */}
                  <td className="py-3 pr-4 font-mono text-cyan-300">{t.popularity ?? 45}</td>

                  {/* Action Buttons: Copy Link & Duration */}
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono text-white/60 mr-1">{m}:{s}</span>

                      {/* SVG Copy Link Button */}
                      <button
                        onClick={() => handleCopyTrackLink(t.id, t.name)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.1] hover:border-emerald-500/40 transition-all"
                        title={isTurkish ? "Şarkı Linkini Kopyala" : "Copy Track Link"}
                        data-cursor={isTurkish ? "Kopyala" : "Copy"}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </HorizontalScrollContainer>
    </div>
  );
}
