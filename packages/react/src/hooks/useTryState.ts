import { useState, useCallback } from "react";
import { trySync, TryResult, TryError, isTryError } from "try-error";

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
  initialValue: T
): [
  T,
  (updater: T | ((current: T) => T)) => void,
  TryError | null,
  () => void
] {
  const [state, setState] = useState<T>(initialValue);
  const [error, setError] = useState<TryError | null>(null);

  const setTryState = useCallback(
    (updater: T | ((current: T) => T)) => {
      const result = trySync(() => {
        if (typeof updater === "function") {
          return (updater as (current: T) => T)(state);
        }
        return updater;
      });

      if (isTryError(result)) {
        setError(result);
      } else {
        setState(result);
        setError(null);
      }
    },
    [state]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return [state, setTryState, error, clearError];
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
): [T, (value: T) => void, TryError | null] {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<TryError | null>(null);

  const setValueWithError = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      setError(null);
    } catch (e) {
      const tryError: TryError = {
        type: "StateUpdateError",
        message: e instanceof Error ? e.message : "State update failed",
        source: "useTryState",
        timestamp: Date.now(),
        cause: e,
      };
      setError(tryError);
    }
  }, []);

  return [value, setValueWithError, error];
}
