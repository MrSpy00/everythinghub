"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X, LayoutGrid, Rows3, Compass, Flame } from "lucide-react";
import Fuse from "fuse.js";
import { type Tool, type ToolCategory, tools, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/tools-registry";
import { ToolCard } from "./ToolCard";
import { InteractiveShowcase } from "@/components/creative/InteractiveShowcase";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const fuse = new Fuse(tools, {
  keys: ["title", "description", "tags", "category"],
  threshold: 0.4,
  includeScore: true,
});

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
  const { t } = useLanguage();

  const search = searchQuery !== undefined ? searchQuery : internalSearch;

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    if (onSearch) onSearch(val);
  };

  const categories = useMemo(() => {
    return [...new Set(tools.map((item) => item.category))];
  }, []);

  const filteredTools = useMemo(() => {
    let result: Tool[] = search
      ? fuse.search(search).map((r: { item: Tool }) => r.item)
      : tools;

    if (activeCategory !== ALL_CATEGORIES) {
      result = result.filter((item) => item.category === activeCategory);
    }

    return result;
  }, [search, activeCategory]);

  const liveCount = tools.filter((item) => item.status === "live").length;

  return (
    <section id="tools" className="py-16 sm:py-20 relative scroll-mt-24 sm:scroll-mt-28">
      <div className="mx-auto max-w-7xl 2xl:max-w-8xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Compass className="h-3.5 w-3.5" />
              </span>
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
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-500/30 border border-indigo-500/50 text-white shadow-md"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title={t.viewGrid}
                data-cursor={t.viewGrid}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.viewGrid}</span>
              </button>
              <button
                onClick={() => setViewMode("showcase")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "showcase"
                    ? "bg-indigo-500/30 border border-indigo-500/50 text-white shadow-md"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title={t.viewShowcase}
                data-cursor={t.viewShowcase}
              >
                <Flame className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.viewShowcase}</span>
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "compact"
                    ? "bg-indigo-500/30 border border-indigo-500/50 text-white shadow-md"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title={t.viewCompact}
                data-cursor={t.viewCompact}
              >
                <Rows3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.viewCompact}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap gap-2" id="categories">
          <button
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
            className={`relative rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeCategory === ALL_CATEGORIES
                ? "text-indigo-300 shadow-lg shadow-indigo-500/10"
                : "border border-white/10 bg-white/[0.03] text-[var(--hub-text-muted)] hover:border-white/20 hover:text-white"
            }`}
            data-cursor="Kategori"
          >
            {activeCategory === ALL_CATEGORIES && (
              <motion.div
                layoutId="activeCategoryTab"
                className="absolute inset-0 rounded-xl bg-indigo-500/20 border border-indigo-500/40"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{t.all} ({tools.length})</span>
          </button>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const catCount = tools.filter((item) => item.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "text-indigo-300 shadow-lg shadow-indigo-500/10"
                    : "border border-white/10 bg-white/[0.03] text-[var(--hub-text-muted)] hover:border-white/20 hover:text-white"
                }`}
                data-cursor={CATEGORY_LABELS[cat]}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    className="absolute inset-0 rounded-xl bg-indigo-500/20 border border-indigo-500/40"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">{CATEGORY_LABELS[cat]}</span>
                <span className="relative z-10 text-[10px] opacity-70">({catCount})</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase View Mode */}
        {viewMode === "showcase" && (
          <div className="mb-10">
            <InteractiveShowcase />
          </div>
        )}

        {/* Grid View Mode */}
        {viewMode === "grid" && (
          <div>
            {filteredTools.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/50">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {t.noToolsFoundTitle}
                </h3>
                <p className="text-sm text-[var(--hub-text-muted)] max-w-sm">
                  &quot;{search}&quot; {t.noToolsFoundDesc}
                </p>
                <button
                  onClick={() => {
                    handleSearchChange("");
                    setActiveCategory(ALL_CATEGORIES);
                  }}
                  className="mt-6 rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-5 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/25 transition-all"
                >
                  {t.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Compact List Mode */}
        {viewMode === "compact" && (
          <div className="rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface)]/90 backdrop-blur-xl overflow-hidden divide-y divide-[var(--hub-border)]">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isLive = tool.status === "live";
              return (
                <div
                  key={tool.slug}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `${tool.accentColor}18`,
                        border: `1px solid ${tool.accentColor}30`,
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: tool.accentColor }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {tool.title}
                        </span>
                        {isLive ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                            {t.activeCountLabel}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--hub-text-subtle)] bg-white/5 px-2 py-0.5 rounded-md">
                            {t.comingSoon}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--hub-text-muted)] truncate max-w-md mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isLive ? (
                      <a
                        href={`/tools/${tool.slug}`}
                        className="rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 px-4 py-2 text-xs font-bold text-indigo-300 border border-indigo-500/30 transition-all inline-block"
                        data-cursor="Aç"
                      >
                        {t.runTool} →
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--hub-text-subtle)] px-3 py-1.5">
                        {t.developingBadge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
