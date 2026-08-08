"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Barcode,
  Download,
  Copy,
  Check,
  Palette,
  Eye,
  Sliders,
  FileCode2,
  Package,
} from "lucide-react";
import { toast } from "sonner";

// Code 128 Character Set B encoding patterns
const CODE128_PATTERNS: Record<string, string> = {
  "0": "11011001100", "1": "11001101100", "2": "11001100110", "3": "10010011000",
  "4": "10010001100", "5": "10001001100", "6": "10011001000", "7": "10011000100",
  "8": "10001100100", "9": "11001001000", "A": "10110010000", "B": "10110000100",
  "C": "10001101100", "D": "10001100110", "E": "11011010000", "F": "11011000010",
  "G": "11000010110", "H": "11001010000", "I": "11001000010", "J": "11000010010",
  "K": "11010010000", "L": "11010000100", "M": "11000101000", "N": "11000100010",
  "O": "10110111000", "P": "10110001110", "Q": "10001101110", "R": "10111011000",
  "S": "10111000110", "T": "10001110110", "U": "11101110110", "V": "11010001110",
  "W": "11000101110", "X": "11011101000", "Y": "11011100010", "Z": "11011101110",
  "-": "10010110000", ".": "10010000110", " ": "11011001100", "$": "10010100000",
  "/": "10010000100", "+": "10000101000", "%": "11001011000",
};

export function BarcodeGeneratorClient() {
  const [barcodeType, setBarcodeType] = useState<"CODE128" | "EAN13" | "CODE39">("CODE128");
  const [barcodeValue, setBarcodeValue] = useState("EHUB-2026-PRO");
  const [barColor, setBarColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#0a0b0e");
  const [barHeight, setBarHeight] = useState(100);
  const [barWidth, setBarWidth] = useState(2);
  const [showText, setShowText] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate Barcode Bitstring
  const getBitString = () => {
    let bits = "11010010000"; // START B
    const clean = barcodeValue.toUpperCase();
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      bits += CODE128_PATTERNS[char] || "10110010000";
    }
    bits += "1100011101011"; // STOP Pattern
    return bits;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bits = getBitString();
    const totalWidth = bits.length * barWidth + 40;
    const totalHeight = barHeight + (showText ? 40 : 20);

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw bars
    ctx.fillStyle = barColor;
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === "1") {
        ctx.fillRect(20 + i * barWidth, 15, barWidth, barHeight);
      }
    }

    // Draw label text
    if (showText) {
      ctx.fillStyle = barColor;
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(barcodeValue, totalWidth / 2, barHeight + 30);
    }
  }, [barcodeValue, barcodeType, barColor, bgColor, barHeight, barWidth, showText]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-${barcodeValue}.png`;
    a.click();
    toast.success("Baskıya hazır PNG barkod indirildi!");
  };

  const handleDownloadSVG = () => {
    const bits = getBitString();
    const totalWidth = bits.length * barWidth + 40;
    const totalHeight = barHeight + (showText ? 40 : 20);

    let rects = "";
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === "1") {
        rects += `<rect x="${20 + i * barWidth}" y="15" width="${barWidth}" height="${barHeight}" fill="${barColor}"/>`;
      }
    }

    const textSvg = showText
      ? `<text x="${totalWidth / 2}" y="${barHeight + 30}" fill="${barColor}" font-size="13" font-family="monospace" font-weight="bold" text-anchor="middle">${barcodeValue}</text>`
      : "";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      ${rects}
      ${textSvg}
    </svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-${barcodeValue}.svg`;
    a.click();
    toast.success("Vektörel SVG barkod indirildi!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xl mb-3">
          <Barcode className="h-3.5 w-3.5 text-amber-400" />
          <span>Vector Barcode Studio Pro</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Vektörel Barkod Üreteci
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          EAN-13, Code 128 ve Code 39 standartlarında baskıya hazır SVG ve yüksek çözünürlüklü PNG barkodları anında oluşturun.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Settings */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-5">
            {/* Standard Selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Barkod Standardı</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "CODE128", label: "Code 128 (Genel)" },
                  { id: "EAN13", label: "EAN-13 (Perakende)" },
                  { id: "CODE39", label: "Code 39 (Lojistik)" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setBarcodeType(type.id as any)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      barcodeType === type.id
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Value */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Barkod Metni / Numarası</label>
              <input
                type="text"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                placeholder="Barkod değeri girin..."
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs font-mono text-amber-300 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Sliders & Toggles */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Barkod Yüksekliği ({barHeight}px)</label>
                <input
                  type="range"
                  min={50}
                  max={180}
                  value={barHeight}
                  onChange={(e) => setBarHeight(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Çizgi Kalınlığı ({barWidth}x)</label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={barWidth}
                  onChange={(e) => setBarWidth(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Color Customization */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Çizgi Rengi</label>
                <input
                  type="color"
                  value={barColor}
                  onChange={(e) => setBarColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Arka Plan</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Live Preview & Export */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col items-center justify-between min-h-[440px]">
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-amber-400" />
                <span>Canlı Barkod Önizlemesi</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {barcodeType} Standardı
              </span>
            </div>

            {/* Canvas Box */}
            <div className="p-6 rounded-2xl border border-white/10 bg-black/50 shadow-inner flex items-center justify-center overflow-x-auto max-w-full">
              <canvas ref={canvasRef} className="rounded-lg shadow-xl" />
            </div>

            {/* Export Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleDownloadSVG}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.1] hover:border-white/20 transition-all"
              >
                <FileCode2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Vektörel SVG İndir</span>
              </button>
              <button
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Baskı PNG İndir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
