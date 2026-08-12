"use client";

/**
 * HubSense — Cognitive Sensory Memory Game Arena (Creative Studio Edition)
 * Orchestrates Color, Sound, Time, Shape, and Harmonic Sequence perception games.
 * 100% Client-Side, Zero-Auth Serverless Leaderboard, Offline LocalStorage,
 * Cryptographic Anti-Cheat, High-Res Score Card Generator, and Full Bilingual (TR/EN) i18n.
 */

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "./i18n/hubSenseI18n";

// Game Engines & Scoring
import { generateFrequency } from "./games/soundScoring";
import { generateTargetTime } from "./games/timeScoring";
import { generateShape } from "./games/shapeScoring";
import { generateSequence, type SequenceScoreResult } from "./games/sequenceScoring";
import {
  createGameSession,
  getTodayUTCString,
  getMsUntilNextUTCMidnight,
  formatCountdown,
  ROUNDS_COUNT,
  type GameType,
  type DifficultyType,
  type ModeType,
  type GameSession,
} from "./games/seedGenerator";
import {
  buildScorePayload,
  validateUsername,
  validateScoreBounds,
  checkRateLimit,
  recordSubmission,
  recordSeed,
  isReplay,
  updatePersonalBest,
} from "./games/antiCheat";
import { submitScore, getScoreTier } from "./games/leaderboard";
import {
  buildShareUrl,
  buildChallengeUrl,
  parseChallengeUrl,
  decodeSharePayload,
  nativeShare,
  buildTwitterShareUrl,
  buildWhatsAppShareUrl,
  downloadScoreCardImage,
  type SharePayload,
} from "./games/shareEncoder";
import {
  SoundFX,
  unlockAudio,
  isSoundMuted,
  setSoundMuted,
  triggerHaptic,
} from "./games/soundEffects";

// Game Components
import { ColorGame, ColorDisplay } from "./components/ColorGame";
import { SoundGame, SoundDisplay } from "./components/SoundGame";
import { TimeGame, TimeDisplay } from "./components/TimeGame";
import { ShapeGame, ShapeDisplay } from "./components/ShapeGame";
import { SequenceGame, SequenceDisplay } from "./components/SequenceGame";
import { Leaderboard } from "./components/Leaderboard";
import { SensoryInsights } from "./components/SensoryInsights";
import { SharedScoreModal } from "./components/SharedScoreModal";

// Icons (SVG vector icons only — Strict Zero Emoji rule)
import {
  Palette,
  Volume2,
  VolumeX,
  Clock,
  Shapes,
  Trophy,
  Calendar,
  ChevronRight,
  X,
  Copy,
  Zap,
  Brain,
  Download,
  MessageCircle,
  Swords,
} from "lucide-react";
import type { ColorBlindType, ColorScoreResult } from "./games/colorScoring";
import type { SoundScoreResult } from "./games/soundScoring";
import type { TimeScoreResult } from "./games/timeScoring";
import type { ShapeScoreResult } from "./games/shapeScoring";

// ─── Types & Configurations ───────────────────────────────────────────────────
type GameScreen =
  | "intro"
  | "reveal"
  | "guess"
  | "round-result"
  | "total-result"
  | "daily-intro";

type AnyRoundResult =
  | ColorScoreResult
  | SoundScoreResult
  | TimeScoreResult
  | ShapeScoreResult
  | SequenceScoreResult;

interface RoundData {
  roundIndex: number;
  result: AnyRoundResult;
}

export const GAME_CONFIGS: Record<
  GameType,
  {
    icon: React.ReactNode;
    accent: string;
    revealDuration: Record<DifficultyType, number>;
  }
> = {
  color: {
    icon: <Palette className="w-5 h-5" />,
    accent: "#6366f1",
    revealDuration: { easy: 3000, hard: 2000, brutal: 1200 },
  },
  sound: {
    icon: <Volume2 className="w-5 h-5" />,
    accent: "#8b5cf6",
    revealDuration: { easy: 2000, hard: 1500, brutal: 1200 },
  },
  time: {
    icon: <Clock className="w-5 h-5" />,
    accent: "#10b981",
    revealDuration: { easy: 0, hard: 0, brutal: 0 },
  },
  shape: {
    icon: <Shapes className="w-5 h-5" />,
    accent: "#f59e0b",
    revealDuration: { easy: 3000, hard: 2000, brutal: 1200 },
  },
  sequence: {
    icon: <Zap className="w-5 h-5" />,
    accent: "#ec4899",
    revealDuration: { easy: 2000, hard: 1500, brutal: 1000 },
  },
};

