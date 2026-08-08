"use client";

import { useEffect, useRef } from "react";

export interface UserCursorProps {
  name?: string;
  color?: string;
  textColor?: string;
  size?: number;
}

export function UserCursor({
  name = "Studio",
  color = "#a855f7",
  textColor = "#ffffff",
  size = 28,
}: UserCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Check if pointer is touch/coarse without React state cascading render
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let labelX = -100;
    let labelY = -100;
    let targetTilt = 0;
    let currentTilt = 0;
    let isHovering = false;
    let isPressed = false;
    let lastTime = performance.now();
    let lastX = 0;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovering = true;

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const vx = ((mouseX - lastX) / dt) * 1000;
      lastX = mouseX;
      lastTime = now;

      // Velocity tilt calculation
      const speed = Math.abs(vx);
      const norm = Math.min(1, speed / 1200);
      const sign = vx > 0 ? 1 : vx < 0 ? -1 : 0;
      targetTilt = sign * norm * 22;

      // Update label text directly on DOM ref for 0ms latency & zero React re-render lag
      const target = e.target as HTMLElement | null;
      const customCursor = target?.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (labelTextRef.current) {
        if (customCursor) {
          labelTextRef.current.textContent = customCursor;
        } else if (target?.closest("a, button, [role='button']")) {
          labelTextRef.current.textContent = "Aç";
        } else if (target?.closest("input, textarea")) {
          labelTextRef.current.textContent = "Yaz";
        } else {
          labelTextRef.current.textContent = name;
        }
      }
    };

    const onDown = () => {
      isPressed = true;
    };

    const onUp = () => {
      isPressed = false;
    };

    const onLeave = () => {
      isHovering = false;
      targetTilt = 0;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    // 120 FPS hardware-accelerated RAF render loop
    const render = () => {
      // Spring physics interpolation
      const cursorLerp = isPressed ? 0.45 : 0.35;
      cursorX += (mouseX - cursorX) * cursorLerp;
      cursorY += (mouseY - cursorY) * cursorLerp;

      const labelLerp = 0.18;
      labelX += (mouseX - labelX) * labelLerp;
      labelY += (mouseY - labelY) * labelLerp;

      currentTilt += (targetTilt - currentTilt) * 0.15;
      targetTilt *= 0.92; // Decay tilt smoothly

      const scale = isPressed ? 0.85 : 1;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) scale(${scale})`;
        cursorRef.current.style.opacity = isHovering ? "1" : "0";
      }

      if (labelRef.current) {
        const lx = labelX + size * 0.75;
        const ly = labelY + size * 0.45;
        labelRef.current.style.transform = `translate3d(${lx}px, ${ly}px, 0) rotate(${currentTilt}deg) scale(${scale})`;
        labelRef.current.style.opacity = isHovering ? "1" : "0";
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [name, size]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* 120 FPS Spring Label Badge */}
      <div
        ref={labelRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(99, 102, 241, 0.95))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 999,
          padding: `${size * 0.16}px ${size * 0.4}px`,
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow:
            "0 8px 24px -4px rgba(168, 85, 247, 0.45), 0 2px 8px rgba(0,0,0,0.5)",
          opacity: 0,
          transformOrigin: "0% 50%",
          willChange: "transform, opacity",
          userSelect: "none",
          pointerEvents: "none",
          transition: "opacity 150ms ease",
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

      {/* 120 FPS High-Precision Hardware-Accelerated Arrow Cursor */}
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
          filter: "drop-shadow(0 4px 12px rgba(168, 85, 247, 0.75))",
          pointerEvents: "none",
          transition: "opacity 150ms ease",
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
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
