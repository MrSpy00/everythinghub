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

  const handleSearchExecute = () => {
    if (typeof window !== "undefined") {
      const toolsElem = document.getElementById("tools");
      if (toolsElem) {
        toolsElem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-4 pb-8 text-center sm:pt-6 sm:pb-10 lg:pt-8 lg:pb-12 max-w-7xl mx-auto w-full">
      {/* Top Studio Badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300 backdrop-blur-xl shadow-lg shadow-purple-950/20">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>Studio v1.0 · {liveCount} {t.activeCountLabel} · {t.studioTagline}</span>
      </div>

      {/* Main Studio Title */}
      <div className="mb-2 max-w-4xl w-full flex flex-col items-center">
        <h1
          suppressHydrationWarning
          className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight"
        >
          {t.studioHeroTitle}
        </h1>

        {/* Dynamic Kinetic Text Morph & Shiny Pill LED Component */}
        <KineticText />
      </div>

      {/* Subtitle */}
      <p className="mb-6 max-w-2xl text-xs sm:text-sm lg:text-base leading-relaxed text-[var(--hub-text-muted)] px-2">
        {t.heroSubtitle}
      </p>

      {/* Hero Quick Search Bar - Sleek Liquid Glass */}
      <div className="mb-8 w-full max-w-xl">
        <NeonBorder color="#a855f7" rounded={20} glow={40}>
          <div className="relative flex items-center rounded-[18px] border border-purple-500/20 bg-[#0c0e17]/95 p-1.5 backdrop-blur-3xl shadow-2xl transition-all hover:border-purple-500/40">
            <Search className="ml-3 h-4 w-4 text-purple-400 shrink-0" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchExecute();
              }}
              className="w-full bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-white placeholder:text-[var(--hub-text-subtle)] border-none outline-none focus:outline-none focus:ring-0 focus:border-none shadow-none"
              data-cursor="Ara"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleInputChange("")}
                className="mr-1.5 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title={t.clear}
                aria-label={t.clear}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearchExecute}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/20 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xl transition-all hover:scale-105 hover:bg-purple-500/30 hover:border-purple-400 shrink-0 shadow-sm"
              data-cursor="Keşfet"
            >
              <Compass className="h-3.5 w-3.5 text-purple-300" />
              <span>{t.explore}</span>
            </button>
          </div>
        </NeonBorder>
      </div>

      {/* Hero CTA Buttons */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/tools/yt-playlist-length"
          className="group flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.06] px-6 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-2xl shadow-xl shadow-purple-950/20 transition-all hover:scale-105 hover:bg-white/[0.12] hover:border-purple-400/80"
          data-cursor="YouTube"
        >
          <PlaySquare className="h-4 w-4 text-purple-400" />
          <span>{t.ytPlaylistTitle}</span>
          <span className="ml-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase">
            {t.live}
          </span>
        </Link>

        <button
          type="button"
          onClick={handleSearchExecute}
          className="flex items-center gap-2 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 px-6 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-xl transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
          data-cursor="Katalog"
        >
          <ArrowDown className="h-4 w-4 text-purple-400" />
          <span>{t.inspectAllTools}</span>
        </button>
      </div>

      {/* 4 Feature Highlights Grid - Liquid Glass Hover Elevation */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl w-full">
        {[
          {
            icon: ShieldCheck,
            title: t.zeroDataTitle,
            desc: t.zeroDataDesc,
            color: "text-emerald-400",
            borderColor: "hover:border-emerald-500/50",
          },
          {
            icon: Cpu,
            title: t.turbopackTitle,
            desc: t.turbopackDesc,
            color: "text-indigo-400",
            borderColor: "hover:border-indigo-500/50",
          },
          {
            icon: Code2,
            title: t.openSourceTitle,
            desc: t.openSourceDesc,
            color: "text-purple-400",
            borderColor: "hover:border-purple-500/50",
          },
          {
            icon: Globe,
            title: t.freeForeverTitle,
            desc: t.freeForeverDesc,
            color: "text-pink-400",
            borderColor: "hover:border-pink-500/50",
          },
        ].map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-purple-950/20 ${item.borderColor}`}
            >
              <ItemIcon className={`h-5 w-5 mb-1.5 ${item.color}`} />
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">{item.title}</span>
              <span className="text-[11px] text-[var(--hub-text-subtle)] mt-0.5">{item.desc}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
