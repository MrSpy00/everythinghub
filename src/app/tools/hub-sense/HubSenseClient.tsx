"use client";

/**
 * HubSense — Main Game Orchestrator
 * Manages game state, screen transitions, scoring, and submissions.
 */

import React, { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

// Game engines
import { hsbToHex } from "./games/colorScoring";
import { generateFrequency } from "./games/soundScoring";
import { generateTargetTime } from "./games/timeScoring";
import { generateShape } from "./games/shapeScoring";
import {
  createGameSession,
  getDailySeed,
  getTodayUTCString,
  getMsUntilNextUTCMidnight,
  formatCountdown,
  ROUNDS_COUNT,
  MAX_TOTAL_SCORE,
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
  type ScorePayload,
} from "./games/antiCheat";
import { submitScore, getScoreTier } from "./games/leaderboard";
import {
  buildShareUrl,
  buildChallengeUrl,
  buildOgImageUrl,
  encodeSharePayload,
  decodeSharePayload,
  nativeShare,
  buildTwitterShareUrl,
  type SharePayload,
} from "./games/shareEncoder";

// Components
import { ColorGame, ColorDisplay } from "./components/ColorGame";
import { SoundGame, SoundDisplay } from "./components/SoundGame";
import { TimeGame, TimeDisplay } from "./components/TimeGame";
import { ShapeGame, ShapeDisplay } from "./components/ShapeGame";
import { Leaderboard } from "./components/Leaderboard";

import {
  Palette, Volume2, Clock, Shapes, Trophy, Calendar,
  ChevronRight, X, Copy, Share2, ArrowRight,
  RefreshCw, Info, Settings, Eye, Zap, Target
} from "lucide-react";
import type { ColorBlindType } from "./games/colorScoring";
import type { ColorScoreResult } from "./games/colorScoring";
import type { SoundScoreResult } from "./games/soundScoring";
import type { TimeScoreResult } from "./games/timeScoring";
import type { ShapeScoreResult } from "./games/shapeScoring";

// ─── Types ────────────────────────────────────────────────────────────────────
type GameScreen =
  | "intro"
  | "reveal"
  | "guess"
  | "round-result"
  | "total-result"
  | "leaderboard"
  | "daily-intro"
  | "settings";

type AnyRoundResult = ColorScoreResult | SoundScoreResult | TimeScoreResult | ShapeScoreResult;

interface RoundData {
  roundIndex: number;
  result: AnyRoundResult;
}

const GAME_CONFIGS: Record<GameType, {
  label: string;
  icon: React.ReactNode;
  description: string;
  accent: string;
  revealDuration: Record<DifficultyType, number>;
}> = {
  color: {
    label: "Renk",
    icon: <Palette className="w-5 h-5" />,
    description: "5 rengi gör, bellekten yeniden oluştur. CIELAB Delta-E puanlama.",
    accent: "#6366f1",
    revealDuration: { easy: 3000, hard: 2000, brutal: 1200 },
  },
  sound: {
    label: "Ses",
    icon: <Volume2 className="w-5 h-5" />,
    description: "5 farklı frekansı dinle, sesi bellekten yeniden oluştur. ERB psikokustik puanlama.",
    accent: "#8b5cf6",
    revealDuration: { easy: 1800, hard: 1500, brutal: 1200 },
  },
  time: {
    label: "Zaman",
    icon: <Clock className="w-5 h-5" />,
    description: "5 farklı süreyi izle, butonu basılı tutarak aynı süreyi yeniden oluştur.",
    accent: "#10b981",
    revealDuration: { easy: 0, hard: 0, brutal: 0 }, // dynamic
  },
  shape: {
    label: "Şekil",
    icon: <Shapes className="w-5 h-5" />,
    description: "5 farklı şekli gör, boyut/döndürme/konum ile yeniden oluştur. IoU puanlama.",
    accent: "#f59e0b",
    revealDuration: { easy: 3000, hard: 2000, brutal: 1200 },
  },
  sequence: {
    label: "Dizi",
    icon: <Zap className="w-5 h-5" />,
    description: "Artan zincir hafıza oyunu.",
    accent: "#ec4899",
    revealDuration: { easy: 2000, hard: 1500, brutal: 1000 },
  },
};

const DIFFICULTY_CONFIG: Record<DifficultyType, { label: string; description: string; color: string }> = {
  easy: { label: "Kolay", description: "Daha uzun görme süresi, daha geniş kontrol aralığı", color: "#10b981" },
  hard: { label: "Zor", description: "Daha kısa süre, tam hassasiyet", color: "#f59e0b" },
  brutal: { label: "Vahşi", description: "Anlık görme, maksimum hassasiyet", color: "#ef4444" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateRoundStimulus(
  gameType: GameType,
  seed: number,
  roundIndex: number,
  difficulty: DifficultyType
): object {
  const rng = (o: number) =>
    (Math.sin(seed * 9301.5 + roundIndex * 49297.3 + o) * 0.5 + 0.5);

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
      return { seq: Array.from({ length: roundIndex + 3 }, (_, i) => Math.floor(rng(i + 10) * 4)) };
    default:
      return {};
  }
}

function extractScore(result: AnyRoundResult): number {
  return (result as { score: number }).score;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function HubSenseClient() {
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
  const [dailyCountdown, setDailyCountdown] = useState("");
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState<Record<string, boolean>>({});
  const [newRecord, setNewRecord] = useState(false);

  // Daily countdown
  useEffect(() => {
    const tick = () => setDailyCountdown(formatCountdown(getMsUntilNextUTCMidnight()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check daily played status
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("hubsense_daily_played");
    if (raw) {
      try { setDailyPlayed(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const initAudio = useCallback(async () => {
    if (audioCtx && audioCtx.state !== "closed") {
      if (audioCtx.state === "suspended") await audioCtx.resume();
      return audioCtx;
    }
    const ctx = new AudioContext();
    setAudioCtx(ctx);
    return ctx;
  }, [audioCtx]);

  // Total score
  const totalScore = roundResults.reduce((sum, r) => sum + extractScore(r.result), 0);
  const config = GAME_CONFIGS[selectedGame];
  const accentColor = config.accent;

  // ─── Game Flow ─────────────────────────────────────────────────────────────
  const startGame = useCallback((
    gameType: GameType,
    difficulty: DifficultyType,
    mode: ModeType
  ) => {
    const newSession = createGameSession(gameType, difficulty, mode);
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
  }, []);

  const proceedToReveal = useCallback(() => {
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

      // Preload next stimulus
      if (session && currentRound + 1 < ROUNDS_COUNT) {
        const nextStimulus = generateRoundStimulus(
          session.gameType, session.seed, currentRound + 1, selectedDifficulty
        );
        setTimeout(() => setCurrentStimulus(nextStimulus), 500);
      }
    },
    [currentRound, roundResults, session, selectedDifficulty]
  );

  const handleNextRound = useCallback(() => {
    if (!session) return;
    const nextRound = currentRound + 1;

    if (nextRound >= ROUNDS_COUNT) {
      // Game over
      const allScores = [...roundResults.map((r) => extractScore(r.result))];
      const total = allScores.reduce((a, b) => a + b, 0);

      const { isNewRecord } = updatePersonalBest(
        session.gameType,
        selectedDifficulty,
        allScores
      );
      setNewRecord(isNewRecord);

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
        session.gameType, session.seed, nextRound, selectedDifficulty
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
      toast.error("Geçersiz skor");
      return;
    }

    if (isReplay(session.gameType, session.seed, username)) {
      toast.error("Bu oyunu zaten göndermiştin!");
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

      const { success, tier } = await submitScore(payload);

      if (success) {
        recordSubmission();
        recordSeed(session.gameType, session.seed, username);

        if (selectedMode === "daily") {
          const updated = { ...dailyPlayed, [`${session.gameType}_${session.dateSeed}`]: true };
          setDailyPlayed(updated);
          if (typeof window !== "undefined") {
            localStorage.setItem("hubsense_daily_played", JSON.stringify(updated));
          }
        }

        toast.success(
          tier === "local"
            ? "Skor kaydedildi (yerel)"
            : `Skor gönderildi! (${tier === "jsonbin" ? "Global" : "GitHub"})`
        );
      }
    } catch {
      toast.error("Gönderim başarısız");
    } finally {
      setIsSubmitting(false);
    }
  }, [sharePayload, session, username, selectedDifficulty, selectedMode, dailyPlayed]);

  const handleCopyShare = useCallback(async () => {
    if (!sharePayload) return;
    const url = buildShareUrl({ ...sharePayload, username: username || "ANONIM" });
    await navigator.clipboard.writeText(url);
    toast.success("Link kopyalandı!");
  }, [sharePayload, username]);

  const handleNativeShare = useCallback(async () => {
    if (!sharePayload) return;
    const payload = { ...sharePayload, username: username || "ANONIM" };
    const shared = await nativeShare(payload);
    if (!shared) handleCopyShare();
  }, [sharePayload, username, handleCopyShare]);

  const resetToIntro = useCallback(() => {
    setScreen("intro");
    setRoundResults([]);
    setCurrentRound(0);
    setSession(null);
    setSharePayload(null);
  }, []);

  // ─── Stimuli ───────────────────────────────────────────────────────────────
  const colorStimulus = currentStimulus as { h: number; s: number; b: number } | null;
  const soundStimulus = currentStimulus as { freq: number } | null;
  const timeStimulus = currentStimulus as { targetMs: number } | null;
  const shapeStimulus = currentStimulus as ReturnType<typeof generateShape> | null;

  const tier = sharePayload ? getScoreTier(sharePayload.totalScore) : null;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${accentColor}33 0%, transparent 70%)`,
          transition: "background 0.5s ease",
        }}
      />

      <AnimatePresence mode="wait">
        {screen === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-12 pb-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Hub<span style={{ color: accentColor }}>Sense</span>
                </h1>
                <p className="text-xs text-white/30 mt-0.5">
                  Duyularını test et. Puanla. Paylaş.
                </p>
              </div>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                  bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-all text-sm text-white/70"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Skorlar</span>
              </button>
            </div>

            {/* Game Selector */}
            <div className="px-5 pb-2">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Oyun Seç</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(GAME_CONFIGS) as [GameType, typeof GAME_CONFIGS[GameType]][]).map(
                  ([type, cfg]) => (
                    <button
                      key={type}
                      onClick={() => setSelectedGame(type)}
                      className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all
                        ${selectedGame === type
                          ? "border-white/20 bg-white/[0.08]"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"}`}
                      style={{
                        boxShadow: selectedGame === type
                          ? `0 0 20px ${cfg.accent}22`
                          : undefined,
                        borderColor: selectedGame === type ? `${cfg.accent}44` : undefined,
                      }}
                    >
                      <div style={{ color: cfg.accent }}>{cfg.icon}</div>
                      <div>
                        <div className="font-bold text-sm text-white">{cfg.label}</div>
                        <div className="text-[10px] text-white/30 leading-tight mt-0.5 line-clamp-2">
                          {cfg.description}
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="px-5 py-3">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Zorluk</p>
              <div className="flex gap-2">
                {(Object.entries(DIFFICULTY_CONFIG) as [DifficultyType, typeof DIFFICULTY_CONFIG[DifficultyType]][]).map(
                  ([diff, dcfg]) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`flex-1 py-3 rounded-xl font-medium text-sm border transition-all
                        ${selectedDifficulty === diff
                          ? "bg-white/[0.08] text-white border-white/20"
                          : "border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}
                      style={{
                        borderColor: selectedDifficulty === diff ? `${dcfg.color}44` : undefined,
                        color: selectedDifficulty === diff ? dcfg.color : undefined,
                      }}
                    >
                      {dcfg.label}
                    </button>
                  )
                )}
              </div>
              <p className="text-xs text-white/30 mt-2">
                {DIFFICULTY_CONFIG[selectedDifficulty].description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-5 pb-6 mt-auto flex flex-col gap-3">
              {/* Daily Challenge */}
              <button
                onClick={() => startGame(selectedGame, selectedDifficulty, "daily")}
                className="flex items-center justify-between px-5 py-4 rounded-2xl border
                  bg-white/[0.03] border-white/10 hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <div className="text-left">
                    <div className="font-bold text-sm text-white">Günlük Meydan Okuma</div>
                    <div className="text-xs text-white/30">
                      {getTodayUTCString()} · Yenileniyor: {dailyCountdown}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
              </button>

              {/* Solo Play */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame(selectedGame, selectedDifficulty, "solo")}
                className="w-full py-4 rounded-2xl font-bold text-base tracking-wide
                  text-white border transition-all"
                style={{
                  background: `${accentColor}18`,
                  borderColor: `${accentColor}44`,
                  boxShadow: `0 0 30px ${accentColor}22`,
                }}
              >
                Solo Oyna →
              </motion.button>
            </div>

            {/* Footer */}
            <div className="px-5 pb-8 flex items-center justify-between text-xs text-white/20">
              <span>EverythingHub · HubSense</span>
              <span>v1.0</span>
            </div>
          </motion.div>
        )}

        {screen === "daily-intro" && (
          <motion.div
            key="daily-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8"
          >
            <div>
              <div className="text-4xl font-bold text-amber-400 mb-2">Günlük</div>
              <div className="text-5xl font-bold text-white mb-4">
                {config.label}
              </div>
              <p className="text-white/40 text-sm max-w-sm">
                Bugün dünya genelinde herkes aynı {ROUNDS_COUNT} uyaranla karşılaşıyor. Tek bir denemen var.
              </p>
            </div>
            <div className="text-sm text-white/30">
              {getTodayUTCString()}
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={proceedToReveal}
                className="w-full py-4 rounded-2xl font-bold text-base text-white border"
                style={{
                  background: `${accentColor}18`,
                  borderColor: `${accentColor}44`,
                  boxShadow: `0 0 30px ${accentColor}22`,
                }}
              >
                Başla
              </motion.button>
              <button
                onClick={resetToIntro}
                className="text-white/30 text-sm hover:text-white/60 transition-colors"
              >
                Geri
              </button>
            </div>
          </motion.div>
        )}

        {screen === "reveal" && session && currentStimulus && (
          <div key="reveal">
            {/* Round indicator */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
              <span className="text-white/30 text-sm font-mono">
                {currentRound + 1} / {ROUNDS_COUNT}
              </span>
            </div>

            <AnimatePresence>
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
            </AnimatePresence>
          </div>
        )}

        {screen === "guess" && session && currentStimulus && (
          <motion.div
            key={`guess-${currentRound}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="min-h-screen flex flex-col"
          >
            <div className="flex items-center justify-between px-5 pt-12 pb-4">
              <div>
                <div className="text-xs text-white/30 uppercase tracking-widest">
                  {config.label} · {currentRound + 1}/{ROUNDS_COUNT}
                </div>
                <div className="text-sm text-white/50 mt-0.5">
                  Bellekten yeniden oluştur
                </div>
              </div>
              <button
                onClick={resetToIntro}
                className="w-8 h-8 flex items-center justify-center rounded-full
                  bg-white/[0.04] hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              {Array.from({ length: ROUNDS_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === currentRound ? 24 : 8,
                    height: 8,
                    background: i < currentRound
                      ? accentColor
                      : i === currentRound
                        ? accentColor
                        : "rgba(255,255,255,0.1)",
                    opacity: i === currentRound ? 1 : i < currentRound ? 0.7 : 0.3,
                  }}
                />
              ))}
            </div>

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
            </div>
          </motion.div>
        )}

        {screen === "round-result" && roundResults.length > 0 && (
          <motion.div
            key={`round-result-${currentRound}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 gap-8"
          >
            <div className="text-center">
              <div className="text-white/30 text-sm mb-2">Tur {currentRound + 1} Puanı</div>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-8xl font-bold tabular-nums"
                style={{ color: accentColor }}
              >
                {extractScore(roundResults[roundResults.length - 1].result).toFixed(1)}
              </motion.div>
              <div className="text-white/30 text-lg mt-1">/10</div>
            </div>

            <div className="w-full max-w-sm">
              <RoundResultDetails result={roundResults[roundResults.length - 1].result} gameType={session?.gameType ?? "color"} accentColor={accentColor} />
            </div>

            <div className="text-center text-sm text-white/40">
              Toplam: {totalScore.toFixed(1)} / {(currentRound + 1) * 10}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNextRound}
              className="px-10 py-4 rounded-2xl font-bold text-base text-white border transition-all"
              style={{
                background: `${accentColor}18`,
                borderColor: `${accentColor}44`,
                boxShadow: `0 0 30px ${accentColor}22`,
              }}
            >
              {currentRound + 1 < ROUNDS_COUNT ? "Sonraki Tur →" : "Sonuçları Gör"}
            </motion.button>
          </motion.div>
        )}

        {screen === "total-result" && sharePayload && (
          <motion.div
            key="total-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={resetToIntro}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center
                rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 z-10"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>

            {/* Score */}
            <div className="flex flex-col items-center justify-center pt-16 pb-8 px-6 text-center">
              {newRecord && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-4 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }}
                >
                  YENI REKOR!
                </motion.div>
              )}

              {tier && (
                <>
                  <div
                    className="text-sm font-bold uppercase tracking-widest mb-2"
                    style={{ color: tier.color }}
                  >
                    {tier.label}
                  </div>
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 150 }}
                    className="text-9xl font-black tabular-nums"
                    style={{ color: tier.color }}
                  >
                    {sharePayload.totalScore.toFixed(1)}
                  </motion.div>
                  <div className="text-white/30 text-2xl mt-1">/50</div>
                  <p className="text-white/50 text-sm mt-4 max-w-xs">{tier.message}</p>
                </>
              )}
            </div>

            {/* Round breakdown */}
            <div className="px-5 pb-4">
              <div className="grid grid-cols-5 gap-1.5">
                {sharePayload.roundScores.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-xl flex items-end justify-center overflow-hidden"
                      style={{ height: 60, background: "rgba(255,255,255,0.04)" }}
                    >
                      <motion.div
                        className="w-full rounded-xl"
                        style={{ background: accentColor, opacity: 0.7 + (s / 10) * 0.3 }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(s / 10) * 56 + 4}px` }}
                        transition={{ delay: i * 0.08, type: "spring" }}
                      />
                    </div>
                    <span className="text-xs text-white/50 font-mono">{s.toFixed(1)}</span>
                    <span className="text-[10px] text-white/25">R{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Username + Submit */}
            <div className="px-5 pb-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/40">Kullanıcı adın (skor tablosu için)</label>
                <input
                  type="text"
                  placeholder="Kullanıcı adı (3-20 karakter)"
                  maxLength={20}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toUpperCase());
                    setUsernameError("");
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10
                    text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30
                    font-mono uppercase tracking-wider"
                />
                {usernameError && (
                  <p className="text-xs text-red-400">{usernameError}</p>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleScoreSubmit}
                  disabled={isSubmitting || !username.trim()}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white border transition-all disabled:opacity-40"
                  style={{
                    background: `${accentColor}18`,
                    borderColor: `${accentColor}44`,
                  }}
                >
                  {isSubmitting ? "Gönderiliyor..." : "Skoru Kaydet & Skor Tablosuna Ekle"}
                </motion.button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="px-5 pb-6 flex flex-col gap-2">
              <p className="text-xs text-white/30 text-center mb-1">Paylaş</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleCopyShare}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl
                    bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-sm text-white/60"
                >
                  <Copy className="w-4 h-4" />
                  <span>Kopyala</span>
                </button>
                <a
                  href={buildTwitterShareUrl({ ...sharePayload, username: username || "ANONIM" })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl
                    bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-sm text-white/60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span>X/Twitter</span>
                </a>
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl
                    bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-sm text-white/60"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Paylaş</span>
                </button>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="px-5 pb-10 flex gap-3">
              <button
                onClick={() => startGame(selectedGame, selectedDifficulty, selectedMode)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                  bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-sm text-white/60"
              >
                <RefreshCw className="w-4 h-4" />
                Tekrar
              </button>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                  bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all text-sm text-white/60"
              >
                <Trophy className="w-4 h-4" />
                Skor Tablosu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Overlay */}
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
    </div>
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
      { label: "Delta-E", value: r.deltaE.toFixed(2) },
      { label: "Hedef", value: r.targetHex.toUpperCase() },
      { label: "Tahminin", value: r.guessHex.toUpperCase() },
      { label: "Doğruluk", value: `${r.percentAccuracy}%` }
    );
  } else if (gameType === "sound") {
    const r = result as SoundScoreResult;
    rows.push(
      { label: "Fark", value: `${r.centDiff.toFixed(0)} sent` },
      { label: "Hedef", value: `${Math.round(r.targetFreq)}Hz (${r.targetNote})` },
      { label: "Tahminin", value: `${Math.round(r.guessFreq)}Hz (${r.guessNote})` },
      { label: "Doğruluk", value: `${r.percentAccuracy}%` }
    );
  } else if (gameType === "time") {
    const r = result as TimeScoreResult;
    rows.push(
      { label: "Hedef", value: `${r.targetMs}ms` },
      { label: "Tahminin", value: `${r.guessMs}ms` },
      { label: "Hata", value: `${r.absoluteErrorMs}ms (${(r.relativeError * 100).toFixed(1)}%)` },
      { label: "Durum", value: r.earlyOrLate === "perfect" ? "Mükemmel!" : r.earlyOrLate === "early" ? "Erken" : "Geç" }
    );
  } else if (gameType === "shape") {
    const r = result as ShapeScoreResult;
    rows.push(
      { label: "IoU", value: `${(r.iou * 100).toFixed(1)}%` },
      { label: "Döndürme Hatası", value: `${r.rotationError.toFixed(1)}°` },
      { label: "Boyut Hatası", value: `${(r.scaleError * 100).toFixed(1)}%` },
      { label: "Pozisyon Hatası", value: `${(r.positionError * 100).toFixed(1)}%` }
    );
  }

  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-2"
      style={{ borderColor: `${accentColor}22`, background: `${accentColor}08` }}
    >
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between text-sm">
          <span className="text-white/40">{label}</span>
          <span className="font-mono text-white/80">{value}</span>
        </div>
      ))}
    </div>
  );
}
