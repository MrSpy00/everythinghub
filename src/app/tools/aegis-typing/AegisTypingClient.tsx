"use client";
// ============================================================
// aegisTyping — Main Client Orchestrator
// Root 'use client' component — orchestrates all engine hooks
// and sub-components. No external state manager (pure React).
// ============================================================
import React, {
  useEffect,
  useCallback,
  useRef,
  useReducer,
  useMemo,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Settings2,
  Trophy,
  RotateCcw,
  Zap,
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
import { DEFAULT_SETTINGS } from "./types";

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
import { FunboxSelector } from "./components/FunboxSelector";
import { FinishEffect } from "./components/FinishEffect";
import { applyTheme } from "./components/themes";
import { getSpeedTier } from "./types";

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
  showFunbox: boolean;
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
  | { type: "TOGGLE_FUNBOX" }
  | { type: "WORDLIST_LOADED"; data: WordListData | null }
  | { type: "TEST_COMPLETE"; result: TestResult; isNewRecord: boolean; prevBest: number }
  | { type: "CLEAR_RESULT" }
  | { type: "SET_LESSON"; id: string }
  | { type: "UPDATE_HISTORY"; history: TestResult[] }
  | { type: "SET_PRESSED_KEY"; key: string }
  | { type: "UPDATE_ERROR_MAP"; key: string };

function getDefaultModeValue(mode: TestMode): number | string {
  switch (mode) {
    case "time": return 60;
    case "words": return 25;
    case "quote": return "medium";
    case "zen": return "zen";
    case "code": return "js";
    case "learn": return "homerow";
    case "challenge": return "none";
    default: return "";
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
      return { ...state, language: action.language, testResult: null, wordListData: null, wordListLoading: true };
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
    case "TOGGLE_FUNBOX":
      return { ...state, showFunbox: !state.showFunbox };
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
    showFunbox: false,
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

  // ─── Load wordlist when language or code mode changes ───────────────────
  useEffect(() => {
    let cancelled = false;
    const locale =
      state.mode === "code"
        ? `code-${state.modeValue || "js"}`
        : state.language;

    async function load() {
      dispatch({ type: "WORDLIST_LOADED", data: null });
      try {
        const mod = await import(
          `./data/wordlists/${locale}.json`
        );
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
    return () => { cancelled = true; };
  }, [state.language, state.mode, state.modeValue]);

  // ─── Apply theme on change ─────────────────────────────────
  useEffect(() => {
    applyTheme(state.themeName);
  }, [state.themeName]);

  // ─── Sync audio engine settings ───────────────────────────
  useEffect(() => {
    audioEngine.setSoundPack(state.settings.soundPack);
    audioEngine.setVolume(state.settings.volume);
    audioEngine.setSoundOnError(state.settings.soundOnError);
  }, [state.settings.soundPack, state.settings.volume, state.settings.soundOnError, audioEngine]);

  // ─── Load history ──────────────────────────────────────────
  useEffect(() => {
    const history = storage.loadHistory();
    dispatch({ type: "UPDATE_HISTORY", history });
  }, []); // eslint-disable-line

  // ─── Test complete callback ────────────────────────────────
  const handleTestComplete = useCallback(
    (result: TestResult) => {
      const { isNewRecord, prevBest } = storage.checkAndSaveHighScore(result);
      storage.saveResult(result);

      dispatch({ type: "TEST_COMPLETE", result, isNewRecord, prevBest });
      dispatch({ type: "UPDATE_HISTORY", history: storage.loadHistory() });

      // Post to global leaderboard if not suspicious
      if (!result.antiCheat.suspicious) {
        fetch("/api/aegis-typing/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wpm: result.wpm,
            rawWpm: result.rawWpm,
            accuracy: result.accuracy,
            consistency: result.consistency,
            mode: result.mode,
            modeValue: result.modeValue,
            language: result.language,
            nickname: state.settings.nickname,
            hash: result.hash,
            timestamp: result.timestamp,
          }),
        }).catch(() => {}); // Fire and forget
      }
    },
    [storage, state.settings]
  );

  // ─── Typing engine ─────────────────────────────────────────
  const engine = useTypingEngine({
    mode: state.mode,
    modeValue: state.modeValue,
    language: state.language,
    funbox: state.funbox,
    settings: state.settings,
    wordListData: state.wordListData,
    lessonId: state.mode === "learn" ? state.currentLesson : undefined,
    customText:
      state.mode === "custom" && typeof state.modeValue === "string"
        ? state.modeValue
        : undefined,
    onTestComplete: handleTestComplete,
  });

  // ─── Tab / Enter key: restart ──────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (state.testResult && (e.key === "Tab" || e.key === "Enter")) {
        e.preventDefault();
        dispatch({ type: "CLEAR_RESULT" });
        engine.resetTest();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && state.showSettings) {
        dispatch({ type: "TOGGLE_SETTINGS" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.testResult, state.showSettings, engine]);

  // ─── Visual keyboard pressed key tracking ──────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state.settings.showKeyboardOverlay) {
        dispatch({ type: "SET_PRESSED_KEY", key: e.key });
        if (pressedKeyTimeoutRef.current) {
          clearTimeout(pressedKeyTimeoutRef.current);
        }
        pressedKeyTimeoutRef.current = setTimeout(() => {
          dispatch({ type: "SET_PRESSED_KEY", key: "" });
        }, 150);
      }
      engine.handleKeyDown(e);
    },
    [engine, state.settings.showKeyboardOverlay]
  );

  // ─── Settings change ───────────────────────────────────────
  const handleSettingsChange = useCallback(
    (newSettings: AegisTypingSettings) => {
      dispatch({ type: "SET_SETTINGS", settings: newSettings });
      storage.saveSettings(newSettings);
    },
    [storage]
  );

  // ─── Theme change ──────────────────────────────────────────
  const handleThemeChange = useCallback((name: ThemeName) => {
    dispatch({ type: "SET_THEME", name });
    handleSettingsChange({ ...state.settings, theme: name });
  }, [state.settings, handleSettingsChange]);

  // ─── Restart ───────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    dispatch({ type: "CLEAR_RESULT" });
    engine.resetTest();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [engine]);

  // ─── New test ──────────────────────────────────────────────
  const handleNewTest = useCallback(() => {
    dispatch({ type: "CLEAR_RESULT" });
    engine.resetTest();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [engine]);

  const speedTier = state.testResult
    ? getSpeedTier(state.testResult.wpm)
    : "beginner";

  const isRtl = state.wordListData?.rtl ?? false;

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: "var(--at-bg, #09090b)",
        color: "var(--at-text, #fafafa)",
      }}
    >
      {/* CSS Variables base */}
      <style>{`
        :root {
          --at-bg: #09090b;
          --at-surface: #131316;
          --at-border: #27272a;
          --at-text: #fafafa;
          --at-muted: #71717a;
          --at-correct: #22c55e;
          --at-error: #ef4444;
          --at-pending: #71717a;
          --at-caret: #22d3ee;
          --at-highlight: rgba(34,211,238,0.08);
          --at-accent: #22d3ee;
        }
      `}</style>

      <div className="w-full max-w-3xl px-4 py-6 space-y-6">
        {/* ─── Header ─────────────────────────────────────── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--at-accent)", boxShadow: "0 0 12px var(--at-accent)" }}
            >
              <Zap size={14} style={{ color: "var(--at-bg)" }} />
            </div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: "var(--at-text)" }}>
              aegisTyping
            </h1>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <LanguageSelector
              language={state.language}
              onChange={(lang) => dispatch({ type: "SET_LANGUAGE", language: lang })}
              disabled={engine.phase === "running"}
            />

            {/* Leaderboard */}
            <motion.button
              onClick={() => dispatch({ type: "TOGGLE_LEADERBOARD" })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl focus:outline-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--at-muted)",
              }}
              aria-label="Liderboard"
            >
              <Trophy size={15} />
            </motion.button>

            {/* Settings */}
            <motion.button
              onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl focus:outline-none transition-colors"
              style={{
                background: state.showSettings
                  ? "var(--at-accent)"
                  : "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: state.showSettings ? "var(--at-bg)" : "var(--at-muted)",
              }}
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
          onModeChange={(m) => dispatch({ type: "SET_MODE", mode: m })}
          onModeValueChange={(v) => dispatch({ type: "SET_MODE_VALUE", value: v })}
          disabled={engine.phase === "running"}
        />

        {/* ─── Funbox Quick Toggle ─────────────────────────── */}
        {state.funbox !== "none" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2"
          >
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              {state.funbox}
            </span>
            <button
              onClick={() => dispatch({ type: "SET_FUNBOX", funbox: "none" })}
              className="text-xs focus:outline-none"
              style={{ color: "var(--at-muted)" }}
            >
              Kaldır
            </button>
          </motion.div>
        )}

        {/* ─── Main Typing Area ────────────────────────────── */}
        <div
          className="relative rounded-3xl p-5 sm:p-7"
          style={{
            background: "var(--at-surface)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
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
              onFocus={() => {}}
              onBlur={() => {}}
              inputRef={inputRef as React.RefObject<HTMLInputElement>}
            />
          )}

          {/* Keyboard overlay */}
          {state.settings.showKeyboardOverlay && (
            <KeyboardOverlay
              show={state.settings.showKeyboardOverlay}
              pressedKey={state.pressedKey}
              errorMap={state.errorMap}
              layout={state.settings.keyboardLayout}
            />
          )}
        </div>

        {/* ─── Bottom Actions ──────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Funbox toggle */}
            <motion.button
              onClick={() => dispatch({ type: "TOGGLE_FUNBOX" })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none transition-colors"
              style={{
                background: state.showFunbox ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "var(--at-muted)",
              }}
            >
              <Zap size={12} />
              Zorluk Modları
            </motion.button>
          </div>

          {/* Restart button */}
          {engine.phase !== "idle" && (
            <motion.button
              onClick={handleRestart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--at-muted)",
              }}
              title="Yeniden başlat (Tab)"
            >
              <RotateCcw size={12} />
              Yeniden Başlat
            </motion.button>
          )}
        </div>

        {/* ─── Funbox Selector (expandable) ───────────────── */}
        <AnimatePresence>
          {state.showFunbox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--at-surface)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--at-text)" }}>
                  Zorluk Modu Seç
                </h2>
                <FunboxSelector
                  value={state.funbox}
                  onChange={(f) => {
                    dispatch({ type: "SET_FUNBOX", funbox: f });
                    dispatch({ type: "TOGGLE_FUNBOX" });
                  }}
                  disabled={engine.phase === "running"}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Info footer ─────────────────────────────────── */}
        <p className="text-center text-xs" style={{ color: "var(--at-muted)" }}>
          Herhangi bir tuşa basarak başla • Tab = yeniden başlat • 16+ dil, 8+ mod
        </p>
      </div>

      {/* ─── Overlays ─────────────────────────────────────── */}
      {/* Result Panel */}
      <AnimatePresence>
        {state.testResult && (
          <ResultPanel
            result={state.testResult}
            isNewRecord={state.isNewRecord}
            prevBest={state.prevBest}
            localHistory={state.localHistory}
            onRestart={handleRestart}
            onNewTest={handleNewTest}
            shareEngine={{
              generateShareUrl: shareEngine.generateShareUrl,
              downloadResultPng: shareEngine.downloadResultPng,
              shareNative: shareEngine.shareNative,
            }}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <SettingsPanel
        open={state.showSettings}
        onClose={() => dispatch({ type: "TOGGLE_SETTINGS" })}
        settings={state.settings}
        onChange={handleSettingsChange}
        currentThemeName={state.themeName}
        onThemeChange={handleThemeChange}
      />

      {/* Leaderboard Panel */}
      <LeaderboardPanel
        open={state.showLeaderboard}
        onClose={() => dispatch({ type: "TOGGLE_LEADERBOARD" })}
        localHistory={state.localHistory}
        currentMode={state.mode}
        currentLanguage={state.language}
        nickname={state.settings.nickname}
      />

      {/* Finish Effect */}
      {state.testResult && state.settings.finishConfetti && (
        <FinishEffect
          active={!!state.testResult}
          speedTier={speedTier}
          wpm={Math.round(state.testResult.wpm)}
          reducedMotion={state.settings.reducedMotion}
        />
      )}
    </div>
  );
}
