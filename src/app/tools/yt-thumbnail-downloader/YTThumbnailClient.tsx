"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, Search, ExternalLink, Image as ImageIcon, Copy, Check } from "lucide-react";
import { parseYouTubeUrl, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ThumbnailItem {
  id: string;
  label: string;
  url: string;
  badge: string;
  width: number;
  height: number;
}

export function YTThumbnailClient() {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<ThumbnailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleExtract = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    let extractedId: string | null = null;

    const parsed = parseYouTubeUrl(trimmed);
    if (parsed.type === "video" && parsed.id) {
      extractedId = parsed.id;
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      extractedId = trimmed;
    }

    if (!extractedId) {
      toast.error(t.ytThumbUrlPlaceholder);
      return;
    }

    setVideoId(extractedId);
    setLoading(true);

    const rawCandidates = [
      {
        id: "maxres",
        label: t.maxRes,
        url: `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`,
        badge: "4K / HD",
      },
      {
        id: "sddefault",
        label: t.highRes,
        url: `https://img.youtube.com/vi/${extractedId}/sddefault.jpg`,
        badge: "720p",
      },
      {
        id: "hqdefault",
        label: "High Quality (480p)",
        url: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
        badge: "HQ",
      },
      {
        id: "mqdefault",
        label: t.mediumRes,
        url: `https://img.youtube.com/vi/${extractedId}/mqdefault.jpg`,
        badge: "MQ",
      },
    ];

    const resolvedItems: ThumbnailItem[] = await Promise.all(
      rawCandidates.map((cand) => {
        return new Promise<ThumbnailItem>((resolve) => {
          const img = document.createElement("img");
          img.onload = () => {
            resolve({
              ...cand,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          };
          img.onerror = () => {
            resolve({
              ...cand,
              width: 0,
              height: 0,
            });
          };
          img.src = cand.url;
        });
      })
    );

    const validItems = resolvedItems.filter((item) => item.width > 120);
    setThumbnails(validItems.length > 0 ? validItems : resolvedItems);
    setLoading(false);
    toast.success(t.downloadSuccessToast);
  };

  const handleDownloadDirect = async (imgUrl: string, qualityId: string) => {
    const toastId = "down-" + qualityId;
    toast.loading(t.analyzing, { id: toastId });

    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `youtube-thumbnail-${videoId}-${qualityId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success(t.downloadSuccessToast, { id: toastId });
    } catch {
      window.open(imgUrl, "_blank");
      toast.success(t.imageOpenedToast, { id: toastId });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to Hub */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] hover:text-white hover:border-rose-500/50 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-rose-400" />
          <span>{t.backToHub}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="mb-8 rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-2xl shadow-xl shadow-rose-500/10">
            <ImageIcon className="h-7 w-7 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              {t.ytThumbTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.ytThumbSub}
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="mb-8">
        <NeonBorder color="#f43f5e" rounded={24} glow={50}>
          <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl">
            <label className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 mb-3">
              <ImageIcon className="h-3.5 w-3.5 text-rose-400" />
              <span>{t.ytThumbUrlLabel}</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                placeholder={t.ytThumbUrlPlaceholder}
                style={{ outline: "none", boxShadow: "none" }}
                className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-3 text-sm text-white placeholder:text-[var(--hub-text-subtle)] focus:border-rose-500/50 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={handleExtract}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-2xl shadow-xl shadow-rose-500/10 hover:bg-rose-500/30 hover:border-rose-400 hover:scale-[1.02] transition-all shrink-0"
              >
                <Search className="h-4 w-4" />
                <span>{loading ? t.analyzing : t.fetchThumbnails}</span>
              </button>
            </div>
          </div>
        </NeonBorder>
      </div>

      {/* Thumbnail Results Grid */}
      {videoId && thumbnails.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {thumbnails.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)] p-4 backdrop-blur-xl overflow-hidden shadow-xl"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 mb-4 border border-white/10">
                <Image
                  src={item.url}
                  alt={item.label}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute top-2 right-2 rounded-md bg-black/85 px-2.5 py-1 text-[10px] font-extrabold text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-sm">
                  {item.badge}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{item.label}</h3>
                  <span className="text-xs font-semibold text-rose-300/80">
                    {item.width && item.height
                      ? `${item.width} x ${item.height} px (${t.realResolution})`
                      : t.defaultResolution}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
                {/* Direct Blob Download */}
                <button
                  type="button"
                  onClick={() => handleDownloadDirect(item.url, item.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/40 px-4 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/30 hover:border-rose-400 transition-all shadow-sm"
                >
                  <Download className="h-4 w-4 text-rose-300" />
                  <span>{t.download}</span>
                </button>

                {/* Open in New Tab */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-3 py-2.5 text-xs font-semibold text-[var(--hub-text-muted)] hover:text-white hover:border-white/20 transition-all"
                  title={t.openNewTab}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.openNewTab}</span>
                </a>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={async () => {
                    await copyToClipboard(item.url);
                    setCopiedUrl(item.id);
                    toast.success(t.copied);
                    setTimeout(() => setCopiedUrl(null), 2000);
                  }}
                  className="rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-2.5 text-[var(--hub-text-muted)] hover:text-white transition-all"
                  title={t.copyLink}
                >
                  {copiedUrl === item.id ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
