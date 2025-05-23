import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { useLayoutEffect, useRef, useCallback } from "react";

// Atom to persist sidebar scroll position
export const sidebarScrollAtom = atomWithStorage("sidebar-scroll-position", 0);

// Custom hook for optimized scroll state management
export function useSidebarScroll() {
  const [scrollPosition, setScrollPosition] = useAtom(sidebarScrollAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringRef = useRef(false);

  // Immediate scroll restoration
  useLayoutEffect(() => {
    if (scrollContainerRef.current && !isRestoringRef.current) {
      isRestoringRef.current = true;
      scrollContainerRef.current.scrollTop = scrollPosition;
      // Reset flag after a short delay
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 50);
    }
  }, [scrollPosition]);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      // Don't save scroll position if we're currently restoring
      if (isRestoringRef.current) return;

      const scrollTop = event.currentTarget.scrollTop;

      // Throttle scroll updates to avoid excessive localStorage writes
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setScrollPosition(scrollTop);
      }, 100);
    },
    [setScrollPosition]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  return {
    scrollContainerRef,
    handleScroll,
    cleanup,
    scrollPosition,
  };
}
