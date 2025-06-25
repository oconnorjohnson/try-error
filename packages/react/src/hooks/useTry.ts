// useTry hook for React error handling with AbortController support
// TODO: Implement React hook for try-error integration

import { useCallback, useEffect, useRef, useState } from "react";
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
}

// Return type for useTry hook
export interface UseTryReturn<T> extends TryState<T> {
  execute: () => Promise<void>;
  reset: () => void;
  mutate: (data: T) => void;
  abort: () => void;
}

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Abort any in-flight requests
      abortControllerRef.current?.abort();
    };
  }, []);

  // Abort function to cancel current operation
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Execute the async function
  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    // Abort any previous request
    abortControllerRef.current?.abort();

    // Create new AbortController for this execution
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Increment execution ID to handle race conditions
    const currentExecutionId = ++executionIdRef.current;

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
      const result = await tryAsync(() => asyncFn(abortController.signal));

      // Check if this is still the latest execution and component is mounted
      if (
        !isMountedRef.current ||
        currentExecutionId !== executionIdRef.current ||
        abortController.signal.aborted
      ) {
        return;
      }

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
    } catch (error) {
      // Check if this was an abort
      if (error instanceof Error && error.name === "AbortError") {
        // Only update state if this is still the current execution
        if (
          isMountedRef.current &&
          currentExecutionId === executionIdRef.current
        ) {
          setState({
            data: null,
            error: createError({
              type: "ABORTED",
              message: abortMessage,
              context: { reason: "manual_abort" },
            }),
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }
        return;
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
    }
  }, [asyncFn, resetOnExecute, abortMessage]);

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
  const mutate = useCallback((data: T) => {
    setState({
      data,
      error: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
    });
  }, []);

  // Execute immediately on mount or when deps change
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup function to abort request if deps change
    return () => {
      if (immediate) {
        abortControllerRef.current?.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]); // Intentionally omit execute to avoid infinite loop

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
