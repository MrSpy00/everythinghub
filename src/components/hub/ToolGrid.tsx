"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Fuse from "fuse.js";
import { type Tool, type ToolCategory, tools, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/tools-registry";
import { ToolCard } from "./ToolCard";
import { cn } from "@/lib/utils";

const fuse = new Fuse(tools, {
  keys: ["title", "description", "tags", "category"],
  threshold: 0.4,
  includeScore: true,
});

const ALL_CATEGORIES = "all";

export function ToolGrid() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | typeof ALL_CATEGORIES>(ALL_CATEGORIES);

  // Get unique categories that have tools
  const categories = useMemo(() => {
    const cats = [...new Set(tools.map((t) => t.category))];
    return cats;
  }, []);

  // Filtered tools
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
    <section id="tools" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-white">
              Araçlar
              <span className="ml-2 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-sm font-medium text-indigo-400">
                {liveCount} aktif
              </span>
            </h2>
            <p className="mt-1 text-sm text-[var(--hub-text-muted)]">
              Her araç ücretsiz ve login gerektirmez
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--hub-text-subtle)]" />
            <input
              type="text"
              placeholder="Araç ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface)] py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-[var(--hub-text-subtle)] transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
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
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8 flex flex-wrap gap-2"
          id="categories"
        >
          <CategoryButton
            label="Tümü"
            isActive={activeCategory === ALL_CATEGORIES}
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
          />
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <CategoryButton
                key={cat}
                label={CATEGORY_LABELS[cat]}
                icon={<Icon className="h-3.5 w-3.5" />}
                isActive={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            );
          })}
        </motion.div>

        {/* Tools grid */}
        <AnimatePresence mode="wait">
          {filteredTools.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-4 text-4xl">🔍</div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Sonuç bulunamadı
              </h3>
              <p className="text-sm text-[var(--hub-text-muted)]">
                &quot;{search}&quot; için eşleşen araç yok
              </p>
              <button
                onClick={() => { setSearch(""); setActiveCategory(ALL_CATEGORIES); }}
                className="mt-4 rounded-lg border border-[var(--hub-border)] px-4 py-2 text-sm text-[var(--hub-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
              >
                Filtreleri temizle
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredTools.map((tool, i) => (
                <ToolCard key={tool.slug} tool={tool} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function CategoryButton({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
        isActive
          ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40"
          : "text-[var(--hub-text-muted)] hover:bg-white/5 hover:text-white"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="category-active"
          className="absolute inset-0 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/30"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  );
}
