"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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

interface MenuCoords {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  openUpward: boolean;
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
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<MenuCoords>({
    left: 0,
    width: 240,
    maxHeight: 320,
    openUpward: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Intelligent collision & viewport boundary detection with Portal
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let openUpward = false;
    if (placement === "top") {
      openUpward = true;
    } else if (placement === "bottom") {
      openUpward = false;
    } else {
      // Auto: if space below is less than 260px OR (spaceAbove > spaceBelow && spaceBelow < 340px)
      openUpward = spaceBelow < 260 || (spaceAbove > spaceBelow && spaceBelow < 340);
    }

    // Dynamic width: at least trigger width, minimum 240px, maximum window - 24px
    const idealWidth = Math.max(rect.width, 240);
    const menuWidth = Math.min(idealWidth, viewportWidth - 24);

    let left = rect.left;
    if (align === "right" || (align === "auto" && viewportWidth - rect.right < 180)) {
      left = rect.right - menuWidth;
    }

    // Clamp left within viewport bounds
    left = Math.max(12, Math.min(viewportWidth - menuWidth - 12, left));

    const availableSpace = openUpward ? spaceAbove - 12 : spaceBelow - 12;
    const maxHeight = Math.min(360, Math.max(140, availableSpace));

    if (openUpward) {
      setCoords({
        bottom: viewportHeight - rect.top + 6,
        left,
        width: menuWidth,
        maxHeight,
        openUpward: true,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        width: menuWidth,
        maxHeight,
        openUpward: false,
      });
    }
  }, [placement, align]);

  // Reposition on open, resize, or scroll
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleWindowChange = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [isOpen, updatePosition]);

  // Click outside listener that handles Portal correctly
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

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
    <div ref={containerRef} className={`w-full relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        disabled={disabled}
        onClick={() => {
          updatePosition();
          setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 bg-zinc-900/90 hover:bg-zinc-850 border border-white/10 hover:border-violet-500/40 text-zinc-100 font-semibold backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${
          sizeClasses[size]
        } ${
          isOpen
            ? "border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-zinc-850 ring-1 ring-violet-500/30"
            : ""
        } ${triggerClassName}`}
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

      {/* Floating Liquid Glass Popover Rendered Via Portal to document.body */}
      {isOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.openUpward ? undefined : `${coords.top}px`,
              bottom: coords.openUpward ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 999999,
            }}
            className={`p-2 rounded-2xl bg-zinc-950/98 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-y-auto scrollbar-none animate-in fade-in-0 zoom-in-95 duration-150 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full ${
              coords.openUpward
                ? "origin-bottom slide-in-from-bottom-2 shadow-[0_-20px_60px_rgba(0,0,0,0.95)]"
                : "origin-top slide-in-from-top-2"
            }`}
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
                        ? "bg-violet-600/25 text-violet-200 border border-violet-500/40 font-bold shadow-md"
                        : "text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {OptIcon && (
                        <OptIcon
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isSelected ? "text-violet-300" : "text-zinc-400"
                          }`}
                        />
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold leading-relaxed break-words">
                          {opt.label}
                        </span>
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
                      {isSelected && <Check className="w-4 h-4 text-violet-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
