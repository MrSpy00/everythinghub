"use client";
// ============================================================
// aegisTyping — Leaderboard Panel
// Local + Global leaderboard with filtering
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Globe, Monitor, RefreshCcw, Loader2, WifiOff } from "lucide-react";
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
  const colors = ["#fbbf24", "#9ca3af", "#d97706"];
  const color = rank <= 3 ? colors[rank - 1] : "var(--at-muted)";
  return (
    <span className="font-mono text-xs font-bold w-6 text-center" style={{ color }}>
      {rank <= 3 ? ["1st", "2nd", "3rd"][rank - 1] : `#${rank}`}
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
      <div className="flex flex-col items-center py-16 gap-3">
        <Monitor size={32} style={{ color: "var(--at-muted)" }} />
        <p className="text-sm" style={{ color: "var(--at-muted)" }}>
          Henüz test tamamlamadınız.
        </p>
        <p className="text-xs" style={{ color: "var(--at-muted)" }}>
          İlk testinizi tamamlayın!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div
        className="grid grid-cols-[32px_1fr_64px_64px_80px_80px] gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider"
        style={{ color: "var(--at-muted)" }}
      >
        <span>#</span>
        <span>Mod / Dil</span>
        <span className="text-right">WPM</span>
        <span className="text-right">Ham</span>
        <span className="text-right">Doğruluk</span>
        <span className="text-right">Tarih</span>
      </div>

      {sorted.map((r, i) => {
        const tier = SPEED_TIER_LABELS[getSpeedTier(r.wpm)];
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="grid grid-cols-[32px_1fr_64px_64px_80px_80px] gap-2 items-center px-3 py-2 rounded-xl text-sm"
            style={{
              background: i === 0 ? `${tier.color}10` : "rgba(255,255,255,0.03)",
              border: `1px solid ${i === 0 ? `${tier.color}25` : "rgba(255,255,255,0.04)"}`,
            }}
          >
            <RankBadge rank={i + 1} />
            <div className="min-w-0">
              <p className="truncate text-xs" style={{ color: "var(--at-text)" }}>
                {r.mode === "time" ? `${r.modeValue}s` : `${r.modeValue}w`} • {r.language}
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
            <span className="text-right font-mono text-xs tabular-nums" style={{ color: "var(--at-muted)" }}>
              {r.accuracy.toFixed(1)}%
            </span>
            <span className="text-right text-xs" style={{ color: "var(--at-muted)" }}>
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
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("İstek zaman aşımına uğradı.");
      } else {
        setOffline(true);
        setError("Global liderboard şu anda kullanılamıyor.");
      }
    } finally {
      setLoading(false);
    }
  }, [period, mode, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      {/* Period filter */}
      <div className="flex items-center gap-2">
        {(Object.keys(PERIOD_LABELS) as LeaderboardPeriod[]).map((p) => (
          <motion.button
            key={p}
            onClick={() => setPeriod(p)}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded-full text-xs font-medium focus:outline-none"
            style={{
              background: period === p ? "var(--at-accent)" : "rgba(255,255,255,0.06)",
              color: period === p ? "var(--at-bg)" : "var(--at-muted)",
            }}
          >
            {PERIOD_LABELS[p]}
          </motion.button>
        ))}
        <motion.button
          onClick={fetchData}
          whileTap={{ scale: 0.9 }}
          disabled={loading}
          className="ml-auto p-1.5 rounded-lg focus:outline-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: "var(--at-muted)",
          }}
          aria-label="Yenile"
        >
          <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
        </motion.button>
      </div>

      {/* Status */}
      {offline && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <WifiOff size={12} style={{ color: "#f87171" }} />
          <span style={{ color: "#f87171" }}>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--at-accent)" }} />
        </div>
      )}

      {/* Data */}
      {!loading && !error && data.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3">
          <Globe size={32} style={{ color: "var(--at-muted)" }} />
          <p className="text-sm" style={{ color: "var(--at-muted)" }}>
            Bu filtre için henüz skor yok.
          </p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="space-y-1">
          <div
            className="grid grid-cols-[32px_1fr_64px_64px_80px] gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider"
            style={{ color: "var(--at-muted)" }}
          >
            <span>#</span>
            <span>Oyuncu</span>
            <span className="text-right">WPM</span>
            <span className="text-right">Doğruluk</span>
            <span className="text-right">Tarih</span>
          </div>
          {data.map((entry, i) => {
            const tier = SPEED_TIER_LABELS[getSpeedTier(entry.wpm)];
            return (
              <motion.div
                key={`${entry.nickname}-${entry.timestamp}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-[32px_1fr_64px_64px_80px] gap-2 items-center px-3 py-2 rounded-xl"
                style={{
                  background: i < 3 ? `${tier.color}08` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${i < 3 ? `${tier.color}20` : "rgba(255,255,255,0.04)"}`,
                }}
              >
                <RankBadge rank={entry.rank} />
                <span className="font-medium text-xs truncate" style={{ color: "var(--at-text)" }}>
                  {entry.nickname}
                </span>
                <span className="text-right font-mono font-bold text-sm" style={{ color: tier.color }}>
                  {Math.round(entry.wpm)}
                </span>
                <span className="text-right font-mono text-xs" style={{ color: "var(--at-muted)" }}>
                  {entry.accuracy.toFixed(1)}%
                </span>
                <span className="text-right text-xs" style={{ color: "var(--at-muted)" }}>
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed inset-x-4 bottom-4 top-16 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[680px] z-50 flex flex-col rounded-3xl"
            style={{
              background: "var(--at-surface)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
            }}
            role="dialog"
            aria-label="Liderboard"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <Trophy size={18} style={{ color: "var(--at-accent)" }} />
                <h2 className="text-base font-semibold" style={{ color: "var(--at-text)" }}>
                  Liderboard
                </h2>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-xl focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--at-muted)",
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Tab switcher */}
            <div className="flex px-5 pt-4 gap-2">
              {[
                { id: "local" as const, label: "Yerel", icon: <Monitor size={13} /> },
                { id: "global" as const, label: "Global", icon: <Globe size={13} /> },
              ].map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium focus:outline-none"
                  style={{
                    background: tab === t.id ? "var(--at-accent)" : "rgba(255,255,255,0.06)",
                    color: tab === t.id ? "var(--at-bg)" : "var(--at-muted)",
                  }}
                >
                  {t.icon}
                  {t.label}
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4" style={{ overscrollBehavior: "contain" }}>
              {tab === "local" ? (
                <LocalLeaderboard history={localHistory} />
              ) : (
                <GlobalLeaderboard mode={modeFilter} language={currentLanguage} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
