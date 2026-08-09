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
  Sparkles,
  X,
  Compass,
  Layers,
} from "lucide-react";
import { getLiveTools } from "@/lib/tools-registry";
import { NeonBorder } from "@/components/creative/NeonBorder";
import { KineticText } from "@/components/creative/KineticText";
import { MeshText } from "@/components/creative/MeshText";
import { FluidSlimeCard } from "@/components/creative/FluidSlimeCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface HeroSectionProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export function HeroSection({ searchQuery, onSearch }: HeroSectionProps) {
  const liveCount = getLiveTools().length;
  const { t, lang } = useLanguage();
  const isTurkish = lang === "tr";

  const handleInputChange = (val: string) => {
    onSearch(val);
  };

  const scrollToTools = () => {
    if (typeof window !== "undefined") {
      const toolsElem = document.getElementById("tools");
      if (toolsElem) {
        const headerOffset = 76;
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
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4.5rem)] px-4 py-8 sm:py-12 lg:py-16 text-center max-w-7xl 2xl:max-w-8xl mx-auto w-full">
      {/* Top Studio Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-2xl shadow-xl hover:border-indigo-500/40 transition-colors"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="tracking-wide">
          Studio v1.0 · {liveCount} {t.activeCountLabel} {t.tools} · {t.freeForeverTitle}
        </span>
      </motion.div>

      {/* Main Studio Title */}
      <div className="mb-2 max-w-4xl 2xl:max-w-5xl w-full flex flex-col items-center">
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
      <p className="mb-6 sm:mb-8 max-w-2xl 2xl:max-w-3xl text-xs sm:text-sm lg:text-base leading-relaxed text-[var(--hub-text-muted)] px-3">
        {t.heroSubtitle}
      </p>

      {/* Hero Quick Search Bar - Sleek Liquid Glass Studio Container */}
      <div className="mb-6 sm:mb-8 w-full max-w-xl 2xl:max-w-2xl px-2">
        <NeonBorder color="#8b5cf6" rounded={22} glow={50}>
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
              data-cursor={t.searchPlaceholder}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleInputChange("")}
                className="mr-2 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title={t.clear}
                aria-label={t.clear}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={scrollToTools}
              className="relative group/btn inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-white/[0.06] px-4 py-2 text-xs sm:text-sm font-bold text-white backdrop-blur-2xl shadow-lg transition-all duration-300 hover:border-indigo-400/80 hover:bg-indigo-500/20 hover:shadow-indigo-500/25 hover:scale-[1.03] active:scale-95 shrink-0 overflow-hidden cursor-pointer"
              data-cursor={t.explore}
            >
              <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <Compass className="h-4 w-4 text-indigo-300 transition-transform duration-500 group-hover/btn:rotate-180" />
              <span className="relative z-10">{t.explore}</span>
            </button>
          </div>
        </NeonBorder>
      </div>

      {/* Hero Action Buttons */}
      <div className="mb-8 sm:mb-10 flex flex-wrap items-center justify-center gap-3.5">
        <button
          type="button"
          onClick={scrollToTools}
          className="group flex items-center gap-2.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-3.5 text-xs sm:text-sm font-bold text-indigo-300 backdrop-blur-2xl shadow-xl transition-all hover:scale-105 hover:bg-indigo-500/20 hover:border-indigo-400 cursor-pointer"
          data-cursor={t.inspectAllTools}
        >
          <Layers className="h-4 w-4 text-indigo-400" />
          <span>{t.inspectAllTools}</span>
          <span className="ml-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase font-mono">
            {liveCount} {t.tools}
          </span>
        </button>

        <button
          type="button"
          onClick={scrollToTools}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-xs sm:text-sm font-semibold text-zinc-300 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white cursor-pointer"
          data-cursor={t.explore}
        >
          <ArrowDown className="h-4 w-4 text-zinc-400" />
          <span>{isTurkish ? "Kategorileri Görüntüle" : "Browse Categories"}</span>
        </button>
      </div>

      {/* 4 Feature Highlights Grid with FluidSlimeCard */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl 2xl:max-w-5xl w-full">
        {[
          {
            icon: ShieldCheck,
            title: t.zeroDataTitle,
            desc: t.zeroDataDesc,
            color: "text-emerald-400",
            glow: "rgba(16, 185, 129, 0.25)",
          },
          {
            icon: Cpu,
            title: t.turbopackTitle,
            desc: t.turbopackDesc,
            color: "text-indigo-400",
            glow: "rgba(99, 102, 241, 0.25)",
          },
          {
            icon: Code2,
            title: t.openSourceTitle,
            desc: t.openSourceDesc,
            color: "text-purple-400",
            glow: "rgba(168, 85, 247, 0.25)",
          },
          {
            icon: Globe,
            title: t.freeForeverTitle,
            desc: t.freeForeverDesc,
            color: "text-pink-400",
            glow: "rgba(236, 72, 153, 0.25)",
          },
        ].map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <FluidSlimeCard
              key={i}
              glowColor={item.glow}
              className="flex flex-col items-center justify-center p-3.5 sm:p-4 text-center cursor-default"
            >
              <ItemIcon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 mb-1.5 sm:mb-2 ${item.color}`} />
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">{item.title}</span>
              <span className="text-[10px] sm:text-[11px] text-[var(--hub-text-subtle)] mt-0.5">{item.desc}</span>
            </FluidSlimeCard>
          );
        })}
      </div>
    </section>
  );
}
