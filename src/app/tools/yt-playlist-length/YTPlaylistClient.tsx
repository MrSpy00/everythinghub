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
} from "lucide-react";
import { parseYouTubeUrl, formatDuration, formatDurationAtSpeed, cn, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface VideoInfo {
  videoId: string;
  title: string;
  durationSeconds: number;
  thumbnail: string;
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
  { speed: 1, label: "1×" },
  { speed: 1.25, label: "1.25×" },
  { speed: 1.5, label: "1.5×" },
  { speed: 1.75, label: "1.75×" },
  { speed: 2, label: "2×" },
];

export function YTPlaylistClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlaylistData | null>(null);
  const [customSpeed, setCustomSpeed] = useState("");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setData(null);

    // Parse all URLs (multi-line support)
    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    let playlistId: string | null = null;

    for (const line of lines) {
      const parsed = parseYouTubeUrl(line);
      if (parsed.type === "playlist" && parsed.id) {
        playlistId = parsed.id;
        break;
      }
    }

    if (!playlistId) {
      setError("Geçerli bir YouTube playlist URL'si bulunamadı. Örnek: youtube.com/playlist?list=PLxxxxxx");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/tools/yt-playlist?id=${playlistId}`);
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error || "Playlist alınırken bir hata oluştu");
        return;
      }

      setData(json);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleCopy = async (text: string, id: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      toast.success("Kopyalandı!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadCSV = () => {
    if (!data) return;
    const rows = [
      ["#", "Başlık", "Süre (s)", "Süre", "Video ID", "URL"].join(","),
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
    toast.success("CSV indirildi!");
  };

  const duration = data ? formatDuration(data.totalSeconds) : null;
  const visibleVideos = showAllVideos ? data?.videos : data?.videos.slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--hub-text-muted)] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Hub&apos;a dön
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex items-center gap-4"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/30">
          <PlaySquare className="h-7 w-7 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            YouTube Playlist Analyzer
          </h1>
          <p className="mt-1 text-sm text-[var(--hub-text-muted)]">
            Süre hesapla · Hız analizi · Thumbnail indir
          </p>
        </div>
      </motion.div>

      {/* Input form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)] p-5 sm:p-6"
      >
        <label className="mb-2 block text-sm font-medium text-[var(--hub-text-muted)]">
          YouTube Playlist URL&apos;si
        </label>
        <textarea
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze();
          }}
          placeholder={`Playlist URL'si yapıştır:\nhttps://www.youtube.com/playlist?list=PLxxxxxx\n\nveya birden fazla URL (her satıra bir tane)`}
          rows={3}
          className="mb-4 w-full resize-none rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-3 text-sm text-white placeholder:text-[var(--hub-text-subtle)] transition-all focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Custom speed input */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--hub-text-subtle)]">
              Özel hız:
            </label>
            <input
              type="number"
              placeholder="1.0"
              value={customSpeed}
              onChange={(e) => setCustomSpeed(e.target.value)}
              min="0.25"
              max="4"
              step="0.25"
              className="w-20 rounded-lg border border-[var(--hub-border)] bg-[var(--hub-bg)] px-2.5 py-1.5 text-center text-sm text-white focus:border-red-500/50 focus:outline-none"
            />
            <span className="text-xs text-[var(--hub-text-subtle)]">×</span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analiz ediliyor...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analiz Et
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--hub-text-subtle)]">
          Ctrl+Enter ile hızlı analiz · Gizli olmayan tüm playlist&apos;ler desteklenir
        </p>
      </motion.div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Playlist info */}
            {data.title && (
              <div className="flex items-center justify-between rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-4 py-3">
                <div>
                  <p className="font-semibold text-white">{data.title}</p>
                  {data.channelName && (
                    <p className="text-xs text-[var(--hub-text-muted)]">{data.channelName}</p>
                  )}
                </div>
                <a
                  href={`https://youtube.com/playlist?list=${data.playlistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--hub-text-muted)] hover:text-white"
                >
                  YouTube&apos;da aç <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Video className="h-4 w-4 text-red-400" />}
                label="Toplam Video"
                value={data.totalVideos.toString()}
                color="red"
              />
              <StatCard
                icon={<Clock className="h-4 w-4 text-indigo-400" />}
                label="Toplam Süre"
                value={duration?.short || "—"}
                subtitle={duration?.formatted}
                color="indigo"
              />
              <StatCard
                icon={<Gauge className="h-4 w-4 text-violet-400" />}
                label="Ortalama Video"
                value={
                  data.totalVideos > 0
                    ? formatDuration(Math.floor(data.totalSeconds / data.totalVideos)).short
                    : "—"
                }
                color="violet"
                className="col-span-2 sm:col-span-1"
              />
            </div>

            {/* Speed breakdown */}
            <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)] p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Gauge className="h-4 w-4 text-[var(--hub-text-muted)]" />
                Hız Karşılaştırması
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {SPEED_PRESETS.map(({ speed, label }) => {
                  const timeAtSpeed = formatDurationAtSpeed(data.totalSeconds, speed);
                  const saved = data.totalSeconds - data.totalSeconds / speed;
                  const savedFmt = formatDuration(saved).short;
                  return (
                    <div
                      key={speed}
                      className={cn(
                        "flex flex-col items-center rounded-xl border p-3 transition-colors",
                        speed === 1
                          ? "border-[var(--hub-border)] bg-[var(--hub-bg)]"
                          : "border-[var(--hub-border)] bg-[var(--hub-bg)] hover:border-indigo-500/30"
                      )}
                    >
                      <span className="mb-1 text-sm font-bold text-white">{label}</span>
                      <span className="text-xs font-medium text-indigo-300">{timeAtSpeed}</span>
                      {speed > 1 && (
                        <span className="mt-1 text-[10px] text-emerald-400">
                          -{savedFmt} kazanç
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom speed result */}
              {customSpeed && !isNaN(parseFloat(customSpeed)) && parseFloat(customSpeed) > 0 && (
                <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center">
                  <p className="text-sm text-amber-300">
                    <strong>{customSpeed}× hızda:</strong>{" "}
                    {formatDurationAtSpeed(data.totalSeconds, parseFloat(customSpeed))}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-4 py-2.5 text-sm font-medium text-[var(--hub-text-muted)] transition-all hover:border-white/20 hover:text-white"
              >
                <Download className="h-4 w-4" />
                CSV İndir
              </button>
              <button
                onClick={() => handleCopy(
                  `YouTube Playlist: ${data.title}\nVideoSayısı: ${data.totalVideos}\nToplam Süre: ${duration?.formatted}\n1.5× Hızda: ${formatDurationAtSpeed(data.totalSeconds, 1.5)}\n2× Hızda: ${formatDurationAtSpeed(data.totalSeconds, 2)}`,
                  "summary"
                )}
                className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-4 py-2.5 text-sm font-medium text-[var(--hub-text-muted)] transition-all hover:border-white/20 hover:text-white"
              >
                {copiedId === "summary" ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Özeti Kopyala
              </button>
            </div>

            {/* Video list */}
            {data.videos.length > 0 && (
              <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)] overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--hub-border)] px-5 py-3">
                  <h3 className="text-sm font-semibold text-white">
                    Video Listesi
                    <span className="ml-2 text-xs font-normal text-[var(--hub-text-muted)]">
                      ({data.videos.length} video)
                    </span>
                  </h3>
                </div>

                <div className="divide-y divide-[var(--hub-border)]">
                  {visibleVideos?.map((video, i) => {
                    const dur = formatDuration(video.durationSeconds);
                    return (
                      <motion.div
                        key={video.videoId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]"
                      >
                        <span className="w-6 shrink-0 text-center text-xs text-[var(--hub-text-subtle)]">
                          {i + 1}
                        </span>
                        {/* Thumbnail */}
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          width={64}
                          height={40}
                          className="h-10 w-16 shrink-0 rounded-md object-cover"
                          unoptimized
                        />
                        {/* Title */}
                        <div className="min-w-0 flex-1">
                          <a
                            href={`https://youtu.be/${video.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-sm text-[var(--hub-text-muted)] hover:text-white"
                          >
                            {video.title}
                          </a>
                        </div>
                        {/* Duration */}
                        <span className="shrink-0 text-xs font-mono text-[var(--hub-text-subtle)]">
                          {video.durationSeconds > 0 ? dur.short : "—"}
                        </span>
                        {/* Thumbnail download */}
                        <a
                          href={`https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg p-1.5 text-[var(--hub-text-subtle)] transition-colors hover:bg-white/5 hover:text-white"
                          title="Max Res Thumbnail İndir"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </motion.div>
                    );
                  })}
                </div>

                {data.videos.length > 10 && (
                  <button
                    onClick={() => setShowAllVideos(!showAllVideos)}
                    className="flex w-full items-center justify-center gap-2 border-t border-[var(--hub-border)] px-5 py-3 text-sm text-[var(--hub-text-muted)] transition-colors hover:bg-white/[0.02] hover:text-white"
                  >
                    {showAllVideos ? (
                      <>
                        <ChevronUp className="h-4 w-4" /> Daha az göster
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" /> {data.videos.length - 10} video daha göster
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Fallback warning */}
            {data.fallback && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-xs text-amber-300">
                  ⚠️ Süre bilgisi alınamadı — YouTube API geçici olarak kısıtlı olabilir. Video başlıkları mevcut ama süreler hesaplanamadı.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: "red" | "indigo" | "violet";
  className?: string;
}) {
  const colorMap = {
    red: "border-red-500/20 bg-red-500/5",
    indigo: "border-indigo-500/20 bg-indigo-500/5",
    violet: "border-violet-500/20 bg-violet-500/5",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-4",
        colorMap[color],
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs text-[var(--hub-text-muted)]">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-[var(--hub-text-subtle)]">{subtitle}</p>
      )}
    </div>
  );
}
