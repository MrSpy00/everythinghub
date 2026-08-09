"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, FileCode2, Download, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ImageConverterClient() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("image/webp");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    convert(selected, targetFormat);
  };

  const convert = (imgFile: File, fmt: string) => {
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

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          setConvertedUrl(url);
          toast.success(t.convertedReady);
        }, fmt);
      };
    };
  };

  const extMap: Record<string, string> = {
    "image/webp": "webp",
    "image/png": "png",
    "image/jpeg": "jpg",
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-2xl shadow-xl shadow-purple-500/10">
            <FileCode2 className="h-7 w-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{t.imgConvertTitle}</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--hub-text-muted)]">
              {t.imgConvertSub}
            </p>
          </div>
        </div>
      </div>

      <NeonBorder color="#a855f7" rounded={24} glow={60}>
        <div className="rounded-[22px] bg-[var(--hub-surface)]/95 p-6 backdrop-blur-3xl shadow-2xl space-y-6">
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-bg)] p-4">
                <div>
                  <span className="text-xs font-bold text-white">{file.name}</span>
                  <span className="text-xs text-[var(--hub-text-subtle)] block">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--hub-text-muted)]">{t.targetFormat}:</span>
                  <div className="flex items-center gap-1 bg-[var(--hub-surface)] p-1 rounded-xl border border-[var(--hub-border)]">
                    {[
                      { id: "image/webp", label: "WEBP" },
                      { id: "image/png", label: "PNG" },
                      { id: "image/jpeg", label: "JPEG" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setTargetFormat(f.id);
                          convert(file, f.id);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          targetFormat === f.id
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

              {convertedUrl && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> {t.convertedReady} ({extMap[targetFormat]?.toUpperCase()})
                  </span>
                  <a
                    href={convertedUrl}
                    download={`converted.${extMap[targetFormat]}`}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-all"
                  >
                    <Download className="h-4 w-4" /> {t.download}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </NeonBorder>
    </div>
  );
}
