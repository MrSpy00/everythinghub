"use client";

import React, { useEffect, useRef, useState } from "react";

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
  rounded = 16,
  glow = 80,
  speed = 12,
  children,
  className,
  style,
}: NeonBorderProps) {
  const [angle, setAngle] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let last = performance.now();
    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setAngle((prev) => (prev + dt * speed * 20) % 360);
      animRef.current = requestAnimationFrame(frame);
    };
    animRef.current = requestAnimationFrame(frame);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [speed]);

  return (
    <div
      className={`relative group ${className || ""}`}
      style={{
        borderRadius: rounded,
        ...style,
      }}
    >
      {/* Outer Glow */}
      <div
        className="absolute -inset-[1px] pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-100"
        style={{
          borderRadius: rounded + 1,
          background: `conic-gradient(from ${angle}deg at 50% 50%, ${color}, #6366f1, #ec4899, transparent 65%, ${color})`,
          filter: `blur(${Math.max(4, glow * 0.1)}px)`,
        }}
      />
      {/* Inner Mask Border */}
      <div
        className="absolute inset-0 pointer-events-none p-[1.5px]"
        style={{
          borderRadius: rounded,
          background: `conic-gradient(from ${angle}deg at 50% 50%, ${color}, #6366f1, #ec4899, transparent 65%, ${color})`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div
        className="relative z-10 w-full h-full"
        style={{ borderRadius: rounded }}
      >
        {children}
      </div>
    </div>
  );
}
