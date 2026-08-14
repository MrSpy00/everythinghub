"use client";
// ============================================================
// aegisTyping — Public Result Certificate & Share Viewer
// Pure liquid glass certificate, verified badge, and instant CTA
// ============================================================
import React, { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Keyboard,
  Trophy,
  Check,
  Share2,
  Download,
  Link2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getSpeedTier, SPEED_TIER_LABELS } from "../types";

export function ResultShareClient() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const wpm = parseFloat(searchParams.get("wpm") || "0");
  const rawWpm = parseFloat(searchParams.get("raw") || searchParams.get("wpm") || "0");
  const accuracy = parseFloat(searchParams.get("acc") || "100");
  const mode = searchParams.get("mode") || "time";
  const lang = searchParams.get("lang") || "tr-q";
  const nickname = searchParams.get("nick") || "Anonim Oyuncu";

  const tier = getSpeedTier(wpm);
  const tierInfo = SPEED_TIER_LABELS[tier];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `aegisTyping Studio üzerinde ${Math.round(wpm)} WPM hız ve %${accuracy.toFixed(1)} doğruluk skoru elde ettim! Test bağlantısı: ${shareUrl}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [shareUrl]);

  const handleDownloadPng = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark glass background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gradient accent glow
      const grad = ctx.createRadialGradient(600, 315, 50, 600, 315, 600);
      grad.addColorStop(0, "rgba(34, 211, 238, 0.15)");
      grad.addColorStop(1, "rgba(9, 9, 11, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Title
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px Inter, sans-serif";
      ctx.fillText("aegisTyping Studio — Hız Testi Sertifikası", canvas.width / 2, 110);

      // Subtitle
      ctx.fillStyle = "#94a3b8";
      ctx.font = "20px Inter, sans-serif";
      ctx.fillText(`Oyuncu: ${nickname} • Dil: ${lang.toUpperCase()} • Mod: ${mode}`, canvas.width / 2, 155);

      // Net WPM
      ctx.fillStyle = tierInfo.color || "#22d3ee";
      ctx.font = "bold 150px monospace";
      ctx.fillText(`${Math.round(wpm)}`, canvas.width / 2 - 160, 360);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 32px Inter, sans-serif";
      ctx.fillText("Net WPM", canvas.width / 2 - 160, 415);

      // Accuracy
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 150px monospace";
      ctx.fillText(`%${Math.round(accuracy)}`, canvas.width / 2 + 160, 360);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 32px Inter, sans-serif";
      ctx.fillText("Doğruluk", canvas.width / 2 + 160, 415);

      // Tier label
      ctx.fillStyle = tierInfo.color || "#22d3ee";
      ctx.font = "bold 26px Inter, sans-serif";
      ctx.fillText(`Seviye: ${tierInfo.label}`, canvas.width / 2, 490);

      // Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "18px Inter, sans-serif";
      ctx.fillText("https://www.everythinghub.com.tr/tools/aegis-typing", canvas.width / 2, 565);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `aegis-typing-certificate-${Date.now()}.png`;
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [wpm, accuracy, mode, lang, nickname, tierInfo]);

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-6 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6"
        style={{
          background: "rgba(18, 18, 24, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(32px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Certificate Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <Keyboard size={20} className="text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  aegisTyping
                </h1>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md uppercase font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30">
                  Sertifika
                </span>
              </div>
              <p className="text-xs text-zinc-400">Doğrulanmış Yazma Hızı Testi Sonucu</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck size={14} />
            <span>Doğrulandı</span>
          </div>
        </div>

        {/* Big Score Showcase */}
        <div className="text-center py-2 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {nickname} • {lang.toUpperCase()} • {mode.toUpperCase()}
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-6xl sm:text-7xl font-bold font-mono text-cyan-400 tabular-nums">
                {Math.round(wpm)}
              </span>
              <span className="text-xs font-semibold text-zinc-400 mt-1">NET WPM</span>
            </div>
            <div className="h-16 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-6xl sm:text-7xl font-bold font-mono text-emerald-400 tabular-nums">
                %{Math.round(accuracy)}
              </span>
              <span className="text-xs font-semibold text-zinc-400 mt-1">DOĞRULUK</span>
            </div>
          </div>

          {/* Speed tier badge */}
          <div className="pt-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${tierInfo.color}50`,
                color: tierInfo.color,
                boxShadow: `0 0 15px ${tierInfo.color}20`,
              }}
            >
              <Trophy size={13} />
              <span>Seviye: {tierInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Stats Details Grid */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Ham Hız</span>
            <span className="text-base font-bold font-mono text-zinc-200">{Math.round(rawWpm)} WPM</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Yazı Dili</span>
            <span className="text-base font-bold text-zinc-200">{lang.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Test Modu</span>
            <span className="text-base font-bold text-zinc-200">{mode}</span>
          </div>
        </div>

        {/* Primary Call to Action */}
        <Link
          href="/tools/aegis-typing"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_0_25px_rgba(34,211,238,0.35)]"
        >
          <Sparkles size={16} />
          <span>Sen de Yazma Hızını Test Et — Hemen Başla</span>
          <ArrowRight size={16} />
        </Link>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
          <button
            type="button"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
                "_blank"
              )
            }
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <Share2 size={13} />
            <span>Twitter / X</span>
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Link2 size={13} />}
            <span>{copied ? "Kopyalandı" : "Linki Kopyala"}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={downloading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <Download size={13} />
            <span>{downloading ? "İndiriliyor" : "PNG İndir"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
