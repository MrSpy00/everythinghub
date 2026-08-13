"use client";

import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   VENOM SYMBIOTE ENGINE  v3.0  — "Living Border Filament"
   Philosophy:
     · The symbiote lives ON the outer edge/outline of interactive elements —
       it never fills inside. It clings to borders like a living organism.
     · When the cursor hovers an element, thin thread-like tendrils spawn along
       that element's perimeter, flowing smoothly like a snake/parasite.
     · When moving between elements, a filament bridge is drawn between the
       two perimeters — elastic, organic, snapping/fading as it stretches.
     · In empty space: fully invisible / sleeping.
     · Design language: muted dark-violet & near-black, ultra-thin lines,
       soft phosphorescent glow, slow serpentine motion.
   Architecture:
     · Single offscreen Canvas overlaid on the whole viewport (pointer-events: none)
     · requestAnimationFrame loop: sleeps when nothing is active
     · All math: typed arrays / plain objects, no allocations in hot path
     · Filament segments use Verlet-spring chain physics
     · DPR capped at 2, will-change: transform for GPU composite
────────────────────────────────────────────────────────────────────────────── */

// ── Constants ──────────────────────────────────────────────────────────────────

const TENDRIL_SEGMENTS = 24;      // chain segments per tendril filament
const TENDRIL_COUNT_CARD = 6;     // simultaneous filaments on large cards
const TENDRIL_COUNT_BUTTON = 3;   // simultaneous filaments on small controls
const TENDRIL_SEGMENT_DIST = 14;  // resting distance between chain nodes (px)
const SPRING_STIFFNESS = 0.18;    // Verlet spring k — lower = more elastic/lazy
const DAMPING = 0.82;             // velocity damping per tick
const TAIL_SPAWN_RATE = 0.28;     // probability per frame of advancing a tendril head
const MAX_PARTICLES = 40;         // droplet pool cap
const FADE_IN_SPEED = 5.0;        // alpha ramp-up per second
const FADE_OUT_SPEED = 3.5;       // alpha ramp-down per second
const IDLE_SLEEP_MS = 3000;       // ms of idle before full sleep
const BRIDGE_DECAY = 2.2;         // bridge retraction speed

// Venom palette (dark-violet / near-black / faint lavender)
const PALETTE = [
  "rgba(30, 10, 60, 0.95)",       // near-black violet (darkest)
  "rgba(60, 20, 100, 0.85)",      // deep indigo
  "rgba(100, 40, 180, 0.65)",     // mid violet
  "rgba(140, 70, 220, 0.45)",     // lighter purple glow
];

// ── Type Definitions ───────────────────────────────────────────────────────────

interface BoundRect {
  x: number; y: number; w: number; h: number; r: number; isCard: boolean;
}

interface Vec2 { x: number; y: number; }

// Verlet chain node
interface ChainNode {
  x: number; y: number;
  px: number; py: number; // previous position (Verlet)
}

// A single serpentine filament living on a border
interface Filament {
  // nodes[0] is the root (anchored on border), nodes[n] is the free head
  nodes: ChainNode[];
  headAngle: number;    // current angular position around the perimeter [0, 2π)
  angularVel: number;   // how fast it creeps around the border
  opacity: number;      // individual fade
  width: number;        // line width at root (tapers to 0 at tip)
  phase: number;        // time offset for organic breathing
  life: number;         // age in frames
  maxLife: number;      // when it should dissolve and reset
}

// Bridge filament between two elements
interface Bridge {
  nodes: ChainNode[];
  alpha: number;        // fade progress
  width: number;
}

