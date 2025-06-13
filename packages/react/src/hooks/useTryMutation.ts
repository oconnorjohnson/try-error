import { useState, useCallback } from "react";
import { tryAsync, TryResult, TryError, isTryError } from "try-error";

export interface UseTryMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: TryError) => void;
  onSettled?: () => void;
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
}

/**
 * Hook for handling mutations with try-error integration
 *
 * Similar to React Query's useMutation but with try-error patterns
 *
 * @example
 * ```tsx
 * const { mutate, isLoading, error } = useTryMutation(
 *   async (userData: CreateUserData) => {
 *     const response = await fetch('/api/users', {
 *       method: 'POST',
 *       body: JSON.stringify(userData)
 *     });
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
 * <form onSubmit={(e) => {
 *   e.preventDefault();
 *   mutate(formData);
 * }}>
 * ```
 */
export function useTryMutation<T, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: UseTryMutationOptions<T> = {}
): UseTryMutationResult<T, TVariables> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<TryError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { onSuccess, onError, onSettled } = options;

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TryResult<T, TryError>> => {
      setIsLoading(true);
      setError(null);

      const result = await tryAsync(() => mutationFn(variables));

      if (isTryError(result)) {
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
    },
    [mutationFn, onSuccess, onError, onSettled]
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
  submitFn: (formData: FormData) => Promise<T>,
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
