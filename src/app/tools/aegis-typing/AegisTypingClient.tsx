"use client";
// ============================================================
// aegisTyping — Main Client Orchestrator
// Pure liquid glassmorphism, responsive studio header with breadcrumb,
// non-blocking external button clickability, Caps Lock detection,
// 17+ languages, 8+ modes, adaptive Keybr learning, and anti-cheat.
// ============================================================
import React, {
  useEffect,
  useCallback,
  useRef,
  useReducer,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Keyboard,
  Settings2,
  Trophy,
  RotateCcw,
  User,
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  Shield,
  Award,
  Zap,
  Target,
  CheckCircle2,
  Eye,
  EyeOff,
  BarChart2,
  Flame,
  History,
  Trash2,
  HelpCircle,
  Clock,
  Check,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Types
import type {
  TestMode,
  Funbox,
  AegisTypingSettings,
  ThemeName,
  TestResult,
  WordListData,
  SoundPack,
} from "./types";
import { DEFAULT_SETTINGS, getSpeedTier } from "./types";

// Engine
import { useTypingEngine } from "./engine/useTypingEngine";
import { useAudioEngine } from "./engine/useAudioEngine";
import { useLocalStorage } from "./engine/useLocalStorage";
import { useShareEngine } from "./engine/useShareEngine";

// Components
import { TypingArena } from "./components/TypingArena";
import { LiveStatsBar } from "./components/LiveStatsBar";
import { ModeSelector } from "./components/ModeSelector";
import { LanguageSelector } from "./components/LanguageSelector";
import { SettingsPanel } from "./components/SettingsPanel";
import { ResultPanel } from "./components/ResultPanel";
import { LeaderboardPanel } from "./components/LeaderboardPanel";
import { KeyboardOverlay } from "./components/KeyboardOverlay";
import { FinishEffect } from "./components/FinishEffect";
import { applyTheme } from "./components/themes";

// ─── State Reducer ────────────────────────────────────────────
interface AppState {
  mode: TestMode;
  modeValue: number | string;
  language: string;
  funbox: Funbox;
  settings: AegisTypingSettings;
  themeName: ThemeName;
  wordListData: WordListData | null;
  wordListLoading: boolean;
  showSettings: boolean;
  settingsSection: string;
  showLeaderboard: boolean;
  testResult: TestResult | null;
  isNewRecord: boolean;
  prevBest: number;
  currentLesson: string;
  localHistory: TestResult[];
  pressedKey: string;
  errorMap: Record<string, number>;
}

type AppAction =
  | { type: "SET_MODE"; mode: TestMode; modeValue?: number | string }
  | { type: "SET_MODE_VALUE"; value: number | string }
  | { type: "SET_LANGUAGE"; language: string }
  | { type: "SET_FUNBOX"; funbox: Funbox }
  | { type: "SET_SETTINGS"; settings: AegisTypingSettings }
  | { type: "SET_THEME"; name: ThemeName }
  | { type: "OPEN_SETTINGS"; section?: string }
  | { type: "CLOSE_SETTINGS" }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "TOGGLE_LEADERBOARD" }
  | { type: "WORDLIST_LOADED"; data: WordListData | null }
  | { type: "TEST_COMPLETE"; result: TestResult; isNewRecord: boolean; prevBest: number }
  | { type: "CLEAR_RESULT" }
  | { type: "SET_LESSON"; id: string }
  | { type: "UPDATE_HISTORY"; history: TestResult[] }
  | { type: "SET_PRESSED_KEY"; key: string }
  | { type: "UPDATE_ERROR_MAP"; key: string };

