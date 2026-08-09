"use client";

import React, { ReactNode, HTMLAttributes } from "react";
import { useHorizontalScroll } from "@/lib/useHorizontalScroll";
import { cn } from "@/lib/utils";

interface HorizontalScrollContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function HorizontalScrollContainer({
  children,
  className,
  ...props
}: HorizontalScrollContainerProps) {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      data-horizontal-scroll="true"
      className={cn("overflow-x-auto overscroll-contain select-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
