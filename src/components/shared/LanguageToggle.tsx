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
      className={`group relative flex items-center gap-2 rounded-xl border border-purple-500/30 bg-[#0c0e17]/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-2xl transition-all hover:border-purple-400 hover:bg-purple-500/15 shadow-lg shadow-purple-950/20 active:scale-95 ${className}`}
      data-cursor={lang === "tr" ? "English" : "Türkçe"}
      title={lang === "tr" ? "Switch to English" : "Türkçe'ye Geç"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={lang}
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <div className="relative h-4 w-6 overflow-hidden rounded-[3px] border border-white/20 shadow-sm shrink-0">
            <Image
              src={lang === "tr" ? "/flags/flag_tr.svg" : "/flags/flag_gb.svg"}
              alt={lang === "tr" ? "Türkçe" : "English"}
              width={24}
              height={16}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-extrabold uppercase tracking-wider text-xs">
            {lang === "tr" ? "TR" : "EN"}
          </span>
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
