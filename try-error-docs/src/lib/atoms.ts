import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import {
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";

// Atom to persist sidebar scroll position
export const sidebarScrollAtom = atomWithStorage("sidebar-scroll-position", 0);

// Custom hook for optimized scroll state management
export function useSidebarScroll() {
  const [scrollPosition, setScrollPosition] = useAtom(sidebarScrollAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const [isScrollReady, setIsScrollReady] = useState(false);

  // Immediate scroll restoration using layoutEffect
  useLayoutEffect(() => {
    if (
      scrollContainerRef.current &&
      !isRestoringRef.current &&
      !hasRestoredRef.current
    ) {
      isRestoringRef.current = true;

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollPosition;
          hasRestoredRef.current = true;
          setIsScrollReady(true); // Mark as ready after restoration

          // Reset restoring flag after a short delay
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
        }
      });
    } else if (scrollPosition === 0) {
      // If no scroll position to restore, mark as ready immediately
      setIsScrollReady(true);
    }
  }, [scrollPosition]);

  // Additional effect to handle route changes and ensure restoration
  useEffect(() => {
    // Reset the restoration flag when the component mounts or route changes
    hasRestoredRef.current = false;
    setIsScrollReady(false); // Reset ready state on route change

    // Attempt restoration after a short delay to handle route transitions
    const restoreTimeout = setTimeout(() => {
      if (
        scrollContainerRef.current &&
        scrollPosition > 0 &&
        !hasRestoredRef.current
      ) {
        isRestoringRef.current = true;
        scrollContainerRef.current.scrollTop = scrollPosition;
        hasRestoredRef.current = true;
        setIsScrollReady(true);

        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      } else if (scrollPosition === 0) {
        // If no scroll position to restore, mark as ready
        setIsScrollReady(true);
      }
    }, 50);

    return () => {
      clearTimeout(restoreTimeout);
    };
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
      }, 150); // Slightly longer throttle to be more conservative
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
    isScrollReady,
  };
}
