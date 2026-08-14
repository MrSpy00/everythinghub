"use client";
// ============================================================
// aegisTyping — Mode Selector
// Glassmorphism tab bar for mode + value selection
// ============================================================
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Hash, Quote, FileText, Infinity, Code2, GraduationCap, Zap } from "lucide-react";
import type { TestMode } from "../types";

interface ModeSelectorProps {
  mode: TestMode;
  modeValue: number | string;
  onModeChange: (mode: TestMode) => void;
  onModeValueChange: (val: number | string) => void;
  disabled?: boolean;
}

const MODES: Array<{
  id: TestMode;
  label: string;
  icon: React.ReactNode;
  values?: Array<{ label: string; value: number | string }>;
}> = [
  {
    id: "time",
    label: "Süre",
    icon: <Clock size={14} />,
    values: [
      { label: "15s", value: 15 },
      { label: "30s", value: 30 },
      { label: "60s", value: 60 },
      { label: "120s", value: 120 },
    ],
  },
  {
    id: "words",
    label: "Kelime",
    icon: <Hash size={14} />,
    values: [
      { label: "10", value: 10 },
      { label: "25", value: 25 },
      { label: "50", value: 50 },
      { label: "100", value: 100 },
    ],
  },
  {
    id: "quote",
    label: "Alıntı",
    icon: <Quote size={14} />,
    values: [
      { label: "Kısa", value: "short" },
      { label: "Orta", value: "medium" },
      { label: "Uzun", value: "long" },
      { label: "Rastgele", value: "random" },
    ],
  },
  {
    id: "custom",
    label: "Özel",
    icon: <FileText size={14} />,
  },
  {
    id: "zen",
    label: "Zen",
    icon: <Infinity size={14} />,
  },
  {
    id: "code",
    label: "Kod",
    icon: <Code2 size={14} />,
    values: [
      { label: "JS", value: "js" },
      { label: "Python", value: "py" },
      { label: "HTML", value: "html" },
    ],
  },
  {
    id: "learn",
    label: "Öğren",
    icon: <GraduationCap size={14} />,
  },
  {
    id: "challenge",
    label: "Zorluk",
    icon: <Zap size={14} />,
  },
];

export function ModeSelector({
  mode,
  modeValue,
  onModeChange,
  onModeValueChange,
  disabled = false,
}: ModeSelectorProps) {
  const [customInput, setCustomInput] = useState(
    typeof modeValue === "number" ? String(modeValue) : ""
  );
  const currentMode = MODES.find((m) => m.id === mode);

  const handleModeChange = (newMode: TestMode) => {
    if (disabled) return;
    onModeChange(newMode);
    const m = MODES.find((m) => m.id === newMode);
    if (m?.values?.length) {
      onModeValueChange(m.values[0].value);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main mode tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
        role="tablist"
        aria-label="Test modu seçimi"
      >
        {MODES.map((m) => {
          const isActive = mode === m.id;
          return (
            <motion.button
              key={m.id}
              role="tab"
              aria-selected={isActive}
              id={`mode-tab-${m.id}`}
              onClick={() => handleModeChange(m.id)}
              disabled={disabled}
              whileHover={disabled ? {} : { scale: 1.03 }}
              whileTap={disabled ? {} : { scale: 0.97 }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors focus:outline-none disabled:opacity-40"
              style={{
                color: isActive ? "var(--at-bg)" : "var(--at-muted)",
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "var(--at-accent)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Sub-values */}
      {currentMode?.values && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 flex-wrap"
          role="group"
          aria-label={`${currentMode.label} değeri`}
        >
          {currentMode.values.map((v) => {
            const isActive = modeValue === v.value;
            return (
              <motion.button
                key={String(v.value)}
                onClick={() => !disabled && onModeValueChange(v.value)}
                disabled={disabled}
                whileHover={disabled ? {} : { scale: 1.05 }}
                whileTap={disabled ? {} : { scale: 0.95 }}
                className="px-4 py-1 rounded-full text-xs font-semibold transition-all focus:outline-none disabled:opacity-40"
                style={{
                  background: isActive
                    ? "var(--at-accent)"
                    : "rgba(255,255,255,0.06)",
                  color: isActive ? "var(--at-bg)" : "var(--at-muted)",
                  border: `1px solid ${isActive ? "var(--at-accent)" : "rgba(255,255,255,0.08)"}`,
                }}
                aria-pressed={isActive}
              >
                {v.label}
              </motion.button>
            );
          })}

          {/* Custom value input */}
          {mode === "time" || mode === "words" ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={mode === "time" ? 5 : 1}
                max={mode === "time" ? 600 : 500}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onBlur={() => {
                  const n = parseInt(customInput);
                  if (!isNaN(n) && n > 0) {
                    onModeValueChange(n);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const n = parseInt(customInput);
                    if (!isNaN(n) && n > 0) {
                      onModeValueChange(n);
                    }
                  }
                }}
                placeholder="özel"
                className="w-16 px-2 py-1 rounded-full text-xs text-center font-mono focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--at-text)",
                }}
                disabled={disabled}
              />
            </div>
          ) : null}
        </motion.div>
      )}

      {/* Custom text input */}
      {mode === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <textarea
            placeholder="Kendi metninizi buraya yapıştırın veya yazın..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl text-sm resize-none focus:outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "var(--at-text)",
              fontFamily: "inherit",
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              if (text.trim()) {
                onModeValueChange(text.trim());
              }
            }}
            onChange={(e) => {
              if (e.target.value.trim()) {
                onModeValueChange(e.target.value.trim());
              }
            }}
            disabled={disabled}
          />
        </motion.div>
      )}
    </div>
  );
}
