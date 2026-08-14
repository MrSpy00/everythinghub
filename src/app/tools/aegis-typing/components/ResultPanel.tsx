"use client";
// ============================================================
// aegisTyping — Result Panel
// Detailed results overlay with stats, graph, and sharing
// ============================================================
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw, Plus, Share2, Copy, Download, Link,
  AlertTriangle, Trophy
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
    const duration = 800;
    const steps = 40;
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex flex-col gap-1 p-3 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--at-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-bold tabular-nums font-mono"
        style={{ color: color ?? "var(--at-text)" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: "var(--at-muted)" }}>
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

  const shareText = `aegisTyping'de ${Math.round(result.wpm)} WPM ve %${result.accuracy.toFixed(1)} doğruluk oranı elde ettim! ${shareUrl}`;

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
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [shareText]);

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
      ? "Kod"
      : result.mode;

  const recentHistory = localHistory.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-6"
        style={{
          background: "var(--at-surface)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-1"
            >
              {isNewRecord && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `${tierInfo.color}20`,
                    border: `1px solid ${tierInfo.color}50`,
                    color: tierInfo.color,
                  }}
                >
                  <Trophy size={11} />
                  Yeni Rekor!
                </div>
              )}
              {result.antiCheat.suspicious && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  <AlertTriangle size={11} />
                  Şüpheli
                </div>
              )}
            </motion.div>

            <div className="flex items-end gap-3">
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="text-6xl font-bold tabular-nums font-mono"
                style={{ color: "var(--at-accent)" }}
              >
                <CountUp target={Math.round(result.wpm)} />
              </motion.p>
              <div className="mb-2 space-y-0.5">
                <p className="text-sm font-semibold" style={{ color: "var(--at-muted)" }}>
                  WPM
                </p>
                <p
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: `${tierInfo.color}18`,
                    color: tierInfo.color,
                  }}
                >
                  {tierInfo.label}
                </p>
              </div>
            </div>

            <p className="text-xs mt-1" style={{ color: "var(--at-muted)" }}>
              {modeLabel} • {result.language}
              {prevBest > 0 && !isNewRecord && (
                <span> • En iyi: {Math.round(prevBest)} WPM</span>
              )}
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onRestart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Yeniden başlat (Tab)"
              className="p-2.5 rounded-xl transition-colors focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--at-text)",
              }}
            >
              <RotateCcw size={16} />
            </motion.button>
            <motion.button
              onClick={onNewTest}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Yeni test"
              className="p-2.5 rounded-xl transition-colors focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--at-text)",
              }}
            >
              <Plus size={16} />
            </motion.button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
            label="Hata"
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
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--at-muted)" }}>
              WPM Grafiği
            </p>
            <div
              className="p-3 rounded-2xl"
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
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

        {/* Anti-cheat warning */}
        {result.antiCheat.suspicious && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-3 p-3 rounded-2xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#f87171" }}>
                Şüpheli Aktivite Tespit Edildi
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(248,113,113,0.7)" }}>
                Bu sonuç liderboard&apos;a kaydedilmeyebilir. İşaretler:{" "}
                {result.antiCheat.flags.join(", ")}
              </p>
            </div>
          </motion.div>
        )}

        {/* Share buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="space-y-2"
        >
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--at-muted)" }}>
            Paylaş
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Twitter/X", icon: <Share2 size={13} />, action: handleTwitter },
              { label: "WhatsApp", icon: <Share2 size={13} />, action: handleWhatsApp },
              { label: "Discord", icon: <Copy size={13} />, action: handleDiscord },
              {
                label: copied ? "Kopyalandı!" : "Bağlantı Kopyala",
                icon: <Link size={13} />,
                action: handleCopyLink,
              },
              {
                label: downloading ? "İndiriliyor..." : "PNG İndir",
                icon: <Download size={13} />,
                action: handleDownloadPng,
              },
              { label: "Paylaş", icon: <Share2 size={13} />, action: handleNativeShare },
            ].map(({ label, icon, action }) => (
              <motion.button
                key={label}
                onClick={action}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "var(--at-text)",
                }}
              >
                {icon}
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Local history */}
        {recentHistory.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--at-muted)" }}>
              Son Testler
            </p>
            <div className="space-y-1">
              {recentHistory.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: i === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ color: "var(--at-muted)" }}>
                    {new Date(r.timestamp).toLocaleDateString("tr-TR")}
                  </span>
                  <span className="font-mono font-semibold" style={{ color: "var(--at-accent)" }}>
                    {Math.round(r.wpm)} WPM
                  </span>
                  <span style={{ color: "var(--at-muted)" }}>
                    {r.accuracy.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Restart hint */}
        <p className="text-center text-xs" style={{ color: "var(--at-muted)" }}>
          Yeniden başlatmak için{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Tab
          </kbd>{" "}
          veya{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Enter
          </kbd>
          {" "}tuşuna bas
        </p>
      </motion.div>
    </motion.div>
  );
}
