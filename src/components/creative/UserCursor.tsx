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
  color = "#818cf8",
  textColor = "#ffffff",
  size = 28,
}: UserCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Disable custom cursor on touch/coarse devices
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;
    let labelX = -200;
    let labelY = -200;
    let isHovering = false;
    let isClickable = false;
    let isPressed = false;
    let animId: number;

    const updateLabelText = (target: HTMLElement | null) => {
      if (!labelTextRef.current) return;
      const customCursor = target?.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (customCursor) {
        labelTextRef.current.textContent = customCursor;
        isClickable = true;
        return;
      }

      const clickable = target?.closest("a, button, [role='button']");
      if (clickable) {
        isClickable = true;
        const titleAttr = clickable.getAttribute("title") || clickable.getAttribute("aria-label");
        if (titleAttr) {
          const lower = titleAttr.toLowerCase();
          if (lower.includes("kopyala") || lower.includes("copy")) {
            labelTextRef.current.textContent = "Kopyala";
            return;
          }
          if (lower.includes("indir") || lower.includes("download")) {
            labelTextRef.current.textContent = "İndir";
            return;
          }
          if (lower.includes("ara") || lower.includes("search")) {
            labelTextRef.current.textContent = "Ara";
            return;
          }
        }
        labelTextRef.current.textContent = "Aç";
        return;
      }

      if (target?.closest("input, textarea")) {
        isClickable = true;
        labelTextRef.current.textContent = "Yaz";
        return;
      }

      isClickable = false;
      labelTextRef.current.textContent = name;
    };

    // 120-240Hz Fluid Lerp Loop for soft, luxurious cursor physics
    const renderLoop = () => {
      if (isHovering) {
        // Smooth magnetic spring interpolation for ring aura
        const ringLerp = 0.22;
        ringX += (mouseX - ringX) * ringLerp;
        ringY += (mouseY - ringY) * ringLerp;

        // Smooth floating lerp for text badge — positioned safely at offset (x + 18, y + 18)
        const labelLerp = 0.16;
        labelX += (mouseX - labelX) * labelLerp;
        labelY += (mouseY - labelY) * labelLerp;

        if (ringRef.current) {
          const scale = isPressed ? 0.75 : isClickable ? 1.35 : 1;
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`;
          ringRef.current.style.opacity = isClickable ? "0.9" : "0.5";
        }

        if (labelRef.current) {
          const lx = labelX + 16;
          const ly = labelY + 16;
          labelRef.current.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
          labelRef.current.style.opacity = isClickable ? "1" : "0.75";
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        if (!isHovering) {
          dotRef.current.style.opacity = "1";
          if (ringRef.current) ringRef.current.style.opacity = "0.5";
          if (labelRef.current) labelRef.current.style.opacity = "0.75";
          isHovering = true;
          ringX = mouseX;
          ringY = mouseY;
          labelX = mouseX;
          labelY = mouseY;
        }
      }

      updateLabelText(e.target as HTMLElement);
    };

    const onMouseDown = () => {
      isPressed = true;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(0.7)`;
    };

    const onMouseUp = () => {
      isPressed = false;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1)`;
    };

    const onMouseLeave = () => {
      isHovering = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
      if (labelRef.current) labelRef.current.style.opacity = "0";
    };

    const startTimer = setTimeout(() => {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("mousedown", onMouseDown, { passive: true });
      window.addEventListener("mouseup", onMouseUp, { passive: true });
      document.addEventListener("mouseleave", onMouseLeave, { passive: true });
      animId = requestAnimationFrame(renderLoop);
    }, 100);

    return () => {
      clearTimeout(startTimer);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [name]);

  return (
    <>
      {/* Precision Center Micro-Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 will-change-transform"
      >
        <div
          className="h-2 w-2 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.9)]"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Fluid Glass Aura Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 will-change-transform"
      >
        <div
          className="h-7 w-7 rounded-full border border-indigo-400/40 bg-indigo-500/10 backdrop-blur-xs shadow-[0_0_16px_rgba(99,102,241,0.25)] transition-transform duration-200"
        />
      </div>

      {/* Floating Soft Label Badge (Never Overlaps Pointer) */}
      <div
        ref={labelRef}
        className="pointer-events-none fixed left-0 top-0 z-[9997] opacity-0 transition-opacity duration-300 will-change-transform"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#090a10]/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xl backdrop-blur-xl">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span ref={labelTextRef} className="leading-none select-none">
            {name}
          </span>
        </div>
      </div>
    </>
  );
}
