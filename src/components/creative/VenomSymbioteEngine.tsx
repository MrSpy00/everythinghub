"use client";

import React, { useEffect, useRef } from "react";

interface TargetRect {
  x: number;
  y: number;
  w: number;
  h: number;
  borderRadius: number;
  isCard: boolean;
}

interface SlimeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
}

interface SymbioteTendril {
  rootAngle: number;
  length: number;
  baseWidth: number;
  wobbleSpeed: number;
  wobblePhase: number;
  reachFactor: number;
}

/**
 * VenomSymbioteEngine
 * Ultra-performance global Canvas 2D engine that renders a real, living, viscous
 * dark-purple & black Venom symbiote organism ("siyah-mor akışkan symbiote kütlesi").
 *
 * Behavior:
 * 1. Remains 100% dormant/invisible when cursor is in open background space.
 * 2. When hovering cards, boxes, or buttons, thick organic liquid slime tendrils and
 *    viscous pseudopods sprout from the borders and creep inward/towards the cursor,
 *    enveloping and overtaking ("ele geçirmeye çalışan") the element.
 * 3. Bridges between adjacent cards during cursor transitions with viscous liquid web strands.
 */
export function VenomSymbioteEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isEnabledRef = useRef<boolean>(true);

  // Pointer & Target Tracking
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const lastActiveTimeRef = useRef<number>(performance.now());
  const isLoopRunningRef = useRef<boolean>(false);

  // Active & Previous Bounding Rects
  const currentTargetRef = useRef<TargetRect | null>(null);
  const prevTargetRef = useRef<TargetRect | null>(null);
  const bridgeProgressRef = useRef<number>(1);

  // Lerped Active Rect
  const lerpRectRef = useRef<TargetRect>({
    x: -9999,
    y: -9999,
    w: 0,
    h: 0,
    borderRadius: 16,
    isCard: false,
  });

  // Organism Slime Tendrils & Particles
  const tendrilsRef = useRef<SymbioteTendril[]>([]);
  const particlesRef = useRef<SlimeParticle[]>([]);
  const activeAlphaRef = useRef<number>(0); // Smooth fade in/out of engine when entering/leaving cards

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || isTouchOnly) {
      isEnabledRef.current = false;
      return;
    }

    // Initialize 16 organic symbiote tendrils for card perimeter
    const initialTendrils: SymbioteTendril[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      initialTendrils.push({
        rootAngle: (i / count) * Math.PI * 2,
        length: 22 + Math.random() * 38,
        baseWidth: 8 + Math.random() * 12,
        wobbleSpeed: 1.2 + Math.random() * 1.8,
        wobblePhase: Math.random() * Math.PI * 2,
        reachFactor: 0.4 + Math.random() * 0.6,
      });
    }
    tendrilsRef.current = initialTendrils;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animFrameId: number | null = null;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Resize Handler
    const updateCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize, { passive: true });

    // Target Resolver logic - Finds cards, boxes, buttons across DOM
    const resolveTargetFromElement = (elem: HTMLElement | null): TargetRect | null => {
      if (!elem) return null;

      // 1. Cards, Containers, Sections
      const card = elem.closest<HTMLElement>(
        ".group, .rounded-2xl, .rounded-3xl, [data-venom], .hubsense-card, article, section > .border"
      );
      if (card && card.offsetWidth > 60 && card.offsetHeight > 40) {
        const rect = card.getBoundingClientRect();
        const style = window.getComputedStyle(card);
        const br = parseFloat(style.borderRadius) || 16;
        return {
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
          borderRadius: br,
          isCard: true,
        };
      }

      // 2. Buttons, Inputs, Controls
      const control = elem.closest<HTMLElement>("button, a, input, select, [role='button']");
      if (control && control.offsetWidth > 20) {
        const rect = control.getBoundingClientRect();
        const style = window.getComputedStyle(control);
        const br = parseFloat(style.borderRadius) || 12;
        return {
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
          borderRadius: br,
          isCard: false,
        };
      }

      return null;
    };

    // Pointer Event Handling
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      mousePosRef.current = { x, y };
      lastActiveTimeRef.current = performance.now();

      const targetElem = e.target as HTMLElement | null;
      const newTarget = resolveTargetFromElement(targetElem);

      const prevTarget = currentTargetRef.current;
      if (
        newTarget &&
        (!prevTarget || Math.abs(newTarget.x - prevTarget.x) > 4 || Math.abs(newTarget.y - prevTarget.y) > 4)
      ) {
        prevTargetRef.current = prevTarget;
        currentTargetRef.current = newTarget;
        bridgeProgressRef.current = 0; // Trigger bridge transition
      } else if (!newTarget && prevTarget) {
        prevTargetRef.current = prevTarget;
        currentTargetRef.current = null;
        bridgeProgressRef.current = 0;
      }

      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animFrameId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Spawn viscous bio-slime droplet particles
    const spawnSlimeParticle = (x: number, y: number, isBridge: boolean = false) => {
      if (particlesRef.current.length > (isBridge ? 35 : 20)) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.5;
      const palette = ["#7c3aed", "#4c1d95", "#a855f7", "#2e1065", "#c084fc"];
      const color = palette[Math.floor(Math.random() * palette.length)];

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 3.0,
        alpha: 0.9,
        maxLife: 20 + Math.random() * 30,
        life: 0,
        color,
      });
    };

    // Main Canvas Render Loop
    const renderLoop = (timestamp: number) => {
      const now = timestamp;
      const dt = 0.016;

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const currentTarget = currentTargetRef.current;
      const prevTarget = prevTargetRef.current;

      // Fade active alpha (1.0 when over card, 0.0 when in empty space)
      if (currentTarget) {
        activeAlphaRef.current = Math.min(1, activeAlphaRef.current + dt * 6.0);
      } else {
        activeAlphaRef.current = Math.max(0, activeAlphaRef.current - dt * 4.0);
      }

      // Check sleep safeguard: if activeAlpha is 0 and mouse is idle > 2.5s, pause rendering loop
      if (activeAlphaRef.current <= 0.001 && now - lastActiveTimeRef.current > 2500) {
        isLoopRunningRef.current = false;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        return;
      }

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // If activeAlpha is 0, skip heavy drawing
      if (activeAlphaRef.current <= 0.001) {
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // Update bridge transition progress
      if (bridgeProgressRef.current < 1) {
        bridgeProgressRef.current = Math.min(1, bridgeProgressRef.current + dt * 2.8);
      }

      // Lerp active rect
      const lerp = lerpRectRef.current;
      if (currentTarget) {
        if (lerp.x === -9999) {
          lerp.x = currentTarget.x;
          lerp.y = currentTarget.y;
          lerp.w = currentTarget.w;
          lerp.h = currentTarget.h;
          lerp.borderRadius = currentTarget.borderRadius;
          lerp.isCard = currentTarget.isCard;
        } else {
          const speed = 0.16;
          lerp.x += (currentTarget.x - lerp.x) * speed;
          lerp.y += (currentTarget.y - lerp.y) * speed;
          lerp.w += (currentTarget.w - lerp.w) * speed;
          lerp.h += (currentTarget.h - lerp.h) * speed;
          lerp.borderRadius += (currentTarget.borderRadius - lerp.borderRadius) * speed;
          lerp.isCard = currentTarget.isCard;
        }
      }

      const rx = lerp.x;
      const ry = lerp.y;
      const rw = lerp.w;
      const rh = lerp.h;
      const rbr = Math.min(lerp.borderRadius, Math.min(rw, rh) / 2);
      const time = now * 0.0022;
      const globalAlpha = activeAlphaRef.current;

      ctx.save();
      ctx.globalAlpha = globalAlpha;

      // --- LAYER 1: Viscous Card-to-Card Host Bridge ---
      if (prevTarget && currentTarget && bridgeProgressRef.current < 1) {
        const prog = bridgeProgressRef.current;
        const bridgeAlpha = (1 - prog) * 0.85;

        const p1x = prevTarget.x + prevTarget.w / 2;
        const p1y = prevTarget.y + prevTarget.h / 2;
        const p2x = currentTarget.x + currentTarget.w / 2;
        const p2y = currentTarget.y + currentTarget.h / 2;

        const midX = (p1x + p2x) / 2 + Math.sin(time * 5) * 40;
        const midY = (p1y + p2y) / 2 + Math.cos(time * 5) * 40;

        // Thick viscous dark core bridge
        ctx.save();
        ctx.lineWidth = Math.max(4, 20 * (1 - prog));
        ctx.strokeStyle = `rgba(10, 4, 22, ${bridgeAlpha * 0.95})`;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.quadraticCurveTo(midX, midY, p2x, p2y);
        ctx.stroke();

        // Glowing violet vein inside bridge
        ctx.lineWidth = Math.max(2, 8 * (1 - prog));
        ctx.strokeStyle = `rgba(124, 58, 237, ${bridgeAlpha})`;
        ctx.shadowColor = "rgba(168, 85, 247, 0.9)";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.quadraticCurveTo(midX, midY, p2x, p2y);
        ctx.stroke();
        ctx.restore();

        if (Math.random() < 0.35) {
          spawnSlimeParticle(midX, midY, true);
        }
      }

      // --- LAYER 2: Real Viscous Venom Slime & Pseudopod Envelopment ---
      if (rw > 0 && rh > 0) {
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;
        const isCard = currentTarget?.isCard ?? true;
        const pulse = Math.sin(time * 2.8) * 0.08 + 1.0;

        ctx.save();

        // 1. Viscous Outer Dark Slime Membrane (Filled organic creep around card border)
        ctx.shadowColor = isCard ? "rgba(124, 58, 237, 0.4)" : "rgba(168, 85, 247, 0.3)";
        ctx.shadowBlur = (isCard ? 20 : 12) * pulse;

        // Draw organic fluid border stroke
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(rx - 3, ry - 3, rw + 6, rh + 6, rbr + 3);
        } else {
          ctx.rect(rx - 3, ry - 3, rw + 6, rh + 6);
        }
        ctx.strokeStyle = isCard ? "rgba(124, 58, 237, 0.45)" : "rgba(168, 85, 247, 0.35)";
        ctx.lineWidth = isCard ? 2.5 : 1.5;
        ctx.stroke();

        // 2. Thick Viscous Pseudopod Tentacles Growing from Card Edges Toward Cursor
        const tendrils = tendrilsRef.current;
        for (let i = 0; i < tendrils.length; i++) {
          const tNode = tendrils[i];
          const angle = tNode.rootAngle + Math.sin(time * tNode.wobbleSpeed + tNode.wobblePhase) * 0.25;

          // Compute start point along border of card
          const edgeX = cx + (Math.cos(angle) * rw) / 2;
          const edgeY = cy + (Math.sin(angle) * rh) / 2;

          // Vector from card edge to cursor
          const dx = mx - edgeX;
          const dy = my - edgeY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Tendril reaches towards cursor if cursor is inside/near card
          const reachMult = Math.max(0.2, 1 - dist / (Math.max(rw, rh) * 1.2));
          const len = tNode.length * reachMult * pulse;
          const baseW = tNode.baseWidth * reachMult * pulse;

          // Control points for fluid Bezier tentacle shape
          const midX = edgeX + (dx / dist) * (len * 0.5) + Math.cos(angle + Math.PI / 2) * (10 * Math.sin(time * 4 + i));
          const midY = edgeY + (dy / dist) * (len * 0.5) + Math.sin(angle + Math.PI / 2) * (10 * Math.cos(time * 4 + i));
          const tipX = edgeX + (dx / dist) * len;
          const tipY = edgeY + (dy / dist) * len;

          if (baseW > 1.5) {
            // Draw filled viscous dark purple/black tentacle (tapered from root to tip)
            ctx.save();
            ctx.fillStyle = "rgba(10, 4, 22, 0.95)";
            ctx.strokeStyle = "rgba(124, 58, 237, 0.75)";
            ctx.lineWidth = Math.max(1, baseW * 0.25);
            ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
            ctx.shadowBlur = 8;

            ctx.beginPath();
            // Left boundary of thick tentacle
            const perpX = -dy / dist;
            const perpY = dx / dist;

            ctx.moveTo(edgeX + perpX * (baseW / 2), edgeY + perpY * (baseW / 2));
            ctx.quadraticCurveTo(midX + perpX * (baseW / 4), midY + perpY * (baseW / 4), tipX, tipY);
            ctx.quadraticCurveTo(midX - perpX * (baseW / 4), midY - perpY * (baseW / 4), edgeX - perpX * (baseW / 2), edgeY - perpY * (baseW / 2));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Specular wet reflection highlight along tentacle spine
            ctx.strokeStyle = "rgba(216, 180, 254, 0.85)";
            ctx.lineWidth = Math.max(0.8, baseW * 0.1);
            ctx.beginPath();
            ctx.moveTo(edgeX, edgeY);
            ctx.quadraticCurveTo(midX, midY, tipX, tipY);
            ctx.stroke();

            ctx.restore();

            if (Math.random() < 0.12) {
              spawnSlimeParticle(tipX, tipY);
            }
          }
        }
        ctx.restore();
      }

      // --- LAYER 3: Render & Update Viscous Slime Droplet Particles ---
      ctx.save();
      const activeParticles = particlesRef.current;
      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;

        const progress = p.life / p.maxLife;
        const currentAlpha = (1 - progress) * p.alpha;

        if (progress >= 1) {
          activeParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha * globalAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore(); // Restore globalAlpha

      animFrameId = requestAnimationFrame(renderLoop);
    };

    isLoopRunningRef.current = true;
    animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      isLoopRunningRef.current = false;
    };
  }, []);

  if (!isEnabledRef.current) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[12] block"
      aria-hidden="true"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
