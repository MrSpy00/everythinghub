"use client";
// ============================================================
// aegisTyping — Mode Selector
// Glassmorphism tab bar with guaranteed visible high-contrast text
// ============================================================
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Hash,
  Quote,
  FileText,
  Infinity,
  Code2,
  GraduationCap,
  Zap,
  Edit3,
  SplitSquareHorizontal,
  ArrowLeft,
  EyeOff,
  Skull,
  PauseCircle,
  CloudRain,
  Delete,
  Check,
} from "lucide-react";
import type { TestMode, Funbox } from "../types";
import { CODE_LANGUAGES } from "../utils/codeGenerator";

interface ModeSelectorProps {
  mode: TestMode;
  modeValue: number | string;
  funbox: Funbox;
  onModeChange: (mode: TestMode) => void;
  onModeValueChange: (val: number | string) => void;
  onFunboxChange: (funbox: Funbox) => void;
  disabled?: boolean;
  punctuation?: boolean;
  numbers?: boolean;
  capitalization?: boolean;
  onTogglePunctuation?: () => void;
  onToggleNumbers?: () => void;
  onToggleCapitalization?: () => void;
}

const MODES: Array<{
  id: TestMode;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: "time", label: "Süre", icon: <Clock size={14} /> },
  { id: "words", label: "Kelime", icon: <Hash size={14} /> },
  { id: "quote", label: "Alıntı", icon: <Quote size={14} /> },
  { id: "custom", label: "Özel Metin", icon: <FileText size={14} /> },
  { id: "zen", label: "Zen", icon: <Infinity size={14} /> },
  { id: "code", label: "Kod", icon: <Code2 size={14} /> },
  { id: "learn", label: "Öğren", icon: <GraduationCap size={14} /> },
  { id: "challenge", label: "Zorluk", icon: <Zap size={14} /> },
];

const TIME_OPTIONS = [
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "120s", value: 120 },
];

