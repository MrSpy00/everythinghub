"use client";
// ============================================================
// aegisTyping — Leaderboard Panel (Liderlik Tablosu)
// Compact liquid glass dialog, centered and responsive
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Globe, Monitor, RefreshCcw, Loader2, WifiOff, Award } from "lucide-react";
import type { TestResult, TestMode, LeaderboardPeriod, LeaderboardEntry } from "../types";
import { getSpeedTier, SPEED_TIER_LABELS } from "../types";

interface LeaderboardPanelProps {
  open: boolean;
  onClose: () => void;
  localHistory: TestResult[];
  currentMode?: TestMode;
  currentLanguage: string;
  nickname: string;
}

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  alltime: "Tüm Zamanlar",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/40">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 font-bold text-xs border border-slate-300/40">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-400 font-bold text-xs border border-amber-600/40">
        3
      </span>
    );
  }
  return (
    <span className="font-mono text-xs font-semibold w-6 text-center" style={{ color: "var(--at-muted)" }}>
      #{rank}
    </span>
  );
}

function LocalLeaderboard({
  history,
}: {
  history: TestResult[];
}) {
  const sorted = [...history]
    .filter((r) => !r.antiCheat.suspicious)
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, 50);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Monitor size={24} style={{ color: "var(--at-accent)" }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--at-text)" }}>
          Henüz yerel test kaydı yok
        </p>
        <p className="text-xs" style={{ color: "var(--at-muted)" }}>
          İlk yazma testinizi tamamlayarak rekorunuzu kaydedin!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div
        className="grid grid-cols-[36px_1fr_70px_70px_80px_70px] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-white/5"
        style={{ color: "var(--at-muted)" }}
      >
        <span>Sıra</span>
        <span>Mod / Dil</span>
        <span className="text-right">Net WPM</span>
        <span className="text-right">Ham WPM</span>
        <span className="text-right">Doğruluk</span>
        <span className="text-right">Tarih</span>
      </div>

      {sorted.map((r, i) => {
        const tier = SPEED_TIER_LABELS[getSpeedTier(r.wpm)];
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="grid grid-cols-[36px_1fr_70px_70px_80px_70px] gap-2 items-center px-3 py-2.5 rounded-xl text-xs transition-colors hover:bg-white/[0.04]"
            style={{
              background: i === 0 ? `${tier.color}12` : "rgba(255,255,255,0.02)",
              border: `1px solid ${i === 0 ? `${tier.color}35` : "rgba(255,255,255,0.05)"}`,
            }}
          >
            <RankBadge rank={i + 1} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold" style={{ color: "var(--at-text)" }}>
                {r.mode === "time" ? `${r.modeValue}s Süre` : r.mode === "words" ? `${r.modeValue} Kelime` : r.mode} • {r.language.toUpperCase()}
              </p>
            </div>
            <span
              className="text-right font-mono font-bold text-sm tabular-nums"
              style={{ color: tier.color }}
            >
              {Math.round(r.wpm)}
            </span>
            <span className="text-right font-mono text-xs tabular-nums" style={{ color: "var(--at-muted)" }}>
              {Math.round(r.rawWpm)}
            </span>
            <span className="text-right font-mono text-xs tabular-nums font-semibold" style={{ color: "var(--at-text)" }}>
              {r.accuracy.toFixed(1)}%
            </span>
            <span className="text-right text-[11px]" style={{ color: "var(--at-muted)" }}>
              {new Date(r.timestamp).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function GlobalLeaderboard({
  mode,
  language,
}: {
  mode: string;
  language: string;
}) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("alltime");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        period,
        ...(mode !== "all" ? { mode: mode.split("_")[0], modeValue: mode.split("_")[1] } : {}),
        ...(language !== "all" ? { lang: language } : {}),
        limit: "50",
      });

      const res = await fetch(`/api/aegis-typing/leaderboard?${params}`, {
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) throw new Error("Sunucu yanıt vermedi");
      const json = await res.json();
      setData(json.entries ?? []);
      setOffline(false);
    } catch {
      setError("Bağlantı kurulamadı — yerel kayıtlar görüntüleniyor");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [period, mode, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {(["daily", "weekly", "alltime"] as LeaderboardPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-none"
              style={{
                background: period === p ? "var(--at-accent)" : "transparent",
                color: period === p ? "var(--at-bg, #09090b)" : "var(--at-muted)",
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-xl transition-all focus:outline-none bg-white/5 border border-white/10 hover:bg-white/10"
          style={{ color: "var(--at-muted)" }}
          title="Yenile"
        >
          <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {offline && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <WifiOff size={12} style={{ color: "#f87171" }} />
          <span style={{ color: "#f87171" }}>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--at-accent)" }} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Globe size={24} style={{ color: "var(--at-accent)" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--at-text)" }}>
            Bu filtre için henüz global skor yok
          </p>
          <p className="text-xs" style={{ color: "var(--at-muted)" }}>
            Testi tamamlayarak liderlik tablosunda yerinizi alın!
          </p>
        </div>
      )}

      {/* Data list */}
      {!loading && data.length > 0 && (
        <div className="space-y-1">
          <div
            className="grid grid-cols-[36px_1fr_70px_70px_70px] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-white/5"
            style={{ color: "var(--at-muted)" }}
          >
            <span>Sıra</span>
            <span>Oyuncu</span>
            <span className="text-right">Net WPM</span>
            <span className="text-right">Doğruluk</span>
            <span className="text-right">Tarih</span>
          </div>
          {data.map((entry, i) => {
            const tier = SPEED_TIER_LABELS[getSpeedTier(entry.wpm)];
            return (
              <motion.div
                key={`${entry.nickname}-${entry.timestamp}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-[36px_1fr_70px_70px_70px] gap-2 items-center px-3 py-2.5 rounded-xl text-xs transition-colors hover:bg-white/[0.04]"
                style={{
                  background: i < 3 ? `${tier.color}10` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${i < 3 ? `${tier.color}30` : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <RankBadge rank={entry.rank} />
                <span className="font-semibold text-xs truncate" style={{ color: "var(--at-text)" }}>
                  {entry.nickname}
                </span>
                <span className="text-right font-mono font-bold text-sm" style={{ color: tier.color }}>
                  {Math.round(entry.wpm)}
                </span>
                <span className="text-right font-mono text-xs font-semibold" style={{ color: "var(--at-muted)" }}>
                  {entry.accuracy.toFixed(1)}%
                </span>
                <span className="text-right text-[11px]" style={{ color: "var(--at-muted)" }}>
                  {new Date(entry.timestamp).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LeaderboardPanel({
  open,
  onClose,
  localHistory,
  currentLanguage,
}: LeaderboardPanelProps) {
  const [tab, setTab] = useState<"local" | "global">("local");
  const modeFilter = "all";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Centered Liquid Glass Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative w-full max-w-2xl max-h-[85vh] z-10 flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: "rgba(18, 18, 24, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(32px)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.2)",
            }}
            role="dialog"
            aria-label="Liderlik Tablosu"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Trophy size={16} style={{ color: "var(--at-accent)" }} />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight" style={{ color: "var(--at-text)" }}>
                    Liderlik Tablosu (Leaderboard)
                  </h2>
                  <p className="text-[11px]" style={{ color: "var(--at-muted)" }}>
                    En yüksek net WPM hız rekorları ve doğruluk oranları
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl transition-colors focus:outline-none hover:bg-white/10"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--at-muted)",
                }}
                aria-label="Kapat"
              >
                <X size={15} />
              </motion.button>
            </div>

            {/* Tab switcher */}
            <div className="flex px-6 pt-4 gap-2">
              {[
                { id: "local" as const, label: "Yerel Cihaz Skorları", icon: <Monitor size={13} /> },
                { id: "global" as const, label: "Global Sıralama", icon: <Globe size={13} /> },
              ].map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                  style={{
                    background: tab === t.id ? "var(--at-accent)" : "rgba(255,255,255,0.06)",
                    color: tab === t.id ? "var(--at-bg, #09090b)" : "var(--at-muted)",
                    border: `1px solid ${tab === t.id ? "var(--at-accent)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {t.icon}
                  {t.label}
                </motion.button>
              ))}
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto px-6 py-4" style={{ overscrollBehavior: "contain" }}>
              {tab === "local" ? (
                <LocalLeaderboard history={localHistory} />
              ) : (
                <GlobalLeaderboard mode={modeFilter} language={currentLanguage} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
