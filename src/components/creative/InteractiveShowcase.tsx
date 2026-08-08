"use client";

import React, { useRef, useState, useMemo } from "react";
import { motion, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Lock } from "lucide-react";
import { tools } from "@/lib/tools-registry";

export function InteractiveShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const displayTools = useMemo(() => {
    return [...tools, ...tools, ...tools];
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-6 select-none cursor-grab active:cursor-grabbing"
      data-cursor="Kaydır"
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--hub-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--hub-bg)] to-transparent z-10 pointer-events-none" />

      <motion.div
        drag="x"
        dragConstraints={{ left: -1200, right: 0 }}
        dragElastic={0.1}
        dragMomentum={true}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{ x }}
        className="flex gap-5 px-4"
      >
        {displayTools.map((tool, idx) => {
          const Icon = tool.icon;
          const isLive = tool.status === "live";

          return (
            <motion.div
              key={`${tool.slug}-${idx}`}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative w-[280px] sm:w-[320px] shrink-0 rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/90 backdrop-blur-xl p-5 shadow-xl transition-colors hover:border-indigo-500/50"
              style={{
                boxShadow: isLive
                  ? "0 8px 32px rgba(99, 102, 241, 0.12)"
                  : "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              {/* Accent Line */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, ${tool.accentColor}, transparent)`,
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background: `${tool.accentColor}18`,
                    border: `1px solid ${tool.accentColor}35`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: tool.accentColor }} />
                </div>

                <div className="flex items-center gap-1.5">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-[var(--hub-text-subtle)] ring-1 ring-white/10">
                      <Lock className="h-3 w-3" />
                      Yakında
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="mb-4">
                <h4 className="text-base font-bold text-white mb-1">
                  {tool.title}
                </h4>
                <p className="text-xs text-[var(--hub-text-muted)] line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {tool.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-[var(--hub-text-subtle)] border border-white/[0.06]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              {isLive ? (
                <Link
                  href={`/tools/${tool.slug}`}
                  className="flex items-center justify-between w-full rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 px-3 py-2 text-xs font-semibold text-indigo-300 transition-all border border-indigo-500/30"
                  onClick={(e) => {
                    if (isDragging) e.preventDefault();
                  }}
                  data-cursor="Başlat"
                >
                  <span>Aracı Çalıştır</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <div className="flex items-center justify-between w-full rounded-xl bg-white/[0.02] px-3 py-2 text-xs font-medium text-[var(--hub-text-subtle)] border border-white/[0.04]">
                  <span>Geliştirilme Aşamasında</span>
                  <Sparkles className="h-3.5 w-3.5 opacity-50" />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
