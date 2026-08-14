"use client";
// ============================================================
// aegisTyping — Language Selector
// Dedicated human language dropdown with authentic SVG flags
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

export interface LanguageItem {
  locale: string;
  lang: string;
  nativeName: string;
  country: string;
}

export const HUMAN_LANGUAGES: LanguageItem[] = [
  { locale: "tr-q", lang: "Türkçe (Q)", nativeName: "Türkçe", country: "TR" },
  { locale: "tr-f", lang: "Türkçe (F)", nativeName: "Türkçe", country: "TR" },
  { locale: "en", lang: "English", nativeName: "English", country: "US" },
  { locale: "de", lang: "Deutsch", nativeName: "Deutsch", country: "DE" },
  { locale: "fr", lang: "Français", nativeName: "Français", country: "FR" },
  { locale: "es", lang: "Español", nativeName: "Español", country: "ES" },
  { locale: "ru", lang: "Русский", nativeName: "Русский", country: "RU" },
  { locale: "ar", lang: "العربية", nativeName: "العربية", country: "AR" },
  { locale: "ja", lang: "日本語", nativeName: "日本語", country: "JP" },
  { locale: "ko", lang: "한국어", nativeName: "한국어", country: "KR" },
  { locale: "zh", lang: "中文 (简体)", nativeName: "中文", country: "CN" },
  { locale: "pt", lang: "Português", nativeName: "Português", country: "BR" },
  { locale: "it", lang: "Italiano", nativeName: "Italiano", country: "IT" },
  { locale: "nl", lang: "Nederlands", nativeName: "Nederlands", country: "NL" },
  { locale: "pl", lang: "Polski", nativeName: "Polski", country: "PL" },
  { locale: "sv", lang: "Svenska", nativeName: "Svenska", country: "SE" },
];

/**
 * Authentic scalable Vector SVG flag components (Zero Emoji standard)
 */
