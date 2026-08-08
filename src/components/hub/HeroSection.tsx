"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  Search,
  ShieldCheck,
  Cpu,
  Code2,
  Globe,
  PlaySquare,
  X,
  Compass,
} from "lucide-react";
import { getLiveTools } from "@/lib/tools-registry";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { KineticText } from "@/components/creative/KineticText";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface HeroSectionProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export function HeroSection({ searchQuery, onSearch }: HeroSectionProps) {
  const liveCount = getLiveTools().length;
  const { t } = useLanguage();

  const handleInputChange = (val: string) => {
    onSearch(val);
  };

  const scrollToTools = () => {
    if (typeof window !== "undefined") {
      const toolsElem = document.getElementById("tools");
      if (toolsElem) {
        const headerOffset = 76; // Sticky header + comfortable breathing room
        const elementPosition = toolsElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-4 py-6 sm:py-8 lg:py-12 text-center max-w-7xl 2xl:max-w-8xl mx-auto w-full overflow-hidden">
      {/* Top Studio Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-2xl shadow-xl shadow-indigo-950/20"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="tracking-wide">
          Studio v1.0 · {liveCount} {t.activeCountLabel} · {t.studioTagline}
        </span>
      </motion.div>

      {/* Main Studio Title */}
      <div className="mb-3 max-w-4xl 2xl:max-w-5xl w-full flex flex-col items-center">
        <h1
          suppressHydrationWarning
          className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl leading-tight"
        >
          {t.studioHeroTitle}
        </h1>

        {/* Dynamic Kinetic Text Morph & Ambient Diffusion Component */}
        <KineticText />
      </div>

      {/* Subtitle */}
      <p className="mb-8 max-w-2xl 2xl:max-w-3xl text-xs sm:text-sm lg:text-base leading-relaxed text-[var(--hub-text-muted)] px-3">
        {t.heroSubtitle}
      </p>

      {/* Hero Quick Search Bar - Sleek Liquid Glass Studio Container */}
      <div className="mb-8 w-full max-w-xl 2xl:max-w-2xl px-2">
        <NeonBorder color="#8b5cf6" rounded={22} glow={40}>
          <div className="relative flex items-center rounded-[20px] border border-white/10 bg-[#0e1017]/90 p-1.5 sm:p-2 backdrop-blur-3xl shadow-2xl transition-all hover:border-indigo-500/40 focus-within:border-indigo-500/60">
            <Search className="ml-3 h-4 w-4 text-indigo-400/80 shrink-0" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") scrollToTools();
              }}
              style={{ outline: "none", boxShadow: "none" }}
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-[var(--hub-text-subtle)] border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 shadow-none"
              data-cursor="Ara"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleInputChange("")}
                className="mr-2 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title={t.clear}
                aria-label={t.clear}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={scrollToTools}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2 text-xs sm:text-sm font-bold text-white backdrop-blur-2xl shadow-lg transition-all hover:bg-indigo-500/20 hover:border-indigo-400/60 hover:scale-[1.02] active:scale-95 shrink-0"
              data-cursor="Keşfet"
            >
              <Compass className="h-4 w-4 text-indigo-300 transition-transform duration-300 group-hover:rotate-45" />
              <span>{t.explore}</span>
            </button>
          </div>
        </NeonBorder>
      </div>

      {/* Hero Action Buttons */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3.5">
        <Link
          href="/tools/yt-playlist-length"
          className="group flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.05] px-6 py-3.5 text-xs sm:text-sm font-bold text-white backdrop-blur-2xl shadow-xl shadow-purple-950/20 transition-all hover:scale-105 hover:bg-white/[0.1] hover:border-indigo-400/80"
          data-cursor="YouTube"
        >
          <PlaySquare className="h-4 w-4 text-indigo-400" />
          <span>{t.ytPlaylistTitle}</span>
          <span className="ml-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase">
            {t.live}
          </span>
        </Link>

        <button
          type="button"
          onClick={scrollToTools}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-xs sm:text-sm font-semibold text-[var(--hub-text)] backdrop-blur-xl transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
          data-cursor="Katalog"
        >
          <ArrowDown className="h-4 w-4 text-indigo-400" />
          <span>{t.inspectAllTools}</span>
        </button>
      </div>

      {/* 4 Feature Highlights Grid - Studio Liquid Glass Styling */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl 2xl:max-w-5xl w-full">
        {[
          {
            icon: ShieldCheck,
            title: t.zeroDataTitle,
            desc: t.zeroDataDesc,
            color: "text-emerald-400",
            borderColor: "hover:border-emerald-500/40",
            bgGlow: "hover:shadow-emerald-500/10",
          },
          {
            icon: Cpu,
            title: t.turbopackTitle,
            desc: t.turbopackDesc,
            color: "text-indigo-400",
            borderColor: "hover:border-indigo-500/40",
            bgGlow: "hover:shadow-indigo-500/10",
          },
          {
            icon: Code2,
            title: t.openSourceTitle,
            desc: t.openSourceDesc,
            color: "text-purple-400",
            borderColor: "hover:border-purple-500/40",
            bgGlow: "hover:shadow-purple-500/10",
          },
          {
            icon: Globe,
            title: t.freeForeverTitle,
            desc: t.freeForeverDesc,
            color: "text-pink-400",
            borderColor: "hover:border-pink-500/40",
            bgGlow: "hover:shadow-pink-500/10",
          },
        ].map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-white/8 bg-white/[0.025] backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.06] hover:shadow-2xl ${item.borderColor} ${item.bgGlow}`}
            >
              <ItemIcon className={`h-5 w-5 mb-2 ${item.color}`} />
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">{item.title}</span>
              <span className="text-[11px] text-[var(--hub-text-subtle)] mt-0.5">{item.desc}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
