"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Download, Upload, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ImageCompressorClient() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(0.8);
  const [format, setFormat] = useState<string>("image/webp");
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Invalid image format. Please select PNG, JPG, or WebP.");
      return;
    }

    setFile(selected);
    setOriginalSize(selected.size);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);

    compressImage(selected, quality, format);
  };

  const compressImage = (imgFile: File, q: number, fmt: string) => {
    setCompressing(true);
    const reader = new FileReader();
    reader.readAsDataURL(imgFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            setCompressedSize(blob.size);
            const compUrl = URL.createObjectURL(blob);
            setCompressedPreview(compUrl);
            setCompressing(false);
            toast.success(t.downloadSuccessToast || "Image compressed successfully!");
          },
          fmt,
          q
        );
      };
    };
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (file) {
      compressImage(file, newQ, format);
    }
  };

  const handleFormatChange = (newFmt: string) => {
    setFormat(newFmt);
    if (file) {
      compressImage(file, quality, newFmt);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const savingsPct =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 backdrop-blur-2xl shadow-xl shadow-violet-500/10">
            <ImageIcon className="h-7 w-7 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              {t.imgCompressTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.imgCompressSub}
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#8b5cf6" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/40 bg-purple-500/5 p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition-all"
          >
            <Upload className="h-10 w-10 text-purple-400 mb-3" />
            <p className="text-sm font-bold text-white mb-1">{t.dropImage}</p>
            <p className="text-xs text-[var(--hub-text-muted)]">PNG, JPG, WebP, AVIF</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {file && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-white mb-2 block">
                    {t.qualityLabel}: %{Math.round(quality * 100)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white mb-2 block">{t.targetFormat}</label>
                  <div className="flex items-center gap-1 bg-[var(--hub-bg)] p-1 rounded-xl border border-[var(--hub-border)]">
                    {[
                      { id: "image/webp", label: "WebP" },
                      { id: "image/jpeg", label: "JPEG" },
                      { id: "image/png", label: "PNG" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleFormatChange(f.id)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          format === f.id
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compression Stats */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                <div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">{t.originalSize}</span>
                  <span className="text-sm font-black text-white">{formatBytes(originalSize)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">{t.compressedSize}</span>
                  <span className="text-sm font-black text-emerald-400">{formatBytes(compressedSize)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">{t.sizeReduction}</span>
                  <span className="text-sm font-black text-purple-300">%{savingsPct}</span>
                </div>
                {compressedPreview && (
                  <a
                    href={compressedPreview}
                    download={`compressed-${file.name.split(".")[0]}.${format.split("/")[1]}`}
                    className="flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/20 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-2xl shadow-xl shadow-violet-500/10 hover:bg-violet-500/30 hover:border-violet-400 hover:scale-105 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>{t.downloadCompressed}</span>
                  </a>
                )}
              </div>

              {/* Side by side previews */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-bold text-white mb-2 block">{t.originalSize}</span>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--hub-border)] bg-black/40">
                    <img src={preview || ""} alt="Original" className="h-full w-full object-contain" />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-400 mb-2 block flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> {t.compressedSize}
                  </span>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-purple-500/40 bg-black/40">
                    {compressing ? (
                      <div className="flex h-full items-center justify-center text-purple-300 text-xs font-bold gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> {t.converting}
                      </div>
                    ) : (
                      <img src={compressedPreview || ""} alt="Compressed" className="h-full w-full object-contain" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </NeonBorder>
    </div>
  );
}
