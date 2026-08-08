"use client";

import { useId, useMemo, type CSSProperties, type ElementType } from "react";

function mapEaseToCSS(ease?: string | number[]): string {
  if (Array.isArray(ease) && ease.length === 4) {
    return `cubic-bezier(${ease.join(",")})`;
  }
  switch (ease) {
    case "linear":
      return "linear";
    case "easeIn":
      return "ease-in";
    case "easeOut":
      return "ease-out";
    case "easeInOut":
      return "ease-in-out";
    case "circIn":
      return "cubic-bezier(0.6, 0.04, 0.98, 0.335)";
    case "circOut":
      return "cubic-bezier(0.075, 0.82, 0.165, 1)";
    case "circInOut":
      return "cubic-bezier(0.785, 0.135, 0.15, 0.86)";
    case "backIn":
      return "cubic-bezier(0.6, -0.28, 0.735, 0.045)";
    case "backOut":
      return "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    case "backInOut":
      return "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    default:
      return "ease-in-out";
  }
}

export interface TextMorphProps {
  words?: string | string[];
  color?: string;
  font?: CSSProperties;
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string | number[];
  };
  tag?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export function TextMorph({
  words = "HER ŞEYİN MERKEZİ\nYOUTUBE ANALİZİ\nHIZLI & GÜVENLİ\nMODERN STÜDYO\nGİZLİLİK ODAKLI",
  color = "#c084fc",
  font,
  transition = { duration: 0.9, delay: 1.4, ease: "easeInOut" },
  tag: Tag = "div",
  className = "",
  style,
}: TextMorphProps) {
  const morph = Math.max(0.1, transition?.duration ?? 0.9);
  const hold = Math.max(0, transition?.delay ?? 1.4);
  const easeCurve = transition?.ease ?? "easeInOut";
  const easeCSS = mapEaseToCSS(easeCurve);

  const wordList = useMemo<string[]>(() => {
    if (Array.isArray(words)) return words.map((w) => w.trim()).filter(Boolean);
    return words
      .split(/\r?\n|,/)
      .map((w) => w.trim())
      .filter(Boolean);
  }, [words]);

  const rawId = useId();
  const safeId = rawId.replace(/[:]/g, "");
  const filterId = `tm-thr-${safeId}`;
  const animName = `tm-rot-${safeId}`;

  const count = Math.max(1, wordList.length);
  const slot = morph + hold;
  const cycle = slot * count;
  const pct = (s: number) => Math.min(100, (s / cycle) * 100).toFixed(4);
  const mIn = pct(morph);
  const mHold = pct(morph + hold);
  const mOut = pct(2 * morph + hold);

  const keyframes = `
@keyframes ${animName} {
  0% {
    opacity: 0;
    filter: blur(20px);
    transform: translate(-50%, -50%) scale(0.8);
  }
  ${mIn}% {
    opacity: 1;
    filter: blur(0px);
    transform: translate(-50%, -50%) scale(1);
  }
  ${mHold}% {
    opacity: 1;
    filter: blur(0px);
    transform: translate(-50%, -50%) scale(1);
  }
  ${mOut}%, 100% {
    opacity: 0;
    filter: blur(20px);
    transform: translate(-50%, -50%) scale(1.2);
  }
}
`;

  const longest = wordList.reduce(
    (acc, w) => (w.length > acc.length ? w : acc),
    ""
  );

  return (
    <Tag
      className={`relative inline-flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <style>{keyframes}</style>

      {/* SVG Gooey Filter */}
      <svg
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 25 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: "relative",
          filter: `url(#${filterId})`,
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          ...font,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            lineHeight: 1.2,
            minHeight: "1.2em",
          }}
        >
          {/* Width anchor to prevent layout shifts */}
          <span
            style={{
              visibility: "hidden",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {longest || " "}
          </span>

          {wordList.map((word, i) => (
            <span
              key={`${word}-${i}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0,
                color,
                whiteSpace: "nowrap",
                animation: `${animName} ${cycle}s ${(slot * i).toFixed(
                  3
                )}s infinite ${easeCSS}`,
                willChange: "opacity, filter, transform",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </Tag>
  );
}

export default TextMorph;
