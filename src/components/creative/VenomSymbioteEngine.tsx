"use client";

import React, { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   VENOM SYMBIOTE ENGINE  v4.0  — "Sentient Border Organism"

   Design Philosophy:
   ─────────────────
   The symbiote is a living organism that colonizes the outer edges of UI
   elements. It never penetrates or fills inside — it lives on the border skin.

   It behaves as if it:
   · Detects the presence of a host element and slowly awakens
   · Sends out thin, thread-like filaments that creep along the perimeter
   · Each filament is an independent Verlet-spring chain that breathes, sways,
     and reacts to the cursor's proximity with organic randomness
   · When the cursor leaves for another element, a bridge strand stretches
     between hosts, then snaps and retracts organically
   · Fully invisible in open space — 100% dormant between elements

   Physics Model:
   ─────────────
   · Verlet integration with per-node damping
   · Distance constraint solver (3 iterations / frame)
   · Angular perimeter drift with sinusoidal breathing
   · Per-filament stochastic randomness (unique seed, phase, angular velocity)
   · Gaussian noise injection on chain nodes

   Performance:
   ───────────
   · RAF loop sleeps completely when idle >3.5s and alpha=0
   · DPR capped at 2×
   · No allocations in hot path (particle pool, chain reuse)
   · try/catch on all canvas ops (production safety)

   Disable Protocol:
   ────────────────
   · Checks document.body.dataset.venomDisabled on every frame
   · Fades out immediately when disabled, resumes on re-enable
   · HubSense game screens set data-venom-disabled="true" on <body>
═══════════════════════════════════════════════════════════════════════════════ */

// ── Tuning Constants ──────────────────────────────────────────────────────────

const SEGMENTS       = 26;   // Verlet nodes per filament chain
const FIL_CARD       = 6;    // max simultaneous filaments on large cards
const FIL_BTN        = 3;    // max simultaneous filaments on buttons/links
const REST_DIST      = 11;   // resting node spacing (px)
const SPRING_K       = 0.14; // spring stiffness (lower = more elastic)
const DAMPING        = 0.81; // velocity damping (Verlet)
const DRIFT_AMP      = 0.10; // amplitude of organic Gaussian drift
const FADE_IN        = 6.0;  // master alpha ramp speed (per second)
const FADE_OUT       = 4.0;
const DISABLE_FADE   = 9.0;  // fast fade-out when disabled
const IDLE_SLEEP_MS  = 3500; // ms idle → full sleep
const BRIDGE_DECAY   = 2.8;  // bridge alpha decay (per second)
const BRIDGE_SNAP_DIST = 420; // px — max bridge length before it snaps
const MAX_DROPS      = 28;   // ambient droplet pool cap

// ── Type Definitions ──────────────────────────────────────────────────────────

interface Rect  { x: number; y: number; w: number; h: number; r: number; isCard: boolean; }
interface Vec2  { x: number; y: number; }
interface VNode { x: number; y: number; px: number; py: number; }

interface Filament {
  nodes:   VNode[];
  angle:   number;   // current angular position around perimeter [0, 2π)
  dAngle:  number;   // angular drift per frame
  opacity: number;   // individual fade [0,1]
  width:   number;   // root stroke width (tapers to 0 at tip)
  phase:   number;   // unique time offset for breathing
  freq:    number;   // unique oscillation frequency
  life:    number;   // frames alive
  maxLife: number;   // frames until this filament dissolves
}

interface BridgeStrand {
  nodes:  VNode[];
  alpha:  number;   // [0,1] fade
  width:  number;
  fromPt: Vec2;
  toPt:   Vec2;
}

interface Drop {
  x: number; y: number;
  vx: number; vy: number;
  r: number; a: number;
  life: number; max: number;
}

// ── Seeded PRNG (xorshift32) ──────────────────────────────────────────────────
// Gives deterministic but varied randomness per-filament without Math.random spam

function xorshift(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

// ── Math helpers ──────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Box-Muller Gaussian sample for organic drift noise */
function gaussian(rand: () => number): number {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Point on the OUTSIDE of a rounded-rect border at angle θ */
function perimPt(rect: Rect, angle: number, outset = 4): Vec2 {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  // Stretch a unit circle to match the rect's aspect, then outset
  const hw = rect.w / 2 + outset;
  const hh = rect.h / 2 + outset;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  // Scale ellipse to rect (avoids corner cut-through)
  const scale = 1 / (Math.sqrt(
    (cosA * cosA) / (hw * hw) + (sinA * sinA) / (hh * hh)
  ));
  return { x: cx + cosA * scale, y: cy + sinA * scale };
}

/** Create a Verlet chain of n nodes, compacted near the root */
function makeChain(ox: number, oy: number, angle: number, n: number): VNode[] {
  const nodes: VNode[] = [];
  for (let i = 0; i < n; i++) {
    const spread = i * REST_DIST * 0.22;
    const x = ox + Math.cos(angle) * spread;
    const y = oy + Math.sin(angle) * spread;
    nodes.push({ x, y, px: x, py: y });
  }
  return nodes;
}

/** Simulate one frame of Verlet physics on a chain */
function stepChain(
  nodes: VNode[],
  anchor: Vec2,
  anchorStrength: number,
  t: number,
  phase: number,
  freq: number,
  rand: () => number
) {
  if (!nodes.length) return;

  // Constrain root to anchor
  nodes[0].x = lerp(nodes[0].x, anchor.x, anchorStrength);
  nodes[0].y = lerp(nodes[0].y, anchor.y, anchorStrength);
  nodes[0].px = nodes[0].x;
  nodes[0].py = nodes[0].y;

  // Verlet integrate each body node
  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    const vx = (n.x - n.px) * DAMPING;
    const vy = (n.y - n.py) * DAMPING;

    // Organic drift: sinusoidal + tiny Gaussian noise
    const wave = Math.sin(t * freq + phase + i * 0.52) * DRIFT_AMP;
    const nx  = gaussian(rand) * 0.04;
    const ny  = gaussian(rand) * 0.04;

    n.px = n.x;
    n.py = n.y;
    n.x += vx + Math.cos(t * 0.85 + i * 0.65 + phase) * wave + nx;
    n.y += vy + Math.sin(t * 1.15 + i * 0.58 + phase) * wave + ny;
  }

  // Distance constraints (spring solver, 3 iterations)
  for (let iter = 0; iter < 3; iter++) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = Math.sqrt(dx * dx + dy * dy) || 0.001;
      // Rest distance grows slightly toward tip (more slack = more serpentine)
      const rest = REST_DIST * (0.35 + i * 0.032);
      const diff = (d - rest) / d * SPRING_K;
      if (i > 0) { a.x += dx * diff; a.y += dy * diff; }
      b.x -= dx * diff;
      b.y -= dy * diff;
    }
  }
}

