"use client";

/**
 * HubSense — Color Game Component (Dialed.gg Inspired Studio Edition)
 * 3-Channel Precision Controller: Hue spectrum, Saturation gradient, Brightness gradient.
 * 100% GPU-accelerated CSS rendering, 60fps instant drag, touch gestures & fine steppers.
 * Interactive Click-to-Copy HEX Badge, Perfect Symmetric Layout, and Context-Aware Cursors.
 */

import React, { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  hsbToHex,
  hsbToRgb,
  scoreColor,
  simulateColorBlindness,
  type ColorScoreResult,
  type ColorBlindType,
} from "../games/colorScoring";
import { SoundFX } from "../games/soundEffects";
import { Eye, Check, ChevronUp, ChevronDown, Sparkles, Copy } from "lucide-react";
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
}

export function ColorGame({
  targetColor,
  onSubmit,
  colorBlindMode,
  onColorBlindToggle,
  roundNumber = 1,
  totalRounds = 5,
}: ColorGameProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const [hue, setHue] = useState(180);
  const [sat, setSat] = useState(50);
  const [bright, setBright] = useState(50);
  const [copiedHex, setCopiedHex] = useState(false);

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

  return (
    <div
      className="hubsense-game-arena relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/20 select-none flex transition-colors duration-150 ease-out"
      style={{ background: displayHex }}
    >
      {/* ─── LEFT PANEL: 3 Symmetrical Vertical Sliders (Grid Layout) ─── */}
      <div className="hubsense-slider-area relative z-10 w-32 sm:w-40 h-full bg-black/40 backdrop-blur-2xl border-r border-white/15 p-3 grid grid-cols-3 gap-2 sm:gap-2.5 items-stretch shadow-2xl">
        {/* 1. HUE SLIDER COLUMN */}
        <div className="flex flex-col items-center justify-between h-full">
          <button
            onClick={() => setHue((h) => (h - 5 + 360) % 360)}
            className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mb-1 transition-transform"
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
            onClick={() => setHue((h) => (h + 5) % 360)}
            className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mt-1 transition-transform"
            title={t.color.hueInc}
            data-cursor={t.color.hueInc}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="text-[10px] font-mono font-bold text-white/90 mt-1">
            {hue}°
          </div>
          <div className="text-[9px] uppercase font-bold text-white/50">{t.color.hue}</div>
        </div>

        {/* 2. SATURATION SLIDER COLUMN */}
        <div className="flex flex-col items-center justify-between h-full">
          <button
            onClick={() => setSat((s) => Math.min(100, s + 5))}
            className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mb-1 transition-transform"
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
            onClick={() => setSat((s) => Math.max(0, s - 5))}
            className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mt-1 transition-transform"
            title={t.color.satDec}
            data-cursor={t.color.satDec}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="text-[10px] font-mono font-bold text-white/90 mt-1">
            %{sat}
          </div>
          <div className="text-[9px] uppercase font-bold text-white/50">{t.color.saturation}</div>
        </div>

        {/* 3. BRIGHTNESS SLIDER COLUMN */}
        <div className="flex flex-col items-center justify-between h-full">
          <button
            onClick={() => setBright((b) => Math.min(100, b + 5))}
            className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mb-1 transition-transform"
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
            onClick={() => setBright((b) => Math.max(0, b - 5))}
            className="w-full h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 flex items-center justify-center text-xs mt-1 transition-transform"
            title={t.color.brightDec}
            data-cursor={t.color.brightDec}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="text-[10px] font-mono font-bold text-white/90 mt-1">
            %{bright}
          </div>
          <div className="text-[9px] uppercase font-bold text-white/50">{t.color.brightness}</div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Live Color Canvas & Info Bar ─── */}
      <div className="relative flex-1 h-full flex flex-col justify-between p-6 sm:p-8">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between">
          <div className="px-3.5 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/15 text-xs font-bold text-white font-mono tracking-wider shadow-lg">
            {roundNumber} / {totalRounds}
          </div>

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

        {/* Center Subtitle or Prompt */}
        <div className="text-center my-auto pointer-events-none">
          <div className="inline-block px-5 py-2 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 text-white/90 text-xs sm:text-sm font-medium shadow-xl">
            {t.color.instruction}
          </div>
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
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl border-2 border-white/80 hover:bg-zinc-100 transition-all group"
            style={{
              boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(255,255,255,0.4)",
            }}
            title={t.color.confirm}
          >
            <Check className="w-7 h-7 stroke-[3] text-zinc-900 group-hover:scale-110 transition-transform" />
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
      <div className="flex items-start justify-between">
        <div className="px-4 py-2 rounded-full bg-black/35 backdrop-blur-xl border border-white/15 text-sm font-bold text-white font-mono shadow-lg">
          {roundNumber} / {totalRounds}
        </div>

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
