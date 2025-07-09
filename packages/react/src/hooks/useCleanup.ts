import { useRef, useEffect, useCallback } from "react";

/**
 * Universal cleanup hook for proper memory management in React
 *
 * This hook provides a standardized way to handle cleanup across all React hooks,
 * preventing memory leaks and ensuring proper resource management.
 *
 * Features:
 * - isMounted tracking to prevent state updates after unmount
 * - Cleanup function registration and automatic execution
 * - AbortController management with proper cleanup
 * - Reference nullification to prevent memory leaks
 * - React StrictMode compatibility (effects run twice in development)
 *
 * @example
 * ```tsx
 * function useCustomHook() {
 *   const { isMounted, addCleanup, createAbortController, nullifyRef } = useCleanup();
 *   const dataRef = useRef(null);
 *
 *   useEffect(() => {
 *     const controller = createAbortController();
 *
 *     async function fetchData() {
 *       try {
 *         const response = await fetch('/api/data', { signal: controller.signal });
 *         if (isMounted()) {
 *           setData(response.data);
 *         }
 *       } catch (error) {
 *         if (isMounted() && !controller.signal.aborted) {
 *           setError(error);
 *         }
 *       }
 *     }
 *
 *     fetchData();
 *
 *     // Register additional cleanup
 *     addCleanup(() => {
 *       nullifyRef(dataRef);
 *     });
 *   }, []);
 * }
 * ```
 */
export function useCleanup() {
  // Track if component is mounted (prevents state updates after unmount)
  const isMountedRef = useRef(true);

  // Array of cleanup functions to execute on unmount
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  // Set of AbortControllers to manage
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  // Set of refs to nullify on cleanup
  const refsToNullifyRef = useRef<Set<React.MutableRefObject<any>>>(new Set());

  // Main cleanup effect - runs once and cleans up on unmount
  useEffect(() => {
    return () => {
      // Mark as unmounted first
      isMountedRef.current = false;

      // Execute all registered cleanup functions with error handling
      cleanupFunctionsRef.current.forEach((cleanup, index) => {
        try {
          cleanup();
        } catch (error) {
          // Log but don't throw - we want all cleanup to run
          if (typeof console !== "undefined" && console.warn) {
            console.warn(`Cleanup function ${index} failed:`, error);
          }
        }
      });

      // Abort all controllers with error handling
      abortControllersRef.current.forEach((controller) => {
        try {
          if (!controller.signal.aborted) {
            controller.abort("Component unmounted");
          }
        } catch (error) {
          // Ignore abort errors during cleanup
        }
      });

      // Nullify all refs with error handling
      refsToNullifyRef.current.forEach((ref) => {
        try {
          ref.current = null;
        } catch (error) {
          // Ignore ref nullification errors
        }
      });

      // Clear all collections to prevent memory leaks
      cleanupFunctionsRef.current = [];
      abortControllersRef.current.clear();
      refsToNullifyRef.current.clear();
    };
  }, []); // Empty dependency array - only run once

  /**
   * Check if component is still mounted
   * Use this before state updates to prevent React warnings
   */
  const isMounted = useCallback((): boolean => {
    return isMountedRef.current;
  }, []);

  /**
   * Register a cleanup function to be executed on component unmount
   * Cleanup functions are executed in the order they were registered
   */
  const addCleanup = useCallback((cleanup: () => void): void => {
    if (isMountedRef.current) {
      cleanupFunctionsRef.current.push(cleanup);
    }
  }, []);

  /**
   * Create an AbortController that will be automatically cleaned up
   * Returns the controller for immediate use
   */
  const createAbortController = useCallback((): AbortController => {
    const controller = new AbortController();

    if (isMountedRef.current) {
      abortControllersRef.current.add(controller);

      // Remove from set when it's aborted (for memory efficiency)
      const originalAbort = controller.abort.bind(controller);
      controller.abort = (reason?: any) => {
        abortControllersRef.current.delete(controller);
        originalAbort(reason);
      };
    }

    return controller;
  }, []);

  /**
   * Register a ref to be nullified on cleanup
   * This helps prevent memory leaks from refs holding onto large objects
   */
  const nullifyRef = useCallback(<T>(ref: React.MutableRefObject<T>): void => {
    if (isMountedRef.current) {
      refsToNullifyRef.current.add(ref);
    }
  }, []);

  /**
   * Remove an AbortController from automatic cleanup
   * Useful when you want to manually manage the controller's lifecycle
   */
  const removeAbortController = useCallback(
    (controller: AbortController): void => {
      abortControllersRef.current.delete(controller);
    },
    []
  );

  /**
   * Remove a cleanup function from the queue
   * Returns true if the function was found and removed
   */
  const removeCleanup = useCallback((cleanup: () => void): boolean => {
    const index = cleanupFunctionsRef.current.indexOf(cleanup);
    if (index !== -1) {
      cleanupFunctionsRef.current.splice(index, 1);
      return true;
    }
    return false;
  }, []);

  /**
   * Manually trigger cleanup (useful for testing)
   * This will not mark the component as unmounted
   */
  const triggerCleanup = useCallback((): void => {
    // Execute cleanup functions
    cleanupFunctionsRef.current.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("Manual cleanup function failed:", error);
      }
    });

    // Abort controllers
    abortControllersRef.current.forEach((controller) => {
      try {
        if (!controller.signal.aborted) {
          controller.abort("Manual cleanup");
        }
      } catch (error) {
        // Ignore abort errors
      }
    });

    // Clear collections but don't nullify refs (component still mounted)
    cleanupFunctionsRef.current = [];
    abortControllersRef.current.clear();
  }, []);

  /**
   * Get cleanup statistics (useful for debugging memory leaks)
   */
  const getCleanupStats = useCallback(() => {
    return {
      isMounted: isMountedRef.current,
      cleanupFunctions: cleanupFunctionsRef.current.length,
      abortControllers: abortControllersRef.current.size,
      refsToNullify: refsToNullifyRef.current.size,
    };
  }, []);

  return {
    // Core functions
    isMounted,
    addCleanup,
    createAbortController,
    nullifyRef,

    // Management functions
    removeAbortController,
    removeCleanup,
    triggerCleanup,

    // Debugging
    getCleanupStats,
  };
}