function getDefaultModeValue(mode: TestMode): number | string {
  switch (mode) {
    case "time":
      return 60;
    case "words":
      return 25;
    case "quote":
      return "medium";
    case "zen":
      return "zen";
    case "code":
      return "js";
    case "learn":
      return "homerow";
    case "challenge":
      return "none";
    default:
      return "";
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_MODE":
      return {
        ...state,
        mode: action.mode,
        modeValue: action.modeValue ?? getDefaultModeValue(action.mode),
        testResult: null,
      };
    case "SET_MODE_VALUE":
      return { ...state, modeValue: action.value, testResult: null };
    case "SET_LANGUAGE":
      return {
        ...state,
        language: action.language,
        testResult: null,
        wordListData: null,
        wordListLoading: true,
      };
    case "SET_FUNBOX":
      return { ...state, funbox: action.funbox, testResult: null };
    case "SET_SETTINGS":
      return { ...state, settings: action.settings };
    case "SET_THEME":
      return { ...state, themeName: action.name };
    case "OPEN_SETTINGS":
      return {
        ...state,
        showSettings: true,
        settingsSection: action.section || "appearance",
      };
    case "CLOSE_SETTINGS":
      return { ...state, showSettings: false };
    case "TOGGLE_SETTINGS":
      return {
        ...state,
        showSettings: !state.showSettings,
        settingsSection: "appearance",
      };
    case "TOGGLE_LEADERBOARD":
      return { ...state, showLeaderboard: !state.showLeaderboard };
    case "WORDLIST_LOADED":
      return { ...state, wordListData: action.data, wordListLoading: false };
    case "TEST_COMPLETE":
      return {
        ...state,
        testResult: action.result,
        isNewRecord: action.isNewRecord,
        prevBest: action.prevBest,
      };
    case "CLEAR_RESULT":
      return { ...state, testResult: null };
    case "SET_LESSON":
      return { ...state, currentLesson: action.id };
    case "UPDATE_HISTORY":
      return { ...state, localHistory: action.history };
    case "SET_PRESSED_KEY":
      return { ...state, pressedKey: action.key };
    case "UPDATE_ERROR_MAP":
      return {
        ...state,
        errorMap: {
          ...state.errorMap,
          [action.key]: (state.errorMap[action.key] ?? 0) + 1,
        },
      };
    default:
      return state;
  }
}

