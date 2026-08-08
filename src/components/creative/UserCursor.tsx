"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  type SpringOptions,
} from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type ClassNames = {
  root?: string;
  cursor?: string;
  arrow?: string;
  label?: string;
  labelText?: string;
};

export interface UserCursorProps {
  name?: string;
  arrow?: ReactNode | ((color: string) => ReactNode);
  label?: ReactNode;
  color?: string;
  textColor?: string;
  size?: number;
  labelTiltStrength?: number;
  showLabel?: boolean;
  fullScreen?: boolean;
  hideNativeCursor?: boolean;
  hideOnTouch?: boolean;
  zIndex?: number;
  offsetX?: number;
  offsetY?: number;
  labelOffsetUseDefault?: boolean;
  labelOffsetX?: number;
  labelOffsetY?: number;
  pressScale?: number;
  offset?: { x?: number; y?: number };
  labelOffset?: { x?: number; y?: number };
  classNames?: ClassNames;
  style?: CSSProperties;
}

const COMPONENT_DEFAULTS = {
  name: "EverythingHub",
  color: "#8b5cf6",
  textColor: "#ffffff",
  size: 28,
  labelTiltStrength: 24,
  showLabel: true,
  fullScreen: true,
  hideNativeCursor: true,
  hideOnTouch: true,
  zIndex: 9999,
  offsetX: 0,
  offsetY: 0,
  labelOffsetUseDefault: true,
  labelOffsetX: 22,
  labelOffsetY: 14,
  pressScale: 0.88,
};

