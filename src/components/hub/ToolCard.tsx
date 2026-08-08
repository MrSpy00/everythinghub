"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { type Tool, CATEGORY_LABELS } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  const Icon = tool.icon;
  const isLive = tool.status === "live";

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(
        "tool-card group relative flex h-full flex-col p-5",
        !isLive && "opacity-60"
      )}
      role={isLive ? "article" : "presentation"}
    >
      {/* Accent gradient bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl opacity-80"
        style={{ background: `linear-gradient(90deg, ${tool.accentColor}, transparent)` }}
      />

      {/* Top row */}
      <div className="mb-4 flex items-start justify-between">
        {/* Icon */}
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${tool.accentColor}20, ${tool.accentColor}10)`,
            border: `1px solid ${tool.accentColor}30`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: tool.accentColor }} />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5">
          {tool.newBadge && isLive && (
            <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 ring-1 ring-indigo-500/20">
              Yeni
            </span>
          )}
          {tool.status === "beta" && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 ring-1 ring-amber-500/20">
              Beta
            </span>
          )}
          {!isLive && (
            <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[var(--hub-text-subtle)] ring-1 ring-white/10">
              <Lock className="h-2.5 w-2.5" />
              Yakında
            </span>
          )}
        </div>
      </div>

      {/* Emoji */}
      {tool.emoji && (
        <div className="mb-2 text-2xl leading-none">{tool.emoji}</div>
      )}

      {/* Title */}
      <h3 className="mb-1.5 text-base font-semibold text-white leading-tight">
        {tool.title}
      </h3>

      {/* Description */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--hub-text-muted)]">
        {tool.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            background: `${tool.accentColor}10`,
            color: tool.accentColor,
          }}
        >
          {CATEGORY_LABELS[tool.category]}
        </span>

        {isLive && (
          <div className="flex items-center gap-1 text-xs font-medium text-[var(--hub-text-subtle)] transition-all group-hover:text-white group-hover:gap-2">
            Aç <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Shimmer effect on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(400px circle at 50% 50%, ${tool.accentColor}08, transparent 70%)`,
          }}
        />
      </div>
    </motion.div>
  );

  if (isLive) {
    return (
      <Link href={`/tools/${tool.slug}`} className="block h-full focus:outline-none">
        {cardContent}
      </Link>
    );
  }

  return <div className="h-full cursor-default">{cardContent}</div>;
}
