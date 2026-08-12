"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
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
import { Sparkles, ArrowUpRight, MousePointerClick, Edit3, Code, Search, Copy, Download, RefreshCw, Check } from "lucide-react";

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
  const langContext = useLanguage();
  let isTurkish = true;
  if (langContext && langContext.lang === "en") {
    isTurkish = false;
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Dynamic context-aware state
  const [dynamicLabel, setDynamicLabel] = useState<string>(name);
  const [isClickable, setIsClickable] = useState(false);
  const [cursorAccent, setCursorAccent] = useState<string>("#8b5cf6");

  // High-performance spring configurations (Instant snappy arrow, organic fluid trailing pill)
  const arrowSpringCfg = useMemo<SpringOptions>(
    () => ({ stiffness: 520, damping: 32, mass: 0.4 }),
    []
  );
  const labelSpringCfg = useMemo<SpringOptions>(
    () => ({ stiffness: 280, damping: 26, mass: 0.55 }),
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
      stiffness: 600,
      damping: 26,
      mass: 0.35,
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

  const [suppressPill, setSuppressPill] = useState(false);

  // Intelligent Context-Aware Element Inspection
  const inspectElement = useCallback((target: HTMLElement | null) => {
    if (!target) return;

    // 0. Suppress follower pill over precision game zones, sliders, and canvases (keeps arrow visible!)
    if (target.closest("[data-no-custom-cursor], .hubsense-game-arena, .hubsense-slider-area, input[type='range'], canvas")) {
      setSuppressPill(true);
      return;
    }
    setSuppressPill(false);

    // 1. Explicit data-cursor tag
    const customCursor = target.closest("[data-cursor]")?.getAttribute("data-cursor");
    if (customCursor) {
      setDynamicLabel(customCursor);
      setIsClickable(true);
      setCursorAccent("#6366f1");
      return;
    }

    // 2. Logo / Home Link Detection
    const homeLink = target.closest("a[href='/'], Link[href='/'], .brand-logo, [data-home]");
    if (homeLink) {
      setDynamicLabel(isTurkish ? "Ana Sayfa" : "Home");
      setIsClickable(true);
      setCursorAccent("#8b5cf6");
      return;
    }

    // 3. Tool Cards & Tool Links
    const toolLink = target.closest("a[href^='/tools/']");
    if (toolLink) {
      setDynamicLabel(isTurkish ? "Aracı Çalıştır" : "Launch Tool");
      setIsClickable(true);
      setCursorAccent("#10b981");
      return;
    }

    // 4. General Links & External Triggers
    const linkElem = target.closest("a");
    if (linkElem) {
      setIsClickable(true);
      const href = linkElem.getAttribute("href") || "";
      if (href.startsWith("http") || href.startsWith("//")) {
        setDynamicLabel(isTurkish ? "Dış Bağlantı" : "External Link");
        setCursorAccent("#f59e0b");
        return;
      }
      setDynamicLabel(isTurkish ? "Aç" : "Open");
      setCursorAccent("#6366f1");
      return;
    }

    // 5. Interactive Buttons & Controls
    const buttonElem = target.closest("button, [role='button'], input[type='submit']");
    if (buttonElem) {
      setIsClickable(true);
      setCursorAccent("#6366f1");
      const titleAttr = (
        buttonElem.getAttribute("title") ||
        buttonElem.getAttribute("aria-label") ||
        buttonElem.textContent ||
        ""
      ).toLowerCase();

      if (titleAttr.includes("kopyala") || titleAttr.includes("copy")) {
        setDynamicLabel(isTurkish ? "Panoya Kopyala" : "Copy to Clipboard");
        setCursorAccent("#10b981");
        return;
      }
      if (titleAttr.includes("indir") || titleAttr.includes("download") || titleAttr.includes("svg") || titleAttr.includes("png")) {
        setDynamicLabel(isTurkish ? "İndir / Kaydet" : "Download File");
        setCursorAccent("#a855f7");
        return;
      }
      if (titleAttr.includes("ara") || titleAttr.includes("search") || titleAttr.includes("filtre")) {
        setDynamicLabel(isTurkish ? "Ara..." : "Search...");
        setCursorAccent("#3b82f6");
        return;
      }
      if (titleAttr.includes("sıfırla") || titleAttr.includes("reset") || titleAttr.includes("temizle") || titleAttr.includes("clear")) {
        setDynamicLabel(isTurkish ? "Temizle" : "Clear");
        setCursorAccent("#ef4444");
        return;
      }
      if (titleAttr.includes("paylaş") || titleAttr.includes("share")) {
        setDynamicLabel(isTurkish ? "Paylaş" : "Share");
        setCursorAccent("#ec4899");
        return;
      }
      if (titleAttr.includes("yazdır") || titleAttr.includes("print")) {
        setDynamicLabel(isTurkish ? "Yazdır" : "Print");
        return;
      }
      if (titleAttr.includes("dil") || titleAttr.includes("lang")) {
        setDynamicLabel(isTurkish ? "Dili Değiştir (EN)" : "Switch Lang (TR)");
        setCursorAccent("#06b6d4");
        return;
      }
      setDynamicLabel(isTurkish ? "Seç" : "Select");
      return;
    }

    // 6. Text Inputs, Number Inputs & Textareas
    const textInput = target.closest("input[type='text'], input[type='email'], input[type='url'], input[type='number'], textarea");
    if (textInput) {
      setDynamicLabel(isTurkish ? "Yaz..." : "Type...");
      setIsClickable(true);
      setCursorAccent("#3b82f6");
      return;
    }

    // 7. Select Dropdowns
    const selectElem = target.closest("select");
    if (selectElem) {
      setDynamicLabel(isTurkish ? "Listeyi Seç" : "Select Option");
      setIsClickable(true);
      setCursorAccent("#8b5cf6");
      return;
    }

    // 8. Color Pickers
    const colorInput = target.closest("input[type='color']");
    if (colorInput) {
      setDynamicLabel(isTurkish ? "Renk Seç" : "Choose Color");
      setIsClickable(true);
      setCursorAccent("#ec4899");
      return;
    }

    // 9. Code Snippets & Pre tags
    const codeBlock = target.closest("pre, code, .font-mono");
    if (codeBlock) {
      setDynamicLabel(isTurkish ? "Kod Bloğu" : "Code Snippet");
      setIsClickable(false);
      setCursorAccent("#a855f7");
      return;
    }

    // Default Neutral Studio State
    setDynamicLabel(name);
    setIsClickable(false);
    setCursorAccent("#8b5cf6");
  }, [isTurkish, name]);

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
        const tilt = Math.max(-labelTiltStrength, Math.min(labelTiltStrength, (vx / 40) * 0.85));
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
        return (arrow as (c: string) => ReactNode)(cursorAccent);
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
          filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.5))",
        }}
      >
        <path
          d="M5 3 L23 14 L14 16 L11 24 Z"
          fill={cursorAccent}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={0.9}
          strokeLinejoin="round"
        />
      </svg>
    );
  }, [arrow, cursorAccent, size]);

  // Dynamic Label Content with Micro Icon Badge
  const labelContent: ReactNode = useMemo(() => {
    if (label !== undefined && label !== null) return label;

    return (
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-white/90 animate-pulse" />
        <span
          className={classNames?.labelText}
          style={{
            color: textColor,
            fontSize: Math.max(10, size * 0.43),
            lineHeight: 1.15,
            fontWeight: 800,
            fontFamily:
              'var(--font-outfit), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            whiteSpace: "nowrap",
            letterSpacing: "0.02em",
          }}
        >
          {dynamicLabel}
        </span>
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
        {showLabel && !suppressPill && (
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
                padding: `${Math.max(4, size * 0.18)}px ${Math.max(11, size * 0.44)}px`,
                borderRadius: 9999,
                background: cursorAccent,
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 16px rgba(139, 92, 246, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
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
      if (hasFinePointer) {
        document.documentElement.classList.add('cursor-hidden');
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove('cursor-hidden');
      }
    };
  }, []);

  if (!mounted || !isDesktop) return null;

  return <DesktopUserCursor {...props} />;
}
