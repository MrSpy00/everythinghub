"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Tag,
  Check,
  Copy,
  Star,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { copyToClipboard } from "@/lib/utils";
import { SpotifyProfileAnalysis, DEMO_PROFILES } from "@/lib/spotify-analyzer";

export default function SpotifyProfileClient() {
  const { lang, t } = useLanguage();
  const isTurkish = lang === "tr";

  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<SpotifyProfileAnalysis | null>(DEMO_PROFILES["daft-punk"]);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);
  const [downloadingAvatar, setDownloadingAvatar] = useState(false);

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || inputUrl;

    if (!targetUrl.trim()) {
      toast.error(isTurkish ? "Lütfen bir Spotify Profil veya Sanatçı bağlantısı girin." : "Please enter a Spotify Profile or Artist URL.");
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
        toast.success(isTurkish ? "Spotify profili başarıyla analiz edildi!" : "Spotify profile analyzed successfully!");
      } else {
        toast.error(json.error || (isTurkish ? "Profil getirilemedi." : "Failed to analyze profile."));
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 backdrop-blur-xl transition-all"
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
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-300 backdrop-blur-xl"
        >
          <UserCheck className="w-4 h-4" />
          <span>{isTurkish ? "Curator & Discography Studio" : "Curator & Discography Studio"}</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t.spotifyProfileTitle || (isTurkish ? "Spotify Profil & Sanatçı Analizör" : "Spotify Profile & Artist Analyzer")}
        </h1>

        <p className="text-sm sm:text-base text-white/70 leading-relaxed">
          {t.spotifyProfileSub ||
            (isTurkish
              ? "Küratör ve sanatçı profillerinin takipçi etki gücünü, diskografisini, en popüler şarkılarını ve yüksek çözünürlüklü avatarlarını inceleyin."
              : "Inspect curator and artist profiles, analyze follower reach, discography breakdowns, top tracks, and download HD avatars.")}
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
                  ? "Spotify Profil, Sanatçı veya Çalma Listesi URL'si yapıştırın (Akıllı Çözümleme)..."
                  : "Paste Spotify Profile, Artist, or Playlist URL (Smart Resolution)...")
              }
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-bold backdrop-blur-xl hover:bg-cyan-500/15 hover:border-cyan-500/40 active:scale-95 transition-all shadow-lg shadow-black/20 shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : <Sparkles className="w-5 h-5 text-cyan-400" />}
            <span>{loading ? (isTurkish ? "Analiz Ediliyor..." : "Analyzing...") : isTurkish ? "Profili Analiz Et" : "Analyze Profile"}</span>
          </button>
        </div>
      </NeonBorder>

      {/* Preset Demo Profiles */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider mr-2">
          {isTurkish ? "Hazır Demo Sanatçılar:" : "Preset Demo Profiles:"}
        </span>
        <button
          onClick={() => handleLoadDemo("daft-punk")}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.1] hover:text-white transition-all"
        >
          Daft Punk (Artist Studio)
        </button>
        <button
          onClick={() => handleLoadDemo("the-weeknd")}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.1] hover:text-white transition-all"
        >
          The Weeknd (Artist Studio)
        </button>
      </div>

      {/* Main Profile Workspace */}
      {profileData && (
        <div className="space-y-8 pt-4">
          {/* Smart Resolution Banner Notice */}
          {(profileData as any).resolvedFromPlaylist && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 backdrop-blur-xl flex items-center justify-between gap-4 max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">
                  {isTurkish
                    ? `Çalma Listesinden Otomatik Küratör Çözümlendi: "${(profileData as any).originalPlaylistTitle}" (Küratör: ${profileData.name})`
                    : `Resolved Curator from Playlist: "${(profileData as any).originalPlaylistTitle}" (Curator: ${profileData.name})`}
                </span>
              </div>
            </motion.div>
          )}

          {/* Main Profile Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
            {profileData.bannerUrl && (
              <div className="absolute inset-0 z-0 opacity-20 blur-md pointer-events-none">
                <img src={profileData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.name}
                  className="w-36 h-36 rounded-full object-cover border-2 border-white/20 shadow-2xl shrink-0"
                />
              </div>

              <div className="space-y-3 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {profileData.type === "artist" ? (isTurkish ? "Doğrulanmış Sanatçı" : "Verified Artist") : isTurkish ? "Küratör Profili" : "Curator Profile"}
                  </span>
                  {profileData.popularity && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
                    className="text-3xl sm:text-4xl font-black text-white hover:text-cyan-300 transition-colors flex items-center gap-2"
                  >
                    <span>{profileData.name}</span>
                    <ExternalLink className="w-5 h-5 opacity-40 hover:opacity-100" />
                  </a>

                  <button
                    onClick={handleCopyProfileLink}
                    className="p-1.5 rounded-xl border border-white/10 bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.1] hover:border-cyan-500/40 transition-all"
                    title={isTurkish ? "Profil Bağlantısını Kopyala" : "Copy Profile Link"}
                  >
                    {copiedProfileLink ? <Check className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {profileData.bio && <p className="text-xs sm:text-sm text-white/70 max-w-2xl">{profileData.bio}</p>}

                {/* Genre Tags */}
                {profileData.genres && profileData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                    {profileData.genres.map((g) => (
                      <span key={g} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/80 border border-white/10">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Download Avatar & Action Buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={handleDownloadAvatar}
                  disabled={downloadingAvatar}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 active:scale-95 transition-all shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  <span>{isTurkish ? "HD Avatar İndir" : "Download HD Avatar"}</span>
                </button>

                <a
                  href={profileData.avatarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 text-xs font-semibold hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isTurkish ? "Yeni Sekmede Aç" : "Open in New Tab"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Follower Reach Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="text-xs text-white/50">{isTurkish ? "Direkt Takipçiler" : "Direct Followers"}</span>
              {profileData.followers !== null && profileData.followers !== undefined ? (
                <p className="text-3xl font-black font-mono text-cyan-400">{profileData.followers.toLocaleString()}</p>
              ) : (
                <div>
                  <p className="text-base font-bold text-amber-400">{isTurkish ? "🔒 Gizli / Kısıtlı" : "🔒 Restricted / Hidden"}</p>
                  <p className="text-[10px] text-white/40 leading-tight pt-0.5">
                    {isTurkish
                      ? "Spotify Web API gizlilik politikaları nedeniyle bu kullanıcının takipçi sayısı dışarıya kapalıdır."
                      : "Follower count is restricted by Spotify privacy settings."}
                  </p>
                </div>
              )}
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="text-xs text-white/50">{isTurkish ? "Tahmini Toplam Erişim" : "Total Reach Impact"}</span>
              {profileData.followers !== null && profileData.followers !== undefined ? (
                <p className="text-3xl font-black font-mono text-emerald-400">{Math.round(profileData.totalFollowerReach).toLocaleString()}</p>
              ) : (
                <p className="text-base font-bold text-white/50">{isTurkish ? "Hesaplanamadı" : "N/A"}</p>
              )}
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="text-xs text-white/50">{isTurkish ? "Halka Açık Listeler" : "Public Playlists"}</span>
              <p className="text-3xl font-black font-mono text-violet-400">{profileData.publicPlaylists.length}</p>
            </div>
          </div>

          {/* SECTION: Public Playlists */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 backdrop-blur-xl">
                <ListMusic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isTurkish ? "Küratör Çalma Listeleri" : "Public Playlists & Curator Reach"}
                </h3>
                <p className="text-xs text-white/60">
                  {isTurkish ? "Profilin oluşturduğu veya yönettiği halka açık listeler" : "Playlists curated or managed by this profile"}
                </p>
              </div>
            </div>

            {profileData.publicPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileData.publicPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img src={pl.coverUrl} alt={pl.title} className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-white text-sm">{pl.title}</h4>
                        <p className="text-xs text-white/60">
                          {pl.tracksCount} {isTurkish ? "Parça" : "Tracks"} · {pl.followersCount.toLocaleString()} {isTurkish ? "Takipçi" : "Followers"}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/tools/spotify-playlist-analyzer?url=https://open.spotify.com/playlist/${pl.id}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 active:scale-95 transition-all shrink-0"
                    >
                      {isTurkish ? "Analiz Et" : "Analyze"}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <p className="text-sm font-semibold text-white/70">
                  {isTurkish
                    ? "⚠️ Bu profilde halka açık çalma listesi bulunamadı veya Spotify gizlilik ayarları nedeniyle listeler erişime kapalı."
                    : "⚠️ No public playlists found for this profile or restricted by Spotify privacy settings."}
                </p>
                <p className="text-xs text-white/40">
                  {isTurkish
                    ? "Not: Çalma listelerini analiz etmek için doğrudan Spotify playlist bağlantısını (URL) yapıştırabilirsiniz."
                    : "Tip: You can paste a direct Spotify playlist URL to analyze any specific playlist."}
                </p>
              </div>
            )}
          </div>

          {/* SECTION: Top Tracks (If Artist) */}
          {profileData.topTracks && profileData.topTracks.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 backdrop-blur-xl">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isTurkish ? "En Popüler Şarkılar" : "Top Popular Tracks"}
                  </h3>
                  <p className="text-xs text-white/60">
                    {isTurkish ? "Sanatçının Spotify üzerindeki en yüksek popülerlik puanına sahip şarkıları" : "Highest popularity scored tracks"}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {profileData.topTracks.map((t, idx) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl">
                    <div className="flex items-center gap-3.5">
                      <span className="font-mono text-xs text-white/40 w-4">{idx + 1}</span>
                      <img src={t.albumCover} alt={t.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{t.name}</h4>
                        <p className="text-xs text-white/50">{t.albumName} · {t.releaseDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-emerald-400 font-bold">%{t.popularity} Pop</span>
                      <span className="text-white/60">{Math.floor(t.durationMs / 60000)}:{String(Math.floor((t.durationMs % 60000) / 1000)).padStart(2, "0")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: Discography */}
          {profileData.discography && profileData.discography.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-300 backdrop-blur-xl">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isTurkish ? "Diskografi Dökümü" : "Discography Breakdown"}
                  </h3>
                  <p className="text-xs text-white/60">
                    {isTurkish ? "Albüm, single ve derleme albüm arşivi" : "Studio albums, singles, and compilation catalog"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {profileData.discography.map((album) => (
                  <div key={album.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:bg-white/[0.06] transition-all">
                    <img src={album.coverUrl} alt={album.title} className="w-full aspect-square rounded-xl object-cover border border-white/10" />
                    <div>
                      <h4 className="font-bold text-white text-xs truncate">{album.title}</h4>
                      <p className="text-[11px] text-white/50">{album.releaseDate} · {album.totalTracks} {isTurkish ? "Parça" : "Tracks"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
