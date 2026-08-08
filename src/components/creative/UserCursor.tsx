"use client";

import { useEffect, useRef } from "react";

export interface UserCursorProps {
  name?: string;
  color?: string;
  textColor?: string;
  size?: number;
}

export function UserCursor({
  name = "EverythingHub",
  color = "#8b5cf6",
  textColor = "#ffffff",
  size = 28,
}: UserCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Disable custom cursor on touch/coarse devices
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let mouseX = -200;
    let mouseY = -200;
    let labelX = -200;
    let labelY = -200;
    let targetTilt = 0;
    let currentTilt = 0;
    let isHovering = false;
    let isPressed = false;
    let lastTime = performance.now();
    let lastX = 0;
    let animId: number;

    const updateLabelText = (target: HTMLElement | null) => {
      if (!labelTextRef.current) return;
      const customCursor = target?.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (customCursor) {
        labelTextRef.current.textContent = customCursor;
      } else if (target?.closest("a, button, [role='button']")) {
        labelTextRef.current.textContent = "Aç";
      } else if (target?.closest("input, textarea")) {
        labelTextRef.current.textContent = "Yaz";
      } else {
        labelTextRef.current.textContent = name;
      }
    };

    let idleFrames = 0;
    let isLoopRunning = false;

    // 120-240Hz RAF Loop exclusively for smooth fluid trailing of the name badge
    const renderLoop = () => {
      if (isHovering) {
        const dx = mouseX - labelX;
        const dy = mouseY - labelY;
        const dtilt = targetTilt - currentTilt;

        // Fluid trailing lerp for label badge
        const labelLerp = 0.32;
        labelX += dx * labelLerp;
        labelY += dy * labelLerp;

        currentTilt += dtilt * 0.2;
        targetTilt *= 0.88;

        if (labelRef.current) {
          const lx = labelX + size * 0.72;
          const ly = labelY + size * 0.4;
          const scale = isPressed ? 0.88 : 1;
          labelRef.current.style.transform = `translate3d(${lx}px, ${ly}px, 0) rotate(${currentTilt}deg) scale(${scale})`;
          labelRef.current.style.opacity = "1";
        }

        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && Math.abs(dtilt) < 0.01) {
          idleFrames++;
        } else {
          idleFrames = 0;
        }

        if (idleFrames > 25) {
          isLoopRunning = false;
          return;
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    const startLoopIfNeeded = () => {
      idleFrames = 0;
      if (!isLoopRunning) {
        isLoopRunning = true;
        animId = requestAnimationFrame(renderLoop);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovering = true;

      // 1. INSTANT 0ms LATENCY UPDATE FOR ARROW POINTER (1:1 with hardware mouse)
      if (cursorRef.current) {
        const scale = isPressed ? 0.88 : 1;
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${scale})`;
        cursorRef.current.style.opacity = "1";
      }

      // 2. Velocity Tilt Calculation for Trailing Label
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const vx = ((mouseX - lastX) / dt) * 1000;
      lastX = mouseX;
      lastTime = now;

      const speed = Math.abs(vx);
      const norm = Math.min(1, speed / 1400);
      const sign = vx > 0 ? 1 : vx < 0 ? -1 : 0;
      targetTilt = sign * norm * 18;

      updateLabelText(e.target as HTMLElement | null);
      startLoopIfNeeded();
    };

    const onPointerDown = () => {
      isPressed = true;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(0.85)`;
      }
    };

    const onPointerUp = () => {
      isPressed = false;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1)`;
      }
    };

    const onMouseLeave = () => {
      isHovering = false;
      targetTilt = 0;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
      if (labelRef.current) labelRef.current.style.opacity = "0";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [name, size]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Hardware-Accelerated 0ms Latency Instant Arrow Tip */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: size,
          height: size,
          opacity: 0,
          transformOrigin: "0% 0%",
          willChange: "transform, opacity",
          filter: "drop-shadow(0 4px 12px rgba(139, 92, 246, 0.65))",
          pointerEvents: "none",
          transition: "opacity 120ms ease",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 2 L24 14 L14 16 L11 25 Z"
            fill={color}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Fluid Trailing Name Badge */}
      <div
        ref={labelRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(99, 102, 241, 0.95))",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 999,
          padding: `${size * 0.16}px ${size * 0.4}px`,
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 24px -4px rgba(139, 92, 246, 0.45), 0 2px 8px rgba(0,0,0,0.5)",
          opacity: 0,
          transformOrigin: "0% 50%",
          willChange: "transform, opacity",
          userSelect: "none",
          pointerEvents: "none",
          transition: "opacity 120ms ease",
        }}
      >
        <span
          ref={labelTextRef}
          style={{
            color: textColor,
            fontSize: Math.max(9, size * 0.44),
            lineHeight: 1.1,
            fontWeight: 800,
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            whiteSpace: "nowrap",
            letterSpacing: "0.03em",
            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}
