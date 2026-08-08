"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Flame, CheckCircle2, Star } from "lucide-react";
import { type Tool } from "@/lib/tools-registry";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackToolUsage, isFavorite, toggleFavorite } from "@/lib/user-analytics";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const { t, lang } = useLanguage();
  const Icon = tool.icon;
  const isLive = tool.status === "live";
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    setStarred(isFavorite(tool.slug));
    const onAnalyticsUpdate = () => setStarred(isFavorite(tool.slug));
    window.addEventListener("hub-tool-analytics-updated", onAnalyticsUpdate);
    return () => window.removeEventListener("hub-tool-analytics-updated", onAnalyticsUpdate);
  }, [tool.slug]);

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleFavorite(tool.slug);
    setStarred(updated);
  };

  // Dynamic localized tool title and description
  const localized = t.toolTranslations?.[tool.slug] || {
    title: tool.title,
    description: tool.description,
  };

  // Category translation
  const categoryName = (() => {
    switch (tool.category) {
      case "video":
        return t.videoCategory;
      case "audio":
        return t.audioCategory;
      case "image":
        return t.imageCategory;
      case "developer":
        return t.developerCategory;
      case "text":
        return t.textCategory;
      case "calculator":
        return t.calcCategory;
      case "design":
        return t.designCategory;
      default:
        return tool.category;
    }
  })();

  const getCategoryBadgeClass = () => {
    switch (tool.category) {
      case "developer":
        return "border-indigo-400/30 bg-indigo-500/15 text-indigo-300";
      case "audio":
        return "border-emerald-400/30 bg-emerald-500/15 text-emerald-300";
      case "video":
        return "border-rose-400/30 bg-rose-500/15 text-rose-300";
      case "image":
        return "border-violet-400/30 bg-violet-500/15 text-violet-300";
      case "text":
        return "border-purple-400/30 bg-purple-500/15 text-purple-300";
      case "calculator":
        return "border-sky-400/30 bg-sky-500/15 text-sky-300";
      default:
        return "border-amber-400/30 bg-amber-500/15 text-amber-300";
    }
  };

  const cardInner = (
    <div
      className={`group relative flex h-full flex-col p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
        isLive
          ? "border-white/10 bg-white/[0.03] backdrop-blur-2xl hover:border-indigo-500/50 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1"
          : "border-white/5 bg-white/[0.015] backdrop-blur-md opacity-70"
      }`}
      data-cursor={isLive ? t.runTool : t.comingSoon}
    >
      {/* Favorite Star Button */}
      <button
        onClick={handleStarClick}
        title={starred ? (lang === "en" ? "Remove from Favorites" : "Favorilerden Çıkar") : (lang === "en" ? "Add to Favorites" : "Favorilere Ekle")}
        aria-label="Favori"
        className={`absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
          starred
            ? "border-amber-400/60 bg-amber-500/20 text-amber-400 shadow-md shadow-amber-500/20 scale-105"
            : "border-white/10 bg-white/[0.04] text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
        }`}
        data-cursor={starred ? (lang === "en" ? "Remove Fav" : "Favori Çıkar") : (lang === "en" ? "Add Fav" : "Favori Ekle")}
      >
        <Star className={`h-4 w-4 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />
      </button>

      {/* Top row */}
      <div className="mb-4 sm:mb-5 flex items-start justify-between pr-8">
        {/* Vector Icon Container */}
        <div
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.1] to-transparent backdrop-blur-2xl shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-400/60 group-hover:shadow-indigo-500/25"
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
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400">
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
          <span>{localized.title}</span>
        </h3>
      </div>

      {/* Description */}
      <p className="mb-5 flex-1 text-xs sm:text-sm leading-relaxed text-zinc-400">
        {localized.description}
      </p>

      {/* Category and action footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-auto">
        <span
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${getCategoryBadgeClass()}`}
        >
          {categoryName}
        </span>

        {isLive ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-all group-hover:translate-x-1">
            <span>{t.runTool}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        ) : (
          <span className="text-[11px] font-medium text-zinc-400">
            {t.versionUpcoming}
          </span>
        )}
      </div>
    </div>
  );

  if (isLive) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        onClick={() => trackToolUsage(tool.slug)}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl [content-visibility:auto] [contain-intrinsic-size:1px_185px]"
      >
        {cardInner}
      </Link>
    );
  }

  return <div className="h-full cursor-default [content-visibility:auto] [contain-intrinsic-size:1px_185px]">{cardInner}</div>;
}