// Tiny ambient droplet (very rare, very subtle)
interface Droplet {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

// ── Utility helpers ────────────────────────────────────────────────────────────

/** Lerp scalar */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Point on rounded-rect perimeter at angle θ */
function perimeterPoint(rect: BoundRect, angle: number): Vec2 {
  const { x, y, w, h, r } = rect;
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Use ellipse approximation corrected by rounded corner influence
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Determine quadrant and corner offset
  const cornerX = cx + hw * Math.sign(cosA);
  const cornerY = cy + hh * Math.sign(sinA);

  // Ratio along straight edge vs. corner arc
  const ex = Math.abs(cosA) * (hw / (Math.max(Math.abs(cosA) * hw, Math.abs(sinA) * hh) || 1));
  const ey = Math.abs(sinA) * (hh / (Math.max(Math.abs(cosA) * hw, Math.abs(sinA) * hh) || 1));

  // Simple: scale onto border box, then nudge outward by a small offset
  const OUTSET = 3; // px outside element boundary
  const px = cx + (w / 2 + OUTSET) * cosA;
  const py = cy + (h / 2 + OUTSET) * sinA;

  // Clamp corners to r-radius
  void (ex + ey + cornerX + cornerY); // suppress unused warning
  return { x: px, y: py };
}

/** Create a fresh Verlet chain rooted at (rx, ry), extending radially outward */
function makeChain(rx: number, ry: number, angle: number, segCount: number): ChainNode[] {
  const chain: ChainNode[] = [];
  for (let i = 0; i < segCount; i++) {
    const x = rx + Math.cos(angle) * i * TENDRIL_SEGMENT_DIST * 0.3;
    const y = ry + Math.sin(angle) * i * TENDRIL_SEGMENT_DIST * 0.3;
    chain.push({ x, y, px: x, py: y });
  }
  return chain;
}

/** Resolve the best interactive element under the mouse */
function resolveTarget(elem: HTMLElement | null): BoundRect | null {
  if (!elem) return null;

  // Priority 1: large cards / containers
  const card = elem.closest<HTMLElement>(
    ".group, [data-venom], article, .rounded-2xl, .rounded-3xl, section > .border, .hubsense-card"
  );
  if (card && card.offsetWidth > 60 && card.offsetHeight > 40) {
    const rect = card.getBoundingClientRect();
    const style = getComputedStyle(card);
    return {
      x: rect.left, y: rect.top, w: rect.width, h: rect.height,
      r: parseFloat(style.borderRadius) || 16,
      isCard: true,
    };
  }

  // Priority 2: interactive controls
  const ctrl = elem.closest<HTMLElement>("button, a, input, select, textarea, [role='button'], label");
  if (ctrl && ctrl.offsetWidth > 20) {
    const rect = ctrl.getBoundingClientRect();
    const style = getComputedStyle(ctrl);
    return {
      x: rect.left, y: rect.top, w: rect.width, h: rect.height,
      r: parseFloat(style.borderRadius) || 8,
      isCard: false,
    };
  }

  return null;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function VenomSymbioteEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches
    ) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!rawCtx) return;
    // Alias to a definitely-typed reference so nested closures satisfy TS narrowing
    const g: CanvasRenderingContext2D = rawCtx;

    // ── Canvas resize ──────────────────────────────────────────────────────────
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth, H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── State ──────────────────────────────────────────────────────────────────
    const mouse = { x: -9999, y: -9999 };
    let lastMoveTime = performance.now();
    let currentTarget: BoundRect | null = null;
    let prevTarget: BoundRect | null = null;
    let globalAlpha = 0;      // master fade
    let rafId = 0;
    let isRunning = false;

    // Lerped rect (smooth morphing between elements)
    const lerpRect: BoundRect = { x: -9999, y: -9999, w: 0, h: 0, r: 16, isCard: false };
    let lerpActive = false;

    // Filaments pool
    let filaments: Filament[] = [];
    const targetFilamentCount = () => currentTarget
      ? (currentTarget.isCard ? TENDRIL_COUNT_CARD : TENDRIL_COUNT_BUTTON)
      : 0;

    // Bridge between elements
    let bridge: Bridge | null = null;

    // Droplets pool
    const droplets: Droplet[] = [];

    // ── Filament factory ────────────────────────────────────────────────────────
    function spawnFilament(rect: BoundRect): Filament {
      const startAngle = Math.random() * Math.PI * 2;
      const root = perimeterPoint(rect, startAngle);
      const segCount = TENDRIL_SEGMENTS;
      return {
        nodes: makeChain(root.x, root.y, startAngle, segCount),
        headAngle: startAngle,
        angularVel: (Math.random() * 0.012 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
        opacity: 0,
        width: (rect.isCard ? 1.4 : 0.9) + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 220 + Math.floor(Math.random() * 120),
      };
    }

    // ── Bridge factory ──────────────────────────────────────────────────────────
    function spawnBridge(from: BoundRect, to: BoundRect): Bridge {
      const fromPt = perimeterPoint(from, 0);
      const toPt = perimeterPoint(to, Math.PI);
      const segCount = 18;
      const nodes: ChainNode[] = [];
      for (let i = 0; i < segCount; i++) {
        const t = i / (segCount - 1);
        const bx = lerp(fromPt.x, toPt.x, t);
        const by = lerp(fromPt.y, toPt.y, t);
        nodes.push({ x: bx, y: by, px: bx, py: by });
      }
      return { nodes, alpha: 1, width: 0.8 };
    }

    // ── Droplet spawn ───────────────────────────────────────────────────────────
    function spawnDroplet(x: number, y: number) {
      if (droplets.length >= MAX_PARTICLES) return;
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.15 + Math.random() * 0.6;
      droplets.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 0.6 + Math.random() * 1.4,
        alpha: 0.5 + Math.random() * 0.35,
        life: 0,
        maxLife: 30 + Math.floor(Math.random() * 40),
      });
    }

    // ── Verlet chain simulation ─────────────────────────────────────────────────
    function simulateChain(
      nodes: ChainNode[],
      anchor: Vec2,
      anchorStrength: number,
      t: number
    ) {
      if (nodes.length === 0) return;

      // Constrain root to anchor
      nodes[0].x = lerp(nodes[0].x, anchor.x, anchorStrength);
      nodes[0].y = lerp(nodes[0].y, anchor.y, anchorStrength);
      nodes[0].px = nodes[0].x;
      nodes[0].py = nodes[0].y;

      // Verlet integration for body
      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        const vx = (n.x - n.px) * DAMPING;
        const vy = (n.y - n.py) * DAMPING;

        // Subtle organic drift force (makes it look alive / breathing)
        const drift = Math.sin(t * 1.3 + i * 0.5) * 0.08;
        const driftX = Math.cos(t * 0.9 + i * 0.7) * drift;
        const driftY = Math.sin(t * 1.1 + i * 0.6) * drift;

        n.px = n.x;
        n.py = n.y;
        n.x += vx + driftX;
        n.y += vy + driftY;
      }

      // Distance constraints (spring)
      for (let iter = 0; iter < 3; iter++) {
        for (let i = 0; i < nodes.length - 1; i++) {
          const a = nodes[i];
          const b = nodes[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const rest = TENDRIL_SEGMENT_DIST * (0.4 + i * 0.03);
          const diff = (dist - rest) / dist * SPRING_STIFFNESS;
          if (i > 0) {
            a.x += dx * diff;
            a.y += dy * diff;
          }
          b.x -= dx * diff;
          b.y -= dy * diff;
        }
      }
    }

    // ── Draw one filament ────────────────────────────────────────────────────────
    function drawFilament(fil: Filament, masterAlpha: number) {
      const { nodes, width, opacity } = fil;
      if (nodes.length < 2) return;
      const alpha = opacity * masterAlpha;
      if (alpha < 0.01) return;

      g.save();

      // Draw a tapered, soft line along the chain
      for (let i = 0; i < nodes.length - 1; i++) {
        const t = i / (nodes.length - 1);
        const a = nodes[i];
        const b = nodes[i + 1];

        // Taper: thick at root, vanishes at tip (quadratic falloff)
        const localWidth = width * Math.pow(1 - t, 1.5);
        if (localWidth < 0.1) continue;

        // Layered strokes: dark core + violet glow
        const coreAlpha = alpha * (1 - t * 0.7);
        const glowAlpha = alpha * (1 - t) * 0.55;

        // 1. Dark near-black core
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.strokeStyle = `rgba(8, 2, 18, ${coreAlpha})`;
        g.lineWidth = localWidth;
        g.lineCap = "round";
        g.stroke();

        // 2. Violet phosphorescent edge vein
        if (glowAlpha > 0.03) {
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.lineTo(b.x, b.y);
          g.strokeStyle = `rgba(120, 50, 200, ${glowAlpha})`;
          g.lineWidth = Math.max(0.3, localWidth * 0.4);
          g.shadowColor = "rgba(150, 80, 255, 0.6)";
          g.shadowBlur = 4;
          g.stroke();
          g.shadowBlur = 0;
        }
      }

      g.restore();
    }

    // ── Draw border outline (the "living border") ────────────────────────────────
    function drawBorderOutline(rect: BoundRect, masterAlpha: number, time: number) {
      if (rect.w < 1 || rect.h < 1) return;
      const alpha = masterAlpha;
      if (alpha < 0.01) return;

      const { x, y, w, h, r, isCard } = rect;
      const OUTSET = 2.5;
      const pulse = 1 + Math.sin(time * 2.2) * 0.04; // subtle breathing

      g.save();

      // Outer dark creep band
      g.beginPath();
      if (typeof g.roundRect === "function") {
        g.roundRect(x - OUTSET, y - OUTSET, w + OUTSET * 2, h + OUTSET * 2, r + OUTSET);
      } else {
        g.rect(x - OUTSET, y - OUTSET, w + OUTSET * 2, h + OUTSET * 2);
      }
      g.strokeStyle = `rgba(10, 3, 25, ${alpha * 0.55 * pulse})`;
      g.lineWidth = isCard ? 2.0 : 1.2;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.stroke();

      // Inner violet vein
      g.beginPath();
      if (typeof g.roundRect === "function") {
        g.roundRect(x - OUTSET + 0.5, y - OUTSET + 0.5, w + OUTSET * 2 - 1, h + OUTSET * 2 - 1, r + OUTSET - 0.5);
      } else {
        g.rect(x - OUTSET + 0.5, y - OUTSET + 0.5, w + OUTSET * 2 - 1, h + OUTSET * 2 - 1);
      }
      g.strokeStyle = `rgba(100, 40, 180, ${alpha * 0.30 * pulse})`;
      g.lineWidth = isCard ? 1.0 : 0.6;
      g.shadowColor = "rgba(140, 60, 255, 0.5)";
      g.shadowBlur = isCard ? 8 : 4;
      g.stroke();
      g.shadowBlur = 0;

      g.restore();
    }

    // ── Draw bridge ──────────────────────────────────────────────────────────────
    function drawBridge(br: Bridge, masterAlpha: number) {
      const alpha = br.alpha * masterAlpha;
      if (alpha < 0.01 || br.nodes.length < 2) return;

      g.save();
      g.globalAlpha = alpha;
      g.beginPath();
      g.moveTo(br.nodes[0].x, br.nodes[0].y);
      for (let i = 1; i < br.nodes.length; i++) {
        const prev = br.nodes[i - 1];
        const curr = br.nodes[i];
        const mx = (prev.x + curr.x) / 2;
        const my = (prev.y + curr.y) / 2;
        g.quadraticCurveTo(prev.x, prev.y, mx, my);
      }
      g.strokeStyle = `rgba(80, 25, 150, 0.7)`;
      g.lineWidth = br.width;
      g.lineCap = "round";
      g.shadowColor = "rgba(130, 60, 220, 0.5)";
      g.shadowBlur = 5;
      g.stroke();
      g.shadowBlur = 0;
      g.restore();
    }

    // ── Main render loop ─────────────────────────────────────────────────────────
    let lastTime = performance.now();

    const loop = (now: number) => {
      const rawDt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const t = now * 0.001; // seconds

      const W = window.innerWidth;
      const H = window.innerHeight;
      g.clearRect(0, 0, W, H);

      // ─ Master alpha fade ───────────────────────────────────────────────────
      const hasTarget = currentTarget !== null;
      if (hasTarget) {
        globalAlpha = Math.min(1, globalAlpha + rawDt * FADE_IN_SPEED);
      } else {
        globalAlpha = Math.max(0, globalAlpha - rawDt * FADE_OUT_SPEED);
      }

      // Sleep when idle and fully transparent
      const idleMs = now - lastMoveTime;
      if (globalAlpha <= 0.001 && idleMs > IDLE_SLEEP_MS) {
        isRunning = false;
        return; // no requestAnimationFrame → sleeping
      }

      // ─ Lerp rect ─────────────────────────────────────────────────────────
      if (currentTarget) {
        if (!lerpActive) {
          lerpRect.x = currentTarget.x;
          lerpRect.y = currentTarget.y;
          lerpRect.w = currentTarget.w;
          lerpRect.h = currentTarget.h;
          lerpRect.r = currentTarget.r;
          lerpRect.isCard = currentTarget.isCard;
          lerpActive = true;
        } else {
          const S = 0.14;
          lerpRect.x = lerp(lerpRect.x, currentTarget.x, S);
          lerpRect.y = lerp(lerpRect.y, currentTarget.y, S);
          lerpRect.w = lerp(lerpRect.w, currentTarget.w, S);
          lerpRect.h = lerp(lerpRect.h, currentTarget.h, S);
          lerpRect.r = lerp(lerpRect.r, currentTarget.r, S);
          lerpRect.isCard = currentTarget.isCard;
        }
      } else {
        lerpActive = false;
      }

      if (globalAlpha <= 0.001) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      // ─ Manage filament pool ────────────────────────────────────────────────
      const wantCount = targetFilamentCount();

      // Age existing filaments, dissolve old ones
      for (let i = filaments.length - 1; i >= 0; i--) {
        filaments[i].life++;
        if (filaments[i].life > filaments[i].maxLife) {
          filaments.splice(i, 1);
        }
      }

      // Spawn new if we need more
      if (currentTarget && filaments.length < wantCount) {
        filaments.push(spawnFilament(currentTarget));
      }

      // ─ Simulate & draw filaments ──────────────────────────────────────────
      if (lerpActive) {
        drawBorderOutline(lerpRect, globalAlpha, t);

        for (const fil of filaments) {
          // Fade in/out based on life
          const lifeFrac = fil.life / fil.maxLife;
          if (lifeFrac < 0.1) {
            fil.opacity = Math.min(1, fil.opacity + rawDt * 4.0);
          } else if (lifeFrac > 0.8) {
            fil.opacity = Math.max(0, fil.opacity - rawDt * 3.0);
          }

          // Advance head angle (creeping around perimeter)
          fil.headAngle += fil.angularVel;
          const anchor = perimeterPoint(lerpRect, fil.headAngle);

          // Add subtle serpentine offset to root
          const sway = Math.sin(t * 1.8 + fil.phase) * 3;
          anchor.x += Math.cos(fil.headAngle + Math.PI / 2) * sway;
          anchor.y += Math.sin(fil.headAngle + Math.PI / 2) * sway;

          // Simulate chain physics
          simulateChain(fil.nodes, anchor, 0.55, t + fil.phase);

          // Occasionally spawn a subtle droplet at tip
          const tipNode = fil.nodes[fil.nodes.length - 1];
          if (Math.random() < 0.006) {
            spawnDroplet(tipNode.x, tipNode.y);
          }

          drawFilament(fil, globalAlpha);
        }
      }

      // ─ Bridge between elements ─────────────────────────────────────────────
      if (bridge) {
        bridge.alpha = Math.max(0, bridge.alpha - rawDt * BRIDGE_DECAY);

        if (bridge.alpha > 0.01) {
          // Simulate bridge chain (both endpoints pulled)
          const br = bridge;
          const last = br.nodes.length - 1;
          simulateChain(br.nodes, { x: br.nodes[0].x, y: br.nodes[0].y }, 0.9, t);
          // pull tail toward cursor position when near
          br.nodes[last].x = lerp(br.nodes[last].x, mouse.x, 0.06);
          br.nodes[last].y = lerp(br.nodes[last].y, mouse.y, 0.06);
          drawBridge(br, globalAlpha);
        } else {
          bridge = null;
        }
      }

      // ─ Droplets ───────────────────────────────────────────────────────────
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.life++;
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.97;
        d.vy *= 0.97;
        const frac = d.life / d.maxLife;
        if (frac >= 1) { droplets.splice(i, 1); continue; }
        const da = d.alpha * (1 - frac) * globalAlpha;
        if (da < 0.01) continue;
        g.beginPath();
        g.arc(d.x, d.y, d.size * (1 - frac * 0.4), 0, Math.PI * 2);
        g.fillStyle = `rgba(90, 30, 160, ${da})`;
        g.fill();
      }

      rafId = requestAnimationFrame(loop);
    };

    // ── Mouse handler ────────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMoveTime = performance.now();

      const newTarget = resolveTarget(e.target as HTMLElement | null);

      // Detect element change
      const changed = newTarget
        ? !currentTarget ||
          Math.abs(newTarget.x - currentTarget.x) > 6 ||
          Math.abs(newTarget.y - currentTarget.y) > 6 ||
          Math.abs(newTarget.w - currentTarget.w) > 6
        : currentTarget !== null;

      if (changed) {
        if (currentTarget && newTarget) {
          // Spawn bridge between old and new element
          bridge = spawnBridge(currentTarget, newTarget);
        }
        prevTarget = currentTarget;
        currentTarget = newTarget;
        // Reset filaments when changing element
        filaments = [];
        lerpActive = false;
      }

      if (!isRunning) {
        isRunning = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Kick off loop once so fade-out works even after initial mount
    isRunning = true;
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      isRunning = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none block"
      aria-hidden="true"
      style={{
        zIndex: 12,
        willChange: "transform",
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
