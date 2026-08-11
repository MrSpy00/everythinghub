"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ListMusic,
  Search,
  Loader2,
  Sparkles,
  ShieldCheck,
  Activity,
  Radio,
  Disc3,
  History,
  ImageIcon,
  Download,
  Copy,
  Check,
  FileCode,
  Flame,
  UserCheck,
  RefreshCw,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { copyToClipboard, formatDuration, cn } from "@/lib/utils";
import {
  SpotifyPlaylistAnalysis,
  DEMO_PLAYLISTS,
  exportPlaylistCSV,
  exportDJSetlistMarkdown,
} from "@/lib/spotify-analyzer";
import { trackToolUsage } from "@/lib/user-analytics";

// Subcomponents
import { SpotifySonicRadar } from "@/components/tools/spotify/SpotifySonicRadar";
import { SpotifyBotShield } from "@/components/tools/spotify/SpotifyBotShield";
import { SpotifyGenreGalaxy } from "@/components/tools/spotify/SpotifyGenreGalaxy";
import { SpotifyKeyWheel } from "@/components/tools/spotify/SpotifyKeyWheel";
import { SpotifyDecadeTimeline } from "@/components/tools/spotify/SpotifyDecadeTimeline";
import { SpotifyCoverStudio } from "@/components/tools/spotify/SpotifyCoverStudio";
import { SpotifyDuplicateFinder } from "@/components/tools/spotify/SpotifyDuplicateFinder";
import { SpotifyTrackExplorer } from "@/components/tools/spotify/SpotifyTrackExplorer";

