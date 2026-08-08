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
  color = "#8b5cf6",
  rounded = 20,
  glow = 40,
  speed = 10,
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
      {/* Outer Ambient Soft Glow - Hardware Accelerated Pure CSS Animation */}
      <div
        className="absolute -inset-[1px] pointer-events-none transition-opacity duration-500 opacity-30 group-hover:opacity-60 overflow-hidden"
        style={{
          borderRadius: rounded + 1,
        }}
      >
        <div
          className="absolute inset-[-150%] animate-[spin_8s_linear_infinite] opacity-75 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, rgba(139,92,246,0.6), rgba(99,102,241,0.6), rgba(16,185,129,0.5), transparent 65%, rgba(139,92,246,0.6))`,
            filter: `blur(${Math.max(10, glow * 0.25)}px)`,
            willChange: "transform",
          }}
        />
      </div>

      {/* Inner Mask Border - Pure GPU Rotation */}
      <div
        className="absolute inset-0 pointer-events-none p-[1px] overflow-hidden"
        style={{
          borderRadius: rounded,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        <div
          className="absolute inset-[-150%] animate-[spin_8s_linear_infinite] opacity-80 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, rgba(139,92,246,0.7), rgba(99,102,241,0.7), rgba(16,185,129,0.6), transparent 60%, rgba(139,92,246,0.7))`,
            willChange: "transform",
          }}
        />
      </div>

      {/* Inner Interactive Content Container */}
      <div
        className="relative z-10 w-full h-full"
        style={{ borderRadius: rounded }}
      >
        {children}
      </div>
    </div>
  );
}
