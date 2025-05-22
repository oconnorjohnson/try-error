import { useCallback, useEffect, useRef, useState } from "react";
import { tryAsync } from "../../../try-error-prototype/src";
import { UseTryOptions, UseTryResult, TryError } from "../types";

/**
 * Primary data fetching hook for try-error React integration
 *
 * Provides declarative error handling with automatic retries, caching,
 * and suspense support while maintaining type safety.
 */
export function useTry<T, E extends TryError = TryError>(
  queryFn: () => Promise<T>,
  options: UseTryOptions<T, E> = {}
): UseTryResult<T, E> {
  const {
    enabled = true,
    suspense = false,
    retry = false,
    retryDelay = 1000,
    onSuccess,
    onError,
    onSettled,
    errorBoundary = false,
    fallback,
    deps = [],
  } = options;

  // State management
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [fetchStatus, setFetchStatus] = useState<
    "idle" | "fetching" | "paused"
  >("idle");

  // Refs for stable references
  const queryFnRef = useRef(queryFn);
  const optionsRef = useRef(options);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update refs when dependencies change
  useEffect(() => {
    queryFnRef.current = queryFn;
    optionsRef.current = options;
  });

  // Calculate retry logic
  const shouldRetry = useCallback(
    (error: E, attempt: number): boolean => {
      if (typeof retry === "boolean") return retry;
      if (typeof retry === "number") return attempt < retry;
      if (typeof retry === "function") return retry(error, attempt);
      return false;
    },
    [retry]
  );

  const getRetryDelay = useCallback(
    (attempt: number): number => {
      if (typeof retryDelay === "number") return retryDelay;
      if (typeof retryDelay === "function") return retryDelay(attempt);
      return 1000;
    },
    [retryDelay]
  );

  // Core fetch function
  const fetchData = useCallback(
    async (isRefetch = false): Promise<void> => {
      if (!enabled) {
        setFetchStatus("paused");
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(!isRefetch);
        setIsValidating(isRefetch);
        setFetchStatus("fetching");
        setStatus("loading");
        setError(null);

        const result = await tryAsync(queryFnRef.current);

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (result.success) {
          setData(result.data);
          setStatus("success");
          retryCountRef.current = 0;

          onSuccess?.(result.data);
          onSettled?.(result.data, null);
        } else {
          const errorResult = result.error as E;

          // Check if we should retry
          if (shouldRetry(errorResult, retryCountRef.current + 1)) {
            retryCountRef.current += 1;
            const delay = getRetryDelay(retryCountRef.current);

            setTimeout(() => {
              if (!abortControllerRef.current?.signal.aborted) {
                fetchData(isRefetch);
              }
            }, delay);
            return;
          }

          // Handle error with fallback
          if (fallback) {
            const fallbackData = fallback(errorResult);
            setData(fallbackData);
            setStatus("success");
            onSuccess?.(fallbackData);
            onSettled?.(fallbackData, null);
          } else {
            setError(errorResult);
            setStatus("error");
            retryCountRef.current = 0;

            if (errorBoundary) {
              throw errorResult;
            }

            onError?.(errorResult);
            onSettled?.(null, errorResult);
          }
        }
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const error = err as E;
        setError(error);
        setStatus("error");
        retryCountRef.current = 0;

        if (errorBoundary) {
          throw error;
        }

        onError?.(error);
        onSettled?.(null, error);
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
          setIsValidating(false);
          setFetchStatus("idle");
        }
      }
    },
    [
      enabled,
      shouldRetry,
      getRetryDelay,
      fallback,
      errorBoundary,
      onSuccess,
      onError,
      onSettled,
    ]
  );

  // Refetch function
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  // Mutate function for optimistic updates
  const mutate = useCallback((newData: T): void => {
    setData(newData);
    setStatus("success");
    setError(null);
  }, []);

  // Reset function
  const reset = useCallback((): void => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsValidating(false);
    setStatus("idle");
    setFetchStatus("idle");
    retryCountRef.current = 0;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Effect to trigger fetch on dependency changes
  useEffect(() => {
    if (enabled) {
      fetchData();
    } else {
      reset();
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Suspense integration
  if (suspense && isLoading && !data && !error) {
    throw fetchData();
  }

  return {
    data,
    error,
    isLoading,
    isValidating,
    isStale: false, // TODO: Implement stale logic with cache
    refetch,
    mutate,
    reset,
    status,
    fetchStatus,
  };
}
