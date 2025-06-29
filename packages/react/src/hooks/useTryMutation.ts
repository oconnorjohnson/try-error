import { useState, useCallback, useRef, useEffect } from "react";
import {
  tryAsync,
  TryResult,
  TryError,
  isTryError,
  createError,
} from "try-error";

export interface UseTryMutationOptions<T, TVariables = void> {
  onSuccess?: (data: T, variables: TVariables) => void;
  onError?: (error: TryError, variables: TVariables) => void;
  onSettled?: (
    data: T | null,
    error: TryError | null,
    variables: TVariables
  ) => void;
  abortMessage?: string;
  // Optimistic update support
  optimisticData?: T | ((variables: TVariables, currentData: T | null) => T);
  // Rollback function for failed optimistic updates
  rollbackOnError?: (
    error: TryError,
    variables: TVariables,
    previousData: T | null
  ) => void;
  // Whether to retry on error
  retry?:
    | boolean
    | number
    | ((failureCount: number, error: TryError) => boolean);
  // Retry delay in milliseconds
  retryDelay?: number | ((failureCount: number) => number);
  // Cache time in milliseconds
  cacheTime?: number;
  // Whether to invalidate cache on success
  invalidateOnSuccess?: boolean;
}

export interface UseTryMutationResult<T, TVariables> {
  data: T | null;
  error: TryError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  failureCount: number;
  mutate: (variables: TVariables) => Promise<TryResult<T, TryError>>;
  mutateAsync: (variables: TVariables) => Promise<TryResult<T, TryError>>;
  reset: () => void;
  abort: () => void;
  // New methods for optimistic updates
  setData: (data: T | ((prev: T | null) => T) | null) => void;
  invalidate: () => void;
}

