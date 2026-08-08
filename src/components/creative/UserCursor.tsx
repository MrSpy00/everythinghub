"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  type SpringOptions,
} from "framer-motion";

export interface UserCursorProps {
  name?: string;
  color?: string;
  textColor?: string;
  size?: number;
  labelTiltStrength?: number;
  showLabel?: boolean;
  pressScale?: number;
  style?: CSSProperties;
}

export function UserCursor({
  name = "User",
  color = "#8b5cf6",
  textColor = "#ffffff",
  size = 28,
  labelTiltStrength = 20,
  showLabel = true,
  pressScale = 0.92,
}: UserCursorProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(name);

  const arrowSpring = useMemo<SpringOptions>(
    () => ({ stiffness: 380, damping: 32, mass: 0.6 }),
    []
  );
  const labelSpringCfg = useMemo<SpringOptions>(
    () => ({ stiffness: 220, damping: 26, mass: 0.7 }),
    []
  );

  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const arrowX = useSpring(mouseX, arrowSpring);
  const arrowY = useSpring(mouseY, arrowSpring);
  const labelX = useSpring(mouseX, labelSpringCfg);
  const labelY = useSpring(mouseY, labelSpringCfg);

  const scaleMV = useMotionValue(1);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(pointer: coarse)");
      const handler = () => setIsTouchDevice(mql.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => {
    const controls = animate(scaleMV, pressed ? pressScale : 1, {
      type: "spring",
      stiffness: 500,
      damping: 28,
      mass: 0.5,
    });
    return () => controls.stop();
  }, [pressed, pressScale, scaleMV]);

  const labelTiltTarget = useMotionValue(0);
  const labelRotation = useSpring(labelTiltTarget, {
    stiffness: 200,
    damping: 24,
    mass: 0.6,
  });

  const lastSampleRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (isTouchDevice) return;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();
      const last = lastSampleRef.current;
      let vx = 0;
      let vy = 0;
      if (last) {
        const dt = Math.max(1, now - last.t);
        vx = ((x - last.x) / dt) * 1000;
        vy = ((y - last.y) / dt) * 1000;
      }
      lastSampleRef.current = { x, y, t: now };

      mouseX.set(x);
      mouseY.set(y);

      const speed = Math.hypot(vx, vy);
      const norm = Math.min(1, speed / 1500);
      const sign = vx === 0 ? 0 : vx > 0 ? 1 : -1;
      labelTiltTarget.set(sign * norm * labelTiltStrength);

      setHovering(true);

      const target = e.target as HTMLElement | null;
      const customCursor = target?.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (customCursor) {
        setCurrentLabel(customCursor);
      } else if (target?.closest("a, button")) {
        setCurrentLabel("Aç");
      } else {
        setCurrentLabel(name);
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      setHovering(false);
      lastSampleRef.current = null;
      labelTiltTarget.set(0);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [isTouchDevice, labelTiltStrength, mouseX, mouseY, labelTiltTarget, name]);

  const labelTranslateX = useTransform(labelX, (v) => v + size * 0.7);
  const labelTranslateY = useTransform(labelY, (v) => v + size * 0.4);

  if (isTouchDevice) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Label trails */}
      {showLabel && (
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            x: labelTranslateX,
            y: labelTranslateY,
            rotate: labelRotation,
            scale: scaleMV,
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            borderRadius: 999,
            padding: `${size * 0.16}px ${size * 0.36}px`,
            boxShadow:
              "0 4px 16px rgba(139, 92, 246, 0.4), 0 1px 3px rgba(0,0,0,0.4)",
            opacity: hovering ? 1 : 0,
            transformOrigin: "0% 50%",
            transition: "opacity 150ms ease",
            willChange: "transform, opacity",
            userSelect: "none",
          }}
        >
          <span
            style={{
              color: textColor,
              fontSize: Math.max(9, size * 0.42),
              lineHeight: 1.1,
              fontWeight: 700,
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}
          >
            {currentLabel}
          </span>
        </motion.div>
      )}

      {/* Cursor Arrow */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: arrowX,
          y: arrowY,
          scale: scaleMV,
          width: size,
          height: size,
          opacity: hovering ? 1 : 0,
          transformOrigin: "0% 0%",
          transition: "opacity 150ms ease",
          willChange: "transform, opacity",
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
            d="M5 3 L23 14 L14 16 L11 24 Z"
            fill={color}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}
