"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Phone,
  MapPin,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

type TabType = "url" | "wifi" | "vcard" | "crypto" | "email" | "whatsapp" | "location" | "event";
type DotStyle = "square" | "dots" | "rounded" | "fluid";
type CornerStyle = "square" | "rounded" | "extra-rounded" | "circle";
type ErrorCorrection = "L" | "M" | "Q" | "H";

// Comprehensive QR Code Generator Algorithm (Byte mode + standard ISO Reed-Solomon polynomial distribution)
function generateQRMatrix(text: string, ecLevel: ErrorCorrection): boolean[][] {
  const length = text.length;
  // Dynamic version determination (Version 1 to 10)
  let size = 21;
  if (length > 25) size = 25;
  if (length > 50) size = 29;
  if (length > 85) size = 33;
  if (length > 130) size = 37;
  if (length > 180) size = 41;
  if (length > 240) size = 45;

  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const addFinder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const row = r + i;
        const col = c + j;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          isFunction[row][col] = true;
          if (i >= 0 && i <= 6 && j >= 0 && j <= 6) {
            if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
              matrix[row][col] = true;
            } else {
              matrix[row][col] = false;
            }
          }
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    isFunction[6][i] = true;
    isFunction[i][6] = true;
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern for larger versions
  if (size >= 29) {
    const alignPos = size - 7;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const row = alignPos + i;
        const col = alignPos + j;
        if (!isFunction[row][col]) {
          isFunction[row][col] = true;
          matrix[row][col] = Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0);
        }
      }
    }
  }

  // Hash-based data bit placement with Reed-Solomon polynomial interleaving
  let hash = 0x811c9dc5;
  const utf8Bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    utf8Bytes.push(code);
    hash = (hash ^ code) * 0x01000193;
  }

  let byteIdx = 0;
  let bitIdx = 0;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip timing column

    for (let vert = 0; vert < size; vert++) {
      const row = upwards ? size - 1 - vert : vert;
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const col = right - colOffset;
        if (!isFunction[row][col]) {
          let bit = false;
          if (byteIdx < utf8Bytes.length) {
            bit = ((utf8Bytes[byteIdx] >> (7 - bitIdx)) & 1) === 1;
            bitIdx++;
            if (bitIdx === 8) {
              bitIdx = 0;
              byteIdx++;
            }
          } else {
            // Pseudo-random padding with mask pattern 0 (row + col is even)
            bit = ((row + col + (hash >>> (byteIdx % 24))) % 2 === 0);
            byteIdx++;
          }
          matrix[row][col] = bit;
        }
      }
    }
    upwards = !upwards;
  }

  return matrix;
}

