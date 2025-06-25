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
}

export interface UseTryMutationResult<T, TVariables> {
  data: T | null;
  error: TryError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutate: (variables: TVariables) => Promise<void>;
  mutateAsync: (variables: TVariables) => Promise<TryResult<T, TryError>>;
  reset: () => void;
  abort: () => void;
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
  } = options;

  // AbortController ref for cancelling in-flight mutations
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
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
  }, []);

  const mutateAsync = useCallback(
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

      setIsLoading(true);
      setError(null);

      try {
        const result = await tryAsync(() =>
          mutationFn(variables, abortController.signal)
        );

        // Check if component is still mounted and request wasn't aborted
        if (!isMountedRef.current || abortController.signal.aborted) {
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
          // Check if this was an abort error
          if (
            result.cause instanceof Error &&
            result.cause.name === "AbortError"
          ) {
            const abortError = createError({
              type: "ABORTED",
              message: abortMessage,
              context: { reason: "manual_abort" },
              cause: result.cause,
            });
            setError(abortError);
            setData(null);
            onError?.(abortError);
            setIsLoading(false);
            onSettled?.();
            return abortError;
          }

          setError(result);
          setData(null);
          onError?.(result);
        } else {
          setData(result);
          setError(null);
          onSuccess?.(result);
        }

        setIsLoading(false);
        onSettled?.();

        return result;
      } catch (error) {
        // Check if this was an abort
        if (error instanceof Error && error.name === "AbortError") {
          const abortError = createError({
            type: "ABORTED",
            message: abortMessage,
            context: { reason: "manual_abort" },
          });

          if (isMountedRef.current) {
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
          setError(unexpectedError);
          setIsLoading(false);
          onError?.(unexpectedError);
          onSettled?.();
        }

        return unexpectedError;
      }
    },
    [mutationFn, onSuccess, onError, onSettled, abortMessage]
  );

  const mutate = useCallback(
    async (variables: TVariables) => {
      await mutateAsync(variables);
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
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      mutation.mutate(formData);
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
