"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface KineticTextItem {
  text: string;
  style: "gradient" | "stroke" | "emerald" | "cyan" | "pink" | "amber" | "violet";
  glowColor: string;
}

export const DEFAULT_KINETIC_ITEMS: KineticTextItem[] = [
  {
    text: "YOUTUBE PLAYLIST ANALYZER",
    style: "stroke",
    glowColor: "rgba(168,85,247,0.5)",
  },
  {
    text: "GÖRSEL SIKIŞTIRICI",
    style: "emerald",
    glowColor: "rgba(16,185,129,0.5)",
  },
  {
    text: "JSON FORMATTER & VALIDATOR",
    style: "cyan",
    glowColor: "rgba(6,182,212,0.5)",
  },
  {
    text: "RENK PALETİ ÇIKARICI",
    style: "pink",
    glowColor: "rgba(244,63,94,0.5)",
  },
  {
    text: "BASE64 KODLAYICI",
    style: "amber",
    glowColor: "rgba(245,158,11,0.5)",
  },
  {
    text: "İNTERAKTİF REGEX TESTER",
    style: "violet",
    glowColor: "rgba(168,85,247,0.5)",
  },
  {
    text: "ÇOKLU BİRİM DÖNÜŞTÜRÜCÜ",
    style: "emerald",
    glowColor: "rgba(16,185,129,0.5)",
  },
  {
    text: "METİN KASA DÖNÜŞTÜRÜCÜ",
    style: "gradient",
    glowColor: "rgba(168,85,247,0.5)",
  },
  {
    text: "YÜZDE & İNDİRİM HESAPLAYICI",
    style: "cyan",
    glowColor: "rgba(6,182,212,0.5)",
  },
];

export function KineticText({
  items = DEFAULT_KINETIC_ITEMS,
  intervalMs = 2800,
}: {
  items?: KineticTextItem[];
  intervalMs?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  const currentItem = items[currentIndex];

  return (
    <div className="relative my-4 flex flex-col items-center justify-center w-full min-h-[50px] sm:min-h-[64px] lg:min-h-[72px]">
      {/* Ambient Radial Backlight Blur */}
      <motion.div
        animate={{
          background: `radial-gradient(ellipse at center, ${currentItem.glowColor} 0%, transparent 70%)`,
        }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 blur-2xl opacity-50 pointer-events-none"
      />

      {/* Floating Kinetic Text Container (No Outer Boxes, Dots, or Frames) */}
      <div className="relative z-10 flex items-center justify-center overflow-hidden w-full px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.text}
            initial={{ y: 22, opacity: 0, scale: 0.94, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ y: -22, opacity: 0, scale: 0.94, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center flex-wrap gap-[0.04em]"
          >
            {currentItem.text.split("").map((char, charIdx) => (
              <motion.span
                key={charIdx}
                initial={{ y: 8, opacity: 0, rotateX: 90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{
                  duration: 0.22,
                  delay: charIdx * 0.012,
                  ease: "easeOut",
                }}
                className={`inline-block font-black text-xl sm:text-3xl lg:text-4xl xl:text-5xl tracking-[0.14em] leading-none ${
                  currentItem.style === "stroke"
                    ? "text-transparent [-webkit-text-stroke:1.5px_rgba(192,132,252,0.95)] drop-shadow-[0_0_16px_rgba(168,85,247,0.6)]"
                    : currentItem.style === "emerald"
                    ? "text-emerald-300 drop-shadow-[0_0_18px_rgba(16,185,129,0.7)]"
                    : currentItem.style === "cyan"
                    ? "text-cyan-300 drop-shadow-[0_0_18px_rgba(6,182,212,0.7)]"
                    : currentItem.style === "pink"
                    ? "text-pink-300 drop-shadow-[0_0_18px_rgba(244,63,94,0.7)]"
                    : currentItem.style === "amber"
                    ? "text-amber-300 drop-shadow-[0_0_18px_rgba(245,158,11,0.7)]"
                    : currentItem.style === "violet"
                    ? "text-purple-300 drop-shadow-[0_0_18px_rgba(168,85,247,0.7)]"
                    : "bg-gradient-to-r from-purple-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(168,85,247,0.5)]"
                }`}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
