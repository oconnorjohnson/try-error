import { useState, useCallback, useRef, useEffect } from "react";
import {
  trySync,
  tryAsync,
  TryResult,
  TryError,
  isTryError,
  createError,
} from "@try-error/core";
import { useCleanup } from "./useCleanup";

/**
 * State management hook with try-error integration
 *
 * Similar to useState but with built-in error handling for state updates
 *
 * @example
 * ```tsx
 * const [data, setData, error, clearError] = useTryState<User>(null);
 *
 * const updateUser = useCallback((newUser: User) => {
 *   setData(() => validateUser(newUser)); // Can throw
 * }, [setData]);
 * ```
 */
export function useTryState<T>(
  initialValue: T | (() => T)
): [
  T,
  (updater: T | ((current: T) => T)) => void,
  TryError | null,
  () => void
] {
  const [state, setState] = useState<T>(initialValue);
  const [error, setError] = useState<TryError | null>(null);

  // Use universal cleanup hook for proper memory management
  const { isMounted, nullifyRef } = useCleanup();

  // Use ref to avoid stale closure
  const stateRef = useRef(state);
  stateRef.current = state;

  // Register refs for cleanup
  nullifyRef(stateRef);

  const setTryState = useCallback(
    (updater: T | ((current: T) => T)) => {
      if (!isMounted()) return;

      const result = trySync(() => {
        if (typeof updater === "function") {
          return (updater as (current: T) => T)(stateRef.current);
        }
        return updater;
      });

      if (isMounted()) {
        if (isTryError(result)) {
          setError(result);
        } else {
          setState(result);
          setError(null);
        }
      }
    },
    [isMounted]
  );

  const clearError = useCallback(() => {
    if (isMounted()) {
      setError(null);
    }
  }, [isMounted]);

  return [state, setTryState, error, clearError];
}

/**
 * Async version of useTryState for async state updates
 *
 * @example
 * ```tsx
 * const [data, setData, error, clearError, isUpdating] = useTryStateAsync<User>(null);
 *
 * const updateUser = useCallback(async (userId: string) => {
 *   await setData(async () => {
 *     const user = await fetchUser(userId);
 *     return validateUser(user);
 *   });
 * }, [setData]);
 * ```
 */
export function useTryStateAsync<T>(
  initialValue: T | (() => T)
): [
  T,
  (
    updater: T | ((current: T) => T) | ((current: T) => Promise<T>)
  ) => Promise<void>,
  TryError | null,
  () => void,
  boolean
] {
  const [state, setState] = useState<T>(initialValue);
  const [error, setError] = useState<TryError | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use universal cleanup hook for proper memory management
  const { isMounted, nullifyRef } = useCleanup();

  // Use ref to avoid stale closure
  const stateRef = useRef(state);
  stateRef.current = state;

  // Register refs for cleanup
  nullifyRef(stateRef);

  const setTryStateAsync = useCallback(
    async (updater: T | ((current: T) => T) | ((current: T) => Promise<T>)) => {
      if (!isMounted()) return;

      setIsUpdating(true);
      setError(null);

      try {
        let result: TryResult<T, TryError>;

        if (typeof updater === "function") {
          const updateFn = updater as
            | ((current: T) => T)
            | ((current: T) => Promise<T>);
          const updateResult = updateFn(stateRef.current);

          if (updateResult instanceof Promise) {
            result = await tryAsync(() => updateResult);
          } else {
            result = trySync(() => updateResult);
          }
        } else {
          result = updater;
        }

        if (isMounted()) {
          if (isTryError(result)) {
            setError(result);
          } else {
            setState(result);
            setError(null);
          }
        }
      } catch (e) {
        if (isMounted()) {
          setError(
            createError({
              type: "StateUpdateError",
              message: e instanceof Error ? e.message : "State update failed",
              cause: e,
            })
          );
        }
      } finally {
        if (isMounted()) {
          setIsUpdating(false);
        }
      }
    },
    [isMounted]
  );

  const clearError = useCallback(() => {
    if (isMounted()) {
      setError(null);
    }
  }, [isMounted]);

  return [state, setTryStateAsync, error, clearError, isUpdating];
}

/**
 * Simpler version of useTryState for basic error tracking
 *
 * @example
 * ```tsx
 * const [user, setUser, userError] = useStateWithError<User>(null);
 * ```
 */
export function useStateWithError<T>(
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, TryError | null] {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<TryError | null>(null);

  const setValueWithError = useCallback((newValue: T | ((prev: T) => T)) => {
    // Clear any previous error
    setError(null);

    // Use functional update to ensure we have the latest state
    setValue((currentValue) => {
      // If newValue is a function, execute it with error handling
      if (typeof newValue === "function") {
        const result = trySync(() =>
          (newValue as (prev: T) => T)(currentValue)
        );

        if (isTryError(result)) {
          setError(result);
          return currentValue; // Don't update state on error
        }

        return result;
      }

      // For direct values, just return them
      return newValue;
    });
  }, []);

  return [value, setValueWithError, error];
}

/**
 * Hook for state with validation
 *
 * @example
 * ```tsx
 * const [email, setEmail, emailError] = useValidatedState(
 *   '',
 *   (value) => {
 *     if (!value.includes('@')) {
 *       throw new Error('Invalid email format');
 *     }
 *     return value;
 *   }
 * );
 * ```
 */
export function useValidatedState<T>(
  initialValue: T,
  validator: (value: T) => T
): [T, (value: T) => void, TryError | null] {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<TryError | null>(null);

  const setValidatedValue = useCallback(
    (newValue: T) => {
      const result = trySync(() => validator(newValue));

      if (isTryError(result)) {
        setError(result);
      } else {
        setValue(result);
        setError(null);
      }
    },
    [validator]
  );

  return [value, setValidatedValue, error];
}

/**
 * Hook for state with localStorage persistence
 *
 * @example
 * ```tsx
 * const [theme, setTheme, error] = usePersistedState('theme', 'light');
 * ```
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((current: T) => T)) => void, TryError | null] {
  // Initialize from localStorage
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const [error, setError] = useState<TryError | null>(null);

  const setPersistedState = useCallback(
    (updater: T | ((current: T) => T)) => {
      setState((currentState) => {
        const newValue =
          typeof updater === "function"
            ? (updater as (current: T) => T)(currentState)
            : updater;

        // Try to persist to localStorage
        const result = trySync(() => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          }
          return newValue;
        });

        if (isTryError(result)) {
          setError(result);
          return currentState; // Don't update state if persistence fails
        } else {
          setError(null);
          return result;
        }
      });
    },
    [key]
  );

  return [state, setPersistedState, error];
}
