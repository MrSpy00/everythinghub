"use client";
// ============================================================
// aegisTyping — Main Client Orchestrator
// Pure liquid glassmorphism, transparent background, rich header
// with keyboard SVG badge, synchronized rumuz/nickname pill,
// accurate countdown, and 12+ programming languages code generator.
// ============================================================
import React, {
  useEffect,
  useCallback,
  useRef,
  useReducer,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import {
  Settings2,
  Trophy,
  RotateCcw,
  User,
  Sparkles,
} from "lucide-react";

// Types
import type {
  TestMode,
  Funbox,
  AegisTypingSettings,
  ThemeName,
  TestResult,
  WordListData,
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
    case "TOGGLE_SETTINGS":
      return { ...state, showSettings: !state.showSettings };
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
  const storage = useLocalStorage();
  const shareEngine = useShareEngine();
  const audioEngine = useAudioEngine();

  // Initialize settings from localStorage
  const initialSettings = useMemo(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    return storage.loadSettings();
  }, []); // eslint-disable-line

  const [state, dispatch] = useReducer(appReducer, {
    mode: "time",
    modeValue: 60,
    language: "tr-q",
    funbox: "none",
    settings: initialSettings,
    themeName: initialSettings.theme,
    wordListData: null,
    wordListLoading: true,
    showSettings: false,
    showLeaderboard: false,
    testResult: null,
    isNewRecord: false,
    prevBest: 0,
    currentLesson: "homerow",
    localHistory: [],
    pressedKey: "",
    errorMap: {},
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const pressedKeyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load wordlist when language changes ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    if (state.mode === "code") {
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

  // ─── Apply theme on change ─────────────────────────────────
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
    customText: typeof state.modeValue === "string" ? state.modeValue : undefined,
    onTestComplete: handleTestComplete,
  });

  // Track pressed keys for visual keyboard overlay
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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

  // Global Keyboard Shortcuts (Tab to reset, Esc to close modals)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab" && !state.showSettings && !state.showLeaderboard) {
        e.preventDefault();
        engine.resetTest();
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (state.showSettings) dispatch({ type: "TOGGLE_SETTINGS" });
        if (state.showLeaderboard) dispatch({ type: "TOGGLE_LEADERBOARD" });
        if (state.testResult) dispatch({ type: "CLEAR_RESULT" });
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [state.showSettings, state.showLeaderboard, state.testResult, engine]);

  const speedTier = state.testResult
    ? getSpeedTier(state.testResult.wpm)
    : "beginner";

  const isRtl = state.wordListData?.rtl ?? false;

  return (
    <div className="w-full flex flex-col items-center bg-transparent py-4 sm:py-6 relative select-none">
      {/* Dynamic CSS Variables base */}
      <style>{`
        :root {
          --at-bg: rgba(9, 9, 11, 0);
          --at-surface: rgba(18, 18, 24, 0.5);
          --at-border: rgba(255, 255, 255, 0.08);
          --at-text: #fafafa;
          --at-muted: #94a3b8;
          --at-correct: #22c55e;
          --at-error: #ef4444;
          --at-pending: rgba(255, 255, 255, 0.35);
          --at-caret: #22d3ee;
          --at-highlight: rgba(34, 211, 238, 0.08);
          --at-accent: #22d3ee;
        }
      `}</style>

      <div className="w-full max-w-3xl px-4 space-y-6">
        {/* ─── Header ─────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-3">
          {/* Logo badge with transparent SVG keyboard */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 0 20px rgba(34, 211, 238, 0.18)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--at-accent, #22d3ee)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="3" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M8 16h8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                aegisTyping
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                  Studio
                </span>
              </span>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector (human languages only) */}
            {state.mode !== "code" && (
              <LanguageSelector
                language={state.language}
                onChange={(lang) => dispatch({ type: "SET_LANGUAGE", language: lang })}
                disabled={engine.phase === "running"}
              />
            )}

            {/* Synchronized Rumuz / Nickname Pill */}
            <button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none transition-all hover:bg-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                color: "var(--at-text)",
              }}
              title="Rumuz / Profil Ayarı"
            >
              <User size={13} style={{ color: "var(--at-accent)" }} />
              <span className="max-w-[80px] truncate">{state.settings.nickname || "Anonim"}</span>
            </button>

            {/* Leaderboard */}
            <motion.button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_LEADERBOARD" })}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none transition-all"
              style={{
                background: state.showLeaderboard ? "var(--at-accent)" : "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                color: state.showLeaderboard ? "var(--at-bg)" : "var(--at-text)",
              }}
              title="Liderlik Tablosu"
              aria-label="Liderlik Tablosu"
            >
              <Trophy size={14} />
              <span className="hidden md:inline">Liderlik Tablosu</span>
            </motion.button>

            {/* Settings */}
            <motion.button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="p-2 rounded-xl focus:outline-none transition-all"
              style={{
                background: state.showSettings ? "var(--at-accent)" : "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                color: state.showSettings ? "var(--at-bg)" : "var(--at-text)",
              }}
              title="Ayarlar"
              aria-label="Ayarlar"
            >
              <Settings2 size={15} />
            </motion.button>
          </div>
        </header>

        {/* ─── Mode Selector ──────────────────────────────── */}
        <ModeSelector
          mode={state.mode}
          modeValue={state.modeValue}
          funbox={state.funbox}
          onModeChange={(m) => dispatch({ type: "SET_MODE", mode: m })}
          onModeValueChange={(v) => dispatch({ type: "SET_MODE_VALUE", value: v })}
          onFunboxChange={(fb) => dispatch({ type: "SET_FUNBOX", funbox: fb })}
          disabled={engine.phase === "running"}
        />

        {/* ─── Main Typing Liquid Glass Card ──────────────── */}
        <div
          className="relative rounded-3xl p-5 sm:p-7 transition-all duration-300"
          style={{
            background: "rgba(18, 18, 24, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4)",
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
            <div className="flex items-center justify-center py-12">
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
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
        <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Yazmaya başla veya</span>
            </span>
            <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300">
              Tab
            </kbd>
            <span>yeniden başlat</span>
          </div>

          <motion.button
            type="button"
            onClick={() => engine.resetTest()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all focus:outline-none"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--at-muted)",
            }}
            title="Yeniden Başlat (Tab)"
          >
            <RotateCcw size={13} />
            <span>Sıfırla</span>
          </motion.button>
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
        onClose={() => dispatch({ type: "TOGGLE_SETTINGS" })}
        settings={state.settings}
        onChange={handleSettingsChange}
        currentThemeName={state.themeName}
        onThemeChange={(name) => dispatch({ type: "SET_THEME", name })}
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
