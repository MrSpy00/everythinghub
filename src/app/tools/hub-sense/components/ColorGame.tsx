"use client";

/**
 * HubSense — Color Game Component
 * HSB 2D color picker with CIELAB Delta-E scoring
 */

import React, { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { hsbToHex, scoreColor, type ColorScoreResult, type ColorBlindType } from "../games/colorScoring";
import { Eye, EyeOff } from "lucide-react";

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
  showResult?: boolean;
}

export function ColorGame({
  targetColor,
  onSubmit,
  colorBlindMode,
  onColorBlindToggle,
}: ColorGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(180);
  const [sat, setSat] = useState(50);
  const [bright, setBright] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isHueDragging, setIsHueDragging] = useState(false);

  const currentHex = hsbToHex(hue, sat, bright);

  // Draw 2D SB (Saturation-Brightness) picker canvas
  const drawPicker = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    // White → color gradient (horizontal, saturation)
    const colorGrad = ctx.createLinearGradient(0, 0, W, 0);
    colorGrad.addColorStop(0, "white");
    colorGrad.addColorStop(1, hsbToHex(hue, 100, 100));
    ctx.fillStyle = colorGrad;
    ctx.fillRect(0, 0, W, H);

    // Transparent → black gradient (vertical, brightness)
    const blackGrad = ctx.createLinearGradient(0, 0, 0, H);
    blackGrad.addColorStop(0, "transparent");
    blackGrad.addColorStop(1, "black");
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, W, H);
  }, [hue]);

  useEffect(() => {
    drawPicker();
  }, [drawPicker]);

  // Handle canvas interaction
  const handleCanvasEvent = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(canvas.width, ((clientX - rect.left) / rect.width) * canvas.width));
      const y = Math.max(0, Math.min(canvas.height, ((clientY - rect.top) / rect.height) * canvas.height));

      const newSat = Math.round((x / canvas.width) * 100);
      const newBright = Math.round(100 - (y / canvas.height) * 100);
      setSat(newSat);
      setBright(newBright);
    },
    []
  );

  // Marker position on canvas
  const markerX = `${sat}%`;
  const markerY = `${100 - bright}%`;

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto select-none">
      {/* Color Preview */}
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        style={{ height: 80, background: currentHex }}
        animate={{ background: currentHex }}
        transition={{ duration: 0.1 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/60 text-sm font-mono font-bold tracking-widest mix-blend-difference">
            {currentHex.toUpperCase()}
          </span>
        </div>
      </motion.div>

      {/* 2D SB Picker */}
      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={(e) => {
            setIsDragging(true);
            handleCanvasEvent(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            if (isDragging) handleCanvasEvent(e.clientX, e.clientY);
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
            handleCanvasEvent(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (isDragging) handleCanvasEvent(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={() => setIsDragging(false)}
        />

        {/* Crosshair marker */}
        <div
          className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: markerX, top: markerY }}
        >
          <div className="w-full h-full rounded-full border-2 border-white shadow-lg"
            style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.5)" }} />
        </div>
      </div>

      {/* Hue Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50 font-mono">Ton (Hue)</span>
          <span className="text-xs text-white/70 font-mono">{Math.round(hue)}°</span>
        </div>
        <div
          className="relative h-5 rounded-full overflow-hidden cursor-pointer"
          style={{
            background:
              "linear-gradient(to right, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff0000)",
          }}
          onMouseDown={(e) => {
            setIsHueDragging(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setHue(Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)));
          }}
          onMouseMove={(e) => {
            if (!isHueDragging) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setHue(Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)));
          }}
          onMouseUp={() => setIsHueDragging(false)}
          onMouseLeave={() => setIsHueDragging(false)}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsHueDragging(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setHue(Math.max(0, Math.min(360, ((e.touches[0].clientX - rect.left) / rect.width) * 360)));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (!isHueDragging) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setHue(Math.max(0, Math.min(360, ((e.touches[0].clientX - rect.left) / rect.width) * 360)));
          }}
          onTouchEnd={() => setIsHueDragging(false)}
        >
          {/* Thumb */}
          <div
            className="absolute top-0 w-5 h-5 -translate-x-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
            style={{
              left: `${(hue / 360) * 100}%`,
              background: hsbToHex(hue, 100, 100),
              boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      </div>

      {/* Color-blindness toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            onColorBlindToggle(colorBlindMode === "none" ? "deuteranopia" : "none")
          }
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          {colorBlindMode !== "none" ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
          {colorBlindMode !== "none" ? "Renk körlüğü modu: Açık" : "Renk körlüğü modu"}
        </button>
        {colorBlindMode !== "none" && (
          <select
            className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white/70"
            value={colorBlindMode}
            onChange={(e) => onColorBlindToggle(e.target.value as ColorBlindType)}
          >
            <option value="protanopia">Protanopia (Kırmızı-Yeşil)</option>
            <option value="deuteranopia">Deuteranopia (Yeşil-Kırmızı)</option>
            <option value="tritanopia">Tritanopia (Mavi-Sarı)</option>
          </select>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          const result = scoreColor(
            targetColor.h, targetColor.s, targetColor.b,
            hue, sat, bright
          );
          onSubmit(result);
        }}
        className="w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all
          bg-white/[0.06] border border-white/10 text-white backdrop-blur-xl
          hover:bg-white/[0.1] hover:border-white/20 active:scale-95"
        style={{
          boxShadow: `0 0 20px ${currentHex}33`,
          borderColor: `${currentHex}44`,
        }}
      >
        Bu rengi seç
      </motion.button>
    </div>
  );
}

// ─── Color Display (Stimulus) ─────────────────────────────────────────────────
interface ColorDisplayProps {
  h: number;
  s: number;
  b: number;
  onHide: () => void;
  revealDurationMs: number;
  colorBlindMode?: ColorBlindType;
}

export function ColorDisplay({
  h, s, b, onHide, revealDurationMs
}: ColorDisplayProps) {
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = elapsed / revealDurationMs;
      if (p >= 1) {
        clearInterval(interval);
        onHide();
      }
    }, 16);
    return () => clearInterval(interval);
  }, [revealDurationMs, onHide]);

  const hex = hsbToHex(h, s, b);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: hex }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
        <motion.div
          className="h-full bg-white/40"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: revealDurationMs / 1000, ease: "linear" }}
        />
      </div>

      <div className="text-center mix-blend-difference text-white/0 hover:text-white/20 transition-colors">
        <p className="text-lg font-mono">Hatırla...</p>
      </div>
    </motion.div>
  );
}
