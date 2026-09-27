"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FlasherSelectOption {
  value: string | number;
  label: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FlasherSelectProps {
  options: FlasherSelectOption[];
  value: string | number;
  onChange: (val: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
  placement?: "auto" | "top" | "bottom";
  align?: "auto" | "left" | "right";
}

export const FlasherSelect: React.FC<FlasherSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seçiniz...",
  disabled = false,
  className = "",
  triggerClassName = "",
  ariaLabel,
  size = "md",
  placement = "auto",
  align = "auto",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Intelligent collision & viewport boundary detection
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (placement === "top") {
      setOpenUpward(true);
    } else if (placement === "bottom") {
      setOpenUpward(false);
    } else {
      // Auto: if space below is less than 280px OR (spaceBelow < 380px and spaceAbove > spaceBelow), open upward
      setOpenUpward(spaceBelow < 280 || (spaceBelow < 380 && spaceAbove > spaceBelow));
    }

    if (align === "right") {
      setAlignRight(true);
    } else if (align === "left") {
      setAlignRight(false);
    } else {
      // If trigger is closer to right edge of viewport, align dropdown right
      setAlignRight(window.innerWidth - rect.right < 180);
    }
  }, [placement, align]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Outside click listener to auto-close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px] rounded-xl",
    md: "px-3 py-2 text-xs rounded-xl",
    lg: "px-3.5 py-2.5 text-xs md:text-sm rounded-2xl",
  };

  return (
    <div
      ref={containerRef}
      className={`w-full ${isOpen ? "relative z-[150]" : "relative z-10"} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        disabled={disabled}
        onClick={() => {
          updatePosition();
          setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 bg-zinc-900/90 hover:bg-zinc-850 border border-white/10 hover:border-violet-500/40 text-zinc-100 font-semibold backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${
          sizeClasses[size]
        } ${isOpen ? "border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-zinc-850 ring-1 ring-violet-500/30" : ""} ${triggerClassName}`}
      >
        <span className="truncate flex items-center gap-1.5 min-w-0">
          {selectedOption?.icon && (
            <selectedOption.icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-violet-400" : ""
          }`}
        />
      </button>

      {/* Floating Animated Liquid Glass Popover */}
      {isOpen && (
        <div
          className={`absolute z-[300] p-2 rounded-2xl bg-zinc-950/98 border border-white/15 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] max-h-80 overflow-y-auto scrollbar-none min-w-full sm:min-w-[280px] md:min-w-[340px] max-w-[calc(100vw-32px)] animate-in fade-in-0 zoom-in-95 duration-150 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full ${
            openUpward
              ? "bottom-full mb-2 origin-bottom slide-in-from-bottom-2 shadow-[0_-15px_50px_rgba(0,0,0,0.9)]"
              : "top-full mt-2 origin-top slide-in-from-top-2"
          } ${alignRight ? "right-0 left-auto" : "left-0 right-auto sm:left-0"}`}
        >
          <div className="flex flex-col gap-1.5">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              const OptIcon = opt.icon;

              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all duration-150 flex items-center justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? "bg-violet-600/20 text-violet-200 border border-violet-500/40 font-bold shadow-md"
                      : "text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {OptIcon && (
                      <OptIcon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-violet-300" : "text-zinc-400"}`} />
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-semibold leading-relaxed break-words">{opt.label}</span>
                      {opt.subtitle && (
                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5 line-clamp-2 opacity-80 group-hover:opacity-100">
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-center">
                    {opt.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 whitespace-nowrap">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-violet-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
