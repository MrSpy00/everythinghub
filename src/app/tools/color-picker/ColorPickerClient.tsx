"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Palette, Upload, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ColorPickerClient() {
  const { t } = useLanguage();
  const [colors, setColors] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    extractPalette(objectUrl);
  };

  const extractPalette = (imgSrc: string) => {
    const img = new Image();
    img.src = imgSrc;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 100, 100);
      const imgData = ctx.getImageData(0, 0, 100, 100).data;

      const colorCounts: Record<string, number> = {};
      for (let i = 0; i < imgData.length; i += 16) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sorted = Object.keys(colorCounts)
        .sort((a, b) => colorCounts[b] - colorCounts[a])
        .slice(0, 8);

      setColors(sorted);
      toast.success(t.hexCopied);
    };
  };

  const handleCopy = async (hex: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      setCopiedColor(hex);
      toast.success(`${hex} ${t.copied}`);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] hover:text-white transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
          <span>{t.backToHub}</span>
        </Link>
      </div>

      <div className="mb-8 rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-2xl shadow-xl shadow-amber-500/10">
            <Palette className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t.colorPickerTitle}</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.colorPickerSub}
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#f59e0b" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/10 transition-all"
          >
            <Upload className="h-10 w-10 text-amber-400 mb-3" />
            <p className="text-sm font-bold text-white mb-1">{t.dropImageForPalette}</p>
            <p className="text-xs text-[var(--hub-text-muted)]">{t.dropImage}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {preview && (
            <div className="space-y-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--hub-border)] bg-black/40">
                <img src={preview} alt="Analiz" className="h-full w-full object-contain" />
              </div>

              {colors.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-amber-400" /> {t.dominantColors}
                  </span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {colors.map((hex) => (
                      <div
                        key={hex}
                        onClick={() => handleCopy(hex)}
                        className="group flex flex-col overflow-hidden rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-2 cursor-pointer hover:border-amber-500/50 transition-all"
                      >
                        <div
                          className="h-16 w-full rounded-lg shadow-inner mb-2"
                          style={{ backgroundColor: hex }}
                        />
                        <div className="flex items-center justify-between px-1">
                          <span className="font-mono text-xs font-bold text-white">{hex}</span>
                          {copiedColor === hex ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-[var(--hub-text-subtle)] group-hover:text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </NeonBorder>
    </div>
  );
}
