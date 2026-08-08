"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, Search, Sparkles, ExternalLink, Image as ImageIcon } from "lucide-react";
import { parseYouTubeUrl, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";

export function YTThumbnailClient() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleExtract = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const parsed = parseYouTubeUrl(trimmed);
    if (parsed.type === "video" && parsed.id) {
      setVideoId(parsed.id);
      toast.success("Kapak görselleri yüklendi!");
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      setVideoId(trimmed);
      toast.success("Kapak görselleri yüklendi!");
    } else {
      toast.error("Geçerli bir YouTube video bağlantısı veya ID giriniz.");
    }
  };

  const qualities = videoId
    ? [
        {
          label: "Maximum HD (1080p/4K)",
          res: "1920x1080",
          url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          badge: "Ultra HD",
        },
        {
          label: "High Quality (720p)",
          res: "1280x720",
          url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
          badge: "HD",
        },
        {
          label: "Standard Quality",
          res: "640x480",
          url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          badge: "HQ",
        },
        {
          label: "Medium Quality",
          res: "320x180",
          url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          badge: "SD",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] hover:text-white hover:border-indigo-500/50 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
          <span>Hub Menüsüne Dön</span>
        </Link>
      </div>

      <div className="mb-8 rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
            <ImageIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              YouTube Thumbnail İndirici
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              YouTube video kapak görsellerini HD, 1080p ve 4K çözünürlüklerde anında indir veya kopyala.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <NeonBorder color="#f43f5e" rounded={24} glow={60}>
          <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl">
            <label className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              <span>YouTube Video Bağlantısı veya Video ID</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ..."
                className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-3 text-sm text-white placeholder:text-[var(--hub-text-subtle)] focus:border-rose-500/50 focus:outline-none"
              />
              <button
                onClick={handleExtract}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-[1.02] transition-all shrink-0"
              >
                <Search className="h-4 w-4" />
                <span>Görselleri Getir</span>
              </button>
            </div>
          </div>
        </NeonBorder>
      </div>

      {videoId && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {qualities.map((q, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)] p-4 backdrop-blur-xl overflow-hidden"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 mb-4 border border-white/10">
                <Image
                  src={q.url}
                  alt={q.label}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute top-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-extrabold text-rose-400 border border-rose-500/30 backdrop-blur-md">
                  {q.badge}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{q.label}</h3>
                  <span className="text-xs text-[var(--hub-text-subtle)]">{q.res}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`thumbnail-${videoId}.jpg`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>İndir</span>
                </a>
                <button
                  onClick={async () => {
                    await copyToClipboard(q.url);
                    toast.success("Resim bağlantısı kopyalandı!");
                  }}
                  className="rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-2 text-[var(--hub-text-muted)] hover:text-white transition-all"
                  title="URL Kopyala"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
