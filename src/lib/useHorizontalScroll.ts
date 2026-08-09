import { useEffect, useRef } from "react";

/**
 * Hook to enable smooth horizontal scrolling via mouse wheel (vertical delta)
 * and prevent the main page/window from scrolling vertically while the container is scrolling.
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const elRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If deltaY is 0 (already horizontal scroll or touchpad horizontal gesture), let browser handle it
      if (e.deltaY === 0) return;

      const hasHorizontalScroll = el.scrollWidth > el.clientWidth;
      if (!hasHorizontalScroll) return;

      const isScrollingLeft = e.deltaY < 0;
      const isScrollingRight = e.deltaY > 0;
      const canScrollLeft = el.scrollLeft > 0;
      const canScrollRight = Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 1;

      if ((isScrollingLeft && canScrollLeft) || (isScrollingRight && canScrollRight)) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return elRef;
}
