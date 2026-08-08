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

export function UserCursor(userProps: UserCursorProps) {
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
    hideOnTouch,
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

  // Touch device detection (zero cost on mobile)
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (!hideOnTouch) {
      setIsTouchDevice(false);
      return;
    }
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsTouchDevice(!!mql.matches);
    sync();

    if (mql.addEventListener) {
      mql.addEventListener("change", sync);
      return () => mql.removeEventListener("change", sync);
    }
    const legacy = mql as MediaQueryList & {
      addListener?: (l: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (l: (e: MediaQueryListEvent) => void) => void;
    };
    legacy.addListener?.(sync);
    return () => legacy.removeListener?.(sync);
  }, [hideOnTouch]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Dynamic context-aware state
  const [dynamicLabel, setDynamicLabel] = useState<string>(name);
  const [isClickable, setIsClickable] = useState(false);

  // High-performance spring configurations (Snappy arrow, organic trailing pill)
  const arrowSpringCfg = useMemo<SpringOptions>(
    () => ({ stiffness: 480, damping: 36, mass: 0.5 }),
    []
  );
  const labelSpringCfg = useMemo<SpringOptions>(
    () => ({ stiffness: 240, damping: 28, mass: 0.65 }),
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
    stiffness: 220,
    damping: 24,
    mass: 0.6,
  });

  const lastSampleRef = useRef<{ x: number; y: number; t: number } | null>(null);

  // Context-aware element inspection
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
        setDynamicLabel("Kopyala");
        return;
      }
      if (lower.includes("indir") || lower.includes("download")) {
        setDynamicLabel("İndir");
        return;
      }
      if (lower.includes("ara") || lower.includes("search")) {
        setDynamicLabel("Ara");
        return;
      }
      if (lower.includes("sıfırla") || lower.includes("reset") || lower.includes("temizle")) {
        setDynamicLabel("Temizle");
        return;
      }
      if (lower.includes("paylaş") || lower.includes("share")) {
        setDynamicLabel("Paylaş");
        return;
      }
      if (lower.includes("yukarı") || lower.includes("top")) {
        setDynamicLabel("Yukarı");
        return;
      }
      if (clickable.tagName.toLowerCase() === "a") {
        const href = clickable.getAttribute("href") || "";
        if (href.startsWith("http") || href.startsWith("//")) {
          setDynamicLabel("Dış Bağlantı");
          return;
        }
      }
      setDynamicLabel("Aç");
      return;
    }

    // 3. Inputs & Textareas
    if (target.closest("input, textarea, [contenteditable='true']")) {
      setIsClickable(true);
      setDynamicLabel("Yaz");
      return;
    }

    // 4. Code Blocks
    if (target.closest("pre, code")) {
      setIsClickable(true);
      setDynamicLabel("Kod");
      return;
    }

    // 5. Default state
    setIsClickable(false);
    setDynamicLabel(name);
  };

  useEffect(() => {
    if (isTouchDevice || typeof window === "undefined") return;

    const container = containerRef.current;
    if (!fullScreen && !container) return;

    const getLocal = (clientX: number, clientY: number) => {
      if (fullScreen) return { x: clientX, y: clientY };
      const rect = container!.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMove = (e: MouseEvent) => {
      const { x, y } = getLocal(e.clientX, e.clientY);

      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const last = lastSampleRef.current;
      let vx = 0;
      let vy = 0;
      if (last) {
        const dt = Math.max(1, now - last.t);
        vx = ((x - last.x) / dt) * 1000;
        vy = ((y - last.y) / dt) * 1000;
      }
      lastSampleRef.current = { x, y, t: now };

      mouseX.set(x + resolvedOffset.x);
      mouseY.set(y + resolvedOffset.y);

      // Label rock & tilt: sign by horizontal velocity, clamped magnitude
      const speed = Math.hypot(vx, vy);
      const norm = Math.min(1, speed / 1400);
      const sign = vx === 0 ? 0 : vx > 0 ? 1 : -1;
      labelTiltTarget.set(sign * norm * labelTiltStrength);

      if (!hovering) setHovering(true);
      inspectElement(e.target as HTMLElement);
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
    isTouchDevice,
    fullScreen,
    labelTiltStrength,
    resolvedOffset.x,
    resolvedOffset.y,
    mouseX,
    mouseY,
    labelTiltTarget,
    hovering,
    name,
  ]);

  const visible = !isTouchDevice && hovering;

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

  if (isTouchDevice) return null;

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

  const cursorLayer = (
    <div style={layerStyle}>
      {/* Trailing Label Pill */}
      {showLabel && (
        <motion.div
          className={classNames?.label}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            x: labelTranslateX,
            y: labelTranslateY,
            rotate: labelRotation,
            scale: scaleMV,
            background: isClickable ? "#4f46e5" : color,
            borderRadius: 999,
            padding: `${Math.max(4, size * 0.16)}px ${Math.max(8, size * 0.36)}px`,
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.35), 0 0 12px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
            border: "1px solid rgba(255,255,255,0.2)",
            opacity: visible ? 1 : 0,
            transformOrigin: "0% 50%",
            transition: "opacity 140ms ease, background 200ms ease",
            willChange: "transform, opacity",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {labelContent}
        </motion.div>
      )}

      {/* Primary Arrow Pointer */}
      <motion.div
        className={classNames?.cursor}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          x: arrowX,
          y: arrowY,
          scale: scaleMV,
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          transformOrigin: "0% 0%",
          transition: "opacity 140ms ease",
          willChange: "transform, opacity",
          pointerEvents: "none",
        }}
      >
        <div
          className={classNames?.arrow}
          style={{ width: size, height: size }}
        >
          {arrowContent}
        </div>
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return cursorLayer;
  }

  return (
    <div
      ref={containerRef}
      className={classNames?.root}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: hideNativeCursor ? "none" : undefined,
        ...style,
      }}
    >
      {cursorLayer}
    </div>
  );
}

export default UserCursor;
