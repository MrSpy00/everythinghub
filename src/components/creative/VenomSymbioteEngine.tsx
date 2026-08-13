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

interface BioParticle {
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

interface TendrilNode {
  angle: number;
  length: number;
  speed: number;
  offset: number;
}

/**
 * VenomSymbioteEngine
 * Ultra-performance global Canvas 2D engine that renders a living, slithering
 * dark-violet/black organic symbiote ("siyah-mor venom sarmasığı") following the
 * cursor and seamlessly morphing/bridging between cards, boxes, and buttons site-wide.
 */
export function VenomSymbioteEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isEnabledRef = useRef<boolean>(true);

  // Mouse & Target States
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const lastActiveTimeRef = useRef<number>(performance.now());
  const isLoopRunningRef = useRef<boolean>(false);

  // Current & Previous Element Bounding Rects
  const currentTargetRef = useRef<TargetRect | null>(null);
  const prevTargetRef = useRef<TargetRect | null>(null);
  const bridgeProgressRef = useRef<number>(1); // 0 -> 1 when transitioning between targets

  // Smooth Interpolated Active Rect
  const lerpRectRef = useRef<TargetRect>({
    x: -9999,
    y: -9999,
    w: 0,
    h: 0,
    borderRadius: 16,
    isCard: false,
  });

  // Particles & Tendril Nodes
  const particlesRef = useRef<BioParticle[]>([]);
  const tendrilNodesRef = useRef<TendrilNode[]>([]);

  useEffect(() => {
    // Check reduced motion & coarse touch pointers
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || isTouchOnly) {
      isEnabledRef.current = false;
      return;
    }

    // Initialize organic tendril nodes
    const nodeCount = 14;
    const initialNodes: TendrilNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      initialNodes.push({
        angle: (i / nodeCount) * Math.PI * 2,
        length: 12 + Math.random() * 24,
        speed: 0.8 + Math.random() * 1.4,
        offset: Math.random() * Math.PI * 2,
      });
    }
    tendrilNodesRef.current = initialNodes;

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

      // 1. Check for specific card containers
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

      // 2. Check for buttons, inputs, links
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

      // Find interactive target beneath or near cursor
      const targetElem = e.target as HTMLElement | null;
      const newTarget = resolveTargetFromElement(targetElem);

      const prevTarget = currentTargetRef.current;
      if (
        newTarget &&
        (!prevTarget || Math.abs(newTarget.x - prevTarget.x) > 4 || Math.abs(newTarget.y - prevTarget.y) > 4)
      ) {
        prevTargetRef.current = prevTarget;
        currentTargetRef.current = newTarget;
        bridgeProgressRef.current = 0; // Trigger bridge tendril transition
      } else if (!newTarget && prevTarget) {
        prevTargetRef.current = prevTarget;
        currentTargetRef.current = null;
        bridgeProgressRef.current = 0;
      }

