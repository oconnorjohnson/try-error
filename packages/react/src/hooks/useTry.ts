// useTry hook for React error handling with AbortController support
// TODO: Implement React hook for try-error integration

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  tryAsync,
  trySync,
  isTryError,
  TryError,
  createError,
} from "try-error";

// State interface for try operations
export interface TryState<T> {
  data: T | null;
  error: TryError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// Options for useTry hook
export interface UseTryOptions {
  // Execute immediately on mount
  immediate?: boolean;
  // Reset state before each execution
  resetOnExecute?: boolean;
  // Dependencies to watch for re-execution
  deps?: React.DependencyList;
  // Custom abort message
  abortMessage?: string;
  // Enable caching of results
  cache?: boolean;
  // Cache key for deduplication
  cacheKey?: string;
  // Debounce delay in ms
  debounce?: number;
  // Enable Suspense support
  suspense?: boolean;
}

// Return type for useTry hook
export interface UseTryReturn<T> extends TryState<T> {
  execute: () => Promise<void>;
  reset: () => void;
  mutate: (data: T) => void;
  abort: () => void;
}

// Global cache for request deduplication
const requestCache = new Map<string, { data: any; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();

/**
 * React hook for managing try-error async operations with state
 * Now includes AbortController support for proper cleanup
 *
 * @example
 * ```tsx
 * const { data, error, isLoading, execute, abort } = useTry(
 *   async (signal) => {
 *     const response = await fetch(`/api/users/${userId}`, { signal });
 *     if (!response.ok) throw new Error('Failed to fetch');
 *     return response.json();
 *   },
 *   { immediate: true, deps: [userId] }
 * );
 *
 * // Cleanup on unmount or when userId changes
 * useEffect(() => {
 *   return () => abort();
 * }, [userId]);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>User: {data?.name}</div>;
 * ```
 */
export function useTry<T>(
  asyncFn: (signal: AbortSignal) => Promise<T>,
  options: UseTryOptions = {}
): UseTryReturn<T> {
  const {
    immediate = false,
    resetOnExecute = true,
    deps = [],
    abortMessage = "Operation aborted",
    cache = false,
    cacheKey,
    debounce,
    suspense = false,
  } = options;

  // State management
  const [state, setState] = useState<TryState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  // Ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true);

  // Ref to track the current execution ID (handle race conditions)
  const executionIdRef = useRef(0);

  // AbortController ref for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce timeout ref
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup old abort controllers
  const cleanupAbortControllers = useRef(new Set<AbortController>());

  // Suspense promise for concurrent mode
  const suspensePromiseRef = useRef<Promise<T> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Abort any in-flight requests
      abortControllerRef.current?.abort();
      // Clear any pending debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Cleanup all abort controllers
      cleanupAbortControllers.current.forEach((controller) =>
        controller.abort()
      );
      cleanupAbortControllers.current.clear();
    };
  }, []);

  // Abort function to cancel current operation
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  // Execute the async function
  const execute = useCallback(async () => {
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Handle debouncing
    if (debounce && debounce > 0) {
      return new Promise<void>((resolve) => {
        debounceTimeoutRef.current = setTimeout(() => {
          executeInternal().then(resolve);
        }, debounce);
      });
    }

    return executeInternal();
  }, [asyncFn, resetOnExecute, abortMessage, cache, cacheKey, debounce]);

  const executeInternal = useCallback(async () => {
    if (!isMountedRef.current) return;

    // Check cache first
    if (cache && cacheKey) {
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        // 5 min cache
        setState({
          data: cached.data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });
        return;
      }

      // Check if there's already a pending request for this key
      const pending = pendingRequests.get(cacheKey);
      if (pending) {
        try {
          const result = await pending;
          if (isMountedRef.current) {
            setState({
              data: result,
              error: null,
              isLoading: false,
              isSuccess: true,
              isError: false,
            });
          }
          return;
        } catch (error) {
          // Continue with new request if pending one failed
        }
      }
    }

    // Increment execution ID to handle race conditions
    const currentExecutionId = ++executionIdRef.current;

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      cleanupAbortControllers.current.add(abortControllerRef.current);
    }

    // Create new AbortController for this execution
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Reset state if requested
    if (resetOnExecute) {
      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: true }));
    }

    try {
      // Create promise for the operation
      const promise = tryAsync(() => asyncFn(abortController.signal));

      // Store in pending requests if caching
      if (cache && cacheKey) {
        pendingRequests.set(cacheKey, promise);
      }

      // Handle Suspense
      if (suspense) {
        suspensePromiseRef.current = promise as Promise<T>;
      }

      const result = await promise;

      // Clean up pending request
      if (cache && cacheKey) {
        pendingRequests.delete(cacheKey);
      }

      // Check if this is still the latest execution and component is mounted
      if (
        !isMountedRef.current ||
        currentExecutionId !== executionIdRef.current ||
        abortController.signal.aborted
      ) {
        return;
      }

      if (isTryError(result)) {
        // Check if this was an abort error
        if (
          result.cause instanceof Error &&
          result.cause.name === "AbortError"
        ) {
          setState({
            data: null,
            error: createError({
              type: "ABORTED",
              message: abortMessage,
              context: { reason: "manual_abort" },
              cause: result.cause,
            }),
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        } else {
          setState({
            data: null,
            error: result,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }
      } else {
        // Cache successful result
        if (cache && cacheKey) {
          requestCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }

        setState({
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });
      }
    } catch (error) {
      // Clean up pending request
      if (cache && cacheKey) {
        pendingRequests.delete(cacheKey);
      }

      // This shouldn't happen with tryAsync, but just in case
      if (
        !isMountedRef.current ||
        currentExecutionId !== executionIdRef.current ||
        abortController.signal.aborted
      ) {
        return;
      }

      setState({
        data: null,
        error: createError({
          type: "UNEXPECTED_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          context: { originalError: error },
          cause: error,
        }),
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
    } finally {
      // Clean up old abort controllers
      if (cleanupAbortControllers.current.size > 10) {
        const controllers = Array.from(cleanupAbortControllers.current);
        controllers.slice(0, 5).forEach((controller) => {
          cleanupAbortControllers.current.delete(controller);
        });
      }
    }
  }, [asyncFn, resetOnExecute, abortMessage, cache, cacheKey]);

  // Reset state to initial values
  const reset = useCallback(() => {
    // Abort any in-flight requests
    abortControllerRef.current?.abort();

    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  // Manually set data (useful for optimistic updates)
  const mutate = useCallback(
    (data: T) => {
      // Update cache if enabled
      if (cache && cacheKey) {
        requestCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
    },
    [cache, cacheKey]
  );

  // Memoized execute function that includes deps
  const memoizedExecute = useMemo(
    () => execute,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [execute, ...deps]
  );

  // Execute immediately on mount or when deps change
  useEffect(() => {
    if (immediate) {
      memoizedExecute();
    }

    // Cleanup function to abort request if deps change
    return () => {
      if (immediate) {
        abortControllerRef.current?.abort();
      }
    };
  }, [immediate, memoizedExecute]);

  // Support for Suspense
  if (suspense && state.isLoading && suspensePromiseRef.current) {
    throw suspensePromiseRef.current;
  }

  return {
    ...state,
    execute,
    reset,
    mutate,
    abort,
  };
}

/**
 * Simplified version of useTry for synchronous operations
 *
 * @example
 * ```tsx
 * const { data, error, execute } = useTrySync(() => parseJSON(input));
 * ```
 */
export function useTrySync<T>(
  syncFn: () => T,
  options: Omit<UseTryOptions, "immediate"> = {}
): Omit<UseTryReturn<T>, "execute" | "abort"> & { execute: () => void } {
  const { resetOnExecute = true, deps = [] } = options;

  const [state, setState] = useState<TryState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(() => {
    if (resetOnExecute) {
      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });
    }

    const result = trySync(syncFn);

    if (isTryError(result)) {
      setState({
        data: null,
        error: result,
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
    } else {
      setState({
        data: result,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
    }
  }, [syncFn, resetOnExecute, ...deps]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const mutate = useCallback((data: T) => {
    setState({
      data,
      error: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    mutate,
  };
}
