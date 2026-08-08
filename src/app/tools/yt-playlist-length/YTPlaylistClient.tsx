"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  PlaySquare,
  Search,
  Loader2,
  Clock,
  Video,
  Gauge,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Sparkles,
  BarChart3,
  Layers,
  TrendingUp,
  Calendar,
  Award,
  Sliders,
  CheckSquare,
  Square,
  FileCode,
  Share2,
} from "lucide-react";
import { parseYouTubeUrl, formatDuration, formatDurationAtSpeed, cn, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";

interface VideoInfo {
  videoId: string;
  title: string;
  durationSeconds: number;
  thumbnail: string;
  channelName?: string;
}

interface PlaylistData {
  playlistId: string;
  title: string;
  videos: VideoInfo[];
  totalVideos: number;
  totalSeconds: number;
  channelName?: string;
  error?: string;
  fallback?: boolean;
}

const SPEED_PRESETS = [
  { speed: 1.0, label: "1.0× Standart" },
  { speed: 1.25, label: "1.25× Hızlı" },
  { speed: 1.5, label: "1.5× Akıcı" },
  { speed: 1.75, label: "1.75× Seri" },
  { speed: 2.0, label: "2.0× Çift Hız" },
  { speed: 2.25, label: "2.25× Ultra" },
  { speed: 2.5, label: "2.5× Ekstra" },
  { speed: 3.0, label: "3.0× Maks" },
];

const DAILY_TIME_PRESETS = [
  { minutes: 15, label: "15 Dk" },
  { minutes: 30, label: "30 Dk" },
  { minutes: 45, label: "45 Dk" },
  { minutes: 60, label: "1 Saat" },
  { minutes: 120, label: "2 Saat" },
  { minutes: 240, label: "4 Saat" },
  { minutes: 480, label: "8 Saat" },
];

const EXAMPLE_PLAYLISTS = [
  {
    name: "Web Geliştirme Temelleri",
    url: "https://www.youtube.com/playlist?list=PLillGF-RfqbYeckUaD1z6nviTp31GLTH8",
  },
  {
    name: "JavaScript Algoritmaları",
    url: "https://www.youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyurX",
  },
];

type CalculationMode = "full" | "range" | "remaining";

export function YTPlaylistClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Oynatma Listesi Taranıyor...");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlaylistData | null>(null);

  // Calculation Mode State
  const [calcMode, setCalcMode] = useState<CalculationMode>("full");
  const [watchedCount, setWatchedCount] = useState<number>(0);
  const [includeCurrentVideo, setIncludeCurrentVideo] = useState<boolean>(true);

  // Selected videos state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(100);

  // Custom Speed Simulator
  const [customSpeed, setCustomSpeed] = useState("1.5");

  // Daily Schedule Planner
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [scheduleSpeed, setScheduleSpeed] = useState<number>(1.5);

  // Video Catalogue List State
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortBy, setSortBy] = useState<"index" | "desc" | "asc" | "title">("index");

  const handleAnalyzeWithUrl = useCallback(async (targetUrl: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;

    setLoading(true);
    setLoadingStep("YouTube Oynatma Listesi Taranıyor...");
    setError(null);
    setData(null);

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    let playlistId: string | null = null;

    for (const line of lines) {
      const parsed = parseYouTubeUrl(line);
      if (parsed.type === "playlist" && parsed.id) {
        playlistId = parsed.id;
        break;
      }
      if (/^(PL|UU|RD|OLAK)[a-zA-Z0-9_-]+$/.test(line)) {
        playlistId = line;
        break;
      }
    }

    if (!playlistId) {
      setError("Geçerli bir YouTube playlist URL'si veya ID'si bulunamadı. Örnek: https://www.youtube.com/playlist?list=PLxxxxxx");
      setLoading(false);
      return;
    }

    try {
      setLoadingStep("Video Süreleri Hesaplanıyor...");
      let res = await fetch(`/api/tools/yt-playlist-length?id=${encodeURIComponent(playlistId)}`);
      if (!res.ok) {
        res = await fetch(`/api/tools/yt-playlist?id=${encodeURIComponent(playlistId)}`);
      }
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error || "Playlist analiz edilirken bir hata oluştu.");
        return;
      }

      setData(json);
      const allIds = new Set<string>((json.videos as VideoInfo[]).map((v) => v.videoId));
      setSelectedIds(allIds);
      setRangeStart(1);
      setRangeEnd(json.videos.length);
      toast.success(`${json.videos.length} video başarıyla analiz edildi!`);
    } catch {
      setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-analyze on page mount if URL contains ?id=PLAYLIST_ID
  useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("id");
      if (queryId) {
        setUrl(queryId);
        handleAnalyzeWithUrl(queryId);
      }
    }
  });

  const handleAnalyze = () => handleAnalyzeWithUrl(url);

  // Active / Selected Videos Calculation based on Calculation Mode
  const activeVideos = useMemo(() => {
    if (!data) return [];

    if (calcMode === "remaining") {
      const startIdx = includeCurrentVideo ? Math.max(0, watchedCount - 1) : Math.max(0, watchedCount);
      return data.videos.slice(startIdx);
    }

    if (calcMode === "range") {
      const startIdx = Math.max(0, rangeStart - 1);
      const endIdx = Math.min(data.videos.length, rangeEnd);
      return data.videos.slice(startIdx, endIdx);
    }

    return data.videos.filter((v) => selectedIds.has(v.videoId));
  }, [data, calcMode, watchedCount, includeCurrentVideo, rangeStart, rangeEnd, selectedIds]);

  const activeTotalSeconds = useMemo(() => {
    return activeVideos.reduce((sum, v) => sum + v.durationSeconds, 0);
  }, [activeVideos]);

  const duration = useMemo(() => {
    return formatDuration(activeTotalSeconds);
  }, [activeTotalSeconds]);

  // Handle Range Selection
  const applyRange = (start: number, end: number) => {
    if (!data) return;
    const clampedStart = Math.max(1, Math.min(start, data.videos.length));
    const clampedEnd = Math.max(clampedStart, Math.min(end, data.videos.length));
    setRangeStart(clampedStart);
    setRangeEnd(clampedEnd);
    setCalcMode("range");

    const newSet = new Set<string>();
    for (let i = clampedStart - 1; i < clampedEnd; i++) {
      if (data.videos[i]) newSet.add(data.videos[i].videoId);
    }
    setSelectedIds(newSet);
    toast.success(`${clampedStart}. ve ${clampedEnd}. videolar arasındaki aralık seçildi!`);
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.videos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.videos.map((v) => v.videoId)));
    }
  };

  const toggleVideoSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Highs and Lows (Records)
  const records = useMemo(() => {
    if (activeVideos.length === 0) return null;
    const sorted = [...activeVideos].sort((a, b) => b.durationSeconds - a.durationSeconds);
    const longest = sorted[0];
    const shortest = sorted[sorted.length - 1];
    const avgSec = Math.round(activeTotalSeconds / activeVideos.length);

    return {
      longest,
      shortest,
      avgSec,
    };
  }, [activeVideos, activeTotalSeconds]);

  // Duration distribution stats
  const distribution = useMemo(() => {
    if (activeVideos.length === 0) return { short: 0, mid: 0, long: 0, epic: 0 };
    let short = 0;
    let mid = 0;
    let long = 0;
    let epic = 0;
    activeVideos.forEach((v) => {
      if (v.durationSeconds < 300) short++;
      else if (v.durationSeconds < 1200) mid++;
      else if (v.durationSeconds < 3600) long++;
      else epic++;
    });
    return { short, mid, long, epic };
  }, [activeVideos]);

  // Daily Schedule Calculations
  const scheduleInfo = useMemo(() => {
    if (activeTotalSeconds <= 0 || dailyMinutes <= 0) return null;
    const effectiveSeconds = activeTotalSeconds / scheduleSpeed;
    const dailySeconds = dailyMinutes * 60;
    const daysNeeded = Math.ceil(effectiveSeconds / dailySeconds);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);

    const formatter = new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });

    const videosPerDay = (activeVideos.length / Math.max(1, daysNeeded)).toFixed(1);
    const timeSavedSeconds = activeTotalSeconds - effectiveSeconds;

    return {
      daysNeeded,
      dateFormatted: formatter.format(completionDate),
      videosPerDay,
      timeSavedFormatted: formatDuration(timeSavedSeconds).short,
    };
  }, [activeTotalSeconds, dailyMinutes, scheduleSpeed, activeVideos.length]);

  // Sorted and Filtered catalogue
  const processedCatalogue = useMemo(() => {
    if (!data) return [];
    let list = data.videos.filter((v) =>
      filterQuery ? v.title.toLowerCase().includes(filterQuery.toLowerCase()) : true
    );

    if (sortBy === "desc") {
      list = [...list].sort((a, b) => b.durationSeconds - a.durationSeconds);
    } else if (sortBy === "asc") {
      list = [...list].sort((a, b) => a.durationSeconds - b.durationSeconds);
    } else if (sortBy === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, "tr"));
    }
    return list;
  }, [data, filterQuery, sortBy]);

  const visibleCatalogue = showAllVideos ? processedCatalogue : processedCatalogue.slice(0, 12);

  const handleCopy = async (text: string, id: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      toast.success("Panoya kopyalandı!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadCSV = () => {
    if (!data) return;
    const rows = [
      ["#", "Video Basligi", "Sure (saniye)", "Formatli Sure", "Video ID", "YouTube Baglantisi"].join(","),
      ...activeVideos.map((v, i) => {
        const dur = formatDuration(v.durationSeconds);
        return [
          i + 1,
          `"${v.title.replace(/"/g, '""')}"`,
          v.durationSeconds,
          dur.short,
          v.videoId,
          `https://youtu.be/${v.videoId}`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `playlist-${data.playlistId}.csv`;
    link.click();
    toast.success("CSV tablosu başarıyla indirildi!");
  };

  const handleDownloadJSON = () => {
    if (!data) return;
    const exportObj = {
      playlistId: data.playlistId,
      title: data.title,
      channelName: data.channelName,
      totalVideos: activeVideos.length,
      totalSeconds: activeTotalSeconds,
      formattedDuration: duration.formatted,
      videos: activeVideos,
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `playlist-${data.playlistId}.json`;
    link.click();
    toast.success("JSON verisi başarıyla indirildi!");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] transition-all hover:border-indigo-500/50 hover:text-white"
          data-cursor="Geri"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
          <span>Hub Menüsüne Dön</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="mb-8 relative overflow-hidden rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/30">
              <PlaySquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ultra Hassas v2.5
                </span>
                <span className="text-xs text-[var(--hub-text-subtle)]">· %100 Doğru Süre & Sayı Garantili</span>
              </div>
              <h1 className="text-2xl font-black text-white sm:text-3xl">
                YouTube Playlist Analyzer
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
                Özel hazır şablon butonları, canlı çalışma planlayıcısı, özel video aralıkları ve anlık süper analiz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Box with Neon Border */}
      <div className="mb-8">
        <NeonBorder color="#8b5cf6" rounded={24} glow={70}>
          <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>YouTube Playlist URL veya ID Yapıştırın</span>
              </label>
              <span className="text-[11px] text-[var(--hub-text-subtle)]">
                Ctrl + Enter ile çalıştır
              </span>
            </div>

            <textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze();
              }}
              placeholder="Playlist → youtube.com/playlist?list=PLxxxxxx&#10;Birden fazla bağlantı yapıştırabilirsiniz..."
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-3 text-sm text-white placeholder:text-[var(--hub-text-subtle)] transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              data-cursor="Yapıştır"
            />

            {/* Calculation Mode Selector */}
            <div className="rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-3 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--hub-text-muted)] block">
                Hesaplama Modu Seçimi
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcMode("full")}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-bold transition-all",
                    calcMode === "full"
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                      : "border border-[var(--hub-border)] bg-[var(--hub-surface)] text-[var(--hub-text-muted)] hover:text-white"
                  )}
                >
                  Tüm Playlist
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("range")}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-bold transition-all",
                    calcMode === "range"
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                      : "border border-[var(--hub-border)] bg-[var(--hub-surface)] text-[var(--hub-text-muted)] hover:text-white"
                  )}
                >
                  Özel Video Aralığı
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("remaining")}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-bold transition-all",
                    calcMode === "remaining"
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                      : "border border-[var(--hub-border)] bg-[var(--hub-surface)] text-[var(--hub-text-muted)] hover:text-white"
                  )}
                >
                  Kalan Videolar Modu
                </button>
              </div>

              {calcMode === "remaining" && (
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[var(--hub-border)]">
                  <span className="text-xs text-[var(--hub-text-muted)]">Şu ana kadar izlediğim video #:</span>
                  <input
                    type="number"
                    min={0}
                    max={data?.totalVideos || 1000}
                    value={watchedCount}
                    onChange={(e) => setWatchedCount(parseInt(e.target.value, 10) || 0)}
                    className="w-20 rounded-lg border border-[var(--hub-border)] bg-[var(--hub-surface)] px-2.5 py-1 text-center text-xs text-white focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-[var(--hub-text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCurrentVideo}
                      onChange={(e) => setIncludeCurrentVideo(e.target.checked)}
                      className="rounded border-[var(--hub-border)] bg-[var(--hub-surface)] accent-indigo-500"
                    />
                    <span>Mevcut videoyu dahil et</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[var(--hub-text-subtle)] mr-1">Örnekler:</span>
                {EXAMPLE_PLAYLISTS.map((ex) => (
                  <button
                    key={ex.name}
                    type="button"
                    onClick={() => {
                      setUrl(ex.url);
                      handleAnalyzeWithUrl(ex.url);
                    }}
                    className="rounded-lg border border-[var(--hub-border)] bg-[var(--hub-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--hub-text-muted)] hover:border-indigo-500/40 hover:text-white transition-all"
                    data-cursor="Örnek"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                data-cursor="Analiz"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Playlist Analiz Et</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </NeonBorder>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-xl"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <h4 className="text-sm font-bold text-red-300">Analiz Başarısız Oldu</h4>
              <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Playlist Info Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/90 p-5 backdrop-blur-xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Oynatma Listesi
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">{data.title}</h3>
                {data.channelName && (
                  <p className="text-xs text-[var(--hub-text-muted)] mt-0.5">
                    Kanal: <span className="text-white font-medium">{data.channelName}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://youtube.com/playlist?list=${data.playlistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-3.5 py-2 text-xs font-semibold text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shrink-0"
                  data-cursor="YouTube"
                >
                  <span>YouTube&apos;da Aç</span>
                  <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                </a>
              </div>
            </div>

            {/* Range & Video Selection Control Bar with Modern Preset Chips */}
            <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-5 backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hub-border)] pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Özel Video Aralığı & Filtre Şablonları
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--hub-text-muted)]">
                    Seçili Video: <strong className="text-indigo-300">{activeVideos.length}</strong> / {data.videos.length}
                  </span>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="rounded-lg border border-[var(--hub-border)] bg-[var(--hub-bg)] px-2.5 py-1 text-[11px] font-bold text-white hover:border-indigo-500/40 transition-all"
                  >
                    {selectedIds.size === data.videos.length ? "Seçimleri Temizle" : "Tümünü Seç"}
                  </button>
                </div>
              </div>

              {/* Range Presets Bar */}
              <div className="space-y-2">
                <span className="text-[11px] text-[var(--hub-text-subtle)] font-bold block">
                  Hazır Aralık Şablonları:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "İlk 5 Video", count: 5 },
                    { label: "İlk 10 Video", count: 10 },
                    { label: "İlk 25 Video", count: 25 },
                    { label: "İlk 50 Video", count: 50 },
                    { label: "Tüm Videolar", count: data.videos.length },
                  ].map((p) => (
                    <motion.button
                      key={p.label}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => applyRange(1, Math.min(p.count, data.videos.length))}
                      className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:border-indigo-400 hover:bg-indigo-500/20 transition-all"
                    >
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Manual Input Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-[var(--hub-border)]/50">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-[var(--hub-text-muted)] font-semibold">Manuel Aralık:</span>
                  <input
                    type="number"
                    min={1}
                    max={data.videos.length}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(parseInt(e.target.value, 10) || 1)}
                    className="w-16 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-2.5 py-1.5 text-center text-xs font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                  />
                  <span className="text-xs text-[var(--hub-text-subtle)]">ile</span>
                  <input
                    type="number"
                    min={1}
                    max={data.videos.length}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(parseInt(e.target.value, 10) || data.videos.length)}
                    className="w-16 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-2.5 py-1.5 text-center text-xs font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                  />
                  <span className="text-xs text-[var(--hub-text-subtle)]">arası</span>
                  <button
                    type="button"
                    onClick={() => applyRange(rangeStart, rangeEnd)}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:scale-105 transition-all"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricBox
                icon={<Video className="h-4 w-4 text-indigo-400" />}
                title="Seçili Video"
                value={`${activeVideos.length} adet`}
                subtitle={`Toplam ${data.videos.length} videodan`}
              />
              <MetricBox
                icon={<Clock className="h-4 w-4 text-purple-400" />}
                title="Toplam Süre"
                value={duration?.short || "—"}
                subtitle={duration?.formatted}
                accent
              />
              <MetricBox
                icon={<Gauge className="h-4 w-4 text-pink-400" />}
                title="Ortalama Süre"
                value={
                  records ? formatDuration(records.avgSec).short : "—"
                }
                subtitle="Video başına"
              />
              <MetricBox
                icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
                title="2.0× İzleme Süresi"
                value={formatDurationAtSpeed(activeTotalSeconds, 2)}
                subtitle={`%50 zaman tasarrufu`}
              />
            </div>

            {/* Statistical Records & Milestones */}
            {records && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-5 backdrop-blur-xl flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      En Uzun Video
                    </span>
                    <a
                      href={`https://youtu.be/${records.longest.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs font-bold text-white hover:text-purple-300 transition-colors mt-0.5"
                    >
                      {records.longest.title}
                    </a>
                    <span className="text-xs font-mono font-bold text-purple-300 mt-1 block">
                      {formatDuration(records.longest.durationSeconds).short}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-5 backdrop-blur-xl flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      En Kısa Video
                    </span>
                    <a
                      href={`https://youtu.be/${records.shortest.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs font-bold text-white hover:text-emerald-300 transition-colors mt-0.5"
                    >
                      {records.shortest.title}
                    </a>
                    <span className="text-xs font-mono font-bold text-emerald-300 mt-1 block">
                      {formatDuration(records.shortest.durationSeconds).short}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Schedule Study Planner with Modern Template Preset Buttons */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-600/5 to-transparent p-6 backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--hub-border)] pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Günlük Çalışma & İzleme Planlayıcısı</h3>
                    <p className="text-xs text-[var(--hub-text-muted)]">
                      Günde ayıracağınız zamana göre bitiş tarihini ve günlük ortalamanızı anında hesaplayın.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ready Presets Bar for Daily Time */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-indigo-300 block">
                  Hazır Zaman Şablonları (Günde Kaç Saat/Dakika?):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {DAILY_TIME_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.minutes}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDailyMinutes(preset.minutes)}
                      className={cn(
                        "rounded-xl px-3.5 py-2 text-xs font-bold transition-all border",
                        dailyMinutes === preset.minutes
                          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/20"
                          : "border-[var(--hub-border)] bg-[var(--hub-bg)] text-[var(--hub-text-muted)] hover:border-indigo-500/40 hover:text-white"
                      )}
                    >
                      ⚡ {preset.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center pt-2">
                <div>
                  <label className="text-xs font-bold text-indigo-300 mb-1.5 block">
                    Manuel Dakika Girdisi:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={1440}
                      step={5}
                      value={dailyMinutes}
                      onChange={(e) => setDailyMinutes(parseInt(e.target.value, 10) || 30)}
                      className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-2.5 text-xs font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                    />
                    <span className="text-xs text-[var(--hub-text-subtle)] shrink-0 font-bold">dk / gün</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-indigo-300 mb-1.5 block">
                    İzleme Hızı
                  </label>
                  <select
                    value={scheduleSpeed}
                    onChange={(e) => setScheduleSpeed(parseFloat(e.target.value))}
                    className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-2.5 text-xs font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                  >
                    <option value={1.0}>1.0× (Normal Hız)</option>
                    <option value={1.25}>1.25× Hızlı</option>
                    <option value={1.5}>1.5× Akıcı (Tavsiye Edilen)</option>
                    <option value={1.75}>1.75× Seri</option>
                    <option value={2.0}>2.0× Çift Hız</option>
                    <option value={2.5}>2.5× Ekstra Hızlı</option>
                  </select>
                </div>

                {scheduleInfo && (
                  <div className="rounded-xl border border-indigo-500/40 bg-black/40 p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Tahmini Bitiş Planı
                    </span>
                    <p className="text-base font-black text-white">
                      Tam <span className="text-indigo-300">{scheduleInfo.daysNeeded} Gün</span> İçinde Biter
                    </p>
                    <p className="text-xs text-[var(--hub-text-muted)]">
                      Bitiş Tarihi: <strong className="text-white">{scheduleInfo.dateFormatted}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-300 mt-1">
                      (Günde ortalama {scheduleInfo.videosPerDay} video · -{scheduleInfo.timeSavedFormatted} kazanç)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Length Breakdown Progress */}
            {activeVideos.length > 0 && (
              <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Süre Dağılım Analizi</span>
                  </span>
                  <span className="text-xs text-[var(--hub-text-muted)]">
                    Kısa (&lt;5dk), Orta (5-20dk), Uzun (20-60dk), Epic (&gt;60dk)
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex gap-1 p-0.5">
                  <div
                    style={{ width: `${(distribution.short / activeVideos.length) * 100}%` }}
                    className="h-full rounded-full bg-emerald-500"
                    title={`Kısa Videolar: ${distribution.short}`}
                  />
                  <div
                    style={{ width: `${(distribution.mid / activeVideos.length) * 100}%` }}
                    className="h-full rounded-full bg-indigo-500"
                    title={`Orta Videolar: ${distribution.mid}`}
                  />
                  <div
                    style={{ width: `${(distribution.long / activeVideos.length) * 100}%` }}
                    className="h-full rounded-full bg-purple-500"
                    title={`Uzun Videolar: ${distribution.long}`}
                  />
                  <div
                    style={{ width: `${(distribution.epic / activeVideos.length) * 100}%` }}
                    className="h-full rounded-full bg-pink-500"
                    title={`Epic Videolar: ${distribution.epic}`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between mt-3 text-[11px] text-[var(--hub-text-muted)] gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Kısa (&lt;5dk): {distribution.short}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" /> Orta (5-20dk): {distribution.mid}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500" /> Uzun (20-60dk): {distribution.long}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-pink-500" /> Epic (&gt;60dk): {distribution.epic}
                  </span>
                </div>
              </div>
            )}

            {/* Speed Simulation Matrix with Modern Template Preset Buttons */}
            <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-indigo-400" />
                  <span>Oynatma Hızına Göre Bitiş Süreleri Matrixi</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {SPEED_PRESETS.map(({ speed, label }) => {
                  const timeAtSpeed = formatDurationAtSpeed(activeTotalSeconds, speed);
                  const saved = activeTotalSeconds - activeTotalSeconds / speed;
                  const savedFmt = formatDuration(saved).short;
                  const isSelected = parseFloat(customSpeed) === speed;

                  return (
                    <motion.button
                      key={speed}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCustomSpeed(String(speed))}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all",
                        isSelected
                          ? "border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30"
                          : "border-[var(--hub-border)] bg-[var(--hub-bg)] hover:border-indigo-500/50"
                      )}
                    >
                      <span className="text-[11px] font-bold text-white mb-1">{label}</span>
                      <span className="text-sm font-black text-indigo-300">{timeAtSpeed}</span>
                      {speed > 1 && (
                        <span className="mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                          -{savedFmt}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom speed calculator */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--hub-border)] pt-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[var(--hub-text-muted)] font-semibold">
                    Manuel Özel Hız Girdisi:
                  </label>
                  <input
                    type="number"
                    placeholder="1.35"
                    value={customSpeed}
                    onChange={(e) => setCustomSpeed(e.target.value)}
                    min="0.25"
                    max="5"
                    step="0.05"
                    className="w-20 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-2.5 py-1.5 text-center text-xs font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                  />
                  <span className="text-xs text-[var(--hub-text-subtle)] font-bold">×</span>
                </div>

                {customSpeed && !isNaN(parseFloat(customSpeed)) && parseFloat(customSpeed) > 0 && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    {customSpeed}× Hızda Süre:{" "}
                    <strong>{formatDurationAtSpeed(activeTotalSeconds, parseFloat(customSpeed))}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Export and Copy Tools */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
                data-cursor="CSV İndir"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                <span>CSV Tablosu İndir</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJSON}
                className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
                data-cursor="JSON İndir"
              >
                <FileCode className="h-3.5 w-3.5 text-purple-400" />
                <span>JSON İndir</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    [
                      `🎬 YouTube Playlist: ${data.title}`,
                      `📺 Kanal: ${data.channelName || "—"}`,
                      `📊 Seçili Video: ${activeVideos.length} / ${data.totalVideos} adet`,
                      `⏱️ Toplam Süre: ${duration?.formatted} (${duration?.short})`,
                      `⚡ 1.25× Hızda: ${formatDurationAtSpeed(activeTotalSeconds, 1.25)}`,
                      `⚡ 1.50× Hızda: ${formatDurationAtSpeed(activeTotalSeconds, 1.50)}`,
                      `⚡ 2.00× Hızda: ${formatDurationAtSpeed(activeTotalSeconds, 2.00)}`,
                      "",
                      `🔗 everythinghub ile doğrudan aç & analiz et:`,
                      `https://everythinghub.vercel.app/tools/yt-playlist-length?id=${data.playlistId}`,
                      "",
                      `▶️ YouTube'da izle:`,
                      `https://www.youtube.com/playlist?list=${data.playlistId}`,
                    ].join("\n"),
                    "summary"
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
                data-cursor="Kopyala"
              >
                {copiedId === "summary" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Share2 className="h-3.5 w-3.5 text-pink-400" />
                )}
                <span>Özet Raporu Kopyala</span>
              </button>
            </div>

            {/* Video List Table */}
            {data.videos.length > 0 && (
              <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--hub-border)] px-5 py-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-400" />
                      <span>Video Kataloğu & Süreler</span>
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-normal text-[var(--hub-text-muted)]">
                        {processedCatalogue.length} video
                      </span>
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Sort Options */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "index" | "desc" | "asc" | "title")}
                      className="rounded-lg border border-[var(--hub-border)] bg-[var(--hub-bg)] px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="index">Sıralama: Varsayılan (#)</option>
                      <option value="desc">Sıralama: En Uzun İlk</option>
                      <option value="asc">Sıralama: En Kısa İlk</option>
                      <option value="title">Sıralama: İsim (A-Z)</option>
                    </select>

                    {/* Filter inside table */}
                    <div className="relative w-full sm:w-52">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--hub-text-subtle)]" />
                      <input
                        type="text"
                        placeholder="Arayın..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="w-full rounded-lg border border-[var(--hub-border)] bg-[var(--hub-bg)] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-[var(--hub-text-subtle)] focus:border-indigo-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[var(--hub-border)]">
                  {visibleCatalogue.map((video, i) => {
                    const dur = formatDuration(video.durationSeconds);
                    const isSelected = selectedIds.has(video.videoId);
                    return (
                      <div
                        key={video.videoId}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 transition-colors",
                          isSelected ? "hover:bg-white/[0.03]" : "opacity-40 bg-black/40 hover:opacity-60"
                        )}
                      >
                        {/* Selection Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleVideoSelect(video.videoId)}
                          className="shrink-0 text-[var(--hub-text-muted)] hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-400" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>

                        <span className="w-6 shrink-0 text-center font-mono text-xs text-[var(--hub-text-subtle)]">
                          {i + 1}
                        </span>

                        {/* Thumbnail */}
                        <div className="relative h-11 w-18 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-white/10">
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        {/* Title */}
                        <div className="min-w-0 flex-1">
                          <a
                            href={`https://youtu.be/${video.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-xs sm:text-sm font-medium text-white hover:text-indigo-300 transition-colors"
                            data-cursor="İzle"
                          >
                            {video.title}
                          </a>
                        </div>

                        {/* Duration */}
                        <span className="shrink-0 font-mono text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                          {video.durationSeconds > 0 ? dur.short : "—"}
                        </span>

                        {/* Thumbnail Downloader */}
                        <a
                          href={`https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg border border-[var(--hub-border)] p-1.5 text-[var(--hub-text-muted)] hover:border-indigo-500/40 hover:text-white transition-all"
                          title="HD Thumbnail İndir"
                          data-cursor="HD Görsel"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>

                {processedCatalogue.length > 12 && (
                  <button
                    type="button"
                    onClick={() => setShowAllVideos(!showAllVideos)}
                    className="flex w-full items-center justify-center gap-2 border-t border-[var(--hub-border)] px-5 py-3 text-xs font-bold text-indigo-300 hover:bg-white/[0.02] transition-colors"
                  >
                    {showAllVideos ? (
                      <>
                        <ChevronUp className="h-4 w-4" /> Listeyi Daralt
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" /> {processedCatalogue.length - 12} Video Daha Göster
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricBox({
  icon,
  title,
  value,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col p-4 rounded-2xl border transition-all",
        accent
          ? "border-indigo-500/40 bg-gradient-to-br from-indigo-500/15 to-purple-600/10 shadow-lg shadow-indigo-500/10"
          : "border-[var(--hub-border)] bg-[var(--hub-surface)]"
      )}
    >
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--hub-text-muted)] mb-1">
        {icon}
        <span>{title}</span>
      </div>
      <p className="text-xl font-black text-white">{value}</p>
      {subtitle && (
        <p className="text-[10px] text-[var(--hub-text-subtle)] mt-0.5 truncate">{subtitle}</p>
      )}
    </div>
  );
}