      // Restart loop if paused
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animFrameId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Spawn bio-spark particles along tendrils
    const spawnBioParticle = (x: number, y: number, isBridge: boolean = false) => {
      if (particlesRef.current.length > (isBridge ? 40 : 25)) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.2;
      const palette = ["#a855f7", "#7c3aed", "#c084fc", "#6366f1", "#d8b4fe"];
      const color = palette[Math.floor(Math.random() * palette.length)];

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.85,
        maxLife: 25 + Math.random() * 35,
        life: 0,
        color,
      });
    };

    // Main Canvas Render Loop
    const renderLoop = (timestamp: number) => {
      const now = timestamp;
      const dt = 0.016; // Approx 60fps frame delta

      // Check idle time (sleep safeguard: pause loop after 2.5s of no mouse movement)
      if (now - lastActiveTimeRef.current > 2500) {
        isLoopRunningRef.current = false;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        return;
      }

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const currentTarget = currentTargetRef.current;
      const prevTarget = prevTargetRef.current;

      // Update bridge transition progress
      if (bridgeProgressRef.current < 1) {
        bridgeProgressRef.current = Math.min(1, bridgeProgressRef.current + dt * 3.2);
      }

      // Compute ideal target rect (if hovering empty space, target is aura around cursor)
      const defaultRect: TargetRect = {
        x: mx - 24,
        y: my - 24,
        w: 48,
        h: 48,
        borderRadius: 24,
        isCard: false,
      };

      const desiredRect = currentTarget || defaultRect;
      const lerp = lerpRectRef.current;

      // Initialize lerp rect on first move
      if (lerp.x === -9999) {
        lerp.x = desiredRect.x;
        lerp.y = desiredRect.y;
        lerp.w = desiredRect.w;
        lerp.h = desiredRect.h;
        lerp.borderRadius = desiredRect.borderRadius;
        lerp.isCard = desiredRect.isCard;
      } else {
        // Smooth organic elastic spring lerping
        const speed = currentTarget ? 0.18 : 0.12;
        lerp.x += (desiredRect.x - lerp.x) * speed;
        lerp.y += (desiredRect.y - lerp.y) * speed;
        lerp.w += (desiredRect.w - lerp.w) * speed;
        lerp.h += (desiredRect.h - lerp.h) * speed;
        lerp.borderRadius += (desiredRect.borderRadius - lerp.borderRadius) * speed;
        lerp.isCard = desiredRect.isCard;
      }

      const rx = lerp.x;
      const ry = lerp.y;
      const rw = lerp.w;
      const rh = lerp.h;
      const rbr = Math.min(lerp.borderRadius, Math.min(rw, rh) / 2);
      const time = now * 0.0025;

      // --- LAYER 1: Draw Symbiote Slithering Tendril Bridge (When moving Card A -> Card B) ---
      if (prevTarget && currentTarget && bridgeProgressRef.current < 1) {
        const prog = bridgeProgressRef.current;
        const bridgeAlpha = (1 - prog) * 0.75;

        const p1x = prevTarget.x + prevTarget.w / 2;
        const p1y = prevTarget.y + prevTarget.h / 2;
        const p2x = currentTarget.x + currentTarget.w / 2;
        const p2y = currentTarget.y + currentTarget.h / 2;

        ctx.save();
        ctx.lineWidth = Math.max(3, 14 * (1 - prog));
        ctx.strokeStyle = `rgba(124, 58, 237, ${bridgeAlpha})`;
        ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
        ctx.shadowBlur = 18;

        // Slithering Bezier curve with Sine wave perturbation
        const midX = (p1x + p2x) / 2 + Math.sin(time * 6) * 35;
        const midY = (p1y + p2y) / 2 + Math.cos(time * 6) * 35;

        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.quadraticCurveTo(midX, midY, p2x, p2y);
        ctx.stroke();

        // Secondary slithering organic dark tendril branch
        ctx.lineWidth = Math.max(1.5, 6 * (1 - prog));
        ctx.strokeStyle = `rgba(18, 4, 38, ${bridgeAlpha * 0.9})`;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.quadraticCurveTo(midX - 20, midY + 20, p2x, p2y);
        ctx.stroke();
        ctx.restore();

        if (Math.random() < 0.4) {
          spawnBioParticle(midX, midY, true);
        }
      }

      // --- LAYER 2: Symbiote Organic Border Wrap & Living Pseudopods ---
      if (rw > 0 && rh > 0 && mx > -500) {
        ctx.save();

        // Outer Living Symbiote Aura Glow
        const isCard = currentTarget?.isCard;
        const auraGlow = isCard ? 24 : 14;
        const pulse = Math.sin(time * 3) * 0.12 + 1.0;

        ctx.shadowColor = isCard ? "rgba(139, 92, 246, 0.45)" : "rgba(168, 85, 247, 0.35)";
        ctx.shadowBlur = auraGlow * pulse;

        // Draw organic rounded bounding path clinging to element
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(rx - 2, ry - 2, rw + 4, rh + 4, rbr + 2);
        } else {
          ctx.rect(rx - 2, ry - 2, rw + 4, rh + 4);
        }
        ctx.strokeStyle = isCard
          ? "rgba(139, 92, 246, 0.35)"
          : "rgba(168, 85, 247, 0.25)";
        ctx.lineWidth = isCard ? 1.8 : 1.2;
        ctx.stroke();

        // --- LAYER 3: Slithering Edge Tendrils (Venom Sarmalıkları) ---
        const tendrils = tendrilNodesRef.current;
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(168, 85, 247, 0.65)";
        ctx.shadowColor = "rgba(192, 132, 252, 0.8)";
        ctx.shadowBlur = 10;

        for (let i = 0; i < tendrils.length; i++) {
          const tNode = tendrils[i];
          const currentAngle = tNode.angle + Math.sin(time * tNode.speed + tNode.offset) * 0.35;
          const len = tNode.length * (isCard ? 1.2 : 0.8) * pulse;

          // Determine start point on edge of bounding box
          const edgeX = cx + (Math.cos(currentAngle) * rw) / 2;
          const edgeY = cy + (Math.sin(currentAngle) * rh) / 2;

          // Control point for organic wave curve
          const ctrlX = edgeX + Math.cos(currentAngle + 0.5) * (len * 0.6);
          const ctrlY = edgeY + Math.sin(currentAngle + 0.5) * (len * 0.6);

          // Tip point following cursor vector
          const dxToMouse = mx - edgeX;
          const dyToMouse = my - edgeY;
          const distToMouse = Math.sqrt(dxToMouse * dxToMouse + dyToMouse * dyToMouse) || 1;
          const tipX = edgeX + (Math.cos(currentAngle) * len) + (dxToMouse / distToMouse) * 8;
          const tipY = edgeY + (Math.sin(currentAngle) * len) + (dyToMouse / distToMouse) * 8;

          ctx.beginPath();
          ctx.moveTo(edgeX, edgeY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
          ctx.stroke();

          if (Math.random() < 0.15) {
            spawnBioParticle(tipX, tipY);
          }
        }
        ctx.restore();
      }

      // --- LAYER 4: Render & Update Bio-Luminescent Particles ---
      ctx.save();
      const activeParticles = particlesRef.current;
      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;

        const progress = p.life / p.maxLife;
        const currentAlpha = (1 - progress) * p.alpha;

        if (progress >= 1) {
          activeParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animFrameId = requestAnimationFrame(renderLoop);
    };

    // Kick off animation loop
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
