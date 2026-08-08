"use client";

import { useState, useCallback } from "react";
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
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Sparkles,
  BarChart3,
  Layers,
  TrendingUp,
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
  { speed: 1, label: "1.0× Standart" },
  { speed: 1.25, label: "1.25× Hızlı" },
  { speed: 1.5, label: "1.5× Akıcı" },
  { speed: 1.75, label: "1.75× Seri" },
  { speed: 2, label: "2.0× Çift Hız" },
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

export function YTPlaylistClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlaylistData | null>(null);
  const [customSpeed, setCustomSpeed] = useState("");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const handleAnalyzeWithUrl = useCallback(async (targetUrl: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;

    setLoading(true);
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
      // If user typed raw playlist ID (starts with PL, UU, RD, OLAK)
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
      toast.success("Oynatma listesi başarıyla analiz edildi!");
    } catch {
      setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnalyze = () => handleAnalyzeWithUrl(url);

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
      ...data.videos.map((v, i) => {
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
    toast.success("CSV dosyası indirildi!");
  };

  const duration = data ? formatDuration(data.totalSeconds) : null;

  const filteredVideos = data?.videos.filter((v) =>
    filterQuery ? v.title.toLowerCase().includes(filterQuery.toLowerCase()) : true
  );

  const visibleVideos = showAllVideos
    ? filteredVideos
    : filteredVideos?.slice(0, 12);

  // Duration distribution stats
  const shortCount = data?.videos.filter((v) => v.durationSeconds > 0 && v.durationSeconds < 300).length || 0;
  const midCount = data?.videos.filter((v) => v.durationSeconds >= 300 && v.durationSeconds < 1200).length || 0;
  const longCount = data?.videos.filter((v) => v.durationSeconds >= 1200).length || 0;

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
                  Stüdyo Sürümü
                </span>
                <span className="text-xs text-[var(--hub-text-subtle)]">· Hızlı & Limitsiz</span>
              </div>
              <h1 className="text-2xl font-black text-white sm:text-3xl">
                YouTube Playlist Analyzer
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
                Oynatma listesi süresi hesapla, farklı oynatma hızlarını simüle et, HD thumbnail ve CSV dışa aktar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Box with Neon Border */}
      <div className="mb-8">
        <NeonBorder color="#8b5cf6" rounded={24} glow={70}>
          <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>YouTube Playlist URL veya ID</span>
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
              placeholder="https://www.youtube.com/playlist?list=PLxxxxxx bağlantısını buraya yapıştırın..."
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-3 text-sm text-white placeholder:text-[var(--hub-text-subtle)] transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 mb-4"
              data-cursor="Yapıştır"
            />

            {/* Presets & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Quick sample chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[var(--hub-text-subtle)] mr-1">Örnekler:</span>
                {EXAMPLE_PLAYLISTS.map((ex) => (
                  <button
                    key={ex.name}
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

              {/* Main Submit Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                data-cursor="Analiz"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Ayrıştırılıyor...</span>
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
            {/* Playlist Info Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/90 p-5 backdrop-blur-xl">
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

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricBox
                icon={<Video className="h-4 w-4 text-indigo-400" />}
                title="Toplam Video"
                value={`${data.totalVideos} adet`}
                subtitle="Listedeki içerik"
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
                  data.totalVideos > 0
                    ? formatDuration(Math.floor(data.totalSeconds / data.totalVideos)).short
                    : "—"
                }
                subtitle="Video başına"
              />
              <MetricBox
                icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
                title="2.0× İzleme Süresi"
                value={formatDurationAtSpeed(data.totalSeconds, 2)}
                subtitle={`%50 zaman tasarrufu`}
              />
            </div>

            {/* Video Length Breakdown Progress */}
            {data.totalVideos > 0 && (
              <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Süre Dağılım Analizi</span>
                  </span>
                  <span className="text-xs text-[var(--hub-text-muted)]">
                    Kısa (&lt;5dk), Orta (5-20dk), Uzun (&gt;20dk)
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex gap-1 p-0.5">
                  <div
                    style={{ width: `${(shortCount / data.totalVideos) * 100}%` }}
                    className="h-full rounded-full bg-emerald-500"
                    title={`Kısa Videolar: ${shortCount}`}
                  />
                  <div
                    style={{ width: `${(midCount / data.totalVideos) * 100}%` }}
                    className="h-full rounded-full bg-indigo-500"
                    title={`Orta Videolar: ${midCount}`}
                  />
                  <div
                    style={{ width: `${(longCount / data.totalVideos) * 100}%` }}
                    className="h-full rounded-full bg-purple-500"
                    title={`Uzun Videolar: ${longCount}`}
                  />
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] text-[var(--hub-text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Kısa: {shortCount}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" /> Orta: {midCount}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500" /> Uzun: {longCount}
                  </span>
                </div>
              </div>
            )}

            {/* Speed Simulation Matrix */}
            <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-indigo-400" />
                  <span>Oynatma Hızına Göre Bitiş Süreleri</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-4">
                {SPEED_PRESETS.map(({ speed, label }) => {
                  const timeAtSpeed = formatDurationAtSpeed(data.totalSeconds, speed);
                  const saved = data.totalSeconds - data.totalSeconds / speed;
                  const savedFmt = formatDuration(saved).short;
                  return (
                    <div
                      key={speed}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all",
                        speed === 1
                          ? "border-[var(--hub-border)] bg-[var(--hub-bg)]"
                          : "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/60"
                      )}
                    >
                      <span className="text-xs font-bold text-white mb-1">{label}</span>
                      <span className="text-base font-black text-indigo-300">{timeAtSpeed}</span>
                      {speed > 1 && (
                        <span className="mt-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          -{savedFmt} kazanç
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom speed calculator */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--hub-border)] pt-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[var(--hub-text-muted)]">
                    Özel oynatma hızı simülatörü:
                  </label>
                  <input
                    type="number"
                    placeholder="1.35"
                    value={customSpeed}
                    onChange={(e) => setCustomSpeed(e.target.value)}
                    min="0.25"
                    max="4"
                    step="0.05"
                    className="w-20 rounded-lg border border-[var(--hub-border)] bg-[var(--hub-bg)] px-2.5 py-1 text-center text-xs text-white focus:border-indigo-500/50 focus:outline-none"
                  />
                  <span className="text-xs text-[var(--hub-text-subtle)]">×</span>
                </div>

                {customSpeed && !isNaN(parseFloat(customSpeed)) && parseFloat(customSpeed) > 0 && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                    {customSpeed}× Hızda Süre:{" "}
                    <strong>{formatDurationAtSpeed(data.totalSeconds, parseFloat(customSpeed))}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Export and Copy Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
                data-cursor="CSV İndir"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                <span>CSV Tablosu Olarak İndir</span>
              </button>

              <button
                onClick={() =>
                  handleCopy(
                    `YouTube Playlist: ${data.title}\nKanal: ${data.channelName || "—"}\nToplam Video: ${data.totalVideos}\nToplam Süre: ${duration?.formatted}\n1.5× Hızda: ${formatDurationAtSpeed(data.totalSeconds, 1.5)}\n2.0× Hızda: ${formatDurationAtSpeed(data.totalSeconds, 2)}`,
                    "summary"
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
                data-cursor="Kopyala"
              >
                {copiedId === "summary" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-indigo-400" />
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
                        {filteredVideos?.length} video
                      </span>
                    </h3>
                  </div>

                  {/* Filter inside table */}
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--hub-text-subtle)]" />
                    <input
                      type="text"
                      placeholder="Videolarda filtrele..."
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      className="w-full rounded-lg border border-[var(--hub-border)] bg-[var(--hub-bg)] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-[var(--hub-text-subtle)] focus:border-indigo-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="divide-y divide-[var(--hub-border)]">
                  {visibleVideos?.map((video, i) => {
                    const dur = formatDuration(video.durationSeconds);
                    return (
                      <div
                        key={video.videoId}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                      >
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

                {filteredVideos && filteredVideos.length > 12 && (
                  <button
                    onClick={() => setShowAllVideos(!showAllVideos)}
                    className="flex w-full items-center justify-center gap-2 border-t border-[var(--hub-border)] px-5 py-3 text-xs font-bold text-indigo-300 hover:bg-white/[0.02] transition-colors"
                  >
                    {showAllVideos ? (
                      <>
                        <ChevronUp className="h-4 w-4" /> Listeyi Daralt
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" /> {filteredVideos.length - 12} Video Daha Göster
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
