// Text Morph — Originkit Studio
"use client";

import React, { useId, useMemo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const WORDS_TR = [
  "YOUTUBE PLAYLIST ANALYZER",
  "GÖRSEL SIKIŞTIRICI & WEBP",
  "JSON FORMATTER & VALIDATOR",
  "RENK PALETİ & DOMINANT HEX",
  "BASE64 KODLAYICI & ÇÖZÜCÜ",
  "İNTERAKTİF REGEX TESTER",
  "ÇOKLU BİRİM DÖNÜŞTÜRÜCÜ",
  "CSS & TAILWIND GRADIENT",
  "YÜZDE & İNDİRİM HESAPLAYICI",
];

const WORDS_EN = [
  "YOUTUBE PLAYLIST ANALYZER",
  "IMAGE COMPRESSOR & WEBP",
  "JSON FORMATTER & VALIDATOR",
  "COLOR PALETTE & DOMINANT HEX",
  "BASE64 ENCODER & DECODER",
  "INTERACTIVE REGEX TESTER",
  "MULTI-UNIT CONVERTER",
  "CSS & TAILWIND GRADIENTS",
  "PERCENTAGE & DISCOUNT CALC",
];

function mapEaseToCSS(ease: string): string {
  switch (ease) {
    case "linear":
      return "linear";
    case "easeIn":
      return "ease-in";
    case "easeOut":
      return "ease-out";
    case "easeInOut":
      return "ease-in-out";
    default:
      return "cubic-bezier(0.22, 1, 0.36, 1)";
  }
}

export interface KineticTextProps {
  duration?: number;
  delay?: number;
  color?: string;
}

export function KineticText({
  duration = 0.8,
  delay = 1.6,
  color = "#ffffff",
}: KineticTextProps) {
  const { lang } = useLanguage();
  const wordList = useMemo(() => (lang === "en" ? WORDS_EN : WORDS_TR), [lang]);

  const rawId = useId();
  const safeId = rawId.replace(/[:]/g, "");
  const filterId = `tm-thr-${safeId}`;
  const animName = `tm-rot-${safeId}`;

  const count = Math.max(1, wordList.length);
  const slot = duration + delay;
  const cycle = slot * count;
  const pct = (s: number) => Math.min(100, (s / cycle) * 100).toFixed(4);
  const mIn = pct(duration);
  const mHold = pct(duration + delay);
  const mOut = pct(2 * duration + delay);

  const keyframes = `
@keyframes ${animName} {
  0% {
    opacity: 0;
    filter: blur(16px);
    transform: translate(-50%, -50%) scale(0.85);
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
    filter: blur(16px);
    transform: translate(-50%, -50%) scale(1.15);
  }
}
`;

  const longest = wordList.reduce(
    (acc, w) => (w.length > acc.length ? w : acc),
    ""
  );

  return (
    <div className="relative my-3 sm:my-4 w-full max-w-3xl mx-auto h-12 sm:h-14 md:h-16 flex items-center justify-center select-none px-2">
      <style>{keyframes}</style>

      {/* SVG Gooey Matrix Filter */}
      <svg
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
        aria-hidden
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

      {/* Atmospheric Diffused Specular Glow Underlay */}
      <div
        className="absolute -inset-x-8 -inset-y-4 flex items-center justify-center pointer-events-none transition-all duration-700"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(139, 92, 246, 0.4) 0%, rgba(0, 0, 0, 0) 70%)",
          filter: "blur(32px)",
        }}
      />

      {/* Liquid Glass Capsule with Originkit Text Morph */}
      <div className="relative z-10 flex items-center justify-center rounded-full border border-white/12 bg-[#09090b]/85 px-6 sm:px-9 py-2.5 sm:py-3 backdrop-blur-3xl shadow-2xl shadow-black/50 max-w-full">
        <div
          style={{
            position: "relative",
            filter: `url(#${filterId})`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              lineHeight: 1.15,
            }}
          >
            {/* Width Anchor */}
            <span
              className="font-black text-sm sm:text-base md:text-xl lg:text-2xl tracking-wider uppercase opacity-0 pointer-events-none"
              style={{ whiteSpace: "nowrap" }}
            >
              {longest}
            </span>

            {wordList.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="bg-gradient-to-r from-purple-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent font-black tracking-wider whitespace-nowrap text-sm sm:text-base md:text-xl lg:text-2xl leading-none drop-shadow-sm"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0,
                  animation: `${animName} ${cycle}s ${(slot * i).toFixed(3)}s infinite ${mapEaseToCSS(
                    "easeInOut"
                  )}`,
                  willChange: "opacity, filter, transform",
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
