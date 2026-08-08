"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  QrCode,
  Wifi,
  User,
  Mail,
  Coins,
  Download,
  Copy,
  Check,
  Palette,
  Sparkles,
  FileCode2,
  Phone,
  MapPin,
  Calendar,
  MessageCircle,
  Upload,
  Globe,
  Smartphone,
  AtSign,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { createQRCodeMatrix, type ErrorCorrectionLevel } from "@/lib/qr-generator";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type TabType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "sms"
  | "whatsapp"
  | "phone"
  | "crypto"
  | "location"
  | "event"
  | "social";

type DotStyle = "square" | "dots" | "rounded" | "extra-rounded" | "diamond" | "leaf" | "fluid";
type CornerFrameStyle = "square" | "rounded" | "extra-rounded" | "circle" | "leaf" | "shield";
type CornerDotStyle = "square" | "circle" | "diamond" | "rounded";
type CtaStyle = "none" | "bottom-pill" | "top-banner" | "boxed-frame" | "polaroid";

const COLOR_PRESETS = [
  { name: "Royal Indigo", start: "#6366f1", end: "#a855f7", bg: "#090a10" },
  { name: "Emerald Mint", start: "#10b981", end: "#06b6d4", bg: "#090a10" },
  { name: "Cyberpunk Neon", start: "#ec4899", end: "#8b5cf6", bg: "#090a10" },
  { name: "Sunset Gold", start: "#f59e0b", end: "#ef4444", bg: "#090a10" },
  { name: "Dark Stealth", start: "#e2e8f0", end: "#94a3b8", bg: "#090a10" },
  { name: "Pure Light", start: "#0f172a", end: "#1e293b", bg: "#ffffff" },
];

const PRESET_LOGOS = [
  { id: "none", nameTr: "Yok", nameEn: "None" },
  { id: "hub", nameTr: "EverythingHub", nameEn: "EverythingHub" },
  { id: "wifi", nameTr: "Wi-Fi", nameEn: "Wi-Fi" },
  { id: "whatsapp", nameTr: "WhatsApp", nameEn: "WhatsApp" },
  { id: "youtube", nameTr: "YouTube", nameEn: "YouTube" },
  { id: "instagram", nameTr: "Instagram", nameEn: "Instagram" },
  { id: "x", nameTr: "X / Twitter", nameEn: "X / Twitter" },
  { id: "bitcoin", nameTr: "Bitcoin", nameEn: "Bitcoin" },
  { id: "phone", nameTr: "Telefon", nameEn: "Phone" },
  { id: "mail", nameTr: "E-Posta", nameEn: "Email" },
  { id: "map", nameTr: "Konum", nameEn: "Location" },
];

