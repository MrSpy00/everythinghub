"use client";

/**
 * HubSense — Cognitive Sensory Memory Game Arena (Creative Studio Edition)
 * Orchestrates Color, Sound, Time, Shape, and Harmonic Sequence perception games.
 * 100% Client-Side, Zero-Auth Serverless Leaderboard, Offline LocalStorage,
 * Cryptographic Anti-Cheat, High-Res Score Card Generator, and Full Bilingual (TR/EN) i18n.
 * Dynamic Configurable Rounds (3, 5, 10, Custom), Mixed-Case Profanity-Moderated Nicknames,
 * Translucent Liquid Glass Background, Balanced Responsive Grids, and Context-Aware Cursors.
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
  DEFAULT_ROUNDS_COUNT,
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

// Icons
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
  Plus,
  Minus,
  User,
  ArrowLeft,
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
  | "total-result"
  | "daily-intro"
  | "inter-round";

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
  const roundSeed = (seed ^ ((roundIndex + 1) * 0x85ebca6b) ^ 0x61a84f35) >>> 0;
  let s = roundSeed;
  const rng = () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };

  switch (gameType) {
    case "color": {
      // Golden ratio hue stepping + dynamic contrast profile rotation across rounds
      const baseHue = ((seed % 360) + roundIndex * 137.5 + rng() * 90) % 360;
      
      const contrastMode = (roundIndex + Math.floor(seed % 4)) % 4;
      let sVal: number;
      let bVal: number;

      if (contrastMode === 0) {
        // Pastel / Muted
        sVal = Math.round(20 + rng() * 30);
        bVal = Math.round(75 + rng() * 20);
      } else if (contrastMode === 1) {
        // Vivid Neon
        sVal = Math.round(80 + rng() * 20);
        bVal = Math.round(80 + rng() * 20);
      } else if (contrastMode === 2) {
        // Deep Jewel Tone
        sVal = Math.round(65 + rng() * 30);
        bVal = Math.round(25 + rng() * 30);
      } else {
        // Mellow Earth
        sVal = Math.round(40 + rng() * 40);
        bVal = Math.round(45 + rng() * 45);
      }

      return {
        h: Math.round(baseHue),
        s: sVal,
        b: bVal,
      };
    }
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
  const [selectedRounds, setSelectedRounds] = useState<number>(DEFAULT_ROUNDS_COUNT);
  const [isCustomRounds, setIsCustomRounds] = useState<boolean>(false);
  const [customRoundsInput, setCustomRoundsInput] = useState<string>("7");

  const [selectedDelay, setSelectedDelay] = useState<number>(2);
  const [isCustomDelay, setIsCustomDelay] = useState<boolean>(false);
  const [customDelayInput, setCustomDelayInput] = useState<string>("3");
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(0);

  const [selectedRoundTimer, setSelectedRoundTimer] = useState<number>(0); // 0 = Unlimited (Default)
  const [isCustomTimer, setIsCustomTimer] = useState<boolean>(false);
  const [customTimerInput, setCustomTimerInput] = useState<string>("30");

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
  const [hudToast, setHudToast] = useState<{ score: number; text: string } | null>(null);

  // Computed Active Rounds Count (Always in sync with custom input)
  const parsedCustom = parseInt(customRoundsInput, 10);
  const activeRounds = isCustomRounds
    ? !isNaN(parsedCustom) && parsedCustom >= 1 && parsedCustom <= 20
      ? parsedCustom
      : 7
    : selectedRounds;

  const parsedCustomTimer = parseInt(customTimerInput, 10);
  const activeRoundTimer = isCustomTimer
    ? !isNaN(parsedCustomTimer) && parsedCustomTimer >= 5 && parsedCustomTimer <= 600
      ? parsedCustomTimer
      : 30
    : selectedRoundTimer;

  const scrollToTopOrArena = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

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

  // Browser History & In-Game Back Button Handling
  useEffect(() => {
    const handlePopState = () => {
      if (screen !== "intro") {
        setScreen("intro");
        setSession(null);
        setRoundResults([]);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [screen]);

  // Daily countdown timer & inter-round prep timer
  useEffect(() => {
    const tick = () => setDailyCountdown(formatCountdown(getMsUntilNextUTCMidnight()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (screen !== "inter-round") return;
    if (prepSecondsLeft <= 0) {
      setScreen("reveal");
      scrollToTopOrArena();
      return;
    }
    const timer = setInterval(() => {
      setPrepSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, prepSecondsLeft, scrollToTopOrArena]);

  // ── Venom Symbiote Engine: disable during active gameplay screens ──────────
  // During "reveal" and "guess" screens the symbiote would confuse players
  // (tendrils wrapping game UI elements). We signal the engine via a data attribute.
  useEffect(() => {
    const GAME_SCREENS: GameScreen[] = ["reveal", "guess", "inter-round"];
    const isInGame = GAME_SCREENS.includes(screen);
    if (isInGame) {
      document.body.setAttribute("data-venom-disabled", "true");
    } else {
      document.body.removeAttribute("data-venom-disabled");
    }
    return () => {
      document.body.removeAttribute("data-venom-disabled");
    };
  }, [screen]);

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

  const config = GAME_CONFIGS[selectedGame];
  const accentColor = config.accent;
  const currentDiscipline = t.disciplines[selectedGame];
  const totalRoundsCount = session?.totalRounds || activeRounds;

  // ─── Game Flow ─────────────────────────────────────────────────────────────
  const startGame = useCallback(
    (
      gameType: GameType,
      difficulty: DifficultyType,
      mode: ModeType,
      rounds = activeRounds,
      customSeed?: number
    ) => {
      unlockAudio();
      SoundFX.click();

      if (typeof window !== "undefined") {
        window.history.pushState({ hubsense: "play" }, "");
      }

      const roundCount = mode === "daily" ? DEFAULT_ROUNDS_COUNT : rounds;
      const newSession = createGameSession(gameType, difficulty, mode, roundCount);
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
      scrollToTopOrArena();
    },
    [activeRounds, scrollToTopOrArena]
  );

  const proceedToReveal = useCallback(() => {
    SoundFX.click();
    setScreen("reveal");
    scrollToTopOrArena();
  }, [scrollToTopOrArena]);

  const handleRevealComplete = useCallback(() => {
    setScreen("guess");
    scrollToTopOrArena();
  }, [scrollToTopOrArena]);

  // Direct seamless flow without intermediate blocking screen
  const handleRoundSubmit = useCallback(
    (result: AnyRoundResult) => {
      if (!session) return;
      const score = extractScore(result);
      const newRound: RoundData = { roundIndex: currentRound, result };
      const newResults = [...roundResults, newRound];
      setRoundResults(newResults);

      if (score >= 7.5) {
        SoundFX.successRound();
      } else if (score < 4) {
        SoundFX.failRound();
      }

      // Flash satisfying HUD score toast
      setHudToast({
        score,
        text: `+${score.toFixed(1)} ${lang === "tr" ? "Puan" : "Pts"}`,
      });
      setTimeout(() => setHudToast(null), 1000);

      const nextRoundIndex = currentRound + 1;
      if (nextRoundIndex < session.totalRounds) {
        // Direct transition to next round reveal or inter-round delay
        setCurrentRound(nextRoundIndex);
        const nextStimulus = generateRoundStimulus(
          session.gameType,
          session.seed,
          nextRoundIndex,
          selectedDifficulty
        );
        setCurrentStimulus(nextStimulus);

        const activeDelay = isCustomDelay
          ? Math.max(0, Math.min(30, parseInt(customDelayInput, 10) || 3))
          : selectedDelay;

        if (activeDelay > 0) {
          setPrepSecondsLeft(activeDelay);
          setScreen("inter-round");
          scrollToTopOrArena();
        } else {
          setScreen("reveal");
          scrollToTopOrArena();
        }
      } else {
        // Complete game -> Total Result Screen
        const allScores = newResults.map((r) => extractScore(r.result));
        const rawTotal = allScores.reduce((a, b) => a + b, 0);
        const total = (rawTotal / (session.totalRounds * 10)) * 50;

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
        scrollToTopOrArena();
      }
    },
    [currentRound, roundResults, session, selectedDifficulty, selectedMode, username, lang, scrollToTopOrArena]
  );

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
        localStorage.setItem("hubsense_username", username.trim());

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
    scrollToTopOrArena();
  }, [scrollToTopOrArena]);

  // Current stimulus typed accessors
  const colorStimulus = currentStimulus as { h: number; s: number; b: number } | null;
  const soundStimulus = currentStimulus as { freq: number } | null;
  const timeStimulus = currentStimulus as { targetMs: number } | null;
  const shapeStimulus = currentStimulus as Parameters<typeof ShapeGame>[0]["target"] | null;
  const sequenceStimulus = currentStimulus as { seq: number[] } | null;

  const tier = sharePayload ? getScoreTier(sharePayload.totalScore) : null;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-transparent text-white relative overflow-x-hidden flex flex-col justify-center items-center font-sans select-none py-4 sm:py-6 px-3 sm:px-6">
      {/* Ambient Specular Glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20 transition-all duration-700 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${accentColor}25 0%, transparent 65%)`,
        }}
      />

      {/* Floating HUD Score Toast */}
      <AnimatePresence>
        {hudToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            className="fixed top-20 z-50 px-4 py-2 rounded-full bg-zinc-950/90 border border-white/20 backdrop-blur-2xl shadow-2xl flex items-center gap-2 text-sm font-black font-mono"
            style={{
              color: hudToast.score >= 7.5 ? "#10b981" : hudToast.score >= 4 ? "#f59e0b" : "#f43f5e",
              boxShadow: `0 0 25px ${hudToast.score >= 7.5 ? "#10b98144" : "#f43f5e44"}`,
            }}
          >
            <Zap className="w-4 h-4" />
            <span>{hudToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className={`w-full ${screen === "intro" ? "max-w-4xl lg:max-w-5xl" : "max-w-3xl lg:max-w-4xl"} mx-auto flex flex-col justify-center items-center transition-all duration-300`}>
        <AnimatePresence mode="wait">
          {/* ─── 1. INTRO SCREEN ──────────────────────────────────────────────── */}
          {screen === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3.5 sm:gap-4.5 w-full"
            >
              {/* Header Card (Fully Responsive: 2 Rows on Mobile, 1 Row on Desktop) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] gap-3.5">
                {/* Top Row / Left Section: Brand Logo & Subtitle + Name Input on Mobile */}
                <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                  <div className="flex flex-col">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter inline-flex items-baseline select-none">
                      <span>Hub</span>
                      <span style={{ color: accentColor }}>Sense</span>
                    </h1>
                    <p className="text-[11px] sm:text-sm text-white/50 leading-snug">
                      {t.subtitle}
                    </p>
                  </div>

                  {/* Interactive Global Nickname Pill (Mobile View Placement) */}
                  <div
                    className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-white/30 transition-all shadow-lg shrink-0"
                    data-cursor={lang === "tr" ? "Rumuzunu Belirle" : "Set Nickname"}
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 20);
                        setUsername(val);
                        localStorage.setItem("hubsense_username", val.trim());
                      }}
                      placeholder={lang === "tr" ? "Rumuzun" : "Nickname"}
                      className="bg-transparent text-xs font-bold text-white border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 shadow-none w-20 placeholder:text-white/30"
                      maxLength={20}
                    />
                  </div>
                </div>

                {/* Quick Toolbar (3 Equal Buttons on Mobile, Desktop Inline Row) */}
                <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
                  {/* Interactive Global Nickname Pill (Desktop View Placement) */}
                  <div
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-white/30 transition-all shadow-lg"
                    data-cursor={lang === "tr" ? "Rumuzunu Belirle" : "Set Nickname"}
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 20);
                        setUsername(val);
                        localStorage.setItem("hubsense_username", val.trim());
                      }}
                      placeholder={lang === "tr" ? "Rumuzun" : "Nickname"}
                      className="bg-transparent text-xs font-bold text-white border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 shadow-none w-24 placeholder:text-white/30"
                      maxLength={20}
                    />
                  </div>

                  <button
                    onClick={toggleSound}
                    aria-label={t.soundToggle}
                    data-cursor={t.soundToggle}
                    className="flex items-center justify-center gap-1.5 py-2.5 sm:w-10 sm:h-10 sm:py-0 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/15 active:scale-95 transition-all text-xs font-bold text-white/80 shadow-lg"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="sm:hidden text-[11px] truncate">
                      {muted ? (lang === "tr" ? "Sessiz" : "Muted") : (lang === "tr" ? "Ses Açık" : "Audio")}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      SoundFX.click();
                      setShowInsights(true);
                    }}
                    data-cursor={t.sensoryProfile}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 sm:py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/15 active:scale-95 transition-all text-xs font-bold text-white/80 shadow-lg"
                  >
                    <Brain className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold">
                      <span className="hidden sm:inline">{t.sensoryProfile}</span>
                      <span className="sm:hidden">{lang === "tr" ? "Profil" : "Profile"}</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      SoundFX.click();
                      setShowLeaderboard(true);
                    }}
                    data-cursor={t.scores}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 sm:py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/15 active:scale-95 transition-all text-xs font-bold text-white/80 shadow-lg"
                  >
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs truncate">{t.scores}</span>
                  </button>
                </div>
              </div>

              {/* Game Selector Grid (Full, Unclipped 5 Disciplines Studio Cards) */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] sm:text-[11px] font-extrabold text-white/40 uppercase tracking-widest px-1">
                  {t.selectDiscipline}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {(
                    Object.entries(GAME_CONFIGS) as [
                      GameType,
                      (typeof GAME_CONFIGS)[GameType]
                    ][]
                  ).map(([type, cfg], index) => {
                    const isSelected = selectedGame === type;
                    const dInfo = t.disciplines[type];
                    const isLastOnMobile = index === 4;

                    const scienceBadge =
                      type === "color"
                        ? "CIELAB"
                        : type === "sound"
                        ? "ERB"
                        : type === "time"
                        ? "WEBER"
                        : type === "shape"
                        ? "IOU"
                        : "MEMORY";

                    return (
                      <button
                        key={type}
                        onClick={() => {
                          SoundFX.click();
                          setSelectedGame(type);
                        }}
                        data-cursor={`${dInfo.label} · ${lang === "tr" ? "Seç" : "Select"}`}
                        className={`flex flex-col justify-between p-4 rounded-3xl border text-left transition-all relative overflow-hidden backdrop-blur-2xl min-h-[145px] sm:min-h-[160px] group
                          ${isLastOnMobile ? "col-span-1 sm:col-span-2 lg:col-span-1" : ""}
                          ${
                            isSelected
                              ? "bg-white/[0.08] border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
                              : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                          }`}
                        style={{
                          boxShadow: isSelected
                            ? `0 0 25px ${cfg.accent}33`
                            : undefined,
                          borderColor: isSelected ? `${cfg.accent}88` : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-2.5">
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                            style={{
                              background: `${cfg.accent}20`,
                              color: cfg.accent,
                              border: `1px solid ${cfg.accent}44`,
                            }}
                          >
                            {cfg.icon}
                          </div>

                          <span
                            className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{
                              background: `${cfg.accent}15`,
                              color: cfg.accent,
                              border: `1px solid ${cfg.accent}33`,
                            }}
                          >
                            {scienceBadge}
                          </span>
                        </div>

                        <div>
                          <div className="font-extrabold text-sm sm:text-base text-white">
                            {dInfo.label}
                          </div>
                          <div className="text-[11px] sm:text-xs text-white/55 leading-snug mt-1">
                            {dInfo.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Rounds Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {/* 1. Difficulty Selector */}
                <div className="flex flex-col gap-2 p-4 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-2xl">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] sm:text-[11px] font-extrabold text-white/40 uppercase tracking-widest">
                      {t.difficultyLevel}
                    </p>
                    <span
                      className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full"
                      style={{
                        background: `${DIFFICULTY_COLORS[selectedDifficulty]}22`,
                        color: DIFFICULTY_COLORS[selectedDifficulty],
                      }}
                    >
                      {t.difficulties[selectedDifficulty].label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["easy", "hard", "brutal"] as DifficultyType[]).map((diff) => {
                      const isSel = selectedDifficulty === diff;
                      return (
                        <button
                          key={diff}
                          onClick={() => {
                            SoundFX.click();
                            setSelectedDifficulty(diff);
                          }}
                          data-cursor={t.difficulties[diff].label}
                          className={`py-2 rounded-2xl text-xs font-bold transition-all border
                            ${
                              isSel
                                ? "bg-white/15 text-white border-white/30 shadow-md"
                                : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                          style={{
                            borderColor: isSel ? DIFFICULTY_COLORS[diff] : undefined,
                            color: isSel ? DIFFICULTY_COLORS[diff] : undefined,
                          }}
                        >
                          {t.difficulties[diff].label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    {t.difficulties[selectedDifficulty].desc}
                  </p>
                </div>

                {/* 2. Round Count Selector (3, 5, 10, or Custom) */}
                <div className="flex flex-col gap-2 p-4 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-2xl">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] sm:text-[11px] font-extrabold text-white/40 uppercase tracking-widest">
                      {t.roundsTitle}
                    </p>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      {isCustomRounds
                        ? `${activeRounds} ${t.roundCounter} (${t.roundCustom})`
                        : `${activeRounds} ${t.roundCounter}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {([3, 5, 10] as const).map((count) => {
                      const isSel = !isCustomRounds && selectedRounds === count;
                      return (
                        <button
                          key={count}
                          onClick={() => {
                            SoundFX.click();
                            setIsCustomRounds(false);
                            setSelectedRounds(count);
                          }}
                          data-cursor={`${count} ${t.roundCounter}`}
                          className={`py-2 rounded-2xl text-xs font-bold transition-all border
                            ${
                              isSel
                                ? "bg-white/15 text-white border-indigo-400/50 shadow-md text-indigo-300"
                                : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                        >
                          {count} {t.roundCounter}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        SoundFX.click();
                        setIsCustomRounds(true);
                      }}
                      data-cursor={t.roundCustom}
                      className={`py-2 rounded-2xl text-xs font-bold transition-all border
                        ${
                          isCustomRounds
                            ? "bg-white/15 text-white border-indigo-400/50 shadow-md text-indigo-300"
                            : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.06]"
                        }`}
                    >
                      {t.roundCustom}
                    </button>
                  </div>

                  {/* Custom Round Input & Stepper */}
                  {isCustomRounds ? (
                    <div className="flex items-center justify-between gap-2 mt-1 px-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            SoundFX.click();
                            const current = activeRounds;
                            const next = Math.max(1, current - 1);
                            setCustomRoundsInput(String(next));
                          }}
                          data-cursor="-1 Tur"
                          className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-white/70 active:scale-95 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={customRoundsInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomRoundsInput(val);
                          }}
                          className="w-14 h-7 text-center font-mono font-bold text-xs bg-white/[0.05] border border-white/15 rounded-xl text-white outline-none focus:border-indigo-400"
                        />
                        <button
                          onClick={() => {
                            SoundFX.click();
                            const current = activeRounds;
                            const next = Math.min(20, current + 1);
                            setCustomRoundsInput(String(next));
                          }}
                          data-cursor="+1 Tur"
                          className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-white/70 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">
                        1 — 20 {t.roundCounter}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {selectedRounds === 3
                        ? t.roundFast
                        : selectedRounds === 10
                        ? t.roundMarathon
                        : t.roundStandard}
                    </p>
                  )}
                </div>

                {/* 3. Inter-Round Prep Delay Selector */}
                <div className="flex flex-col gap-2 p-4 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-2xl col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] sm:text-[11px] font-extrabold text-white/40 uppercase tracking-widest">
                      {t.delayTitle}
                    </p>
                    <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {isCustomDelay
                        ? `${customDelayInput}sn (${t.roundCustom})`
                        : selectedDelay === 0
                        ? t.delayInstant
                        : `${selectedDelay}sn`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[0, 1, 2, 3, 5].map((sec) => {
                      const isSel = !isCustomDelay && selectedDelay === sec;
                      return (
                        <button
                          key={sec}
                          onClick={() => {
                            SoundFX.click();
                            setIsCustomDelay(false);
                            setSelectedDelay(sec);
                          }}
                          data-cursor={sec === 0 ? t.delayInstant : t.delaySec(sec)}
                          className={`py-2 rounded-2xl text-xs font-bold transition-all border
                            ${
                              isSel
                                ? "bg-white/15 text-white border-purple-400/50 shadow-md text-purple-300"
                                : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                        >
                          {sec === 0 ? t.delayInstant : `${sec}sn`}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        SoundFX.click();
                        setIsCustomDelay(true);
                      }}
                      data-cursor={t.roundCustom}
                      className={`py-2 rounded-2xl text-xs font-bold transition-all border
                        ${
                          isCustomDelay
                            ? "bg-white/15 text-white border-purple-400/50 shadow-md text-purple-300"
                            : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.06]"
                        }`}
                    >
                      {t.roundCustom}
                    </button>
                  </div>

                  {/* Custom Delay Stepper Input */}
                  {isCustomDelay && (
                    <div className="flex items-center justify-between gap-2 mt-1 px-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            SoundFX.click();
                            const current = parseInt(customDelayInput, 10) || 3;
                            const next = Math.max(1, current - 1);
                            setCustomDelayInput(String(next));
                          }}
                          data-cursor="-1sn"
                          className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-white/70 active:scale-95 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={customDelayInput}
                          onChange={(e) => setCustomDelayInput(e.target.value)}
                          className="w-14 h-7 text-center font-mono font-bold text-xs bg-white/[0.05] border border-white/15 rounded-xl text-white outline-none focus:border-purple-400"
                        />
                        <button
                          onClick={() => {
                            SoundFX.click();
                            const current = parseInt(customDelayInput, 10) || 3;
                            const next = Math.min(30, current + 1);
                            setCustomDelayInput(String(next));
                          }}
                          data-cursor="+1sn"
                          className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-white/70 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">
                        1 — 30sn
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Per-Round Time Limit Selector (Tur Süre Sınırı) */}
                <div className="flex flex-col gap-2 p-4 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-2xl col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] sm:text-[11px] font-extrabold text-white/40 uppercase tracking-widest">
                      {t.timerTitle}
                    </p>
                    <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {isCustomTimer
                        ? `${customTimerInput}sn (${t.timerCustom})`
                        : selectedRoundTimer === 0
                        ? t.timerUnlimited
                        : `${selectedRoundTimer}sn`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[0, 15, 30, 60, 120].map((sec) => {
                      const isSel = !isCustomTimer && selectedRoundTimer === sec;
                      return (
                        <button
                          key={sec}
                          onClick={() => {
                            SoundFX.click();
                            setIsCustomTimer(false);
                            setSelectedRoundTimer(sec);
                          }}
                          data-cursor={sec === 0 ? t.timerUnlimited : sec >= 60 ? t.timerMin(sec / 60) : t.timerSec(sec)}
                          className={`py-2 rounded-2xl text-xs font-bold transition-all border
                            ${
                              isSel
                                ? "bg-white/15 text-white border-rose-400/50 shadow-md text-rose-300"
                                : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                        >
                          {sec === 0 ? t.timerUnlimited : sec >= 60 ? `${sec / 60}dk` : `${sec}sn`}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        SoundFX.click();
                        setIsCustomTimer(true);
                      }}
                      data-cursor={t.timerCustom}
                      className={`py-2 rounded-2xl text-xs font-bold transition-all border
                        ${
                          isCustomTimer
                            ? "bg-white/15 text-white border-rose-400/50 shadow-md text-rose-300"
                            : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:bg-white/[0.06]"
                        }`}
                    >
                      {t.timerCustom}
                    </button>
                  </div>

                  {/* Custom Timer Stepper Input */}
                  {isCustomTimer && (
                    <div className="flex items-center justify-between gap-2 mt-1 px-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            SoundFX.click();
                            setCustomTimerInput((prevStr) => {
                              const current = parseInt(prevStr, 10) || 30;
                              return String(Math.max(5, current - 5));
                            });
                          }}
                          data-cursor="-5sn"
                          className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-white/70 active:scale-95 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={5}
                          max={600}
                          value={customTimerInput}
                          onChange={(e) => setCustomTimerInput(e.target.value)}
                          className="w-16 h-7 text-center font-mono font-bold text-xs bg-white/[0.05] border border-white/15 rounded-xl text-white outline-none focus:border-rose-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            SoundFX.click();
                            setCustomTimerInput((prevStr) => {
                              const current = parseInt(prevStr, 10) || 30;
                              return String(Math.min(600, current + 5));
                            });
                          }}
                          data-cursor="+5sn"
                          className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-white/70 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">
                        5 — 600 saniye
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Challenge Banner Card (Liquid Glassmorphism) */}
              <button
                onClick={() => startGame(selectedGame, selectedDifficulty, "daily")}
                data-cursor={t.dailyChallenge}
                className="relative flex items-center justify-between p-4.5 rounded-3xl bg-white/[0.04] border border-amber-500/30 hover:bg-white/[0.1] hover:border-amber-400/80 transition-all duration-300 text-left shadow-[0_10px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-3xl group overflow-hidden"
              >
                {/* Specular Highlight Refraction Line */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <Calendar className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <div className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                      <span>{t.dailyChallenge}</span>
                      {dailyPlayed[getTodayUTCString()] && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {lang === "tr" ? "Tamamlandı" : "Completed"}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5 font-mono">
                      {getTodayUTCString()} · {t.dailyRefreshesIn}: {dailyCountdown}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-300/60 group-hover:translate-x-1 group-hover:text-amber-300 transition-all" />
              </button>

              {/* Main Primary Action CTA Button (Centered Liquid Glassmorphism) */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => startGame(selectedGame, selectedDifficulty, "solo", activeRounds)}
                data-cursor={t.startSoloGame(activeRounds)}
                className="relative w-full py-4.5 sm:py-5 rounded-3xl font-black text-sm sm:text-base tracking-wider uppercase transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-white/20 bg-white/[0.08] backdrop-blur-3xl hover:bg-white/15 hover:border-indigo-400/80 hover:shadow-[0_0_35px_rgba(99,102,241,0.4)] text-white overflow-hidden cursor-pointer"
              >
                {/* Specular Highlight Refraction Line */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <span>{t.startSoloGame(activeRounds)}</span>
              </motion.button>
            </motion.div>
          )}

          {/* ─── 2. DAILY CHALLENGE INTRO SCREEN ──────────────────────────────── */}
          {screen === "daily-intro" && session && (
            <motion.div
              key="daily-intro"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center gap-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  {t.dailyChallenge}
                </h2>
                <p className="text-sm text-white/60 mt-1 font-mono">
                  {session.dateSeed} · {currentDiscipline.label} (
                  {t.difficulties[selectedDifficulty].label})
                </p>
                <p className="text-xs text-white/40 mt-3 max-w-sm">
                  {t.dailyChallengeDesc}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={resetToIntro}
                  data-cursor={t.goBack}
                  className="flex-1 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all"
                >
                  {t.goBack}
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={proceedToReveal}
                  data-cursor={t.dailyReadyPrompt}
                  className="flex-2 py-3 rounded-2xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-xl transition-all"
                >
                  {t.dailyReadyPrompt}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── 2.5 INTER-ROUND PREPARATION COUNTDOWN SCREEN ──────────────────── */}
          {screen === "inter-round" && session && (
            <motion.div
              key="inter-round"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center gap-6 max-w-md mx-auto my-auto"
            >
              <div className="w-20 h-20 rounded-full bg-indigo-500/15 border-2 border-indigo-500/40 flex items-center justify-center text-3xl font-black font-mono text-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.35)] animate-pulse">
                {prepSecondsLeft}
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {t.nextRoundIn(prepSecondsLeft)}
                </h3>
                <p className="text-xs text-white/50 mt-1.5 font-mono">
                  {currentDiscipline.label} · {currentRound + 1} / {totalRoundsCount}
                </p>
              </div>

              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={() => {
                    SoundFX.click();
                    setPrepSecondsLeft(0);
                    setScreen("reveal");
                    scrollToTopOrArena();
                  }}
                  data-cursor={t.skipDelay}
                  className="w-full py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-black text-white transition-all shadow-lg active:scale-95 uppercase tracking-wider"
                >
                  {t.skipDelay}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── 3. STIMULUS REVEAL PHASE ────────────────────────────────────── */}
          {screen === "reveal" && session && currentStimulus && (
            <div className="w-full flex flex-col gap-3">
              {/* In-Game Top Bar with Exit */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={resetToIntro}
                  data-cursor={lang === "tr" ? "Menüye Dön" : "Return to Menu"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/15 text-xs font-bold text-white/80 transition-all backdrop-blur-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === "tr" ? "Menü" : "Menu"}</span>
                </button>

                <div className="text-xs font-mono font-bold text-white/60 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  {t.disciplines[session.gameType].label} · {currentRound + 1} / {totalRoundsCount}
                </div>
              </div>

              {session.gameType === "color" && colorStimulus && (
                <ColorDisplay
                  key={`color-reveal-${currentRound}`}
                  h={colorStimulus.h}
                  s={colorStimulus.s}
                  b={colorStimulus.b}
                  revealDurationMs={config.revealDuration[selectedDifficulty]}
                  onHide={handleRevealComplete}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                />
              )}
              {session.gameType === "sound" && soundStimulus && (
                <SoundDisplay
                  key={`sound-reveal-${currentRound}`}
                  freq={soundStimulus.freq}
                  onHide={handleRevealComplete}
                  audioCtx={audioCtx}
                  onInitAudio={initAudio}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                />
              )}
              {session.gameType === "time" && timeStimulus && (
                <TimeDisplay
                  key={`time-reveal-${currentRound}`}
                  targetMs={timeStimulus.targetMs}
                  onHide={handleRevealComplete}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                />
              )}
              {session.gameType === "shape" && shapeStimulus && (
                <ShapeDisplay
                  key={`shape-reveal-${currentRound}`}
                  shape={shapeStimulus}
                  durationMs={config.revealDuration[selectedDifficulty]}
                  onHide={handleRevealComplete}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                />
              )}
              {session.gameType === "sequence" && sequenceStimulus && (
                <SequenceDisplay
                  key={`seq-reveal-${currentRound}`}
                  sequence={sequenceStimulus.seq}
                  onHide={handleRevealComplete}
                  speedMs={selectedDifficulty === "brutal" ? 500 : 700}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
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
              className="w-full flex flex-col gap-3"
            >
              {/* In-Game Top Bar with Exit */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={resetToIntro}
                  data-cursor={lang === "tr" ? "Menüye Dön" : "Return to Menu"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/15 text-xs font-bold text-white/80 transition-all backdrop-blur-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === "tr" ? "Menü" : "Menu"}</span>
                </button>

                <div className="text-xs font-mono font-bold text-white/60 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  {t.disciplines[session.gameType].label} · {currentRound + 1} / {totalRoundsCount}
                </div>
              </div>

              {/* Game Arena Body */}
              {session.gameType === "color" && colorStimulus && (
                <ColorGame
                  targetColor={colorStimulus}
                  onSubmit={handleRoundSubmit as (r: ColorScoreResult) => void}
                  difficulty={selectedDifficulty}
                  colorBlindMode={colorBlindMode}
                  onColorBlindToggle={setColorBlindMode}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                  roundTimerSeconds={activeRoundTimer}
                />
              )}
              {session.gameType === "sound" && soundStimulus && (
                <SoundGame
                  targetFreq={soundStimulus.freq}
                  onSubmit={handleRoundSubmit as (r: SoundScoreResult) => void}
                  audioCtx={audioCtx}
                  onInitAudio={initAudio}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                  roundTimerSeconds={activeRoundTimer}
                />
              )}
              {session.gameType === "time" && timeStimulus && (
                <TimeGame
                  targetMs={timeStimulus.targetMs}
                  onSubmit={handleRoundSubmit as (r: TimeScoreResult) => void}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                  roundTimerSeconds={activeRoundTimer}
                />
              )}
              {session.gameType === "shape" && shapeStimulus && (
                <ShapeGame
                  target={shapeStimulus}
                  onSubmit={handleRoundSubmit as (r: ShapeScoreResult) => void}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                  roundTimerSeconds={activeRoundTimer}
                />
              )}
              {session.gameType === "sequence" && sequenceStimulus && (
                <SequenceGame
                  targetSequence={sequenceStimulus.seq}
                  onSubmit={handleRoundSubmit as (r: SequenceScoreResult) => void}
                  roundNumber={currentRound + 1}
                  totalRounds={totalRoundsCount}
                  roundTimerSeconds={activeRoundTimer}
                />
              )}
            </motion.div>
          )}

          {/* ─── 5. FINAL TOTAL RESULTS SCREEN (Comprehensive Breakdown) ───────── */}
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
                  data-cursor={t.totalResult.menuReturn}
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
                    <div className="text-xs text-white/50 mb-3 max-w-xs">
                      {tier.message}
                    </div>
                  </>
                )}

                <div
                  className="text-7xl sm:text-8xl font-black font-mono tracking-tight my-1"
                  style={{ color: accentColor }}
                >
                  {sharePayload.totalScore.toFixed(1)}
                </div>
                <div className="text-white/30 text-sm font-mono">
                  {t.totalResult.outOfFifty}
                </div>
              </div>

              {/* All Individual Rounds Review Cards */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-white/50 px-1">
                  {lang === "tr" ? "Tur Detayları & İnceleme" : "Round Details & Review"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roundResults.map((r, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-white/60">
                          {t.roundCounter} {i + 1}
                        </span>
                        <span className="font-mono font-black text-indigo-300">
                          {extractScore(r.result).toFixed(1)} / 10.0
                        </span>
                      </div>
                      <RoundResultDetails
                        result={r.result}
                        gameType={session?.gameType ?? "color"}
                        accentColor={accentColor}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Nickname & Submit Row */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.slice(0, 20));
                      setUsernameError("");
                    }}
                    placeholder={t.totalResult.nicknamePlaceholder}
                    className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 text-sm font-bold text-white placeholder:text-white/30 outline-none focus:outline-none focus:ring-0 focus:border-white/30 focus-visible:outline-none focus-visible:ring-0 shadow-none transition-all font-mono"
                    maxLength={20}
                  />
                  <button
                    onClick={handleScoreSubmit}
                    disabled={isSubmitting}
                    data-cursor={t.totalResult.submitScore}
                    className="px-6 py-3 rounded-2xl bg-white text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-100 disabled:opacity-50 transition-all shadow-xl active:scale-95 shrink-0"
                  >
                    {isSubmitting ? "..." : t.totalResult.submitScore}
                  </button>
                </div>
                {usernameError && (
                  <p className="text-xs text-rose-400 px-1">{usernameError}</p>
                )}
              </div>

              {/* Share & Actions Row */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={handleCopyShare}
                    data-cursor={t.totalResult.scoreLink}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.totalResult.scoreLink}</span>
                  </button>
                  <button
                    onClick={handleCopyChallenge}
                    data-cursor={t.totalResult.challengeFriend}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    <Swords className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.totalResult.challengeFriend}</span>
                  </button>
                  <button
                    onClick={handleDownloadPng}
                    data-cursor={t.totalResult.downloadPng}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.totalResult.downloadPng}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={buildTwitterShareUrl(sharePayload)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="Twitter (X)"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all"
                  >
                    <span>Twitter (X)</span>
                  </a>
                  <a
                    href={buildWhatsAppShareUrl(sharePayload)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="WhatsApp"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={handleNativeShare}
                    data-cursor={t.totalResult.nativeShare}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all"
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
        className="rounded-2xl border p-3 flex flex-col gap-2.5 shadow-md"
        style={{ borderColor: `${accentColor}33`, background: `${accentColor}0a` }}
      >
        {/* Side by side color boxes */}
        <div className="flex items-center gap-2.5 justify-center">
          <div className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-12 rounded-xl shadow-md border border-white/20"
              style={{ background: r.targetHex }}
            />
            <span className="text-[10px] font-bold text-white/60">
              {t.roundResult.targetColor}
            </span>
            <span className="text-[11px] font-mono text-white/90">{r.targetHex.toUpperCase()}</span>
          </div>

          <div className="text-white/30 text-[10px] font-bold font-mono">VS</div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-12 rounded-xl shadow-md border border-white/20"
              style={{ background: r.guessHex }}
            />
            <span className="text-[10px] font-bold text-white/60">
              {t.roundResult.yourGuess}
            </span>
            <span className="text-[11px] font-mono text-white/90">{r.guessHex.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/10">
          <span className="text-white/40">{t.roundResult.deltaE}</span>
          <span className="font-mono font-bold text-indigo-300">ΔE {r.deltaE.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
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
      className="rounded-2xl border p-3 flex flex-col gap-1.5 shadow-md"
      style={{ borderColor: `${accentColor}33`, background: `${accentColor}0a` }}
    >
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between text-[11px]">
          <span className="text-white/40">{label}</span>
          <span className="font-mono font-semibold text-white/90">{value}</span>
        </div>
      ))}
    </div>
  );
}