const WORD_OPTIONS = [
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const QUOTE_OPTIONS = [
  { label: "Kısa", value: "short" },
  { label: "Orta", value: "medium" },
  { label: "Uzun", value: "long" },
  { label: "Rastgele", value: "random" },
];

const CHALLENGE_OPTIONS: Array<{
  id: Funbox;
  label: string;
  desc: string;
  icon: React.ReactNode;
  danger?: boolean;
}> = [
  { id: "none", label: "Standart", desc: "Normal kurallar", icon: <Zap size={13} /> },
  { id: "mirror", label: "Ayna (Mirror)", desc: "Metin yatay ayna", icon: <SplitSquareHorizontal size={13} /> },
  { id: "backwards", label: "Ters (Backwards)", desc: "Kelimeler tersten", icon: <ArrowLeft size={13} /> },
  { id: "blind", label: "Kör Mod (Blind)", desc: "Yazılanlar gizlenir", icon: <EyeOff size={13} /> },
  { id: "sudden-death", label: "Ani Ölüm (Sudden Death)", desc: "1 hata = fail", icon: <Skull size={13} />, danger: true },
  { id: "stop-on-error", label: "Hata Kilidi (Stop on Error)", desc: "Düzeltmeden geçilemez", icon: <PauseCircle size={13} /> },
  { id: "no-backspace", label: "Güven Modu (No Backspace)", desc: "Geri silme engelli", icon: <Delete size={13} /> },
  { id: "neon-rain", label: "Işık Yağmuru (Neon Rain)", desc: "Işıltılı parçacıklar", icon: <CloudRain size={13} /> },
];

const LEARN_LESSONS = [
  { id: "homerow", label: "Ev Sırası (Home Row)" },
  { id: "upperrow", label: "Üst Sıra" },
  { id: "bottomrow", label: "Alt Sıra" },
  { id: "numbers", label: "Rakamlar & Noktalama" },
  { id: "capitals", label: "Büyük Harfler" },
  { id: "mixed", label: "Karma İleri Seviye" },
];

export function ModeSelector({
  mode,
  modeValue,
  funbox,
  onModeChange,
  onModeValueChange,
  onFunboxChange,
  disabled = false,
  punctuation = false,
  numbers = false,
  capitalization = false,
  onTogglePunctuation,
  onToggleNumbers,
  onToggleCapitalization,
}: ModeSelectorProps) {
  const [customInput, setCustomInput] = useState(
    typeof modeValue === "number" ? String(modeValue) : ""
  );
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  useEffect(() => {
    if (typeof modeValue === "number") {
      setCustomInput(String(modeValue));
    }
  }, [modeValue]);

  const handleModeChange = (newMode: TestMode) => {
    if (disabled) return;
    onModeChange(newMode);
    if (newMode === "time") onModeValueChange(60);
    else if (newMode === "words") onModeValueChange(25);
    else if (newMode === "quote") onModeValueChange("medium");
    else if (newMode === "code") onModeValueChange("js");
    else if (newMode === "learn") onModeValueChange("homerow");
  };

  const handleCustomSubmit = () => {
    const n = parseInt(customInput, 10);
    if (!isNaN(n) && n > 0) {
      onModeValueChange(n);
    }
    setIsEditingCustom(false);
  };

  const showModifiers = mode === "time" || mode === "words";

  return (
    <div className="flex flex-col items-center gap-3.5 w-full max-w-4xl mx-auto select-none">
      {/* Primary Mode Glass Bar + Modifiers */}
      <div className="flex items-center justify-center flex-wrap gap-2 max-w-full">
        {/* Modes Bar */}
        <div
          className="flex items-center justify-center flex-wrap gap-1.5 p-1.5 rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
          }}
          role="tablist"
          aria-label="Yazma Testi Modu"
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
                className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors focus:outline-none disabled:opacity-40"
                style={{
                  color: isActive ? "#09090b" : "var(--at-muted, #94a3b8)",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="mode-tab-active-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "var(--at-accent, #22d3ee)",
                      boxShadow: "0 0 20px rgba(34, 211, 238, 0.45)",
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {m.icon}
                  <span>{m.label}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Modifiers (Punctuation, Numbers, Capitalization) */}
        {showModifiers && (
          <div
            className="flex items-center gap-1 p-1.5 rounded-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              backdropFilter: "blur(24px)",
            }}
          >
            {onTogglePunctuation && (
              <button
                type="button"
                onClick={onTogglePunctuation}
                disabled={disabled}
                className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all focus:outline-none disabled:opacity-40"
                style={{
                  background: punctuation ? "var(--at-accent)" : "transparent",
                  color: punctuation ? "#09090b" : "var(--at-muted)",
                }}
                title="Noktalama İşaretleri (.,!?)"
              >
                @!
              </button>
            )}
            {onToggleNumbers && (
              <button
                type="button"
                onClick={onToggleNumbers}
                disabled={disabled}
                className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all focus:outline-none disabled:opacity-40"
                style={{
                  background: numbers ? "var(--at-accent)" : "transparent",
                  color: numbers ? "#09090b" : "var(--at-muted)",
                }}
                title="Rakamlar (123)"
              >
                123
              </button>
            )}
            {onToggleCapitalization && (
              <button
                type="button"
                onClick={onToggleCapitalization}
                disabled={disabled}
                className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all focus:outline-none disabled:opacity-40"
                style={{
                  background: capitalization ? "var(--at-accent)" : "transparent",
                  color: capitalization ? "#09090b" : "var(--at-muted)",
                }}
                title="Büyük Harfler (Aa)"
              >
                Aa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sub-values container */}
      <div className="min-h-[42px] flex items-center justify-center w-full">
        {/* Time Mode Sub-options */}
        {mode === "time" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 flex-wrap justify-center"
          >
            {TIME_OPTIONS.map((t) => {
              const isActive = Number(modeValue) === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => !disabled && onModeValueChange(t.value)}
                  disabled={disabled}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all focus:outline-none disabled:opacity-40"
                  style={{
                    background: isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#09090b" : "var(--at-muted)",
                    border: `1px solid ${isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.08)"}`,
                  }}
                >
                  {t.label}
                </button>
              );
            })}

            {/* Custom time input */}
            <div className="flex items-center">
              {isEditingCustom ? (
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-cyan-400/40">
                  <input
                    type="number"
                    min={5}
                    max={1200}
                    value={customInput}
                    autoFocus
                    onChange={(e) => setCustomInput(e.target.value)}
                    onBlur={handleCustomSubmit}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                    placeholder="saniye"
                    className="w-16 bg-transparent text-xs text-center font-mono text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-cyan-300 font-semibold">sn</span>
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="p-0.5 rounded text-cyan-400 hover:text-white"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingCustom(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
                  style={{
                    background:
                      !TIME_OPTIONS.some((o) => o.value === Number(modeValue))
                        ? "var(--at-accent)"
                        : "rgba(255, 255, 255, 0.05)",
                    color:
                      !TIME_OPTIONS.some((o) => o.value === Number(modeValue))
                        ? "#09090b"
                        : "var(--at-muted)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Edit3 size={12} />
                  <span>
                    {!TIME_OPTIONS.some((o) => o.value === Number(modeValue))
                      ? `Özel (${modeValue}s)`
                      : "Özel Süre"}
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Words Mode Sub-options */}
        {mode === "words" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 flex-wrap justify-center"
          >
            {WORD_OPTIONS.map((w) => {
              const isActive = Number(modeValue) === w.value;
              return (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => !disabled && onModeValueChange(w.value)}
                  disabled={disabled}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all focus:outline-none disabled:opacity-40"
                  style={{
                    background: isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#09090b" : "var(--at-muted)",
                    border: `1px solid ${isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.08)"}`,
                  }}
                >
                  {w.label} Kelime
                </button>
              );
            })}

            {/* Custom words input */}
            <div className="flex items-center">
              {isEditingCustom ? (
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-cyan-400/40">
                  <input
                    type="number"
                    min={5}
                    max={1000}
                    value={customInput}
                    autoFocus
                    onChange={(e) => setCustomInput(e.target.value)}
                    onBlur={handleCustomSubmit}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                    placeholder="adet"
                    className="w-16 bg-transparent text-xs text-center font-mono text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-cyan-300 font-semibold">adet</span>
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="p-0.5 rounded text-cyan-400 hover:text-white"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingCustom(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors"
                  style={{
                    background:
                      !WORD_OPTIONS.some((o) => o.value === Number(modeValue))
                        ? "var(--at-accent)"
                        : "rgba(255, 255, 255, 0.05)",
                    color:
                      !WORD_OPTIONS.some((o) => o.value === Number(modeValue))
                        ? "#09090b"
                        : "var(--at-muted)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Edit3 size={12} />
                  <span>
                    {!WORD_OPTIONS.some((o) => o.value === Number(modeValue))
                      ? `Özel (${modeValue})`
                      : "Özel Kelime"}
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Quote Mode Sub-options */}
        {mode === "quote" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 flex-wrap justify-center"
          >
            {QUOTE_OPTIONS.map((q) => {
              const isActive = modeValue === q.value;
              return (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => !disabled && onModeValueChange(q.value)}
                  disabled={disabled}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all focus:outline-none"
                  style={{
                    background: isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#09090b" : "var(--at-muted)",
                    border: `1px solid ${isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.08)"}`,
                  }}
                >
                  {q.label} Alıntı
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Code Mode — Extensive 16 Programming Languages */}
        {mode === "code" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 flex-wrap justify-center py-1 max-w-3xl"
          >
            {CODE_LANGUAGES.map((lang) => {
              const isActive = modeValue === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => !disabled && onModeValueChange(lang.id)}
                  disabled={disabled}
                  className="px-3 py-1 rounded-full text-xs font-bold transition-all focus:outline-none"
                  style={{
                    background: isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#09090b" : "var(--at-muted)",
                    border: `1px solid ${isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.08)"}`,
                  }}
                >
                  {lang.name}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Learn Mode — Keybr-style Curriculum */}
        {mode === "learn" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 flex-wrap justify-center py-1"
          >
            {LEARN_LESSONS.map((l) => {
              const isActive = modeValue === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => !disabled && onModeValueChange(l.id)}
                  disabled={disabled}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all focus:outline-none"
                  style={{
                    background: isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#09090b" : "var(--at-muted)",
                    border: `1px solid ${isActive ? "var(--at-accent)" : "rgba(255, 255, 255, 0.08)"}`,
                  }}
                >
                  {l.label}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Challenge / Difficulty Mode — Full interactive sub-options */}
        {mode === "challenge" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 flex-wrap justify-center py-1 max-w-3xl"
          >
            {CHALLENGE_OPTIONS.map((c) => {
              const isActive = funbox === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !disabled && onFunboxChange(c.id)}
                  disabled={disabled}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all focus:outline-none"
                  style={{
                    background: isActive
                      ? c.danger
                        ? "#ef4444"
                        : "var(--at-accent)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#09090b" : "var(--at-muted)",
                    border: `1px solid ${
                      isActive
                        ? c.danger
                          ? "#ef4444"
                          : "var(--at-accent)"
                        : "rgba(255, 255, 255, 0.08)"
                    }`,
                  }}
                  title={c.desc}
                >
                  {c.icon}
                  <span>{c.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Custom Text Area */}
        {mode === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-full mt-2"
          >
            <textarea
              placeholder="Pratik yapmak istediğiniz kendi metninizi buraya yapıştırın veya yazın..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl text-xs resize-none focus:outline-none transition-colors"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "var(--at-text)",
                backdropFilter: "blur(16px)",
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
    </div>
  );
}
