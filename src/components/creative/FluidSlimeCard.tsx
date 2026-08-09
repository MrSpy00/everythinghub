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
 * Organic magnetic hover component that subtly distorts, attracts, and creates
 * a liquid-glass slime refraction effect reacting to mouse proximity.
 */
export function FluidSlimeCard({
  children,
  className = "",
  glowColor = "rgba(139, 92, 246, 0.25)",
  ...props
}: FluidSlimeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), springConfig);
  const scale = useSpring(isHovered ? 1.025 : 1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
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
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "group relative rounded-3xl border border-white/10 bg-[#0d0e12]/90 backdrop-blur-3xl transition-colors duration-300 hover:border-indigo-500/40 shadow-2xl",
        className
      )}
      {...(props as any)}
    >
      {/* Specular Liquid Glare highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
