"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import { MeshText } from "@/components/creative/MeshText";

const TOOL_TITLES = [
  { text: "HER ŞEYİN MERKEZİ", style: "gradient" },
  { text: "YOUTUBE PLAYLIST ANALYZER", style: "stroke" },
  { text: "GÖRSEL SIKIŞTIRICI", style: "emerald" },
  { text: "JSON FORMATTER & VALIDATOR", style: "cyan" },
  { text: "RENK PALETİ ÇIKARICI", style: "pink" },
  { text: "BASE64 KODLAYICI", style: "amber" },
  { text: "İNTERAKTİF REGEX TESTER", style: "indigo" },
  { text: "ÇOKLU BİRİM DÖNÜŞTÜRÜCÜ", style: "violet" },
  { text: "METİN KASA DÖNÜŞTÜRÜCÜ", style: "gradient" },
  { text: "YÜZDE & İNDİRİM HESAPLAYICI", style: "emerald" },
];

interface HeroSectionProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export function HeroSection({ searchQuery, onSearch }: HeroSectionProps) {
  const liveCount = getLiveTools().length;
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % TOOL_TITLES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (val: string) => {
    onSearch(val);
    if (val.trim() && typeof window !== "undefined") {
      const toolsElem = document.getElementById("tools");
      if (toolsElem) {
        toolsElem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const currentTitle = TOOL_TITLES[titleIndex];

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-8 pb-12 text-center sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20 max-w-7xl mx-auto w-full">
      {/* Top Studio Badge */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300 backdrop-blur-xl shadow-lg shadow-purple-950/20">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>Studio v1.0 · {liveCount} Aktif Araç · Sınırsız & Ücretsiz</span>
      </div>

      {/* Main Studio Title */}
      <div className="mb-4 max-w-4xl w-full flex flex-col items-center">
        <h1
          suppressHydrationWarning
          className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight"
        >
          Dijital Araçların Stüdyosu
        </h1>

        {/* Dynamic Shuffled Kinetic Tool Titles with Diverse Typographic Effects */}
        <div className="mt-2 h-14 sm:h-16 flex items-center justify-center overflow-hidden w-full">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentTitle.text}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`text-xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide ${
                currentTitle.style === "stroke"
                  ? "text-transparent [-webkit-text-stroke:1.5px_rgba(192,132,252,0.9)] drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  : currentTitle.style === "emerald"
                  ? "text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : currentTitle.style === "cyan"
                  ? "text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                  : currentTitle.style === "pink"
                  ? "text-pink-300 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                  : currentTitle.style === "amber"
                  ? "text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  : "bg-gradient-to-r from-purple-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              }`}
            >
              {currentTitle.text}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Subtitle */}
      <p className="mb-8 max-w-2xl text-xs sm:text-sm lg:text-base leading-relaxed text-[var(--hub-text-muted)]">
        YouTube oynatma listesi canlı süresi, görsel sıkıştırma, format dönüştürme, JSON validator, renk paleti ve geliştirici araçları. Kayıt gerektirmez, %100 tarayıcı taraflı çalışır.
      </p>

      {/* Hero Quick Search Bar - Sleek Liquid Glass */}
      <div className="mb-10 w-full max-w-xl">
        <NeonBorder color="#a855f7" rounded={20} glow={50}>
          <div className="relative flex items-center rounded-[18px] border border-purple-500/30 bg-[#0c0e17]/95 p-2 backdrop-blur-3xl shadow-2xl focus-within:border-purple-400/80 focus-within:shadow-[0_0_25px_rgba(168,85,247,0.25)] transition-all">
            <Search className="ml-3.5 h-5 w-5 text-purple-400 shrink-0" />
            <input
              type="text"
              placeholder="Araç veya özellik ara (örn: youtube, playlist, json, gradient)..."
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-[var(--hub-text-subtle)] border-none outline-none focus:outline-none focus:ring-0"
              data-cursor="Ara"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleInputChange("")}
                className="mr-2 flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                <span>Temizle</span>
              </button>
            )}
            <a
              href="#tools"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl transition-all hover:scale-105 hover:bg-purple-500/30 hover:border-purple-400 shrink-0"
              data-cursor="Keşfet"
            >
              <Compass className="h-4 w-4 text-purple-300" />
              <span>Keşfet</span>
            </a>
          </div>
        </NeonBorder>
      </div>

      {/* Hero CTA Buttons */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/tools/yt-playlist-length"
          className="group flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/[0.06] px-7 py-3.5 text-sm font-bold text-white backdrop-blur-2xl shadow-2xl shadow-purple-950/30 transition-all hover:scale-105 hover:bg-white/[0.12] hover:border-purple-400/80"
          data-cursor="YouTube"
        >
          <PlaySquare className="h-4 w-4 text-purple-400" />
          <span>YouTube Playlist Analyzer</span>
          <span className="ml-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
            Canlı
          </span>
        </Link>

        <a
          href="#tools"
          className="flex items-center gap-2 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
          data-cursor="Katalog"
        >
          <ArrowDown className="h-4 w-4 text-purple-400" />
          <span>Tüm Araçları İncele</span>
        </a>
      </div>

      {/* 4 Feature Highlights Grid - Liquid Glass Hover Elevation */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl w-full">
        {[
          {
            icon: ShieldCheck,
            title: "Sıfır Veri Saklama",
            desc: "Tamamen gizlilik odaklı",
            color: "text-emerald-400",
            borderColor: "hover:border-emerald-500/50",
          },
          {
            icon: Cpu,
            title: "Turbopack Motoru",
            desc: "Ultra hızlı derleme",
            color: "text-indigo-400",
            borderColor: "hover:border-indigo-500/50",
          },
          {
            icon: Code2,
            title: "Açık Kaynak Kod",
            desc: "GitHub üzerinde şeffaf",
            color: "text-purple-400",
            borderColor: "hover:border-purple-500/50",
          },
          {
            icon: Globe,
            title: "Sonsuz Ücretsiz",
            desc: "Login / Kredi kartı yok",
            color: "text-pink-400",
            borderColor: "hover:border-pink-500/50",
          },
        ].map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-purple-950/20 ${item.borderColor}`}
            >
              <ItemIcon className={`h-6 w-6 mb-2 ${item.color}`} />
              <span className="text-sm font-bold text-white leading-snug">{item.title}</span>
              <span className="text-xs text-[var(--hub-text-subtle)] mt-1">{item.desc}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
