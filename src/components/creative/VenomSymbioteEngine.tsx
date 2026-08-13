"use client";

import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   VENOM SYMBIOTE ENGINE  v3.1  — "Living Border Filament"
   
   Principles:
   · Fully transparent when not on an interactive element (invisible in open space)
   · Ultra-thin serpentine filaments live on element border outlines only
   · Real Verlet-spring physics: soft, organic, snake-like movement
   · Bridge filament between elements on cursor transition
   · Full sleep/wake lifecycle — RAF loop completely halts when idle
   · Zero opaque rendering — canvas is always transparent by nature
   · Production-safe: try/catch guards on all canvas operations
────────────────────────────────────────────────────────────────────────────── */

const SEGMENTS = 22;
const FILAMENT_COUNT_CARD = 5;
const FILAMENT_COUNT_BTN = 3;
const SEG_REST_DIST = 13;
const SPRING_K = 0.16;
const DAMPING = 0.80;
const FADE_IN = 5.5;
const FADE_OUT = 3.8;
const IDLE_SLEEP = 3200; // ms idle before sleeping
const BRIDGE_DECAY = 2.5;
const MAX_DROPLETS = 32;

interface BRect { x: number; y: number; w: number; h: number; r: number; isCard: boolean; }
interface V2 { x: number; y: number; }
interface Node { x: number; y: number; px: number; py: number; }
interface Fil {
  nodes: Node[];
  angle: number;
  dAngle: number;
  opacity: number;
  width: number;
  phase: number;
  life: number;
  maxLife: number;
}
interface Bridge { nodes: Node[]; alpha: number; }
interface Drop { x: number; y: number; vx: number; vy: number; r: number; a: number; life: number; max: number; }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function perimeter(rect: BRect, angle: number): V2 {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const OUTSET = 3.5;
  return {
    x: cx + (rect.w / 2 + OUTSET) * Math.cos(angle),
    y: cy + (rect.h / 2 + OUTSET) * Math.sin(angle),
  };
}

function chain(ox: number, oy: number, angle: number, n: number): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < n; i++) {
    const x = ox + Math.cos(angle) * i * SEG_REST_DIST * 0.28;
    const y = oy + Math.sin(angle) * i * SEG_REST_DIST * 0.28;
    nodes.push({ x, y, px: x, py: y });
  }
  return nodes;
}

function verlet(nodes: Node[], anchor: V2, t: number) {
  if (!nodes.length) return;
  nodes[0].x = lerp(nodes[0].x, anchor.x, 0.55);
  nodes[0].y = lerp(nodes[0].y, anchor.y, 0.55);
  nodes[0].px = nodes[0].x;
  nodes[0].py = nodes[0].y;

  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    const vx = (n.x - n.px) * DAMPING;
    const vy = (n.y - n.py) * DAMPING;
    const drift = Math.sin(t * 1.4 + i * 0.55) * 0.07;
    n.px = n.x;
    n.py = n.y;
    n.x += vx + Math.cos(t * 0.9 + i * 0.7) * drift;
    n.y += vy + Math.sin(t * 1.2 + i * 0.6) * drift;
  }

  for (let iter = 0; iter < 3; iter++) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const rest = SEG_REST_DIST * (0.38 + i * 0.028);
      const diff = (d - rest) / d * SPRING_K;
      if (i > 0) { a.x += dx * diff; a.y += dy * diff; }
      b.x -= dx * diff;
      b.y -= dy * diff;
    }
  }
}

function resolveTarget(el: HTMLElement | null): BRect | null {
  if (!el) return null;
  try {
    const card = el.closest<HTMLElement>(
      ".group, [data-venom], article, .rounded-2xl, .rounded-3xl, section > .border, .hubsense-card, .neon-card"
    );
    if (card && card.offsetWidth > 60 && card.offsetHeight > 40) {
      const r = card.getBoundingClientRect();
      const s = getComputedStyle(card);
      return { x: r.left, y: r.top, w: r.width, h: r.height, r: parseFloat(s.borderRadius) || 16, isCard: true };
    }
    const ctrl = el.closest<HTMLElement>("button, a, input, select, textarea, [role='button'], label");
    if (ctrl && ctrl.offsetWidth > 20) {
      const r = ctrl.getBoundingClientRect();
      const s = getComputedStyle(ctrl);
      return { x: r.left, y: r.top, w: r.width, h: r.height, r: parseFloat(s.borderRadius) || 8, isCard: false };
    }
  } catch (_) { /* safety guard */ }
  return null;
}

