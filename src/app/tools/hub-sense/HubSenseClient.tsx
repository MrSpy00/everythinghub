"use client";

/**
 * HubSense — Cognitive Sensory Memory Game Arena
 * Orchestrates Color, Sound, Time, Shape, and Harmonic Sequence perception games.
 * 100% Client-Side, Zero-Auth Serverless Leaderboard, Offline LocalStorage,
 * Cryptographic Anti-Cheat, and High-Res Score Card Generator.
 */

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

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
  RefreshCw,
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
    label: string;
    icon: React.ReactNode;
    description: string;
    accent: string;
    revealDuration: Record<DifficultyType, number>;
  }
> = {
  color: {
    label: "Renk",
    icon: <Palette className="w-5 h-5" />,
    description: "5 rengi incele, bellekten yeniden oluştur. CIELAB Delta-E standardı.",
    accent: "#6366f1",
    revealDuration: { easy: 3000, hard: 2000, brutal: 1200 },
  },
  sound: {
    label: "Ses",
    icon: <Volume2 className="w-5 h-5" />,
    description: "5 frekansı dinle, perdeyi bellekten yeniden yakala. ERB psikokustik modeli.",
    accent: "#8b5cf6",
    revealDuration: { easy: 1800, hard: 1500, brutal: 1200 },
  },
  time: {
    label: "Zaman",
    icon: <Clock className="w-5 h-5" />,
    description: "5 süreyi gözlemle, butonu basılı tutarak tam sürede bırak. Weber-Fechner yasası.",
    accent: "#10b981",
    revealDuration: { easy: 0, hard: 0, brutal: 0 },
  },
  shape: {
    label: "Şekil",
    icon: <Shapes className="w-5 h-5" />,
    description: "5 şekli gör, boyut/rotasyon/pozisyonu yeniden kurgula. IoU çakışma puanlama.",
    accent: "#f59e0b",
    revealDuration: { easy: 3000, hard: 2000, brutal: 1200 },
  },
  sequence: {
    label: "Dizi",
    icon: <Zap className="w-5 h-5" />,
    description: "Artan harmonik ses-ışık zincirini eksiksiz tekrarla. Dual working memory.",
    accent: "#ec4899",
    revealDuration: { easy: 2000, hard: 1500, brutal: 1000 },
  },
};

const DIFFICULTY_CONFIG: Record<
  DifficultyType,
  { label: string; description: string; color: string }
