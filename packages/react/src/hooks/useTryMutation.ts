import { useState, useCallback, useRef, useEffect } from "react";
import {
  tryAsync,
  TryResult,
  TryError,
  isTryError,
  createError,
} from "try-error";

export interface UseTryMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: TryError) => void;
  onSettled?: () => void;
  abortMessage?: string;
  // Optimistic update support
  optimisticData?: T;
  // Rollback function for failed optimistic updates
  rollbackOnError?: (error: TryError) => void;
}

export interface UseTryMutationResult<T, TVariables> {
  data: T | null;
  error: TryError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutate: (variables: TVariables) => Promise<TryResult<T, TryError>>;
  mutateAsync: (variables: TVariables) => Promise<TryResult<T, TryError>>;
  reset: () => void;
  abort: () => void;
}

// Mutation queue for managing multiple mutations
interface QueuedMutation<TVariables> {
  variables: TVariables;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

/**
 * Hook for handling mutations with try-error integration and AbortController support
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
 *     onSuccess: (user) => {
 *       toast.success(`User ${user.name} created!`);
 *       router.push(`/users/${user.id}`);
 *     },
 *     onError: (error) => {
 *       toast.error(error.message);
 *     }
 *   }
 * );
 *
 * // Cleanup on unmount
 * useEffect(() => {
 *   return () => abort();
 * }, []);
 *
 * <form onSubmit={(e) => {
 *   e.preventDefault();
 *   mutate(formData);
 * }}>
 * ```
 */
export function useTryMutation<T, TVariables = void>(
  mutationFn: (variables: TVariables, signal: AbortSignal) => Promise<T>,
  options: UseTryMutationOptions<T> = {}
): UseTryMutationResult<T, TVariables> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<TryError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    onSuccess,
    onError,
    onSettled,
    abortMessage = "Mutation aborted",
    optimisticData,
    rollbackOnError,
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
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
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setData(null);
    setError(null);
    setIsLoading(false);
    previousDataRef.current = null;
  }, []);

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
    async (variables: TVariables): Promise<TryResult<T, TryError>> => {
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

      // Store previous data for potential rollback
      previousDataRef.current = data;

      // Apply optimistic update if provided
      if (optimisticData !== undefined && isMountedRef.current) {
        setData(optimisticData);
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
          // Rollback optimistic update on error
          if (
            optimisticData !== undefined &&
            previousDataRef.current !== undefined
          ) {
            setData(previousDataRef.current);
            rollbackOnError?.(result);
          }

          setError(result);
          setData(null);
          onError?.(result);
        } else {
          setData(result);
          setError(null);
          onSuccess?.(result);
        }

        if (isMountedRef.current) {
          setIsLoading(false);
          onSettled?.();
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
              rollbackOnError?.(abortError);
            }

            setError(abortError);
            setIsLoading(false);
            onError?.(abortError);
            onSettled?.();
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
            rollbackOnError?.(unexpectedError);
          }

          setError(unexpectedError);
          setIsLoading(false);
          onError?.(unexpectedError);
          onSettled?.();
        }

        return unexpectedError;
      }
    },
    [
      mutationFn,
      onSuccess,
      onError,
      onSettled,
      abortMessage,
      data,
      optimisticData,
      rollbackOnError,
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
    mutate,
    mutateAsync,
    reset,
    abort,
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
  options: UseTryMutationOptions<T> = {}
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
