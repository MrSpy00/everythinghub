"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface KineticTextItem {
  text: string;
  style: "gradient" | "stroke" | "emerald" | "cyan" | "pink" | "amber" | "violet";
  tag?: string;
}

export const DEFAULT_KINETIC_ITEMS: KineticTextItem[] = [
  { text: "HER ŞEYİN MERKEZİ", style: "gradient", tag: "HUB STÜDYOSU" },
  { text: "YOUTUBE PLAYLIST ANALYZER", style: "stroke", tag: "CANLI SÜRE & ANALİZ" },
  { text: "GÖRSEL SIKIŞTIRICI", style: "emerald", tag: "SIFIR VERİ KAYBI" },
  { text: "JSON FORMATTER & VALIDATOR", style: "cyan", tag: "BEAUTIFY & MINIFY" },
  { text: "RENK PALETİ ÇIKARICI", style: "pink", tag: "DOMINANT PALETTE" },
  { text: "BASE64 KODLAYICI", style: "amber", tag: "UTF-8 DESTEKLİ" },
  { text: "İNTERAKTİF REGEX TESTER", style: "violet", tag: "CANLI EŞLEŞME" },
  { text: "ÇOKLU BİRİM DÖNÜŞTÜRÜCÜ", style: "emerald", tag: "HASSAS DÖNÜŞÜM" },
  { text: "METİN KASA DÖNÜŞTÜRÜCÜ", style: "gradient", tag: "CAMEL / SNAKE / KEBAB" },
  { text: "YÜZDE & İNDİRİM HESAPLAYICI", style: "cyan", tag: "HIZLI HESAPLAMA" },
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
    <div className="relative my-2 flex flex-col items-center justify-center">
      {/* Shiny Pill LED Display Frame */}
      <div className="relative inline-flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-[#0d0f1c]/90 px-6 py-3.5 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)]">
        {/* Left LED Status Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,1)]" />
          </span>
          <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/80">
            {currentItem.tag || "LIVE"}
          </span>
        </div>

        {/* Letter Swap Morphing Container */}
        <div className="h-8 sm:h-9 flex items-center justify-center overflow-hidden min-w-[240px] sm:min-w-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.text}
              initial={{ y: 24, opacity: 0, scale: 0.96, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ y: -24, opacity: 0, scale: 0.96, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-[0.05em]"
            >
              {currentItem.text.split("").map((char, charIdx) => (
                <motion.span
                  key={charIdx}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: charIdx * 0.015,
                    ease: "easeOut",
                  }}
                  className={`inline-block font-extrabold text-sm sm:text-lg lg:text-xl tracking-[0.12em] ${
                    currentItem.style === "stroke"
                      ? "text-transparent [-webkit-text-stroke:1.2px_rgba(192,132,252,0.95)] drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                      : currentItem.style === "emerald"
                      ? "text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                      : currentItem.style === "cyan"
                      ? "text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                      : currentItem.style === "pink"
                      ? "text-pink-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                      : currentItem.style === "amber"
                      ? "text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                      : currentItem.style === "violet"
                      ? "text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                      : "bg-gradient-to-r from-purple-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(168,85,247,0.4)]"
                  }`}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right LED Dot Grid */}
        <div className="flex items-center gap-1 shrink-0 opacity-60">
          <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );
}