export function VenomSymbioteEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches) return;
    } catch (_) { return; }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let g: CanvasRenderingContext2D | null = null;
    try {
      g = canvas.getContext("2d", { alpha: true });
    } catch (_) { return; }
    if (!g) return;

    // Pin reference so TS knows it's non-null in all closures below
    const ctx = g;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      try {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = window.innerWidth;
        const H = window.innerHeight;
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } catch (_) { /* ignore resize errors */ }
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // State
    const mouse = { x: -9999, y: -9999 };
    let lastMove = performance.now();
    let cur: BRect | null = null;
    let prev: BRect | null = null;
    let masterAlpha = 0;
    let rafId = 0;
    let running = false;

    const lerpR: BRect = { x: -9999, y: -9999, w: 0, h: 0, r: 16, isCard: false };
    let lerpActive = false;

    let fils: Fil[] = [];
    let bridge: Bridge | null = null;
    const drops: Drop[] = [];

    function wantCount() {
      return cur ? (cur.isCard ? FILAMENT_COUNT_CARD : FILAMENT_COUNT_BTN) : 0;
    }

    function spawnFil(rect: BRect): Fil {
      const a = Math.random() * Math.PI * 2;
      const pt = perimeter(rect, a);
      return {
        nodes: chain(pt.x, pt.y, a, SEGMENTS),
        angle: a,
        dAngle: (Math.random() * 0.013 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
        opacity: 0,
        width: (rect.isCard ? 1.3 : 0.85) + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 200 + Math.floor(Math.random() * 130),
      };
    }

    function spawnBridge(from: BRect, to: BRect): Bridge {
      const fp = perimeter(from, 0);
      const tp = perimeter(to, Math.PI);
      const n = 18;
      const nodes: Node[] = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x = lerp(fp.x, tp.x, t);
        const y = lerp(fp.y, tp.y, t);
        nodes.push({ x, y, px: x, py: y });
      }
      return { nodes, alpha: 1 };
    }

    function spawnDrop(x: number, y: number) {
      if (drops.length >= MAX_DROPLETS) return;
      const a = Math.random() * Math.PI * 2;
      const spd = 0.12 + Math.random() * 0.5;
      drops.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: 0.5 + Math.random() * 1.2, a: 0.4 + Math.random() * 0.3, life: 0, max: 25 + Math.floor(Math.random() * 35) });
    }

    function drawBorder(rect: BRect, ma: number, t: number) {
      if (rect.w < 1 || rect.h < 1 || ma < 0.01) return;
      const { x, y, w, h, r, isCard } = rect;
      const OS = 2.5;
      const pulse = 1 + Math.sin(t * 2.1) * 0.04;

      ctx.save();

      // dark creep ring
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x - OS, y - OS, w + OS * 2, h + OS * 2, r + OS);
      } else {
        ctx.rect(x - OS, y - OS, w + OS * 2, h + OS * 2);
      }
      ctx.strokeStyle = `rgba(8, 2, 18, ${ma * 0.50 * pulse})`;
      ctx.lineWidth = isCard ? 1.8 : 1.1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // violet vein
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x - OS + 0.5, y - OS + 0.5, w + OS * 2 - 1, h + OS * 2 - 1, r + OS - 0.5);
      } else {
        ctx.rect(x - OS + 0.5, y - OS + 0.5, w + OS * 2 - 1, h + OS * 2 - 1);
      }
      ctx.strokeStyle = `rgba(100, 38, 175, ${ma * 0.26 * pulse})`;
      ctx.lineWidth = isCard ? 0.9 : 0.55;
      ctx.shadowColor = "rgba(130, 55, 240, 0.5)";
      ctx.shadowBlur = isCard ? 7 : 3.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    function drawFil(fil: Fil, ma: number) {
      const { nodes, width, opacity } = fil;
      if (nodes.length < 2 || opacity * ma < 0.01) return;

      ctx.save();
      for (let i = 0; i < nodes.length - 1; i++) {
        const t = i / (nodes.length - 1);
        const lw = width * Math.pow(1 - t, 1.6);
        if (lw < 0.08) continue;
        const a = nodes[i];
        const b = nodes[i + 1];
        const ca = opacity * ma * (1 - t * 0.65);
        const ga = opacity * ma * (1 - t) * 0.50;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(6, 1, 16, ${ca})`;
        ctx.lineWidth = lw;
        ctx.lineCap = "round";
        ctx.stroke();

        if (ga > 0.025) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(115, 45, 195, ${ga})`;
          ctx.lineWidth = Math.max(0.25, lw * 0.38);
          ctx.shadowColor = "rgba(145, 75, 245, 0.55)";
          ctx.shadowBlur = 3.5;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
      ctx.restore();
    }

    function drawBridge(br: Bridge, ma: number) {
      const alpha = br.alpha * ma;
      if (alpha < 0.01 || br.nodes.length < 2) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(br.nodes[0].x, br.nodes[0].y);
      for (let i = 1; i < br.nodes.length; i++) {
        const p = br.nodes[i - 1];
        const c = br.nodes[i];
        ctx.quadraticCurveTo(p.x, p.y, (p.x + c.x) / 2, (p.y + c.y) / 2);
      }
      ctx.strokeStyle = "rgba(75, 22, 145, 0.65)";
      ctx.lineWidth = 0.75;
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(125, 55, 215, 0.45)";
      ctx.shadowBlur = 4.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const t = now * 0.001;
      const W = window.innerWidth;
      const H = window.innerHeight;

      try {
        ctx.clearRect(0, 0, W, H);
      } catch (_) {
        running = false;
        return;
      }

      // Master alpha
      if (cur) {
        masterAlpha = Math.min(1, masterAlpha + dt * FADE_IN);
      } else {
        masterAlpha = Math.max(0, masterAlpha - dt * FADE_OUT);
      }

      // Sleep check
      if (masterAlpha <= 0.001 && now - lastMove > IDLE_SLEEP) {
        running = false;
        return;
      }

      if (masterAlpha > 0.001) {
        // Lerp rect
        if (cur) {
          if (!lerpActive) {
            lerpR.x = cur.x; lerpR.y = cur.y;
            lerpR.w = cur.w; lerpR.h = cur.h;
            lerpR.r = cur.r; lerpR.isCard = cur.isCard;
            lerpActive = true;
          } else {
            const S = 0.13;
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

        // Age filaments
        for (let i = fils.length - 1; i >= 0; i--) {
          fils[i].life++;
          if (fils[i].life > fils[i].maxLife) fils.splice(i, 1);
        }

        // Spawn if needed
        if (cur && fils.length < wantCount()) fils.push(spawnFil(cur));

        // Draw border outline
        if (lerpActive) {
          drawBorder(lerpR, masterAlpha, t);

          for (const fil of fils) {
            const frac = fil.life / fil.maxLife;
            if (frac < 0.1) fil.opacity = Math.min(1, fil.opacity + dt * 4.5);
            else if (frac > 0.8) fil.opacity = Math.max(0, fil.opacity - dt * 3.5);

            fil.angle += fil.dAngle;
            const pt = perimeter(lerpR, fil.angle);
            const sway = Math.sin(t * 1.9 + fil.phase) * 2.5;
            pt.x += Math.cos(fil.angle + Math.PI / 2) * sway;
            pt.y += Math.sin(fil.angle + Math.PI / 2) * sway;

            verlet(fil.nodes, pt, t + fil.phase);

            const tip = fil.nodes[fil.nodes.length - 1];
            if (Math.random() < 0.005) spawnDrop(tip.x, tip.y);

            drawFil(fil, masterAlpha);
          }
        }

        // Bridge
        if (bridge) {
          bridge.alpha = Math.max(0, bridge.alpha - dt * BRIDGE_DECAY);
          if (bridge.alpha > 0.01) {
            const last = bridge.nodes.length - 1;
            verlet(bridge.nodes, { x: bridge.nodes[0].x, y: bridge.nodes[0].y }, t);
            bridge.nodes[last].x = lerp(bridge.nodes[last].x, mouse.x, 0.05);
            bridge.nodes[last].y = lerp(bridge.nodes[last].y, mouse.y, 0.05);
            drawBridge(bridge, masterAlpha);
          } else {
            bridge = null;
          }
        }

        // Droplets
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          d.life++;
          d.x += d.vx; d.y += d.vy;
          d.vx *= 0.97; d.vy *= 0.97;
          const frac = d.life / d.max;
          if (frac >= 1) { drops.splice(i, 1); continue; }
          const da = d.a * (1 - frac) * masterAlpha;
          if (da < 0.01) continue;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r * (1 - frac * 0.35), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(85, 28, 155, ${da})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMove = performance.now();

      const newTarget = resolveTarget(e.target as HTMLElement | null);
      const changed = newTarget
        ? !cur
          || Math.abs(newTarget.x - cur.x) > 6
          || Math.abs(newTarget.y - cur.y) > 6
          || Math.abs(newTarget.w - cur.w) > 6
        : cur !== null;

      if (changed) {
        if (cur && newTarget) bridge = spawnBridge(cur, newTarget);
        prev = cur; void prev;
        cur = newTarget;
        fils = [];
        lerpActive = false;
      }

      if (!running) {
        running = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    // Start loop to enable fade-out on page load
    running = true;
    rafId = requestAnimationFrame(loop);

    return () => {
      try { cancelAnimationFrame(rafId); } catch (_) { /* */ }
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      running = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 12,
        display: "block",
        background: "transparent",
        // NO willChange — avoids GPU layer opacity bugs
        // NO opacity CSS — purely alpha:true canvas
      }}
    />
  );
}
