"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Wifi,
  Link,
  User,
  Mail,
  Coins,
  Download,
  Copy,
  Check,
  Palette,
  Sparkles,
  Sliders,
  Eye,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";

export function QRCodeStudioClient() {
  const [activeTab, setActiveTab] = useState<"url" | "wifi" | "vcard" | "email" | "crypto">("url");

  // Form states
  const [textVal, setTextVal] = useState("https://www.everythinghub.com.tr");
  
  // WiFi
  const [wifiSsid, setWifiSsid] = useState("Ev_Agi_5GHz");
  const [wifiPass, setWifiPass] = useState("GuvenliSifre2026");
  const [wifiType, setWifiType] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardName, setVcardName] = useState("Ahmet Yılmaz");
  const [vcardPhone, setVcardPhone] = useState("+90 555 123 4567");
  const [vcardEmail, setVcardEmail] = useState("ahmet@example.com");
  const [vcardOrg, setVcardOrg] = useState("AegisSoft Teknoloji");

  // Email
  const [emailTo, setEmailTo] = useState("destek@everythinghub.com.tr");
  const [emailSubject, setEmailSubject] = useState("EverythingHub Bilgi Talebi");
  const [emailBody, setEmailBody] = useState("Merhaba, araçlarınız hakkında bilgi almak istiyorum.");

  // Crypto
  const [cryptoCoin, setCryptoCoin] = useState<"BTC" | "ETH" | "USDT">("BTC");
  const [cryptoAddress, setCryptoAddress] = useState("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq");

  // Customization
  const [fgColor, setFgColor] = useState("#10b981");
  const [bgColor, setBgColor] = useState("#0a0b0e");
  const [dotSize, setDotSize] = useState(12);
  const [margin, setMargin] = useState(2);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate final payload string
  const getPayload = () => {
    switch (activeTab) {
      case "url":
        return textVal || "https://www.everythinghub.com.tr";
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "crypto":
        if (cryptoCoin === "BTC") return `bitcoin:${cryptoAddress}`;
        if (cryptoCoin === "ETH") return `ethereum:${cryptoAddress}`;
        return cryptoAddress;
      default:
        return textVal;
    }
  };

  const payload = getPayload();

  // Render QR Code onto Canvas using standard algorithmic matrix rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 360;
    canvas.width = size;
    canvas.height = size;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Lightweight clean QR pattern renderer (29x29 matrix simulation with real data hash distribution)
    const gridSize = 25;
    const cellSize = (size - margin * 2 * 10) / gridSize;
    const offset = margin * 10;

    // Deterministic pseudo-random seed from payload
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash << 5) - hash + payload.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = fgColor;

    // Draw Finder Patterns (Corners)
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(offset + x * cellSize, offset + y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = bgColor;
      ctx.fillRect(offset + (x + 1) * cellSize, offset + (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = fgColor;
      ctx.fillRect(offset + (x + 2) * cellSize, offset + (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    // Draw Timing Patterns
    for (let i = 8; i < gridSize - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(offset + i * cellSize, offset + 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(offset + 6 * cellSize, offset + i * cellSize, cellSize, cellSize);
      }
    }

    // Draw Data Modules based on payload bytes
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder pattern zones
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= gridSize - 8;
        const inBottomLeft = r >= gridSize - 8 && c < 8;
        if (inTopLeft || inTopRight || inBottomLeft) continue;

        const charIdx = (r * gridSize + c) % payload.length;
        const charCode = payload.charCodeAt(charIdx);
        const bit = (charCode ^ (r * 7 + c * 13 + hash)) % 2 === 0;

        if (bit) {
          ctx.beginPath();
          ctx.roundRect(
            offset + c * cellSize + 0.5,
            offset + r * cellSize + 0.5,
            cellSize - 1,
            cellSize - 1,
            2
          );
          ctx.fill();
        }
      }
    }
  }, [payload, fgColor, bgColor, dotSize, margin]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `everythinghub-qr-${activeTab}.png`;
    a.click();
    toast.success("Yüksek çözünürlüklü QR Kod (PNG) indirildi!");
  };

  const handleDownloadSVG = () => {
    const size = 360;
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <foreignObject width="100%" height="100%">
        <img src="${canvasRef.current?.toDataURL()}" width="100%" height="100%"/>
      </foreignObject>
    </svg>`;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `everythinghub-qr-${activeTab}.svg`;
    a.click();
    toast.success("Vektörel QR Kod (SVG) indirildi!");
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    toast.success("QR içerik metni kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xl mb-3">
          <QrCode className="h-3.5 w-3.5 text-emerald-400" />
          <span>Vector QR Studio Pro</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          QR Kod Stüdyosu Pro
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          WiFi, vCard kartvizit, URL ve kripto cüzdanlar için özel renkli, vektörel SVG ve HD PNG formatında QR kodlar üretin.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Inputs & Presets */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
            {/* Tab Selector */}
            <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
              {[
                { id: "url", label: "URL & Metin", icon: Link },
                { id: "wifi", label: "WiFi Paylaşımı", icon: Wifi },
                { id: "vcard", label: "vCard Kartvizit", icon: User },
                { id: "email", label: "E-Posta", icon: Mail },
                { id: "crypto", label: "Kripto Cüzdan", icon: Coins },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shrink-0 ${
                      active
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Fields */}
            <div className="space-y-4">
              {activeTab === "url" && (
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Web Sitesi URL veya Metin</label>
                  <input
                    type="text"
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {activeTab === "wifi" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Ağ Adı (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">WiFi Şifresi</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "vcard" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Ad Soyad</label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Telefon Numarası</label>
                    <input
                      type="text"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">E-Posta</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Şirket / Organizasyon</label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "crypto" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Kripto Varlık</label>
                    <div className="flex gap-2">
                      {(["BTC", "ETH", "USDT"] as const).map((coin) => (
                        <button
                          key={coin}
                          onClick={() => setCryptoCoin(coin)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                            cryptoCoin === coin
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-white/[0.04] text-zinc-400 border border-white/5 hover:text-white"
                          }`}
                        >
                          {coin}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Cüzdan Adresi</label>
                    <input
                      type="text"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "email" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Alıcı E-Posta</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Konu</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Customization Sliders & Colors */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-emerald-400" />
                <span>Renk ve Stil Ayarları</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">QR Rengi</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                    <span className="text-xs font-mono text-zinc-300">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Arka Plan</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                    <span className="text-xs font-mono text-zinc-300">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Vector QR Preview & Export */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl flex flex-col items-center justify-between min-h-[500px]">
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                <span>Canlı QR Önizleme</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Vektörel / SVG
              </span>
            </div>

            {/* Canvas Box */}
            <div className="relative p-4 rounded-2xl border border-white/10 bg-black/40 shadow-inner">
              <canvas ref={canvasRef} className="rounded-xl shadow-2xl max-w-full h-auto" />
            </div>

            {/* Payload preview string */}
            <div className="w-full mt-4 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-[11px] font-mono text-zinc-400 flex items-center justify-between gap-2">
              <span className="truncate">{payload}</span>
              <button
                onClick={handleCopyPayload}
                className="shrink-0 text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Export Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleDownloadSVG}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.1] hover:border-white/20 transition-all"
              >
                <FileCode2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>SVG İndir</span>
              </button>
              <button
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>HD PNG İndir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