export function QRCodeStudioClient() {
  const { lang } = useLanguage();
  const isTurkish = lang === "tr";

  const [activeTab, setActiveTab] = useState<TabType>("url");

  // Form states
  const [urlVal, setUrlVal] = useState("https://www.everythinghub.com.tr");
  const [textVal, setTextVal] = useState("EverythingHub Universal Creative Engine");

  // WiFi
  const [wifiSsid, setWifiSsid] = useState("Studio_Network_5G");
  const [wifiPass, setWifiPass] = useState("AegisSoft2026!");
  const [wifiType, setWifiType] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardFirst, setVcardFirst] = useState("Ahmet");
  const [vcardLast, setVcardLast] = useState("Yılmaz");
  const [vcardTitle, setVcardTitle] = useState("Lead Systems Architect");
  const [vcardOrg, setVcardOrg] = useState("AegisSoft Teknoloji");
  const [vcardPhone, setVcardPhone] = useState("+90 555 123 4567");
  const [vcardEmail, setVcardEmail] = useState("ahmet@everythinghub.com.tr");
  const [vcardUrl, setVcardUrl] = useState("https://www.everythinghub.com.tr");
  const [vcardStreet, setVcardStreet] = useState("Teknokent Cad. No:4");
  const [vcardCity, setVcardCity] = useState("İstanbul");

  // Email
  const [emailTo, setEmailTo] = useState("destek@everythinghub.com.tr");
  const [emailSubject, setEmailSubject] = useState("EverythingHub Bilgi Talebi");
  const [emailBody, setEmailBody] = useState("Merhaba, araçlarınız hakkında detaylı bilgi almak istiyorum.");

  // SMS
  const [smsPhone, setSmsPhone] = useState("+905551234567");
  const [smsBody, setSmsBody] = useState("EverythingHub QR Kodu üzerinden gönderildi.");

  // WhatsApp
  const [waPhone, setWaPhone] = useState("+905551234567");
  const [waMessage, setWaMessage] = useState("Merhaba! EverythingHub stüdyosu üzerinden ulaşıyorum.");

  // Phone Call
  const [callPhone, setCallPhone] = useState("+905551234567");

  // Crypto
  const [cryptoCoin, setCryptoCoin] = useState<"BTC" | "ETH" | "SOL" | "USDT" | "DOGE">("BTC");
  const [cryptoAddress, setCryptoAddress] = useState("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq");
  const [cryptoAmount, setCryptoAmount] = useState("");

  // Location
  const [locLat, setLocLat] = useState("41.0082");
  const [locLng, setLocLng] = useState("28.9784");

  // Event
  const [eventTitle, setEventTitle] = useState("EverythingHub 2.0 Lansmanı");
  const [eventLocation, setEventLocation] = useState("İstanbul Teknokent");
  const [eventStart, setEventStart] = useState("2026-09-01T10:00");
  const [eventEnd, setEventEnd] = useState("2026-09-01T18:00");

  // Social
  const [socialPlatform, setSocialPlatform] = useState<"instagram" | "x" | "linkedin" | "youtube" | "github">("instagram");
  const [socialUsername, setSocialUsername] = useState("everythinghub");

  // Customization controls
  const [fgColor, setFgColor] = useState("#818cf8");
  const [fgColorEnd, setFgColorEnd] = useState("#c084fc");
  const [gradientType, setGradientType] = useState<"none" | "linear" | "radial">("linear");
  const [gradientAngle, setGradientAngle] = useState(45);
  const [bgColor, setBgColor] = useState("#090a10");
  const [transparentBg, setTransparentBg] = useState(false);

  const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
  const [cornerFrameStyle, setCornerFrameStyle] = useState<CornerFrameStyle>("rounded");
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotStyle>("circle");
  const [cornerColor, setCornerColor] = useState("#818cf8");
  const [customCornerColor, setCustomCornerColor] = useState(false);

  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>("H");
  const [resolution, setResolution] = useState<number>(1024);

  // Logo & CTA
  const [selectedLogo, setSelectedLogo] = useState<string>("hub");
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);
  const [logoShape, setLogoShape] = useState<"circle" | "rounded" | "square" | "none">("rounded");

  const [ctaStyle, setCtaStyle] = useState<CtaStyle>("none");
  const [ctaText, setCtaText] = useState(isTurkish ? "BANA TARA" : "SCAN ME");
  const [ctaBgColor, setCtaBgColor] = useState("#6366f1");

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Build Payload
  const getPayload = useCallback((): string => {
    switch (activeTab) {
      case "url":
        return urlVal || "https://www.everythinghub.com.tr";
      case "text":
        return textVal || "EverythingHub";
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardLast};${vcardFirst};;;\nFN:${vcardFirst} ${vcardLast}\nORG:${vcardOrg}\nTITLE:${vcardTitle}\nTEL;TYPE=CELL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardUrl}\nADR;TYPE=WORK:;;${vcardStreet};${vcardCity};;;;\nEND:VCARD`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "sms":
        return `smsto:${smsPhone.replace(/\s+/g, "")}:${smsBody}`;
      case "whatsapp":
        return `https://wa.me/${waPhone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;
      case "phone":
        return `tel:${callPhone.replace(/\s+/g, "")}`;
      case "crypto": {
        const amtStr = cryptoAmount ? `?amount=${cryptoAmount}` : "";
        if (cryptoCoin === "BTC") return `bitcoin:${cryptoAddress}${amtStr}`;
        if (cryptoCoin === "ETH") return `ethereum:${cryptoAddress}${amtStr}`;
        if (cryptoCoin === "SOL") return `solana:${cryptoAddress}${amtStr}`;
        return `${cryptoCoin.toLowerCase()}:${cryptoAddress}${amtStr}`;
      }
      case "location":
        return `https://maps.google.com/local?q=${locLat},${locLng}`;
      case "event": {
        const fmtDate = (d: string) => d.replace(/[-:]/g, "") + "00Z";
        return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${eventTitle}\nLOCATION:${eventLocation}\nDTSTART:${fmtDate(eventStart)}\nDTEND:${fmtDate(eventEnd)}\nEND:VEVENT\nEND:VCALENDAR`;
      }
      case "social": {
        const u = socialUsername.replace(/^@/, "");
        if (socialPlatform === "instagram") return `https://instagram.com/${u}`;
        if (socialPlatform === "x") return `https://x.com/${u}`;
        if (socialPlatform === "linkedin") return `https://linkedin.com/in/${u}`;
        if (socialPlatform === "youtube") return `https://youtube.com/@${u}`;
        if (socialPlatform === "github") return `https://github.com/${u}`;
        return `https://everythinghub.com.tr`;
      }
      default:
        return urlVal;
    }
  }, [
    activeTab,
    urlVal,
    textVal,
    wifiSsid,
    wifiType,
    wifiPass,
    wifiHidden,
    vcardFirst,
    vcardLast,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardUrl,
    vcardStreet,
    vcardCity,
    emailTo,
    emailSubject,
    emailBody,
    smsPhone,
    smsBody,
    waPhone,
    waMessage,
    callPhone,
    cryptoCoin,
    cryptoAddress,
    cryptoAmount,
    locLat,
    locLng,
    eventTitle,
    eventLocation,
    eventStart,
    eventEnd,
    socialPlatform,
    socialUsername,
  ]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error(isTurkish ? "Logo dosyası maksimum 3MB olmalıdır." : "Logo must be under 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedLogo(reader.result as string);
        setSelectedLogo("uploaded");
        toast.success(isTurkish ? "Özel logo yüklendi!" : "Custom logo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Render QR Code onto Canvas
  const renderQRCode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const payload = getPayload();
    const matrix = createQRCodeMatrix(payload, ecLevel);
    const matrixSize = matrix.length;

    // Dimension setup
    const qrSize = 512;
    const padding = 28;
    const ctaHeight = ctaStyle !== "none" ? 64 : 0;
    const totalHeight = qrSize + ctaHeight;

    canvas.width = qrSize;
    canvas.height = totalHeight;

    // Background
    if (transparentBg) {
      ctx.clearRect(0, 0, qrSize, totalHeight);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, qrSize, totalHeight);
    }

    const availableArea = qrSize - padding * 2;
    const cellSize = availableArea / matrixSize;

    // Build gradient or solid color
    let bodyFill: string | CanvasGradient = fgColor;
    if (gradientType === "linear") {
      const angleRad = (gradientAngle * Math.PI) / 180;
      const x1 = qrSize / 2 - (Math.cos(angleRad) * qrSize) / 2;
      const y1 = qrSize / 2 - (Math.sin(angleRad) * qrSize) / 2;
      const x2 = qrSize / 2 + (Math.cos(angleRad) * qrSize) / 2;
      const y2 = qrSize / 2 + (Math.sin(angleRad) * qrSize) / 2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, fgColor);
      grad.addColorStop(1, fgColorEnd);
      bodyFill = grad;
    } else if (gradientType === "radial") {
      const grad = ctx.createRadialGradient(
        qrSize / 2,
        qrSize / 2,
        10,
        qrSize / 2,
        qrSize / 2,
        qrSize / 1.5
      );
      grad.addColorStop(0, fgColor);
      grad.addColorStop(1, fgColorEnd);
      bodyFill = grad;
    }

    // Helper: Is this cell inside the 3 finder corners? (7x7 top-left, top-right, bottom-left)
    const isFinderCell = (r: number, c: number) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= matrixSize - 7) return true;
      if (r >= matrixSize - 7 && c < 7) return true;
      return false;
    };

    // Helper: Is inside center logo exclusion zone?
    const hasLogo = selectedLogo !== "none" || !!uploadedLogo;
    const logoCells = hasLogo ? Math.floor(matrixSize * (logoSizePercent / 100)) : 0;
    const centerStart = Math.floor((matrixSize - logoCells) / 2);
    const centerEnd = centerStart + logoCells;

    const isCenterCell = (r: number, c: number) => {
      if (!hasLogo) return false;
      return r >= centerStart && r < centerEnd && c >= centerStart && c < centerEnd;
    };

    // Draw Data Modules
    ctx.fillStyle = bodyFill;
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (!matrix[r][c] || isFinderCell(r, c) || isCenterCell(r, c)) continue;

        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        const s = cellSize;

        ctx.beginPath();
        if (dotStyle === "square") {
          ctx.fillRect(x, y, s, s);
        } else if (dotStyle === "dots" || dotStyle === "rounded") {
          const radius = dotStyle === "dots" ? s * 0.45 : s * 0.25;
          ctx.arc(x + s / 2, y + s / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (dotStyle === "extra-rounded") {
          ctx.arc(x + s / 2, y + s / 2, s * 0.48, 0, Math.PI * 2);
          ctx.fill();
        } else if (dotStyle === "diamond") {
          ctx.moveTo(x + s / 2, y);
          ctx.lineTo(x + s, y + s / 2);
          ctx.lineTo(x + s / 2, y + s);
          ctx.lineTo(x, y + s / 2);
          ctx.closePath();
          ctx.fill();
        } else if (dotStyle === "leaf") {
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + s, y, x + s, y + s);
          ctx.lineTo(x, y + s);
          ctx.closePath();
          ctx.fill();
        } else if (dotStyle === "fluid") {
          ctx.roundRect(x + 0.5, y + 0.5, s - 1, s - 1, s * 0.35);
          ctx.fill();
        }
      }
    }

    // Draw 3 Finder Corner Eyes
    const cornerEyeColor = customCornerColor ? cornerColor : bodyFill;
    ctx.fillStyle = cornerEyeColor;
    ctx.strokeStyle = cornerEyeColor as string;

    const drawFinder = (r: number, c: number) => {
      const x = padding + c * cellSize;
      const y = padding + r * cellSize;
      const s = cellSize * 7;

      // Outer Frame (7x7)
      ctx.lineWidth = cellSize;
      ctx.beginPath();
      if (cornerFrameStyle === "square") {
        ctx.strokeRect(x + cellSize / 2, y + cellSize / 2, s - cellSize, s - cellSize);
      } else if (cornerFrameStyle === "rounded") {
        ctx.roundRect(x + cellSize / 2, y + cellSize / 2, s - cellSize, s - cellSize, cellSize * 1.5);
        ctx.stroke();
      } else if (cornerFrameStyle === "extra-rounded" || cornerFrameStyle === "circle") {
        ctx.arc(x + s / 2, y + s / 2, (s - cellSize) / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (cornerFrameStyle === "shield") {
        ctx.roundRect(x + cellSize / 2, y + cellSize / 2, s - cellSize, s - cellSize, [0, cellSize * 2, cellSize * 2, cellSize * 2]);
        ctx.stroke();
      } else {
        ctx.roundRect(x + cellSize / 2, y + cellSize / 2, s - cellSize, s - cellSize, cellSize);
        ctx.stroke();
      }

      // Inner Dot (3x3)
      const innerX = x + cellSize * 2;
      const innerY = y + cellSize * 2;
      const innerSize = cellSize * 3;

      ctx.beginPath();
      if (cornerDotStyle === "circle") {
        ctx.arc(x + s / 2, y + s / 2, innerSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (cornerDotStyle === "diamond") {
        ctx.moveTo(innerX + innerSize / 2, innerY);
        ctx.lineTo(innerX + innerSize, innerY + innerSize / 2);
        ctx.lineTo(innerX + innerSize / 2, innerY + innerSize);
        ctx.lineTo(innerX, innerY + innerSize / 2);
        ctx.closePath();
        ctx.fill();
      } else if (cornerDotStyle === "rounded") {
        ctx.roundRect(innerX, innerY, innerSize, innerSize, cellSize * 0.8);
        ctx.fill();
      } else {
        ctx.fillRect(innerX, innerY, innerSize, innerSize);
      }
    };

    drawFinder(0, 0);
    drawFinder(0, matrixSize - 7);
    drawFinder(matrixSize - 7, 0);

    // Draw Center Logo Overlay if enabled
    if (hasLogo) {
      const lx = padding + centerStart * cellSize;
      const ly = padding + centerStart * cellSize;
      const lw = logoCells * cellSize;
      const lh = logoCells * cellSize;

      // Draw Badge Background
      ctx.fillStyle = transparentBg ? "#090a10" : bgColor;
      ctx.beginPath();
      if (logoShape === "circle") {
        ctx.arc(lx + lw / 2, ly + lh / 2, lw / 2, 0, Math.PI * 2);
      } else if (logoShape === "rounded") {
        ctx.roundRect(lx, ly, lw, lh, lw * 0.25);
      } else if (logoShape === "square") {
        ctx.rect(lx, ly, lw, lh);
      }
      ctx.fill();

      // Draw Inner Logo Glyph or Image
      if (uploadedLogo && selectedLogo === "uploaded") {
        const img = new Image();
        img.src = uploadedLogo;
        img.onload = () => {
          ctx.drawImage(img, lx + lw * 0.15, ly + lh * 0.15, lw * 0.7, lh * 0.7);
        };
      } else if (selectedLogo === "hub") {
        ctx.fillStyle = "#818cf8";
        ctx.beginPath();
        ctx.arc(lx + lw / 2, ly + lh / 2, lw * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Call-To-Action (CTA) Framing
    if (ctaStyle !== "none") {
      ctx.fillStyle = ctaBgColor;
      const ctaY = qrSize - 10;
      const ctaW = qrSize - padding * 2;

      ctx.beginPath();
      ctx.roundRect(padding, ctaY, ctaW, 44, 22);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ctaText.toUpperCase(), qrSize / 2, ctaY + 22);
    }
  }, [
    getPayload,
    ecLevel,
    transparentBg,
    bgColor,
    fgColor,
    fgColorEnd,
    gradientType,
    gradientAngle,
    dotStyle,
    cornerFrameStyle,
    cornerDotStyle,
    cornerColor,
    customCornerColor,
    selectedLogo,
    uploadedLogo,
    logoSizePercent,
    logoShape,
    ctaStyle,
    ctaText,
    ctaBgColor,
  ]);

  useEffect(() => {
    renderQRCode();
  }, [renderQRCode]);

  // Export functions
  const downloadPNG = (scale = 2) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High resolution render
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;
    const expCtx = exportCanvas.getContext("2d");
    if (!expCtx) return;

    expCtx.imageSmoothingEnabled = false;
    expCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const a = document.createElement("a");
    a.download = `EverythingHub_QRCode_${activeTab}_${scale}x.png`;
    a.href = exportCanvas.toDataURL("image/png");
    a.click();
    toast.success(isTurkish ? "Yüksek çözünürlüklü PNG indirildi!" : "High-Res PNG downloaded!");
  };

  const downloadSVG = () => {
    const payload = getPayload();
    const matrix = createQRCodeMatrix(payload, ecLevel);
    const size = matrix.length;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${resolution}" height="${resolution}">`;
    if (!transparentBg) {
      svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
    }
    svg += `<path d="`;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          svg += `M${c},${r}h1v1h-1z `;
        }
      }
    }
    svg += `" fill="${fgColor}"/></svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `EverythingHub_QRCode_${activeTab}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isTurkish ? "Vektörel SVG indirildi!" : "Vector SVG downloaded!");
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          toast.success(isTurkish ? "QR Kod panoya kopyalandı!" : "QR Code copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch {
      toast.error(isTurkish ? "Kopyalama başarısız oldu." : "Failed to copy image.");
    }
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const win = window.open("");
    if (!win) return;
    win.document.write(
      `<html><head><title>Print EverythingHub QR</title></head><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><img src="${canvas.toDataURL()}" style="max-width:80%;max-height:80%;" onload="window.print();window.close();"/></body></html>`
    );
    win.document.close();
  };

  const TABS = [
    { id: "url", labelTr: "Web Sitesi", labelEn: "Website", icon: Globe },
    { id: "text", labelTr: "Düz Metin", labelEn: "Plain Text", icon: FileCode2 },
    { id: "wifi", labelTr: "Wi-Fi Ağı", labelEn: "Wi-Fi Network", icon: Wifi },
    { id: "vcard", labelTr: "Dijital Kartvizit", labelEn: "vCard 3.0", icon: User },
    { id: "email", labelTr: "E-Posta", labelEn: "Email", icon: Mail },
    { id: "sms", labelTr: "SMS Mesaj", labelEn: "SMS", icon: Smartphone },
    { id: "whatsapp", labelTr: "WhatsApp", labelEn: "WhatsApp", icon: MessageCircle },
    { id: "phone", labelTr: "Telefon", labelEn: "Phone", icon: Phone },
    { id: "crypto", labelTr: "Kripto Cüzdan", labelEn: "Crypto Wallet", icon: Coins },
    { id: "location", labelTr: "Konum / Harita", labelEn: "Location", icon: MapPin },
    { id: "event", labelTr: "Takvim Etkinliği", labelEn: "Calendar Event", icon: Calendar },
    { id: "social", labelTr: "Sosyal Medya", labelEn: "Social Links", icon: AtSign },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-xl">
          <QrCode className="h-4 w-4 text-indigo-400" />
          <span>{isTurkish ? "Profesyonel Vektörel QR Stüdyosu Pro" : "Professional Vector QR Studio Pro"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {isTurkish ? "QR Kod Stüdyosu Pro" : "QR Code Studio Pro"}
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          {isTurkish
            ? "12 farklı veri tipi, özel degrade renkler, merkez logo rozetleri, CTA çerçeveleri ve 4096px baskı kalitesinde vektörel dışa aktarma."
            : "Generate 12 data types with custom gradients, center brand badges, CTA frames, and 4096px print-ready vector exports."}
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Data Input & Styling Studio */}
        <div className="lg:col-span-7 space-y-6">
          {/* Data Type Tabs Bar */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-4 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as TabType)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      active
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                        : "bg-white/[0.02] text-zinc-400 border border-white/5 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{isTurkish ? t.labelTr : t.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Form Content */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              {activeTab === "url" && (
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    {isTurkish ? "Hedef Web Sitesi Bağlantısı (URL)" : "Target Website URL"}
                  </label>
                  <input
                    type="url"
                    value={urlVal}
                    onChange={(e) => setUrlVal(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {activeTab === "text" && (
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                    {isTurkish ? "Düz Metin & Not" : "Plain Text & Memo"}
                  </label>
                  <textarea
                    rows={3}
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    placeholder={isTurkish ? "Metninizi buraya yazın..." : "Type your text here..."}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {activeTab === "wifi" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        {isTurkish ? "Ağ Adı (SSID)" : "Network Name (SSID)"}
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        {isTurkish ? "Ağ Şifresi" : "Network Password"}
                      </label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                        {isTurkish ? "Şifreleme Türü" : "Encryption Type"}
                      </label>
                      <select
                        value={wifiType}
                        onChange={(e) => setWifiType(e.target.value as any)}
                        className="w-full rounded-2xl border border-white/10 bg-[#181920] px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">{isTurkish ? "Şifresiz (Açık Ağ)" : "Open / No Password"}</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-4">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="h-4 w-4 rounded accent-indigo-500"
                      />
                      <span>{isTurkish ? "Gizli Ağ (Hidden SSID)" : "Hidden Network"}</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "vcard" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "Ad" : "First Name"}</label>
                      <input
                        type="text"
                        value={vcardFirst}
                        onChange={(e) => setVcardFirst(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "Soyad" : "Last Name"}</label>
                      <input
                        type="text"
                        value={vcardLast}
                        onChange={(e) => setVcardLast(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "Şirket / Organizasyon" : "Organization"}</label>
                      <input
                        type="text"
                        value={vcardOrg}
                        onChange={(e) => setVcardOrg(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "Unvan / Görev" : "Job Title"}</label>
                      <input
                        type="text"
                        value={vcardTitle}
                        onChange={(e) => setVcardTitle(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "Telefon" : "Phone"}</label>
                      <input
                        type="text"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "E-Posta" : "Email"}</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "email" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "Alıcı E-Posta" : "Recipient Email"}</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "Konu" : "Subject"}</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">{isTurkish ? "Mesaj Metni" : "Message Body"}</label>
                    <textarea
                      rows={2}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      {isTurkish ? "Uluslararası Telefon Numarası" : "International Phone Number"}
                    </label>
                    <input
                      type="text"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="+905551234567"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      {isTurkish ? "Hazır Karşılama Mesajı" : "Pre-filled Message"}
                    </label>
                    <textarea
                      rows={2}
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "crypto" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(["BTC", "ETH", "SOL", "USDT", "DOGE"] as const).map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setCryptoCoin(coin)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cryptoCoin === coin
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                            : "bg-white/[0.03] text-zinc-400 border border-white/10 hover:text-white"
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                      {isTurkish ? "Cüzdan Adresi" : "Wallet Address"}
                    </label>
                    <input
                      type="text"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deep Design & Styling Studio */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-indigo-400" />
              <span>{isTurkish ? "Görsel Tasarım & Özel Renk Stüdyosu" : "Visual Design & Color Studio"}</span>
            </h3>

            {/* Quick Studio Palettes */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                {isTurkish ? "Hazır Stüdyo Temaları:" : "Curated Studio Themes:"}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFgColor(p.start);
                      setFgColorEnd(p.end);
                      setBgColor(p.bg);
                      setGradientType("linear");
                      setTransparentBg(false);
                    }}
                    className="p-2.5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center gap-2.5 text-xs text-zinc-300 font-medium cursor-pointer"
                  >
                    <div
                      className="h-4 w-4 rounded-full shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${p.start}, ${p.end})` }}
                    />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  {isTurkish ? "Ön Plan Rengi" : "Foreground Color"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-10 rounded-xl bg-transparent cursor-pointer border border-white/10"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  {isTurkish ? "Degrade Bitiş Rengi" : "Gradient End Color"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColorEnd}
                    onChange={(e) => setFgColorEnd(e.target.value)}
                    className="h-9 w-10 rounded-xl bg-transparent cursor-pointer border border-white/10"
                  />
                  <input
                    type="text"
                    value={fgColorEnd}
                    onChange={(e) => setFgColorEnd(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  {isTurkish ? "Arka Plan Rengi" : "Background Color"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    disabled={transparentBg}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-10 rounded-xl bg-transparent cursor-pointer border border-white/10"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-indigo-500"
                    />
                    <span>{isTurkish ? "Şeffaf" : "Transparent"}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pattern & Corner Customizers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  {isTurkish ? "Gövde Deseni" : "Dot Pattern"}
                </label>
                <select
                  value={dotStyle}
                  onChange={(e) => setDotStyle(e.target.value as DotStyle)}
                  className="w-full rounded-xl border border-white/10 bg-[#181920] px-3 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  <option value="square">{isTurkish ? "Kare (Klasik)" : "Square (Classic)"}</option>
                  <option value="rounded">{isTurkish ? "Yuvarlatılmış" : "Rounded"}</option>
                  <option value="extra-rounded">{isTurkish ? "Pürüzsüz Daire" : "Smooth Circle"}</option>
                  <option value="diamond">{isTurkish ? "Elmas" : "Diamond"}</option>
                  <option value="leaf">{isTurkish ? "Yaprak" : "Leaf"}</option>
                  <option value="fluid">{isTurkish ? "Akışkan Fluid" : "Connected Fluid"}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  {isTurkish ? "Köşe Çerçeve Stili" : "Corner Eye Frame"}
                </label>
                <select
                  value={cornerFrameStyle}
                  onChange={(e) => setCornerFrameStyle(e.target.value as CornerFrameStyle)}
                  className="w-full rounded-xl border border-white/10 bg-[#181920] px-3 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  <option value="square">{isTurkish ? "Kare" : "Square"}</option>
                  <option value="rounded">{isTurkish ? "Yuvarlatılmış Kutu" : "Rounded Box"}</option>
                  <option value="circle">{isTurkish ? "Daire" : "Circle"}</option>
                  <option value="shield">{isTurkish ? "Kalkan" : "Shield"}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  {isTurkish ? "Köşe İç Noktası" : "Corner Inner Dot"}
                </label>
                <select
                  value={cornerDotStyle}
                  onChange={(e) => setCornerDotStyle(e.target.value as CornerDotStyle)}
                  className="w-full rounded-xl border border-white/10 bg-[#181920] px-3 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  <option value="circle">{isTurkish ? "Daire" : "Circle"}</option>
                  <option value="square">{isTurkish ? "Kare" : "Square"}</option>
                  <option value="diamond">{isTurkish ? "Elmas" : "Diamond"}</option>
                  <option value="rounded">{isTurkish ? "Yuvarlatılmış" : "Rounded"}</option>
                </select>
              </div>
            </div>

            {/* Center Brand Logo & CTA Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  {isTurkish ? "Merkez Logo / İkon" : "Center Brand Logo"}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLogo}
                    onChange={(e) => setSelectedLogo(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#181920] px-3 py-2 text-xs font-bold text-white cursor-pointer"
                  >
                    {PRESET_LOGOS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {isTurkish ? l.nameTr : l.nameEn}
                      </option>
                    ))}
                    {uploadedLogo && <option value="uploaded">{isTurkish ? "Özel Yüklenen Logo" : "Uploaded Custom Logo"}</option>}
                  </select>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-zinc-300 transition-all shrink-0 cursor-pointer"
                    title={isTurkish ? "Özel Logo Yükle" : "Upload Custom Logo"}
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  {isTurkish ? "Harekete Geçirici Çerçeve (CTA)" : "Call-to-Action (CTA) Frame"}
                </label>
                <select
                  value={ctaStyle}
                  onChange={(e) => setCtaStyle(e.target.value as CtaStyle)}
                  className="w-full rounded-xl border border-white/10 bg-[#181920] px-3 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  <option value="none">{isTurkish ? "Çerçevesiz" : "None / Frameless"}</option>
                  <option value="bottom-pill">{isTurkish ? "Alt Rozet (SCAN ME)" : "Bottom Badge (SCAN ME)"}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Canvas Preview & Multi-Format Exports */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {isTurkish ? "Canlı Vektörel Önizleme" : "Live Vector Preview"}
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                100% Scannable ISO
              </span>
            </div>

            {/* Canvas Container */}
            <div className="flex justify-center p-4 rounded-2xl border border-white/5 bg-black/40 shadow-inner">
              <canvas
                ref={canvasRef}
                className="max-w-[280px] sm:max-w-[320px] w-full h-auto rounded-xl shadow-2xl transition-all"
              />
            </div>

            {/* Action Buttons Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadPNG(2)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 px-4 py-3 text-xs font-bold text-indigo-300 hover:bg-indigo-500/30 transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                >
                  <Download className="h-4 w-4" />
                  <span>PNG (Ultra HD)</span>
                </button>

                <button
                  onClick={downloadSVG}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-purple-500/20 border border-purple-500/40 px-4 py-3 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer"
                >
                  <FileCode2 className="h-4 w-4" />
                  <span>SVG (Vektör)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyImage}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] px-4 py-2.5 text-xs font-medium text-zinc-300 transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? (isTurkish ? "Kopyalandı" : "Copied") : isTurkish ? "Panoya Kopyala" : "Copy Image"}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] px-4 py-2.5 text-xs font-medium text-zinc-300 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>{isTurkish ? "Yazdır" : "Print"}</span>
                </button>
              </div>
            </div>

            {/* Error Correction Level Pill Selector */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">
                {isTurkish ? "Hata Düzeltme (EC):" : "Error Correction:"}
              </span>
              <div className="flex gap-1">
                {(["L", "M", "Q", "H"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setEcLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      ecLevel === lvl
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                        : "bg-white/[0.04] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
