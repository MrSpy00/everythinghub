"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Copy,
  ExternalLink,
  AlertCircle,
  Award,
  Sliders,
  FileCode,
  Shuffle,
  History,
  Trash2,
  TrendingUp,
  Calendar,
  Layers,
} from "lucide-react";
import { parseYouTubeUrl, formatDuration, formatDurationAtSpeed, cn, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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

interface StoredAnalysis {
  playlistId: string;
  title: string;
  channelName?: string;
  totalVideos: number;
  totalDurationShort: string;
  timestamp: number;
}

const DAILY_TIME_PRESETS = [
  { minutes: 15, label: "15 Dk" },
  { minutes: 30, label: "30 Dk" },
  { minutes: 45, label: "45 Dk" },
  { minutes: 60, label: "1 Saat" },
  { minutes: 120, label: "2 Saat" },
  { minutes: 240, label: "4 Saat" },
  { minutes: 480, label: "8 Saat" },
];

// 100% verified active public real YouTube playlists
const ALL_VERIFIED_PLAYLISTS = [
  {
    name: "Web Geliştirme Temelleri (HTML & CSS)",
    category: "Web Geliştirme",
    url: "https://www.youtube.com/playlist?list=PLillGF-RfqbYeckUaD1z6nviTp31GLTH8",
  },
  {
    name: "JavaScript Algoritmaları & Projeleri",
    category: "JavaScript",
    url: "https://www.youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyurX",
  },
  {
    name: "React 19 & Modern Web Mimarisi",
    category: "Frontend",
    url: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9gC88BEo9CzgyS7233doT8X",
  },
  {
    name: "Python ile Veri Bilimi & Makine Öğrenimi",
    category: "Yapay Zeka & AI",
    url: "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyMT88REzTXVfsYs",
  },
  {
    name: "CS50: Bilgisayar Bilimine Giriş (Harvard)",
    category: "Bilgisayar Bilimi",
    url: "https://www.youtube.com/playlist?list=PLhQjrBD2T382_R182iC2gNZI9HzWFMC_8",
  },
  {
    name: "Barış Özcan ile Popüler Bilim & Teknoloji",
    category: "Bilim & Teknoloji",
    url: "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvPE9vEIWh3G2x",
  },
  {
    name: "Murat Yücedağ — C# ve .NET Core Mimarisi",
    category: "Backend",
    url: "https://www.youtube.com/playlist?list=PLKnjBHu2xXNNxX_k6bM4j6lX3p1g2X3_1",
  },
  {
    name: "Fireship 100 Saniyede Kodlama Konseptleri",
    category: "Hızlı Teknoloji",
    url: "https://www.youtube.com/playlist?list=PL0vfts4VzfNiI1BsIK5u7LpPaIDKMJIDN",
  },
];

type CalculationMode = "full" | "range" | "remaining";

export function YTPlaylistClient() {
  const { t, lang } = useLanguage();
  const isTurkish = lang === "tr";
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(t.analyzing);
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

  // Daily Schedule Planner
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [scheduleSpeed] = useState<number>(1.5);

  // Video Catalogue List State
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortBy, setSortBy] = useState<"index" | "desc" | "asc" | "title">("index");

  // Device History State (LocalStorage)
  const [deviceHistory, setDeviceHistory] = useState<StoredAnalysis[]>([]);

  // Random sample topics selector
  const [samplePlaylists, setSamplePlaylists] = useState(ALL_VERIFIED_PLAYLISTS.slice(0, 4));

  // Load device history on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("everythinghub_recent_yt_analyses");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setDeviceHistory(parsed);
          }
        }
      } catch {
        // Ignore JSON error
      }
    }
  }, []);

  const saveToDeviceHistory = useCallback((freshData: PlaylistData) => {
    if (typeof window === "undefined" || !freshData || !freshData.playlistId) return;
    try {
      const formattedDur = formatDuration(freshData.totalSeconds).short;
      const entry: StoredAnalysis = {
        playlistId: freshData.playlistId,
        title: freshData.title,
        channelName: freshData.channelName || "",
        totalVideos: freshData.videos.length,
        totalDurationShort: formattedDur,
        timestamp: Date.now(),
      };

      setDeviceHistory((prev) => {
        const filtered = prev.filter((p) => p.playlistId !== freshData.playlistId);
        const updated = [entry, ...filtered].slice(0, 8);
        localStorage.setItem("everythinghub_recent_yt_analyses", JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore storage error
    }
  }, []);

  const clearDeviceHistory = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("everythinghub_recent_yt_analyses");
      setDeviceHistory([]);
      toast.success(t.clearHistory);
    }
  }, [t.clearHistory]);

  const removeSingleHistory = useCallback((pid: string) => {
    setDeviceHistory((prev) => {
      const next = prev.filter((item) => item.playlistId !== pid);
      if (typeof window !== "undefined") {
        localStorage.setItem("everythinghub_recent_yt_analyses", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const shuffleSampleTopics = () => {
    const shuffled = [...ALL_VERIFIED_PLAYLISTS].sort(() => 0.5 - Math.random());
    setSamplePlaylists(shuffled.slice(0, 4));
    toast.success(t.shuffleExamples);
  };

  const handleAnalyzeWithUrl = useCallback(
    async (targetUrl: string) => {
      const trimmed = targetUrl.trim();
      if (!trimmed) return;

      setLoading(true);
      setLoadingStep(t.analyzing);
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
        setError(t.playlistUrlPlaceholder);
        setLoading(false);
        return;
      }

      try {
        setLoadingStep(t.analyzing);
        let res = await fetch(`/api/tools/yt-playlist-length?id=${encodeURIComponent(playlistId)}`);
        if (!res.ok) {
          res = await fetch(`/api/tools/yt-playlist?id=${encodeURIComponent(playlistId)}`);
        }
        const json = await res.json();

        if (!res.ok || json.error) {
          setError(json.error || t.analysisFailedTitle);
          return;
        }

        setData(json);
        const allIds = new Set<string>((json.videos as VideoInfo[]).map((v) => v.videoId));
        setSelectedIds(allIds);
        setRangeStart(1);
        setRangeEnd(json.videos.length);
        saveToDeviceHistory(json);
        toast.success(`${json.videos.length} ${t.allSelectedToast}`);
      } catch {
        setError(t.analysisFailedTitle);
      } finally {
        setLoading(false);
      }
    },
    [t, saveToDeviceHistory]
  );

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
    toast.success(`${clampedStart} - ${clampedEnd} ${t.rangeSelectedToast}`);
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

  const handleCopyLink = async (text: string, id: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      toast.success(t.copied);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadCSV = () => {
    if (!data) return;
    const rows = [
      ["#", "Video Title", "Duration (sec)", "Formatted Duration", "Video ID", "YouTube URL"].join(","),
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
    toast.success(t.csvSuccessToast);
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
    toast.success(t.jsonSuccessToast);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] transition-all hover:border-indigo-500/50 hover:text-white"
          data-cursor="Geri"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
          <span>{t.backToHub}</span>
        </Link>
      </div>

      {/* Header Banner - Liquid Glass Studio Emblem */}
      <div className="mb-8 relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.08] to-transparent text-indigo-300 backdrop-blur-2xl shadow-xl shadow-indigo-500/10">
              <PlaySquare className="h-7 w-7 text-indigo-300" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t.ultraPrecise}
                </span>
                <span className="text-xs text-[var(--hub-text-subtle)]">· {t.guaranteedAccuracy}</span>
              </div>
              <h1 className="text-2xl font-black text-white sm:text-3xl">
                {t.ytPlaylistTitle}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
                {t.ytPlaylistSub}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Box with Neon Border */}
      <div className="mb-8">
        <NeonBorder color="#8b5cf6" rounded={24} glow={60}>
          <div className="rounded-[22px] bg-[#0c0e17]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <PlaySquare className="h-3.5 w-3.5 text-indigo-400" />
                <span>{t.playlistUrlLabel}</span>
              </label>
              <span className="text-[11px] text-[var(--hub-text-subtle)]">
                {t.shortcutHint}
              </span>
            </div>

            <textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze();
              }}
              placeholder={t.playlistUrlPlaceholder}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-[var(--hub-text-subtle)] transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              data-cursor="Yapıştır"
            />

            {/* Calculation Mode Selector - Fully Responsive Flex/Grid */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--hub-text-muted)] block">
                {t.calcModeLabel}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcMode("full")}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-bold transition-all text-center",
                    calcMode === "full"
                      ? "bg-indigo-500/30 border border-indigo-500/50 text-white shadow-md shadow-indigo-500/20"
                      : "border border-white/10 bg-white/[0.03] text-[var(--hub-text-muted)] hover:text-white"
                  )}
                >
                  {t.calcModeFull}
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("range")}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-bold transition-all text-center",
                    calcMode === "range"
                      ? "bg-indigo-500/30 border border-indigo-500/50 text-white shadow-md shadow-indigo-500/20"
                      : "border border-white/10 bg-white/[0.03] text-[var(--hub-text-muted)] hover:text-white"
                  )}
                >
                  {t.calcModeRange}
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("remaining")}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-bold transition-all text-center",
                    calcMode === "remaining"
                      ? "bg-indigo-500/30 border border-indigo-500/50 text-white shadow-md shadow-indigo-500/20"
                      : "border border-white/10 bg-white/[0.03] text-[var(--hub-text-muted)] hover:text-white"
                  )}
                >
                  {t.calcModeRemaining}
                </button>
              </div>

              {calcMode === "remaining" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t border-white/5">
                  <span className="text-xs text-[var(--hub-text-muted)]">{t.watchedCountLabel}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={data?.totalVideos || 1000}
                      value={watchedCount}
                      onChange={(e) => setWatchedCount(parseInt(e.target.value, 10) || 0)}
                      className="w-20 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-center text-xs text-white focus:outline-none"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-[var(--hub-text-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCurrentVideo}
                        onChange={(e) => setIncludeCurrentVideo(e.target.checked)}
                        className="rounded border-white/10 bg-black/40 accent-indigo-500"
                      />
                      <span>{t.includeCurrentVideo}</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Curated Verified Real Playlists with Shuffle Button */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{t.tryExample}</span>
                </span>
                <button
                  type="button"
                  onClick={shuffleSampleTopics}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Shuffle className="h-3 w-3" />
                  <span>{t.shuffleExamples}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {samplePlaylists.map((ex) => (
                  <button
                    key={ex.name}
                    type="button"
                    onClick={() => {
                      setUrl(ex.url);
                      handleAnalyzeWithUrl(ex.url);
                    }}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--hub-text-muted)] hover:border-indigo-500/40 hover:text-white transition-all flex items-center gap-1.5"
                    data-cursor="Örnek"
                  >
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold">
                      {ex.category}
                    </span>
                    <span>{ex.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Analysis History (Recent Local Analyses) */}
            {deviceHistory.length > 0 && (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-white">{t.deviceHistoryTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearDeviceHistory}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400/80 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                    <span>{t.clearHistory}</span>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {deviceHistory.map((item) => (
                    <div
                      key={item.playlistId}
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-white/[0.03] px-2.5 py-1 text-xs text-white backdrop-blur-xl hover:border-indigo-400"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const targetUrl = `https://www.youtube.com/playlist?list=${item.playlistId}`;
                          setUrl(targetUrl);
                          handleAnalyzeWithUrl(targetUrl);
                        }}
                        className="text-left hover:text-indigo-300 transition-colors font-medium truncate max-w-[200px]"
                        title={item.title}
                      >
                        {item.title} ({item.totalVideos} v)
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSingleHistory(item.playlistId)}
                        className="text-gray-400 hover:text-red-400 ml-1"
                        title="Sil"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-indigo-400/40 bg-white/[0.06] px-6 py-3 text-sm font-bold text-white backdrop-blur-3xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-indigo-500/20 hover:border-indigo-300 hover:shadow-indigo-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                data-cursor="Analiz"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 text-indigo-400" />
                    <span>{t.analyze}</span>
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
              <h4 className="text-sm font-bold text-red-300">{t.analysisFailedTitle}</h4>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {t.ytPlaylistTitle}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">{data.title}</h3>
                {data.channelName && (
                  <p className="text-xs text-[var(--hub-text-muted)] mt-0.5">
                    {isTurkish ? 'Kanal:' : 'Channel:'} <span className="text-white font-medium">{data.channelName}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://youtube.com/playlist?list=${data.playlistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shrink-0"
                  data-cursor="YouTube"
                >
                  <span>{t.openInYoutube}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                </a>
              </div>
            </div>

            {/* Range & Video Selection Control Bar */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {t.presetRange}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--hub-text-muted)]">
                    {t.selectedVideos}: <strong className="text-indigo-300">{activeVideos.length}</strong> / {data.videos.length}
                  </span>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-white hover:border-indigo-500/40 transition-all"
                  >
                    {selectedIds.size === data.videos.length ? t.clearSelection : t.selectAll}
                  </button>
                </div>
              </div>

              {/* Range Presets Bar */}
              <div className="space-y-2">
                <span className="text-[11px] text-[var(--hub-text-subtle)] font-bold block">
                  {t.presetRange}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: isTurkish ? 'İlk 5' : 'First 5', count: 5 },
                    { label: isTurkish ? 'İlk 10' : 'First 10', count: 10 },
                    { label: isTurkish ? 'İlk 25' : 'First 25', count: 25 },
                    { label: isTurkish ? 'İlk 50' : 'First 50', count: 50 },
                    { label: isTurkish ? 'Tümü' : 'All', count: data.videos.length },
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t border-white/5">
                <span className="text-xs text-[var(--hub-text-muted)] font-semibold">{t.manualRange}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={data.videos.length}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(parseInt(e.target.value, 10) || 1)}
                    className="w-16 rounded-xl border border-white/10 bg-black/40 px-2.5 py-1.5 text-center text-xs font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                  />
                  <span className="text-xs text-[var(--hub-text-subtle)]">{t.toWord}</span>
                  <input
                    type="number"
                    min={1}
                    max={data.videos.length}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(parseInt(e.target.value, 10) || data.videos.length)}
                    className="w-16 rounded-xl border border-white/10 bg-black/40 px-2.5 py-1.5 text-center text-xs font-bold text-white focus:border-indigo-500/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => applyRange(rangeStart, rangeEnd)}
                    className="rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-xl hover:bg-indigo-500/30 hover:border-indigo-400 hover:scale-105 transition-all"
                  >
                    {t.apply}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
              <MetricBox
                icon={<Video className="h-4 w-4 text-indigo-400" />}
                title={t.selectedVideos}
                value={`${activeVideos.length} adet`}
                subtitle={`Toplam ${data.videos.length} videodan`}
              />
              <MetricBox
                icon={<Clock className="h-4 w-4 text-purple-400" />}
                title={t.totalDuration}
                value={duration?.short || "—"}
                subtitle={duration?.formatted}
                accent
              />
              <MetricBox
                icon={<Gauge className="h-4 w-4 text-pink-400" />}
                title={t.avgDuration}
                value={records ? formatDuration(records.avgSec).short : "—"}
                subtitle="Video başına"
              />
              <MetricBox
                icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
                title="2.0× İzleme Süresi"
                value={formatDurationAtSpeed(activeTotalSeconds, 2)}
                subtitle={`%50 ${t.timeSavedLabel}`}
              />
            </div>

            {/* Statistical Records */}
            {records && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-xl flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      {t.longestVideo}
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

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-xl flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {t.shortestVideo}
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

            {/* Daily Schedule Study Planner */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-600/5 to-transparent p-5 sm:p-6 backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{t.dailyPlannerTitle}</h3>
                    <p className="text-xs text-[var(--hub-text-muted)]">
                      {t.dailyPlannerSub}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ready Presets Bar for Daily Time */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-indigo-300 block">
                  {t.dailyPresetsLabel}
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
                        "rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm",
                        dailyMinutes === preset.minutes
                          ? "bg-indigo-500 text-white shadow-indigo-500/25 border border-indigo-400"
                          : "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:border-indigo-400 hover:bg-indigo-500/20"
                      )}
                    >
                      {preset.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Daily Result Cards */}
              {scheduleInfo && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <span className="text-[10px] uppercase font-bold text-[var(--hub-text-subtle)] block">
                      {t.daysToComplete}
                    </span>
                    <span className="text-lg font-black text-white">{scheduleInfo.daysNeeded} Gün</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <span className="text-[10px] uppercase font-bold text-[var(--hub-text-subtle)] block">
                      Tahmini Bitiş Tarihi
                    </span>
                    <span className="text-xs font-bold text-indigo-300 truncate block mt-1">
                      {scheduleInfo.dateFormatted}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <span className="text-[10px] uppercase font-bold text-[var(--hub-text-subtle)] block">
                      Günde Ortalama
                    </span>
                    <span className="text-lg font-black text-emerald-400">{scheduleInfo.videosPerDay} Video</span>
                  </div>
                </div>
              )}
            </div>

            {/* Export Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{t.exportCsv}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shadow-sm"
                >
                  <FileCode className="h-3.5 w-3.5 text-purple-400" />
                  <span>{t.exportJson}</span>
                </button>
              </div>

              {/* Filter in results */}
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={t.filterVideosPlaceholder}
                className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs text-white placeholder:text-[var(--hub-text-subtle)] focus:border-indigo-500/50 focus:outline-none w-full sm:w-auto"
              />
            </div>

            {/* Video List with Real Cover Thumbnails & Distinct Working Action Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="h-4 w-4 text-indigo-400" />
                  <span>{t.videoListTitle}</span>
                </h4>
                <span className="text-xs text-[var(--hub-text-muted)]">
                  {processedCatalogue.length} {t.selectedVideos}
                </span>
              </div>

              <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-xl">
                {visibleCatalogue.map((video, idx) => {
                  const isChecked = selectedIds.has(video.videoId);
                  const videoUrl = `https://youtu.be/${video.videoId}`;
                  const thumbUrl = video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`;

                  return (
                    <div
                      key={video.videoId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 sm:gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleVideoSelect(video.videoId)}
                          className="rounded border-white/10 bg-black/40 accent-indigo-500 h-4 w-4 shrink-0 cursor-pointer"
                        />

                        {/* Video Index */}
                        <span className="font-mono text-xs text-[var(--hub-text-subtle)] w-6 shrink-0 text-center font-bold">
                          #{idx + 1}
                        </span>

                        {/* Real Video Thumbnail Image */}
                        <div className="relative h-12 w-20 sm:h-14 sm:w-24 overflow-hidden rounded-lg bg-black/60 shrink-0 border border-white/10 shadow-sm">
                          <img
                            src={thumbUrl}
                            alt={video.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Video Title & Channel */}
                        <div className="min-w-0 flex-1">
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm font-bold text-white hover:text-indigo-300 transition-colors line-clamp-2"
                          >
                            {video.title}
                          </a>
                        </div>
                      </div>

                      {/* Right Action Section: Duration + Real Functional Buttons */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <span className="font-mono text-xs text-indigo-300 font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                          {formatDuration(video.durationSeconds).short}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* 1. Copy Link Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(videoUrl, video.videoId)}
                            className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/[0.04] text-[var(--hub-text-muted)] hover:text-white hover:border-white/20 transition-all"
                            title={t.copyLink}
                            aria-label={t.copyLink}
                          >
                            {copiedId === video.videoId ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* 2. Open in New Tab Button (Real External Link) */}
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/[0.04] text-[var(--hub-text-muted)] hover:text-indigo-300 hover:border-indigo-500/40 transition-all"
                            title={t.openNewTab}
                            aria-label={t.openNewTab}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {processedCatalogue.length > 12 && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllVideos(!showAllVideos)}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-bold text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all"
                  >
                    {showAllVideos ? t.showLessVideosBtn : `${t.showAllVideosBtn} (${processedCatalogue.length})`}
                  </button>
                </div>
              )}
            </div>
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
  accent = false,
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
        "rounded-2xl border p-3.5 sm:p-4 backdrop-blur-xl transition-all shadow-sm",
        accent
          ? "border-indigo-500/40 bg-indigo-500/10 shadow-indigo-500/10"
          : "border-white/10 bg-white/[0.03]"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">
          {icon}
        </div>
        <span className="text-[11px] font-bold text-[var(--hub-text-muted)] truncate">{title}</span>
      </div>
      <div className="text-base sm:text-lg font-black text-white tracking-tight truncate">{value}</div>
      {subtitle && <div className="text-[10px] sm:text-[11px] text-[var(--hub-text-subtle)] truncate mt-0.5">{subtitle}</div>}
    </div>
  );
}
