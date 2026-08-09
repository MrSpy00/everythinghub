"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Palette,
  Upload,
  Copy,
  Check,
  Pipette,
  Sliders,
  Sparkles,
  Download,
  FileCode2,
  Filter,
  Eye,
  Layers,
  ArrowLeft,
  RefreshCw,
  Maximize2,
  Trash2,
  Share2,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { StudioDropdown } from "@/components/shared/StudioDropdown";
import { HorizontalScrollContainer } from "@/components/shared/HorizontalScrollContainer";

type ExtractionMode = "kmeans" | "vibrant" | "contrast" | "tonal";
type SamplingResolution = "fast" | "balanced" | "ultra";

interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  luminance: number;
  role?: string;
}

// Convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Euclidean distance in RGB color space
function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return Math.round((a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722) * 100) / 100;
}

export function ColorPickerClient() {
  const { lang } = useLanguage();
  const isTurkish = lang === "tr";

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Customization controls
  const [colorCount, setColorCount] = useState<number>(8);
  const [algorithm, setAlgorithm] = useState<ExtractionMode>("kmeans");
  const [resolution, setResolution] = useState<SamplingResolution>("balanced");
  const [ignoreWhites, setIgnoreWhites] = useState(true);
  const [ignoreBlacks, setIgnoreBlacks] = useState(true);
  const [mergeThreshold, setMergeThreshold] = useState<number>(24);

  // Loupe / Eyedropper state
  const [hoveredColor, setHoveredColor] = useState<{ hex: string; x: number; y: number } | null>(null);
  const [pickedCustomColors, setPickedCustomColors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
  };

  // Perform Advanced Color Extraction
  const processImageExtraction = useCallback(() => {
    if (!imageSrc) return;

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      imgElementRef.current = img;

      const canvas = document.createElement("canvas");
      let targetWidth = 384;
      if (resolution === "fast") targetWidth = 128;
      if (resolution === "ultra") targetWidth = 768;

      const aspect = img.height / img.width;
      const targetHeight = Math.round(targetWidth * aspect);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
      const totalPixels = imgData.length / 4;

      // Extract valid pixel points
      const pixels: { r: number; g: number; b: number }[] = [];
      const step = resolution === "ultra" ? 2 : resolution === "balanced" ? 4 : 8;

      for (let i = 0; i < imgData.length; i += step * 4) {
        const a = imgData[i + 3];
        if (a < 128) continue; // Transparent

        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        // Filter near-white
        if (ignoreWhites && r > 245 && g > 245 && b > 245) continue;
        // Filter near-black
        if (ignoreBlacks && r < 18 && g < 18 && b < 18) continue;

        pixels.push({ r, g, b });
      }

      if (pixels.length === 0) {
        setIsProcessing(false);
        toast.error(isTurkish ? "Görselden uygun piksel çıkarılamadı." : "No valid pixels could be extracted.");
        return;
      }

      // Execute Algorithm
      let centroids: { r: number; g: number; b: number; count: number }[] = [];

      if (algorithm === "kmeans" || algorithm === "contrast" || algorithm === "tonal") {
        // K-Means Clustering initialization with diverse seed points
        const k = Math.min(colorCount, pixels.length);
        const seeds: { r: number; g: number; b: number }[] = [];
        const interval = Math.floor(pixels.length / k);

        for (let i = 0; i < k; i++) {
          seeds.push({ ...pixels[i * interval] });
        }

        // 6 iterations of K-Means
        let clusters = seeds.map((s) => ({ ...s, count: 0 }));
        for (let iter = 0; iter < 6; iter++) {
          const sums = clusters.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));

          for (const p of pixels) {
            let minDist = Infinity;
            let bestIdx = 0;
            for (let cIdx = 0; cIdx < clusters.length; cIdx++) {
              const d = colorDistance(p, clusters[cIdx]);
              if (d < minDist) {
                minDist = d;
                bestIdx = cIdx;
              }
            }
            sums[bestIdx].r += p.r;
            sums[bestIdx].g += p.g;
            sums[bestIdx].b += p.b;
            sums[bestIdx].count += 1;
          }

          clusters = sums.map((s, idx) => {
            if (s.count === 0) return clusters[idx];
            return {
              r: Math.round(s.r / s.count),
              g: Math.round(s.g / s.count),
              b: Math.round(s.b / s.count),
              count: s.count,
            };
          });
        }

        centroids = clusters;
      } else if (algorithm === "vibrant") {
        // Vibrant & Muted sorting based on Saturation & Lightness
        const buckets: { r: number; g: number; b: number; hsl: { h: number; s: number; l: number } }[] = [];
        for (let i = 0; i < pixels.length; i += 10) {
          const p = pixels[i];
          const hsl = rgbToHsl(p.r, p.g, p.b);
          buckets.push({ ...p, hsl });
        }

        // Sort by saturation descending to get vibrant accents
        buckets.sort((a, b) => b.hsl.s - a.hsl.s);
        const picked: typeof buckets = [];

        for (const b of buckets) {
          if (picked.length >= colorCount) break;
          const isFar = picked.every((p) => colorDistance(p, b) > mergeThreshold);
          if (isFar) picked.push(b);
        }

        centroids = picked.map((p) => ({ r: p.r, g: p.g, b: p.b, count: 1 }));
      }

      // Merge similar clusters based on mergeThreshold
      const merged: typeof centroids = [];
      for (const c of centroids) {
        const matchIdx = merged.findIndex((m) => colorDistance(m, c) < mergeThreshold);
        if (matchIdx >= 0) {
          merged[matchIdx].count += c.count;
        } else {
          merged.push({ ...c });
        }
      }

      // Calculate total sample count for relative percentage
      const totalSampled = merged.reduce((acc, c) => acc + (c.count || 1), 0);

      // Build Result Array
      const results: ExtractedColor[] = merged.slice(0, colorCount).map((c) => {
        const hex = rgbToHex(c.r, c.g, c.b);
        const hsl = rgbToHsl(c.r, c.g, c.b);
        const luminance = getLuminance(c.r, c.g, c.b);
        const percentage = Math.max(1, Math.round(((c.count || 1) / totalSampled) * 100));

        let role = isTurkish ? "Vurgu" : "Accent";
        if (luminance > 0.75) role = isTurkish ? "Açık Ton" : "Light";
        else if (luminance < 0.25) role = isTurkish ? "Koyu Ton" : "Shadow";
        else if (hsl.s > 60) role = isTurkish ? "Canlı Vurgu" : "Vibrant";

        return {
          hex,
          rgb: { r: c.r, g: c.g, b: c.b },
          hsl,
          percentage,
          luminance,
          role,
        };
      });

      // Sort by dominance percentage descending
      results.sort((a, b) => b.percentage - a.percentage);

      setExtractedColors(results);
      setIsProcessing(false);
      toast.success(isTurkish ? "Renk paleti başarıyla çıkarıldı!" : "Color palette extracted successfully!");
    };
  }, [imageSrc, colorCount, algorithm, resolution, ignoreWhites, ignoreBlacks, mergeThreshold, isTurkish]);

  // Re-run extraction whenever parameters change
  useEffect(() => {
    if (imageSrc) {
      processImageExtraction();
    }
  }, [imageSrc, colorCount, algorithm, resolution, ignoreWhites, ignoreBlacks, mergeThreshold, processImageExtraction]);

  // Copy single color
  const handleCopySingle = async (hex: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      setCopiedColor(hex);
      toast.success(`${hex} ${isTurkish ? "panoya kopyalandı!" : "copied to clipboard!"}`);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  // Export CSS Variables
  const exportCssVars = () => {
    if (extractedColors.length === 0) return;
    const css = `:root {\n${extractedColors
      .map((c, i) => `  --color-palette-${i + 1}: ${c.hex}; /* ${c.role} (${c.percentage}%) */`)
      .join("\n")}\n}`;
    copyToClipboard(css);
    toast.success(isTurkish ? "CSS değişkenleri kopyalandı!" : "CSS variables copied!");
  };

  // Export Tailwind Config
  const exportTailwind = () => {
    if (extractedColors.length === 0) return;
    const colorMap = extractedColors.reduce((acc, curr, idx) => {
      acc[`color-${idx + 1}`] = curr.hex;
      return acc;
    }, {} as Record<string, string>);
    const str = `// Tailwind Palette\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        customPalette: ${JSON.stringify(colorMap, null, 10)}\n      }\n    }\n  }\n};`;
    copyToClipboard(str);
    toast.success(isTurkish ? "Tailwind konfigürasyonu kopyalandı!" : "Tailwind config copied!");
  };

  // Download SVG Swatch Palette
  const downloadSvgPalette = () => {
    if (extractedColors.length === 0) return;
    const width = 800;
    const height = 240;
    const swatchWidth = width / extractedColors.length;

    const rects = extractedColors
      .map((c, i) => {
        const x = i * swatchWidth;
        return `
          <g transform="translate(${x}, 0)">
            <rect width="${swatchWidth}" height="${height - 60}" fill="${c.hex}" />
            <rect y="${height - 60}" width="${swatchWidth}" height="60" fill="#0d0e12" />
            <text x="${swatchWidth / 2}" y="${height - 35}" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">${c.hex.toUpperCase()}</text>
            <text x="${swatchWidth / 2}" y="${height - 15}" fill="#a1a1aa" font-family="sans-serif" font-size="11" text-anchor="middle">${c.percentage}%</text>
          </g>
        `;
      })
      .join("");

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      ${rects}
    </svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette_everythinghub.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isTurkish ? "Vektörel SVG paleti indirildi!" : "SVG palette downloaded!");
  };

  // Handle Interactive Eyedropper on Image
  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pixel = ctx.getImageData(Math.floor(x * scaleX), Math.floor(y * scaleY), 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    setHoveredColor({ hex, x: e.clientX, y: e.clientY });
  };

  const handleImageClick = () => {
    if (hoveredColor) {
      if (!pickedCustomColors.includes(hoveredColor.hex)) {
        setPickedCustomColors((prev) => [hoveredColor.hex, ...prev]);
        toast.success(`${hoveredColor.hex} ${isTurkish ? "özel palete eklendi!" : "added to custom palette!"}`);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] backdrop-blur-xl transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
          <span>{isTurkish ? "Hub Menüsüne Dön" : "Back to Hub"}</span>
        </Link>
        <Link
          href="/tools/hex-color-studio"
          className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 backdrop-blur-xl transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>{isTurkish ? "HEX & Renk Mimarisi Stüdyosu'na Geç" : "Switch to HEX Studio"}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-xl">
          <Palette className="h-4 w-4 text-amber-400" />
          <span>{isTurkish ? "Gelişmiş Görsel Renk Çıkarıcı & Palet Laboratuvarı" : "Advanced Image Palette Extractor Pro"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isTurkish ? "Renk Paleti & Resimden Renk Çıkarıcı" : "Color Palette & Image Color Extractor"}
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          {isTurkish
            ? "Yüklediğiniz fotoğraflardan K-Means kümeleme ile dominant renkleri analiz edin, örnekleme hassasiyetini ve renk sayısını özelleştirin, CSS ve Tailwind olarak dışa aktarın."
            : "Extract dominant color harmonies with K-Means clustering, customize sample depth and color count, and export to CSS variables & Tailwind config."}
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Image Uploader, Canvas & Eyedropper */}
        <div className="lg:col-span-7 space-y-6">
          {/* Uploader Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {!imageSrc ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-12 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/10 transition-all group"
              >
                <Upload className="h-12 w-12 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-base font-bold text-white mb-1">
                  {isTurkish ? "Fotoğrafı Sürükleyin veya Seçin" : "Drop Image or Click to Browse"}
                </p>
                <p className="text-xs text-zinc-400">
                  {isTurkish ? "PNG, JPG, WEBP, SVG veya GIF desteklenir (Max 50MB)" : "Supports PNG, JPG, WEBP, SVG or GIF"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Eye className="h-4 w-4 text-amber-400" />
                    {isTurkish ? "Görsel Önizleme & Damlalık (Tıklayın)" : "Interactive Preview & Loupe"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                    >
                      {isTurkish ? "Görseli Değiştir" : "Change Image"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Interactive Image Display */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-inner flex items-center justify-center group cursor-crosshair">
                  <img
                    src={imageSrc}
                    alt="Palette Target"
                    className="max-h-full max-w-full object-contain"
                    onMouseMove={handleImageMouseMove}
                    onMouseLeave={() => setHoveredColor(null)}
                    onClick={handleImageClick}
                  />

                  {/* Hovered Loupe Tooltip */}
                  {hoveredColor && (
                    <div
                      className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-xl border border-white/20 bg-black/90 px-3 py-1.5 backdrop-blur-2xl shadow-2xl"
                      style={{
                        left: hoveredColor.x + 16,
                        top: hoveredColor.y + 16,
                      }}
                    >
                      <div
                        className="h-4 w-4 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: hoveredColor.hex }}
                      />
                      <span className="font-mono text-xs font-bold text-white">
                        {hoveredColor.hex.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Picked Eyedropper Swatches */}
            {pickedCustomColors.length > 0 && (
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {isTurkish ? "Damlalık ile Seçilen Nokta Renkler:" : "Eyedropper Picked Colors:"}
                  </span>
                  <button
                    onClick={() => setPickedCustomColors([])}
                    className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    {isTurkish ? "Temizle" : "Clear"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pickedCustomColors.map((hex) => (
                    <div
                      key={hex}
                      onClick={() => handleCopySingle(hex)}
                      className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] cursor-pointer transition-all"
                    >
                      <div className="h-3.5 w-3.5 rounded-md border border-white/20" style={{ backgroundColor: hex }} />
                      <span className="font-mono text-xs text-white">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Deep Extraction Fine-Tuning Controls */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <span>{isTurkish ? "Ekstraksiyon & Örnekleme Parametreleri" : "Extraction & Sampling Controls"}</span>
            </h3>

            {/* Color Count Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-300">
                <span>{isTurkish ? "Çıkarılacak Renk Sayısı" : "Number of Extracted Colors"}</span>
                <span className="font-mono text-amber-400 font-bold">{colorCount} Renk</span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                step="1"
                value={colorCount}
                onChange={(e) => setColorCount(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>4 (Minimal)</span>
                <span>12 (Dengeli)</span>
                <span>20 (Geniş Skala)</span>
              </div>
            </div>

            {/* Algorithm & Sampling Resolution Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <StudioDropdown
                label={isTurkish ? "Çıkarma Algoritması" : "Extraction Algorithm"}
                value={algorithm}
                onChange={(val) => setAlgorithm(val as ExtractionMode)}
                options={[
                  {
                    value: "kmeans",
                    label: isTurkish ? "K-Means Medoid (Dominant)" : "K-Means Medoid",
                    description: isTurkish ? "Gerçek dominant renk yoğunluğu" : "True mathematical dominance",
                  },
                  {
                    value: "vibrant",
                    label: isTurkish ? "Canlı & Doygun (Vibrant)" : "Vibrant & Saturated",
                    description: isTurkish ? "Canlı vurgu ve pastel tonlar" : "High-saturation accents",
                  },
                ]}
              />

              <StudioDropdown
                label={isTurkish ? "Örnekleme Çözünürlüğü" : "Sampling Depth"}
                value={resolution}
                onChange={(val) => setResolution(val as SamplingResolution)}
                options={[
                  { value: "fast", label: isTurkish ? "Hızlı Tarama (128px)" : "Fast Scan (128px)" },
                  { value: "balanced", label: isTurkish ? "Dengeli HD (384px)" : "Balanced HD (384px)" },
                  { value: "ultra", label: isTurkish ? "Ultra 4K / Derin Tarama" : "Ultra 4K Deep Scan" },
                ]}
              />
            </div>

            {/* Filter Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreWhites}
                  onChange={(e) => setIgnoreWhites(e.target.checked)}
                  className="h-4 w-4 rounded accent-amber-500"
                />
                <span>{isTurkish ? "Beyaz / Arka Planı Filtrele" : "Filter Near-White Pixels"}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreBlacks}
                  onChange={(e) => setIgnoreBlacks(e.target.checked)}
                  className="h-4 w-4 rounded accent-amber-500"
                />
                <span>{isTurkish ? "Siyah / Aşırı Koyu Filtrele" : "Filter Near-Black Pixels"}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Extracted Palette Cards & Exports */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {isTurkish ? "Çıkarılan Dominant Palet" : "Extracted Palette Cards"}
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {extractedColors.length} Ton
              </span>
            </div>

            {/* Relative Color Dominance Bar */}
            {extractedColors.length > 0 && (
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded-xl overflow-hidden flex shadow-inner border border-white/10">
                  {extractedColors.map((c) => (
                    <div
                      key={c.hex}
                      style={{
                        backgroundColor: c.hex,
                        width: `${c.percentage}%`,
                      }}
                      title={`${c.hex}: ${c.percentage}%`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Dominance Distribution</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Extracted Swatches Grid */}
            {extractedColors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {extractedColors.map((c) => (
                  <div
                    key={c.hex}
                    onClick={() => handleCopySingle(c.hex)}
                    className="group p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl border border-white/15 shadow-inner shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div>
                        <span className="font-mono text-xs font-bold text-white block">{c.hex.toUpperCase()}</span>
                        <span className="text-[10px] text-zinc-400">{c.role} ({c.percentage}%)</span>
                      </div>
                    </div>

                    {copiedColor === c.hex ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-500 text-xs">
                {isTurkish ? "Görsel yükleyerek anında renk çıkarın." : "Upload an image to extract colors."}
              </div>
            )}

            {/* Multi-Format Export Buttons */}
            {extractedColors.length > 0 && (
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={exportCssVars}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-xs font-bold text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
                  >
                    <FileCode2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>CSS Variables</span>
                  </button>

                  <button
                    onClick={exportTailwind}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Tailwind Config</span>
                  </button>
                </div>

                <button
                  onClick={downloadSvgPalette}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 px-4 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  <Download className="h-4 w-4" />
                  <span>{isTurkish ? "Vektörel SVG Paletini İndir" : "Download Vector SVG Swatch"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
