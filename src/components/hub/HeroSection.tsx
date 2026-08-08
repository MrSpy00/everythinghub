"use client";

import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { getLiveTools, tools } from "@/lib/tools-registry";

export function HeroSection() {
  const liveCount = getLiveTools().length;
  const totalCount = tools.length;

  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-20 text-center sm:py-28 lg:py-36">
      {/* Top badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 flex items-center gap-2"
      >
        <span className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          {liveCount} araç aktif · Login gerektirmez
        </span>
      </motion.div>

      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-4 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl"
      >
        Her Şeyin{" "}
        <span className="gradient-text">Merkezi</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mb-8 max-w-2xl text-lg leading-relaxed text-[var(--hub-text-muted)] sm:text-xl"
      >
        YouTube araçları, görsel araçları, geliştirici araçları ve daha fazlası.
        Tüm araçlar{" "}
        <span className="text-white">ücretsiz</span> ve{" "}
        <span className="text-white">tek bir yerde</span>.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-16 flex flex-wrap items-center justify-center gap-3"
      >
        <a
          href="#tools"
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
        >
          <Sparkles className="h-4 w-4" />
          Araçları Keşfet
          <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
        </a>
        <a
          href="/tools/yt-playlist-length"
          className="flex items-center gap-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/5"
        >
          <span className="text-base">🎬</span>
          YT Playlist Analizi
        </a>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="flex flex-wrap items-center justify-center gap-8"
      >
        {[
          { value: `${liveCount}`, label: "Aktif Araç" },
          { value: `${totalCount}+`, label: "Yakında" },
          { value: "0", label: "Login Gereken" },
          { value: "∞", label: "Ücretsiz Kullanım" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-xs text-[var(--hub-text-subtle)]">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Decorative grid lines */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </section>
  );
}
