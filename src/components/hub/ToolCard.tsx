"use client";

import Link from "next/link";
import { ArrowRight, Lock, Flame, CheckCircle2 } from "lucide-react";
import { type Tool, CATEGORY_LABELS } from "@/lib/tools-registry";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { t } = useLanguage();
  const Icon = tool.icon;
  const isLive = tool.status === "live";

  const cardInner = (
    <div
      className={`group relative flex h-full flex-col p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
        isLive
          ? "border-white/10 bg-white/[0.03] backdrop-blur-2xl hover:border-indigo-500/40 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1"
          : "border-white/5 bg-white/[0.015] backdrop-blur-md opacity-70"
      }`}
      data-cursor={isLive ? t.runTool : t.comingSoon}
    >
      {/* Top row */}
      <div className="mb-4 sm:mb-5 flex items-start justify-between">
        {/* Sleek Floating Liquid Glass Icon Badge */}
        <div
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-400/50 group-hover:shadow-indigo-500/20"
          style={{
            color: tool.accentColor,
          }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:rotate-3" strokeWidth={1.8} />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5">
          {tool.newBadge && isLive && (
            <span className="flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 backdrop-blur-md shadow-sm">
              <Flame className="h-2.5 w-2.5 text-amber-400" />
              {t.newBadge}
            </span>
          )}
          {isLive ? (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-2.5 w-2.5" />
              {t.readyBadge}
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-[var(--hub-text-subtle)]">
              <Lock className="h-2.5 w-2.5" />
              {t.developingBadge}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-2">
        <h3
          suppressHydrationWarning
          className="text-base sm:text-lg font-bold text-white leading-snug flex items-center gap-2 group-hover:text-indigo-300 transition-colors"
        >
          <span>{tool.title}</span>
        </h3>
      </div>

      {/* Description */}
      <p className="mb-5 flex-1 text-xs sm:text-sm leading-relaxed text-[var(--hub-text-muted)]">
        {tool.description}
      </p>

      {/* Category and action footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-auto">
        <span
          className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold"
          style={{
            color: tool.accentColor,
          }}
        >
          {CATEGORY_LABELS[tool.category]}
        </span>

        {isLive ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-all group-hover:translate-x-1">
            <span>{t.runTool}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        ) : (
          <span className="text-[11px] font-medium text-[var(--hub-text-subtle)]">
            {t.versionUpcoming}
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
