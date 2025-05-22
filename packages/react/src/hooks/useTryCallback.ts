import { useCallback, useState } from "react";
import { tryAsync } from "../../../try-error-prototype/src";
import {
  UseTryCallbackOptions,
  UseTryCallbackResult,
  TryError,
  TryResult,
} from "../types";

/**
 * Hook for handling actions and mutations with try-error
 *
 * Provides declarative error handling for user actions like form submissions,
 * API calls, and other async operations with optimistic updates support.
 */
export function useTryCallback<
  T,
  E extends TryError = TryError,
  Args extends any[] = []
>(
  fn: (...args: Args) => Promise<T>,
  options: UseTryCallbackOptions<T, E> = {}
): UseTryCallbackResult<T, E, Args> {
  const {
    onSuccess,
    onError,
    onSettled,
    optimisticUpdate,
    rollback,
    throwOnError = false,
    errorBoundary = false,
  } = options;

  // State management
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Execute function
  const execute = useCallback(
    async (...args: Args): Promise<TryResult<T, E>> => {
      try {
        setIsLoading(true);
        setStatus("loading");
        setError(null);

        // Apply optimistic update if provided
        if (optimisticUpdate) {
          optimisticUpdate(args);
        }

        const result = await tryAsync(() => fn(...args));

        if (result.success) {
          setData(result.data);
          setStatus("success");

          onSuccess?.(result.data);
          onSettled?.(result.data, null);

          return result;
        } else {
          const errorResult = result.error as E;

          // Rollback optimistic update on error
          if (rollback) {
            rollback(args);
          }

          setError(errorResult);
          setStatus("error");

          if (errorBoundary) {
            throw errorResult;
          }

          if (throwOnError) {
            throw errorResult;
          }

          onError?.(errorResult);
          onSettled?.(null, errorResult);

          return result;
        }
      } catch (err) {
        const error = err as E;

        // Rollback optimistic update on error
        if (rollback) {
          rollback(args);
        }

        setError(error);
        setStatus("error");

        if (errorBoundary) {
          throw error;
        }

        if (throwOnError) {
          throw error;
        }

        onError?.(error);
        onSettled?.(null, error);

        // Return error result
        return { success: false, error } as TryResult<T, E>;
      } finally {
        setIsLoading(false);
      }
    },
    [
      fn,
      onSuccess,
      onError,
      onSettled,
      optimisticUpdate,
      rollback,
      throwOnError,
      errorBoundary,
    ]
  );

  // Reset function
  const reset = useCallback((): void => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setStatus("idle");
  }, []);

  return {
    execute,
    data,
    error,
    isLoading,
    reset,
    status,
  };
}
