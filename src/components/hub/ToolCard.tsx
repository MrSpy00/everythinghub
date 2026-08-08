"use client";

import Link from "next/link";
import { ArrowRight, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { type Tool, CATEGORY_LABELS } from "@/lib/tools-registry";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;
  const isLive = tool.status === "live";

  const cardInner = (
    <div
      className={`group relative flex h-full flex-col p-6 rounded-2xl border transition-all duration-300 ${
        isLive
          ? "border-[var(--hub-border)] bg-[var(--hub-surface)]/90 backdrop-blur-xl hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1"
          : "border-[var(--hub-border)]/60 bg-[var(--hub-surface)]/40 backdrop-blur-md opacity-75"
      }`}
      data-cursor={isLive ? "Aç" : "Yakında"}
    >
      {/* Top row */}
      <div className="mb-5 flex items-start justify-between">
        {/* Icon with radial glow */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${tool.accentColor}25, ${tool.accentColor}08)`,
            border: `1px solid ${tool.accentColor}40`,
          }}
        >
          <Icon className="h-6 w-6" style={{ color: tool.accentColor }} />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5">
          {tool.newBadge && isLive && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
              Yeni
            </span>
          )}
          {isLive ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Hazır
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-[var(--hub-text-subtle)] ring-1 ring-white/10">
              <Lock className="h-2.5 w-2.5" />
              Geliştiriliyor
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-2">
        <h3
          suppressHydrationWarning
          className="text-lg font-bold text-white leading-tight flex items-center gap-2 group-hover:text-indigo-300 transition-colors"
        >
          <span>{tool.title}</span>
        </h3>
      </div>

      {/* Description */}
      <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--hub-text-muted)]">
        {tool.description}
      </p>

      {/* Category and action footer */}
      <div className="flex items-center justify-between border-t border-[var(--hub-border)]/60 pt-4 mt-auto">
        <span
          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
          style={{
            background: `${tool.accentColor}15`,
            color: tool.accentColor,
            border: `1px solid ${tool.accentColor}30`,
          }}
        >
          {CATEGORY_LABELS[tool.category]}
        </span>

        {isLive ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-all group-hover:translate-x-1">
            <span>Çalıştır</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        ) : (
          <span className="text-[11px] font-medium text-[var(--hub-text-subtle)]">
            v1.1 Sürümünde
          </span>
        )}
      </div>
    </div>
  );

  if (isLive) {
    return (
      <Link href={`/tools/${tool.slug}`} className="block h-full focus:outline-none">
        {cardInner}
      </Link>
    );
  }

  return <div className="h-full cursor-default">{cardInner}</div>;
}
