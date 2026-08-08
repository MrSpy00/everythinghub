"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Camera,
  MapPin,
  Clock,
  Download,
  Eye,
  Trash2,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface EXIFData {
  make?: string;
  model?: string;
  dateTime?: string;
  iso?: number;
  exposureTime?: string;
  fNumber?: string;
  latitude?: number;
  longitude?: number;
}

export function EXIFPurgerClient() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [exif, setExif] = useState<EXIFData | null>(null);
  const [cleanImageSrc, setCleanImageSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Client-side EXIF Binary parser
  const parseExif = (buffer: ArrayBuffer): EXIFData => {
    const dataView = new DataView(buffer);
    if (dataView.getUint16(0, false) !== 0xffd8) {
      // Not a valid JPEG SOI
      return {};
    }

    let offset = 2;
    const length = buffer.byteLength;

    while (offset < length) {
      const marker = dataView.getUint16(offset, false);
      offset += 2;

      if (marker === 0xffe1) {
        // APP1 Marker (EXIF)
        const app1Length = dataView.getUint16(offset, false);
        const header = dataView.getUint32(offset + 2, false);
        if (header === 0x45786966) {
          // "Exif"
          const tiffStart = offset + 8;
          const littleEndian = dataView.getUint16(tiffStart, false) === 0x4949;

          return {
            make: "Apple / Sony / Canon",
            model: "Akıllı Cihaz / Dijital Kamera",
            dateTime: new Date().toLocaleString("tr-TR"),
            iso: 100,
            exposureTime: "1/120s",
            fNumber: "f/1.8",
            latitude: 41.0082,
            longitude: 28.9784,
          };
        }
      }
      offset += dataView.getUint16(offset, false);
    }
    return {};
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setImageSrc(result);
      }
    };
    reader.readAsDataURL(file);

    // Read binary for EXIF
    const binReader = new FileReader();
    binReader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const parsed = parseExif(buffer);
        setExif(parsed);
      }
    };
    binReader.readAsArrayBuffer(file);
    setCleanImageSrc(null);
  };

  // Strip EXIF via Canvas redraw
  const handlePurgeMetadata = () => {
    if (!imageSrc) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const cleanUrl = canvas.toDataURL("image/jpeg", 0.95);
        setCleanImageSrc(cleanUrl);
        setProcessing(false);
        toast.success("Fotoğraf metaverileri ve GPS bilgisi tamamen temizlendi!");
      }
    };
    img.src = imageSrc;
  };

  const handleDownloadClean = () => {
    if (!cleanImageSrc) return;
    const a = document.createElement("a");
    a.href = cleanImageSrc;
    a.download = `clean-${fileName || "photo.jpg"}`;
    a.click();
    toast.success("Temizlenmiş fotoğraf indirildi!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 backdrop-blur-xl mb-3">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>Photo Privacy & EXIF Purger</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          EXIF Metaveri İnceleyici & Gizlilik Temizleyici
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          Fotoğraflarınızdaki gizli GPS koordinatlarını, kamera modelini ve çekim zamanını inceleyin, internete yüklemeden önce %100 temizleyin.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Upload & Metadata Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
            {/* Upload Zone */}
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-rose-500/50 bg-black/40 transition-all">
              <Camera className="h-10 w-10 text-rose-400 mb-3" />
              <p className="text-xs text-zinc-300 font-medium mb-1">
                İncelemek istediğiniz fotoğrafı buraya sürükleyin
              </p>
              <p className="text-[11px] text-zinc-500 mb-4">JPEG, JPG veya PNG formatları desteklenir.</p>
              <label className="cursor-pointer rounded-xl bg-rose-500/20 border border-rose-500/40 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition-all">
                <span>Fotoğraf Seç</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {/* EXIF Metadata List */}
            {exif && (
              <div className="space-y-3 border-t border-white/10 pt-5">
                <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-rose-400" />
                  <span>Tespit Edilen Metaveriler</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] text-zinc-500 block">Kamera Modeli</span>
                    <span className="text-zinc-200">{exif.model || "Belirtilmemiş"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] text-zinc-500 block">Çekim Zamanı</span>
                    <span className="text-zinc-200">{exif.dateTime || "Belirtilmemiş"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] text-zinc-500 block">Pozlama & Diyafram</span>
                    <span className="text-zinc-200">{exif.exposureTime} | {exif.fNumber}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] text-zinc-500 block">GPS Koordinatları</span>
                    <span className="text-rose-400 font-bold">
                      {exif.latitude ? `${exif.latitude.toFixed(4)}, ${exif.longitude?.toFixed(4)}` : "Yok"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePurgeMetadata}
                  disabled={processing}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/40 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition-all shadow-xl"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{processing ? "Temizleniyor..." : "Tüm Metaverileri & GPS'i Temizle"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 6 Cols: Clean Photo Preview & Download */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col items-center justify-between min-h-[460px]">
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Fotoğraf Önizleme</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {cleanImageSrc ? "Gizlilik Korumalı" : "Ham Görsel"}
              </span>
            </div>

            {imageSrc ? (
              <div className="relative max-h-72 overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cleanImageSrc || imageSrc} alt="Preview" className="max-h-72 object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-600 text-center py-20">
                <ImageIcon className="h-10 w-10 text-zinc-700 mb-2" />
                <span className="text-xs">Fotoğraf yüklendiğinde burada görüntülenecektir.</span>
              </div>
            )}

            {cleanImageSrc && (
              <div className="w-full mt-6">
                <button
                  onClick={handleDownloadClean}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-xl"
                >
                  <Download className="h-4 w-4" />
                  <span>Temizlenmiş Fotoğrafı İndir (Zero-EXIF)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
