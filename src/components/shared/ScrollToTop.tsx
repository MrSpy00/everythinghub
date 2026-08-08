"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
          const windowHeight =
            document.documentElement.scrollHeight - document.documentElement.clientHeight;
          
          if (totalScroll > 240) {
            setVisible(true);
          } else {
            setVisible(false);
          }

          if (windowHeight > 0) {
            const progress = (totalScroll / windowHeight) * 100;
            setScrollProgress(Math.min(100, Math.max(0, progress)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const circumference = 2 * Math.PI * 18; // radius = 18

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 select-none pb-[env(safe-area-inset-bottom)]"
        >
          <button
            type="button"
            onClick={scrollToTop}
            aria-label={t.scrollToTop || "En Yukarı Çık"}
            title={t.scrollToTop || "En Yukarı Çık"}
            data-cursor="Yukarı"
            className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/15 bg-[#0e1017]/85 text-white backdrop-blur-2xl shadow-[0_8px_32px_rgba(139,92,246,0.35)] transition-all duration-300 hover:scale-110 hover:border-indigo-400 hover:shadow-[0_12px_40px_rgba(139,92,246,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95"
          >
            {/* SVG Progress Circle Indicator */}
            <svg
              className="absolute inset-0 h-full w-full -rotate-90 p-0.5"
              viewBox="0 0 44 44"
              aria-hidden="true"
            >
              {/* Background track circle */}
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2.5"
              />
              {/* Animated Progress circle */}
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="url(#scrollGradient)"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (scrollProgress / 100) * circumference}
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
              />
              <defs>
                <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Arrow Icon */}
            <ArrowUp className="relative z-10 h-4 w-4 sm:h-5 sm:w-5 text-indigo-200 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-white" />

            {/* Ambient Multi-Layer Glow */}
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
