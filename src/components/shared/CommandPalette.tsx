"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, X, ArrowRight, Sparkles, CornerDownLeft, ArrowUpDown } from "lucide-react";
import { tools, CATEGORY_LABELS, type Tool } from "@/lib/tools-registry";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { lang, t } = useLanguage();
  const isTurkish = lang === "tr";

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const filteredTools = tools.filter((tool) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const loc = t.toolTranslations?.[tool.slug];
    const locTitle = loc?.title || tool.title;
    const locDesc = loc?.description || tool.description;

    const titleMatch = tool.title.toLowerCase().includes(q) || locTitle.toLowerCase().includes(q);
    const descMatch = tool.description.toLowerCase().includes(q) || locDesc.toLowerCase().includes(q);
    const catLabel = isTurkish ? (CATEGORY_LABELS[tool.category] || tool.category) : tool.category;
    const categoryMatch = catLabel.toLowerCase().includes(q);
    const tagMatch = tool.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false;
    return titleMatch || descMatch || categoryMatch || tagMatch;
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        }
      }
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredTools.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(1, filteredTools.length)) % Math.max(1, filteredTools.length));
      } else if (e.key === "Enter" && filteredTools.length > 0) {
        e.preventDefault();
        const selected = filteredTools[selectedIndex];
        if (selected) {
          onClose();
          startTransition(() => {
            router.push(`/tools/${selected.slug}`);
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredTools, onClose, router]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0e14]/95 backdrop-blur-3xl shadow-2xl"
        >
          {/* Header Input with Zero Generic Purple Outline */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 bg-white/[0.02]">
            <Search className="h-5 w-5 text-indigo-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isTurkish
                  ? "Araç ismi, kategori veya etiket ara... (Örn: JSON, Spotify, YouTube, Döviz)"
                  : "Search tools, categories, or keywords... (e.g. JSON, Spotify, YouTube, Currency)"
              }
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-transparent border-0 outline-none shadow-none ring-0"
              style={{ outline: "none", boxShadow: "none" }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-white/10">
              <Command className="h-3 w-3" /> ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 overscroll-contain">
            {filteredTools.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-sm">
                {isTurkish ? "Aramanızla eşleşen hiçbir araç bulunamadı." : "No tools found matching your query."}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTools.map((tool, index) => {
                  const IconComponent = tool.icon;
                  const isSelected = index === selectedIndex;
                  const loc = t.toolTranslations?.[tool.slug];
                  const title = loc?.title || tool.title;
                  const description = loc?.description || tool.description;
                  const categoryLabel = isTurkish ? (CATEGORY_LABELS[tool.category] || tool.category) : tool.category;

                  return (
                    <button
                      key={tool.slug}
                      onClick={() => {
                        onClose();
                        startTransition(() => {
                          router.push(`/tools/${tool.slug}`);
                        });
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between gap-3 rounded-2xl p-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-500/15 border border-indigo-500/30 text-white shadow-lg"
                          : "hover:bg-white/5 border border-transparent text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10"
                          style={{ backgroundColor: `${tool.accentColor}20` }}
                        >
                          <IconComponent
                            className="h-4 w-4"
                            style={{ color: tool.accentColor }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate text-white">
                              {title}
                            </span>
                            {tool.newBadge && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                                {isTurkish ? "YENİ" : "NEW"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 truncate">
                            {description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-white/5 uppercase">
                          {categoryLabel}
                        </span>
                        <ArrowRight
                          className={`h-4 w-4 transition-transform ${
                            isSelected
                              ? "translate-x-0.5 text-indigo-400 opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-[11px] text-zinc-400 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3 text-zinc-400" />
                <span>{isTurkish ? "seçmek için" : "to select"}</span>
              </span>
              <span className="flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                <span>{isTurkish ? "gezinmek için" : "to navigate"}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-300">
                  ESC
                </kbd>
                <span>{isTurkish ? "kapatmak için" : "to close"}</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-indigo-400 font-mono text-[10px]">
              <Sparkles className="h-3 w-3" />
              <span>{filteredTools.length} {isTurkish ? "araç" : "tools"}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