export default function SpotifyPlaylistClient() {
  const { lang, t } = useLanguage();
  const isTurkish = lang === "tr";

  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<SpotifyPlaylistAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "bot" | "sonic" | "genres" | "key" | "tracks" | "cover" | "export">("overview");

  const [copiedCsv, setCopiedCsv] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedPlaylistLink, setCopiedPlaylistLink] = useState(false);

  const searchParams = useSearchParams();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    trackToolUsage("spotify-playlist-analyzer");
  }, []);

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      setInputUrl(url);
      handleAnalyze(url);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleCopyPlaylistLink = async () => {
    if (!analysisData) return;
    const playlistUrl = `https://open.spotify.com/playlist/${analysisData.id}`;
    await copyToClipboard(playlistUrl);
    setCopiedPlaylistLink(true);
    toast.success(isTurkish ? "Çalma listesi bağlantısı kopyalandı!" : "Playlist link copied!");
    setTimeout(() => setCopiedPlaylistLink(false), 2000);
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || inputUrl;

    if (!targetUrl.trim()) {
      toast.error(isTurkish ? "Lütfen bir Spotify bağlantısı veya URI girin." : "Please enter a Spotify URL or URI.");
      return;
    }

    setAnalysisData(null);
    setLoading(true);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/tools/spotify-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
        signal: abortControllerRef.current.signal,
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setAnalysisData(json.data);
        toast.success(isTurkish ? "Spotify çalma listesi başarıyla analiz edildi!" : "Spotify playlist analyzed successfully!");
      } else {
        if (json.isFallback) {
          toast.error(isTurkish ? "Playlist analiz edilemedi — gerçek Spotify verisi alınamadı." : "Playlist analysis failed — could not fetch real Spotify data.");
        } else {
          toast.error(json.error || (isTurkish ? "Çalma listesi getirilemedi." : "Failed to analyze playlist."));
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error(err);
      toast.error(isTurkish ? "Ağ hatası oluştu." : "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = (key: string) => {
    if (DEMO_PLAYLISTS[key]) {
      setAnalysisData(DEMO_PLAYLISTS[key]);
      toast.info(isTurkish ? "Hazır demo verisi yüklendi." : "Loaded preset demo dataset.");
    }
  };

  const handleDownloadCsv = () => {
    if (!analysisData) return;
    const csvContent = exportPlaylistCSV(analysisData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analysisData.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_analysis.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isTurkish ? "CSV raporu indirildi!" : "CSV report downloaded!");
  };

  const handleCopyCsv = async () => {
    if (!analysisData) return;
    const csvContent = exportPlaylistCSV(analysisData);
    await copyToClipboard(csvContent);
    setCopiedCsv(true);
    toast.success(isTurkish ? "CSV içeriği kopyalandı!" : "CSV content copied!");
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  const handleCopyJson = () => {
    if (!analysisData) return;
    copyToClipboard(JSON.stringify(analysisData, null, 2));
    setCopiedJson(true);
    toast.success(isTurkish ? "JSON verisi kopyalandı!" : "JSON data copied!");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!analysisData) return;
    const jsonStr = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analysisData.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isTurkish ? "JSON raporu indirildi!" : "JSON report downloaded!");
  };

  const handleCopyMarkdown = () => {
    if (!analysisData) return;
    const md = exportDJSetlistMarkdown(analysisData);
    copyToClipboard(md);
    setCopiedMd(true);
    toast.success(isTurkish ? "DJ Setlist Markdown kopyalandı!" : "DJ Setlist Markdown copied!");
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!analysisData) return;
    const mdContent = exportDJSetlistMarkdown(analysisData);
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analysisData.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_setlist.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isTurkish ? "DJ Setlist Markdown indirildi!" : "DJ Setlist Markdown downloaded!");
  };

  const formattedDur = analysisData ? formatDuration(analysisData.totalDurationSeconds) : null;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white backdrop-blur-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHub}</span>
        </Link>

        <Link
          href="/tools/spotify-profile-analyzer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 backdrop-blur-xl transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>{isTurkish ? "Spotify Profil Analizörüne Geç" : "Switch to Profile Analyzer"}</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-300 backdrop-blur-2xl shadow-xl hover:border-emerald-500/40 transition-colors"
        >
          <ListMusic className="w-4 h-4 text-emerald-400" />
          <span>{isTurkish ? "Spotify Stüdyosu v1.0 · Sonic DNA & Bot Denetimi" : "Spotify Studio v1.0 · Sonic DNA & Bot Control"}</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t.spotifyPlaylistTitle || (isTurkish ? "Spotify Playlist Analizör & Sonic Stüdyosu" : "Spotify Playlist Analyzer & Sonic Studio")}
        </h1>

        <p className="text-sm sm:text-base text-white/70 leading-relaxed">
          {t.spotifyPlaylistSub ||
            (isTurkish
              ? "Chosic, Artist.tools ve SubmitHub seviyesinde derin bot tespiti, sonic DNA radarı, tür galaksisi ve HD kapak stüdyosu."
              : "Deep bot detection, sonic DNA radar, genre galaxy, and HD cover studio matching Chosic, Artist.tools, and SubmitHub.")}
        </p>
      </div>

      {/* Input Search Box */}
      <NeonBorder className="p-2 sm:p-3 rounded-3xl bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder={
                t.spotifyUrlPlaceholder ||
                (isTurkish ? "Spotify Çalma Listesi URL'si veya URI yapıştırın..." : "Paste Spotify Playlist URL or URI...")
              }
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl border border-emerald-400/40 bg-white/[0.06] text-emerald-300 font-bold backdrop-blur-3xl shadow-xl transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-300 hover:text-white hover:shadow-emerald-500/25 active:scale-95 shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> : <Sparkles className="w-5 h-5 text-emerald-400" />}
            <span>{loading ? (isTurkish ? "Analiz Ediliyor..." : "Analyzing...") : isTurkish ? "Listeyi Analiz Et" : "Analyze Playlist"}</span>
          </button>
        </div>
      </NeonBorder>

      {/* Preset Demo Buttons (Instant 1-Click Inspection) */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider mr-2">
          {isTurkish ? "Hazır Demolar:" : "Instant Presets:"}
        </span>
        <button
          onClick={() => handleLoadDemo("global-top-50")}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          Today&apos;s Top Hits (Global)
        </button>
        <button
          onClick={() => handleLoadDemo("lofi-beats")}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          Lo-Fi Study Beats
        </button>
        <button
          onClick={() => handleLoadDemo("synthwave-80s")}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          Synthwave Cyberpunk 2077
        </button>
        <button
          onClick={() => handleLoadDemo("anatolian-rock")}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          Anadolu Rock & Türkçe Klasikler
        </button>
        <button
          onClick={() => handleLoadDemo("deep-house")}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          Deep House & Ibiza Sunset
        </button>
        <button
          onClick={() => handleLoadDemo("acoustic-indie")}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          Acoustic Indie & Warm Folk
        </button>
      </div>

      {/* Main Analysis Workspace */}
      {analysisData && (
        <div className="space-y-8 pt-4">
          {/* Header Card with Cover Artwork */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-center gap-6">
            <img
              src={analysisData.coverArtUrl}
              alt={analysisData.title}
              className="w-36 h-36 rounded-2xl object-cover border border-white/10 shadow-lg shrink-0"
            />
            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  {analysisData.totalTracks} {isTurkish ? "Parça" : "Tracks"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25">
                  {formattedDur?.hours}{isTurkish ? "s" : "h"} {formattedDur?.minutes}{isTurkish ? "d" : "m"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  {analysisData.followers !== null && analysisData.followers !== undefined
                    ? `${analysisData.followers.toLocaleString()} ${isTurkish ? "Takipçi / Save" : "Followers / Saves"}`
                    : (isTurkish ? "🔒 Takipçi Sayısı Gizli" : "🔒 Followers Hidden")}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href={`https://open.spotify.com/playlist/${analysisData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl sm:text-3xl font-black text-white hover:text-emerald-300 transition-colors flex items-center gap-2"
                >
                  <span>{analysisData.title}</span>
                  <FileCode className="w-5 h-5 opacity-40 hover:opacity-100" />
                </a>

                <button
                  onClick={handleCopyPlaylistLink}
                  className="p-1.5 rounded-xl border border-white/10 bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.1] hover:border-emerald-500/40 transition-all"
                  title={isTurkish ? "Çalma Listesi Bağlantısını Kopyala" : "Copy Playlist Link"}
                  data-cursor={isTurkish ? "Kopyala" : "Copy"}
                >
                  {copiedPlaylistLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {analysisData.description && analysisData.description.trim() !== "" ? (
                <p className="text-xs sm:text-sm text-white/80 bg-white/[0.02] border border-white/5 rounded-xl p-3 leading-relaxed max-w-3xl">
                  {analysisData.description}
                </p>
              ) : (
                <p className="text-xs text-white/40 italic">
                  {isTurkish ? "ℹ️ Bu çalma listesi için özel bir açıklama girilmemiş." : "ℹ️ No custom description provided for this playlist."}
                </p>
              )}

              <p className="text-xs text-white/50 flex items-center justify-center md:justify-start gap-1.5">
                <span>{isTurkish ? "Küratör:" : "Curator:"}</span>
                <a
                  href={`https://open.spotify.com/user/${analysisData.ownerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-bold hover:text-emerald-300 hover:underline transition-colors underline-offset-4"
                >
                  {analysisData.ownerName}
                </a>
              </p>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
            {[
              { id: "overview", labelTr: "Genel Bakış", labelEn: "Overview", icon: Layers },
              { id: "bot", labelTr: "Bot & Sahte Akış Kalkanı", labelEn: "Bot Shield", icon: ShieldCheck },
              { id: "sonic", labelTr: "Sonic DNA Radarı", labelEn: "Sonic Radar", icon: Activity },
              { id: "genres", labelTr: "Tür Galaksisi & Vibe", labelEn: "Genre Galaxy", icon: Radio },
              { id: "key", labelTr: "Key & Zaman Tüneli", labelEn: "Key & Timeline", icon: Disc3 },
              { id: "tracks", labelTr: "Parçalar & Kopyalar", labelEn: "Tracks & Duplicates", icon: ListMusic },
              { id: "cover", labelTr: "HD Kapak Stüdyosu", labelEn: "HD Cover Studio", icon: ImageIcon },
              { id: "export", labelTr: "Dışa Aktar", labelEn: "Export Studio", icon: Download },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 border",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-md shadow-black/20"
                      : "bg-white/[0.03] text-white/70 border-white/10 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{isTurkish ? tab.labelTr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="pt-2">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* 6 Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50">{isTurkish ? "Toplam Parça" : "Total Tracks"}</span>
                    <p className="text-2xl font-black font-mono text-white">{analysisData.totalTracks}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50">{isTurkish ? "Toplam Süre" : "Total Duration"}</span>
                    <p className="text-2xl font-black font-mono text-emerald-400">
                      {formattedDur?.hours}{isTurkish ? "s" : "h"} {formattedDur?.minutes}{isTurkish ? "d" : "m"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50">{isTurkish ? "Tekil Sanatçılar" : "Unique Artists"}</span>
                    <p className="text-2xl font-black font-mono text-violet-400">{analysisData.uniqueArtistsCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50">{isTurkish ? "Ort. Popülerlik" : "Avg Popularity"}</span>
                    <p className="text-2xl font-black font-mono text-cyan-400">%{analysisData.averagePopularity}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50">{isTurkish ? "Kalite Skoru" : "Quality Score"}</span>
                    <p className="text-2xl font-black font-mono text-emerald-400">%{analysisData.qualityScore}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50">{isTurkish ? "Explicit Oranı" : "Explicit Ratio"}</span>
                    <p className="text-2xl font-black font-mono text-rose-400">
                      %{Math.round((analysisData.explicitTrackCount / analysisData.totalTracks) * 100)}
                    </p>
                  </div>
                </div>

                <SpotifyBotShield
                  score={analysisData.qualityScore}
                  riskLevel={analysisData.riskLevel}
                  botFlags={analysisData.botFlags}
                  pitchingVerdict={analysisData.pitchingVerdict}
                  isTurkish={isTurkish}
                />

                <SpotifySonicRadar summary={analysisData.audioFeaturesSummary} isTurkish={isTurkish} />
              </div>
            )}

            {/* TAB 2: BOT SHIELD */}
            {activeTab === "bot" && (
              <SpotifyBotShield
                score={analysisData.qualityScore}
                riskLevel={analysisData.riskLevel}
                botFlags={analysisData.botFlags}
                pitchingVerdict={analysisData.pitchingVerdict}
                isTurkish={isTurkish}
              />
            )}

            {/* TAB 3: SONIC RADAR */}
            {activeTab === "sonic" && (
              <SpotifySonicRadar summary={analysisData.audioFeaturesSummary} isTurkish={isTurkish} />
            )}

            {/* TAB 4: GENRES */}
            {activeTab === "genres" && (
              <SpotifyGenreGalaxy genres={analysisData.topGenres} mood={analysisData.dominantMood} isTurkish={isTurkish} />
            )}

            {/* TAB 5: KEY & TIMELINE */}
            {activeTab === "key" && (
              <div className="space-y-8">
                <SpotifyKeyWheel keyDistribution={analysisData.keyDistribution} isTurkish={isTurkish} />
                <SpotifyDecadeTimeline decadeDistribution={analysisData.decadeDistribution} isTurkish={isTurkish} />
              </div>
            )}

            {/* TAB 6: TRACKS & DUPLICATES */}
            {activeTab === "tracks" && (
              <div className="space-y-8">
                <SpotifyDuplicateFinder duplicates={analysisData.duplicates} isTurkish={isTurkish} />
                <SpotifyTrackExplorer tracks={analysisData.tracks} isTurkish={isTurkish} />
              </div>
            )}

            {/* TAB 7: COVER STUDIO */}
            {activeTab === "cover" && (
              <SpotifyCoverStudio
                coverUrl={analysisData.coverArtUrl}
                title={analysisData.title}
                ownerName={analysisData.ownerName}
                dominantColor={analysisData.dominantColor}
                isTurkish={isTurkish}
              />
            )}

            {/* TAB 8: EXPORT STUDIO */}
            {activeTab === "export" && (
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 backdrop-blur-xl">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {isTurkish ? "Dışa Aktarma & DJ Araçları Stüdyosu" : "Export Studio & DJ Tools"}
                    </h3>
                    <p className="text-xs text-white/60">
                      {isTurkish ? "Tüm verileri CSV, JSON veya DJ setlist Markdown formatında alın" : "Export all metrics to CSV, JSON or DJ Setlist Markdown"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CSV Export */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="font-bold text-white text-sm">{isTurkish ? "Kapsamlı CSV Raporu" : "Comprehensive CSV Export"}</h4>
                    <p className="text-xs text-white/60">
                      {isTurkish ? "Tüm parçalar, BPM, Key, Energy ve ISRC verilerini Excel uyumlu CSV olarak indirin veya kopyalayın." : "Export all tracks with BPM, Key, Energy and ISRC columns."}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleDownloadCsv}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isTurkish ? "CSV İndir" : "Download"}</span>
                      </button>
                      <button
                        onClick={handleCopyCsv}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 text-xs font-bold hover:bg-white/[0.1] active:scale-95 transition-all"
                      >
                        {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCsv ? (isTurkish ? "Kopyalandı" : "Copied") : (isTurkish ? "Kopyala" : "Copy")}</span>
                      </button>
                    </div>
                  </div>

                  {/* DJ Setlist Markdown */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="font-bold text-white text-sm">{isTurkish ? "DJ Setlist Markdown" : "DJ Setlist Markdown"}</h4>
                    <p className="text-xs text-white/60">
                      {isTurkish ? "BPM, Camelot ton ve süre sıralı DJ canlı performans tablosu indirin veya kopyalayın." : "Structured DJ live performance table with BPM and Camelot keys."}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleDownloadMarkdown}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold hover:bg-violet-500/20 active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isTurkish ? "MD İndir" : "Download"}</span>
                      </button>
                      <button
                        onClick={handleCopyMarkdown}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 text-xs font-bold hover:bg-white/[0.1] active:scale-95 transition-all"
                      >
                        {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMd ? (isTurkish ? "Kopyalandı" : "Copied") : (isTurkish ? "Kopyala" : "Copy")}</span>
                      </button>
                    </div>
                  </div>

                  {/* Raw JSON Export */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="font-bold text-white text-sm">{isTurkish ? "Ham JSON Verisi" : "Raw JSON Dataset"}</h4>
                    <p className="text-xs text-white/60">
                      {isTurkish ? "Tüm analiz sonuçlarını ve bot güvenlik metriklerini ham JSON olarak indirin veya kopyalayın." : "Raw structured analysis output and bot security metrics."}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleDownloadJson}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isTurkish ? "JSON İndir" : "Download"}</span>
                      </button>
                      <button
                        onClick={handleCopyJson}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 text-xs font-bold hover:bg-white/[0.1] active:scale-95 transition-all"
                      >
                        {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedJson ? (isTurkish ? "Kopyalandı" : "Copied") : (isTurkish ? "Kopyala" : "Copy")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial Empty State Hero Studio (when no playlist is analyzed yet) */}
      {!analysisData && !loading && (
        <div className="space-y-12 pt-6">
          {/* Welcome Intro Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-white/[0.04] text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-2xl shadow-lg">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{isTurkish ? "Spotify Analiz & DJ Stüdyosuna Hoş Geldiniz" : "Welcome to Spotify Sonic Studio"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
              {isTurkish
                ? "Bir Çalma Listesi URL'si Yapıştırın ve Tüm Müzik Metriklerini Saniyeler İçinde Çözümleyin"
                : "Paste a Spotify Playlist Link to Inspect Bot Risks & Audio Metrics"}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
              {isTurkish
                ? "Yukarıdaki arama kutusuna herhangi bir Spotify çalma listesi bağlantısı yapıştırın veya hızlı deneme için yukarıdaki hazır demolardan birine tıklayın."
                : "Enter any Spotify playlist link above or click one of the instant demo presets to inspect sonic features."}
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Bot & Payola Tespiti" : "Bot & Payola Shield"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Sanatçı yığılması, kısa şarkı farmcılığı ve anormal popülerlik filtreleme." : "Detect stream farming, short track stuffing and popularity anomalies."}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 w-fit">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Sonic Ses Analizi" : "Sonic Audio Features"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "BPM, Enerji, Dans Edilebilirlik, Valence ve Canlılık radar grafiği." : "Radar breakdown of BPM, Energy, Danceability, Valence and Liveness."}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-300 w-fit">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Key & Camelot Çarkı" : "Key & Camelot Wheel"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "DJ miks uyumluluğu için armonik ton dağılımı ve Camelot kodları." : "Harmonic key breakdown and Camelot codes for seamless DJ mixing."}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-300 w-fit">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Kapsamlı Dışa Aktarma" : "Comprehensive Export"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Excel uyumlu CSV, ham JSON ve DJ Setlist Markdown formatında indirin veya kopyalayın." : "Export complete report to Excel CSV, JSON and DJ Setlist MD."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
