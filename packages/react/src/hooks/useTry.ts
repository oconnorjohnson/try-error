// useTry hook for React error handling with AbortController support
// TODO: Implement React hook for try-error integration

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  tryAsync,
  trySync,
  isTryError,
  TryError,
  createError,
  emitErrorCreated,
} from "@try-error/core";
import { useCleanup } from "./useCleanup";

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
  asyncFn: ((signal: AbortSignal) => Promise<T>) | (() => Promise<T>),
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

  // Use universal cleanup hook for proper memory management
  const { isMounted, addCleanup, createAbortController, nullifyRef } =
    useCleanup();

  // State management
  const [state, setState] = useState<TryState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  // Ref to track the current execution ID (handle race conditions)
  const executionIdRef = useRef(0);

  // Current AbortController ref
  const currentAbortControllerRef = useRef<AbortController | null>(null);

  // Debounce timeout ref
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Suspense promise for concurrent mode
  const suspensePromiseRef = useRef<Promise<T> | null>(null);

  // Store current values in refs to avoid stale closures
  const asyncFnRef = useRef(asyncFn);
  const resetOnExecuteRef = useRef(resetOnExecute);
  const abortMessageRef = useRef(abortMessage);
  const cacheRef = useRef(cache);
  const cacheKeyRef = useRef(cacheKey);
  const suspenseRef = useRef(suspense);

  // Update refs when values change
  asyncFnRef.current = asyncFn;
  resetOnExecuteRef.current = resetOnExecute;
  abortMessageRef.current = abortMessage;
  cacheRef.current = cache;
  cacheKeyRef.current = cacheKey;
  suspenseRef.current = suspense;

  // Register refs for cleanup
  nullifyRef(executionIdRef);
  nullifyRef(currentAbortControllerRef);
  nullifyRef(debounceTimeoutRef);
  nullifyRef(suspensePromiseRef);
  nullifyRef(asyncFnRef);
  nullifyRef(resetOnExecuteRef);
  nullifyRef(abortMessageRef);
  nullifyRef(cacheRef);
  nullifyRef(cacheKeyRef);
  nullifyRef(suspenseRef);

  // Add cleanup for debounce timeout
  addCleanup(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  });

  // Abort function to cancel current operation
  const abort = useCallback(() => {
    currentAbortControllerRef.current?.abort();
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Reset loading state when aborting
    if (isMounted()) {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    }
  }, [isMounted]);

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
  }, [debounce]);

  const executeInternal = useCallback(async () => {
    // Check if component is mounted before starting
    if (!isMounted()) return;

    // Increment execution ID to handle race conditions
    const currentExecutionId = ++executionIdRef.current;

    // Check cache first
    if (cacheRef.current && cacheKeyRef.current) {
      const cached = requestCache.get(cacheKeyRef.current);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        // 5 min cache
        // Check if still the current execution
        if (currentExecutionId !== executionIdRef.current || !isMounted()) {
          return;
        }

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
      const pending = pendingRequests.get(cacheKeyRef.current);
      if (pending) {
        try {
          const result = await pending;

          // Check if still the current execution after await
          if (currentExecutionId !== executionIdRef.current || !isMounted()) {
            return;
          }

          setState({
            data: result,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
          return;
        } catch (error) {
          // Continue with new request if pending one failed
        }
      }
    }

    // Abort any previous request
    if (currentAbortControllerRef.current) {
      currentAbortControllerRef.current.abort();
    }

    // Create new AbortController for this execution using our cleanup system
    const abortController = createAbortController();
    currentAbortControllerRef.current = abortController;

    // Check again before state update
    if (currentExecutionId !== executionIdRef.current || !isMounted()) {
      abortController.abort();
      return;
    }

    // Reset state if requested (batch state updates)
    setState((prevState) => {
      if (resetOnExecuteRef.current) {
        return {
          data: null,
          error: null,
          isLoading: true,
          isSuccess: false,
          isError: false,
        };
      } else {
        // Only update if loading state actually changed
        if (!prevState.isLoading) {
          return { ...prevState, isLoading: true };
        }
        return prevState;
      }
    });

    try {
      // Create promise for the operation
      // Handle both signal-aware and signal-unaware async functions
      const promise = tryAsync(() => {
        const fn = asyncFnRef.current;
        // Check if function expects signal parameter
        if (fn.length > 0) {
          return (fn as (signal: AbortSignal) => Promise<T>)(
            abortController.signal
          );
        } else {
          return (fn as () => Promise<T>)();
        }
      });

      // Store in pending requests if caching
      if (cacheRef.current && cacheKeyRef.current) {
        pendingRequests.set(cacheKeyRef.current, promise);
      }

      // Handle Suspense
      if (suspenseRef.current) {
        suspensePromiseRef.current = promise as Promise<T>;
      }

      const result = await promise;

      // Clean up pending request
      if (cacheRef.current && cacheKeyRef.current) {
        pendingRequests.delete(cacheKeyRef.current);
      }

      // Check if this is still the latest execution and component is mounted
      if (
        currentExecutionId !== executionIdRef.current ||
        !isMounted() ||
        abortController.signal.aborted
      ) {
        return;
      }

      if (isTryError(result)) {
        // Check if this was an abort error
        const isAbortError =
          result.cause instanceof Error &&
          (result.cause.name === "AbortError" || result.type === "ABORTED");

        if (isAbortError) {
          const abortError = createError({
            type: "ABORTED",
            message: abortMessageRef.current,
            context: {
              reason: "manual_abort",
              source: "useTry",
              hookType: "useTry",
            },
            cause: result.cause,
          });

          // Emit event for observability
          emitErrorCreated(abortError);

          // Only update state if we're still the current execution
          setState((prevState) => ({
            data: null,
            error: abortError,
            isLoading: false,
            isSuccess: false,
            isError: true,
          }));
        } else {
          // Emit event for the TryError result
          emitErrorCreated(result);

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
        if (cacheRef.current && cacheKeyRef.current) {
          requestCache.set(cacheKeyRef.current, {
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
      if (cacheRef.current && cacheKeyRef.current) {
        pendingRequests.delete(cacheKeyRef.current);
      }

      // Check if still the current execution
      if (
        currentExecutionId !== executionIdRef.current ||
        !isMounted() ||
        abortController.signal.aborted
      ) {
        return;
      }

      // Handle unexpected errors
      const unexpectedError = createError({
        type: "UNEXPECTED_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        context: {
          originalError: error,
          source: "useTry",
          hookType: "useTry",
        },
        cause: error,
      });

      // Emit event for observability
      emitErrorCreated(unexpectedError);

      setState({
        data: null,
        error: unexpectedError,
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
    }
    // Note: cleanup is now handled automatically by useCleanup hook
  }, [isMounted, createAbortController]);

  // Reset state to initial values
  const reset = useCallback(() => {
    // Abort any in-flight requests
    currentAbortControllerRef.current?.abort();

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
      if (cacheRef.current && cacheKeyRef.current) {
        requestCache.set(cacheKeyRef.current, {
          data,
          timestamp: Date.now(),
        });
      }

      if (isMounted()) {
        setState({
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });
      }
    },
    [isMounted]
  );

  // Execute immediately on mount or when deps change
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup function to abort request if deps change
    return () => {
      if (immediate) {
        currentAbortControllerRef.current?.abort();
      }
    };
  }, [immediate, execute, ...deps]);

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