function DesktopUserCursor(userProps: UserCursorProps) {
  const props = { ...COMPONENT_DEFAULTS, ...userProps };
  const {
    name,
    arrow,
    label,
    color,
    textColor,
    size,
    labelTiltStrength,
    showLabel,
    fullScreen,
    hideNativeCursor,
    zIndex,
    offsetX,
    offsetY,
    labelOffsetX,
    labelOffsetY,
    labelOffsetUseDefault,
    pressScale,
    classNames,
    offset: offsetOverride,
    labelOffset: labelOffsetOverride,
    style,
  } = props;

  // Language context resolution
  let isTurkish = true;
  try {
    const langContext = useLanguage();
    if (langContext && langContext.lang === "en") {
      isTurkish = false;
    }
  } catch {}

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Dynamic context-aware state
  const [dynamicLabel, setDynamicLabel] = useState<string>(name);
  const [isClickable, setIsClickable] = useState(false);

  // High-performance spring configurations (Instant snappy arrow, organic fluid trailing pill)
  const arrowSpringCfg = useMemo<SpringOptions>(
    () => ({ stiffness: 500, damping: 35, mass: 0.45 }),
    []
  );
  const labelSpringCfg = useMemo<SpringOptions>(
    () => ({ stiffness: 260, damping: 28, mass: 0.6 }),
    []
  );

  const resolvedOffset = useMemo(
    () => ({
      x: offsetOverride?.x ?? offsetX,
      y: offsetOverride?.y ?? offsetY,
    }),
    [offsetOverride?.x, offsetOverride?.y, offsetX, offsetY]
  );

  const resolvedLabelOffset = useMemo(() => {
    if (labelOffsetOverride) {
      return {
        x: labelOffsetOverride.x ?? size * 0.75,
        y: labelOffsetOverride.y ?? size * 0.45 + 2,
      };
    }
    if (labelOffsetUseDefault) {
      return { x: size * 0.75, y: size * 0.45 + 2 };
    }
    return { x: labelOffsetX, y: labelOffsetY };
  }, [
    labelOffsetOverride,
    labelOffsetUseDefault,
    labelOffsetX,
    labelOffsetY,
    size,
  ]);

  // Motion values
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const arrowX = useSpring(mouseX, arrowSpringCfg);
  const arrowY = useSpring(mouseY, arrowSpringCfg);
  const labelX = useSpring(mouseX, labelSpringCfg);
  const labelY = useSpring(mouseY, labelSpringCfg);

  // Press bounce animation
  const scaleMV = useMotionValue(1);
  useEffect(() => {
    const controls = animate(scaleMV, pressed ? pressScale : 1, {
      type: "spring",
      stiffness: 550,
      damping: 28,
      mass: 0.4,
    });
    return () => controls.stop();
  }, [pressed, pressScale, scaleMV]);

  // Velocity-driven dynamic pill tilt
  const labelTiltTarget = useMotionValue(0);
  const labelRotation = useSpring(labelTiltTarget, {
    stiffness: 240,
    damping: 22,
    mass: 0.5,
  });

  const lastSampleRef = useRef<{ x: number; y: number; t: number } | null>(null);

  // Context-aware element inspection with bilingual precision
  const inspectElement = (target: HTMLElement | null) => {
    if (!target) return;

    // 1. Explicit data-cursor tag
    const customCursor = target.closest("[data-cursor]")?.getAttribute("data-cursor");
    if (customCursor) {
      setDynamicLabel(customCursor);
      setIsClickable(true);
      return;
    }

    // 2. Buttons, Links and Action triggers
    const clickable = target.closest("a, button, [role='button'], input[type='submit']");
    if (clickable) {
      setIsClickable(true);
      const titleAttr =
        clickable.getAttribute("title") ||
        clickable.getAttribute("aria-label") ||
        "";
      const lower = titleAttr.toLowerCase();

      if (lower.includes("kopyala") || lower.includes("copy")) {
        setDynamicLabel(isTurkish ? "Kopyala" : "Copy");
        return;
      }
      if (lower.includes("indir") || lower.includes("download")) {
        setDynamicLabel(isTurkish ? "İndir" : "Download");
        return;
      }
      if (lower.includes("ara") || lower.includes("search")) {
        setDynamicLabel(isTurkish ? "Ara" : "Search");
        return;
      }
      if (lower.includes("sıfırla") || lower.includes("reset") || lower.includes("temizle") || lower.includes("clear")) {
        setDynamicLabel(isTurkish ? "Temizle" : "Clear");
        return;
      }
      if (lower.includes("paylaş") || lower.includes("share")) {
        setDynamicLabel(isTurkish ? "Paylaş" : "Share");
        return;
      }
      if (lower.includes("yukarı") || lower.includes("top")) {
        setDynamicLabel(isTurkish ? "Yukarı" : "Top");
        return;
      }
      if (clickable.tagName.toLowerCase() === "a") {
        const href = clickable.getAttribute("href") || "";
        if (href.startsWith("http") || href.startsWith("//")) {
          setDynamicLabel(isTurkish ? "Dış Bağlantı" : "External Link");
          return;
        }
        setDynamicLabel(isTurkish ? "Aç" : "Open");
        return;
      }
      setDynamicLabel(isTurkish ? "Seç" : "Select");
      return;
    }

    // 3. Text Inputs and Code Areas
    const textInput = target.closest("input[type='text'], input[type='email'], input[type='url'], input[type='number'], textarea");
    if (textInput) {
      setDynamicLabel(isTurkish ? "Yaz" : "Type");
      setIsClickable(true);
      return;
    }

    // 4. Code Blocks
    const codeBlock = target.closest("pre, code, .font-mono");
    if (codeBlock) {
      setDynamicLabel(isTurkish ? "Kod" : "Code");
      setIsClickable(false);
      return;
    }

    // Default Neutral Brand State
    setDynamicLabel(name);
    setIsClickable(false);
  };

  // Attach Pointer Event Listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!fullScreen && !container) return;

    let rafScheduled = false;
    let pendingEvent: MouseEvent | null = null;

    const processPointerMove = () => {
      rafScheduled = false;
      if (!pendingEvent) return;

      const e = pendingEvent;
      let px = 0;
      let py = 0;

      if (fullScreen) {
        px = e.clientX;
        py = e.clientY;
      } else {
        const rect = container!.getBoundingClientRect();
        px = e.clientX - rect.left;
        py = e.clientY - rect.top;
      }

      const targetX = px + resolvedOffset.x;
      const targetY = py + resolvedOffset.y;

      mouseX.set(targetX);
      mouseY.set(targetY);

      // Organic Velocity Tilt Math
      const now = performance.now();
      const last = lastSampleRef.current;
      if (last) {
        const dt = Math.max(1, now - last.t);
        const vx = ((targetX - last.x) / dt) * 1000;
        const tilt = Math.max(-labelTiltStrength, Math.min(labelTiltStrength, (vx / 45) * 0.85));
        labelTiltTarget.set(tilt);
      }
      lastSampleRef.current = { x: targetX, y: targetY, t: now };

      if (!hovering) setHovering(true);
      inspectElement(e.target as HTMLElement);
    };

    const onMove = (e: MouseEvent) => {
      pendingEvent = e;
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(processPointerMove);
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onEnter = () => setHovering(true);
    const onLeave = () => {
      setHovering(false);
      lastSampleRef.current = null;
      labelTiltTarget.set(0);
    };

    if (fullScreen) {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mousedown", onDown, { passive: true });
      window.addEventListener("mouseup", onUp, { passive: true });
      document.addEventListener("mouseleave", onLeave, { passive: true });
    } else {
      const el = container!;
      el.addEventListener("mousemove", onMove as EventListener, { passive: true });
      el.addEventListener("mousedown", onDown, { passive: true });
      el.addEventListener("mouseup", onUp, { passive: true });
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    }

    return () => {
      if (fullScreen) {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mousedown", onDown);
        window.removeEventListener("mouseup", onUp);
        document.removeEventListener("mouseleave", onLeave);
      } else {
        const el = container!;
        el.removeEventListener("mousemove", onMove as EventListener);
        el.removeEventListener("mousedown", onDown);
        el.removeEventListener("mouseup", onUp);
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      }
      setPressed(false);
    };
  }, [
    fullScreen,
    labelTiltStrength,
    resolvedOffset.x,
    resolvedOffset.y,
    mouseX,
    mouseY,
    labelTiltTarget,
    hovering,
    name,
    isTurkish,
  ]);

  const visible = hovering;

  const labelTranslateX = useTransform(
    labelX,
    (v) => v + resolvedLabelOffset.x
  );
  const labelTranslateY = useTransform(
    labelY,
    (v) => v + resolvedLabelOffset.y
  );

  // Vector Arrow Glyph (Originkit Studio Arrow)
  const arrowContent: ReactNode = useMemo(() => {
    if (typeof arrow === "function") {
      try {
        return (arrow as (c: string) => ReactNode)(color);
      } catch {
        return null;
      }
    }
    if (arrow !== undefined && arrow !== null) return arrow as ReactNode;

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: "block",
          overflow: "visible",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.45))",
        }}
      >
        <path
          d="M5 3 L23 14 L14 16 L11 24 Z"
          fill={color}
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      </svg>
    );
  }, [arrow, color, size]);

  // Dynamic Label Content
  const labelContent: ReactNode = useMemo(() => {
    if (label !== undefined && label !== null) return label;

    return (
      <div
        className={classNames?.labelText}
        style={{
          color: textColor,
          fontSize: Math.max(9, size * 0.42),
          lineHeight: 1.15,
          fontWeight: 700,
          fontFamily:
            'var(--font-outfit), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}
      >
        {dynamicLabel}
      </div>
    );
  }, [label, dynamicLabel, textColor, size, classNames?.labelText]);

  const layerStyle: CSSProperties = fullScreen
    ? {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex,
      }
    : {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex,
      };

  return (
    <>
      {hideNativeCursor && (
        <style>{`
          html, body, a, button, input, select, textarea, [role="button"] {
            cursor: none !important;
          }
        `}</style>
      )}

      <div
        ref={containerRef}
        className={classNames?.root}
        style={{ ...layerStyle, ...style }}
      >
        {/* Layer 1: Arrow Glyph Follower */}
        <motion.div
          className={classNames?.arrow}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            x: arrowX,
            y: arrowY,
            scale: scaleMV,
            opacity: visible ? 1 : 0,
            pointerEvents: "none",
            willChange: "transform, opacity",
            originX: 0.15,
            originY: 0.15,
          }}
          transition={{ opacity: { duration: 0.15 } }}
        >
          {arrowContent}
        </motion.div>

        {/* Layer 2: Trailing Context Pill */}
        {showLabel && (
          <motion.div
            className={classNames?.label}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              x: labelTranslateX,
              y: labelTranslateY,
              rotate: labelRotation,
              scale: scaleMV,
              opacity: visible ? 1 : 0,
              pointerEvents: "none",
              willChange: "transform, opacity",
              originX: 0,
              originY: 0,
            }}
            transition={{ opacity: { duration: 0.2 } }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: `${Math.max(4, size * 0.16)}px ${Math.max(10, size * 0.42)}px`,
                borderRadius: 9999,
                background: isClickable ? "rgba(99, 102, 241, 0.95)" : "rgba(139, 92, 246, 0.92)",
                boxShadow:
                  "0 4px 16px rgba(0, 0, 0, 0.45), 0 0 12px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              {labelContent}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

export function UserCursor(props: UserCursorProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.matchMedia) {
      const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
      const isTouch = "ontouchstart" in window || window.matchMedia("(pointer: coarse)").matches;
      setIsDesktop(hasFinePointer && !isTouch);
    }
  }, []);

  if (!mounted || !isDesktop) return null;

  return <DesktopUserCursor {...props} />;
}
