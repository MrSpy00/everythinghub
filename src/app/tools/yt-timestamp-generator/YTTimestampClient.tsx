"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { parseYouTubeUrl, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function YTTimestampClient() {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [minutes, setMinutes] = useState("1");
  const [seconds, setSeconds] = useState("30");
  const [copied, setCopied] = useState(false);

  const parsed = parseYouTubeUrl(url.trim());
  const videoId = parsed.type === "video" ? parsed.id : null;

  const totalSec = (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
  const generatedUrl = videoId
    ? `https://youtu.be/${videoId}?t=${totalSec}`
    : url.trim()
    ? `${url.trim()}${url.includes("?") ? "&" : "?"}t=${totalSec}`
    : "";

  const handleCopy = async () => {
    if (!generatedUrl) return;
    const ok = await copyToClipboard(generatedUrl);
    if (ok) {
      setCopied(true);
      toast.success(t.copied);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] hover:text-white hover:border-indigo-500/50 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
          <span>{t.backToHub}</span>
        </Link>
      </div>

      <div className="mb-8 rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-500/30 bg-pink-500/10 backdrop-blur-2xl shadow-xl shadow-pink-500/10">
            <Clock className="h-7 w-7 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              {t.ytTimestampTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.ytTimestampSub}
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#fb7185" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              <span>{t.ytThumbUrlLabel}</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-3 text-sm text-white focus:border-pink-500/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--hub-text-muted)] mb-1 block">
                {t.minutesLabel} (m)
              </label>
              <input
                type="number"
                min="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-2.5 text-sm text-white focus:border-pink-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--hub-text-muted)] mb-1 block">
                {t.secondsLabel} (s)
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] px-4 py-2.5 text-sm text-white focus:border-pink-500/50 focus:outline-none"
              />
            </div>
          </div>

          {generatedUrl && (
            <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 space-y-3">
              <span className="text-xs font-bold text-pink-300 uppercase tracking-wider block">
                {t.generatedTimestampUrl}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="w-full rounded-lg border border-[var(--hub-border)] bg-black/40 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-pink-500 px-4 py-2 text-xs font-bold text-white hover:bg-pink-600 transition-all shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? t.copied : t.copy}</span>
                </button>
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[var(--hub-border)] bg-[var(--hub-bg)] p-2 text-white hover:bg-white/10 transition-all"
                  title={t.openNewTab}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </NeonBorder>
    </div>
  );
}
