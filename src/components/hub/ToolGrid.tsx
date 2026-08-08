"use client";

import { useState, useMemo } from "react";
import { Search, X, LayoutGrid, Rows3, Sparkles } from "lucide-react";
import Fuse from "fuse.js";
import { type Tool, type ToolCategory, tools, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/tools-registry";
import { ToolCard } from "./ToolCard";
import { InteractiveShowcase } from "@/components/creative/InteractiveShowcase";

const fuse = new Fuse(tools, {
  keys: ["title", "description", "tags", "category"],
  threshold: 0.4,
  includeScore: true,
});

const ALL_CATEGORIES = "all";

type ViewMode = "grid" | "showcase" | "compact";

interface ToolGridProps {
  initialSearch?: string;
}

export function ToolGrid({ initialSearch = "" }: ToolGridProps) {
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | typeof ALL_CATEGORIES>(ALL_CATEGORIES);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const categories = useMemo(() => {
    return [...new Set(tools.map((t) => t.category))];
  }, []);

  const filteredTools = useMemo(() => {
    let result: Tool[] = search
      ? fuse.search(search).map((r) => r.item)
      : tools;

    if (activeCategory !== ALL_CATEGORIES) {
      result = result.filter((t) => t.category === activeCategory);
    }

    return result;
  }, [search, activeCategory]);

  const liveCount = tools.filter((t) => t.status === "live").length;

  return (
    <section id="tools" className="py-16 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--hub-border)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Araç Merkezi
              </span>
            </div>
            <h2 suppressHydrationWarning className="text-2xl font-black text-white sm:text-3xl">
              Tüm Dijital Araçlar
              <span className="ml-3 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                {liveCount} Aktif · {tools.length} Toplam
              </span>
            </h2>
            <p className="mt-1 text-sm text-[var(--hub-text-muted)]">
              İhtiyacınız olan aracı anında arayın, kategorilere göre filtreleyin veya etkileşimli vitrinde kaydırın.
            </p>
          </div>

          {/* Controls: Search + View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--hub-text-subtle)]" />
              <input
                type="text"
                placeholder="Araç filtrele..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-[var(--hub-text-subtle)] transition-all focus:border-indigo-500/50 focus:outline-none"
                data-cursor="Filtrele"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hub-text-subtle)] hover:text-white"
                  aria-label="Temizle"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-500 text-white shadow-md"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title="Izgara Görünümü"
                data-cursor="Izgara"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Izgara</span>
              </button>
              <button
                onClick={() => setViewMode("showcase")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "showcase"
                    ? "bg-indigo-500 text-white shadow-md"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title="Vitrin Kaydırıcı"
                data-cursor="Vitrin"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Vitrin</span>
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "compact"
                    ? "bg-indigo-500 text-white shadow-md"
                    : "text-[var(--hub-text-muted)] hover:text-white"
                }`}
                title="Kompakt Liste"
                data-cursor="Liste"
              >
                <Rows3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Liste</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap gap-2" id="categories">
          <button
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeCategory === ALL_CATEGORIES
                ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "border border-[var(--hub-border)] bg-[var(--hub-surface)] text-[var(--hub-text-muted)] hover:border-white/20 hover:text-white"
            }`}
            data-cursor="Kategori"
          >
            Tümü ({tools.length})
          </button>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const catCount = tools.filter((t) => t.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10"
                    : "border border-[var(--hub-border)] bg-[var(--hub-surface)] text-[var(--hub-text-muted)] hover:border-white/20 hover:text-white"
                }`}
                data-cursor={CATEGORY_LABELS[cat]}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="text-[10px] opacity-70">({catCount})</span>
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
                  Eşleşen araç bulunamadı
                </h3>
                <p className="text-sm text-[var(--hub-text-muted)] max-w-sm">
                  &quot;{search}&quot; terimi için hiçbir araç bulunamadı. Lütfen farklı bir arama yapın veya filtreleri temizleyin.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory(ALL_CATEGORIES);
                  }}
                  className="mt-6 rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-5 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/25 transition-all"
                >
                  Filtreleri Sıfırla
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
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--hub-text-subtle)] bg-white/5 px-2 py-0.5 rounded-md">
                            Yakında
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
                        Çalıştır →
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--hub-text-subtle)] px-3 py-1.5">
                        Geliştiriliyor
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
