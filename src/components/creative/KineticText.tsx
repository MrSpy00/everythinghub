"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Flame, Shield, Layers, Code } from "lucide-react";

export interface KineticTextItem {
  text: string;
  style: "gradient" | "stroke" | "emerald" | "cyan" | "pink" | "amber" | "violet";
  tag: string;
  icon: React.ElementType;
}

export const DEFAULT_KINETIC_ITEMS: KineticTextItem[] = [
  { text: "YOUTUBE PLAYLIST ANALYZER", style: "stroke", tag: "CANLI SÜRE & ANALİZ", icon: Zap },
  { text: "GÖRSEL SIKIŞTIRICI", style: "emerald", tag: "SIFIR VERİ KAYBI", icon: Flame },
  { text: "JSON FORMATTER & VALIDATOR", style: "cyan", tag: "BEAUTIFY & MINIFY", icon: Code },
  { text: "RENK PALETİ ÇIKARICI", style: "pink", tag: "DOMINANT PALETTE", icon: Layers },
  { text: "BASE64 KODLAYICI", style: "amber", tag: "UTF-8 DESTEKLİ", icon: Shield },
  { text: "İNTERAKTİF REGEX TESTER", style: "violet", tag: "CANLI EŞLEŞME", icon: Zap },
  { text: "ÇOKLU BİRİM DÖNÜŞTÜRÜCÜ", style: "emerald", tag: "HASSAS DÖNÜŞÜM", icon: Layers },
  { text: "METİN KASA DÖNÜŞTÜRÜCÜ", style: "gradient", tag: "CAMEL / SNAKE / KEBAB", icon: Sparkles },
  { text: "YÜZDE & İNDİRİM HESAPLAYICI", style: "cyan", tag: "HIZLI HESAPLAMA", icon: Flame },
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
  const ItemIcon = currentItem.icon;

  return (
    <div className="relative my-3 flex flex-col items-center justify-center">
      {/* Outer Studio Glass Pill Container */}
      <div className="group relative inline-flex items-center gap-3.5 rounded-full border border-purple-500/30 bg-[#090b14]/95 px-5 py-2.5 sm:px-7 sm:py-3 backdrop-blur-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-500 hover:border-purple-400/60 hover:shadow-[0_0_50px_rgba(168,85,247,0.25)]">
        {/* Subtle Conic Sweep Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/10 via-indigo-500/10 to-pink-500/10 blur-xl opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity" />

        {/* Left LED Icon Badge */}
        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-sm">
            <ItemIcon className="h-3.5 w-3.5" />
          </div>
          <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-[0.25em] text-purple-300/90">
            {currentItem.tag}
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="relative z-10 hidden sm:block h-4 w-[1px] bg-purple-500/30 shrink-0" />

        {/* Letter Swap Morphing Text Container */}
        <div className="relative z-10 h-7 sm:h-8 flex items-center justify-center overflow-hidden min-w-[200px] sm:min-w-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.text}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-[0.04em]"
            >
              {currentItem.text.split("").map((char, charIdx) => (
                <motion.span
                  key={charIdx}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: charIdx * 0.012,
                    ease: "easeOut",
                  }}
                  className={`inline-block font-black text-xs sm:text-base lg:text-lg tracking-[0.1em] ${
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

        {/* Right Status Dot */}
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,1)]" />
          </span>
        </div>
      </div>
    </div>
  );
}
