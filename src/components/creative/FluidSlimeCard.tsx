"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface FluidSlimeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * FluidSlimeCard
 * Organic magnetic hover component that subtly tilts and creates
 * a seamless liquid-glass specular glare reacting to mouse proximity.
 */
export function FluidSlimeCard({
  children,
  className = "",
  glowColor = "rgba(139, 92, 246, 0.25)",
  ...props
}: FluidSlimeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 30, stiffness: 400, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), springConfig);
  const scale = useSpring(isHovered ? 1.015 : 1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;
    mouseX.set(xRatio);
    mouseY.set(yRatio);
    setCoords({ x: Math.round(xRatio * 100), y: Math.round(yRatio * 100) });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
    setCoords({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1000,
      }}
      className={cn(
        "group relative rounded-3xl border border-white/10 bg-[#0e1017] shadow-2xl transition-colors duration-300 hover:border-white/20 overflow-hidden",
        className
      )}
      {...(props as any)}
    >
      {/* Specular Liquid Glare highlight - seamlessly covers 100% of the card */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(600px circle at ${coords.x}% ${coords.y}%, ${glowColor}, transparent 80%)`,
        }}
      />
      {/* Direct Content Wrapper */}
      <div className="relative z-10 flex flex-col h-full w-full justify-between">
        {children}
      </div>
    </motion.div>
  );
}
