"use client";
// ============================================================
// aegisTyping — Language Selector
// Dropdown with 17 languages, search, and flag indicators
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

const LANGUAGES = [
  { locale: "en", lang: "English", flag: "US" },
  { locale: "tr-q", lang: "Türkçe (Q)", flag: "TR" },
  { locale: "tr-f", lang: "Türkçe (F)", flag: "TR" },
  { locale: "de", lang: "Deutsch", flag: "DE" },
  { locale: "fr", lang: "Français", flag: "FR" },
  { locale: "es", lang: "Español", flag: "ES" },
  { locale: "ru", lang: "Русский", flag: "RU" },
  { locale: "ar", lang: "العربية", flag: "AR" },
  { locale: "ja", lang: "日本語", flag: "JP" },
  { locale: "ko", lang: "한국어", flag: "KR" },
  { locale: "zh", lang: "中文", flag: "CN" },
  { locale: "pt", lang: "Português", flag: "BR" },
  { locale: "it", lang: "Italiano", flag: "IT" },
  { locale: "nl", lang: "Nederlands", flag: "NL" },
  { locale: "pl", lang: "Polski", flag: "PL" },
  { locale: "sv", lang: "Svenska", flag: "SE" },
  { locale: "code-js", lang: "JavaScript", flag: "JS" },
  { locale: "code-py", lang: "Python", flag: "PY" },
  { locale: "code-html", lang: "HTML & CSS", flag: "HT" },
];

// Simple 2-letter flag SVG representation
function FlagIcon({ code }: { code: string }) {
  const flagColors: Record<string, [string, string]> = {
    US: ["#B22234", "#3C3B6E"],
    TR: ["#E30A17", "#E30A17"],
    DE: ["#000000", "#DD0000"],
    FR: ["#002395", "#ED2939"],
    ES: ["#c60b1e", "#f1bf00"],
    RU: ["#003DA5", "#DC241F"],
    AR: ["#006233", "#CE1126"],
    JP: ["#ffffff", "#BC002D"],
    KR: ["#ffffff", "#003478"],
    CN: ["#DE2910", "#FFDE00"],
    BR: ["#009c3b", "#002776"],
    IT: ["#009246", "#CE2B37"],
    NL: ["#AE1C28", "#21468B"],
    PL: ["#DC143C", "#ffffff"],
    SE: ["#006AA7", "#FECC02"],
    JS: ["#F7DF1E", "#323330"],
    PY: ["#3572A5", "#FFD43B"],
    HT: ["#E34F26", "#1572B6"],
  };

  const [top, bottom] = flagColors[code] ?? ["#666", "#999"];

  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      className="rounded-sm flex-shrink-0"
      aria-hidden="true"
    >
      <rect y="0" width="20" height="7" fill={top} />
      <rect y="7" width="20" height="7" fill={bottom} />
    </svg>
  );
}

interface LanguageSelectorProps {
  language: string;
  onChange: (locale: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  language,
  onChange,
  disabled = false,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const current = LANGUAGES.find((l) => l.locale === language) ?? LANGUAGES[0];

  const filtered = LANGUAGES.filter(
    (l) =>
      l.lang.toLowerCase().includes(search.toLowerCase()) ||
      l.locale.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = useCallback(
    (locale: string) => {
      onChange(locale);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    },
    []
  );

  return (
    <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
      <motion.button
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.97 }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium focus:outline-none transition-colors disabled:opacity-40"
        style={{
          background: open
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          color: "var(--at-text)",
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Dil seç"
        id="language-selector-btn"
      >
        <FlagIcon code={current.flag} />
        <span className="hidden sm:inline max-w-[80px] truncate">
          {current.lang}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: "var(--at-muted)" }} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{
              background: "rgba(10,10,15,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
            role="listbox"
            aria-labelledby="language-selector-btn"
          >
            {/* Search */}
            <div className="p-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Search size={12} style={{ color: "var(--at-muted)" }} />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ara..."
                  className="flex-1 bg-transparent text-xs focus:outline-none"
                  style={{ color: "var(--at-text)" }}
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto py-1" style={{ overscrollBehavior: "contain" }}>
              {filtered.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "var(--at-muted)" }}>
                  Sonuç bulunamadı
                </p>
              ) : (
                filtered.map((lang) => {
                  const isActive = lang.locale === language;
                  return (
                    <motion.button
                      key={lang.locale}
                      onClick={() => handleSelect(lang.locale)}
                      whileHover={{ x: 3 }}
                      role="option"
                      aria-selected={isActive}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors focus:outline-none"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.08)"
                          : "transparent",
                        color: isActive ? "var(--at-accent)" : "var(--at-text)",
                      }}
                    >
                      <FlagIcon code={lang.flag} />
                      <span>{lang.lang}</span>
                      {isActive && (
                        <span className="ml-auto text-xs" style={{ color: "var(--at-accent)" }}>
                          ✓
                        </span>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