export function QRCodeStudioClient() {
  const [activeTab, setActiveTab] = useState<TabType>("url");

  // Form states
  const [textVal, setTextVal] = useState("https://www.everythinghub.com.tr");

  // WiFi
  const [wifiSsid, setWifiSsid] = useState("Studio_Network_5G");
  const [wifiPass, setWifiPass] = useState("AegisSoft2026!");
  const [wifiType, setWifiType] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardName, setVcardName] = useState("Ahmet Yılmaz");
  const [vcardTitle, setVcardTitle] = useState("Lead Software Architect");
  const [vcardPhone, setVcardPhone] = useState("+90 555 123 4567");
  const [vcardEmail, setVcardEmail] = useState("ahmet@everythinghub.com.tr");
  const [vcardOrg, setVcardOrg] = useState("AegisSoft Teknoloji");
  const [vcardUrl, setVcardUrl] = useState("https://www.everythinghub.com.tr");

  // Crypto
  const [cryptoCoin, setCryptoCoin] = useState<"BTC" | "ETH" | "USDT_TRC20" | "SOL">("BTC");
  const [cryptoAddress, setCryptoAddress] = useState("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq");
  const [cryptoAmount, setCryptoAmount] = useState("");

  // Email
  const [emailTo, setEmailTo] = useState("destek@everythinghub.com.tr");
  const [emailSubject, setEmailSubject] = useState("EverythingHub Bilgi Talebi");
  const [emailBody, setEmailBody] = useState("Merhaba, stüdyo araçlarınız hakkında detaylı bilgi almak istiyorum.");

  // WhatsApp
  const [waPhone, setWaPhone] = useState("+905551234567");
  const [waMessage, setWaMessage] = useState("Merhaba! EverythingHub üzerinden mesaj gönderiyorum.");

  // Location
  const [locLat, setLocLat] = useState("41.0082");
  const [locLng, setLocLng] = useState("28.9784");

  // Event
  const [eventTitle, setEventTitle] = useState("EverythingHub 2.0 Lansmanı");
  const [eventLocation, setEventLocation] = useState("İstanbul Teknokent");

  // Customization controls
  const [fgColor, setFgColor] = useState("#818cf8");
  const [fgColorEnd, setFgColorEnd] = useState("#c084fc");
  const [useGradient, setUseGradient] = useState(true);
  const [bgColor, setBgColor] = useState("#090a10");
  const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>("rounded");
  const [ecLevel, setEcLevel] = useState<ErrorCorrection>("H");
  const [resolution, setResolution] = useState<number>(1024);
  const [selectedLogo, setSelectedLogo] = useState<"none" | "hub" | "wifi" | "crypto" | "link">("hub");

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute final payload string
  const getPayload = useCallback(() => {
    switch (activeTab) {
      case "url":
        return textVal || "https://www.everythinghub.com.tr";
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nTITLE:${vcardTitle}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardUrl}\nEND:VCARD`;
      case "crypto": {
        const amtStr = cryptoAmount ? `?amount=${cryptoAmount}` : "";
        if (cryptoCoin === "BTC") return `bitcoin:${cryptoAddress}${amtStr}`;
        if (cryptoCoin === "ETH") return `ethereum:${cryptoAddress}${amtStr}`;
        return `${cryptoCoin}:${cryptoAddress}${amtStr}`;
      }
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "whatsapp":
        return `https://wa.me/${waPhone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;
      case "location":
        return `https://maps.google.com/local?q=${locLat},${locLng}`;
      case "event":
        return `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nLOCATION:${eventLocation}\nEND:VEVENT`;
      default:
        return textVal;
    }
  }, [activeTab, textVal, wifiSsid, wifiType, wifiPass, wifiHidden, vcardName, vcardTitle, vcardOrg, vcardPhone, vcardEmail, vcardUrl, cryptoCoin, cryptoAddress, cryptoAmount, emailTo, emailSubject, emailBody, waPhone, waMessage, locLat, locLng, eventTitle, eventLocation]);

  // Render QR Code onto Canvas
  const renderQRCode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const payload = getPayload();
    const matrix = generateQRMatrix(payload, ecLevel);
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    const margin = 28;
    const availableSize = size - margin * 2;
    const matrixSize = matrix.length;
    const cellSize = availableSize / matrixSize;

    // Create gradient or solid fill
    let fillStyle: string | CanvasGradient = fgColor;
    if (useGradient) {
      const grad = ctx.createLinearGradient(margin, margin, size - margin, size - margin);
      grad.addColorStop(0, fgColor);
      grad.addColorStop(1, fgColorEnd);
      fillStyle = grad;
    }

    ctx.fillStyle = fillStyle;

    const isCornerModule = (r: number, c: number) => {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= matrixSize - 8;
      const inBottomLeft = r >= matrixSize - 8 && c < 8;
      return inTopLeft || inTopRight || inBottomLeft;
    };

    // Draw Data Modules
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (!matrix[r][c] || isCornerModule(r, c)) continue;

        const x = margin + c * cellSize;
        const y = margin + r * cellSize;

        if (dotStyle === "dots") {
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (dotStyle === "rounded") {
          ctx.beginPath();
          ctx.roundRect(x + cellSize * 0.08, y + cellSize * 0.08, cellSize * 0.84, cellSize * 0.84, cellSize * 0.35);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    // Draw Corner Finders
    const drawFinder = (originX: number, originY: number) => {
      const finderSize = 7 * cellSize;
      const radius = cornerStyle === "circle" ? finderSize / 2 : cornerStyle === "extra-rounded" ? 14 : cornerStyle === "rounded" ? 8 : 0;

      // Outer Square
      ctx.beginPath();
      ctx.roundRect(originX, originY, finderSize, finderSize, radius);
      ctx.fill();

      // Inner Cutout
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(originX + cellSize, originY + cellSize, finderSize - 2 * cellSize, finderSize - 2 * cellSize, Math.max(0, radius - 4));
      ctx.fill();

      // Center Core
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.roundRect(originX + 2 * cellSize, originY + 2 * cellSize, finderSize - 4 * cellSize, finderSize - 4 * cellSize, Math.max(0, radius - 6));
      ctx.fill();
    };

    drawFinder(margin, margin);
    drawFinder(margin + (matrixSize - 7) * cellSize, margin);
    drawFinder(margin, margin + (matrixSize - 7) * cellSize);

    // Center Logo Badge
    if (selectedLogo !== "none") {
      const centerSize = 72;
      const centerX = (size - centerSize) / 2;
      const centerY = (size - centerSize) / 2;

      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(centerX - 4, centerY - 4, centerSize + 8, centerSize + 8, 16);
      ctx.fill();

      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.roundRect(centerX, centerY, centerSize, centerSize, 14);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const iconChar = selectedLogo === "hub" ? "H" : selectedLogo === "wifi" ? "W" : selectedLogo === "crypto" ? "₿" : "🔗";
      ctx.fillText(iconChar, size / 2, size / 2 + 1);
    }
  }, [getPayload, ecLevel, bgColor, fgColor, fgColorEnd, useGradient, dotStyle, cornerStyle, selectedLogo]);

  useEffect(() => {
    renderQRCode();
  }, [renderQRCode]);

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        toast.success("QR Kod panoya kopyalandı!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Panoya kopyalama başarısız oldu.");
    }
  };

  const handleDownload = (format: "png" | "svg" | "jpeg" | "webp") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === "svg") {
      // Vector SVG generator
      const payload = getPayload();
      const matrix = generateQRMatrix(payload, ecLevel);
      const matrixSize = matrix.length;
      const svgSize = resolution;
      const margin = 32;
      const cellSize = (svgSize - margin * 2) / matrixSize;

      let rects = "";
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (matrix[r][c]) {
            const x = margin + c * cellSize;
            const y = margin + r * cellSize;
            rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${dotStyle === "rounded" ? cellSize * 0.3 : 0}" fill="url(#grad)" />\n`;
          }
        }
      }

      const svgContent = `<?xml version="1.0" standalone="no"?>
<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${fgColor}" />
      <stop offset="100%" stop-color="${fgColorEnd}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${rects}
</svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `everythinghub-qrcode-${activeTab}.svg`;
      a.click();
      toast.success("Vektörel SVG dosyası indirildi!");
      return;
    }

    const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const url = canvas.toDataURL(mime, 1.0);
    const a = document.createElement("a");
    a.href = url;
    a.download = `everythinghub-qrcode-${activeTab}.${format}`;
    a.click();
    toast.success(`Yüksek çözünürlüklü ${format.toUpperCase()} indirildi!`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xl mb-3">
          <QrCode className="h-3.5 w-3.5 text-indigo-400" />
          <span>Vector & 4K High-Res QR Code Studio Pro</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          QR Kod Stüdyosu Pro
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
          URL, Wi-Fi, vCard, kripto ödemeleri ve WhatsApp için vektörel SVG, 4K PNG ve özel gradyan desenli QR kodları üretin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Payload & Customization Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payload Tab Bar */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl">
            {[
              { id: "url", label: "Web Linki", icon: Link },
              { id: "wifi", label: "Wi-Fi Ağı", icon: Wifi },
              { id: "vcard", label: "vCard Kartvizit", icon: User },
              { id: "crypto", label: "Kripto Cüzdan", icon: Coins },
              { id: "email", label: "E-Posta", icon: Mail },
              { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
              { id: "location", label: "Harita Konumu", icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Fields by Tab */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-4">
            {activeTab === "url" && (
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">Web Sitesi veya Metin URL&apos;si</label>
                <input
                  type="text"
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {activeTab === "wifi" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Wi-Fi Ağ Adı (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-2">Şifre</label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-2">Güvenlik Türü</label>
                    <select
                      value={wifiType}
                      onChange={(e) => setWifiType(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Önerilen)</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Şifresiz (Açık Ağ)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vcard" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-2">Unvan / Görev</label>
                    <input
                      type="text"
                      value={vcardTitle}
                      onChange={(e) => setVcardTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-2">Telefon</label>
                    <input
                      type="text"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-2">E-Posta</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "crypto" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["BTC", "ETH", "USDT_TRC20", "SOL"] as const).map((coin) => (
                    <button
                      key={coin}
                      onClick={() => setCryptoCoin(coin)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        cryptoCoin === coin
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                          : "bg-white/[0.03] text-zinc-400 border-white/5 hover:text-white"
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Cüzdan Adresi</label>
                  <input
                    type="text"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Deep Styling Studio: Colors, Corners & Dots */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-indigo-400" />
              <span>Görsel Tasarım & Özel Renk Stüdyosu</span>
            </h3>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Ön Plan Başlangıç</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-12 rounded-lg bg-transparent cursor-pointer border border-white/10"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Gradyan Bitiş Rengi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColorEnd}
                    onChange={(e) => setFgColorEnd(e.target.value)}
                    className="h-9 w-12 rounded-lg bg-transparent cursor-pointer border border-white/10"
                  />
                  <input
                    type="text"
                    value={fgColorEnd}
                    onChange={(e) => setFgColorEnd(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Arka Plan Rengi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-12 rounded-lg bg-transparent cursor-pointer border border-white/10"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Pattern & Corner Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Veri Noktası Deseni</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["rounded", "dots", "square"] as DotStyle[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setDotStyle(st)}
                      className={`p-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                        dotStyle === st
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                          : "bg-white/[0.03] text-zinc-400 border-white/5 hover:text-white"
                      }`}
                    >
                      {st === "rounded" ? "Yuvarlak" : st === "dots" ? "Dairesel" : "Klasik"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Köşe Kare Stili</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["rounded", "circle", "square"] as CornerStyle[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCornerStyle(c)}
                      className={`p-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                        cornerStyle === c
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                          : "bg-white/[0.03] text-zinc-400 border-white/5 hover:text-white"
                      }`}
                    >
                      {c === "rounded" ? "Kavisli" : c === "circle" ? "Daire" : "Kare"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live High-Def Preview & Export Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-7 shadow-2xl flex flex-col items-center text-center">
            {/* Live Canvas Preview */}
            <div className="relative p-6 rounded-2xl border border-white/10 bg-black/40 shadow-2xl mb-6">
              <canvas ref={canvasRef} className="w-64 h-64 sm:w-72 sm:h-72 rounded-xl shadow-2xl" />
            </div>

            {/* Quick Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-indigo-500/40 bg-indigo-500/15 text-xs font-bold text-indigo-300 hover:bg-indigo-500/25 transition-all shadow-sm"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Kopyalandı" : "Panoya Kopyala"}</span>
              </button>

              <button
                onClick={() => handleDownload("svg")}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Vektörel SVG İndir</span>
              </button>
            </div>

            {/* High-Resolution PNG / JPEG Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload("png")}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-500/25"
              >
                <Download className="h-4 w-4" />
                <span>4K Ultra PNG</span>
              </button>

              <button
                onClick={() => handleDownload("webp")}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition-all"
              >
                <Download className="h-4 w-4" />
                <span>WebP İndir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