// Mutation queue for managing multiple mutations
interface QueuedMutation<TVariables> {
  variables: TVariables;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

// Cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global mutation cache
const mutationCache = new Map<string, CacheEntry<any>>();

/**
 * Hook for handling mutations with try-error integration and enhanced optimistic updates
 *
 * Similar to React Query's useMutation but with try-error patterns
 *
 * @example
 * ```tsx
 * const { mutate, isLoading, error, abort } = useTryMutation(
 *   async (userData: CreateUserData, signal: AbortSignal) => {
 *     const response = await fetch('/api/users', {
 *       method: 'POST',
 *       body: JSON.stringify(userData),
 *       signal
 *     });
 *     if (!response.ok) throw new Error('Failed to create user');
 *     return response.json();
 *   },
 *   {
 *     // Optimistic update with function
 *     optimisticData: (userData, currentData) => ({
 *       ...userData,
 *       id: 'temp-' + Date.now(),
 *       createdAt: new Date().toISOString()
 *     }),
 *     onSuccess: (user) => {
 *       toast.success(`User ${user.name} created!`);
 *       router.push(`/users/${user.id}`);
 *     },
 *     onError: (error, userData) => {
 *       toast.error(error.message);
 *     },
 *     rollbackOnError: (error, userData, previousData) => {
 *       // Custom rollback logic if needed
 *       console.log('Rolling back to:', previousData);
 *     },
 *     retry: 3,
 *     retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
 *   }
 * );
 * ```
 */
export function useTryMutation<T, TVariables = void>(
  mutationFn: (variables: TVariables, signal: AbortSignal) => Promise<T>,
  options: UseTryMutationOptions<T, TVariables> = {},
  deps: React.DependencyList = []
): UseTryMutationResult<T, TVariables> {
  const [data, setDataState] = useState<T | null>(null);
  const [error, setError] = useState<TryError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  const {
    onSuccess,
    onError,
    onSettled,
    abortMessage = "Mutation aborted",
    optimisticData,
    rollbackOnError,
    retry = false,
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    invalidateOnSuccess = true,
  } = options;

  // AbortController ref for cancelling in-flight mutations
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  // Mutation queue
  const mutationQueueRef = useRef<QueuedMutation<TVariables>[]>([]);
  const isProcessingQueueRef = useRef(false);

  // Previous data for rollback
  const previousDataRef = useRef<T | null>(null);

  // Cache key for this mutation
  const cacheKeyRef = useRef<string | null>(null);

  // Retry timeout
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      // Clear the queue
      mutationQueueRef.current.forEach(({ reject }) => {
        reject(
          createError({
            type: "COMPONENT_UNMOUNTED",
            message: "Component unmounted before mutation could complete",
          })
        );
      });
      mutationQueueRef.current = [];
    };
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    abort();
    setDataState(null);
    setError(null);
    setIsLoading(false);
    setFailureCount(0);
    previousDataRef.current = null;
  }, [abort]);

  // Enhanced setData that supports functional updates
  const setData = useCallback((updater: T | ((prev: T | null) => T) | null) => {
    setDataState((prev) => {
      if (updater === null) return null;

      const newData =
        typeof updater === "function"
          ? (updater as (prev: T | null) => T)(prev)
          : updater;

      // Update cache if we have a cache key
      if (cacheKeyRef.current && newData !== null) {
        mutationCache.set(cacheKeyRef.current, {
          data: newData,
          timestamp: Date.now(),
        });
      }

      return newData;
    });
  }, []);

  const invalidate = useCallback(() => {
    if (cacheKeyRef.current) {
      mutationCache.delete(cacheKeyRef.current);
    }
  }, []);

  const shouldRetry = useCallback(
    (count: number, error: TryError): boolean => {
      if (!retry) return false;
      if (typeof retry === "boolean") return retry && count < 3;
      if (typeof retry === "number") return count < retry;
      return retry(count, error);
    },
    [retry]
  );

  const getRetryDelay = useCallback(
    (count: number): number => {
      if (typeof retryDelay === "function") {
        return retryDelay(count);
      }
      return retryDelay;
    },
    [retryDelay]
  );

  const processMutationQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || mutationQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;

    while (mutationQueueRef.current.length > 0 && isMountedRef.current) {
      const mutation = mutationQueueRef.current.shift();
      if (!mutation) continue;

      try {
        const result = await mutateAsyncInternal(mutation.variables);
        mutation.resolve(result);
      } catch (error) {
        mutation.reject(error);
      }
    }

    isProcessingQueueRef.current = false;
  }, []);

  const mutateAsyncInternal = useCallback(
    async (
      variables: TVariables,
      retryCount = 0
    ): Promise<TryResult<T, TryError>> => {
      // Abort any previous mutation
      abortControllerRef.current?.abort();

      // Create new AbortController for this mutation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      if (!isMountedRef.current) {
        return createError({
          type: "COMPONENT_UNMOUNTED",
          message: "Component unmounted before mutation could start",
        });
      }

      // Generate cache key based on variables
      cacheKeyRef.current = JSON.stringify({
        fn: mutationFn.toString(),
        variables,
      });

      // Check cache first
      const cached = mutationCache.get(cacheKeyRef.current);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        return cached.data;
      }

      // Store previous data for potential rollback
      previousDataRef.current = data;

      // Apply optimistic update if provided
      if (optimisticData !== undefined && isMountedRef.current) {
        const optimisticValue =
          typeof optimisticData === "function"
            ? (
                optimisticData as (
                  variables: TVariables,
                  currentData: T | null
                ) => T
              )(variables, data)
            : optimisticData;
        setData(optimisticValue);
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await tryAsync(() =>
          mutationFn(variables, abortController.signal)
        );

        // Check if component is still mounted and request wasn't aborted
        if (!isMountedRef.current || abortController.signal.aborted) {
          // Rollback optimistic update if needed
          if (
            optimisticData !== undefined &&
            previousDataRef.current !== undefined
          ) {
            setData(previousDataRef.current);
          }

          return createError({
            type: "ABORTED",
            message: abortMessage,
            context: {
              reason: abortController.signal.aborted
                ? "manual_abort"
                : "unmount",
            },
          });
        }

        if (isTryError(result)) {
          // Check if we should retry
          if (shouldRetry(retryCount, result)) {
            const delay = getRetryDelay(retryCount);

            return new Promise((resolve) => {
              retryTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                  setFailureCount(retryCount + 1);
                  resolve(mutateAsyncInternal(variables, retryCount + 1));
                } else {
                  resolve(
                    createError({
                      type: "COMPONENT_UNMOUNTED",
                      message: "Component unmounted during retry",
                    })
                  );
                }
              }, delay);
            });
          }

          // Rollback optimistic update on error
          if (
            optimisticData !== undefined &&
            previousDataRef.current !== undefined
          ) {
            setData(previousDataRef.current);
            rollbackOnError?.(result, variables, previousDataRef.current);
          }

          setError(result);
          setData(null);
          setFailureCount(retryCount);
          onError?.(result, variables);
        } else {
          // Success - update cache
          if (cacheKeyRef.current) {
            mutationCache.set(cacheKeyRef.current, {
              data: result,
              timestamp: Date.now(),
            });
          }

          // Invalidate cache if requested
          if (invalidateOnSuccess) {
            // Invalidate related cache entries (simplified - in real app would be more sophisticated)
            mutationCache.clear();
          }

          setData(result);
          setError(null);
          setFailureCount(0);
          onSuccess?.(result, variables);
        }

        if (isMountedRef.current) {
          setIsLoading(false);
          onSettled?.(data, error, variables);
        }

        return result;
      } catch (error) {
        // Check if this was an abort
        if (error instanceof Error && error.name === "AbortError") {
          const abortError = createError({
            type: "ABORTED",
            message: abortMessage,
            context: { reason: "manual_abort" },
            cause: error,
          });

          if (isMountedRef.current) {
            // Rollback optimistic update
            if (
              optimisticData !== undefined &&
              previousDataRef.current !== undefined
            ) {
              setData(previousDataRef.current);
              rollbackOnError?.(abortError, variables, previousDataRef.current);
            }

            setError(abortError);
            setIsLoading(false);
            onError?.(abortError, variables);
            onSettled?.(null, abortError, variables);
          }

          return abortError;
        }

        // Handle unexpected errors
        const unexpectedError = createError({
          type: "UNEXPECTED_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          cause: error,
        });

        if (isMountedRef.current && !abortController.signal.aborted) {
          // Rollback optimistic update
          if (
            optimisticData !== undefined &&
            previousDataRef.current !== undefined
          ) {
            setData(previousDataRef.current);
            rollbackOnError?.(
              unexpectedError,
              variables,
              previousDataRef.current
            );
          }

          setError(unexpectedError);
          setIsLoading(false);
          onError?.(unexpectedError, variables);
          onSettled?.(null, unexpectedError, variables);
        }

        return unexpectedError;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      mutationFn,
      onSuccess,
      onError,
      onSettled,
      abortMessage,
      data,
      optimisticData,
      rollbackOnError,
      shouldRetry,
      getRetryDelay,
      cacheTime,
      invalidateOnSuccess,
      setData,
      ...deps,
    ]
  );

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TryResult<T, TryError>> => {
      // Add to queue if already processing
      if (isProcessingQueueRef.current) {
        return new Promise((resolve, reject) => {
          mutationQueueRef.current.push({ variables, resolve, reject });
        });
      }

      const result = await mutateAsyncInternal(variables);

      // Process any queued mutations
      processMutationQueue();

      return result;
    },
    [mutateAsyncInternal, processMutationQueue]
  );

  const mutate = useCallback(
    async (variables: TVariables): Promise<TryResult<T, TryError>> => {
      return mutateAsync(variables);
    },
    [mutateAsync]
  );

  return {
    data,
    error,
    isLoading,
    isSuccess: data !== null && error === null,
    isError: error !== null,
    isIdle: !isLoading && data === null && error === null,
    failureCount,
    mutate,
    mutateAsync,
    reset,
    abort,
    setData,
    invalidate,
  };
}

/**
 * Specialized mutation hook for form submissions
 *
 * @example
 * ```tsx
 * const { submitForm, isSubmitting, submitError } = useFormMutation(
 *   async (formData: FormData) => {
 *     return submitContactForm(formData);
 *   }
 * );
 *
 * <form onSubmit={submitForm}>
 *   // form fields
 * </form>
 * ```
 */
export function useFormMutation<T>(
  submitFn: (formData: FormData, signal: AbortSignal) => Promise<T>,
  options: UseTryMutationOptions<T, FormData> = {}
) {
  const mutation = useTryMutation(submitFn, options);

  const submitForm = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      return mutation.mutate(formData);
    },
    [mutation.mutate]
  );

  return {
    ...mutation,
    submitForm,
    isSubmitting: mutation.isLoading,
    submitError: mutation.error,
    submitData: mutation.data,
  };
}
