"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { tools } from "@/lib/tools-registry";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function InteractiveShowcase() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragLimit, setDragLimit] = useState(-3000);

  useEffect(() => {
    const updateLimit = () => {
      if (carouselRef.current && containerRef.current) {
        const scrollW = carouselRef.current.scrollWidth;
        const clientW = containerRef.current.clientWidth;
        setDragLimit(-Math.max(0, scrollW - clientW + 32));
      }
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  // Non-passive wheel event listener to convert vertical mouse wheel scroll into horizontal movement and prevent outer page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      // Intercept wheel event and stop outer page vertical scroll
      e.preventDefault();
      e.stopPropagation();

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const currentX = x.get();
      const newX = Math.max(dragLimit, Math.min(0, currentX - delta * 0.9));
      x.set(newX);
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", handleWheelNative);
  }, [dragLimit, x]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-6 select-none cursor-grab active:cursor-grabbing"
      data-cursor="Kaydır"
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

      <motion.div
        ref={carouselRef}
        drag="x"
        dragConstraints={{ left: dragLimit, right: 0 }}
        dragElastic={0.08}
        dragMomentum={true}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{ x }}
        className="flex gap-5 px-4"
      >
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          const isLive = tool.status === "live";
          const localized = t.toolTranslations?.[tool.slug] || {
            title: tool.title,
            description: tool.description,
          };

          return (
            <motion.div
              key={`${tool.slug}-${idx}`}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative w-[280px] sm:w-[320px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-5 shadow-xl transition-colors hover:border-indigo-500/50"
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
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-2xl"
                  style={{
                    color: tool.accentColor,
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>

                <div className="flex items-center gap-1.5">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      {t.readyBadge}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-[var(--hub-text-subtle)] border border-white/10">
                      <Lock className="h-3 w-3" />
                      {t.comingSoon}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="mb-4">
                <h4 className="text-base font-bold text-white mb-1">
                  {localized.title}
                </h4>
                <p className="text-xs text-[var(--hub-text-muted)] line-clamp-2 leading-relaxed">
                  {localized.description}
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
                  className="flex items-center justify-between w-full rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:text-white transition-all border border-indigo-500/30 hover:border-indigo-400/80 shadow-md"
                  onClick={(e) => {
                    if (isDragging) e.preventDefault();
                  }}
                  data-cursor={localized.title}
                >
                  <span>{t.runTool}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <div className="flex items-center justify-between w-full rounded-xl bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-[var(--hub-text-subtle)] border border-white/[0.04]">
                  <span>{t.versionUpcoming}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
