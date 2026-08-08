"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface KineticTextItem {
  text: string;
  style: "gradient" | "stroke" | "emerald" | "cyan" | "pink" | "amber" | "violet";
  glowColor: string;
  borderColor: string;
}

export const DEFAULT_KINETIC_ITEMS: KineticTextItem[] = [
  {
    text: "YOUTUBE PLAYLIST ANALYZER",
    style: "stroke",
    glowColor: "rgba(168,85,247,0.3)",
    borderColor: "border-purple-500/40",
  },
  {
    text: "GÖRSEL SIKIŞTIRICI",
    style: "emerald",
    glowColor: "rgba(16,185,129,0.3)",
    borderColor: "border-emerald-500/40",
  },
  {
    text: "JSON FORMATTER & VALIDATOR",
    style: "cyan",
    glowColor: "rgba(6,182,212,0.3)",
    borderColor: "border-cyan-500/40",
  },
  {
    text: "RENK PALETİ ÇIKARICI",
    style: "pink",
    glowColor: "rgba(244,63,94,0.3)",
    borderColor: "border-pink-500/40",
  },
  {
    text: "BASE64 KODLAYICI",
    style: "amber",
    glowColor: "rgba(245,158,11,0.3)",
    borderColor: "border-amber-500/40",
  },
  {
    text: "İNTERAKTİF REGEX TESTER",
    style: "violet",
    glowColor: "rgba(168,85,247,0.3)",
    borderColor: "border-purple-500/40",
  },
  {
    text: "ÇOKLU BİRİM DÖNÜŞTÜRÜCÜ",
    style: "emerald",
    glowColor: "rgba(16,185,129,0.3)",
    borderColor: "border-emerald-500/40",
  },
  {
    text: "METİN KASA DÖNÜŞTÜRÜCÜ",
    style: "gradient",
    glowColor: "rgba(168,85,247,0.3)",
    borderColor: "border-purple-500/40",
  },
  {
    text: "YÜZDE & İNDİRİM HESAPLAYICI",
    style: "cyan",
    glowColor: "rgba(6,182,212,0.3)",
    borderColor: "border-cyan-500/40",
  },
];

export function KineticText({
  items = DEFAULT_KINETIC_ITEMS,
  intervalMs = 3000,
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
    <div className="relative my-3 flex flex-col items-center justify-center">
      {/* Dynamic Glowing RGB Glass Capsule Container */}
      <motion.div
        animate={{
          boxShadow: `0 0 35px ${currentItem.glowColor}`,
        }}
        transition={{ duration: 0.6 }}
        className={`group relative inline-flex items-center gap-3 rounded-full border bg-[#0a0c16]/90 px-6 py-2.5 sm:px-8 sm:py-3 backdrop-blur-3xl transition-all duration-500 ${currentItem.borderColor}`}
      >
        {/* Ambient Backlight Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/10 via-indigo-500/10 to-pink-500/10 blur-md opacity-70 pointer-events-none" />

        {/* Status Pulse Indicator */}
        <div className="relative z-10 flex items-center shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,1)]" />
          </span>
        </div>

        {/* Morphing Text Container */}
        <div className="relative z-10 h-7 sm:h-8 flex items-center justify-center overflow-hidden min-w-[220px] sm:min-w-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.text}
              initial={{ y: 18, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -18, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-[0.04em]"
            >
              {currentItem.text.split("").map((char, charIdx) => (
                <motion.span
                  key={charIdx}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.18,
                    delay: charIdx * 0.01,
                    ease: "easeOut",
                  }}
                  className={`inline-block font-black text-xs sm:text-base lg:text-lg tracking-[0.12em] ${
                    currentItem.style === "stroke"
                      ? "text-transparent [-webkit-text-stroke:1px_rgba(192,132,252,0.95)] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      : currentItem.style === "emerald"
                      ? "text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                      : currentItem.style === "cyan"
                      ? "text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                      : currentItem.style === "pink"
                      ? "text-pink-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                      : currentItem.style === "amber"
                      ? "text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                      : currentItem.style === "violet"
                      ? "text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                      : "bg-gradient-to-r from-purple-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(168,85,247,0.4)]"
                  }`}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* End Status Dot */}
        <div className="relative z-10 flex items-center shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,1)]" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}
