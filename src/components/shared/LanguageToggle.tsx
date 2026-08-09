"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function FlagTR() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      className="h-full w-full object-cover"
      aria-hidden="true"
    >
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="425" cy="400" r="200" fill="#ffffff" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <g transform="translate(625, 400) rotate(-90)">
        <polygon
          fill="#ffffff"
          points="0,-75 22.04,-22.63 71.33,-23.18 31.42,7.03 46.47,59.98 0,26.25 -46.47,59.98 -31.42,7.03 -71.33,-23.18 -22.04,-22.63"
        />
      </g>
    </svg>
  );
}

function FlagGB() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      className="h-full w-full object-cover"
      aria-hidden="true"
    >
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#t)"
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === "tr" ? "en" : "tr");
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`group relative flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-white backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 hover:bg-white/[0.1] shadow-lg shadow-indigo-950/20 active:scale-95 cursor-pointer ${className}`}
      data-cursor={lang === "tr" ? "English" : "Türkçe"}
      title={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
      aria-label={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: -4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2"
        >
          <div className="relative h-3.5 w-5 overflow-hidden rounded-[3px] border border-white/20 shadow-sm shrink-0 flex items-center justify-center bg-black/40">
            {lang === "tr" ? <FlagTR /> : <FlagGB />}
          </div>
          <span className="font-black uppercase tracking-wider text-xs text-indigo-200 group-hover:text-white transition-colors">
            {lang === "tr" ? "TR" : "EN"}
          </span>
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
