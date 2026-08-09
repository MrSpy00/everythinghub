"use client";

import { useEffect } from "react";

/**
 * Global provider that ensures all horizontal scrolling elements across the entire site
 * automatically convert vertical mouse wheel into horizontal scroll and completely lock
 * page vertical scroll as long as the mouse cursor is within the scrollable container,
 * even when the container is at its leftmost or rightmost boundary.
 */
export function GlobalHorizontalScrollProvider() {
  useEffect(() => {
    const findHorizontalScrollContainer = (startElement: HTMLElement | null): HTMLElement | null => {
      let curr = startElement;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (curr.hasAttribute("data-horizontal-scroll")) {
          return curr;
        }

        const style = window.getComputedStyle(curr);
        const isXScrollable = style.overflowX === "auto" || style.overflowX === "scroll";
        const isYScrollable = style.overflowY === "auto" || style.overflowY === "scroll";

        // If it has horizontal overflow and is not primarily a vertical scrolling container
        if (isXScrollable && curr.scrollWidth > curr.clientWidth + 1) {
          if (!isYScrollable || curr.scrollHeight <= curr.clientHeight + 4) {
            return curr;
          }
        }

        curr = curr.parentElement;
      }
      return null;
    };

    const handleGlobalWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const container = findHorizontalScrollContainer(target);
      if (container) {
        // Unconditionally prevent page vertical scroll while cursor is within the horizontal scroll container
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        container.scrollLeft += delta;
      }
    };

    window.addEventListener("wheel", handleGlobalWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleGlobalWheel);
  }, []);

  return null;
}