const DIFFICULTY_COLORS: Record<DifficultyType, string> = {
  easy: "#10b981",
  hard: "#f59e0b",
  brutal: "#ef4444",
};

function generateRoundStimulus(
  gameType: GameType,
  seed: number,
  roundIndex: number,
  difficulty: DifficultyType
): object {
  const rng = (o: number) =>
    Math.sin(seed * 9301.5 + roundIndex * 49297.3 + o) * 0.5 + 0.5;

  switch (gameType) {
    case "color":
      return {
        h: Math.round(rng(1) * 360),
        s: Math.round(30 + rng(2) * 70),
        b: Math.round(40 + rng(3) * 55),
      };
    case "sound":
      return { freq: generateFrequency(seed, roundIndex, difficulty) };
    case "time":
      return { targetMs: generateTargetTime(seed, roundIndex, difficulty) };
    case "shape":
      return generateShape(seed, roundIndex, difficulty);
    case "sequence":
      return { seq: generateSequence(seed, roundIndex, difficulty) };
    default:
      return {};
  }
}

function extractScore(result: AnyRoundResult): number {
  return (result as { score: number }).score;
}

// ─── Inner Client Wrapped in Suspense ─────────────────────────────────────────
function HubSenseInner() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [screen, setScreen] = useState<GameScreen>("intro");
  const [selectedGame, setSelectedGame] = useState<GameType>("color");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType>("easy");
  const [selectedMode, setSelectedMode] = useState<ModeType>("solo");
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundData[]>([]);
  const [currentStimulus, setCurrentStimulus] = useState<object | null>(null);
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindType>("none");

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [incomingSharedScore, setIncomingSharedScore] = useState<SharePayload | null>(null);
  const [dailyCountdown, setDailyCountdown] = useState("");
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState<Record<string, boolean>>({});
  const [newRecord, setNewRecord] = useState(false);

  // Initialize mute state & username from local storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMuted(isSoundMuted());
    const savedUser = localStorage.getItem("hubsense_username");
    if (savedUser) setUsername(savedUser);

    const rawDaily = localStorage.getItem("hubsense_daily_played");
    if (rawDaily) {
      try {
        setDailyPlayed(JSON.parse(rawDaily));
      } catch {
        // ignore
      }
    }
  }, []);

  // Daily countdown timer
  useEffect(() => {
    const tick = () => setDailyCountdown(formatCountdown(getMsUntilNextUTCMidnight()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check URL query parameters on mount (?share=... or ?challenge=...)
  useEffect(() => {
    if (!searchParams) return;
    const shareParam = searchParams.get("share");
    if (shareParam) {
      const decoded = decodeSharePayload(shareParam);
      if (decoded) {
        setIncomingSharedScore(decoded);
      }
    }

    const challengeParam = searchParams.get("challenge");
    if (challengeParam) {
      const parsed = parseChallengeUrl(challengeParam);
      if (parsed) {
        toast.info(t.toasts.challengeLoaded);
        setSelectedGame(parsed.gameType);
        setSelectedDifficulty(parsed.difficulty);
      }
    }
  }, [searchParams, t.toasts.challengeLoaded]);

  // Audio Context unlocker
  const initAudio = useCallback(async () => {
    const ctx = await unlockAudio();
    if (ctx) setAudioCtx(ctx);
    return ctx!;
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
    if (!nextMuted) {
      SoundFX.toggle();
    }
  };

  // Total score
  const totalScore = roundResults.reduce((sum, r) => sum + extractScore(r.result), 0);
  const config = GAME_CONFIGS[selectedGame];
  const accentColor = config.accent;
  const currentDiscipline = t.disciplines[selectedGame];

  // ─── Game Flow ─────────────────────────────────────────────────────────────
  const startGame = useCallback(
    (gameType: GameType, difficulty: DifficultyType, mode: ModeType, customSeed?: number) => {
      unlockAudio();
      SoundFX.click();

      const newSession = createGameSession(gameType, difficulty, mode);
      if (customSeed !== undefined) {
        newSession.seed = customSeed;
      }

      setSession(newSession);
      setSelectedGame(gameType);
      setSelectedDifficulty(difficulty);
      setSelectedMode(mode);
      setCurrentRound(0);
      setRoundResults([]);
      setSharePayload(null);
      setNewRecord(false);

      const stimulus = generateRoundStimulus(gameType, newSession.seed, 0, difficulty);
      setCurrentStimulus(stimulus);

      if (mode === "daily") {
        setScreen("daily-intro");
      } else {
        setScreen("reveal");
      }
    },
    []
  );

  const proceedToReveal = useCallback(() => {
    SoundFX.click();
    setScreen("reveal");
  }, []);

  const handleRevealComplete = useCallback(() => {
    setScreen("guess");
  }, []);

  const handleRoundSubmit = useCallback(
    (result: AnyRoundResult) => {
      const newRound: RoundData = { roundIndex: currentRound, result };
      const newResults = [...roundResults, newRound];
      setRoundResults(newResults);
      setScreen("round-result");

      const score = extractScore(result);
      if (score >= 7.5) {
        SoundFX.successRound();
      } else if (score < 4) {
        SoundFX.failRound();
      }

      // Preload next stimulus
      if (session && currentRound + 1 < ROUNDS_COUNT) {
        const nextStimulus = generateRoundStimulus(
          session.gameType,
          session.seed,
          currentRound + 1,
          selectedDifficulty
        );
        setTimeout(() => setCurrentStimulus(nextStimulus), 300);
      }
    },
    [currentRound, roundResults, session, selectedDifficulty]
  );

  const handleNextRound = useCallback(() => {
    SoundFX.click();
    if (!session) return;
    const nextRound = currentRound + 1;

    if (nextRound >= ROUNDS_COUNT) {
      // Complete game
      const allScores = [...roundResults.map((r) => extractScore(r.result))];
      const total = allScores.reduce((a, b) => a + b, 0);

      const { isNewRecord: recordAchieved } = updatePersonalBest(
        session.gameType,
        selectedDifficulty,
        allScores
      );
      setNewRecord(recordAchieved);
      SoundFX.gameComplete();

      const payload: SharePayload = {
        username: username || "ANONIM",
        totalScore: total,
        roundScores: allScores,
        gameType: session.gameType,
        difficulty: selectedDifficulty,
        mode: selectedMode,
        dateSeed: session.dateSeed,
        timestamp: Date.now(),
      };
      setSharePayload(payload);
      setScreen("total-result");
    } else {
      setCurrentRound(nextRound);
      const nextStimulus = generateRoundStimulus(
        session.gameType,
        session.seed,
        nextRound,
        selectedDifficulty
      );
      setCurrentStimulus(nextStimulus);
      setScreen("reveal");
    }
  }, [currentRound, roundResults, session, selectedDifficulty, selectedMode, username]);

  const handleScoreSubmit = useCallback(async () => {
    if (!sharePayload || !session) return;

    const validation = validateUsername(username);
    if (!validation.valid) {
      setUsernameError(validation.error ?? t.toasts.invalidUsername);
      triggerHaptic(50);
      return;
    }
    setUsernameError("");

    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      toast.error(t.toasts.rateLimit);
      return;
    }

    const scores = sharePayload.roundScores;
    if (!validateScoreBounds(scores)) {
      toast.error(t.toasts.invalidScores);
      return;
    }

    if (isReplay(session.gameType, session.seed, username)) {
      toast.error(t.toasts.alreadySubmitted);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await buildScorePayload(
        username,
        scores,
        session.gameType,
        selectedDifficulty,
        selectedMode,
        session.seed,
        session.dateSeed
      );

      const { success, error, rank } = await submitScore(payload);
      if (success) {
        toast.success(
          rank ? t.toasts.scoreSavedRank(rank) : t.toasts.scoreSaved
        );
        recordSubmission();
        recordSeed(session.gameType, session.seed, username);
        localStorage.setItem("hubsense_username", username.toUpperCase().trim());

        if (selectedMode === "daily" && session.dateSeed) {
          const updated = { ...dailyPlayed, [session.dateSeed]: true };
          setDailyPlayed(updated);
          localStorage.setItem("hubsense_daily_played", JSON.stringify(updated));
        }

        setShowLeaderboard(true);
      } else {
        toast.error(error ?? t.toasts.submitError);
      }
    } catch {
      toast.error(t.toasts.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }, [sharePayload, session, username, selectedDifficulty, selectedMode, dailyPlayed, t.toasts]);

  const handleCopyShare = useCallback(async () => {
    if (!sharePayload) return;
    SoundFX.click();
    const url = buildShareUrl({ ...sharePayload, username: username || "ANONIM" });
    await navigator.clipboard.writeText(url);
    toast.success(t.toasts.scoreCopied);
  }, [sharePayload, username, t.toasts.scoreCopied]);

  const handleCopyChallenge = useCallback(async () => {
    if (!session) return;
    SoundFX.click();
    const url = buildChallengeUrl(session.gameType, selectedDifficulty, session.seed);
    await navigator.clipboard.writeText(url);
    toast.success(t.toasts.challengeCopied);
  }, [session, selectedDifficulty, t.toasts.challengeCopied]);

  const handleNativeShare = useCallback(async () => {
    if (!sharePayload) return;
    SoundFX.click();
    const payload = { ...sharePayload, username: username || "ANONIM" };
    const shared = await nativeShare(payload);
    if (!shared) handleCopyShare();
  }, [sharePayload, username, handleCopyShare]);

  const handleDownloadPng = useCallback(async () => {
    if (!sharePayload) return;
    SoundFX.click();
    toast.info(t.toasts.pngGenerating);
    await downloadScoreCardImage({ ...sharePayload, username: username || "ANONIM" });
    toast.success(t.toasts.pngDownloaded);
  }, [sharePayload, username, t.toasts]);

  const resetToIntro = useCallback(() => {
    SoundFX.click();
    setScreen("intro");
    setRoundResults([]);
    setCurrentRound(0);
    setSession(null);
    setSharePayload(null);
  }, []);

  // Current stimulus typed accessors
  const colorStimulus = currentStimulus as { h: number; s: number; b: number } | null;
  const soundStimulus = currentStimulus as { freq: number } | null;
  const timeStimulus = currentStimulus as { targetMs: number } | null;
  const shapeStimulus = currentStimulus as Parameters<typeof ShapeGame>[0]["target"] | null;
  const sequenceStimulus = currentStimulus as { seq: number[] } | null;

  const tier = sharePayload ? getScoreTier(sharePayload.totalScore) : null;

  return (
    <div
      className="min-h-screen bg-transparent text-white relative overflow-x-hidden flex flex-col font-sans select-none pt-24 pb-12 px-4 sm:px-6"
      data-no-custom-cursor="true"
    >
      {/* Ambient Liquid Specular Glow (Subtle and non-intrusive) */}
      <div
        className="pointer-events-none fixed inset-0 opacity-25 transition-all duration-700 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${accentColor}25 0%, transparent 65%)`,
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* ─── 1. INTRO SCREEN ──────────────────────────────────────────────── */}
          {screen === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-6 w-full"
            >
              {/* Header Card */}
              <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-baseline gap-1">
                    <span>Hub</span>
                    <span style={{ color: accentColor }}>Sense</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">
                    {t.subtitle}
                  </p>
                </div>

                {/* Quick Toolbar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSound}
                    aria-label={t.soundToggle}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors text-white/70 shadow-lg"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      SoundFX.click();
                      setShowInsights(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-white/80 shadow-lg"
                  >
                    <Brain className="w-4 h-4 text-indigo-400" />
                    <span className="hidden sm:inline">{t.sensoryProfile}</span>
                  </button>

                  <button
                    onClick={() => {
                      SoundFX.click();
                      setShowLeaderboard(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-white/80 shadow-lg"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>{t.scores}</span>
                  </button>
                </div>
              </div>

              {/* Game Selector Grid */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-extrabold text-white/40 uppercase tracking-widest px-1">
                  {t.selectDiscipline}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(
                    Object.entries(GAME_CONFIGS) as [
                      GameType,
                      (typeof GAME_CONFIGS)[GameType]
                    ][]
                  ).map(([type, cfg]) => {
                    const isSelected = selectedGame === type;
                    const dInfo = t.disciplines[type];
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          SoundFX.click();
                          setSelectedGame(type);
                        }}
                        className={`flex flex-col gap-2.5 p-4 sm:p-5 rounded-3xl border text-left transition-all relative overflow-hidden backdrop-blur-2xl
                          ${
                            isSelected
                              ? "bg-white/[0.08] border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
                              : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15"
                          }`}
                        style={{
                          boxShadow: isSelected
                            ? `0 0 30px ${cfg.accent}33`
                            : undefined,
                          borderColor: isSelected ? `${cfg.accent}88` : undefined,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                          style={{
                            background: `${cfg.accent}20`,
                            color: cfg.accent,
                            border: `1px solid ${cfg.accent}44`,
                          }}
                        >
                          {cfg.icon}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm sm:text-base text-white">
                            {dInfo.label}
                          </div>
                          <div className="text-[11px] text-white/40 leading-snug mt-1 line-clamp-2">
                            {dInfo.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="flex flex-col gap-2.5">
                <p className="text-[11px] font-extrabold text-white/40 uppercase tracking-widest px-1">
                  {t.difficultyLevel}
                </p>
                <div className="flex gap-2">
                  {(["easy", "hard", "brutal"] as DifficultyType[]).map((diff) => {
                    const isSelected = selectedDifficulty === diff;
                    const color = DIFFICULTY_COLORS[diff];
                    return (
                      <button
                        key={diff}
                        onClick={() => {
                          SoundFX.click();
                          setSelectedDifficulty(diff);
                        }}
                        className={`flex-1 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm border transition-all backdrop-blur-xl
                          ${
                            isSelected
                              ? "bg-white/[0.08] text-white border-white/25 shadow-lg"
                              : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                          }`}
                        style={{
                          borderColor: isSelected ? `${color}77` : undefined,
                          color: isSelected ? color : undefined,
                          boxShadow: isSelected ? `0 0 20px ${color}25` : undefined,
                        }}
                      >
                        {t.difficulties[diff].label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-white/40 px-1">
                  {t.difficulties[selectedDifficulty].desc}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                {/* Daily Challenge Button */}
                <button
                  onClick={() => startGame(selectedGame, selectedDifficulty, "daily")}
                  className="flex items-center justify-between px-5 py-4 rounded-3xl border
                    bg-white/[0.03] border-white/10 hover:bg-white/[0.06] backdrop-blur-2xl transition-all group shadow-xl"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-sm text-white">
                        {t.dailyChallenge}
                      </div>
                      <div className="text-xs text-white/40 font-mono">
                        {getTodayUTCString()} · {t.dailyRefreshesIn}: {dailyCountdown}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/80 transition-colors" />
                </button>

                {/* Solo Play CTA */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame(selectedGame, selectedDifficulty, "solo")}
                  className="w-full py-4 sm:py-5 rounded-3xl font-black text-base sm:text-lg tracking-wider
                    text-white border transition-all shadow-2xl uppercase backdrop-blur-xl"
                  style={{
                    background: `${accentColor}25`,
                    borderColor: `${accentColor}66`,
                    boxShadow: `0 0 40px ${accentColor}30`,
                  }}
                >
                  {t.startSoloGame}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── 2. DAILY CHALLENGE INTRO ────────────────────────────────────── */}
          {screen === "daily-intro" && (
            <motion.div
              key="daily-intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center gap-6"
            >
              <div>
                <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">
                  {t.dailyChallengeBadge}
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-3">
                  {currentDiscipline.label}
                </div>
                <p className="text-white/60 text-sm max-w-sm mx-auto leading-relaxed">
                  {t.dailyChallengeDesc}
                </p>
              </div>

              <div className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/60 font-mono">
                {getTodayUTCString()} · {t.dailyRefreshesIn}: {dailyCountdown}
              </div>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={proceedToReveal}
                  className="w-full py-4 rounded-2xl font-extrabold text-base text-white border shadow-2xl backdrop-blur-xl"
                  style={{
                    background: `${accentColor}30`,
                    borderColor: `${accentColor}70`,
                    boxShadow: `0 0 35px ${accentColor}40`,
                  }}
                >
                  {t.dailyReadyPrompt}
                </motion.button>

                <button
                  onClick={resetToIntro}
                  className="text-white/40 text-xs hover:text-white/70 transition-colors py-2"
                >
                  {t.goBack}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── 3. STIMULUS REVEAL PHASE ────────────────────────────────────── */}
          {screen === "reveal" && session && currentStimulus && (
            <div key="reveal" className="w-full">
              {session.gameType === "color" && colorStimulus && (
                <ColorDisplay
                  key={`color-reveal-${currentRound}`}
                  h={colorStimulus.h}
                  s={colorStimulus.s}
                  b={colorStimulus.b}
                  revealDurationMs={config.revealDuration[selectedDifficulty]}
                  onHide={handleRevealComplete}
                  colorBlindMode={colorBlindMode}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
              {session.gameType === "sound" && soundStimulus && (
                <SoundDisplay
                  key={`sound-reveal-${currentRound}`}
                  freq={soundStimulus.freq}
                  durationMs={config.revealDuration[selectedDifficulty]}
                  onHide={handleRevealComplete}
                  audioCtx={audioCtx}
                  onInitAudio={initAudio}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
              {session.gameType === "time" && timeStimulus && (
                <TimeDisplay
                  key={`time-reveal-${currentRound}`}
                  targetMs={timeStimulus.targetMs}
                  onHide={handleRevealComplete}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
              {session.gameType === "shape" && shapeStimulus && (
                <ShapeDisplay
                  key={`shape-reveal-${currentRound}`}
                  shape={shapeStimulus}
                  durationMs={config.revealDuration[selectedDifficulty]}
                  onHide={handleRevealComplete}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
              {session.gameType === "sequence" && sequenceStimulus && (
                <SequenceDisplay
                  key={`seq-reveal-${currentRound}`}
                  sequence={sequenceStimulus.seq}
                  onHide={handleRevealComplete}
                  speedMs={selectedDifficulty === "brutal" ? 500 : 700}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
            </div>
          )}

          {/* ─── 4. INTERACTIVE GUESS / RECONSTRUCTION PHASE ───────────────────── */}
          {screen === "guess" && session && currentStimulus && (
            <motion.div
              key={`guess-${currentRound}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full flex flex-col gap-4"
            >
              {/* Game Arena Body */}
              {session.gameType === "color" && colorStimulus && (
                <ColorGame
                  targetColor={colorStimulus}
                  onSubmit={handleRoundSubmit as (r: ColorScoreResult) => void}
                  difficulty={selectedDifficulty}
                  colorBlindMode={colorBlindMode}
                  onColorBlindToggle={setColorBlindMode}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
              {session.gameType === "sound" && soundStimulus && (
                <SoundGame
                  targetFreq={soundStimulus.freq}
                  onSubmit={handleRoundSubmit as (r: SoundScoreResult) => void}
                  audioCtx={audioCtx}
                  onInitAudio={initAudio}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
              {session.gameType === "time" && timeStimulus && (
                <TimeGame
                  targetMs={timeStimulus.targetMs}
                  onSubmit={handleRoundSubmit as (r: TimeScoreResult) => void}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
              {session.gameType === "shape" && shapeStimulus && (
                <ShapeGame
                  target={shapeStimulus}
                  onSubmit={handleRoundSubmit as (r: ShapeScoreResult) => void}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
              {session.gameType === "sequence" && sequenceStimulus && (
                <SequenceGame
                  targetSequence={sequenceStimulus.seq}
                  onSubmit={handleRoundSubmit as (r: SequenceScoreResult) => void}
                  roundNumber={currentRound + 1}
                  totalRounds={ROUNDS_COUNT}
                />
              )}
            </motion.div>
          )}

          {/* ─── 5. ROUND RESULT SCREEN ──────────────────────────────────────── */}
          {screen === "round-result" && roundResults.length > 0 && (
            <motion.div
              key={`round-result-${currentRound}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] gap-6 text-center"
            >
              <div>
                <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-2">
                  {t.roundCounter} {currentRound + 1} {t.roundResult.title}
                </div>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="text-7xl sm:text-8xl font-black font-mono tracking-tight"
                  style={{ color: accentColor }}
                >
                  {extractScore(roundResults[roundResults.length - 1].result).toFixed(1)}
                </motion.div>
                <div className="text-white/30 text-sm mt-1">{t.roundResult.outOf}</div>
              </div>

              {/* Side-by-side / Detailed Comparison */}
              <div className="w-full">
                <RoundResultDetails
                  result={roundResults[roundResults.length - 1].result}
                  gameType={session?.gameType ?? "color"}
                  accentColor={accentColor}
                />
              </div>

              <div className="text-center text-xs text-white/50 font-mono">
                {t.roundResult.cumulative}: {totalScore.toFixed(1)} / {(currentRound + 1) * 10}.0
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNextRound}
                className="w-full py-4 rounded-2xl font-extrabold text-base text-white border transition-all shadow-xl backdrop-blur-xl"
                style={{
                  background: `${accentColor}25`,
                  borderColor: `${accentColor}66`,
                  boxShadow: `0 0 30px ${accentColor}30`,
                }}
              >
                {currentRound + 1 < ROUNDS_COUNT
                  ? t.roundResult.nextRound
                  : t.roundResult.viewFinals}
              </motion.button>
            </motion.div>
          )}

          {/* ─── 6. FINAL TOTAL RESULTS SCREEN ────────────────────────────────── */}
          {screen === "total-result" && sharePayload && (
            <motion.div
              key="total-result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] gap-6"
            >
              {/* Header Close */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="font-extrabold text-sm text-white">
                    {t.totalResult.title}
                  </span>
                </div>
                <button
                  onClick={resetToIntro}
                  aria-label={t.totalResult.menuReturn}
                  className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/[0.05] hover:bg-white/15 border border-white/10"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Score Showcase */}
              <div className="flex flex-col items-center justify-center text-center py-2">
                {newRecord && (
                  <div
                    className="mb-3 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider"
                    style={{
                      background: `${accentColor}22`,
                      color: accentColor,
                      border: `1px solid ${accentColor}55`,
                    }}
                  >
                    {t.totalResult.newPersonalBest}
                  </div>
                )}

                {tier && (
                  <>
                    <div
                      className="text-xs font-extrabold uppercase tracking-widest mb-1"
                      style={{ color: tier.color }}
                    >
                      {tier.label}
                    </div>
                    <motion.div
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 180 }}
                      className="text-8xl sm:text-9xl font-black font-mono tracking-tighter"
                      style={{ color: tier.color }}
                    >
                      {sharePayload.totalScore.toFixed(1)}
                    </motion.div>
                    <div className="text-white/30 text-lg mt-0.5">
                      {t.totalResult.outOfFifty}
                    </div>
                    <p className="text-white/60 text-xs sm:text-sm mt-3 max-w-sm">
                      {tier.message}
                    </p>
                  </>
                )}
              </div>

              {/* Round by Round Bars */}
              <div className="grid grid-cols-5 gap-2">
                {sharePayload.roundScores.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-2xl flex items-end justify-center overflow-hidden"
                      style={{ height: 60, background: "rgba(255,255,255,0.03)" }}
                    >
                      <motion.div
                        className="w-full rounded-xl"
                        style={{
                          background: accentColor,
                          opacity: 0.75 + (s / 10) * 0.25,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(s / 10) * 52 + 4}px` }}
                        transition={{ delay: i * 0.08, type: "spring" }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white/70 font-mono">
                      {s.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white/30">R{i + 1}</span>
                  </div>
                ))}
              </div>

              {/* Username Submission */}
              <div className="flex flex-col gap-2 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.08]">
                <label className="text-xs font-bold text-white/60">
                  {t.totalResult.leaderboardLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t.totalResult.nicknamePlaceholder}
                    maxLength={20}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toUpperCase());
                      setUsernameError("");
                    }}
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10
                      text-white placeholder-white/25 text-xs focus:outline-none focus:border-white/30
                      font-mono uppercase tracking-wider"
                  />
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleScoreSubmit}
                    disabled={isSubmitting || !username.trim()}
                    className="px-5 py-3.5 rounded-2xl font-bold text-xs text-white border transition-all disabled:opacity-30"
                    style={{
                      background: `${accentColor}25`,
                      borderColor: `${accentColor}55`,
                    }}
                  >
                    {isSubmitting
                      ? t.totalResult.submitting
                      : t.totalResult.submitScore}
                  </motion.button>
                </div>
                {usernameError && (
                  <p className="text-xs text-rose-400 mt-1">{usernameError}</p>
                )}
              </div>

              {/* Social Share Grid */}
              <div className="flex flex-col gap-2.5">
                <p className="text-[11px] font-bold text-white/30 text-center uppercase tracking-widest">
                  {t.totalResult.shareHeader}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={handleCopyShare}
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                      bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.totalResult.scoreLink}</span>
                  </button>

                  <button
                    onClick={handleCopyChallenge}
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                      bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                  >
                    <Swords className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.totalResult.challengeFriend}</span>
                  </button>

                  <button
                    onClick={handleDownloadPng}
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                      bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.totalResult.downloadPng}</span>
                  </button>

                  <a
                    href={buildTwitterShareUrl({
                      ...sharePayload,
                      username: username || "ANONIM",
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                      bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>{t.totalResult.twitterShare}</span>
                  </a>

                  <a
                    href={buildWhatsAppShareUrl({
                      ...sharePayload,
                      username: username || "ANONIM",
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                      bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.totalResult.whatsAppShare}</span>
                  </a>

                  <button
                    onClick={handleNativeShare}
                    className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                      bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                  >
                    <Zap className="w-3.5 h-3.5 text-pink-400" />
                    <span>{t.totalResult.nativeShare}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global & Local Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard
            gameType={selectedGame}
            difficulty={selectedDifficulty}
            onClose={() => setShowLeaderboard(false)}
            highlightUsername={username}
          />
        )}
      </AnimatePresence>

      {/* Sensory Insights & Radar Profile Modal */}
      <AnimatePresence>
        {showInsights && (
          <SensoryInsights onClose={() => setShowInsights(false)} />
        )}
      </AnimatePresence>

      {/* Incoming Shared Score Modal */}
      <AnimatePresence>
        {incomingSharedScore && (
          <SharedScoreModal
            payload={incomingSharedScore}
            onAcceptChallenge={() => {
              const targetGame = incomingSharedScore.gameType;
              const targetDiff = incomingSharedScore.difficulty;
              setIncomingSharedScore(null);
              startGame(targetGame, targetDiff, "solo");
            }}
            onClose={() => setIncomingSharedScore(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function HubSenseClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center text-white/40 font-mono text-sm">
          HubSense Yükleniyor...
        </div>
      }
    >
      <HubSenseInner />
    </Suspense>
  );
}

// ─── Round Result Details ─────────────────────────────────────────────────────
function RoundResultDetails({
  result,
  gameType,
  accentColor,
}: {
  result: AnyRoundResult;
  gameType: GameType;
  accentColor: string;
}) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const rows: { label: string; value: string }[] = [];

  if (gameType === "color") {
    const r = result as ColorScoreResult;
    return (
      <div
        className="rounded-3xl border p-5 flex flex-col gap-4 shadow-xl"
        style={{ borderColor: `${accentColor}33`, background: `${accentColor}0a` }}
      >
        {/* Side by side color boxes */}
        <div className="flex items-center gap-3 justify-center">
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full h-16 rounded-2xl shadow-lg border border-white/20"
              style={{ background: r.targetHex }}
            />
            <span className="text-[11px] font-bold text-white/60">
              {t.roundResult.targetColor}
            </span>
            <span className="text-xs font-mono text-white/90">{r.targetHex.toUpperCase()}</span>
          </div>

          <div className="text-white/30 text-xs font-bold font-mono">VS</div>

          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full h-16 rounded-2xl shadow-lg border border-white/20"
              style={{ background: r.guessHex }}
            />
            <span className="text-[11px] font-bold text-white/60">
              {t.roundResult.yourGuess}
            </span>
            <span className="text-xs font-mono text-white/90">{r.guessHex.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
          <span className="text-white/40">{t.roundResult.deltaE}</span>
          <span className="font-mono font-bold text-indigo-300">ΔE {r.deltaE.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">{t.roundResult.accuracy}</span>
          <span className="font-mono font-bold text-white/90">%{r.percentAccuracy}</span>
        </div>
      </div>
    );
  }

  if (gameType === "sound") {
    const r = result as SoundScoreResult;
    rows.push(
      { label: t.roundResult.pitchDev, value: `${r.centDiff.toFixed(0)} sent` },
      { label: t.roundResult.targetFreq, value: `${Math.round(r.targetFreq)}Hz (${r.targetNote})` },
      { label: t.roundResult.guessFreq, value: `${Math.round(r.guessFreq)}Hz (${r.guessNote})` },
      { label: t.roundResult.accuracy, value: `%${r.percentAccuracy}` }
    );
  } else if (gameType === "time") {
    const r = result as TimeScoreResult;
    rows.push(
      { label: t.roundResult.targetDuration, value: `${r.targetMs}ms` },
      { label: t.roundResult.guessDuration, value: `${r.guessMs}ms` },
      {
        label: t.roundResult.errorMargin,
        value: `${r.absoluteErrorMs}ms (%${(r.relativeError * 100).toFixed(1)})`,
      },
      {
        label: t.roundResult.timing,
        value:
          r.earlyOrLate === "perfect"
            ? t.roundResult.timingPerfect
            : r.earlyOrLate === "early"
            ? t.roundResult.timingEarly
            : t.roundResult.timingLate,
      }
    );
  } else if (gameType === "shape") {
    const r = result as ShapeScoreResult;
    rows.push(
      { label: t.roundResult.iouOverlap, value: `%${(r.iou * 100).toFixed(1)}` },
      { label: t.roundResult.rotationDev, value: `${r.rotationError.toFixed(1)}°` },
      { label: t.roundResult.scaleDev, value: `%${(r.scaleError * 100).toFixed(1)}` },
      { label: t.roundResult.positionDev, value: `%${(r.positionError * 100).toFixed(1)}` }
    );
  } else if (gameType === "sequence") {
    const r = result as SequenceScoreResult;
    rows.push(
      { label: t.roundResult.matchedSteps, value: `${r.matchedCount} / ${r.totalSteps}` },
      { label: t.roundResult.chainAccuracy, value: `%${r.percentAccuracy}` },
      {
        label: t.roundResult.memoryState,
        value: r.isPerfect ? t.roundResult.chainPerfect : t.roundResult.chainPartial,
      }
    );
  }

  return (
    <div
      className="rounded-3xl border p-5 flex flex-col gap-2.5 shadow-xl"
      style={{ borderColor: `${accentColor}33`, background: `${accentColor}0a` }}
    >
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between text-xs">
          <span className="text-white/40">{label}</span>
          <span className="font-mono font-semibold text-white/90">{value}</span>
        </div>
      ))}
    </div>
  );
}
