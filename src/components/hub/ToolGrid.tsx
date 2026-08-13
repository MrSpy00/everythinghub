"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  X,
  LayoutGrid,
  Rows3,
  Compass,
  Flame,
  ArrowUpDown,
  Star,
  Sparkles,
  Check,
  ChevronDown,
  SortAsc,
  ArrowRight,
} from "lucide-react";
import { type Tool, type ToolCategory, tools, CATEGORY_ICONS } from "@/lib/tools-registry";
import { ToolCard } from "./ToolCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { rankTools, type SortOption } from "@/lib/user-analytics";

const InteractiveShowcase = dynamic(
  () =>
    import("@/components/creative/InteractiveShowcase").then(
      (m) => m.InteractiveShowcase
    ),
  {
    ssr: false,
    loading: () => (
      <div className="py-20 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    ),
  }
);

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
  const [sortMode, setSortMode] = useState<SortOption>("recommended");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [analyticsVersion, setAnalyticsVersion] = useState(0);
  const { t, lang } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const search = searchQuery !== undefined ? searchQuery : internalSearch;

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    if (onSearch) onSearch(val);
  };

  // Restore saved viewMode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("everythinghub_view_mode_v1") as ViewMode;
      if (savedMode === "grid" || savedMode === "showcase" || savedMode === "compact") {
        setViewMode(savedMode);
      }
    }
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("everythinghub_view_mode_v1", mode);
    }
  };

  useEffect(() => {
    const onAnalyticsUpdate = () => setAnalyticsVersion((v) => v + 1);
    window.addEventListener("hub-tool-analytics-updated", onAnalyticsUpdate);
    return () => window.removeEventListener("hub-tool-analytics-updated", onAnalyticsUpdate);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      case "game":
        return t.gameCategory;
      default:
        return t.all;
    }
  };

  const sortOptionsConfig = useMemo(
    () => [
      {
        id: "recommended" as SortOption,
        label: lang === "en" ? "Recommended (Smart)" : "Önerilen (Akıllı)",
        icon: Sparkles,
        iconColor: "text-indigo-400",
      },
      {
        id: "favorites" as SortOption,
        label: lang === "en" ? "My Favorites" : "Favorilerim",
        icon: Star,
        iconColor: "text-amber-400",
      },
      {
        id: "popular" as SortOption,
        label: lang === "en" ? "Most Popular" : "En Popüler",
        icon: Flame,
        iconColor: "text-rose-400",
      },
      {
        id: "newest" as SortOption,
        label: lang === "en" ? "Newly Released" : "Yeni Eklenenler",
        icon: Sparkles,
        iconColor: "text-emerald-400",
      },
      {
        id: "alphabetical" as SortOption,
        label: lang === "en" ? "Alphabetical (A-Z)" : "Alfabetik (A-Z)",
        icon: SortAsc,
        iconColor: "text-sky-400",
      },
    ],
    [lang]
  );

  const currentSortConfig = useMemo(
    () => sortOptionsConfig.find((o) => o.id === sortMode) || sortOptionsConfig[0],
    [sortMode, sortOptionsConfig]
  );

  // Dynamically ranked tools across All categories and Category subviews
  const filteredTools = useMemo(() => {
    let base = rankTools(tools, sortMode);
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
  }, [search, activeCategory, sortMode, analyticsVersion]);

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

            {/* Mobile & Responsive Line Wrap Protection */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h2 suppressHydrationWarning className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                {t.allToolsTitle}
              </h2>
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] sm:text-xs font-bold text-emerald-400 border border-emerald-500/30 whitespace-nowrap shrink-0 shadow-sm">
                {liveCount} {t.activeCountLabel} · {tools.length} Total
              </span>
            </div>
            
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--hub-text-muted)] max-w-2xl text-balance leading-relaxed">
              {t.searchFilterDesc}
            </p>
          </div>

          {/* Controls: Search + Studio Custom Sort Dropdown + View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input with Vector Magnifier */}
            <div className="relative w-full sm:w-60">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center text-indigo-400 pointer-events-none">
                <Search className="h-4 w-4 text-indigo-400" />
              </div>
              <input
                type="text"
                placeholder={t.filterPlaceholder}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-white placeholder:text-[var(--hub-text-subtle)] backdrop-blur-xl transition-all focus:border-indigo-500/60 focus:bg-white/[0.08] focus:outline-none"
                data-cursor={lang === "en" ? "Search Tools" : "Araçlarda Ara"}
              />
              {search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-zinc-400 hover:text-white"
                  aria-label={t.clear}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Custom Studio Floating Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center justify-between gap-2.5 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-2xl transition-all hover:border-indigo-500/50 hover:bg-white/[0.08] shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                data-cursor={lang === "en" ? "Sort Option" : "Sıralama Seçeneği"}
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <currentSortConfig.icon className={`h-3.5 w-3.5 ${currentSortConfig.iconColor} shrink-0`} />
                  <span className="truncate">{currentSortConfig.label}</span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${sortDropdownOpen ? "rotate-180 text-white" : ""}`} />
              </button>

              {/* Floating Menu Popover */}
              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-1.5 w-56 z-50 rounded-2xl border border-white/15 bg-[#0e1017]/95 p-1.5 backdrop-blur-3xl shadow-2xl shadow-black/80"
                  >
                    <div className="flex flex-col gap-0.5">
                      {sortOptionsConfig.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = opt.id === sortMode;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSortMode(opt.id);
                              setSortDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
                                : "text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`h-3.5 w-3.5 ${opt.iconColor}`} />
                              <span>{opt.label}</span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl shrink-0 self-end sm:self-auto">
              <button
                onClick={() => handleViewModeChange("grid")}
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
                onClick={() => handleViewModeChange("showcase")}
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
                onClick={() => handleViewModeChange("compact")}
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

        {/* Category Pills Container */}
        <div className="mb-8 sm:mb-10 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max pb-2 sm:pb-0 sm:flex-wrap">
            <button
              onClick={() => setActiveCategory(ALL_CATEGORIES)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
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
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
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
        </div>

        {/* View Mode Rendering */}
        {viewMode === "showcase" ? (
          <InteractiveShowcase />
        ) : viewMode === "compact" ? (
          <div className="flex flex-col gap-3 w-full">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              const localized = t.toolTranslations?.[tool.slug] || {
                title: tool.title,
                description: tool.description,
              };
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-2xl transition-all duration-300 hover:border-indigo-500/50 hover:bg-white/[0.07] hover:shadow-xl shadow-black/40"
                  data-cursor={localized.title}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-md transition-transform group-hover:scale-105"
                      style={{ color: tool.accentColor }}
                    >
                      <Icon className="h-5.5 w-5.5" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {localized.title}
                        </h4>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--hub-text-muted)] truncate max-w-2xl">
                        {localized.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg">
                      {t.readyBadge}
                    </span>
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-bold text-white group-hover:border-indigo-500/50 group-hover:bg-indigo-500/20 group-hover:text-indigo-200 transition-all">
                      <span>{t.runTool}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div id="tool-cards-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 scroll-mt-20">
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
