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
        return;
      }

      const clickable = target?.closest("a, button, [role='button']");
      if (clickable) {
        const titleAttr = clickable.getAttribute("title") || clickable.getAttribute("aria-label");
        if (titleAttr) {
          if (titleAttr.toLowerCase().includes("kopyala") || titleAttr.toLowerCase().includes("copy")) {
            labelTextRef.current.textContent = "Kopyala";
            return;
          }
          if (titleAttr.toLowerCase().includes("indir") || titleAttr.toLowerCase().includes("download")) {
            labelTextRef.current.textContent = "İndir";
            return;
          }
        }
        labelTextRef.current.textContent = "Aç";
        return;
      }

      if (target?.closest("input, textarea")) {
        labelTextRef.current.textContent = "Yaz";
      } else {
        labelTextRef.current.textContent = name;
      }
    };

    let idleFrames = 0;
    let isLoopRunning = false;

    const renderLoop = () => {
      if (isHovering) {
        const dx = mouseX - labelX;
        const dy = mouseY - labelY;
        const dtilt = targetTilt - currentTilt;

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

        if (idleFrames > 60) {
          isLoopRunning = false;
          return;
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        idleFrames = 0;
        animId = requestAnimationFrame(renderLoop);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        if (!isHovering) {
          cursorRef.current.style.opacity = "1";
          isHovering = true;
        }
      }

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const vx = (e.clientX - lastX) / dt;
      targetTilt = Math.max(-28, Math.min(28, vx * 16));
      lastTime = now;
      lastX = e.clientX;

      updateLabelText(e.target as HTMLElement);
      startLoop();
    };

    const onMouseDown = () => {
      isPressed = true;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(0.85)`;
      startLoop();
    };

    const onMouseUp = () => {
      isPressed = false;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1)`;
      startLoop();
    };

    const onMouseLeave = () => {
      isHovering = false;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
      if (labelRef.current) labelRef.current.style.opacity = "0";
    };

    // Defer listener attachment to prevent TBT during initial hydration
    const deferTimer = setTimeout(() => {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("mousedown", onMouseDown, { passive: true });
      window.addEventListener("mouseup", onMouseUp, { passive: true });
      document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    }, 150);

    return () => {
      clearTimeout(deferTimer);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [name, size]);

  return (
    <>
      {/* Follower Dot Cursor */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 will-change-transform"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div
          className="h-full w-full rounded-full border border-white/40 shadow-xl backdrop-blur-sm"
          style={{
            backgroundColor: `${color}33`,
            boxShadow: `0 0 16px ${color}66, inset 0 0 8px ${color}99`,
          }}
        />
      </div>

      {/* Floating Name Label Badge */}
      <div
        ref={labelRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform"
      >
        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-2xl backdrop-blur-2xl"
          style={{
            backgroundColor: "rgba(13, 14, 18, 0.88)",
            color: textColor,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 12px ${color}40`,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: color }}
          />
          <span ref={labelTextRef} className="font-mono">
            {name}
          </span>
        </div>
      </div>
    </>
  );
}
