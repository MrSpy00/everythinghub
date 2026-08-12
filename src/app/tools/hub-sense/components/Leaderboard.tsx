"use client";

/**
 * HubSense — Leaderboard Component
 * Displays global, daily, and personal scores with rank badges
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Zap, RefreshCw, Globe, User } from "lucide-react";
import {
  fetchLeaderboard,
  getRankBadge,
  getScoreTier,
  getLocalLeaderboard,
  type LeaderboardEntry,
  type LeaderboardFilter,
} from "../games/leaderboard";
import { getPersonalBests } from "../games/antiCheat";
import type { GameType, DifficultyType } from "../games/seedGenerator";

interface LeaderboardProps {
  gameType: GameType;
  difficulty: DifficultyType;
  onClose: () => void;
  highlightUsername?: string;
}

const FILTER_OPTIONS: { value: LeaderboardFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all-time", label: "Tüm Zamanlar", icon: <Trophy className="w-3.5 h-3.5" /> },
  { value: "daily", label: "Bugün", icon: <Clock className="w-3.5 h-3.5" /> },
  { value: "weekly", label: "Bu Hafta", icon: <Zap className="w-3.5 h-3.5" /> },
];

const DIFFICULTY_OPTIONS: DifficultyType[] = ["easy", "hard", "brutal"];
const DIFFICULTY_LABELS: Record<DifficultyType, string> = {
  easy: "Kolay",
  hard: "Zor",
  brutal: "Vahşi",
};

export function Leaderboard({
  gameType,
  difficulty: initialDifficulty,
  onClose,
  highlightUsername,
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeaderboardFilter>("all-time");
  const [difficulty, setDifficulty] = useState<DifficultyType>(initialDifficulty);
  const [source, setSource] = useState<"jsonbin" | "gist" | "local">("local");
  const [tab, setTab] = useState<"global" | "personal">("global");
  const personalBests = getPersonalBests();

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(gameType, difficulty, filter, 50)
      .then(({ entries: e, source: s }) => {
        setEntries(e);
        setSource(s);
      })
      .finally(() => setLoading(false));
  }, [gameType, difficulty, filter]);

  const gameName = gameType.charAt(0).toUpperCase() + gameType.slice(1);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(9,9,11,0.97)", backdropFilter: "blur(24px)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe-top pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-bold text-white text-lg leading-tight">
              Skor Tablosu
            </h2>
            <p className="text-xs text-white/40">{gameName} · {DIFFICULTY_LABELS[difficulty]}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center
            bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-white/60" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-1 px-5 pt-3">
        {[
          { key: "global", label: "Global", icon: <Globe className="w-3.5 h-3.5" /> },
          { key: "personal", label: "Kişisel", icon: <User className="w-3.5 h-3.5" /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as "global" | "personal")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === key
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/40 hover:text-white/60"}`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === "global" && (
        <>
          {/* Difficulty Filter */}
          <div className="flex gap-2 px-5 pt-3">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                  ${difficulty === d
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "border-white/10 text-white/40 hover:text-white/70"}`}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <div className="flex gap-1 px-5 pt-2.5 pb-3">
            {FILTER_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all border
                  ${filter === value
                    ? "bg-white/[0.08] border-white/20 text-white"
                    : "border-transparent text-white/40 hover:text-white/60"}`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Entries */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {tab === "global" ? (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                <p className="text-white/30 text-sm">Yükleniyor...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Trophy className="w-8 h-8 text-white/20" />
                <p className="text-white/30 text-sm">Henüz kayıt yok.</p>
                <p className="text-white/20 text-xs">İlk skoru sen gönder!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <AnimatePresence>
                  {entries.map((entry, i) => {
                    const badge = getRankBadge(entry.rank ?? i + 1);
                    const tier = getScoreTier(entry.score);
                    const isHighlighted = highlightUsername &&
                      entry.username.toLowerCase() === highlightUsername.toLowerCase();

                    return (
                      <motion.div
                        key={`${entry.username}-${entry.timestamp}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                          ${isHighlighted
                            ? "bg-indigo-500/10 border-indigo-500/30"
                            : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"}`}
                      >
                        {/* Rank */}
                        <div
                          className="w-10 text-center font-bold text-sm tabular-nums"
                          style={{ color: badge.color }}
                        >
                          {badge.label}
                        </div>

                        {/* Username */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm truncate">
                            {entry.username}
                          </div>
                          <div className="text-xs text-white/30 mt-0.5">
                            {new Date(entry.timestamp).toLocaleDateString("tr-TR")}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div
                            className="font-bold text-lg tabular-nums"
                            style={{ color: tier.color }}
                          >
                            {entry.score.toFixed(1)}
                          </div>
                          <div className="text-xs text-white/30">/50</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Source indicator */}
                <div className="text-center text-xs text-white/20 py-3">
                  Kaynak: {source === "jsonbin" ? "Global (JSONbin)" : source === "gist" ? "Global (GitHub)" : "Yerel"}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Personal Bests */
          <div className="flex flex-col gap-2 py-2">
            {(["color", "sound", "time", "shape", "sequence"] as GameType[]).map((game) => (
              <div key={game} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <div className="px-3 py-2 bg-white/[0.03] border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    {game}
                  </span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
                  {(["easy", "hard", "brutal"] as DifficultyType[]).map((diff) => {
                    const pb = personalBests[game]?.[diff];
                    return (
                      <div key={diff} className="p-2 text-center">
                        <div className="text-[10px] text-white/30 mb-1">
                          {DIFFICULTY_LABELS[diff]}
                        </div>
                        {pb ? (
                          <div className="font-bold text-sm text-white">
                            {pb.score.toFixed(1)}
                            <span className="text-white/30 text-xs">/50</span>
                          </div>
                        ) : (
                          <div className="text-white/20 text-xs">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
