import { useEffect, useRef } from "react";

/**
 * Hook to enable smooth horizontal scrolling via mouse wheel (vertical delta)
 * and strictly prevent the main page/window from scrolling vertically while the cursor
 * is within the container, even if the container reaches its boundary edges.
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const elRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const hasHorizontalScroll = el.scrollWidth > el.clientWidth;
      if (!hasHorizontalScroll) return;

      // Always prevent global vertical scroll while the mouse is over this container
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      el.scrollLeft += delta;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return elRef;
}
