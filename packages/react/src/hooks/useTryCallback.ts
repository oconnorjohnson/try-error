// useTryCallback hook for React error handling
// TODO: Implement React callback hook for try-error integration

import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import { tryAsync, trySync, isTryError, TryResult, TryError } from "try-error";

// Options for useTryCallback hook
export interface UseTryCallbackOptions<T = unknown> {
  // Custom error handler
  onError?: (error: TryError) => void;
  // Custom success handler
  onSuccess?: (data: T) => void;
  // Transform error before returning
  transformError?: (error: TryError) => TryError;
  // Transform success data before returning
  transformData?: (data: T) => T;
}

// Extended options with loading state
export interface UseTryCallbackWithStateOptions<T = unknown>
  extends UseTryCallbackOptions<T> {
  // Track loading state
  trackState?: boolean;
}

// Return type with loading state
export interface UseTryCallbackWithState<TArgs extends any[], TReturn> {
  callback: (...args: TArgs) => Promise<TryResult<TReturn, TryError>>;
  isLoading: boolean;
  reset: () => void;
}

/**
 * React hook for creating memoized try-error callbacks
 *
 * Similar to useCallback, but wraps the function with try-error handling.
 * Useful for event handlers, form submissions, and other callback scenarios.
 *
 * @example
 * ```tsx
 * const handleSubmit = useTryCallback(
 *   async (formData: FormData) => {
 *     const result = await submitForm(formData);
 *     return result;
 *   },
 *   {
 *     onSuccess: (data) => setSuccessMessage("Form submitted!"),
 *     onError: (error) => setErrorMessage(error.message)
 *   },
 *   [submitForm]
 * );
 *
 * return <form onSubmit={handleSubmit}>...</form>;
 * ```
 */
export function useTryCallback<TArgs extends any[], TReturn>(
  callback: (...args: TArgs) => Promise<TReturn>,
  options: UseTryCallbackOptions<TReturn> = {},
  deps: React.DependencyList = []
): (...args: TArgs) => Promise<TryResult<TReturn, TryError>> {
  const { onError, onSuccess, transformError, transformData } = options;

  // Memoize transform functions to prevent unnecessary re-renders
  const memoizedTransformError = useMemo(
    () => transformError,
    [transformError]
  );

  const memoizedTransformData = useMemo(() => transformData, [transformData]);

  return useCallback(
    async (...args: TArgs): Promise<TryResult<TReturn, TryError>> => {
      const result = await tryAsync(() => callback(...args));

      if (isTryError(result)) {
        const finalError = memoizedTransformError
          ? memoizedTransformError(result)
          : result;
        onError?.(finalError);
        return finalError;
      } else {
        const finalData = memoizedTransformData
          ? memoizedTransformData(result)
          : result;
        onSuccess?.(finalData);
        return finalData;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      callback,
      onError,
      onSuccess,
      memoizedTransformError,
      memoizedTransformData,
      ...deps,
    ]
  );
}

/**
 * Version of useTryCallback with loading state tracking
 *
 * @example
 * ```tsx
 * const { callback: handleSubmit, isLoading } = useTryCallbackWithState(
 *   async (formData: FormData) => {
 *     return await submitForm(formData);
 *   },
 *   {
 *     onSuccess: (data) => toast.success("Submitted!"),
 *     onError: (error) => toast.error(error.message)
 *   },
 *   [submitForm]
 * );
 *
 * <button onClick={handleSubmit} disabled={isLoading}>
 *   {isLoading ? 'Submitting...' : 'Submit'}
 * </button>
 * ```
 */
export function useTryCallbackWithState<TArgs extends any[], TReturn>(
  callback: (...args: TArgs) => Promise<TReturn>,
  options: UseTryCallbackOptions<TReturn> = {},
  deps: React.DependencyList = []
): UseTryCallbackWithState<TArgs, TReturn> {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        abortControllerRef.current?.abort();
      } catch {
        // Ignore abort errors during cleanup
      }
      abortControllerRef.current = null;
    };
  }, []);

  const enhancedCallback = useTryCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      try {
        return await callback(...args);
      } finally {
        setIsLoading(false);
      }
    },
    options,
    deps
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    try {
      abortControllerRef.current?.abort();
    } catch {
      // Ignore abort errors during reset
    }
  }, []);

  return {
    callback: enhancedCallback,
    isLoading,
    reset,
  };
}

