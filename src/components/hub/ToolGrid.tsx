"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, LayoutGrid, Rows3, Compass, Flame } from "lucide-react";
import { type Tool, type ToolCategory, tools, CATEGORY_ICONS } from "@/lib/tools-registry";
import { ToolCard } from "./ToolCard";
import { InteractiveShowcase } from "@/components/creative/InteractiveShowcase";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { rankTools } from "@/lib/user-analytics";

const ALL_CATEGORIES = "all";

type ViewMode = "grid" | "showcase" | "compact";

interface ToolGridProps {
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export function ToolGrid({ searchQuery = "", onSearch }: ToolGridProps) {
  const [internalSearch, setInternalSearch] = useState(searchQuery);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | typeof ALL_CATEGORIES>(ALL_CATEGORIES);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [analyticsVersion, setAnalyticsVersion] = useState(0);
  const { t } = useLanguage();

  const search = searchQuery !== undefined ? searchQuery : internalSearch;

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    if (onSearch) onSearch(val);
  };

  useEffect(() => {
    const onAnalyticsUpdate = () => setAnalyticsVersion((v) => v + 1);
    window.addEventListener("hub-tool-analytics-updated", onAnalyticsUpdate);
    return () => window.removeEventListener("hub-tool-analytics-updated", onAnalyticsUpdate);
  }, []);

  const categories = useMemo(() => {
    return [...new Set(tools.map((item) => item.category))];
  }, []);

  const getCategoryLabel = (cat: ToolCategory | typeof ALL_CATEGORIES) => {
    switch (cat) {
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
        return t.all;
    }
  };

  // Dynamically ranked tools across All categories and Category subviews
  const filteredTools = useMemo(() => {
    let base = rankTools(tools);
    const q = search.trim().toLowerCase();

    if (q) {
      base = base.filter((tool) => {
        const titleMatch = tool.title.toLowerCase().includes(q);
        const descMatch = tool.description.toLowerCase().includes(q);
        const slugMatch = tool.slug.toLowerCase().includes(q);
        const tagMatch = tool.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        return titleMatch || descMatch || slugMatch || tagMatch;
      });
    }

    if (activeCategory !== ALL_CATEGORIES) {
      base = base.filter((item) => item.category === activeCategory);
    }

    return base;
  }, [search, activeCategory, analyticsVersion]);

  const liveCount = tools.filter((item) => item.status === "live").length;

  return (
    <section id="tools" className="py-16 sm:py-20 relative scroll-mt-24 sm:scroll-mt-28">
      <div className="mx-auto max-w-7xl 2xl:max-w-8xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {t.toolHubHeader}
              </span>
            </div>
            <h2 suppressHydrationWarning className="text-2xl font-black text-white sm:text-3xl">
              {t.allToolsTitle}
              <span className="ml-3 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                {liveCount} {t.activeCountLabel} · {tools.length} Total
              </span>
            </h2>
            <p className="mt-1 text-sm text-[var(--hub-text-muted)]">
              {t.searchFilterDesc}
            </p>
          </div>

          {/* Controls: Search + View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={t.filterPlaceholder}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-[var(--hub-text-subtle)] backdrop-blur-xl transition-all focus:border-indigo-500/50 focus:bg-white/[0.07] focus:outline-none"
                data-cursor="Filtrele"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  aria-label={t.clear}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title={t.viewGrid}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.viewGrid}</span>
              </button>
              <button
                onClick={() => setViewMode("showcase")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "showcase"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title={t.viewShowcase}
              >
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.viewShowcase}</span>
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "compact"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title={t.viewCompact}
              >
                <Rows3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.viewCompact}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeCategory === ALL_CATEGORIES
                ? "bg-white text-zinc-950 shadow-lg shadow-white/10"
                : "border border-white/10 bg-white/[0.04] text-[var(--hub-text-muted)] hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {t.all} ({tools.length})
          </button>
          {categories.map((cat) => {
            const count = tools.filter((t) => t.category === cat).length;
            const Icon = CATEGORY_ICONS[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/50"
                    : "border border-white/10 bg-white/[0.04] text-[var(--hub-text-muted)] hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{getCategoryLabel(cat)}</span>
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Rendering */}
        {viewMode === "showcase" ? (
          <InteractiveShowcase />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        )}

        {filteredTools.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Search className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-white">{t.noToolsFoundTitle}</h3>
            <p className="mt-1 text-sm text-[var(--hub-text-muted)]">
              &quot;{search}&quot; {t.noToolsFoundDesc}
            </p>
            <button
              onClick={() => {
                handleSearchChange("");
                setActiveCategory(ALL_CATEGORIES);
              }}
              className="mt-6 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10"
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
