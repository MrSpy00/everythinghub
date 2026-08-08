"use client";

import React from "react";

interface NeonBorderProps {
  color?: string;
  rounded?: number;
  glow?: number;
  speed?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function NeonBorder({
  color = "#a855f7",
  rounded = 22,
  glow = 60,
  speed = 7,
  children,
  className,
  style,
}: NeonBorderProps) {
  return (
    <div
      className={`relative group ${className || ""}`}
      style={{
        borderRadius: rounded,
        ...style,
      }}
    >
      {/* Outer Atmospheric Specular Glow - Enhanced Brightness & Diffusion */}
      <div
        className="absolute -inset-[3px] pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-100 overflow-hidden"
        style={{
          borderRadius: rounded + 3,
        }}
      >
        <div
          className="absolute inset-[-150%] animate-[spin_5.5s_linear_infinite] opacity-90 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, rgba(168,85,247,1), rgba(99,102,241,1), rgba(16,185,129,0.9), rgba(236,72,153,0.9), rgba(168,85,247,1))`,
            filter: `blur(${Math.max(14, glow * 0.4)}px)`,
            willChange: "transform",
          }}
        />
      </div>

      {/* Inner Mask Border - Razor-Sharp Specular Neon Contour */}
      <div
        className="absolute inset-0 pointer-events-none p-[1.8px] overflow-hidden"
        style={{
          borderRadius: rounded,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        <div
          className="absolute inset-[-150%] animate-[spin_5.5s_linear_infinite] opacity-100 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, rgba(168,85,247,1), rgba(99,102,241,1), rgba(16,185,129,0.95), rgba(236,72,153,0.95), rgba(168,85,247,1))`,
            willChange: "transform",
          }}
        />
      </div>

      {/* Inner Container */}
      <div
        className="relative z-10 w-full h-full"
        style={{ borderRadius: rounded }}
      >
        {children}
      </div>
    </div>
  );
}