> = {
  easy: {
    label: "Kolay",
    description: "Daha uzun görme süresi, toleranslı kontrol",
    color: "#10b981",
  },
  hard: {
    label: "Zor",
    description: "Kısa odaklanma süresi, hassas eşikler",
    color: "#f59e0b",
  },
  brutal: {
    label: "Vahşi",
    description: "Anlık refleks, sıfır tolerans, maksimum hassasiyet",
    color: "#ef4444",
  },
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
        toast.info("Meydan okuma oturumu yüklendi!");
        setSelectedGame(parsed.gameType);
        setSelectedDifficulty(parsed.difficulty);
      }
    }
  }, [searchParams]);

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
      setUsernameError(validation.error ?? "Geçersiz kullanıcı adı");
      triggerHaptic(50);
      return;
    }
    setUsernameError("");

    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      toast.error(rateCheck.reason ?? "Çok hızlı gönderim");
      return;
    }

    const scores = sharePayload.roundScores;
    if (!validateScoreBounds(scores)) {
      toast.error("Geçersiz tur skorları");
      return;
    }

    if (isReplay(session.gameType, session.seed, username)) {
      toast.error("Bu oyun skorunu zaten kaydettin!");
      return;
    }

    setIsSubmitting(true);
    SoundFX.click();

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("hubsense_username", username.toUpperCase().trim());
      }

      const payload = await buildScorePayload(
        username,
        scores,
        session.gameType,
        selectedDifficulty,
        selectedMode,
        session.seed,
        session.dateSeed
      );

      const { success, tier, rank } = await submitScore(payload);

      if (success) {
        recordSubmission();
        recordSeed(session.gameType, session.seed, username);

        if (selectedMode === "daily") {
          const updated = {
            ...dailyPlayed,
            [`${session.gameType}_${session.dateSeed}`]: true,
          };
          setDailyPlayed(updated);
          if (typeof window !== "undefined") {
            localStorage.setItem("hubsense_daily_played", JSON.stringify(updated));
          }
        }

        toast.success(
          rank
            ? `Skor kaydedildi! Sıralama: #${rank}`
            : tier === "global"
            ? "Skor liderlik tablosuna eklendi!"
            : "Skor yerel olarak kaydedildi."
        );
      }
    } catch {
      toast.error("Skor gönderilirken bir sorun oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }, [sharePayload, session, username, selectedDifficulty, selectedMode, dailyPlayed]);

  const handleCopyShare = useCallback(async () => {
    if (!sharePayload) return;
    SoundFX.click();
    const url = buildShareUrl({ ...sharePayload, username: username || "ANONIM" });
    await navigator.clipboard.writeText(url);
    toast.success("Paylaşım linki panoya kopyalandı!");
  }, [sharePayload, username]);

  const handleCopyChallenge = useCallback(async () => {
    if (!session) return;
    SoundFX.click();
    const url = buildChallengeUrl(session.gameType, selectedDifficulty, session.seed);
    await navigator.clipboard.writeText(url);
    toast.success("Aynı oyun meydan okuma linki kopyalandı!");
  }, [session, selectedDifficulty]);

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
    toast.info("Skor kartı görseli oluşturuluyor...");
    await downloadScoreCardImage({ ...sharePayload, username: username || "ANONIM" });
    toast.success("Skor kartı PNG olarak indirildi!");
  }, [sharePayload, username]);

  const resetToIntro = useCallback(() => {
    SoundFX.click();
    setScreen("intro");
    setRoundResults([]);
    setCurrentRound(0);
    setSession(null);
    setSharePayload(null);
  }, []);

  // Stimulus types casting
  const colorStimulus = currentStimulus as { h: number; s: number; b: number } | null;
  const soundStimulus = currentStimulus as { freq: number } | null;
  const timeStimulus = currentStimulus as { targetMs: number } | null;
  const shapeStimulus = currentStimulus as ReturnType<typeof generateShape> | null;
  const sequenceStimulus = currentStimulus as { seq: number[] } | null;

  const tier = sharePayload ? getScoreTier(sharePayload.totalScore) : null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden flex flex-col font-sans select-none">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${accentColor}33 0%, transparent 70%)`,
        }}
      />

      {/* Main Screen Router */}
      <AnimatePresence mode="wait">
        {screen === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="min-h-screen flex flex-col max-w-xl mx-auto w-full"
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-5 pt-8 pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Hub<span style={{ color: accentColor }}>Sense</span>
                </h1>
                <p className="text-xs text-white/40 mt-0.5">
                  Bilişsel duyu hafızası test arenası
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSound}
                  aria-label="Ses Aç/Kapat"
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors text-white/70"
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
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors text-xs font-semibold text-white/80"
                >
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Duyu Profili</span>
                </button>

                <button
                  onClick={() => {
                    SoundFX.click();
                    setShowLeaderboard(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 transition-colors text-xs font-semibold text-white/80"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Skorlar</span>
                </button>
              </div>
            </div>

            {/* Game Selector Grid */}
            <div className="px-5 pb-2">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">
                Duyu Disiplini Seç
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(
                  Object.entries(GAME_CONFIGS) as [
                    GameType,
                    (typeof GAME_CONFIGS)[GameType]
                  ][]
                ).map(([type, cfg]) => (
                  <button
                    key={type}
                    onClick={() => {
                      SoundFX.click();
                      setSelectedGame(type);
                    }}
                    className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all relative overflow-hidden
                      ${
                        selectedGame === type
                          ? "bg-white/[0.08] border-white/20 shadow-lg"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                      }`}
                    style={{
                      boxShadow:
                        selectedGame === type ? `0 0 24px ${cfg.accent}25` : undefined,
                      borderColor: selectedGame === type ? `${cfg.accent}66` : undefined,
                    }}
                  >
                    <div style={{ color: cfg.accent }}>{cfg.icon}</div>
                    <div>
                      <div className="font-bold text-sm text-white">{cfg.label}</div>
                      <div className="text-[10px] text-white/40 leading-tight mt-0.5 line-clamp-2">
                        {cfg.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="px-5 py-3">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2.5">
                Zorluk Derecesi
              </p>
              <div className="flex gap-2">
                {(
                  Object.entries(DIFFICULTY_CONFIG) as [
                    DifficultyType,
                    (typeof DIFFICULTY_CONFIG)[DifficultyType]
                  ][]
                ).map(([diff, dcfg]) => (
                  <button
                    key={diff}
                    onClick={() => {
                      SoundFX.click();
                      setSelectedDifficulty(diff);
                    }}
                    className={`flex-1 py-3 rounded-2xl font-bold text-xs border transition-all
                      ${
                        selectedDifficulty === diff
                          ? "bg-white/[0.08] text-white border-white/20"
                          : "border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                      }`}
                    style={{
                      borderColor:
                        selectedDifficulty === diff ? `${dcfg.color}55` : undefined,
                      color: selectedDifficulty === diff ? dcfg.color : undefined,
                    }}
                  >
                    {dcfg.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-white/40 mt-2 px-1">
                {DIFFICULTY_CONFIG[selectedDifficulty].description}
              </p>
            </div>

            {/* Bottom Play Action Buttons */}
            <div className="px-5 pb-8 mt-auto flex flex-col gap-3">
              {/* Daily Challenge Button */}
              <button
                onClick={() => startGame(selectedGame, selectedDifficulty, "daily")}
                className="flex items-center justify-between px-5 py-4 rounded-2xl border
                  bg-white/[0.03] border-white/10 hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <div className="text-left">
                    <div className="font-bold text-sm text-white">
                      Günlük Meydan Okuma
                    </div>
                    <div className="text-xs text-white/30">
                      {getTodayUTCString()} · Yenileniyor: {dailyCountdown}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
              </button>

              {/* Solo Play Main Action */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame(selectedGame, selectedDifficulty, "solo")}
                className="w-full py-4 rounded-2xl font-bold text-base tracking-wide
                  text-white border transition-all shadow-xl"
                style={{
                  background: `${accentColor}1c`,
                  borderColor: `${accentColor}55`,
                  boxShadow: `0 0 35px ${accentColor}25`,
                }}
              >
                Oyuna Başla
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Daily Challenge Intro */}
        {screen === "daily-intro" && (
          <motion.div
            key="daily-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8 max-w-md mx-auto w-full"
          >
            <div>
              <div className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-2">
                Günlük Küresel Mücadele
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white mb-4">
                {config.label}
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Dünya genelinde herkes bugün aynı {ROUNDS_COUNT} uyaran dizisini çözüyor.
                Tek bir resmi deneme hakkın var!
              </p>
            </div>

            <div className="text-xs text-white/40 font-mono">
              {getTodayUTCString()} · Kalan Süre: {dailyCountdown}
            </div>

            <div className="flex flex-col gap-3 w-full">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={proceedToReveal}
                className="w-full py-4 rounded-2xl font-bold text-base text-white border"
                style={{
                  background: `${accentColor}22`,
                  borderColor: `${accentColor}55`,
                  boxShadow: `0 0 30px ${accentColor}33`,
                }}
              >
                Hazırım, Başla
              </motion.button>

              <button
                onClick={resetToIntro}
                className="text-white/40 text-sm hover:text-white/70 transition-colors py-2"
              >
                Geri Dön
              </button>
            </div>
          </motion.div>
        )}

        {/* Reveal / Stimulus Phase */}
        {screen === "reveal" && session && currentStimulus && (
          <div key="reveal">
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
              <span className="text-white/40 text-xs font-mono">Tur</span>
              <span className="text-white text-xs font-bold font-mono">
                {currentRound + 1} / {ROUNDS_COUNT}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {session.gameType === "color" && colorStimulus && (
                <ColorDisplay
                  key={`color-reveal-${currentRound}`}
                  h={colorStimulus.h}
                  s={colorStimulus.s}
                  b={colorStimulus.b}
                  revealDurationMs={config.revealDuration[selectedDifficulty]}
                  onHide={handleRevealComplete}
                  colorBlindMode={colorBlindMode}
                />
              )}
              {session.gameType === "sound" && soundStimulus && (
                <SoundDisplay
                  key={`sound-reveal-${currentRound}`}
                  freq={soundStimulus.freq}
                  onHide={handleRevealComplete}
                  audioCtx={audioCtx}
                  onInitAudio={initAudio}
                />
              )}
              {session.gameType === "time" && timeStimulus && (
                <TimeDisplay
                  key={`time-reveal-${currentRound}`}
                  targetMs={timeStimulus.targetMs}
                  onHide={handleRevealComplete}
                />
              )}
              {session.gameType === "shape" && shapeStimulus && (
                <ShapeDisplay
                  key={`shape-reveal-${currentRound}`}
                  shape={shapeStimulus}
                  durationMs={config.revealDuration[selectedDifficulty]}
                  onHide={handleRevealComplete}
                />
              )}
              {session.gameType === "sequence" && sequenceStimulus && (
                <SequenceDisplay
                  key={`seq-reveal-${currentRound}`}
                  sequence={sequenceStimulus.seq}
                  onHide={handleRevealComplete}
                  speedMs={selectedDifficulty === "brutal" ? 500 : 700}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Guess / Interactive Reconstruction Phase */}
        {screen === "guess" && session && currentStimulus && (
          <motion.div
            key={`guess-${currentRound}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="min-h-screen flex flex-col max-w-xl mx-auto w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-8 pb-3">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest font-mono">
                  {config.label} · {currentRound + 1}/{ROUNDS_COUNT}
                </div>
                <div className="text-sm font-semibold text-white/70 mt-0.5">
                  Bellekten yeniden oluştur
                </div>
              </div>
              <button
                onClick={resetToIntro}
                aria-label="Çıkış"
                className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Round Step Indicators */}
            <div className="flex items-center justify-center gap-2 my-3">
              {Array.from({ length: ROUNDS_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === currentRound ? 24 : 8,
                    height: 8,
                    background:
                      i < currentRound
                        ? accentColor
                        : i === currentRound
                        ? accentColor
                        : "rgba(255,255,255,0.1)",
                    opacity: i === currentRound ? 1 : i < currentRound ? 0.7 : 0.25,
                  }}
                />
              ))}
            </div>

            {/* Active Game Interface */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {session.gameType === "color" && colorStimulus && (
                <ColorGame
                  targetColor={colorStimulus}
                  onSubmit={handleRoundSubmit as (r: ColorScoreResult) => void}
                  difficulty={selectedDifficulty}
                  colorBlindMode={colorBlindMode}
                  onColorBlindToggle={setColorBlindMode}
                />
              )}
              {session.gameType === "sound" && soundStimulus && (
                <SoundGame
                  targetFreq={soundStimulus.freq}
                  onSubmit={handleRoundSubmit as (r: SoundScoreResult) => void}
                  audioCtx={audioCtx}
                  onInitAudio={initAudio}
                />
              )}
              {session.gameType === "time" && timeStimulus && (
                <TimeGame
                  targetMs={timeStimulus.targetMs}
                  onSubmit={handleRoundSubmit as (r: TimeScoreResult) => void}
                />
              )}
              {session.gameType === "shape" && shapeStimulus && (
                <ShapeGame
                  target={shapeStimulus}
                  onSubmit={handleRoundSubmit as (r: ShapeScoreResult) => void}
                />
              )}
              {session.gameType === "sequence" && sequenceStimulus && (
                <SequenceGame
                  targetSequence={sequenceStimulus.seq}
                  onSubmit={handleRoundSubmit as (r: SequenceScoreResult) => void}
                  difficulty={selectedDifficulty}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Round Result Reveal Screen */}
        {screen === "round-result" && roundResults.length > 0 && (
          <motion.div
            key={`round-result-${currentRound}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 max-w-md mx-auto w-full"
          >
            <div className="text-center">
              <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-2">
                Tur {currentRound + 1} Puanı
              </div>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
                className="text-7xl sm:text-8xl font-black tabular-nums tracking-tight"
                style={{ color: accentColor }}
              >
                {extractScore(roundResults[roundResults.length - 1].result).toFixed(1)}
              </motion.div>
              <div className="text-white/30 text-base mt-1">/ 10.0</div>
            </div>

            <div className="w-full">
              <RoundResultDetails
                result={roundResults[roundResults.length - 1].result}
                gameType={session?.gameType ?? "color"}
                accentColor={accentColor}
              />
            </div>

            <div className="text-center text-xs text-white/40 font-mono">
              Kümülatif Skor: {totalScore.toFixed(1)} / {(currentRound + 1) * 10}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNextRound}
              className="w-full py-4 rounded-2xl font-bold text-base text-white border transition-all"
              style={{
                background: `${accentColor}22`,
                borderColor: `${accentColor}55`,
                boxShadow: `0 0 30px ${accentColor}25`,
              }}
            >
              {currentRound + 1 < ROUNDS_COUNT ? "Sonraki Tura Geç" : "Final Sonuçları Gör"}
            </motion.button>
          </motion.div>
        )}

        {/* Final Total Results Screen */}
        {screen === "total-result" && sharePayload && (
          <motion.div
            key="total-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col overflow-y-auto max-w-xl mx-auto w-full pb-12"
          >
            {/* Top Close */}
            <div className="flex justify-end px-5 pt-8">
              <button
                onClick={resetToIntro}
                aria-label="Menüye Dön"
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Score Showcase */}
            <div className="flex flex-col items-center justify-center pt-4 pb-6 px-6 text-center">
              {newRecord && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-3 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider"
                  style={{
                    background: `${accentColor}22`,
                    color: accentColor,
                    border: `1px solid ${accentColor}55`,
                  }}
                >
                  Yeni Kişisel Rekor!
                </motion.div>
              )}

              {tier && (
                <>
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: tier.color }}
                  >
                    {tier.label}
                  </div>
                  <motion.div
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 180 }}
                    className="text-8xl sm:text-9xl font-black tabular-nums tracking-tighter"
                    style={{ color: tier.color }}
                  >
                    {sharePayload.totalScore.toFixed(1)}
                  </motion.div>
                  <div className="text-white/30 text-xl mt-0.5">/ 50.0</div>
                  <p className="text-white/60 text-xs sm:text-sm mt-3 max-w-sm">
                    {tier.message}
                  </p>
                </>
              )}
            </div>

            {/* Round by Round Bars */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-5 gap-2">
                {sharePayload.roundScores.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-2xl flex items-end justify-center overflow-hidden"
                      style={{ height: 70, background: "rgba(255,255,255,0.03)" }}
                    >
                      <motion.div
                        className="w-full rounded-xl"
                        style={{
                          background: accentColor,
                          opacity: 0.75 + (s / 10) * 0.25,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(s / 10) * 62 + 4}px` }}
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
            </div>

            {/* Username & Leaderboard Submission */}
            <div className="px-6 pb-6">
              <div className="flex flex-col gap-2 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.08]">
                <label className="text-xs font-semibold text-white/60">
                  Liderlik Tablosuna İsim Yaz
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="RUMUZ (3-20 KARAKTER)"
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
                    {isSubmitting ? "Kaydediliyor..." : "Skoru Gönder"}
                  </motion.button>
                </div>
                {usernameError && (
                  <p className="text-xs text-rose-400 mt-1">{usernameError}</p>
                )}
              </div>
            </div>

            {/* Social Share Grid */}
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              <p className="text-[11px] font-bold text-white/30 text-center uppercase tracking-widest">
                Skorunu Paylaş & Meydan Oku
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={handleCopyShare}
                  className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                    bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Skor Linki</span>
                </button>

                <button
                  onClick={handleCopyChallenge}
                  className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                    bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                >
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  <span>Meydan Oku</span>
                </button>

                <button
                  onClick={handleDownloadPng}
                  className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                    bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PNG İndir</span>
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
                  <span>X / Tweet</span>
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
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl
                    bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-xs text-white/80"
                >
                  <Zap className="w-3.5 h-3.5 text-pink-400" />
                  <span>Paylaş</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-6 flex gap-3">
              <button
                onClick={() =>
                  startGame(selectedGame, selectedDifficulty, selectedMode)
                }
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                  bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-sm font-semibold text-white/80"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tekrar Oyna</span>
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                  bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-sm font-semibold text-white/80"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Skor Tablosu</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white/40 font-mono text-sm">
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
  const rows: { label: string; value: string }[] = [];

  if (gameType === "color") {
    const r = result as ColorScoreResult;
    rows.push(
      { label: "CIELAB Delta-E", value: r.deltaE.toFixed(2) },
      { label: "Hedef Renk", value: r.targetHex.toUpperCase() },
      { label: "Tahminin", value: r.guessHex.toUpperCase() },
      { label: "Algı Doğruluğu", value: `${r.percentAccuracy}%` }
    );
  } else if (gameType === "sound") {
    const r = result as SoundScoreResult;
    rows.push(
      { label: "Perde Sapması", value: `${r.centDiff.toFixed(0)} sent` },
      { label: "Hedef Frekans", value: `${Math.round(r.targetFreq)}Hz (${r.targetNote})` },
      { label: "Tahmin Frekans", value: `${Math.round(r.guessFreq)}Hz (${r.guessNote})` },
      { label: "Algı Doğruluğu", value: `${r.percentAccuracy}%` }
    );
  } else if (gameType === "time") {
    const r = result as TimeScoreResult;
    rows.push(
      { label: "Hedef Süre", value: `${r.targetMs}ms` },
      { label: "Tahmin Süre", value: `${r.guessMs}ms` },
      {
        label: "Hata Payı",
        value: `${r.absoluteErrorMs}ms (${(r.relativeError * 100).toFixed(1)}%)`,
      },
      {
        label: "Zamanlama",
        value:
          r.earlyOrLate === "perfect"
            ? "Kusursuz!"
            : r.earlyOrLate === "early"
            ? "Erken Bıraktın"
            : "Geç Bıraktın",
      }
    );
  } else if (gameType === "shape") {
    const r = result as ShapeScoreResult;
    rows.push(
      { label: "IoU Çakışma", value: `${(r.iou * 100).toFixed(1)}%` },
      { label: "Döndürme Sapması", value: `${r.rotationError.toFixed(1)}°` },
      { label: "Ölçek Sapması", value: `${(r.scaleError * 100).toFixed(1)}%` },
      { label: "Pozisyon Sapması", value: `${(r.positionError * 100).toFixed(1)}%` }
    );
  } else if (gameType === "sequence") {
    const r = result as SequenceScoreResult;
    rows.push(
      { label: "Doğru Sıralı Adım", value: `${r.matchedCount} / ${r.totalSteps}` },
      { label: "Zincir Doğruluğu", value: `${r.percentAccuracy}%` },
      {
        label: "Bellek Durumu",
        value: r.isPerfect ? "Kusursuz Zincir" : "Kısmi Eşleşme",
      }
    );
  }

  return (
    <div
      className="rounded-3xl border p-5 flex flex-col gap-2.5"
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
