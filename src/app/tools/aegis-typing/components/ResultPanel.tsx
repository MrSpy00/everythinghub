"use client";
// ============================================================
// aegisTyping — Result Panel
// Detailed results overlay with stats, graph, and sharing
// Transparent liquid glass, zero emojis, clean 2-row share grid
// ============================================================
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Plus,
  Share2,
  Copy,
  Download,
  Link2,
  AlertTriangle,
  Trophy,
  Check,
} from "lucide-react";
import type { TestResult } from "../types";
import { getSpeedTier, SPEED_TIER_LABELS } from "../types";
import { WpmGraph } from "./WpmGraph";
import { formatDuration } from "../utils/textProcessing";

interface ResultPanelProps {
  result: TestResult;
  isNewRecord: boolean;
  prevBest: number;
  localHistory: TestResult[];
  onRestart: () => void;
  onNewTest: () => void;
  shareEngine: {
    generateShareUrl: (r: TestResult) => string;
    downloadResultPng: (r: TestResult) => Promise<void>;
    shareNative: (r: TestResult) => Promise<boolean>;
  };
}

// Animated number counter
function CountUp({ target, decimals = 0, suffix = "" }: { target: number; decimals?: number; suffix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 600;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(target, current + increment);
      setValue(Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, decimals]);

  return (
    <span>
      {decimals > 0 ? value.toFixed(decimals) : value}
      {suffix}
    </span>
  );
}

function StatBlock({
  label,
  value,
  sub,
  color,
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="flex flex-col gap-1 p-3.5 rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <span
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: "var(--at-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-bold tabular-nums font-mono tracking-tight"
        style={{ color: color ?? "var(--at-text)" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11px]" style={{ color: "var(--at-muted)" }}>
          {sub}
        </span>
      )}
    </motion.div>
  );
}

