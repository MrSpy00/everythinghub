"use client";
// ============================================================
// aegisTyping — Theme Selector Component
// ============================================================
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { getThemesByGroup, applyTheme } from "./themes";
import type { ThemeName } from "../types";

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onChange: (theme: ThemeName) => void;
  customBg?: string;
  customText?: string;
  customAccent?: string;
  onCustomChange?: (bg: string, text: string, accent: string) => void;
}

const GROUP_LABELS: Record<string, string> = {
  dark: "Koyu",
  neon: "Neon",
  light: "Açık",
  nature: "Doğa",
  retro: "Retro",
  custom: "Özel",
};

export const ThemeSelector = React.memo(function ThemeSelector({
  currentTheme,
  onChange,
  customBg = "#09090b",
  customText = "#fafafa",
  customAccent = "#22d3ee",
  onCustomChange,
}: ThemeSelectorProps) {
  const grouped = getThemesByGroup();
  const [showCustom, setShowCustom] = useState(currentTheme === "custom");
  const [localBg, setLocalBg] = useState(customBg);
  const [localText, setLocalText] = useState(customText);
  const [localAccent, setLocalAccent] = useState(customAccent);

  const handleThemeSelect = (name: ThemeName) => {
    if (name === "custom") {
      setShowCustom(true);
      onChange("custom");
      applyTheme("custom", { bg: localBg, text: localText, accent: localAccent });
    } else {
      setShowCustom(false);
      onChange(name);
      applyTheme(name);
    }
  };

  const handleCustomApply = () => {
    applyTheme("custom", { bg: localBg, text: localText, accent: localAccent });
    onCustomChange?.(localBg, localText, localAccent);
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([group, themes]) => (
        <div key={group}>
          <p className="text-xs font-medium uppercase tracking-[0.12em] mb-2.5" style={{ color: "var(--at-muted)" }}>
            {GROUP_LABELS[group] ?? group}
          </p>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => {
              const isActive = currentTheme === theme.name;
              return (
                <motion.button
                  key={theme.name}
                  onClick={() => handleThemeSelect(theme.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  title={theme.label}
                  className="relative group flex flex-col items-center gap-1.5"
                  aria-label={`Tema: ${theme.label}`}
                  aria-pressed={isActive}
                >
                  {/* Color preview swatch */}
                  <div
                    className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200 overflow-hidden"
                    style={{
                      background: theme.vars.bg,
                      borderColor: isActive ? theme.vars.accent : "transparent",
                      boxShadow: isActive
                        ? `0 0 12px ${theme.vars.accent}60`
                        : "none",
                    }}
                  >
                    {/* Mini preview stripes */}
                    <div className="w-full h-full p-1 flex flex-col gap-0.5">
                      <div
                        className="h-1 rounded-full"
                        style={{ background: theme.vars.text }}
                      />
                      <div
                        className="h-1 rounded-full w-2/3"
                        style={{ background: theme.vars.correct }}
                      />
                      <div
                        className="h-0.5 rounded-full w-1/3"
                        style={{ background: theme.vars.error }}
                      />
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40"
                      >
                        <Check size={14} style={{ color: theme.vars.accent }} />
                      </motion.div>
                    )}
                  </div>
                  <span
                    className="text-[10px] text-center leading-tight max-w-[42px] truncate"
                    style={{
                      color: isActive ? "var(--at-text)" : "var(--at-muted)",
                    }}
                  >
                    {theme.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom theme editor */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 p-4 rounded-xl border space-y-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "var(--at-border)",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: "var(--at-text)" }}>
                Renkleri Özelleştir
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Arka Plan", value: localBg, set: setLocalBg, key: "bg" },
                  { label: "Metin", value: localText, set: setLocalText, key: "text" },
                  { label: "Vurgu", value: localAccent, set: setLocalAccent, key: "accent" },
                ].map(({ label, value, set }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[10px] font-medium" style={{ color: "var(--at-muted)" }}>
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0.5"
                        style={{ background: "transparent" }}
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                            set(e.target.value);
                          }
                        }}
                        className="flex-1 text-xs px-2 py-1 rounded-lg border font-mono bg-transparent"
                        style={{
                          borderColor: "var(--at-border)",
                          color: "var(--at-text)",
                        }}
                        maxLength={7}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <motion.button
                onClick={handleCustomApply}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{
                  background: "var(--at-accent)",
                  color: "var(--at-bg)",
                }}
              >
                Temayı Uygula
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
