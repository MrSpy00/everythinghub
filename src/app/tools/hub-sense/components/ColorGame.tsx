"use client";

/**
 * HubSense — Color Game Component (Dialed.gg Inspired Studio Edition)
 * 3-Channel Precision Controller: Hue spectrum, Saturation gradient, Brightness gradient.
 * 100% GPU-accelerated CSS rendering, 60fps instant drag, touch gestures & fine steppers.
 * Interactive Click-to-Copy HEX Badge, Perfect Symmetric Layout, and Context-Aware Cursors.
 */

import React, { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  hsbToHex,
  hsbToRgb,
  scoreColor,
  simulateColorBlindness,
  type ColorScoreResult,
  type ColorBlindType,
} from "../games/colorScoring";
import { SoundFX } from "../games/soundEffects";
import { Eye, Check, ChevronUp, ChevronDown, Sparkles, Copy, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";
import { toast } from "sonner";

interface ColorRound {
  h: number; // 0-360
  s: number; // 0-100
  b: number; // 0-100
}

interface ColorGameProps {
  targetColor: ColorRound;
  onSubmit: (result: ColorScoreResult) => void;
  difficulty?: "easy" | "hard" | "brutal";
  colorBlindMode: ColorBlindType;
  onColorBlindToggle: (mode: ColorBlindType) => void;
  roundNumber?: number;
  totalRounds?: number;
  roundTimerSeconds?: number;
}

export function ColorGame({
  targetColor,
  onSubmit,
  colorBlindMode,
  onColorBlindToggle,
  roundNumber = 1,
  totalRounds = 5,
  roundTimerSeconds = 0,
}: ColorGameProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [hue, setHue] = useState(180);
  const [sat, setSat] = useState(50);
  const [bright, setBright] = useState(50);
  const [copiedHex, setCopiedHex] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);

  // Per-Round Countdown Timer
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    roundTimerSeconds && roundTimerSeconds > 0 ? roundTimerSeconds : null
  );

  useEffect(() => {
    if (!roundTimerSeconds || roundTimerSeconds <= 0) {
      setSecondsLeft(null);
      return;
    }
    setSecondsLeft(roundTimerSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundNumber, roundTimerSeconds]);

  // Press-and-Hold Stepper Logic
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopHoldStep = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdTimerRef.current = null;
    holdIntervalRef.current = null;
  }, []);

  const startHoldStep = useCallback(
    (e: React.PointerEvent, action: () => void) => {
      e.preventDefault();
      stopHoldStep();
      action();
      holdTimerRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(() => {
          action();
        }, 70);
      }, 250);
    },
    [stopHoldStep]
  );

  // Instruction banner auto-dissolve after 2.2s
  useEffect(() => {
    setShowInstruction(true);
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [roundNumber]);

  const hueTrackRef = useRef<HTMLDivElement>(null);
  const satTrackRef = useRef<HTMLDivElement>(null);
  const brightTrackRef = useRef<HTMLDivElement>(null);

  const [activeDrag, setActiveDrag] = useState<"hue" | "sat" | "bright" | null>(null);

  // Compute live colors
  const rawHex = hsbToHex(hue, sat, bright);
  const [r, g, b] = hsbToRgb(hue, sat, bright);
  const displayRgb =
    colorBlindMode !== "none"
      ? simulateColorBlindness(r, g, b, colorBlindMode)
      : [r, g, b];
  const displayHex =
    colorBlindMode !== "none"
      ? `#${displayRgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`
      : rawHex;

  // Gradients for channel sliders
  const satTopHex = hsbToHex(hue, 100, bright);
  const satBottomHex = hsbToHex(hue, 0, bright);
  const brightTopHex = hsbToHex(hue, sat, 100);
  const brightBottomHex = "#000000";

  // Drag Math Handlers
  const handleHueMove = useCallback((clientY: number) => {
    if (!hueTrackRef.current) return;
    const rect = hueTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const newHue = Math.round(ratio * 360);
    setHue(newHue);
  }, []);

  const handleSatMove = useCallback((clientY: number) => {
    if (!satTrackRef.current) return;
    const rect = satTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const newSat = Math.round((1 - ratio) * 100);
    setSat(newSat);
  }, []);

  const handleBrightMove = useCallback((clientY: number) => {
    if (!brightTrackRef.current) return;
    const rect = brightTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const newBright = Math.round((1 - ratio) * 100);
    setBright(newBright);
  }, []);

  // Global Pointer Listeners for smooth continuous drag
  useEffect(() => {
    if (!activeDrag) return;

    const onPointerMove = (e: PointerEvent) => {
      if (activeDrag === "hue") handleHueMove(e.clientY);
      else if (activeDrag === "sat") handleSatMove(e.clientY);
      else if (activeDrag === "bright") handleBrightMove(e.clientY);
    };

    const onPointerUp = () => {
      setActiveDrag(null);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [activeDrag, handleHueMove, handleSatMove, handleBrightMove]);

  const handleCopyHex = async () => {
    SoundFX.click();
    await navigator.clipboard.writeText(rawHex.toUpperCase());
    setCopiedHex(true);
    toast.success(`${rawHex.toUpperCase()} ${lang === "tr" ? "kopyalandı!" : "copied!"}`);
    setTimeout(() => setCopiedHex(false), 1500);
  };

  const handleSubmit = useCallback(() => {
    SoundFX.click();
    const result = scoreColor(
      targetColor.h,
      targetColor.s,
      targetColor.b,
      hue,
      sat,
      bright
    );
    onSubmit(result);
  }, [targetColor, hue, sat, bright, onSubmit]);

  // Auto-submit when time expires
  useEffect(() => {
    if (secondsLeft === 0) {
      SoundFX.failRound();
      toast.warning(t.timeUpToast);
      handleSubmit();
    }
  }, [secondsLeft, handleSubmit, t.timeUpToast]);

  return (
    <div
      className="hubsense-game-arena relative w-full flex flex-col sm:flex-row h-auto min-h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/20 select-none transition-colors duration-150 ease-out"
      style={{ background: displayHex }}
    >
      {/* ─── SLIDER PANEL: Desktop Vertical 3-Cols / Mobile Horizontal Rows ─── */}
      <div className="hubsense-slider-area relative z-10 w-full sm:w-48 lg:w-56 h-auto sm:h-full bg-black/50 backdrop-blur-2xl border-t sm:border-t-0 sm:border-r border-white/15 p-3 sm:p-3.5 flex flex-col justify-center order-2 sm:order-1 shadow-2xl">
        
        {/* DESKTOP VIEW: 3 Symmetrical Vertical Sliders */}
        <div className="hidden sm:grid grid-cols-3 gap-2 sm:gap-2.5 items-stretch h-full w-full">
          {/* 1. HUE SLIDER COLUMN */}
          <div className="flex flex-col items-center justify-between h-full">
            <button
              onPointerDown={(e) => startHoldStep(e, () => setHue((h) => (h - 1 + 360) % 360))}
              onPointerUp={stopHoldStep}
              onPointerLeave={stopHoldStep}
              onPointerCancel={stopHoldStep}
              className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mb-1 transition-transform cursor-pointer"
              title={t.color.hueDec}
              data-cursor={t.color.hueDec}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            <div
              ref={hueTrackRef}
              data-cursor={`${t.color.hue} · ${hue}°`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setActiveDrag("hue");
                handleHueMove(e.clientY);
              }}
              className="relative flex-1 w-full rounded-2xl cursor-ns-resize touch-none shadow-inner"
              style={{
                background:
                  "linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
              }}
            >
              {/* Draggable Puck */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-white/40 backdrop-blur-md shadow-2xl transition-transform hover:scale-110 pointer-events-none"
                style={{
                  top: `${(hue / 360) * 100}%`,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
                }}
              />
            </div>

            <button
              onPointerDown={(e) => startHoldStep(e, () => setHue((h) => (h + 1) % 360))}
              onPointerUp={stopHoldStep}
              onPointerLeave={stopHoldStep}
              onPointerCancel={stopHoldStep}
              className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mt-1 transition-transform cursor-pointer"
              title={t.color.hueInc}
              data-cursor={t.color.hueInc}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <div className="text-[10px] font-mono font-bold text-white/90 mt-1">
              {hue}°
            </div>
            <div className="text-[9px] uppercase font-bold text-white/60 text-center max-w-full">{t.color.hue}</div>
          </div>

          {/* 2. SATURATION SLIDER COLUMN */}
          <div className="flex flex-col items-center justify-between h-full">
            <button
              onPointerDown={(e) => startHoldStep(e, () => setSat((s) => Math.min(100, s + 1)))}
              onPointerUp={stopHoldStep}
              onPointerLeave={stopHoldStep}
              onPointerCancel={stopHoldStep}
              className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mb-1 transition-transform cursor-pointer"
              title={t.color.satInc}
              data-cursor={t.color.satInc}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            <div
              ref={satTrackRef}
              data-cursor={`${t.color.saturation} · %${sat}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setActiveDrag("sat");
                handleSatMove(e.clientY);
              }}
              className="relative flex-1 w-full rounded-2xl cursor-ns-resize touch-none shadow-inner"
              style={{
                background: `linear-gradient(to bottom, ${satTopHex} 0%, ${satBottomHex} 100%)`,
              }}
            >
              {/* Draggable Puck */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-white/40 backdrop-blur-md shadow-2xl transition-transform hover:scale-110 pointer-events-none"
                style={{
                  top: `${(1 - sat / 100) * 100}%`,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
                }}
              />
            </div>

            <button
              onPointerDown={(e) => startHoldStep(e, () => setSat((s) => Math.max(0, s - 1)))}
              onPointerUp={stopHoldStep}
              onPointerLeave={stopHoldStep}
              onPointerCancel={stopHoldStep}
              className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mt-1 transition-transform cursor-pointer"
              title={t.color.satDec}
              data-cursor={t.color.satDec}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <div className="text-[10px] font-mono font-bold text-white/90 mt-1">
              %{sat}
            </div>
            <div className="text-[9px] uppercase font-bold text-white/60 text-center max-w-full">{t.color.saturation}</div>
          </div>

          {/* 3. BRIGHTNESS SLIDER COLUMN */}
          <div className="flex flex-col items-center justify-between h-full">
            <button
              onPointerDown={(e) => startHoldStep(e, () => setBright((b) => Math.min(100, b + 1)))}
              onPointerUp={stopHoldStep}
              onPointerLeave={stopHoldStep}
              onPointerCancel={stopHoldStep}
              className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mb-1 transition-transform cursor-pointer"
              title={t.color.brightInc}
              data-cursor={t.color.brightInc}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            <div
              ref={brightTrackRef}
              data-cursor={`${t.color.brightness} · %${bright}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setActiveDrag("bright");
                handleBrightMove(e.clientY);
              }}
              className="relative flex-1 w-full rounded-2xl cursor-ns-resize touch-none shadow-inner"
              style={{
                background: `linear-gradient(to bottom, ${brightTopHex} 0%, ${brightBottomHex} 100%)`,
              }}
            >
              {/* Draggable Puck */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-white/40 backdrop-blur-md shadow-2xl transition-transform hover:scale-110 pointer-events-none"
                style={{
                  top: `${(1 - bright / 100) * 100}%`,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
                }}
              />
            </div>

            <button
              onPointerDown={(e) => startHoldStep(e, () => setBright((b) => Math.max(0, b - 1)))}
              onPointerUp={stopHoldStep}
              onPointerLeave={stopHoldStep}
              onPointerCancel={stopHoldStep}
              className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mt-1 transition-transform cursor-pointer"
              title={t.color.brightDec}
              data-cursor={t.color.brightDec}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <div className="text-[10px] font-mono font-bold text-white/90 mt-1">
              %{bright}
            </div>
            <div className="text-[9px] uppercase font-bold text-white/60 text-center max-w-full">{t.color.brightness}</div>
          </div>
        </div>

        {/* MOBILE VIEW: 3 Horizontal Slider Control Rows */}
        <div className="flex flex-col gap-2 sm:hidden w-full">
          {/* Hue Row */}
          <div className="flex flex-col gap-1 bg-white/[0.04] p-2.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-white/70 uppercase tracking-wider">{t.color.hue}</span>
              <span className="font-mono text-white text-xs">{hue}°</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onPointerDown={(e) => startHoldStep(e, () => setHue((h) => (h - 1 + 360) % 360))}
                onPointerUp={stopHoldStep}
                onPointerLeave={stopHoldStep}
                onPointerCancel={stopHoldStep}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white shrink-0 touch-none cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={0}
                max={360}
                value={hue}
                onChange={(e) => setHue(parseInt(e.target.value, 10))}
                className="flex-1 h-3 rounded-full appearance-none cursor-pointer touch-none shadow-inner"
                style={{
                  background:
                    "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                }}
              />
              <button
                onPointerDown={(e) => startHoldStep(e, () => setHue((h) => (h + 1) % 360))}
                onPointerUp={stopHoldStep}
                onPointerLeave={stopHoldStep}
                onPointerCancel={stopHoldStep}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white shrink-0 touch-none cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Saturation Row */}
          <div className="flex flex-col gap-1 bg-white/[0.04] p-2.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-white/70 uppercase tracking-wider">{t.color.saturation}</span>
              <span className="font-mono text-white text-xs">%{sat}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onPointerDown={(e) => startHoldStep(e, () => setSat((s) => Math.max(0, s - 1)))}
                onPointerUp={stopHoldStep}
                onPointerLeave={stopHoldStep}
                onPointerCancel={stopHoldStep}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white shrink-0 touch-none cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={sat}
                onChange={(e) => setSat(parseInt(e.target.value, 10))}
                className="flex-1 h-3 rounded-full appearance-none cursor-pointer touch-none shadow-inner"
                style={{
                  background: `linear-gradient(to right, ${satBottomHex} 0%, ${satTopHex} 100%)`,
                }}
              />
              <button
                onPointerDown={(e) => startHoldStep(e, () => setSat((s) => Math.min(100, s + 1)))}
                onPointerUp={stopHoldStep}
                onPointerLeave={stopHoldStep}
                onPointerCancel={stopHoldStep}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white shrink-0 touch-none cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Brightness Row */}
          <div className="flex flex-col gap-1 bg-white/[0.04] p-2.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-white/70 uppercase tracking-wider">{t.color.brightness}</span>
              <span className="font-mono text-white text-xs">%{bright}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onPointerDown={(e) => startHoldStep(e, () => setBright((b) => Math.max(0, b - 1)))}
                onPointerUp={stopHoldStep}
                onPointerLeave={stopHoldStep}
                onPointerCancel={stopHoldStep}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white shrink-0 touch-none cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={bright}
                onChange={(e) => setBright(parseInt(e.target.value, 10))}
                className="flex-1 h-3 rounded-full appearance-none cursor-pointer touch-none shadow-inner"
                style={{
                  background: `linear-gradient(to right, ${brightBottomHex} 0%, ${brightTopHex} 100%)`,
                }}
              />
              <button
                onPointerDown={(e) => startHoldStep(e, () => setBright((b) => Math.min(100, b + 1)))}
                onPointerUp={stopHoldStep}
                onPointerLeave={stopHoldStep}
                onPointerCancel={stopHoldStep}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white shrink-0 touch-none cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ─── STAGE PANEL: Live Color Canvas & Info Bar ─── */}
      <div className="relative flex-1 w-full h-full min-h-[240px] sm:min-h-0 flex flex-col justify-between p-4 sm:p-8 order-1 sm:order-2">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Per-Round Countdown Timer Badge (Red Glowing Warning <= 10s) */}
          {secondsLeft !== null ? (
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-xl border text-xs font-mono font-extrabold shadow-lg transition-all duration-300 ${
                secondsLeft <= 10
                  ? "bg-rose-500/25 border-rose-500/60 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                  : "bg-black/35 border-white/15 text-white/90"
              }`}
            >
              <Clock className={`w-3.5 h-3.5 shrink-0 ${secondsLeft <= 10 ? "text-rose-400" : "text-indigo-300"}`} />
              <span>{secondsLeft}s</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {/* Color blind selector */}
            <button
              onClick={() => {
                const modes: ColorBlindType[] = [
                  "none",
                  "protanopia",
                  "deuteranopia",
                  "tritanopia",
                ];
                const next = modes[(modes.indexOf(colorBlindMode) + 1) % modes.length];
                onColorBlindToggle(next);
              }}
              data-cursor={t.color.colorBlindModes[colorBlindMode]}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/15 text-xs text-white/80 hover:bg-black/55 transition-colors shadow-lg"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-300" />
              <span className="capitalize text-[11px]">
                {t.color.colorBlindModes[colorBlindMode]}
              </span>
            </button>

            {/* Click-to-Copy HEX Badge */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyHex}
              data-cursor={lang === "tr" ? "HEX Kopyala" : "Copy HEX"}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/20 text-xs font-mono font-extrabold text-white hover:bg-black/55 transition-colors shadow-lg"
            >
              <span>{rawHex.toUpperCase()}</span>
              {copiedHex ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
              ) : (
                <Copy className="w-3 h-3 text-white/60" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Center Subtitle or Prompt (Fades out smoothly after 2.2s) */}
        <div className="text-center my-auto pointer-events-none py-4 min-h-[48px] flex items-center justify-center">
          <AnimatePresence>
            {showInstruction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  filter: "blur(12px)",
                  transition: { duration: 0.85, ease: "easeOut" },
                }}
                className="inline-block px-4 sm:px-5 py-2 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 text-white/90 text-xs sm:text-sm font-medium shadow-xl"
              >
                {t.color.instruction}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono text-white/60 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
            {t.watermark} · {t.disciplines.color.label}
          </div>

          {/* Floating Confirm / Submit Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSubmit}
            data-cursor={t.color.confirm}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl border-2 border-white/80 hover:bg-zinc-100 transition-all group"
            style={{
              boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(255,255,255,0.4)",
            }}
            title={t.color.confirm}
          >
            <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] text-zinc-900 group-hover:scale-110 transition-transform" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Color Display (Stimulus Reveal Phase) ────────────────────────────────────
interface ColorDisplayProps {
  h: number;
  s: number;
  b: number;
  onHide: () => void;
  revealDurationMs: number;
  colorBlindMode?: ColorBlindType;
  roundNumber?: number;
  totalRounds?: number;
}

export function ColorDisplay({
  h,
  s,
  b,
  onHide,
  revealDurationMs,
  colorBlindMode = "none",
  roundNumber = 1,
  totalRounds = 5,
}: ColorDisplayProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [timeLeft, setTimeLeft] = useState(revealDurationMs / 1000);
  const rawHex = hsbToHex(h, s, b);

  const [red, green, blue] = hsbToRgb(h, s, b);
  const displayRgb =
    colorBlindMode !== "none"
      ? simulateColorBlindness(red, green, blue, colorBlindMode)
      : [red, green, blue];
  const displayHex =
    colorBlindMode !== "none"
      ? `#${displayRgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`
      : rawHex;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (revealDurationMs - elapsed) / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onHide();
      }
    }, 16);
    return () => clearInterval(interval);
  }, [revealDurationMs, onHide]);

  return (
    <motion.div
      className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/20 flex flex-col justify-between p-6 sm:p-10 select-none transition-colors duration-150 ease-out"
      style={{ background: displayHex }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Header */}
      <div className="flex items-start justify-end w-full">
        <div className="text-right">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white drop-shadow-lg">
            {timeLeft.toFixed(2)}
          </div>
          <div className="text-xs sm:text-sm font-medium text-white/80 drop-shadow">
            {t.color.revealSubtitle}
          </div>
        </div>
      </div>

      {/* Center Prompt */}
      <div className="flex flex-col items-center justify-center my-auto">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-black/25 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl"
        >
          <Sparkles className="w-8 h-8 text-white/90" />
        </motion.div>
        <p className="text-white/90 text-sm font-bold mt-4 tracking-wide drop-shadow-md">
          {t.color.revealPrompt}
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-black/25 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.color.label}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
        <motion.div
          className="h-full bg-white"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: revealDurationMs / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
