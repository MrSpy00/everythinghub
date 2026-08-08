"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface KineticItem {
  text: string;
  glowColor: string;
  textColor: string;
}

const ITEMS_TR: KineticItem[] = [
  {
    text: "YOUTUBE PLAYLIST ANALYZER",
    glowColor: "rgba(168, 85, 247, 0.35)",
    textColor: "from-purple-300 via-indigo-200 to-pink-300",
  },
  {
    text: "GÖRSEL SIKIŞTIRICI & WEBP",
    glowColor: "rgba(16, 185, 129, 0.35)",
    textColor: "from-emerald-300 via-teal-200 to-cyan-300",
  },
  {
    text: "JSON FORMATTER & VALIDATOR",
    glowColor: "rgba(6, 182, 212, 0.35)",
    textColor: "from-cyan-300 via-sky-200 to-indigo-300",
  },
  {
    text: "RENK PALETİ & DOMINANT HEX",
    glowColor: "rgba(245, 158, 11, 0.35)",
    textColor: "from-amber-300 via-yellow-200 to-orange-300",
  },
  {
    text: "BASE64 KODLAYICI & ÇÖZÜCÜ",
    glowColor: "rgba(59, 130, 246, 0.35)",
    textColor: "from-blue-300 via-indigo-200 to-violet-300",
  },
  {
    text: "İNTERAKTİF REGEX TESTER",
    glowColor: "rgba(236, 72, 153, 0.35)",
    textColor: "from-pink-300 via-rose-200 to-purple-300",
  },
  {
    text: "ÇOKLU BİRİM DÖNÜŞTÜRÜCÜ",
    glowColor: "rgba(20, 184, 166, 0.35)",
    textColor: "from-teal-300 via-emerald-200 to-cyan-300",
  },
  {
    text: "CSS & TAILWIND GRADIENT",
    glowColor: "rgba(139, 92, 246, 0.35)",
    textColor: "from-violet-300 via-purple-200 to-pink-300",
  },
  {
    text: "YÜZDE & İNDİRİM HESAPLAYICI",
    glowColor: "rgba(234, 179, 8, 0.35)",
    textColor: "from-yellow-300 via-amber-200 to-rose-300",
  },
];

const ITEMS_EN: KineticItem[] = [
  {
    text: "YOUTUBE PLAYLIST ANALYZER",
    glowColor: "rgba(168, 85, 247, 0.35)",
    textColor: "from-purple-300 via-indigo-200 to-pink-300",
  },
  {
    text: "IMAGE COMPRESSOR & WEBP",
    glowColor: "rgba(16, 185, 129, 0.35)",
    textColor: "from-emerald-300 via-teal-200 to-cyan-300",
  },
  {
    text: "JSON FORMATTER & VALIDATOR",
    glowColor: "rgba(6, 182, 212, 0.35)",
    textColor: "from-cyan-300 via-sky-200 to-indigo-300",
  },
  {
    text: "COLOR PALETTE & DOMINANT HEX",
    glowColor: "rgba(245, 158, 11, 0.35)",
    textColor: "from-amber-300 via-yellow-200 to-orange-300",
  },
  {
    text: "BASE64 ENCODER & DECODER",
    glowColor: "rgba(59, 130, 246, 0.35)",
    textColor: "from-blue-300 via-indigo-200 to-violet-300",
  },
  {
    text: "INTERACTIVE REGEX TESTER",
    glowColor: "rgba(236, 72, 153, 0.35)",
    textColor: "from-pink-300 via-rose-200 to-purple-300",
  },
  {
    text: "MULTI-UNIT CONVERTER",
    glowColor: "rgba(20, 184, 166, 0.35)",
    textColor: "from-teal-300 via-emerald-200 to-cyan-300",
  },
  {
    text: "CSS & TAILWIND GRADIENTS",
    glowColor: "rgba(139, 92, 246, 0.35)",
    textColor: "from-violet-300 via-purple-200 to-pink-300",
  },
  {
    text: "PERCENTAGE & DISCOUNT CALC",
    glowColor: "rgba(234, 179, 8, 0.35)",
    textColor: "from-yellow-300 via-amber-200 to-rose-300",
  },
];

export function KineticText({ intervalMs = 2800 }: { intervalMs?: number }) {
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
    <div className="relative my-3 sm:my-4 w-full max-w-3xl mx-auto h-12 sm:h-14 md:h-16 flex items-center justify-center select-none px-2">
      {/* 1. Organic, Unbounded, Ultra-Soft Gaussian Ambient Diffusion - No Sharp Edges */}
      <div className="absolute -inset-x-8 -inset-y-4 flex items-center justify-center pointer-events-none">
        {/* Layer A: Broad diffused atmospheric glow */}
        <motion.div
          key={`broad-${current.text}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${current.glowColor} 0%, rgba(0, 0, 0, 0) 70%)`,
            filter: "blur(40px)",
          }}
          className="absolute inset-0 w-full h-full"
        />

        {/* Layer B: Centered soft specular highlight */}
        <motion.div
          key={`core-${current.text}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${current.glowColor} 0%, rgba(0, 0, 0, 0) 50%)`,
            filter: "blur(20px)",
          }}
          className="absolute w-3/4 h-full"
        />
      </div>

      {/* 2. Liquid Glass Capsule - Clean, Bold, Minimal & Large Typography */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.text}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center rounded-full border border-white/12 bg-[#09090b]/80 px-5 sm:px-8 py-2 sm:py-2.5 backdrop-blur-2xl shadow-2xl shadow-black/40 max-w-full"
          >
            {/* Pure Kinetic Studio Title - Large, Ultra-Sharp & Elegant */}
            <span
              className={`bg-gradient-to-r ${current.textColor} bg-clip-text text-transparent font-black tracking-wider whitespace-nowrap text-sm sm:text-base md:text-xl lg:text-2xl leading-none drop-shadow-sm`}
            >
              {current.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