/**
 * Synchronous version of useTryCallback for non-async operations
 *
 * @example
 * ```tsx
 * const handleValidation = useTryCallbackSync(
 *   (input: string) => validateInput(input),
 *   {
 *     onError: (error) => setFieldError(error.message),
 *     onSuccess: () => setFieldError(null)
 *   },
 *   [validateInput]
 * );
 * ```
 */
export function useTryCallbackSync<TArgs extends any[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  options: UseTryCallbackOptions<TReturn> = {},
  deps: React.DependencyList = []
): (...args: TArgs) => TryResult<TReturn, TryError> {
  const { onError, onSuccess, transformError, transformData } = options;

  // Memoize transform functions
  const memoizedTransformError = useMemo(
    () => transformError,
    [transformError]
  );

  const memoizedTransformData = useMemo(() => transformData, [transformData]);

  return useCallback(
    (...args: TArgs): TryResult<TReturn, TryError> => {
      const result = trySync(() => callback(...args));

      if (isTryError(result)) {
        const finalError = memoizedTransformError
          ? memoizedTransformError(result)
          : result;
        onError?.(finalError);
        return finalError;
      } else {
        const finalData = memoizedTransformData
          ? memoizedTransformData(result)
          : result;
        onSuccess?.(finalData);
        return finalData;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      callback,
      onError,
      onSuccess,
      memoizedTransformError,
      memoizedTransformData,
      ...deps,
    ]
  );
}

/**
 * Hook for creating a memoized error handler callback
 *
 * Useful for consistent error handling across components.
 *
 * @example
 * ```tsx
 * const handleError = useErrorCallback(
 *   (error: TryError) => {
 *     console.error('Operation failed:', error);
 *     toast.error(error.message);
 *   },
 *   [toast]
 * );
 * ```
 */
export function useErrorCallback(
  errorHandler: (error: TryError) => void,
  deps: React.DependencyList = []
): (error: TryError) => void {
  return useCallback(errorHandler, deps);
}

/**
 * Hook for creating a memoized success handler callback
 *
 * @example
 * ```tsx
 * const handleSuccess = useSuccessCallback(
 *   (data: User) => {
 *     console.log('User loaded:', data);
 *     setUser(data);
 *   },
 *   [setUser]
 * );
 * ```
 */
export function useSuccessCallback<T>(
  successHandler: (data: T) => void,
  deps: React.DependencyList = []
): (data: T) => void {
  return useCallback(successHandler, deps);
}

/**
 * Hook for creating a result handler that handles both success and error cases
 *
 * @example
 * ```tsx
 * const handleResult = useResultCallback(
 *   (result: TryResult<User>) => {
 *     if (isTryError(result)) {
 *       setError(result.message);
 *       setUser(null);
 *     } else {
 *       setError(null);
 *       setUser(result);
 *     }
 *   },
 *   [setError, setUser]
 * );
 * ```
 */
export function useResultCallback<T>(
  resultHandler: (result: TryResult<T, TryError>) => void,
  deps: React.DependencyList = []
): (result: TryResult<T, TryError>) => void {
  return useCallback(resultHandler, deps);
}

/**
 * Hook for creating form submission handlers with try-error
 *
 * Automatically prevents default form submission and handles the result.
 *
 * @example
 * ```tsx
 * const handleSubmit = useFormSubmitCallback(
 *   async (formData: FormData) => {
 *     return await submitUserForm(formData);
 *   },
 *   {
 *     onSuccess: () => navigate('/success'),
 *     onError: (error) => setFormError(error.message)
 *   },
 *   [submitUserForm, navigate]
 * );
 *
 * return <form onSubmit={handleSubmit}>...</form>;
 * ```
 */
export function useFormSubmitCallback<T>(
  submitHandler: (formData: FormData) => Promise<T>,
  options: UseTryCallbackOptions<T> = {},
  deps: React.DependencyList = []
): (event: React.FormEvent<HTMLFormElement>) => Promise<void> {
  const tryCallback = useTryCallback(submitHandler, options, deps);

  return useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;

      // Safe FormData creation
      if (typeof FormData !== "undefined") {
        const formData = new FormData(form);
        await tryCallback(formData);
      } else {
        // Fallback for environments without FormData
        console.error("FormData is not available in this environment");
      }
    },
    [tryCallback]
  );
}
