// useTry hook for React error handling
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
}

// Return type for useTry hook
export interface UseTryReturn<T> extends TryState<T> {
  execute: () => Promise<void>;
  reset: () => void;
  mutate: (data: T) => void;
}

/**
 * React hook for managing try-error async operations with state
 *
 * @example
 * ```tsx
 * const { data, error, isLoading, execute } = useTry(
 *   () => fetchUser(userId),
 *   { immediate: true, deps: [userId] }
 * );
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>User: {data?.name}</div>;
 * ```
 */
export function useTry<T>(
  asyncFn: () => Promise<T>,
  options: UseTryOptions = {}
): UseTryReturn<T> {
  const { immediate = false, resetOnExecute = true, deps = [] } = options;

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Execute the async function
  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

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
      const result = await tryAsync(asyncFn);

      if (!isMountedRef.current) return;

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
      // This shouldn't happen with tryAsync, but just in case
      if (!isMountedRef.current) return;

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
  }, [asyncFn, resetOnExecute]);

  // Reset state to initial values
  const reset = useCallback(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]); // Intentionally omit execute to avoid infinite loop

  return {
    ...state,
    execute,
    reset,
    mutate,
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
): Omit<UseTryReturn<T>, "execute"> & { execute: () => void } {
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
