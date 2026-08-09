"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudioDropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ElementType | ReactNode;
  description?: string;
  badge?: string;
}

export interface StudioDropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: StudioDropdownOption<T>[];
  label?: string;
  placeholder?: string;
  dropUp?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export function StudioDropdown<T extends string>({
  value,
  onChange,
  options,
  label,
  placeholder,
  dropUp = false,
  className,
  buttonClassName,
  menuClassName,
  disabled = false,
}: StudioDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const renderIcon = (icon?: React.ElementType | ReactNode) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="h-4 w-4 shrink-0 text-indigo-400" />;
    }
    return null;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full text-left transition-[z-index]",
        isOpen ? "z-[80]" : "z-20",
        className
      )}
    >
      {label && (
        <label className="text-xs font-semibold text-zinc-400 block mb-1.5 select-none">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white backdrop-blur-2xl transition-all duration-200 hover:border-indigo-500/40 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer shadow-md active:scale-[0.99]",
          isOpen && "border-indigo-500/60 bg-white/[0.08] ring-2 ring-indigo-500/30",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          buttonClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption && renderIcon(selectedOption.icon)}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder || "Seçiniz"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-white"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={
              dropUp
                ? { opacity: 0, y: 8, scale: 0.96 }
                : { opacity: 0, y: -8, scale: 0.96 }
            }
            animate={{ opacity: 1, y: dropUp ? -4 : 4, scale: 1 }}
            exit={
              dropUp
                ? { opacity: 0, y: 8, scale: 0.96 }
                : { opacity: 0, y: -8, scale: 0.96 }
            }
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute left-0 right-0 z-[100] min-w-[200px] max-h-64 overflow-y-auto rounded-2xl border border-white/15 bg-[#0e1017]/98 p-1.5 backdrop-blur-3xl shadow-2xl shadow-black/95 scrollbar-thin scrollbar-thumb-white/10",
              dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5",
              menuClassName
            )}
            role="listbox"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 cursor-pointer gap-2",
                    isSelected
                      ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-sm"
                      : "text-zinc-300 hover:bg-white/[0.08] hover:text-white border border-transparent"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {renderIcon(opt.icon)}
                    <div className="flex flex-col text-left truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="text-[10px] text-zinc-400 font-normal truncate">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
