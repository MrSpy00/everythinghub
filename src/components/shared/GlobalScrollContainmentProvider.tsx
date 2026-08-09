"use client";

import { useEffect } from "react";

/**
 * Universal Global Scroll Containment & Boundary Lock Provider
 * 
 * Guarantees that whenever the mouse cursor is over ANY scrollable element
 * (horizontal bars, vertical lists, dropdown menus, code boxes, textareas, dialogs, etc.),
 * the wheel event is strictly contained within that element.
 * 
 * The main webpage/window will NEVER scroll while the pointer is over any scrollable element,
 * even when the container hits its top, bottom, left, or right edges (zero scroll chaining).
 * The webpage only scrolls when the cursor is over regular non-scrollable page content.
 */
export function GlobalScrollContainmentProvider() {
  useEffect(() => {
    // Check if an element is scrollable either horizontally or vertically
    const checkScrollable = (el: HTMLElement): { isX: boolean; isY: boolean } => {
      if (!el || el === document.body || el === document.documentElement) {
        return { isX: false, isY: false };
      }

      // Check explicit data attributes first
      const hasHorizontalAttr = el.hasAttribute("data-horizontal-scroll");
      const hasDropdownAttr = el.hasAttribute("data-dropdown-menu");
      const hasScrollContainerAttr = el.hasAttribute("data-scroll-container");

      const style = window.getComputedStyle(el);
      const overflowX = style.overflowX;
      const overflowY = style.overflowY;

      const isXStyle = overflowX === "auto" || overflowX === "scroll";
      const isYStyle = overflowY === "auto" || overflowY === "scroll";

      const canScrollX = (isXStyle || hasHorizontalAttr || hasScrollContainerAttr) && el.scrollWidth > el.clientWidth + 1;
      const canScrollY = (isYStyle || hasDropdownAttr || hasScrollContainerAttr || el.tagName === "TEXTAREA") && el.scrollHeight > el.clientHeight + 1;

      return { isX: canScrollX, isY: canScrollY };
    };

    // Find closest scrollable container under the pointer
    const findScrollableAncestor = (
      startElement: HTMLElement | null
    ): { el: HTMLElement; isX: boolean; isY: boolean } | null => {
      let curr = startElement;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        const res = checkScrollable(curr);
        if (res.isX || res.isY) {
          return { el: curr, isX: res.isX, isY: res.isY };
        }
        curr = curr.parentElement;
      }
      return null;
    };

    const handleGlobalWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const found = findScrollableAncestor(target);
      if (!found) {
        // Pointer is on the main page background/content, allow natural window scrolling
        return;
      }

      const { el, isX, isY } = found;

      // Pointer is over a scrollable element: UNCONDITIONALLY lock the page from scrolling
      e.preventDefault();
      e.stopPropagation();

      const deltaY = e.deltaY;
      const deltaX = e.deltaX;

      if (isY && !isX) {
        // Purely vertical container (Dropdown menu, list, textarea, modal content)
        el.scrollTop += deltaY;
      } else if (isX && !isY) {
        // Purely horizontal container (Tabs, weather hourly forecast, tables, badges)
        const delta = deltaY !== 0 ? deltaY : deltaX;
        el.scrollLeft += delta;
      } else if (isX && isY) {
        // Both X and Y scrollable container (2D grid/table/canvas)
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          el.scrollLeft += deltaX;
        } else {
          el.scrollTop += deltaY;
        }
      }
    };

    // Attach capture-phase listener to intercept before standard browser scroll chaining
    window.addEventListener("wheel", handleGlobalWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleGlobalWheel, { capture: true });
  }, []);

  return null;
}