export function CountrySvgFlag({ country }: { country: string }) {
  switch (country) {
    case "TR":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="16" fill="#E30A17" />
          {/* Crescent */}
          <circle cx="10" cy="8" r="4.5" fill="#FFFFFF" />
          <circle cx="11.2" cy="8" r="3.6" fill="#E30A17" />
          {/* 5-pointed star */}
          <polygon
            points="14.8,8 16.2,8.4 15.1,9.4 15.5,10.8 14.3,10 13.1,10.8 13.5,9.4 12.4,8.4 13.8,8 14.3,6.7"
            fill="#FFFFFF"
          />
        </svg>
      );
    case "US":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          {/* 13 stripes */}
          <rect width="24" height="16" fill="#B22234" />
          <rect y="1.23" width="24" height="1.23" fill="#FFFFFF" />
          <rect y="3.69" width="24" height="1.23" fill="#FFFFFF" />
          <rect y="6.15" width="24" height="1.23" fill="#FFFFFF" />
          <rect y="8.61" width="24" height="1.23" fill="#FFFFFF" />
          <rect y="11.07" width="24" height="1.23" fill="#FFFFFF" />
          <rect y="13.53" width="24" height="1.23" fill="#FFFFFF" />
          {/* Canton */}
          <rect width="9.6" height="8.6" fill="#3C3B6E" />
          <circle cx="2.5" cy="2.2" r="0.6" fill="#FFFFFF" />
          <circle cx="5.0" cy="2.2" r="0.6" fill="#FFFFFF" />
          <circle cx="7.5" cy="2.2" r="0.6" fill="#FFFFFF" />
          <circle cx="3.7" cy="4.3" r="0.6" fill="#FFFFFF" />
          <circle cx="6.2" cy="4.3" r="0.6" fill="#FFFFFF" />
          <circle cx="2.5" cy="6.4" r="0.6" fill="#FFFFFF" />
          <circle cx="5.0" cy="6.4" r="0.6" fill="#FFFFFF" />
          <circle cx="7.5" cy="6.4" r="0.6" fill="#FFFFFF" />
        </svg>
      );
    case "DE":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="5.33" fill="#000000" />
          <rect y="5.33" width="24" height="5.33" fill="#DD0000" />
          <rect y="10.66" width="24" height="5.34" fill="#FFCE00" />
        </svg>
      );
    case "FR":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="8" height="16" fill="#002654" />
          <rect x="8" width="8" height="16" fill="#FFFFFF" />
          <rect x="16" width="8" height="16" fill="#ED2939" />
        </svg>
      );
    case "ES":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="4" fill="#AA151B" />
          <rect y="4" width="24" height="8" fill="#F1BF00" />
          <rect y="12" width="24" height="4" fill="#AA151B" />
          {/* Coat emblem */}
          <rect x="5" y="6.5" width="2.5" height="3" rx="0.5" fill="#AA151B" />
          <circle cx="6.25" cy="5.8" r="0.8" fill="#F1BF00" />
        </svg>
      );
    case "RU":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="5.33" fill="#FFFFFF" />
          <rect y="5.33" width="24" height="5.33" fill="#0039A6" />
          <rect y="10.66" width="24" height="5.34" fill="#D52B1E" />
        </svg>
      );
    case "AR":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="5.33" fill="#000000" />
          <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <rect y="10.66" width="24" height="5.34" fill="#007A3D" />
          <polygon points="0,0 8,8 0,16" fill="#CE1126" />
        </svg>
      );
    case "JP":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="16" fill="#FFFFFF" />
          <circle cx="12" cy="8" r="4.8" fill="#BC002D" />
        </svg>
      );
    case "KR":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="16" fill="#FFFFFF" />
          {/* Taegeuk */}
          <path d="M 12,4 A 4,4 0 0,1 12,12 A 2,2 0 0,1 12,8 A 2,2 0 0,0 12,4 Z" fill="#CD2E3A" />
          <path d="M 12,12 A 4,4 0 0,1 12,4 A 2,2 0 0,1 12,8 A 2,2 0 0,0 12,12 Z" fill="#0047A0" />
          {/* Trigrams */}
          <rect x="4" y="2.5" width="2.5" height="0.6" rx="0.2" fill="#000000" />
          <rect x="4" y="3.5" width="2.5" height="0.6" rx="0.2" fill="#000000" />
          <rect x="17.5" y="11.8" width="2.5" height="0.6" rx="0.2" fill="#000000" />
          <rect x="17.5" y="12.8" width="2.5" height="0.6" rx="0.2" fill="#000000" />
        </svg>
      );
    case "CN":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="16" fill="#EE1C25" />
          {/* Big star */}
          <polygon points="4,3.2 4.6,4.6 6,4.6 4.9,5.4 5.3,6.8 4,5.9 2.7,6.8 3.1,5.4 2,4.6 3.4,4.6" fill="#FFFF00" />
          {/* Small stars */}
          <circle cx="7.5" cy="2.5" r="0.6" fill="#FFFF00" />
          <circle cx="8.8" cy="4" r="0.6" fill="#FFFF00" />
          <circle cx="8.8" cy="6" r="0.6" fill="#FFFF00" />
          <circle cx="7.5" cy="7.5" r="0.6" fill="#FFFF00" />
        </svg>
      );
    case "BR":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="16" fill="#009739" />
          {/* Rhombus */}
          <polygon points="12,2 21.5,8 12,14 2.5,8" fill="#FEDD00" />
          {/* Celestial Globe */}
          <circle cx="12" cy="8" r="3.2" fill="#012169" />
          <path d="M 9.5,8.8 Q 12,7.2 14.5,8.8" stroke="#FFFFFF" strokeWidth="0.6" fill="none" />
        </svg>
      );
    case "IT":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="8" height="16" fill="#009246" />
          <rect x="8" width="8" height="16" fill="#FFFFFF" />
          <rect x="16" width="8" height="16" fill="#CE2B37" />
        </svg>
      );
    case "NL":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="5.33" fill="#AE1C28" />
          <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
          <rect y="10.66" width="24" height="5.34" fill="#21468B" />
        </svg>
      );
    case "PL":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="8" fill="#FFFFFF" />
          <rect y="8" width="24" height="8" fill="#DC143C" />
        </svg>
      );
    case "SE":
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="16" fill="#006AA7" />
          {/* Scandinavian Cross */}
          <rect x="6.5" width="3" height="16" fill="#FECC02" />
          <rect y="6.5" width="24" height="3" fill="#FECC02" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 16" width="22" height="15" className="rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <rect width="24" height="16" fill="#3f3f46" />
        </svg>
      );
  }
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

  const current = HUMAN_LANGUAGES.find((l) => l.locale === language) ?? HUMAN_LANGUAGES[0];

  const filtered = HUMAN_LANGUAGES.filter(
    (l) =>
      l.lang.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
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
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative select-none">
      {/* Trigger button */}
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none transition-all disabled:opacity-50"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(16px)",
          color: "var(--at-text)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Dil seçimi: ${current.lang}`}
      >
        <CountrySvgFlag country={current.country} />
        <span>{current.lang}</span>
        <ChevronDown
          size={13}
          className="transition-transform duration-200"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--at-muted)",
          }}
        />
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-64 max-h-80 rounded-2xl flex flex-col z-50 overflow-hidden"
            style={{
              background: "rgba(18, 18, 24, 0.88)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(28px)",
              boxShadow: "0 20px 45px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.2)",
            }}
            role="listbox"
            aria-label="Dil listesi"
          >
            {/* Search header */}
            <div
              className="flex items-center gap-2 px-3 py-2.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Search size={13} style={{ color: "var(--at-muted)" }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Dil ara..."
                className="w-full bg-transparent text-xs focus:outline-none placeholder-zinc-500"
                style={{ color: "var(--at-text)" }}
              />
            </div>

            {/* Language list */}
            <div className="overflow-y-auto py-1 flex-1" style={{ scrollbarWidth: "thin" }}>
              {filtered.length === 0 ? (
                <p
                  className="px-4 py-3 text-xs text-center"
                  style={{ color: "var(--at-muted)" }}
                >
                  Sonuç bulunamadı
                </p>
              ) : (
                filtered.map((item) => {
                  const isSelected = item.locale === language;
                  return (
                    <button
                      key={item.locale}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item.locale)}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors focus:outline-none"
                      style={{
                        background: isSelected
                          ? "rgba(255,255,255,0.08)"
                          : "transparent",
                        color: isSelected
                          ? "var(--at-accent)"
                          : "var(--at-text)",
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CountrySvgFlag country={item.country} />
                        <span className="font-medium truncate">{item.lang}</span>
                      </div>
                      {isSelected && (
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--at-accent)" }}
                        />
                      )}
                    </button>
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
