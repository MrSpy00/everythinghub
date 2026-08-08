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
  glow = 50,
  speed = 8,
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
      {/* Outer Ambient Diffused Neon Glow - GPU Accelerated Conic Sweep */}
      <div
        className="absolute -inset-[2px] pointer-events-none transition-opacity duration-500 opacity-40 group-hover:opacity-85 overflow-hidden"
        style={{
          borderRadius: rounded + 2,
        }}
      >
        <div
          className="absolute inset-[-150%] animate-[spin_6s_linear_infinite] opacity-80 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, rgba(168,85,247,0.85), rgba(99,102,241,0.85), rgba(16,185,129,0.75), rgba(236,72,153,0.75), rgba(168,85,247,0.85))`,
            filter: `blur(${Math.max(12, glow * 0.3)}px)`,
            willChange: "transform",
          }}
        />
      </div>

      {/* Inner Precision Neon Mask Border */}
      <div
        className="absolute inset-0 pointer-events-none p-[1.5px] overflow-hidden"
        style={{
          borderRadius: rounded,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        <div
          className="absolute inset-[-150%] animate-[spin_6s_linear_infinite] opacity-90 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, rgba(168,85,247,0.9), rgba(99,102,241,0.9), rgba(16,185,129,0.8), rgba(236,72,153,0.8), rgba(168,85,247,0.9))`,
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
