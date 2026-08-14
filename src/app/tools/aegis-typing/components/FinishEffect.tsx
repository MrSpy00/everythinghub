"use client";
// ============================================================
// aegisTyping — Finish Effect (Confetti + Tier Badge)
// Canvas-based confetti, no external deps
// ============================================================
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpeedTier } from "../types";
import { SPEED_TIER_LABELS } from "../types";

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
  speedTier,
  wpm,
  reducedMotion = false,
  onDone,
}: FinishEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const startedRef = useRef(false);

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

      // Spawn particles for first 2 seconds
      if (spawnCount < 200) {
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push(createParticle(canvas));
        }
        spawnCount += 5;
      }

      // Update and draw
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.01);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.vy += 0.08; // gravity
        p.y += p.vy;
        p.vx *= 0.99;
        p.spin += p.spinSpeed;
        if (p.y > canvas.height * 0.7) {
          p.alpha -= 0.02;
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

      if (spawnCount >= 200 && particlesRef.current.length === 0) {
        done = true;
      }
    };

    animRef.current = requestAnimationFrame(animate);
    startedRef.current = true;

    return () => {
      cancelAnimationFrame(animRef.current);
      ctx.clearRect(0, 0, canvas.width || 0, canvas.height || 0);
    };
  }, [active, reducedMotion, onDone]);

  const tier = SPEED_TIER_LABELS[speedTier];

  return (
    <>
      {/* Canvas confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ display: active && !reducedMotion ? "block" : "none" }}
      />

      {/* Speed tier badge */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none"
            initial={{ scale: 0, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                className="px-8 py-4 rounded-2xl border backdrop-blur-2xl"
                style={{
                  background: `${tier.color}14`,
                  borderColor: `${tier.color}40`,
                  boxShadow: `0 0 40px ${tier.color}30, 0 0 80px ${tier.color}15`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 40px ${tier.color}30, 0 0 80px ${tier.color}15`,
                    `0 0 60px ${tier.color}50, 0 0 120px ${tier.color}25`,
                    `0 0 40px ${tier.color}30, 0 0 80px ${tier.color}15`,
                  ],
                }}
                transition={{ duration: 2, repeat: 2, ease: "easeInOut" }}
              >
                <p
                  className="text-5xl font-bold font-mono tabular-nums"
                  style={{ color: tier.color }}
                >
                  {wpm}
                  <span className="text-2xl ml-2 font-normal opacity-70">
                    WPM
                  </span>
                </p>
                <p
                  className="text-center text-sm font-semibold mt-2 uppercase tracking-[0.2em]"
                  style={{ color: tier.color }}
                >
                  {tier.label}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