export function ResultPanel({
  result,
  isNewRecord,
  prevBest,
  localHistory,
  onRestart,
  onNewTest,
  shareEngine,
}: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const tier = getSpeedTier(result.wpm);
  const tierInfo = SPEED_TIER_LABELS[tier];

  const shareUrl = shareEngine.generateShareUrl(result);
  const shareText = `aegisTyping Studio üzerinde ${Math.round(result.wpm)} WPM hız ve %${result.accuracy.toFixed(1)} doğruluk skoru elde ettim! Test bağlantısı: ${shareUrl}`;

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
      await shareEngine.downloadResultPng(result);
    } finally {
      setDownloading(false);
    }
  }, [result, shareEngine]);

  const handleTwitter = useCallback(() => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener"
    );
  }, [shareText]);

  const handleWhatsApp = useCallback(() => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener"
    );
  }, [shareText]);

  const handleDiscord = useCallback(async () => {
    try {
      const discordText = `**[aegisTyping] Sonuç Raporu**\n- **Hız:** ${Math.round(result.wpm)} Net WPM (${Math.round(result.rawWpm)} Ham WPM)\n- **Doğruluk:** %${result.accuracy.toFixed(1)}\n- **Seviye:** ${tierInfo.label}\n- **Mod:** ${result.mode} (${result.modeValue}) • ${result.language.toUpperCase()}\n- **Sertifika:** ${shareUrl}`;
      await navigator.clipboard.writeText(discordText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [result, tierInfo, shareUrl]);

  const handleNativeShare = useCallback(async () => {
    await shareEngine.shareNative(result);
  }, [result, shareEngine]);

  const modeLabel =
    result.mode === "time"
      ? `Süre ${result.modeValue}s`
      : result.mode === "words"
      ? `${result.modeValue} Kelime`
      : result.mode === "quote"
      ? "Alıntı"
      : result.mode === "zen"
      ? "Zen"
      : result.mode === "code"
      ? `Kod (${String(result.modeValue).toUpperCase()})`
      : result.mode === "learn"
      ? `Ders (${result.modeValue})`
      : result.mode;

  const recentHistory = localHistory.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(14px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 space-y-5"
        style={{
          background: "rgba(18, 18, 24, 0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(32px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Header with Speed & Tier Badge */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {isNewRecord && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${tierInfo.color}60`,
                    color: tierInfo.color,
                    boxShadow: `0 0 15px ${tierInfo.color}20`,
                  }}
                >
                  <Trophy size={13} />
                  <span>Yeni Kişisel Rekor!</span>
                </div>
              )}
              {result.antiCheat.suspicious && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                  }}
                >
                  <AlertTriangle size={13} />
                  <span>Şüpheli Skor</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <motion.p
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 350 }}
                className="text-6xl sm:text-7xl font-bold tabular-nums font-mono tracking-tight"
                style={{ color: "var(--at-accent)" }}
              >
                <CountUp target={Math.round(result.wpm)} />
              </motion.p>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold block" style={{ color: "var(--at-muted)" }}>
                  Net WPM
                </span>
                <span
                  className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${tierInfo.color}40`,
                    color: tierInfo.color,
                  }}
                >
                  {tierInfo.label}
                </span>
              </div>
            </div>

            <p className="text-xs mt-1 font-medium" style={{ color: "var(--at-muted)" }}>
              {modeLabel} • {result.language.toUpperCase()}
              {prevBest > 0 && !isNewRecord && (
                <span> • Önceki En İyi: {Math.round(prevBest)} WPM</span>
              )}
            </p>
          </div>

          {/* Quick restart / new test action buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onRestart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Yeniden Başlat (Tab)"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--at-text)",
              }}
            >
              <RotateCcw size={14} />
              <span>Yeniden Başlat</span>
            </motion.button>
            <motion.button
              onClick={onNewTest}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Yeni Test Başlat"
              className="p-2 rounded-xl transition-colors focus:outline-none"
              style={{
                background: "var(--at-accent)",
                color: "#09090b",
              }}
            >
              <Plus size={16} />
            </motion.button>
          </div>
        </div>

        {/* Stats grid (6 cards) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          <StatBlock
            label="Ham WPM"
            value={<CountUp target={Math.round(result.rawWpm)} />}
            delay={0.05}
          />
          <StatBlock
            label="Doğruluk"
            value={<CountUp target={result.accuracy} decimals={1} suffix="%" />}
            color="var(--at-correct)"
            delay={0.1}
          />
          <StatBlock
            label="Tutarlılık"
            value={<CountUp target={result.consistency} suffix="%" />}
            delay={0.15}
          />
          <StatBlock
            label="CPM"
            value={<CountUp target={result.cpm} />}
            delay={0.2}
          />
          <StatBlock
            label="Hatalar"
            value={result.errors}
            color={result.errors > 0 ? "var(--at-error)" : "var(--at-correct)"}
            delay={0.25}
          />
          <StatBlock
            label="Süre"
            value={formatDuration(result.duration)}
            delay={0.3}
          />
        </div>

        {/* WPM Graph */}
        {result.wpmTimeline.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-1.5"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--at-muted)" }}>
              WPM Zaman Grafiği
            </p>
            <div
              className="p-3.5 rounded-2xl"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <WpmGraph
                data={result.wpmTimeline}
                height={100}
                accentColor="var(--at-accent)"
                errorPositions={result.errorPositions}
              />
            </div>
          </motion.div>
        )}

        {/* Anti-cheat warning if flagged */}
        {result.antiCheat.suspicious && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-3 p-3.5 rounded-2xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
            <div>
              <p className="text-xs font-bold" style={{ color: "#f87171" }}>
                Şüpheli Aktivite Tespit Edildi
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(248,113,113,0.8)" }}>
                İşaretler: {result.antiCheat.flags.join(", ")}
              </p>
            </div>
          </motion.div>
        )}

        {/* Share buttons — Clean 2-Row Uniform Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="space-y-2"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--at-muted)" }}>
            Sonucu Paylaş & Sertifika
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Twitter / X", icon: <Share2 size={13} />, action: handleTwitter },
              { label: "WhatsApp", icon: <Share2 size={13} />, action: handleWhatsApp },
              { label: "Discord Formatı", icon: <Copy size={13} />, action: handleDiscord },
              {
                label: copied ? "Kopyalandı!" : "Bağlantı Kopyala",
                icon: copied ? <Check size={13} /> : <Link2 size={13} />,
                action: handleCopyLink,
              },
              {
                label: downloading ? "İndiriliyor..." : "PNG Sertifika",
                icon: <Download size={13} />,
                action: handleDownloadPng,
              },
              { label: "Sistemde Paylaş", icon: <Share2 size={13} />, action: handleNativeShare },
            ].map(({ label, icon, action }) => (
              <motion.button
                key={label}
                onClick={action}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "var(--at-text)",
                }}
              >
                {icon}
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent local history list */}
        {recentHistory.length > 1 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--at-muted)" }}>
              Son Test Geçmişiniz
            </p>
            <div className="space-y-1">
              {recentHistory.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: i === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ color: "var(--at-muted)" }}>
                    {new Date(r.timestamp).toLocaleDateString("tr-TR")}
                  </span>
                  <span className="font-mono font-bold" style={{ color: "var(--at-accent)" }}>
                    {Math.round(r.wpm)} WPM
                  </span>
                  <span style={{ color: "var(--at-muted)" }}>
                    %{r.accuracy.toFixed(1)} Doğruluk
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restart hint */}
        <p className="text-center text-[11px]" style={{ color: "var(--at-muted)" }}>
          Yeniden başlatmak için{" "}
          <kbd
            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Tab
          </kbd>{" "}
          tuşuna basın
        </p>
      </motion.div>
    </motion.div>
  );
}