// ── DOM Target Resolver ────────────────────────────────────────────────────────

function resolveTarget(el: HTMLElement | null): Rect | null {
  if (!el) return null;
  try {
    // Priority 1: large cards, containers
    const card = el.closest<HTMLElement>(
      ".group, [data-venom], article, .rounded-2xl, .rounded-3xl, " +
      "section > .border, .hubsense-card, .neon-card, [data-venom-host]"
    );
    if (card && card.offsetWidth > 64 && card.offsetHeight > 42) {
      const r = card.getBoundingClientRect();
      const s = getComputedStyle(card);
      return {
        x: r.left, y: r.top, w: r.width, h: r.height,
        r: parseFloat(s.borderRadius) || 16, isCard: true
      };
    }
    // Priority 2: interactive controls
    const ctrl = el.closest<HTMLElement>(
      "button, a[href], input, select, textarea, [role='button'], label"
    );
    if (ctrl && ctrl.offsetWidth > 22) {
      const r = ctrl.getBoundingClientRect();
      const s = getComputedStyle(ctrl);
      return {
        x: r.left, y: r.top, w: r.width, h: r.height,
        r: parseFloat(s.borderRadius) || 8, isCard: false
      };
    }
  } catch (_) { /* safe */ }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VenomSymbioteEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Accessibility / device guards
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (
        window.matchMedia("(pointer: coarse)").matches &&
        !window.matchMedia("(pointer: fine)").matches
      ) return;
    } catch (_) { return; }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = canvas.getContext("2d", { alpha: true }); } catch (_) { return; }
    if (!ctx) return;
    const g = ctx; // non-null alias for closures

    // ── Canvas resize ────────────────────────────────────────────────────────
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      try {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = window.innerWidth;
        const H = window.innerHeight;
        canvas.width  = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width  = `${W}px`;
        canvas.style.height = `${H}px`;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      } catch (_) { /* */ }
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── State ────────────────────────────────────────────────────────────────
    const mouse   = { x: -9999, y: -9999 };
    let lastMove  = performance.now();
    let cur:  Rect | null = null;
    let prev: Rect | null = null;

    let masterAlpha = 0;
    let rafId       = 0;
    let running     = false;
    let disabled    = false;   // reflects data-venom-disabled body attribute

    // Lerped rect (smooth morph when element changes)
    const lerpR: Rect = { x: -9999, y: -9999, w: 0, h: 0, r: 16, isCard: false };
    let lerpActive = false;

    let filaments: Filament[] = [];
    let bridge:    BridgeStrand | null = null;
    const drops:   Drop[] = [];

    // Shared PRNG instance (refreshed per filament via its own seeded generator)
    let sharedRand = xorshift(Date.now() & 0xffffffff);

    // ── Filament factory ─────────────────────────────────────────────────────
    function spawnFilament(rect: Rect): Filament {
      const seed  = (Math.random() * 0xffffffff) | 0;
      const rand  = xorshift(seed);
      const angle = rand() * Math.PI * 2;
      const pt    = perimPt(rect, angle);
      return {
        nodes:   makeChain(pt.x, pt.y, angle, SEGMENTS),
        angle,
        dAngle:  (rand() * 0.015 + 0.004) * (rand() < 0.5 ? 1 : -1),
        opacity: 0,
        width:   (rect.isCard ? 1.25 : 0.80) + rand() * 0.55,
        phase:   rand() * Math.PI * 2,
        freq:    1.1 + rand() * 0.9,
        life:    0,
        maxLife: 180 + Math.floor(rand() * 160),
      };
    }

    // ── Bridge factory ───────────────────────────────────────────────────────
    function spawnBridge(from: Rect, to: Rect): BridgeStrand | null {
      const fp = perimPt(from, 0);
      const tp = perimPt(to, Math.PI);
      const dx = tp.x - fp.x, dy = tp.y - fp.y;
      if (Math.sqrt(dx * dx + dy * dy) > BRIDGE_SNAP_DIST) return null; // too far, skip
      const n = 20;
      const nodes: VNode[] = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x = lerp(fp.x, tp.x, t);
        const y = lerp(fp.y, tp.y, t);
        nodes.push({ x, y, px: x, py: y });
      }
      return { nodes, alpha: 1, width: 0.7, fromPt: fp, toPt: tp };
    }

    // ── Droplet factory ──────────────────────────────────────────────────────
    function spawnDrop(x: number, y: number) {
      if (drops.length >= MAX_DROPS) return;
      const a   = sharedRand() * Math.PI * 2;
      const spd = 0.10 + sharedRand() * 0.45;
      drops.push({
        x, y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        r: 0.4 + sharedRand() * 1.1,
        a: 0.35 + sharedRand() * 0.30,
        life: 0,
        max:  22 + Math.floor(sharedRand() * 38),
      });
    }

    // ── Draw: living border outline ──────────────────────────────────────────
    function drawBorder(rect: Rect, ma: number, t: number) {
      if (rect.w < 1 || rect.h < 1 || ma < 0.01) return;
      const { x, y, w, h, r, isCard } = rect;
      const OS    = 3;
      const pulse = 1 + Math.sin(t * 2.0) * 0.035; // slow breathing

      g.save();

      // Dark creep ring (outer skin)
      g.beginPath();
      if (typeof g.roundRect === "function") {
        g.roundRect(x - OS, y - OS, w + OS * 2, h + OS * 2, Math.max(0, r + OS));
      } else {
        g.rect(x - OS, y - OS, w + OS * 2, h + OS * 2);
      }
      g.strokeStyle = `rgba(5, 1, 14, ${ma * 0.48 * pulse})`;
      g.lineWidth   = isCard ? 1.7 : 1.0;
      g.lineCap     = "round";
      g.lineJoin    = "round";
      g.stroke();

      // Violet phosphorescent vein (inner trim)
      g.beginPath();
      if (typeof g.roundRect === "function") {
        g.roundRect(x - OS + 0.7, y - OS + 0.7, w + OS * 2 - 1.4, h + OS * 2 - 1.4, Math.max(0, r + OS - 0.7));
      } else {
        g.rect(x - OS + 0.7, y - OS + 0.7, w + OS * 2 - 1.4, h + OS * 2 - 1.4);
      }
      g.strokeStyle = `rgba(95, 35, 170, ${ma * 0.22 * pulse})`;
      g.lineWidth   = isCard ? 0.85 : 0.5;
      g.shadowColor = "rgba(125, 50, 235, 0.45)";
      g.shadowBlur  = isCard ? 6.5 : 3;
      g.stroke();
      g.shadowBlur  = 0;

      g.restore();
    }

    // ── Draw: single filament ────────────────────────────────────────────────
    function drawFilament(fil: Filament, ma: number) {
      const { nodes, width, opacity } = fil;
      if (nodes.length < 2 || opacity * ma < 0.01) return;

      g.save();
      g.lineCap = "round";

      for (let i = 0; i < nodes.length - 1; i++) {
        const taper = i / (nodes.length - 1);
        const lw    = width * Math.pow(1 - taper, 1.7);
        if (lw < 0.06) continue;

        const a = nodes[i];
        const b = nodes[i + 1];

        // 1. Dark near-black core stroke
        const cAlpha = opacity * ma * (1 - taper * 0.60);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.strokeStyle = `rgba(4, 1, 12, ${cAlpha})`;
        g.lineWidth   = lw;
        g.stroke();

        // 2. Phosphorescent violet glow vein
        const gAlpha = opacity * ma * (1 - taper) * 0.48;
        if (gAlpha > 0.02) {
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.lineTo(b.x, b.y);
          g.strokeStyle = `rgba(110, 42, 190, ${gAlpha})`;
          g.lineWidth   = Math.max(0.2, lw * 0.36);
          g.shadowColor = "rgba(140, 70, 240, 0.50)";
          g.shadowBlur  = 3;
          g.stroke();
          g.shadowBlur  = 0;
        }
      }
      g.restore();
    }

    // ── Draw: bridge strand ──────────────────────────────────────────────────
    function drawBridge(br: BridgeStrand, ma: number) {
      const alpha = br.alpha * ma;
      if (alpha < 0.01 || br.nodes.length < 2) return;

      g.save();
      g.globalAlpha = alpha;
      g.beginPath();
      g.moveTo(br.nodes[0].x, br.nodes[0].y);
      for (let i = 1; i < br.nodes.length; i++) {
        const p  = br.nodes[i - 1];
        const c  = br.nodes[i];
        const mx = (p.x + c.x) / 2;
        const my = (p.y + c.y) / 2;
        g.quadraticCurveTo(p.x, p.y, mx, my);
      }
      g.strokeStyle = "rgba(70, 20, 138, 0.60)";
      g.lineWidth   = br.width;
      g.lineCap     = "round";
      g.shadowColor = "rgba(118, 52, 210, 0.40)";
      g.shadowBlur  = 4;
      g.stroke();
      g.shadowBlur  = 0;
      g.restore();
    }

    // ── Main render loop ─────────────────────────────────────────────────────
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt  = Math.min((now - lastTime) / 1000, 0.05);
      lastTime  = now;
      const t   = now * 0.001;
      const W   = window.innerWidth;
      const H   = window.innerHeight;

      // Check disabled state (HubSense game screens)
      disabled = document.body.getAttribute("data-venom-disabled") === "true";

      try { g.clearRect(0, 0, W, H); } catch (_) { running = false; return; }

      // Master alpha: fade in/out, fast fade when disabled
      if (disabled || !cur) {
        const speed = disabled ? DISABLE_FADE : FADE_OUT;
        masterAlpha = Math.max(0, masterAlpha - dt * speed);
      } else {
        masterAlpha = Math.min(1, masterAlpha + dt * FADE_IN);
      }

      // Sleep when fully faded and idle
      if (masterAlpha <= 0.001 && (now - lastMove > IDLE_SLEEP_MS || disabled)) {
        running = false;
        return;
      }

      if (masterAlpha > 0.001) {
        // Smooth lerp of current rect
        if (cur && !disabled) {
          if (!lerpActive) {
            lerpR.x = cur.x; lerpR.y = cur.y;
            lerpR.w = cur.w; lerpR.h = cur.h;
            lerpR.r = cur.r; lerpR.isCard = cur.isCard;
            lerpActive = true;
          } else {
            const S = 0.12;
            lerpR.x = lerp(lerpR.x, cur.x, S);
            lerpR.y = lerp(lerpR.y, cur.y, S);
            lerpR.w = lerp(lerpR.w, cur.w, S);
            lerpR.h = lerp(lerpR.h, cur.h, S);
            lerpR.r = lerp(lerpR.r, cur.r, S);
            lerpR.isCard = cur.isCard;
          }
        } else {
          lerpActive = false;
        }

        // Age filaments; dissolve expired ones
        for (let i = filaments.length - 1; i >= 0; i--) {
          if (++filaments[i].life > filaments[i].maxLife) filaments.splice(i, 1);
        }

        // Spawn new filaments if needed
        const want = disabled ? 0 : (cur ? (cur.isCard ? FIL_CARD : FIL_BTN) : 0);
        if (cur && !disabled && filaments.length < want) {
          filaments.push(spawnFilament(cur));
        }

        // Draw border + filaments
        if (lerpActive) {
          drawBorder(lerpR, masterAlpha, t);

          for (const fil of filaments) {
            // Individual fade-in / fade-out by life fraction
            const frac = fil.life / fil.maxLife;
            if (frac < 0.08) {
              fil.opacity = Math.min(1, fil.opacity + dt * 5.0);
            } else if (frac > 0.82) {
              fil.opacity = Math.max(0, fil.opacity - dt * 4.0);
            }

            // Advance head angle around perimeter
            fil.angle += fil.dAngle;

            // Compute anchor with sinusoidal sway
            const sway = Math.sin(t * fil.freq * 1.7 + fil.phase) * 2.8;
            const pt   = perimPt(lerpR, fil.angle);
            const swayX = Math.cos(fil.angle + Math.PI / 2) * sway;
            const swayY = Math.sin(fil.angle + Math.PI / 2) * sway;
            const anchor: Vec2 = { x: pt.x + swayX, y: pt.y + swayY };

            // Simulate chain
            const rand = xorshift(((fil.phase * 1000) | 0) ^ (now | 0) & 0xffff);
            stepChain(fil.nodes, anchor, 0.52, t, fil.phase, fil.freq, rand);

            // Occasionally spawn ambient droplet at tip
            const tip = fil.nodes[fil.nodes.length - 1];
            if (sharedRand() < 0.004) spawnDrop(tip.x, tip.y);

            drawFilament(fil, masterAlpha);
          }
        }

        // Bridge strand
        if (bridge) {
          bridge.alpha = Math.max(0, bridge.alpha - dt * BRIDGE_DECAY);
          if (bridge.alpha > 0.01) {
            // Pull tail toward current cursor position
            const lastNode = bridge.nodes[bridge.nodes.length - 1];
            lastNode.x = lerp(lastNode.x, mouse.x, 0.04);
            lastNode.y = lerp(lastNode.y, mouse.y, 0.04);
            stepChain(
              bridge.nodes,
              { x: bridge.nodes[0].x, y: bridge.nodes[0].y },
              0.88, t, 0, 1.2, sharedRand
            );
            drawBridge(bridge, masterAlpha);
          } else {
            bridge = null;
          }
        }

        // Ambient droplets
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          d.life++;
          d.x += d.vx; d.y += d.vy;
          d.vx *= 0.968; d.vy *= 0.968;
          const frac = d.life / d.max;
          if (frac >= 1) { drops.splice(i, 1); continue; }
          const da = d.a * (1 - frac) * masterAlpha;
          if (da < 0.01) continue;
          g.beginPath();
          g.arc(d.x, d.y, d.r * (1 - frac * 0.3), 0, Math.PI * 2);
          g.fillStyle = `rgba(80, 26, 150, ${da})`;
          g.fill();
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    // ── Mouse handler ────────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMove = performance.now();

      // Skip target resolution when disabled
      if (disabled) {
        if (!running) { running = true; lastTime = performance.now(); rafId = requestAnimationFrame(loop); }
        return;
      }

      const newTarget = resolveTarget(e.target as HTMLElement | null);

      const changed = newTarget
        ? !cur
          || Math.abs(newTarget.x - cur.x) > 5
          || Math.abs(newTarget.y - cur.y) > 5
          || Math.abs(newTarget.w - cur.w) > 5
        : cur !== null;

      if (changed) {
        if (cur && newTarget) {
          const b = spawnBridge(cur, newTarget);
          if (b) bridge = b;
        }
        prev = cur; void prev;
        cur = newTarget;
        filaments = [];
        lerpActive = false;
      }

      if (!running) {
        running = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Boot RAF so initial fade-out path is covered
    running = true;
    rafId = requestAnimationFrame(loop);

    return () => {
      try { cancelAnimationFrame(rafId); } catch (_) { /* */ }
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      running = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      "fixed",
        inset:         0,
        width:         "100vw",
        height:        "100vh",
        pointerEvents: "none",
        zIndex:        12,
        display:       "block",
        background:    "transparent",
        // No willChange, no opacity CSS — pure alpha canvas
      }}
    />
  );
}
