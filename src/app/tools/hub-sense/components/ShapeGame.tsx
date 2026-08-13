"use client";

/**
 * HubSense — Shape Game Component (Studio Geometry Edition)
 * Reconstruct geometric shapes with real-time vector matrix calculations,
 * position dragging, scale tuning, rotation angle selector, and full bilingual (TR/EN) support.
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  type ShapeParams,
  type ShapeType,
  type ShapeScoreResult,
  drawShape,
  scoreShape,
} from "../games/shapeScoring";
import { SoundFX } from "../games/soundEffects";
import { RotateCw, ZoomIn, Move, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hubSenseTranslations } from "../i18n/hubSenseI18n";

interface ShapeGameProps {
  target: ShapeParams;
  onSubmit: (result: ShapeScoreResult) => void;
  roundNumber?: number;
  totalRounds?: number;
}

const ALL_SHAPE_TYPES: ShapeType[] = [
  "circle",
  "triangle",
  "square",
  "pentagon",
  "hexagon",
  "star",
];

export function ShapeGame({
  target,
  onSubmit,
  roundNumber = 1,
  totalRounds = 5,
}: ShapeGameProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<ShapeParams>({
    type: "circle",
    x: 0.5,
    y: 0.5,
    scale: 0.8,
    rotation: 0,
  });
  const [isDraggingPos, setIsDraggingPos] = useState(false);

  // Redraw shape on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const S = canvas.width;
    ctx.clearRect(0, 0, S, S);

    // Subtle alignment grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo((i * S) / 4, 0);
      ctx.lineTo((i * S) / 4, S);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (i * S) / 4);
      ctx.lineTo(S, (i * S) / 4);
      ctx.stroke();
    }

    drawShape(ctx, { ...params, color: "#f59e0b" }, S);
  }, [params]);

  const handleCanvasPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0.1, Math.min(0.9, (clientX - rect.left) / rect.width));
    const y = Math.max(0.1, Math.min(0.9, (clientY - rect.top) / rect.height));
    setParams((p) => ({ ...p, x, y }));
  }, []);

  const handleSubmit = () => {
    SoundFX.click();
    const result = scoreShape(target, params);
    onSubmit(result);
  };

  return (
    <div
      className="hubsense-game-arena relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 select-none flex flex-col justify-between p-6 sm:p-8 backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(69,26,3,0.7) 0%, rgba(9,9,11,0.85) 80%)",
      }}
      data-no-custom-cursor="true"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="px-3.5 py-1.5 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/15 text-xs sm:text-sm font-bold text-white font-mono shadow-lg whitespace-nowrap inline-flex items-center justify-center shrink-0 min-w-fit leading-none">
          {roundNumber} / {totalRounds}
        </div>

        <div className="flex gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-none">
          {ALL_SHAPE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                SoundFX.click();
                setParams((p) => ({ ...p, type }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border
                ${
                  params.type === type
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md"
                    : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80"
                }`}
            >
              {t.shape.types[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto">
        {/* Interactive Vector Canvas */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black/40">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full h-full cursor-crosshair touch-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setIsDraggingPos(true);
              handleCanvasPos(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (isDraggingPos) handleCanvasPos(e.clientX, e.clientY);
            }}
            onPointerUp={() => setIsDraggingPos(false)}
            onPointerCancel={() => setIsDraggingPos(false)}
          />
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 text-[10px] text-white/40 flex items-center gap-1 shadow">
            <Move className="w-3 h-3 text-amber-400" />
            <span>{t.shape.dragPosition}</span>
          </div>
        </div>

        {/* Sliders: Scale & Rotation */}
        <div className="flex flex-col gap-4 w-full sm:w-64">
          {/* Scale */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.shape.scaleLabel}</span>
              </div>
              <span className="font-mono text-amber-300 font-bold">
                {(params.scale * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={1.6}
              step={0.01}
              value={params.scale}
              data-cursor={`${t.shape.scaleLabel} · %${(params.scale * 100).toFixed(0)}`}
              onChange={(e) =>
                setParams((p) => ({ ...p, scale: parseFloat(e.target.value) }))
              }
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f59e0b ${((params.scale - 0.3) / 1.3) * 100}%, rgba(255,255,255,0.1) ${((params.scale - 0.3) / 1.3) * 100}%)`,
              }}
            />
          </div>

          {/* Rotation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.shape.rotationLabel}</span>
              </div>
              <span className="font-mono text-amber-300 font-bold">
                {Math.round(params.rotation)}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={params.rotation}
              data-cursor={`${t.shape.rotationLabel} · ${Math.round(params.rotation)}°`}
              onChange={(e) =>
                setParams((p) => ({ ...p, rotation: parseFloat(e.target.value) }))
              }
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f59e0b ${(params.rotation / 360) * 100}%, rgba(255,255,255,0.1) ${(params.rotation / 360) * 100}%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar & Floating Submit */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-white/[0.03] backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.shape.label}
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleSubmit}
          data-cursor={t.shape.confirm}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl border-2 border-white/80 hover:bg-zinc-100 transition-all group"
          style={{
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(245,158,11,0.4)",
          }}
          title={t.shape.confirm}
        >
          <Check className="w-7 h-7 stroke-[3] text-zinc-900 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Shape Display (Stimulus Reveal Phase) ────────────────────────────────────
interface ShapeDisplayProps {
  shape: ShapeParams;
  onHide: () => void;
  durationMs: number;
  roundNumber?: number;
  totalRounds?: number;
}

export function ShapeDisplay({
  shape,
  onHide,
  durationMs,
  roundNumber = 1,
  totalRounds = 5,
}: ShapeDisplayProps) {
  const { lang } = useLanguage();
  const t = hubSenseTranslations[lang] || hubSenseTranslations.tr;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState(durationMs / 1000);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShape(ctx, { ...shape, color: "#fbbf24" }, canvas.width);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (durationMs - elapsed) / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onHide();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [shape, durationMs, onHide]);

  return (
    <motion.div
      className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between p-6 sm:p-10 select-none backdrop-blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(69,26,3,0.8) 0%, rgba(9,9,11,0.9) 80%)",
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="px-3.5 py-1.5 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/15 text-xs sm:text-sm font-bold text-white font-mono shadow-lg whitespace-nowrap inline-flex items-center justify-center shrink-0 min-w-fit leading-none">
          {roundNumber} / {totalRounds}
        </div>

        <div className="text-right">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white drop-shadow-lg">
            {timeLeft.toFixed(2)}
          </div>
          <div className="text-xs sm:text-sm font-medium text-amber-300">
            {t.shape.revealSubtitle}
          </div>
        </div>
      </div>

      {/* Center Shape Canvas */}
      <div className="flex flex-col items-center justify-center my-auto">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl border border-white/10 bg-black/40 shadow-2xl"
        />
        <p className="text-amber-300 text-sm font-bold mt-4 tracking-wide drop-shadow">
          {t.shape.revealPrompt}
        </p>
      </div>

      {/* Bottom Progress */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/60 bg-white/[0.03] backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
          {t.watermark} · {t.disciplines.shape.label}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
        <motion.div
          className="h-full bg-amber-400"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: durationMs / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
