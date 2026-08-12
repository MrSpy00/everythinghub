"use client";

/**
 * HubSense — Shape Game Component
 * Multi-control shape reconstruction: type, scale, rotation, position
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
import { RotateCw, ZoomIn, Move } from "lucide-react";

interface ShapeGameProps {
  target: ShapeParams;
  onSubmit: (result: ShapeScoreResult) => void;
}

const SHAPE_TYPES: { type: ShapeType; label: string }[] = [
  { type: "circle", label: "Daire" },
  { type: "triangle", label: "Üçgen" },
  { type: "square", label: "Kare" },
  { type: "pentagon", label: "Beşgen" },
  { type: "hexagon", label: "Altıgen" },
  { type: "star", label: "Yıldız" },
];

export function ShapeGame({ target, onSubmit }: ShapeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<ShapeParams>({
    type: "circle",
    x: 0.5,
    y: 0.5,
    scale: 0.8,
    rotation: 0,
  });
  const [isDraggingPos, setIsDraggingPos] = useState(false);

  // Draw the current guess on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const S = canvas.width;
    ctx.clearRect(0, 0, S, S);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
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

    drawShape(ctx, params, S);
  }, [params]);

  const handleCanvasPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
    const y = Math.max(0.05, Math.min(0.95, (clientY - rect.top) / rect.height));
    setParams((p) => ({ ...p, x, y }));
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      {/* Shape Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {SHAPE_TYPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setParams((p) => ({ ...p, type }))}
            className={`py-2.5 rounded-xl text-sm font-medium transition-all border
              ${params.type === type
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Canvas — position control */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full rounded-xl cursor-crosshair touch-none"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseDown={(e) => {
            setIsDraggingPos(true);
            handleCanvasPos(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => isDraggingPos && handleCanvasPos(e.clientX, e.clientY)}
          onMouseUp={() => setIsDraggingPos(false)}
          onMouseLeave={() => setIsDraggingPos(false)}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDraggingPos(true);
            handleCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (isDraggingPos) handleCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={() => setIsDraggingPos(false)}
        />
        <div className="absolute bottom-2 right-2 text-xs text-white/20 flex items-center gap-1">
          <Move className="w-3 h-3" />
          <span>Tıkla/sürükle: pozisyon</span>
        </div>
      </div>

      {/* Scale Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Boyut</span>
          </div>
          <span className="text-xs text-white/70 font-mono">{(params.scale * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min={0.3} max={1.5} step={0.01}
          value={params.scale}
          onChange={(e) => setParams((p) => ({ ...p, scale: parseFloat(e.target.value) }))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #6366f1 ${((params.scale - 0.3) / 1.2) * 100}%, rgba(255,255,255,0.1) ${((params.scale - 0.3) / 1.2) * 100}%)`,
          }}
        />
      </div>

      {/* Rotation Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Döndürme</span>
          </div>
          <span className="text-xs text-white/70 font-mono">{Math.round(params.rotation)}°</span>
        </div>
        <input
          type="range" min={0} max={360} step={1}
          value={params.rotation}
          onChange={(e) => setParams((p) => ({ ...p, rotation: parseFloat(e.target.value) }))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8b5cf6 ${(params.rotation / 360) * 100}%, rgba(255,255,255,0.1) ${(params.rotation / 360) * 100}%)`,
          }}
        />
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onSubmit(scoreShape(target, params))}
        className="w-full py-4 rounded-2xl font-bold text-base tracking-wide
          bg-white/[0.06] border border-white/10 text-white
          hover:bg-white/[0.10] hover:border-white/20 transition-all"
      >
        Bu şekli seç
      </motion.button>
    </div>
  );
}

// ─── Shape Display (Stimulus) ─────────────────────────────────────────────────
interface ShapeDisplayProps {
  shape: ShapeParams;
  onHide: () => void;
  durationMs: number;
}

export function ShapeDisplay({ shape, onHide, durationMs }: ShapeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShape(ctx, { ...shape, color: "#ffffff" }, canvas.width);

    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [shape, durationMs, onHide]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090b]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-white/30 text-sm mb-8">Bu şekli hatırla</div>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)" }}
      />
      <div className="mt-6 h-1 w-32 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-indigo-400/60 rounded-full"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: durationMs / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
