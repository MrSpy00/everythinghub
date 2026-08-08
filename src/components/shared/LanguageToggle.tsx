"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === "tr" ? "en" : "tr");
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`group relative flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 hover:bg-white/[0.1] shadow-lg shadow-indigo-950/20 active:scale-95 ${className}`}
      data-cursor={lang === "tr" ? "English" : "Türkçe"}
      title={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
      aria-label={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: -6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex items-center gap-2"
        >
          <div className="relative h-4 w-5.5 overflow-hidden rounded-[3px] border border-white/20 shadow-sm shrink-0">
            <Image
              src={lang === "tr" ? "/flags/flag_tr.svg" : "/flags/flag_gb.svg"}
              alt={lang === "tr" ? "Türkçe" : "English"}
              width={24}
              height={16}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-black uppercase tracking-wider text-xs text-indigo-200 group-hover:text-white transition-colors">
            {lang === "tr" ? "TR" : "EN"}
          </span>
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