export function AegisTypingClient() {
  const { t, lang } = useLanguage();
  const isTurkish = lang === "tr";

  const storage = useLocalStorage();
  const shareEngine = useShareEngine();
  const audioEngine = useAudioEngine();

  // Initialize settings & session from localStorage
  const initialSettings = useMemo(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    return storage.loadSettings();
  }, []); // eslint-disable-line

  const initialSession = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        mode: "time" as TestMode,
        modeValue: 60,
        language: "tr-q",
        funbox: "none" as Funbox,
        currentLesson: "homerow",
      };
    }
    return storage.loadSession();
  }, []); // eslint-disable-line

  const [state, dispatch] = useReducer(appReducer, {
    mode: initialSession.mode,
    modeValue: initialSession.modeValue,
    language: initialSession.language,
    funbox: initialSession.funbox,
    settings: initialSettings,
    themeName: initialSettings.theme,
    wordListData: null,
    wordListLoading: true,
    showSettings: false,
    settingsSection: "appearance",
    showLeaderboard: false,
    testResult: null,
    isNewRecord: false,
    prevBest: 0,
    currentLesson: initialSession.currentLesson,
    localHistory: [],
    pressedKey: "",
    errorMap: {},
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const pressedKeyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // ─── Save Session when mode or language changes ──────────────
  useEffect(() => {
    storage.saveSession({
      mode: state.mode,
      modeValue: state.modeValue,
      language: state.language,
      funbox: state.funbox,
      currentLesson: state.currentLesson,
    });
  }, [
    state.mode,
    state.modeValue,
    state.language,
    state.funbox,
    state.currentLesson,
    storage,
  ]);

  // ─── Load wordlist when language changes ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    if (state.mode === "code" || state.mode === "learn") {
      dispatch({ type: "WORDLIST_LOADED", data: null });
      return;
    }

    async function load() {
      dispatch({ type: "WORDLIST_LOADED", data: null });
      try {
        const mod = await import(`./data/wordlists/${state.language}.json`);
        if (!cancelled) {
          dispatch({ type: "WORDLIST_LOADED", data: mod.default as WordListData });
        }
      } catch {
        // Fallback to English
        try {
          const mod = await import("./data/wordlists/en.json");
          if (!cancelled) {
            dispatch({ type: "WORDLIST_LOADED", data: mod.default as WordListData });
          }
        } catch {
          if (!cancelled) dispatch({ type: "WORDLIST_LOADED", data: null });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [state.language, state.mode]);

  // ─── Apply theme on mount and change ──────────────────────
  useEffect(() => {
    applyTheme(state.themeName);
  }, [state.themeName]);

  // ─── Sync audio engine settings ───────────────────────────
  useEffect(() => {
    audioEngine.setSoundPack(state.settings.soundPack);
    audioEngine.setVolume(state.settings.volume);
    audioEngine.setSoundOnError(state.settings.soundOnError);
  }, [
    state.settings.soundPack,
    state.settings.volume,
    state.settings.soundOnError,
    audioEngine,
  ]);

  // ─── Load initial history ─────────────────────────────────
  useEffect(() => {
    const history = storage.loadHistory();
    dispatch({ type: "UPDATE_HISTORY", history });
  }, [storage]);

  // ─── Save settings when updated ───────────────────────────
  const handleSettingsChange = useCallback(
    (newSettings: AegisTypingSettings) => {
      dispatch({ type: "SET_SETTINGS", settings: newSettings });
      storage.saveSettings(newSettings);
      if (newSettings.theme !== state.themeName) {
        dispatch({ type: "SET_THEME", name: newSettings.theme });
      }
    },
    [state.themeName, storage]
  );

  // ─── Quick Modifier Toggles ───────────────────────────────
  const togglePunctuation = useCallback(() => {
    const next = !state.settings.punctuation;
    handleSettingsChange({ ...state.settings, punctuation: next });
  }, [state.settings, handleSettingsChange]);

  const toggleNumbers = useCallback(() => {
    const next = !state.settings.numbers;
    handleSettingsChange({ ...state.settings, numbers: next });
  }, [state.settings, handleSettingsChange]);

  const toggleCapitalization = useCallback(() => {
    const next = !state.settings.capitalization;
    handleSettingsChange({ ...state.settings, capitalization: next });
  }, [state.settings, handleSettingsChange]);

  const toggleBlindMode = useCallback(() => {
    const next = !state.settings.blindMode;
    handleSettingsChange({ ...state.settings, blindMode: next });
  }, [state.settings, handleSettingsChange]);

  const toggleKeyboardOverlay = useCallback(() => {
    const next = !state.settings.showKeyboardOverlay;
    handleSettingsChange({ ...state.settings, showKeyboardOverlay: next });
  }, [state.settings, handleSettingsChange]);

  const cycleSoundPack = useCallback(() => {
    const packs: SoundPack[] = ["silent", "mechanical", "typewriter", "soft"];
    const currentIdx = packs.indexOf(state.settings.soundPack);
    const nextPack = packs[(currentIdx + 1) % packs.length];
    handleSettingsChange({ ...state.settings, soundPack: nextPack });
  }, [state.settings, handleSettingsChange]);

  // ─── Handle test completion ───────────────────────────────
  const handleTestComplete = useCallback(
    (result: TestResult) => {
      const { isNewRecord, prevBest } = storage.checkAndSaveHighScore(result);
      storage.saveResult(result);
      const history = storage.loadHistory();
      dispatch({ type: "UPDATE_HISTORY", history });
      dispatch({
        type: "TEST_COMPLETE",
        result,
        isNewRecord,
        prevBest,
      });

      // Submit to leaderboard if clean and online
      if (!result.antiCheat.suspicious) {
        fetch("/api/aegis-typing/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname: state.settings.nickname || "Anonim",
            wpm: result.wpm,
            rawWpm: result.rawWpm,
            accuracy: result.accuracy,
            consistency: result.consistency,
            errors: result.errors,
            cpm: result.cpm,
            duration: result.duration,
            mode: result.mode,
            modeValue: String(result.modeValue),
            language: result.language,
            funbox: result.funbox,
            hash: result.hash,
            antiCheat: result.antiCheat,
          }),
        }).catch(() => {});
      }
    },
    [state.settings.nickname, storage]
  );

  // ─── Core Typing Engine Hook ──────────────────────────────
  const engine = useTypingEngine({
    mode: state.mode,
    modeValue: state.modeValue,
    language: state.language,
    funbox: state.funbox,
    settings: state.settings,
    wordListData: state.wordListData,
    lessonId: state.currentLesson,
    customText: state.mode === "custom" ? String(state.modeValue) : undefined,
    onTestComplete: handleTestComplete,
  });

  // Track pressed keys for visual keyboard overlay
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (typeof e.getModifierState === "function") {
        setIsCapsLockOn(e.getModifierState("CapsLock"));
      }

      engine.handleKeyDown(e);

      if (state.settings.showKeyboardOverlay && e.key.length === 1) {
        dispatch({ type: "SET_PRESSED_KEY", key: e.key.toLowerCase() });
        if (pressedKeyTimeoutRef.current) {
          clearTimeout(pressedKeyTimeoutRef.current);
        }
        pressedKeyTimeoutRef.current = setTimeout(() => {
          dispatch({ type: "SET_PRESSED_KEY", key: "" });
        }, 180);
      }
    },
    [engine, state.settings.showKeyboardOverlay]
  );

  // Global Keyboard Shortcuts (Seamless typing anywhere, Tab to reset, Esc to close modals)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (typeof e.getModifierState === "function") {
        setIsCapsLockOn(e.getModifierState("CapsLock"));
      }

      if (e.key === "Tab" && !state.showSettings && !state.showLeaderboard && !state.testResult) {
        e.preventDefault();
        engine.resetTest();
        inputRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (state.showSettings) dispatch({ type: "CLOSE_SETTINGS" });
        if (state.showLeaderboard) dispatch({ type: "TOGGLE_LEADERBOARD" });
        if (state.testResult) dispatch({ type: "CLEAR_RESULT" });
        return;
      }

      // Check if target is an interactive form element or modal dialog
      const target = e.target as HTMLElement | null;
      const isTypingInInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          target.closest("[role='dialog']") !== null);

      if (!isTypingInInput && !state.showSettings && !state.showLeaderboard && !state.testResult) {
        if (document.activeElement !== inputRef.current && e.key.length === 1) {
          inputRef.current?.focus();
        }
      }
    }

    function handleGlobalKeyUp(e: KeyboardEvent) {
      if (typeof e.getModifierState === "function") {
        setIsCapsLockOn(e.getModifierState("CapsLock"));
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("keyup", handleGlobalKeyUp);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, [state.showSettings, state.showLeaderboard, state.testResult, engine]);

  const speedTier = state.testResult
    ? getSpeedTier(state.testResult.wpm)
    : "beginner";

  const isRtl = state.wordListData?.rtl ?? false;

  // Session Statistics Calculation
  const sessionStats = useMemo(() => {
    if (state.localHistory.length === 0) {
      return { totalTests: 0, peakWpm: 0, avgWpm: 0, avgAccuracy: 0 };
    }
    const totalTests = state.localHistory.length;
    const peakWpm = Math.max(...state.localHistory.map((h) => h.wpm));
    const avgWpm = Math.round(
      state.localHistory.reduce((acc, h) => acc + h.wpm, 0) / totalTests
    );
    const avgAccuracy = Math.round(
      state.localHistory.reduce((acc, h) => acc + h.accuracy, 0) / totalTests
    );
    return { totalTests, peakWpm, avgWpm, avgAccuracy };
  }, [state.localHistory]);

  const handleClearHistory = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aegis_typing_history");
      dispatch({ type: "UPDATE_HISTORY", history: [] });
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl 2xl:max-w-6xl px-4 sm:px-6 lg:px-8 py-2 relative space-y-6">
      {/* ─── Breadcrumb Navigation ───────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--hub-text-muted)] hover:text-white hover:border-indigo-500/50 transition-all cursor-pointer"
            data-cursor={t.backToHub || "Ana Sayfa"}
          >
            <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t.backToHub || "Ana Sayfa"}</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <Link
            href="/#tools"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            data-cursor={t.tools || "Araçlar"}
          >
            <span>{t.tools || "Araçlar"}</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold font-mono">
            <Keyboard className="h-3.5 w-3.5 text-cyan-400" />
            aegisTyping Studio
          </span>
        </div>

        {/* Live Privacy & Engine Badge */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            <Shield className="h-3 w-3" />
            %100 İstemci Taraflı & Sıfır Veri Saklama
          </span>
        </div>
      </div>

      {/* ─── Hero Header & Action Toolbar ───────────────── */}
      <div className="rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 shadow-xl"
              style={{
                background: "rgba(34, 211, 238, 0.08)",
                borderColor: "rgba(34, 211, 238, 0.25)",
                boxShadow: "0 0 25px rgba(34, 211, 238, 0.2)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--at-accent, #22d3ee)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="3" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M8 16h8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  aegisTyping
                </h1>
                <span
                  className="text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider"
                  style={{
                    color: "var(--at-accent)",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid color-mix(in srgb, var(--at-accent) 30%, transparent)",
                  }}
                >
                  Studio Pro
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--hub-text-muted)] max-w-xl leading-relaxed">
                17+ dil (Türkçe Q/F, İngilizce, Japonca, Kod dilleri), 8+ mod, adaptif Keybr öğrenme, milisaniye anti-hile ve canlı liderlik tablosu.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Language Selector */}
            {state.mode !== "code" && (
              <LanguageSelector
                language={state.language}
                onChange={(lang) => dispatch({ type: "SET_LANGUAGE", language: lang })}
                disabled={engine.phase === "running"}
              />
            )}

            {/* Rumuz / Profile Pill */}
            <button
              type="button"
              onClick={() => dispatch({ type: "OPEN_SETTINGS", section: "profile" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none transition-all hover:bg-white/10 cursor-pointer"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "var(--at-text)",
              }}
              title="Rumuz / Profil Düzenle"
              aria-label="Profil Ayarı"
            >
              <User size={13} style={{ color: "var(--at-accent)" }} />
              <span className="max-w-[90px] truncate font-mono">
                {state.settings.nickname || "Anonim"}
              </span>
            </button>

            {/* Sound Pack Quick Toggle */}
            <button
              type="button"
              onClick={cycleSoundPack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none transition-all hover:bg-white/10 cursor-pointer"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "var(--at-text)",
              }}
              title={`Ses Paketi: ${state.settings.soundPack}`}
              aria-label="Ses Paketi Değiştir"
            >
              {state.settings.soundPack === "silent" ? (
                <VolumeX size={13} className="text-zinc-500" />
              ) : (
                <Volume2 size={13} style={{ color: "var(--at-accent)" }} />
              )}
              <span className="capitalize text-[11px] hidden sm:inline">
                {state.settings.soundPack === "silent" ? "Sessiz" : state.settings.soundPack}
              </span>
            </button>

            {/* Leaderboard Button */}
            <motion.button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_LEADERBOARD" })}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none transition-all cursor-pointer"
              style={{
                background: state.showLeaderboard
                  ? "var(--at-accent)"
                  : "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: state.showLeaderboard ? "#09090b" : "var(--at-text)",
              }}
              title="Global & Yerel Liderlik Tablosu"
              aria-label="Liderlik Tablosu"
            >
              <Trophy size={13} />
              <span className="hidden sm:inline">Skorlar</span>
            </motion.button>

            {/* Settings Drawer Button */}
            <motion.button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="p-2 rounded-xl focus:outline-none transition-all cursor-pointer"
              style={{
                background: state.showSettings
                  ? "var(--at-accent)"
                  : "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: state.showSettings ? "#09090b" : "var(--at-text)",
              }}
              title="AegisTyping Ayarları"
              aria-label="Ayarlar"
            >
              <Settings2 size={15} />
            </motion.button>
          </div>
        </div>

        {/* Caps Lock Active Alert */}
        <AnimatePresence>
          {isCapsLockOn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>
                  Caps Lock Açık! Büyük harf kilidi yazma testinizin doğruluğunu etkileyebilir.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Mode & Modifier Selector ────────────────────── */}
      <ModeSelector
        mode={state.mode}
        modeValue={state.modeValue}
        funbox={state.funbox}
        onModeChange={(m) => dispatch({ type: "SET_MODE", mode: m })}
        onModeValueChange={(v) => dispatch({ type: "SET_MODE_VALUE", value: v })}
        onFunboxChange={(fb) => dispatch({ type: "SET_FUNBOX", funbox: fb })}
        disabled={engine.phase === "running"}
        punctuation={state.settings.punctuation}
        numbers={state.settings.numbers}
        capitalization={state.settings.capitalization}
        onTogglePunctuation={togglePunctuation}
        onToggleNumbers={toggleNumbers}
        onToggleCapitalization={toggleCapitalization}
      />

      {/* ─── Main Typing Liquid Glass Card ──────────────── */}
      <div
        className="relative rounded-3xl p-6 sm:p-8 transition-all duration-300"
        style={{
          background: "rgba(18, 18, 24, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(28px)",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Live stats */}
        <LiveStatsBar
          phase={engine.phase}
          liveWpm={engine.liveWpm}
          liveAccuracy={engine.liveAccuracy}
          elapsedSeconds={engine.elapsedSeconds}
          remainingSeconds={engine.remainingSeconds}
          totalErrors={engine.totalErrors}
          wordCount={engine.wordCount}
          mode={state.mode}
          modeValue={state.modeValue}
          hideStats={state.settings.hideStats}
          wpmTimeline={engine.wpmTimeline}
          accentColor="var(--at-accent)"
        />

        {/* Word list loading */}
        {state.wordListLoading && (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--at-accent)", borderTopColor: "transparent" }}
            />
          </div>
        )}

        {/* Typing arena */}
        {!state.wordListLoading && (
          <TypingArena
            words={engine.words}
            currentWordIndex={engine.currentWordIndex}
            caretPosition={engine.caretPosition}
            phase={engine.phase}
            caretStyle={state.settings.caretStyle}
            caretColor={state.settings.caretColor}
            smoothCaret={state.settings.smoothCaret}
            caretTrail={state.settings.showCaretTrail}
            caretTrailLength={state.settings.caretTrailLength}
            fontSize={state.settings.fontSize}
            fontFamily={state.settings.fontFamily}
            lineCount={state.settings.lineCount}
            rtl={isRtl}
            blindMode={state.settings.blindMode}
            funbox={state.funbox}
            wordFadeAnimation={state.settings.wordFadeAnimation}
            reducedMotion={state.settings.reducedMotion}
            onKeyDown={handleKeyDown}
            inputRef={inputRef as React.RefObject<HTMLInputElement>}
          />
        )}

        {/* Keyboard overlay */}
        {state.settings.showKeyboardOverlay && (
          <KeyboardOverlay
            show={state.settings.showKeyboardOverlay}
            pressedKey={state.pressedKey}
            errorMap={state.errorMap}
          />
        )}
      </div>

      {/* ─── Bottom Actions & Shortcuts Info ─────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs px-2 text-zinc-400">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-cyan-400" />
            <span>Yazmaya başlayın veya</span>
          </span>
          <kbd className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono font-semibold text-zinc-200">
            Tab
          </kbd>
          <span>ile sıfırlayın</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <kbd className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 hidden sm:inline">
            Esc
          </kbd>
          <span className="hidden sm:inline">ile menüleri kapatın</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Virtual Keyboard Toggle */}
          <button
            type="button"
            onClick={toggleKeyboardOverlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all focus:outline-none cursor-pointer"
            style={{
              background: state.settings.showKeyboardOverlay
                ? "var(--at-accent)"
                : "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: state.settings.showKeyboardOverlay ? "#09090b" : "var(--at-text)",
            }}
            title="Sanal Klavye Haritasını Aç/Kapat"
          >
            <Keyboard size={13} />
            <span>Klavye</span>
          </button>

          {/* Blind Mode Toggle */}
          <button
            type="button"
            onClick={toggleBlindMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all focus:outline-none cursor-pointer"
            style={{
              background: state.settings.blindMode
                ? "var(--at-accent)"
                : "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: state.settings.blindMode ? "#09090b" : "var(--at-text)",
            }}
            title="Kör Yazma Modunu Aç/Kapat"
          >
            {state.settings.blindMode ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>Kör Mod</span>
          </button>

          {/* Reset button */}
          <motion.button
            type="button"
            onClick={() => {
              engine.resetTest();
              inputRef.current?.focus();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all focus:outline-none cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--at-text)",
            }}
            title="Yeniden Başlat (Tab)"
          >
            <RotateCcw size={13} />
            <span>Sıfırla</span>
          </motion.button>
        </div>
      </div>

      {/* ─── Educational & Studio Insight Sections ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        {/* Section 1: 10 Finger Touch Typing Placement Guide */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Target size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">10 Parmak Klavye Yerleşimi</h2>
              <p className="text-[11px] text-zinc-400">Ev Sırası (Home Row) ve Parmak Eşleşmesi</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
              <span className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider block">
                Sol El (A - S - D - F)
              </span>
              <ul className="space-y-1 text-zinc-400 text-[11px]">
                <li><strong className="text-zinc-200">Serçe:</strong> A, Q, Z, 1, Shift, Tab</li>
                <li><strong className="text-zinc-200">Yüzük:</strong> S, W, X, 2</li>
                <li><strong className="text-zinc-200">Orta:</strong> D, E, C, 3</li>
                <li><strong className="text-zinc-200">İşaret:</strong> F, R, V, 4, G, T, B, 5</li>
              </ul>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
              <span className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider block">
                Sağ El (J - K - L - Ş/;)
              </span>
              <ul className="space-y-1 text-zinc-400 text-[11px]">
                <li><strong className="text-zinc-200">İşaret:</strong> J, U, M, 7, H, Y, N, 6</li>
                <li><strong className="text-zinc-200">Orta:</strong> K, I, Ö/,, 8</li>
                <li><strong className="text-zinc-200">Yüzük:</strong> L, O, Ç/., 9</li>
                <li><strong className="text-zinc-200">Serçe:</strong> Ş/;, P, İ, 0, Enter, Backspace</li>
              </ul>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Başparmaklarınız her zaman <strong className="text-zinc-200">Boşluk (Space)</strong> tuşunda beklemelidir. Klavyeye bakmadan yazma ritmi kas hafızasını 3 kat daha hızlı geliştirir.
          </p>
        </div>

        {/* Section 2: WPM Speed Tiers Breakdown */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">WPM Hız Skalası & Seviyeler</h2>
              <p className="text-[11px] text-zinc-400">Kelime / Dakika Uluslararası Standartları</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { tier: "Başlangıç", range: "< 30 WPM", color: "#94a3b8", desc: "Temel klavye alışkanlığı kazanma evresi" },
              { tier: "Gelişmekte Olan", range: "30 - 59 WPM", color: "#38bdf8", desc: "Günlük ofis ve standart yazışma hızı" },
              { tier: "İleri Seviye", range: "60 - 89 WPM", color: "#4ade80", desc: "Hızlı yazışma ve kodlama standardı" },
              { tier: "Profesyonel", range: "90 - 119 WPM", color: "#a855f7", desc: "Profesyonel yazarlar ve hızlı geliştiriciler" },
              { tier: "Usta / Dünya Seviyesi", range: "120+ WPM", color: "#f59e0b", desc: "Dünya sıralaması & turnuva şampiyonu hızı" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="font-semibold text-zinc-200">{item.tier}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-xs" style={{ color: item.color }}>
                    {item.range}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Session Tracker Summary */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <BarChart2 size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Kişisel Oturum İstatistikleri</h2>
                <p className="text-[11px] text-zinc-400">Bu Cihazdaki Performans Özeti</p>
              </div>
            </div>

            {state.localHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                title="Geçmişi Temizle"
              >
                <Trash2 size={12} />
                <span>Temizle</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Testler</span>
              <span className="text-lg font-black font-mono text-white tabular-nums">
                {sessionStats.totalTests}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">En Yüksek</span>
              <span className="text-lg font-black font-mono text-cyan-400 tabular-nums">
                {sessionStats.peakWpm}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Ort. WPM</span>
              <span className="text-lg font-black font-mono text-emerald-400 tabular-nums">
                {sessionStats.avgWpm}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Doğruluk</span>
              <span className="text-lg font-black font-mono text-indigo-400 tabular-nums">
                {sessionStats.avgAccuracy}%
              </span>
            </div>
          </div>

          {state.localHistory.length === 0 ? (
            <p className="text-xs text-center text-zinc-500 py-3">
              Henüz tamamlanmış test kaydı yok. İlk testinizi tamamlayın!
            </p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs font-mono">
              {state.localHistory.slice(0, 4).map((h, i) => (
                <div
                  key={h.id || i}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] text-zinc-300 text-[11px]"
                >
                  <span className="text-zinc-400">{h.mode} ({h.modeValue})</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-cyan-400">{h.wpm} WPM</span>
                    <span className="text-emerald-400">{h.accuracy}%</span>
                    <span className="text-zinc-500 text-[10px]">{h.language}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Security & Zero Data Retention */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Güvenlik & Anti-Hile Mimarisi</h2>
              <p className="text-[11px] text-zinc-400">Web Crypto SHA-256 İmzalı & %100 Gizli</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
            <p>
              <strong className="text-zinc-200">Sıfır Veri Saklama:</strong> Tüm yazma süreleri, tuş basım aralıkları ve kelime dizileri doğrudan tarayıcınızın RAM belleğinde işlenir. Hiçbir harici sunucuya metin kaydı yapılmaz.
            </p>
            <p>
              <strong className="text-zinc-200">Anti-Hile & Bot Tespiti:</strong> Milisaniye varyans dağılımı analizi (&lt;15ms bot/makro koruması), pano yapıştırma engeli ve pencere ayrılma dedektörü ile liderlik tablosu puanları kriptografik olarak doğrulanır.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Modals & Overlays ─────────────────────────────── */}
      {state.testResult && (
        <ResultPanel
          result={state.testResult}
          isNewRecord={state.isNewRecord}
          prevBest={state.prevBest}
          localHistory={state.localHistory}
          onRestart={() => {
            dispatch({ type: "CLEAR_RESULT" });
            engine.resetTest();
            setTimeout(() => inputRef.current?.focus(), 80);
          }}
          onNewTest={() => {
            dispatch({ type: "CLEAR_RESULT" });
            engine.resetTest();
            setTimeout(() => inputRef.current?.focus(), 80);
          }}
          shareEngine={shareEngine}
        />
      )}

      <LeaderboardPanel
        open={state.showLeaderboard}
        onClose={() => dispatch({ type: "TOGGLE_LEADERBOARD" })}
        localHistory={state.localHistory}
        currentLanguage={state.language}
        nickname={state.settings.nickname}
      />

      <SettingsPanel
        open={state.showSettings}
        onClose={() => dispatch({ type: "CLOSE_SETTINGS" })}
        settings={state.settings}
        onChange={handleSettingsChange}
        currentThemeName={state.themeName}
        onThemeChange={(name) => dispatch({ type: "SET_THEME", name })}
        initialSection={state.settingsSection}
      />

      {state.testResult && state.settings.finishConfetti && (
        <FinishEffect
          active={true}
          speedTier={speedTier}
          wpm={state.testResult.wpm}
        />
      )}
    </div>
  );
}
