"use client";

/**
 * HubSense — Leaderboard Modal Component (Centered Liquid Glass Studio Edition)
 * Displays global and personal best scores with rank badges, glass tabs, and full i18n.
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Zap, Globe, User, X } from "lucide-react";
import {
  fetchLeaderboard,
  getRankBadge,
  getScoreTier,
  type LeaderboardEntry,
  type LeaderboardFilter,
} from "../games/leaderboard";
import { getPersonalBests } from "../games/antiCheat";
import type { GameType, DifficultyType } from "../games/seedGenerator";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";

interface LeaderboardProps {
  gameType: GameType;
  difficulty: DifficultyType;
  onClose: () => void;
  highlightUsername?: string;
}

export function Leaderboard({
  gameType,
  difficulty: initialDifficulty,
  onClose,
  highlightUsername,
}: LeaderboardProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeaderboardFilter>("all-time");
  const [difficulty, setDifficulty] = useState<DifficultyType>(initialDifficulty);
  const [source, setSource] = useState<"global" | "local">("global");
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

  const gameInfo = t.disciplines[gameType];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Liquid Glass Backdrop Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Centered Liquid Glass Modal Dialog */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] rounded-3xl bg-zinc-950/80 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg leading-tight">
                {t.leaderboard.title}
              </h2>
              <p className="text-xs text-white/50">
                {gameInfo.label} · {t.difficulties[difficulty].label}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={t.totalResult.menuReturn}
            className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white/[0.05] hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Global vs Personal) */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-white/5 bg-white/[0.01]">
          <div className="flex gap-2">
            {[
              { key: "global", label: t.leaderboard.globalTab, icon: <Globe className="w-3.5 h-3.5" /> },
              { key: "personal", label: t.leaderboard.personalTab, icon: <User className="w-3.5 h-3.5" /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as "global" | "personal")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border
                  ${
                    tab === key
                      ? "bg-white/10 text-white border-white/20 shadow-md"
                      : "text-white/40 border-transparent hover:text-white/70"
                  }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="text-[10px] font-mono text-white/40">
            {source === "global" ? t.leaderboard.sourceServer : t.leaderboard.sourceLocal}
          </div>
        </div>

        {/* Global Filters */}
        {tab === "global" && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b border-white/5 bg-white/[0.01]">
            {/* Difficulty Pills */}
            <div className="flex gap-1.5">
              {(["easy", "hard", "brutal"] as DifficultyType[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
                    ${
                      difficulty === d
                        ? "bg-white/15 text-white border-white/25 shadow-sm"
                        : "text-white/40 border-white/5 hover:text-white/70"
                    }`}
                >
                  {t.difficulties[d].label}
                </button>
              ))}
            </div>

            {/* Timeframe Filter */}
            <div className="flex gap-1.5">
              {[
                { value: "all-time", label: t.leaderboard.allTime, icon: <Trophy className="w-3 h-3" /> },
                { value: "daily", label: t.leaderboard.today, icon: <Clock className="w-3 h-3" /> },
                { value: "weekly", label: t.leaderboard.thisWeek, icon: <Zap className="w-3 h-3" /> },
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as LeaderboardFilter)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border
                    ${
                      filter === value
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm"
                        : "text-white/40 border-white/5 hover:text-white/70"
                    }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {tab === "global" ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/40 text-xs font-mono">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span>Yükleniyor...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-white/40">
                <Trophy className="w-10 h-10 stroke-1 text-white/20 mb-3" />
                <p className="text-sm font-bold text-white/70">{t.leaderboard.emptyTitle}</p>
                <p className="text-xs text-white/40 mt-1">{t.leaderboard.emptyDesc}</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {entries.map((entry, idx) => {
                  const rank = idx + 1;
                  const tier = getScoreTier(entry.score);
                  const badge = getRankBadge(rank);
                  const isUser =
                    highlightUsername &&
                    entry.username.toUpperCase() === highlightUsername.toUpperCase();

                  return (
                    <motion.div
                      key={`${entry.username}-${idx}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all
                        ${
                          isUser
                            ? "bg-indigo-500/15 border-indigo-500/40 shadow-md"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 text-center font-mono font-black text-xs"
                          style={{ color: badge.color }}
                        >
                          {badge.label}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{entry.username}</span>
                            {isUser && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[9px] font-sans font-bold">
                                {lang === "tr" ? "SEN" : "YOU"}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/40 font-mono">
                            {new Date(entry.timestamp).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline"
                          style={{ color: tier.color }}
                        >
                          {tier.label}
                        </span>
                        <div className="text-right">
                          <div className="font-mono font-extrabold text-sm text-white">
                            {entry.score.toFixed(1)}
                          </div>
                          <div className="text-[9px] text-white/30 font-mono">/ 50.0</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            /* Personal Bests Tab */
            <div className="space-y-3">
              {(Object.keys(t.disciplines) as GameType[]).map((gt) => {
                const pb = personalBests[gt];
                const info = t.disciplines[gt];

                return (
                  <div
                    key={gt}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-sm text-white">
                        {info.label}
                      </div>
                      <span className="text-xs text-white/40 font-mono">
                        {t.insights.bestScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(["easy", "hard", "brutal"] as DifficultyType[]).map((d) => {
                        const score = pb?.[d]?.score;
                        return (
                          <div
                            key={d}
                            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center"
                          >
                            <div className="text-[10px] font-bold text-white/40 uppercase">
                              {t.difficulties[d].label}
                            </div>
                            <div className="font-mono font-black text-sm text-white mt-1">
                              {score !== undefined ? score.toFixed(1) : "--"}
                            </div>
                            <div className="text-[9px] text-white/20">/ 50.0</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
