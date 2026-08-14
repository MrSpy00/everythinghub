"use client";
// ============================================================
// aegisTyping — Finish Effect (Celebratory Confetti)
// Pure Canvas confetti with automatic fade out, zero blocking UI
// ============================================================
import { useEffect, useRef } from "react";
import type { SpeedTier } from "../types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  spin: number;
  spinSpeed: number;
  shape: "rect" | "circle";
}

const CONFETTI_COLORS = [
  "#22d3ee",
  "#818cf8",
  "#f472b6",
  "#4ade80",
  "#fbbf24",
  "#a78bfa",
  "#34d399",
  "#60a5fa",
];

function createParticle(canvas: HTMLCanvasElement): Particle {
  return {
    x: Math.random() * canvas.width,
    y: -10,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    r: Math.random() * 6 + 3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    alpha: 1,
    spin: Math.random() * Math.PI * 2,
    spinSpeed: (Math.random() - 0.5) * 0.2,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  };
}

interface FinishEffectProps {
  active: boolean;
  speedTier: SpeedTier;
  wpm: number;
  reducedMotion?: boolean;
  onDone?: () => void;
}

export function FinishEffect({
  active,
  reducedMotion = false,
  onDone,
}: FinishEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active || reducedMotion) {
      if (onDone) setTimeout(onDone, 100);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particlesRef.current = [];
    let spawnCount = 0;
    let done = false;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn celebratory particles for first 1.5 seconds
      if (spawnCount < 120) {
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push(createParticle(canvas));
        }
        spawnCount += 4;
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.01);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.vy += 0.09; // gravity
        p.y += p.vy;
        p.vx *= 0.99;
        p.spin += p.spinSpeed;
        if (p.y > canvas.height * 0.6) {
          p.alpha -= 0.025;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (!done || particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onDone) onDone();
      }

      if (spawnCount >= 120 && particlesRef.current.length === 0) {
        done = true;
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      ctx.clearRect(0, 0, canvas.width || 0, canvas.height || 0);
    };
  }, [active, reducedMotion, onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ display: active && !reducedMotion ? "block" : "none" }}
    />
  );
}
