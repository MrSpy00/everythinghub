"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Sparkles } from "lucide-react";

export interface KineticItem {
  text: string;
  tag: string;
  glowColor: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

const ITEMS_TR: KineticItem[] = [
  {
    text: "YOUTUBE PLAYLIST ANALYZER",
    tag: "CANLI ANALİZ",
    glowColor: "rgba(168, 85, 247, 0.45)",
    textColor: "from-purple-300 via-indigo-200 to-pink-300",
    badgeBg: "bg-purple-500/15",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-300",
  },
  {
    text: "GÖRSEL SIKIŞTIRICI & WEBP",
    tag: "%90 KÜÇÜLTME",
    glowColor: "rgba(16, 185, 129, 0.45)",
    textColor: "from-emerald-300 via-teal-200 to-cyan-300",
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-300",
  },
  {
    text: "JSON FORMATTER & VALIDATOR",
    tag: "AĞAÇ GÖRÜNÜMÜ",
    glowColor: "rgba(6, 182, 212, 0.45)",
    textColor: "from-cyan-300 via-sky-200 to-indigo-300",
    badgeBg: "bg-cyan-500/15",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-300",
  },
  {
    text: "RENK PALETİ & DOMINANT HEX",
    tag: "TASARIM STÜDYOSU",
    glowColor: "rgba(245, 158, 11, 0.45)",
    textColor: "from-amber-300 via-yellow-200 to-orange-300",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-300",
  },
  {
    text: "BASE64 KODLAYICI & ÇÖZÜCÜ",
    tag: "UTF-8 DESTEKLİ",
    glowColor: "rgba(59, 130, 246, 0.45)",
    textColor: "from-blue-300 via-indigo-200 to-violet-300",
    badgeBg: "bg-blue-500/15",
    badgeBorder: "border-blue-500/30",
    badgeText: "text-blue-300",
  },
  {
    text: "İNTERAKTİF REGEX TESTER",
    tag: "CANLI EŞLEŞME",
    glowColor: "rgba(236, 72, 153, 0.45)",
    textColor: "from-pink-300 via-rose-200 to-purple-300",
    badgeBg: "bg-pink-500/15",
    badgeBorder: "border-pink-500/30",
    badgeText: "text-pink-300",
  },
  {
    text: "ÇOKLU BİRİM DÖNÜŞTÜRÜCÜ",
    tag: "HASSAS HESAPLAMA",
    glowColor: "rgba(20, 184, 166, 0.45)",
    textColor: "from-teal-300 via-emerald-200 to-cyan-300",
    badgeBg: "bg-teal-500/15",
    badgeBorder: "border-teal-500/30",
    badgeText: "text-teal-300",
  },
  {
    text: "CSS & TAILWIND GRADIENT",
    tag: "MODERN RENK GEÇİŞİ",
    glowColor: "rgba(139, 92, 246, 0.45)",
    textColor: "from-violet-300 via-purple-200 to-pink-300",
    badgeBg: "bg-violet-500/15",
    badgeBorder: "border-violet-500/30",
    badgeText: "text-violet-300",
  },
  {
    text: "YÜZDE & İNDİRİM HESAPLAYICI",
    tag: "ANLIK KDV HESABI",
    glowColor: "rgba(234, 179, 8, 0.45)",
    textColor: "from-yellow-300 via-amber-200 to-rose-300",
    badgeBg: "bg-yellow-500/15",
    badgeBorder: "border-yellow-500/30",
    badgeText: "text-yellow-300",
  },
];

const ITEMS_EN: KineticItem[] = [
  {
    text: "YOUTUBE PLAYLIST ANALYZER",
    tag: "LIVE ANALYTICS",
    glowColor: "rgba(168, 85, 247, 0.45)",
    textColor: "from-purple-300 via-indigo-200 to-pink-300",
    badgeBg: "bg-purple-500/15",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-300",
  },
  {
    text: "IMAGE COMPRESSOR & WEBP",
    tag: "90% COMPRESSION",
    glowColor: "rgba(16, 185, 129, 0.45)",
    textColor: "from-emerald-300 via-teal-200 to-cyan-300",
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-300",
  },
  {
    text: "JSON FORMATTER & VALIDATOR",
    tag: "TREE EXPLORER",
    glowColor: "rgba(6, 182, 212, 0.45)",
    textColor: "from-cyan-300 via-sky-200 to-indigo-300",
    badgeBg: "bg-cyan-500/15",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-300",
  },
  {
    text: "COLOR PALETTE & DOMINANT HEX",
    tag: "CREATIVE STUDIO",
    glowColor: "rgba(245, 158, 11, 0.45)",
    textColor: "from-amber-300 via-yellow-200 to-orange-300",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-300",
  },
  {
    text: "BASE64 ENCODER & DECODER",
    tag: "UTF-8 ENGINE",
    glowColor: "rgba(59, 130, 246, 0.45)",
    textColor: "from-blue-300 via-indigo-200 to-violet-300",
    badgeBg: "bg-blue-500/15",
    badgeBorder: "border-blue-500/30",
    badgeText: "text-blue-300",
  },
  {
    text: "INTERACTIVE REGEX TESTER",
    tag: "REAL-TIME MATCH",
    glowColor: "rgba(236, 72, 153, 0.45)",
    textColor: "from-pink-300 via-rose-200 to-purple-300",
    badgeBg: "bg-pink-500/15",
    badgeBorder: "border-pink-500/30",
    badgeText: "text-pink-300",
  },
  {
    text: "MULTI-UNIT CONVERTER",
    tag: "HIGH PRECISION",
    glowColor: "rgba(20, 184, 166, 0.45)",
    textColor: "from-teal-300 via-emerald-200 to-cyan-300",
    badgeBg: "bg-teal-500/15",
    badgeBorder: "border-teal-500/30",
    badgeText: "text-teal-300",
  },
  {
    text: "CSS & TAILWIND GRADIENTS",
    tag: "MODERN REFRACTION",
    glowColor: "rgba(139, 92, 246, 0.45)",
    textColor: "from-violet-300 via-purple-200 to-pink-300",
    badgeBg: "bg-violet-500/15",
    badgeBorder: "border-violet-500/30",
    badgeText: "text-violet-300",
  },
  {
    text: "PERCENTAGE & DISCOUNT CALC",
    tag: "TAX & VAT ENGINE",
    glowColor: "rgba(234, 179, 8, 0.45)",
    textColor: "from-yellow-300 via-amber-200 to-rose-300",
    badgeBg: "bg-yellow-500/15",
    badgeBorder: "border-yellow-500/30",
    badgeText: "text-yellow-300",
  },
];

export function KineticText({ intervalMs = 3000 }: { intervalMs?: number }) {
  const { lang } = useLanguage();
  const items = useMemo(() => (lang === "en" ? ITEMS_EN : ITEMS_TR), [lang]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  const current = items[index % items.length];

  return (
    <div className="relative my-3 w-full max-w-3xl mx-auto h-12 sm:h-14 md:h-16 flex items-center justify-center select-none overflow-hidden px-2">
      {/* 1. Multi-Layer Ultra-Soft Gaussian Ambient Glow - No Sharp Edges */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Layer A: Broad ultra-diffused atmospheric glow */}
        <motion.div
          key={`broad-${current.text}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.55, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(ellipse 65% 50% at 50% 50%, ${current.glowColor} 0%, rgba(0, 0, 0, 0) 75%)`,
            filter: "blur(32px)",
          }}
          className="absolute inset-0 w-full h-full"
        />

        {/* Layer B: Centered soft specular highlight */}
        <motion.div
          key={`core-${current.text}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${current.glowColor} 0%, rgba(0, 0, 0, 0) 50%)`,
            filter: "blur(18px)",
          }}
          className="absolute w-3/4 h-full"
        />
      </div>

      {/* 2. Liquid Glass Capsule Container - Zero Layout Shift & Single-Line Fit */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.text}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-2 sm:gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 sm:px-5 py-1.5 sm:py-2 backdrop-blur-2xl shadow-xl shadow-black/30 max-w-full"
          >
            {/* Tag Pill with Pulse Indicator */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-md shrink-0 ${current.badgeBg} ${current.badgeBorder} ${current.badgeText}`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
              </span>
              <span className="hidden xs:inline">{current.tag}</span>
            </span>

            {/* Kinetic Studio Title - Strict Single Line with Fluid Typography */}
            <span
              className={`bg-gradient-to-r ${current.textColor} bg-clip-text text-transparent font-black tracking-wide sm:tracking-wider whitespace-nowrap text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl shrink-0 leading-none drop-shadow-sm`}
            >
              {current.text}
            </span>

            {/* Subtle Right Sparkle Accent */}
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/50 shrink-0 hidden sm:block" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
