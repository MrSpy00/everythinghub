"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  UserCheck,
  Search,
  Loader2,
  Sparkles,
  Award,
  ListMusic,
  Users,
  Download,
  ExternalLink,
  Music,
  Play,
  Pause,
  Check,
  Copy,
  Star,
  Layers,
  Radio,
  Share2,
  FileCode2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { FluidSlimeCard } from "@/components/creative/FluidSlimeCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { copyToClipboard } from "@/lib/utils";
import { SpotifyProfileAnalysis, DEMO_PROFILES, SpotifyTrack } from "@/lib/spotify-analyzer";
import { trackToolUsage } from "@/lib/user-analytics";

export default function SpotifyProfileClient() {
  const { lang, t } = useLanguage();
  const isTurkish = lang === "tr";

  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<SpotifyProfileAnalysis | null>(null);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [downloadingAvatar, setDownloadingAvatar] = useState(false);

  // Audio Preview Player
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    trackToolUsage("spotify-profile-analyzer");
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayPreview = (trackId: string, previewUrl?: string | null) => {
    if (!previewUrl) {
      toast.info(isTurkish ? "Bu şarkı için 30s ses önizlemesi mevcut değil." : "Audio preview not available for this track.");
      return;
    }

    if (playingTrackId === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      audio.play().catch(() => {
        toast.error(isTurkish ? "Ses önizlemesi çalınamadı." : "Could not play audio preview.");
      });
      setPlayingTrackId(trackId);
      audio.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || inputUrl;

    if (!targetUrl.trim()) {
      toast.error(isTurkish ? "Lütfen bir Spotify Profil, Sanatçı bağlantısı veya Sanatçı Adı girin." : "Please enter a Spotify Profile, Artist URL, or Artist Name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tools/spotify-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, mode: "profile" }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setProfileData(json.data);
        toast.success(isTurkish ? "Spotify profili ve diskografisi başarıyla analiz edildi!" : "Spotify profile and discography analyzed successfully!");
      } else {
        toast.error(json.error || (isTurkish ? "Profil bilgileri getirilemedi." : "Failed to analyze profile."));
      }
    } catch (err) {
      console.error(err);
      toast.error(isTurkish ? "Ağ hatası oluştu." : "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = (key: string) => {
    if (DEMO_PROFILES[key]) {
      setProfileData(DEMO_PROFILES[key]);
      toast.info(isTurkish ? "Hazır demo profil yüklendi." : "Loaded preset demo profile.");
    }
  };

  const handleCopyProfileLink = async () => {
    if (!profileData) return;
    const profileUrl = `https://open.spotify.com/${profileData.type}/${profileData.id}`;
    await copyToClipboard(profileUrl);
    setCopiedProfileLink(true);
    toast.success(isTurkish ? "Profil bağlantısı kopyalandı!" : "Profile link copied!");
    setTimeout(() => setCopiedProfileLink(false), 2000);
  };

  const handleCopyJson = async () => {
    if (!profileData) return;
    await copyToClipboard(JSON.stringify(profileData, null, 2));
    setCopiedJson(true);
    toast.success(isTurkish ? "JSON verisi kopyalandı!" : "JSON data copied!");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadAvatar = async () => {
    if (!profileData?.avatarUrl) return;
    setDownloadingAvatar(true);
    const toastId = "dl-avatar";
    toast.loading(isTurkish ? "HD Avatar indiriliyor..." : "Downloading HD Avatar...", { id: toastId });

    try {
      const res = await fetch(profileData.avatarUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${profileData.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_avatar.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success(isTurkish ? "HD Avatar başarıyla indirildi!" : "HD Avatar downloaded successfully!", { id: toastId });
    } catch {
      const a = document.createElement("a");
      a.href = profileData.avatarUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
      toast.success(isTurkish ? "Avatar yeni sekmede açıldı." : "Avatar opened in new tab.", { id: toastId });
    } finally {
      setDownloadingAvatar(false);
    }
  };

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
          href="/tools/spotify-playlist-analyzer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 backdrop-blur-xl transition-all"
        >
          <ListMusic className="w-4 h-4" />
          <span>{isTurkish ? "Playlist Analizörüne Geç" : "Switch to Playlist Analyzer"}</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-300 backdrop-blur-2xl shadow-xl hover:border-indigo-500/40 transition-colors"
        >
          <UserCheck className="w-4 h-4 text-indigo-400" />
          <span>{isTurkish ? "Küratör & Sanatçı Stüdyosu Pro" : "Curator & Artist Studio Pro"}</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t.spotifyProfileTitle || (isTurkish ? "Spotify Profil & Sanatçı Analizör" : "Spotify Profile & Artist Analyzer")}
        </h1>

        <p className="text-sm sm:text-base text-white/70 leading-relaxed">
          {t.spotifyProfileSub ||
            (isTurkish
              ? "Küratör ve sanatçı profillerinin aylık dinleyici sayısını, diskografisini, en popüler şarkılarını ve yüksek çözünürlüklü avatarlarını inceleyin."
              : "Inspect curator and artist profiles, analyze monthly listeners, discography breakdowns, top tracks, and download HD avatars.")}
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
                t.spotifyProfilePlaceholder ||
                (isTurkish
                  ? "Spotify Profil, Sanatçı URL'si veya Sanatçı Adı (örn: Taylor Swift, The Weeknd)..."
                  : "Paste Spotify Profile, Artist URL, or Artist Name (e.g. Taylor Swift, The Weeknd)...")
              }
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl border border-indigo-400/40 bg-white/[0.06] text-indigo-300 font-bold backdrop-blur-3xl shadow-xl transition-all duration-300 hover:bg-indigo-500/20 hover:border-indigo-300 hover:text-white hover:shadow-indigo-500/25 active:scale-95 shrink-0 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
            <span>{loading ? (isTurkish ? "Analiz Ediliyor..." : "Analyzing...") : isTurkish ? "Profili Analiz Et" : "Analyze Profile"}</span>
          </button>
        </div>
      </NeonBorder>

      {/* Preset Demo Profiles */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider mr-2">
          {isTurkish ? "Hızlı Deneme:" : "Quick Inspect:"}
        </span>
        {[
          { label: "Taylor Swift", query: "https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02" },
          { label: "The Weeknd", query: "https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ" },
          { label: "Daft Punk", query: "https://open.spotify.com/artist/4tZ12WiiJrAcoLv0vCgW4j" },
          { label: "Billie Eilish", query: "Billie Eilish" },
          { label: "Ezhel", query: "Ezhel" },
          { label: "Spotify Curator", query: "https://open.spotify.com/user/spotify" },
        ].map((demo, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputUrl(demo.query);
              handleAnalyze(demo.query);
            }}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-indigo-500/40 backdrop-blur-xl transition-all cursor-pointer"
          >
            {demo.label}
          </button>
        ))}
      </div>

      {/* Profile Overview Card (Active Result State) */}
      {profileData && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Hero Profile Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0e14]/90 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl">
            {profileData.resolvedFromPlaylist && (
              <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-xs text-indigo-300 backdrop-blur-xl">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  {isTurkish
                    ? `Bu profil girdiğiniz çalma listesinin (${profileData.originalPlaylistTitle || "Çalma Listesi"}) küratörüne (${profileData.curatorName || profileData.name}) aittir.`
                    : `This profile belongs to the curator (${profileData.curatorName || profileData.name}) of the playlist you entered (${profileData.originalPlaylistTitle || "Playlist"}).`}
                </span>
              </div>
            )}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* HD Avatar */}
              <div className="relative group/avatar shrink-0">
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.name}
                  className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-white/20 shadow-2xl ring-4 ring-indigo-500/20"
                />
                <button
                  onClick={handleDownloadAvatar}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-xs font-bold transition-opacity cursor-pointer"
                >
                  <Download className="w-5 h-5 text-indigo-400" />
                  <span>HD İndir</span>
                </button>
              </div>

              <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {profileData.type === "artist" ? (isTurkish ? "Doğrulanmış Sanatçı" : "Verified Artist") : isTurkish ? "Küratör Profili" : "Curator Profile"}
                  </span>
                  {profileData.popularity && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Popülerlik: %{profileData.popularity}
                    </span>
                  )}
                </div>

                {/* Profile Name & Direct Spotify Link + Copy Button */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <a
                    href={`https://open.spotify.com/${profileData.type}/${profileData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-3xl sm:text-4xl font-black text-white hover:text-indigo-300 transition-colors flex items-center gap-2 truncate"
                  >
                    <span>{profileData.name}</span>
                    <ExternalLink className="w-5 h-5 opacity-40 hover:opacity-100 shrink-0" />
                  </a>

                  <button
                    onClick={handleCopyProfileLink}
                    className="p-2 rounded-xl border border-white/10 bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.1] hover:border-indigo-500/40 transition-all cursor-pointer"
                    title={isTurkish ? "Profil Bağlantısını Kopyala" : "Copy Profile Link"}
                    data-cursor={isTurkish ? "Kopyala" : "Copy"}
                  >
                    {copiedProfileLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {profileData.bio && <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">{profileData.bio}</p>}

                {/* Genre Tags */}
                {profileData.genres && profileData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                    {profileData.genres.map((g) => (
                      <span key={g} className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.04] text-zinc-300 border border-white/10">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={handleDownloadAvatar}
                  disabled={downloadingAvatar}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/25 active:scale-95 transition-all shadow-xl cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isTurkish ? "HD Avatar İndir" : "Download HD Avatar"}</span>
                </button>

                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 text-xs font-semibold hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode2 className="w-3.5 h-3.5" />}
                  <span>{isTurkish ? "JSON Kopyala" : "Copy JSON"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FluidSlimeCard glowColor="rgba(99, 102, 241, 0.2)" className="p-5 flex flex-col justify-between">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                {profileData.monthlyListeners ? (isTurkish ? "Aylık Dinleyici" : "Monthly Listeners") : (isTurkish ? "Direkt Takipçiler" : "Followers")}
              </span>
              {profileData.monthlyListeners ? (
                <p className="text-3xl font-black font-mono text-indigo-400 mt-2">
                  {profileData.monthlyListeners.toLocaleString()}
                </p>
              ) : profileData.followers !== null && profileData.followers !== undefined ? (
                <p className="text-3xl font-black font-mono text-indigo-400 mt-2">
                  {profileData.followers.toLocaleString()}
                </p>
              ) : (
                <div className="mt-2">
                  <p className="text-sm font-bold text-amber-400">{isTurkish ? "Gizli / Kısıtlı" : "Restricted"}</p>
                  <p className="text-[10px] text-white/40 pt-1">
                    {isTurkish
                      ? "Spotify Web API gizlilik politikaları nedeniyle bu kullanıcının takipçi sayısı dışarıya kapalıdır."
                      : "Follower count restricted by Spotify privacy policy."}
                  </p>
                </div>
              )}
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(16, 185, 129, 0.2)" className="p-5 flex flex-col justify-between">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Tahmini Toplam Erişim" : "Total Reach Impact"}</span>
              <p className="text-3xl font-black font-mono text-emerald-400 mt-2">
                {Math.round(profileData.totalFollowerReach).toLocaleString()}
              </p>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(168, 85, 247, 0.2)" className="p-5 flex flex-col justify-between">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Diskografi & Listeler" : "Catalog & Playlists"}</span>
              <p className="text-3xl font-black font-mono text-purple-400 mt-2">
                {(profileData.discography || []).length || (profileData.publicPlaylists || []).length}{" "}
                <span className="text-xs font-normal text-white/50">{profileData.type === "artist" ? (isTurkish ? "Albüm / Single" : "Releases") : (isTurkish ? "Çalma Listesi" : "Playlists")}</span>
              </p>
            </FluidSlimeCard>
          </div>

          {/* SECTION: Top Tracks with Audio Preview Player */}
          {profileData.topTracks && profileData.topTracks.length > 0 && (
            <div className="bg-[#0d0e14]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-3xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {isTurkish ? "En Popüler Şarkılar & 30s Ses Önizleme" : "Top Popular Tracks & Audio Previews"}
                    </h3>
                    <p className="text-xs text-white/60">
                      {isTurkish ? "Spotify ve müzik kataloglarındaki en yüksek dinlenme ve popülerlik puanına sahip şarkılar" : "Highest popularity scored tracks with direct streaming previews"}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {profileData.topTracks.length} {isTurkish ? "Parça" : "Tracks"}
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {profileData.topTracks.map((t, idx) => {
                  const isPlaying = playingTrackId === t.id;
                  const durSec = Math.round((t.durationMs || 180000) / 1000);
                  const m = Math.floor(durSec / 60);
                  const s = String(durSec % 60).padStart(2, "0");

                  return (
                    <div
                      key={t.id || idx}
                      className="py-3.5 px-3 flex items-center justify-between gap-4 hover:bg-white/[0.025] rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="font-mono text-xs text-white/40 w-5 text-center">{idx + 1}</span>

                        {/* Cover Art with Play Button */}
                        <div
                          className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 cursor-pointer group/player border border-white/10"
                          onClick={() => togglePlayPreview(t.id, t.previewUrl)}
                        >
                          <img src={t.albumCover} alt={t.name} className="w-full h-full object-cover" />
                          <div
                            className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                              isPlaying ? "opacity-100" : "opacity-0 group-hover/player:opacity-100"
                            }`}
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-bold text-white text-sm truncate flex items-center gap-2">
                            <span className={isPlaying ? "text-emerald-400" : "text-white"}>{t.name}</span>
                            {t.explicit && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500/15 text-rose-300 border border-rose-500/20">
                                EXPLICIT
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-white/50 truncate">
                            {t.albumName} · {t.releaseDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                        {t.popularity && (
                          <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            %{t.popularity} Pop
                          </span>
                        )}
                        <span className="text-white/60">{m}:{s}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: Discography (Albums, EPs, Singles) */}
          {profileData.discography && profileData.discography.length > 0 && (
            <div className="bg-[#0d0e14]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-3xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isTurkish ? "Diskografi & Albüm Kataloğu" : "Discography & Album Releases"}
                  </h3>
                  <p className="text-xs text-white/60">
                    {isTurkish ? "Stüdyo albümleri, single ve EP çıkışları" : "Official studio albums, singles, and EP catalog"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {profileData.discography.map((item, i) => (
                  <FluidSlimeCard
                    key={item.id || i}
                    glowColor="rgba(168, 85, 247, 0.2)"
                    className="p-3 flex flex-col space-y-2 group"
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full aspect-square rounded-xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-white text-xs truncate" title={item.title}>
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        {item.releaseDate} · {item.totalTracks} {isTurkish ? "Parça" : "Tracks"}
                      </p>
                    </div>
                  </FluidSlimeCard>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: Public Playlists */}
          {profileData.publicPlaylists && profileData.publicPlaylists.length > 0 && (
            <div className="bg-[#0d0e14]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-3xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  <ListMusic className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isTurkish ? "Küratör Çalma Listeleri" : "Curator Public Playlists"}
                  </h3>
                  <p className="text-xs text-white/60">
                    {isTurkish ? "Profilin oluşturduğu veya yönettiği halka açık listeler" : "Public playlists curated or managed by this profile"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileData.publicPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img src={pl.coverUrl} alt={pl.title} className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{pl.title}</h4>
                        <p className="text-xs text-white/60">
                          {pl.tracksCount} {isTurkish ? "Parça" : "Tracks"} · {pl.followersCount.toLocaleString()} {isTurkish ? "Takipçi" : "Followers"}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/tools/spotify-playlist-analyzer?url=https://open.spotify.com/playlist/${pl.id}`}
                      className="px-3.5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/25 active:scale-95 transition-all shrink-0"
                    >
                      {isTurkish ? "Analiz Et" : "Analyze"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial Empty State Hero Studio (when no profile is analyzed yet) */}
      {!profileData && !loading && (
        <div className="space-y-12 pt-6">
          {/* Welcome Intro Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0d0e14]/90 border border-white/10 backdrop-blur-3xl text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-2xl shadow-lg">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{isTurkish ? "Spotify Profil & Sanatçı Stüdyosuna Hoş Geldiniz" : "Welcome to Spotify Profile Studio"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
              {isTurkish
                ? "Bir Spotify Profil, Sanatçı URL'si veya Sanatçı Adı Girerek Tüm Metrikleri Çözümleyin"
                : "Inspect Spotify Profile Reach, Public Playlists & Artist Catalog"}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
              {isTurkish
                ? "Yukarıdaki arama kutusuna herhangi bir Spotify kullanıcı profili, sanatçı bağlantısı veya doğrudan sanatçı adı (örn: Taylor Swift) yazarak tüm diskografiyi ve aylık dinleyicileri inceleyin."
                : "Paste any Spotify user or artist URL above, or enter an artist name to inspect discography and monthly listeners."}
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FluidSlimeCard glowColor="rgba(99, 102, 241, 0.2)" className="p-5 space-y-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-300 w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Aylık Dinleyici & Erişim" : "Reach Analytics"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Doğrulanmış aylık dinleyiciler, takipçiler ve toplam etki gücü." : "Verified monthly listeners, followers, and reach impact."}</p>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(16, 185, 129, 0.2)" className="p-5 space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 w-fit">
                <ListMusic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Halka Açık Listeler" : "Public Playlists"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Küratörün oluşturduğu veya yönettiği tüm herkese açık çalma listeleri." : "Inspect all public playlists curated or managed by this profile."}</p>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(168, 85, 247, 0.2)" className="p-5 space-y-2">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-300 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Diskografi & Albümler" : "Artist Discography"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Tüm stüdyo albümleri, single ve EP çıkışlarının kapak arşivi." : "All studio albums, singles, and EP releases with cover art."}</p>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(236, 72, 153, 0.2)" className="p-5 space-y-2">
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-300 w-fit">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "HD Avatar İndirici" : "HD Avatar Downloader"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Profil veya sanatçı avatar görselini yüksek çözünürlüklü olarak indirin." : "Download high-resolution profile and artist avatar artwork."}</p>
            </FluidSlimeCard>
          </div>
        </div>
      )}
    </div>
  );
}
