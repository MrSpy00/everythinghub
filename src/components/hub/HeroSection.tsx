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
      const targetElem =
        document.getElementById("tool-cards-grid") ||
        document.getElementById("tools-grid") ||
        document.getElementById("tools");
      if (targetElem) {
        const headerOffset = window.innerWidth < 640 ? 65 : 85;
        const elementPosition = targetElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-4.25rem)] px-4 py-2 sm:py-10 lg:py-16 text-center max-w-7xl 2xl:max-w-8xl mx-auto w-full pb-2 sm:pb-12">
      {/* Top Studio Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-3 sm:mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-2xl shadow-xl hover:border-indigo-500/40 transition-colors"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="tracking-wide">
          Studio v1.0 · {liveCount} {t.activeCountLabel} {t.tools} · {t.freeForeverTitle}
        </span>
      </motion.div>

      {/* Main Studio Interactive Mesh Title */}
      <div className="mb-2 max-w-4xl 2xl:max-w-5xl w-full flex flex-col items-center">
        {/* Interactive WebGL Mesh Brand Title */}
        <div className="w-full max-w-2xl px-2 my-1 cursor-pointer" title="Hover / Move Cursor to Distort Mesh">
          {/* SR-only h1 for SEO and accessibility */}
          <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>EverythingHub — Ücretsiz Dijital Araçlar Stüdyosu</h1>
          <MeshText
            text="EVERYTHINGHUB"
            fontSize={54}
            fontWeight={900}
            fontFamily="Outfit"
            color="#ffffff"
            customColors={["#f43f5e", "#06b6d4", "#a855f7", "#10b981"]}
            force={28}
            className="w-full"
          />
        </div>

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
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.08] border border-white/20 text-white backdrop-blur-3xl hover:border-indigo-400/80 hover:bg-white/15 px-4 py-2 text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] active:scale-95"
            >
              <Compass className="h-4 w-4 text-indigo-300" />
              <span>{t.explore}</span>
            </button>
          </div>
        </NeonBorder>
      </div>

      {/* Hero Action Button (Centered Liquid Glassmorphism) */}
      <div className="mb-8 sm:mb-10 flex items-center justify-center">
        <button
          type="button"
          onClick={scrollToTools}
          className="group relative inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/[0.06] px-8 py-4 text-xs sm:text-sm font-black text-white backdrop-blur-3xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-indigo-400/80 hover:shadow-[0_0_35px_rgba(99,102,241,0.45)] cursor-pointer overflow-hidden"
          data-cursor={t.inspectAllTools}
        >
          {/* Specular Highlight Refraction Line */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <Layers className="h-4.5 w-4.5 text-indigo-300 transition-transform group-hover:scale-110" />
          <span>{t.inspectAllTools}</span>
          <span className="ml-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-0.5 text-[10px] font-extrabold uppercase font-mono shadow-inner">
            {liveCount} {t.tools}
          </span>
        </button>
      </div>

      {/* 4 Feature Highlights Grid with FluidSlimeCard (Desktop & Tablet) */}
      <div className="hidden sm:grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl 2xl:max-w-5xl w-full mt-4">
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
              className="p-3.5 sm:p-4 text-center cursor-default"
            >
              <div className="flex flex-col items-center justify-center text-center w-full space-y-1">
                <ItemIcon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 mb-1 ${item.color}`} />
                <span className="text-xs sm:text-sm font-bold text-white leading-snug block">{item.title}</span>
                <span className="text-[10px] sm:text-[11px] text-[var(--hub-text-subtle)] block leading-tight">{item.desc}</span>
              </div>
            </FluidSlimeCard>
          );
        })}
      </div>
    </section>
  );
}
