"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Loader2,
  Sparkles,
  PlaySquare,
  Users,
  Film,
  Eye,
  DollarSign,
  TrendingUp,
  Award,
  Download,
  ExternalLink,
  Copy,
  Check,
  Rss,
  FileCode2,
  FileSpreadsheet,
  Share2,
  Play,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { FluidSlimeCard } from "@/components/creative/FluidSlimeCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { copyToClipboard } from "@/lib/utils";
import { YTChannelAnalysis, DEMO_CHANNELS, YTVideoItem } from "@/lib/yt-channel-analyzer";
import { trackToolUsage } from "@/lib/user-analytics";

export default function YTChannelClient() {
  const { lang, t } = useLanguage();
  const isTurkish = lang === "tr";

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [channelData, setChannelData] = useState<YTChannelAnalysis | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedRss, setCopiedRss] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const [downloadingAvatar, setDownloadingAvatar] = useState(false);
  const [downloadingBanner, setDownloadingBanner] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // Video Catalog Search & Filters
  const [videoSearch, setVideoSearch] = useState("");
  const [videoSort, setVideoSort] = useState<"newest" | "oldest" | "views" | "title">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [videoLimit, setVideoLimit] = useState<number>(24);

  useEffect(() => {
    trackToolUsage("yt-channel-analyzer");
  }, []);

  const handleAnalyze = async (queryToAnalyze?: string) => {
    const target = queryToAnalyze || inputQuery;

    if (!target.trim()) {
      toast.error(
        isTurkish
          ? "Lütfen bir YouTube Kanal URL'si, @handle veya Video bağlantısı girin."
          : "Please enter a YouTube Channel URL, @handle, or Video link."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tools/yt-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: target }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setChannelData(json.data);
        toast.success(
          isTurkish ? "YouTube kanalı ve tüm videolar başarıyla analiz edildi!" : "YouTube channel and videos analyzed successfully!"
        );
      } else {
        toast.error(json.error || (isTurkish ? "Kanal bilgileri getirilemedi." : "Failed to analyze channel."));
      }
    } catch (err) {
      console.error(err);
      toast.error(isTurkish ? "Ağ hatası oluştu." : "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!channelData) return;
    await copyToClipboard(channelData.customUrl);
    setCopiedLink(true);
    toast.success(isTurkish ? "Kanal bağlantısı kopyalandı!" : "Channel link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyRss = async () => {
    if (!channelData?.rssUrl) return;
    await copyToClipboard(channelData.rssUrl);
    setCopiedRss(true);
    toast.success(isTurkish ? "Kanal RSS Akış bağlantısı kopyalandı!" : "Channel RSS feed URL copied!");
    setTimeout(() => setCopiedRss(false), 2000);
  };

  const handleCopyJson = async () => {
    if (!channelData) return;
    await copyToClipboard(JSON.stringify(channelData, null, 2));
    setCopiedJson(true);
    toast.success(isTurkish ? "JSON analiz raporu kopyalandı!" : "JSON analysis report copied!");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyBio = async () => {
    if (!channelData?.description) return;
    await copyToClipboard(channelData.description);
    setCopiedBio(true);
    toast.success(isTurkish ? "Kanal açıklaması kopyalandı!" : "Channel bio copied!");
    setTimeout(() => setCopiedBio(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!channelData) return;
    let csv = "Video ID,Title,Published Date,Duration,Views,URL\n";
    (channelData.latestVideos || []).forEach((v) => {
      csv += `"${v.id}","${v.title.replace(/"/g, '""')}","${v.publishedAt}","${v.duration || ""}","${v.views || "N/A"}","${v.link}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${channelData.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_videos.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isTurkish ? "CSV raporu başarıyla indirildi!" : "CSV report downloaded successfully!");
  };

  const handleDownloadAvatar = async () => {
    if (!channelData?.avatarUrl) return;
    setDownloadingAvatar(true);
    const toastId = "dl-avatar";
    toast.loading(isTurkish ? "HD Avatar indiriliyor..." : "Downloading HD Avatar...", { id: toastId });

    try {
      const res = await fetch(channelData.avatarUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${channelData.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_avatar.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success(isTurkish ? "HD Avatar başarıyla indirildi!" : "HD Avatar downloaded successfully!", { id: toastId });
    } catch {
      const a = document.createElement("a");
      a.href = channelData.avatarUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
      toast.success(isTurkish ? "Avatar yeni sekmede açıldı." : "Avatar opened in new tab.", { id: toastId });
    } finally {
      setDownloadingAvatar(false);
    }
  };

  const handleDownloadBanner = async () => {
    if (!channelData?.bannerUrl) return;
    setDownloadingBanner(true);
    const toastId = "dl-banner";
    toast.loading(isTurkish ? "HD Banner indiriliyor..." : "Downloading HD Banner...", { id: toastId });

    try {
      const res = await fetch(channelData.bannerUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${channelData.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_banner.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success(isTurkish ? "HD Banner başarıyla indirildi!" : "HD Banner downloaded successfully!", { id: toastId });
    } catch {
      const a = document.createElement("a");
      a.href = channelData.bannerUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
      toast.success(isTurkish ? "Banner yeni sekmede açıldı." : "Banner opened in new tab.", { id: toastId });
    } finally {
      setDownloadingBanner(false);
    }
  };

  const handleDownloadThumbnail = (v: YTVideoItem) => {
    const a = document.createElement("a");
    a.href = v.thumbnail;
    a.target = "_blank";
    a.download = `${v.id}_thumbnail.jpg`;
    a.click();
    toast.success(isTurkish ? "Video kapağı indiriliyor..." : "Downloading video thumbnail...");
  };

  const handleCopyVideoLink = async (link: string) => {
    await copyToClipboard(link);
    toast.success(isTurkish ? "Video bağlantısı kopyalandı!" : "Video link copied!");
  };

  // Filtered & Sorted Videos
  const filteredVideos = useMemo(() => {
    if (!channelData?.latestVideos) return [];

    let list = channelData.latestVideos.filter((v) => {
      const q = videoSearch.toLowerCase().trim();
      if (!q) return true;
      return v.title.toLowerCase().includes(q) || (v.descriptionSnippet && v.descriptionSnippet.toLowerCase().includes(q));
    });

    if (videoSort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (videoSort === "oldest") {
      list.reverse();
    }

    return list;
  }, [channelData, videoSearch, videoSort]);

  const displayedVideos = useMemo(() => {
    if (videoLimit === -1) return filteredVideos;
    return filteredVideos.slice(0, videoLimit);
  }, [filteredVideos, videoLimit]);

  const uploadConsistencyLabel = useMemo(() => {
    const uc = channelData?.uploadConsistency || "Active";
    if (isTurkish) {
      if (uc === "Weekly") return "Haftalık Yükleme Sıklığı";
      if (uc === "Daily") return "Günlük Yükleme Sıklığı";
      if (uc === "Bi-Weekly") return "İki Haftalık Yükleme Sıklığı";
      return "Aktif Yükleme Sıklığı";
    }
    return `${uc} Upload Frequency`;
  }, [channelData, isTurkish]);

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
          href="/tools/yt-playlist-length"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 backdrop-blur-xl transition-all"
        >
          <Film className="w-4 h-4" />
          <span>{isTurkish ? "Playlist Süre Hesaplayıcı" : "Playlist Length Studio"}</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-300 backdrop-blur-2xl shadow-xl hover:border-indigo-500/40 transition-colors"
        >
          <PlaySquare className="w-4 h-4 text-rose-500" />
          <span>{isTurkish ? "YouTube Kanal & Profil Stüdyosu Pro" : "YouTube Channel & Profile Studio Pro"}</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {isTurkish ? "YouTube Kanal & Profil Analizörü" : "YouTube Channel & Profile Analyzer"}
        </h1>

        <p className="text-sm sm:text-base text-white/70 leading-relaxed">
          {isTurkish
            ? "Herhangi bir YouTube kanalı veya videosu girerek net abone sayısını, tahmini gelirlerini, HD banner & avatarını ve 100+ videoluk zengin video kataloğunu filtreleyin ve inceleyin."
            : "Inspect any YouTube creator or video to analyze exact subscriber counts, projected revenue, HD artwork downloads, and filter through the complete video catalog."}
        </p>
      </div>

      {/* Input Search Box */}
      <NeonBorder className="p-2 sm:p-3 rounded-3xl bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder={
                isTurkish
                  ? "Kanal URL'si, @handle (örn: @BarisOzcan, @MrBeast), Video linki veya Kanal Adı..."
                  : "Channel URL, @handle (e.g. @MrBeast), Video link, or Creator Name..."
              }
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl border border-rose-500/40 bg-white/[0.06] text-rose-300 font-bold backdrop-blur-3xl shadow-xl transition-all duration-300 hover:bg-rose-500/20 hover:border-rose-400 hover:text-white hover:shadow-rose-500/25 active:scale-95 shrink-0 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-rose-400" /> : <Sparkles className="w-5 h-5 text-rose-400" />}
            <span>{loading ? (isTurkish ? "Analiz Ediliyor..." : "Analyzing...") : isTurkish ? "Kanalı İncele" : "Analyze Channel"}</span>
          </button>
        </div>
      </NeonBorder>

      {/* Preset Demo Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider mr-2">
          {isTurkish ? "Hızlı Örnekler:" : "Quick Presets:"}
        </span>
        {[
          { label: "Barış Özcan", query: "Barış Özcan" },
          { label: "MrBeast", query: "@MrBeast" },
          { label: "Marques Brownlee", query: "@mkbhd" },
          { label: "Veritasium", query: "@veritasium" },
          { label: "Kurzgesagt", query: "@kurzgesagt" },
        ].map((demo, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputQuery(demo.query);
              handleAnalyze(demo.query);
            }}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-rose-500/40 backdrop-blur-xl transition-all cursor-pointer"
          >
            {demo.label}
          </button>
        ))}
      </div>

      {/* Active Channel Result Layout */}
      {channelData && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Channel Header Card with Banner & Centered Layout */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0e14]/90 backdrop-blur-3xl shadow-2xl">
            {/* Banner Artwork */}
            <div className="relative h-48 sm:h-72 w-full bg-zinc-900 overflow-hidden group/banner">
              <img src={channelData.bannerUrl} alt="Channel Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e14] via-[#0d0e14]/40 to-black/30" />
              <button
                onClick={handleDownloadBanner}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-bold opacity-0 group-hover/banner:opacity-100 transition-opacity cursor-pointer backdrop-blur-md hover:bg-black/80"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span>{isTurkish ? "2560x1440 HD Banner İndir" : "Download HD Banner"}</span>
              </button>
            </div>

            {/* Centered Profile Info Row */}
            <div className="relative px-6 sm:px-10 pb-8 pt-0 flex flex-col items-center text-center -mt-20 sm:-mt-24 space-y-4">
              {/* Avatar */}
              <div className="relative group/avatar shrink-0">
                <img
                  src={channelData.avatarUrl}
                  alt={channelData.title}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#0d0e14] shadow-2xl ring-4 ring-rose-500/20"
                />
                <button
                  onClick={handleDownloadAvatar}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-xs font-bold transition-opacity cursor-pointer"
                >
                  <Download className="w-5 h-5 text-rose-400" />
                  <span>HD İndir</span>
                </button>
              </div>

              {/* Title & Badges */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <h2 className="text-2xl sm:text-4xl font-black text-white">{channelData.title}</h2>
                  {channelData.verified && (
                    <span className="p-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400" title="Doğrulanmış Kanal">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/[0.06] text-zinc-300 border border-white/10">
                    {channelData.handle}
                  </span>
                </div>

                {/* Bio with Expand/Collapse & Copy */}
                <div className="space-y-2 pt-1">
                  <p className={`text-xs sm:text-sm text-white/70 leading-relaxed ${isBioExpanded ? "" : "line-clamp-2"}`}>
                    {channelData.description}
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                    >
                      {isBioExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>{isTurkish ? "Açıklamayı Daralt" : "Collapse Bio"}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>{isTurkish ? "Açıklamanın Tamamını Oku" : "Read Full Bio"}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyBio}
                      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
                    >
                      {copiedBio ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isTurkish ? "Metni Kopyala" : "Copy Bio"}</span>
                    </button>
                  </div>
                </div>

                {/* Channel Keywords */}
                {channelData.keywords && channelData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 justify-center">
                    {channelData.keywords.slice(0, 10).map((k, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.03] text-zinc-300 border border-white/5">
                        #{k}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={channelData.customUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/25 transition-all shadow-lg cursor-pointer"
                >
                  <PlaySquare className="w-4 h-4" />
                  <span>{isTurkish ? "YouTube'da Aç" : "Open in YouTube"}</span>
                </a>

                <button
                  onClick={handleDownloadAvatar}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isTurkish ? "HD Avatar İndir" : "Download Avatar"}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  title={isTurkish ? "Kanal Linkini Kopyala" : "Copy Channel Link"}
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleCopyRss}
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  title={isTurkish ? "RSS Akışını Kopyala" : "Copy RSS Feed URL"}
                >
                  {copiedRss ? <Check className="w-4 h-4 text-emerald-400" /> : <Rss className="w-4 h-4 text-amber-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* 4 Metric Cards (Fixed Glare & Full Bleed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FluidSlimeCard glowColor="rgba(244, 63, 94, 0.25)" className="p-5 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Toplam Abone" : "Subscribers"}</span>
                <Users className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-3xl font-black font-mono text-rose-400">
                {channelData.subscriberCountNum ? channelData.subscriberCountNum.toLocaleString() : channelData.subscriberCountText}
              </p>
              <span className="text-[10px] text-white/40">{channelData.subscriberCountText} ({isTurkish ? "Doğrulanmış Kitle" : "Verified Reach"})</span>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(99, 102, 241, 0.25)" className="p-5 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Toplam Video" : "Video Catalog"}</span>
                <Film className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-3xl font-black font-mono text-indigo-400">
                {channelData.videoCountNum.toLocaleString()}
              </p>
              <span className="text-[10px] text-white/40">{uploadConsistencyLabel}</span>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(16, 185, 129, 0.25)" className="p-5 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Aylık Tahmini Gelir" : "Monthly Est. Revenue"}</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                ${channelData.earnings.monthlyMinUsd.toLocaleString()} - ${channelData.earnings.monthlyMaxUsd.toLocaleString()}
              </p>
              <span className="text-[10px] text-white/40">{isTurkish ? "Yıllık:" : "Yearly:"} ${channelData.earnings.yearlyMinUsd.toLocaleString()} - ${channelData.earnings.yearlyMaxUsd.toLocaleString()}</span>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(168, 85, 247, 0.25)" className="p-5 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{isTurkish ? "Performans Skoru" : "Performance Score"}</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-black font-mono text-purple-400">
                %{channelData.performanceScore}
              </p>
              <span className="text-[10px] text-white/40">{isTurkish ? "Etkileşim & İzlenme İndeksi" : "Engagement & Velocity Score"}</span>
            </FluidSlimeCard>
          </div>

          {/* SECTION: Comprehensive Video Catalog with Search & Filter Controls */}
          {channelData.latestVideos && channelData.latestVideos.length > 0 && (
            <div className="bg-[#0d0e14]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-3xl shadow-2xl space-y-6">
              {/* Header with Title & Export Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {isTurkish ? "Kanal Video Kataloğu & Arşivi" : "Channel Video Catalog & Archive"}
                    </h3>
                    <p className="text-xs text-white/60">
                      {filteredVideos.length} {isTurkish ? "video listelendi" : "videos listed"} · {channelData.videoCountNum} {isTurkish ? "toplam video" : "total channel uploads"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isTurkish ? "CSV İndir" : "Export CSV"}</span>
                  </button>

                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isTurkish ? "JSON Kopyala" : "Copy JSON"}</span>
                  </button>
                </div>
              </div>

              {/* Filter, Search & View Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                {/* Video Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={videoSearch}
                    onChange={(e) => setVideoSearch(e.target.value)}
                    placeholder={isTurkish ? "Videolarda ara (başlık veya kelime)..." : "Search in videos by title or keyword..."}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                {/* Sort & View Mode */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <select
                    value={videoSort}
                    onChange={(e: any) => setVideoSort(e.target.value)}
                    className="bg-[#12141c] border border-white/10 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="newest">{isTurkish ? "En Yeni" : "Newest"}</option>
                    <option value="oldest">{isTurkish ? "En Eski" : "Oldest"}</option>
                    <option value="title">{isTurkish ? "Başlık (A-Z)" : "Title (A-Z)"}</option>
                  </select>

                  <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-black/40">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-colors ${viewMode === "grid" ? "bg-rose-500/20 text-rose-300" : "text-zinc-400 hover:text-white"}`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 transition-colors ${viewMode === "list" ? "bg-rose-500/20 text-rose-300" : "text-zinc-400 hover:text-white"}`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Videos Grid or List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedVideos.map((v) => (
                    <div
                      key={v.id}
                      className="group rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-rose-500/40 hover:bg-white/[0.05] transition-all flex flex-col justify-between space-y-3"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10">
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {v.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-white backdrop-blur-sm">
                            {v.duration}
                          </span>
                        )}
                        <a
                          href={v.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Play className="w-8 h-8 text-white fill-white" />
                        </a>
                      </div>

                      {/* Video Info */}
                      <div className="space-y-1.5">
                        <a
                          href={v.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-white text-xs line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors block"
                        >
                          {v.title}
                        </a>

                        <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            {v.publishedAt}
                          </span>
                          {v.views && <span className="font-bold text-rose-400">{v.views}</span>}
                        </div>
                      </div>

                      {/* Video Actions */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-[11px]">
                        <button
                          onClick={() => handleCopyVideoLink(v.link)}
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{isTurkish ? "Linki Al" : "Copy"}</span>
                        </button>

                        <button
                          onClick={() => handleDownloadThumbnail(v)}
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-rose-400" />
                          <span>{isTurkish ? "Kapak İndir" : "Cover"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="divide-y divide-white/5">
                  {displayedVideos.map((v, idx) => (
                    <div
                      key={v.id}
                      className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-white/[0.02] rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs text-zinc-500 w-6 text-center">{idx + 1}</span>
                        <img src={v.thumbnail} alt={v.title} className="w-16 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                        <div className="space-y-0.5 min-w-0">
                          <a
                            href={v.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-white text-xs truncate hover:text-rose-300 transition-colors block"
                          >
                            {v.title}
                          </a>
                          <p className="text-[10px] text-zinc-400">{v.publishedAt} · {v.views}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyVideoLink(v.link)}
                          className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={v.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                          title="Watch"
                        >
                          <Play className="w-3.5 h-3.5 fill-rose-300" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination / Show All Button */}
              {filteredVideos.length > videoLimit && videoLimit !== -1 && (
                <div className="flex justify-center pt-4 border-t border-white/10">
                  <button
                    onClick={() => setVideoLimit(-1)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-bold text-white hover:bg-white/[0.08] hover:border-rose-500/40 transition-all cursor-pointer shadow-lg"
                  >
                    <span>{isTurkish ? `Tüm Videoları Yükle (${filteredVideos.length} Video)` : `Show All Videos (${filteredVideos.length})`}</span>
                    <ChevronDown className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State Showcase */}
      {!channelData && !loading && (
        <div className="space-y-12 pt-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0d0e14]/90 border border-white/10 backdrop-blur-3xl text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold uppercase tracking-wider backdrop-blur-2xl shadow-lg">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>{isTurkish ? "YouTube Kanal & Profil Stüdyosuna Hoş Geldiniz" : "Welcome to YouTube Channel Studio"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
              {isTurkish
                ? "Herhangi bir YouTube Kanalı veya Videosu Girerek Kapsamlı Metrikleri Keşfedin"
                : "Analyze Any YouTube Creator, Subscriber Velocity & Revenue Projections"}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
              {isTurkish
                ? "Yukarıdaki arama çubuğuna bir kanal linki, @handle (örn: @BarisOzcan, @MrBeast) veya doğrudan video linki yapıştırın; kanalın tüm abone, video ve gelir verilerini anında çıkarın."
                : "Paste any YouTube channel URL, handle, or video link above to instantly unlock comprehensive creator metrics."}
            </p>
          </div>

          {/* 4 Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FluidSlimeCard glowColor="rgba(244, 63, 94, 0.25)" className="p-5 space-y-2">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Kitle & Abone Analizi" : "Audience Reach"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Doğrulanmış net abone sayıları, toplam video hacmi ve kanal seviyesi." : "Verified subscriber counts, catalog size, and creator tier."}</p>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(16, 185, 129, 0.25)" className="p-5 space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Tahmini Gelir Modeli" : "Earnings Projection"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Sektör standartlarında CPM/RPM ile aylık ve yıllık gelir tahminleri." : "Monthly and annual revenue estimates based on view velocity."}</p>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(99, 102, 241, 0.25)" className="p-5 space-y-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "Tüm Video Kataloğu (100+)" : "Video Catalog (100+)"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "Kanalın yayınladığı tüm videolar, kapaklar, süreler ve anlık arama/filtreleme." : "Latest published videos, direct watch links, duration, and search."}</p>
            </FluidSlimeCard>

            <FluidSlimeCard glowColor="rgba(236, 72, 153, 0.25)" className="p-5 space-y-2">
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 w-fit">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">{isTurkish ? "HD Banner & Avatar" : "HD Artwork Downloader"}</h3>
              <p className="text-xs text-white/50">{isTurkish ? "2560x1440 HD banner ve 900x900 profil avatarını doğrudan indirin." : "Directly download 2560x1440 HD banners and 900x900 avatars."}</p>
            </FluidSlimeCard>
          </div>
        </div>
      )}
    </div>
  );
}
