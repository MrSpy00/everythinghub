"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  Sparkles,
  Search,
  ShieldCheck,
  Cpu,
  Code2,
  Globe,
  PlaySquare,
} from "lucide-react";
import { getLiveTools } from "@/lib/tools-registry";
import { TextMorph } from "@/components/creative/TextMorph";
import { NeonBorder } from "@/components/creative/NeonBorder";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchVal, setSearchVal] = useState("");
  const liveCount = getLiveTools().length;

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    if (onSearch) onSearch(val);
  };

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-16 pb-20 text-center sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
      {/* Top Studio Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-xl shadow-lg shadow-indigo-500/10">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span>Studio v1.0 · {liveCount} Aktif Araç · Sınırsız & Ücretsiz</span>
      </div>

      {/* Main Kinetic Title with Originkit Gooey TextMorph */}
      <div className="mb-6 max-w-4xl w-full">
        <h1
          suppressHydrationWarning
          className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight"
        >
          Dijital Araçların{" "}
          <span className="block mt-3 h-[1.3em] flex items-center justify-center">
            <TextMorph
              words={[
                "HER ŞEYİN MERKEZİ",
                "YOUTUBE ANALİZİ",
                "HIZLI & GÜVENLİ",
                "MODERN STÜDYO",
                "GİZLİLİK ODAKLI",
              ]}
              color="#c084fc"
              transition={{ duration: 0.9, delay: 1.5, ease: "easeInOut" }}
            />
          </span>
        </h1>
      </div>

      {/* Subtitle */}
      <p className="mb-10 max-w-2xl text-base leading-relaxed text-[var(--hub-text-muted)] sm:text-lg">
        YouTube oynatma listesi analizi, geliştirici yardımcıları, görsel optimizasyonu ve tasarım araçları.
        Kayıt veya üyelik gerektirmeden, doğrudan tarayıcınızda ışık hızında çalışır.
      </p>

      {/* Hero Quick Search & Interactive Actions */}
      <div className="mb-12 w-full max-w-xl">
        <NeonBorder color="#8b5cf6" rounded={20} glow={60}>
          <div className="relative flex items-center rounded-[18px] bg-[var(--hub-surface)]/95 p-2 shadow-2xl backdrop-blur-2xl">
            <Search className="ml-3 h-5 w-5 text-indigo-400 shrink-0" />
            <input
              type="text"
              placeholder="Araç veya özellik ara (örn: youtube, playlist, json, gradient)..."
              value={searchVal}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-[var(--hub-text-subtle)] focus:outline-none"
              data-cursor="Ara"
            />
            {searchVal && (
              <button
                onClick={() => handleSearchChange("")}
                className="mr-2 text-xs text-[var(--hub-text-subtle)] hover:text-white px-2 py-1 rounded-md bg-white/5"
              >
                Temizle
              </button>
            )}
            <a
              href="#tools"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
              data-cursor="Keşfet"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Keşfet
            </a>
          </div>
        </NeonBorder>
      </div>

      {/* CTA Buttons */}
      <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/tools/yt-playlist-length"
          className="group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
          data-cursor="YouTube"
        >
          <PlaySquare className="h-4 w-4" />
          <span>YouTube Playlist Analyzer</span>
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase">
            Canlı
          </span>
        </Link>

        <a
          href="#tools"
          className="flex items-center gap-2 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/80 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
          data-cursor="Katalog"
        >
          <ArrowDown className="h-4 w-4 text-indigo-400" />
          <span>Tüm Araçları İncele</span>
        </a>
      </div>

      {/* Highlights Grid with Pure Vector SVGs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl w-full">
        {[
          {
            icon: ShieldCheck,
            title: "Sıfır Veri Saklama",
            desc: "Tamamen gizlilik odaklı",
            color: "text-emerald-400",
          },
          {
            icon: Cpu,
            title: "Turbopack Motoru",
            desc: "Ultra hızlı derleme",
            color: "text-indigo-400",
          },
          {
            icon: Code2,
            title: "Açık Kaynak Kod",
            desc: "GitHub üzerinde şeffaf",
            color: "text-purple-400",
          },
          {
            icon: Globe,
            title: "Sonsuz Ücretsiz",
            desc: "Login / Kredi kartı yok",
            color: "text-pink-400",
          },
        ].map((item, i) => {
          const ItemIcon = item.icon;
          return (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/60 backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:bg-[var(--hub-surface)]"
            >
              <ItemIcon className={`h-5 w-5 mb-2 ${item.color}`} />
              <span className="text-sm font-bold text-white">{item.title}</span>
              <span className="text-xs text-[var(--hub-text-subtle)] mt-0.5">{item.desc}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
