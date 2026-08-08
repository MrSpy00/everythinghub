"use client";

import React, { useState } from "react";
import { Download, ExternalLink, Image as ImageIcon, Palette, Check, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface SpotifyCoverStudioProps {
  coverUrl: string;
  title: string;
  ownerName: string;
  dominantColor?: string;
  isTurkish?: boolean;
}

export function SpotifyCoverStudio({
  coverUrl,
  title,
  ownerName,
  dominantColor = "#10b981",
  isTurkish = true,
}: SpotifyCoverStudioProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    copyToClipboard(coverUrl);
    setCopied(true);
    toast.success(isTurkish ? "Kapak resmi bağlantısı kopyalandı!" : "Cover artwork URL copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCover = () => {
    const a = document.createElement("a");
    a.href = coverUrl;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_cover_640x640.jpg`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(isTurkish ? "HD Kapak indiriliyor!" : "Downloading HD Cover!");
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 backdrop-blur-xl">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isTurkish ? "Yüksek Çözünürlüklü Kapak Stüdyosu" : "High-Resolution Artwork Studio"}
            </h3>
            <p className="text-xs text-white/60">
              {isTurkish ? "Trackmeld & SpaceMedia standartlarında 640x640 HD kapak indirici" : "Trackmeld style HD 640x640 cover extraction and palette swatches"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Cover Image + Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Cover Preview Card */}
        <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-square max-w-[360px] mx-auto w-full">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-black/60 px-3 py-1.5 rounded-xl border border-white/20">
              640 x 640 px (High-Res CDN)
            </span>
          </div>
        </div>

        {/* Options & Swatches */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isTurkish ? "Çalma Listesi Kapağı" : "Playlist Artwork"}
            </span>
            <h4 className="text-2xl font-black text-white">{title}</h4>
            <p className="text-sm text-white/60">
              {isTurkish ? "Küratör:" : "Curator:"} <span className="text-white font-medium">{ownerName}</span>
            </p>
          </div>

          {/* Color Palette Swatch */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>{isTurkish ? "Baskın Tema Rengi" : "Dominant Color Swatch"}</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="w-8 h-8 rounded-xl border border-white/20 shadow-md" style={{ backgroundColor: dominantColor }} />
              <span className="font-mono text-sm font-bold text-white/90">{dominantColor}</span>
            </div>
          </div>

          {/* Action Buttons (Strictly respecting liquid glass rules - NO cheap gradients!) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadCover}
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold backdrop-blur-xl hover:border-emerald-500/40 hover:bg-emerald-500/15 active:scale-95 transition-all shadow-lg shadow-black/20"
            >
              <Download className="w-4 h-4" />
              <span>{isTurkish ? "HD Kapak Resmi İndir (640px)" : "Download HD Cover (640px)"}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-medium backdrop-blur-2xl hover:bg-white/[0.1] hover:border-white/20 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/70" />}
              <span>{copied ? (isTurkish ? "Kopyalandı" : "Copied") : (isTurkish ? "Link Kopyala" : "Copy Link")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
