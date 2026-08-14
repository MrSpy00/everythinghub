"use client";
// ============================================================
// aegisTyping — Funbox Selector
// Challenge mode grid selector
// ============================================================
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, EyeOff, Skull, PauseCircle, Ghost,
  Wind, CloudRain, Zap, SplitSquareHorizontal, Delete
} from "lucide-react";
import type { Funbox } from "../types";

interface FunboxOption {
  id: Funbox;
  label: string;
  description: string;
  icon: React.ReactNode;
  danger?: boolean;
}

const FUNBOXES: FunboxOption[] = [
  {
    id: "none",
    label: "Normal",
    description: "Standart yazma testi",
    icon: <Zap size={18} />,
  },
  {
    id: "mirror",
    label: "Ayna",
    description: "Yazı yatay ayna görüntüsü",
    icon: <SplitSquareHorizontal size={18} />,
  },
  {
    id: "backwards",
    label: "Ters",
    description: "Kelimeler ters sırada",
    icon: <ArrowLeft size={18} />,
  },
  {
    id: "blind",
    label: "Kör Mod",
    description: "Yazarken karakterler kaybolur",
    icon: <EyeOff size={18} />,
  },
  {
    id: "sudden-death",
    label: "Ani Ölüm",
    description: "İlk hata = test sıfırlanır",
    icon: <Skull size={18} />,
    danger: true,
  },
  {
    id: "stop-on-error",
    label: "Hata Dur",
    description: "Hata yapınca imleç dondurulur",
    icon: <PauseCircle size={18} />,
  },
  {
    id: "ghost-race",
    label: "Hayalet Yarışı",
    description: "Kendi rekorunla yarış",
    icon: <Ghost size={18} />,
  },
  {
    id: "no-backspace",
    label: "Güven Modu",
    description: "Geri silme yok",
    icon: <Delete size={18} />,
  },
  {
    id: "chasing-beam",
    label: "Kovalayan",
    description: "Geride kalırsan kaybedersin",
    icon: <Wind size={18} />,
    danger: true,
  },
  {
    id: "neon-rain",
    label: "Neon Yağmuru",
    description: "Doğru karakterler ışıkla kaybolur",
    icon: <CloudRain size={18} />,
  },
];

interface FunboxSelectorProps {
  value: Funbox;
  onChange: (f: Funbox) => void;
  disabled?: boolean;
}

export function FunboxSelector({ value, onChange, disabled = false }: FunboxSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {FUNBOXES.map((fb) => {
        const isActive = value === fb.id;
        return (
          <motion.button
            key={fb.id}
            onClick={() => !disabled && onChange(fb.id)}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.03, y: -2 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            className="relative flex flex-col items-start gap-2 p-3 rounded-2xl text-left transition-all focus:outline-none disabled:opacity-40"
            style={{
              background: isActive
                ? fb.danger
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${
                isActive
                  ? fb.danger
                    ? "rgba(239,68,68,0.4)"
                    : "var(--at-accent)"
                  : "rgba(255,255,255,0.07)"
              }`,
              boxShadow: isActive
                ? `0 0 16px ${fb.danger ? "rgba(239,68,68,0.15)" : "rgba(34,211,238,0.1)"}`
                : "none",
            }}
            aria-pressed={isActive}
          >
            {/* Icon */}
            <div
              style={{
                color: isActive
                  ? fb.danger
                    ? "#f87171"
                    : "var(--at-accent)"
                  : "var(--at-muted)",
              }}
            >
              {fb.icon}
            </div>

            {/* Text */}
            <div>
              <p
                className="text-xs font-semibold leading-tight"
                style={{
                  color: isActive
                    ? fb.danger
                      ? "#f87171"
                      : "var(--at-text)"
                    : "var(--at-text)",
                }}
              >
                {fb.label}
              </p>
              <p
                className="text-[10px] mt-0.5 leading-tight"
                style={{ color: "var(--at-muted)" }}
              >
                {fb.description}
              </p>
            </div>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="funbox-active"
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{
                  background: fb.danger ? "#f87171" : "var(--at-accent)",
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
