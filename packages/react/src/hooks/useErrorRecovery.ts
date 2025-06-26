import { useState, useCallback, useRef, useEffect } from "react";
import { TryError, createError } from "try-error";

export interface CircuitBreakerOptions {
  // Number of failures before opening the circuit
  failureThreshold?: number;
  // Time in ms to wait before attempting to close the circuit
  resetTimeout?: number;
  // Function to determine if an error should count towards the threshold
  shouldTrip?: (error: TryError) => boolean;
  // Callback when circuit opens
  onOpen?: () => void;
  // Callback when circuit closes
  onClose?: () => void;
  // Callback when circuit is half-open (testing)
  onHalfOpen?: () => void;
}

export interface RetryStrategyOptions {
  maxRetries?: number;
  retryDelay?: number | ((attempt: number) => number);
  shouldRetry?: (error: TryError, attempt: number) => boolean;
  onRetry?: (attempt: number) => void;
}

export interface ErrorRecoveryOptions {
  circuitBreaker?: CircuitBreakerOptions;
  retry?: RetryStrategyOptions;
  fallback?: () => Promise<any>;
  timeout?: number;
  onError?: (error: TryError) => void;
  onRecover?: () => void;
}

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface RecoveryState {
  isRecovering: boolean;
  recoveryAttempts: number;
  circuitState: CircuitState;
  lastError: TryError | null;
  consecutiveFailures: number;
}

/**
 * Hook for advanced error recovery strategies including circuit breaker pattern
 *
 * @example
 * ```tsx
 * const { execute, isRecovering, circuitState } = useErrorRecovery({
 *   circuitBreaker: {
 *     failureThreshold: 3,
 *     resetTimeout: 30000,
 *     shouldTrip: (error) => error.type === 'NETWORK_ERROR'
 *   },
 *   retry: {
 *     maxRetries: 3,
 *     retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
 *     shouldRetry: (error) => error.type !== 'VALIDATION_ERROR'
 *   },
 *   fallback: async () => {
 *     // Return cached data or default value
 *     return getCachedData();
 *   }
 * });
 *
 * const result = await execute(async () => {
 *   return await fetchData();
 * });
 * ```
 */
export function useErrorRecovery<T = any>(
  options: ErrorRecoveryOptions = {}
): {
  execute: (fn: () => Promise<T>) => Promise<T>;
  reset: () => void;
  isRecovering: boolean;
  circuitState: CircuitState;
  lastError: TryError | null;
  recoveryAttempts: number;
  consecutiveFailures: number;
} {
  const {
    circuitBreaker = {},
    retry = {},
    fallback,
    timeout,
    onError,
    onRecover,
  } = options;

  const {
    failureThreshold = 5,
    resetTimeout = 60000,
    shouldTrip = () => true,
    onOpen,
    onClose,
    onHalfOpen,
  } = circuitBreaker;

  const {
    maxRetries = 3,
    retryDelay = 1000,
    shouldRetry = () => true,
    onRetry,
  } = retry;

  const [state, setState] = useState<RecoveryState>({
    isRecovering: false,
    recoveryAttempts: 0,
    circuitState: "CLOSED",
    lastError: null,
    consecutiveFailures: 0,
  });

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const updateState = useCallback((updates: Partial<RecoveryState>) => {
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  const openCircuit = useCallback(() => {
    updateState({ circuitState: "OPEN" });
    onOpen?.();

    // Schedule circuit reset
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        updateState({ circuitState: "HALF_OPEN" });
        onHalfOpen?.();
      }
    }, resetTimeout);
  }, [updateState, onOpen, onHalfOpen, resetTimeout]);

  const closeCircuit = useCallback(() => {
    updateState({
      circuitState: "CLOSED",
      consecutiveFailures: 0,
    });
    onClose?.();
  }, [updateState, onClose]);

  const getRetryDelayMs = useCallback(
    (attempt: number): number => {
      if (typeof retryDelay === "function") {
        return retryDelay(attempt);
      }
      return retryDelay;
    },
    [retryDelay]
  );

  const executeWithTimeout = useCallback(
    async <T>(fn: () => Promise<T>, timeoutMs?: number): Promise<T> => {
      if (!timeoutMs) {
        return fn();
      }

      return Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                createError({
                  type: "TIMEOUT_ERROR",
                  message: `Operation timed out after ${timeoutMs}ms`,
                })
              ),
            timeoutMs
          )
        ),
      ]);
    },
    []
  );

  const execute = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      // Check circuit breaker state
      if (state.circuitState === "OPEN") {
        const error = createError({
          type: "CIRCUIT_OPEN",
          message: "Circuit breaker is open",
          context: {
            consecutiveFailures: state.consecutiveFailures,
            lastError: state.lastError,
          },
        });

        // Try fallback if available
        if (fallback) {
          try {
            return await fallback();
          } catch (fallbackError) {
            throw error;
          }
        }

        throw error;
      }

      updateState({ isRecovering: true, recoveryAttempts: 0 });

      let lastError: TryError | null = null;
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          const result = await executeWithTimeout(fn, timeout);

          // Success - close circuit if it was half-open
          if (state.circuitState === "HALF_OPEN") {
            closeCircuit();
          }

          updateState({
            isRecovering: false,
            lastError: null,
            consecutiveFailures: 0,
            recoveryAttempts: attempt,
          });

          onRecover?.();
          return result;
        } catch (error) {
          lastError = createError({
            type: error instanceof Error ? error.name : "UNKNOWN_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
            cause: error,
            context: {
              attempt,
              circuitState: state.circuitState,
            },
          });

          onError?.(lastError);

          // Check if we should retry
          if (
            attempt < maxRetries &&
            shouldRetry(lastError, attempt) &&
            state.circuitState !== "OPEN"
          ) {
            attempt++;
            updateState({ recoveryAttempts: attempt });
            onRetry?.(attempt);

            // Wait before retrying
            const delay = getRetryDelayMs(attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          // No more retries - handle circuit breaker
          if (shouldTrip(lastError)) {
            const newFailureCount = state.consecutiveFailures + 1;
            updateState({
              consecutiveFailures: newFailureCount,
              lastError,
            });

            if (newFailureCount >= failureThreshold) {
              openCircuit();
            }
          }

          break;
        }
      }

      updateState({ isRecovering: false });

      // Try fallback as last resort
      if (fallback && lastError) {
        try {
          return await fallback();
        } catch (fallbackError) {
          // Fallback also failed
          throw lastError;
        }
      }

      throw lastError;
    },
    [
      state.circuitState,
      state.consecutiveFailures,
      state.lastError,
      updateState,
      maxRetries,
      executeWithTimeout,
      timeout,
      closeCircuit,
      onRecover,
      onError,
      shouldRetry,
      onRetry,
      getRetryDelayMs,
      shouldTrip,
      failureThreshold,
      openCircuit,
      fallback,
    ]
  );

  const reset = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    setState({
      isRecovering: false,
      recoveryAttempts: 0,
      circuitState: "CLOSED",
      lastError: null,
      consecutiveFailures: 0,
    });
  }, []);

  return {
    execute,
    reset,
    isRecovering: state.isRecovering,
    circuitState: state.circuitState,
    lastError: state.lastError,
    recoveryAttempts: state.recoveryAttempts,
    consecutiveFailures: state.consecutiveFailures,
  };
}

/**
 * Hook for implementing exponential backoff retry strategy
 *
 * @example
 * ```tsx
 * const retry = useExponentialBackoff({
 *   maxRetries: 5,
 *   initialDelay: 1000,
 *   maxDelay: 30000,
 *   factor: 2,
 *   jitter: true
 * });
 *
 * const result = await retry.execute(async () => {
 *   return await apiCall();
 * });
 * ```
 */
export function useExponentialBackoff<T = any>(options: {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  jitter?: boolean;
  shouldRetry?: (error: TryError, attempt: number) => boolean;
}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    jitter = true,
    shouldRetry,
  } = options;

  const calculateDelay = useCallback(
    (attempt: number): number => {
      const exponentialDelay = Math.min(
        initialDelay * Math.pow(factor, attempt - 1),
        maxDelay
      );

      if (jitter) {
        // Add random jitter (±25% of delay)
        const jitterAmount = exponentialDelay * 0.25;
        return exponentialDelay + (Math.random() - 0.5) * 2 * jitterAmount;
      }

      return exponentialDelay;
    },
    [initialDelay, factor, maxDelay, jitter]
  );

  return useErrorRecovery({
    retry: {
      maxRetries,
      retryDelay: calculateDelay,
      shouldRetry,
    },
  });
}

/**
 * Hook for implementing bulkhead pattern (limiting concurrent operations)
 *
 * @example
 * ```tsx
 * const bulkhead = useBulkhead({
 *   maxConcurrent: 5,
 *   queueSize: 10,
 *   timeout: 5000
 * });
 *
 * const result = await bulkhead.execute(async () => {
 *   return await heavyOperation();
 * });
 * ```
 */
export function useBulkhead<T = any>(options: {
  maxConcurrent?: number;
  queueSize?: number;
  timeout?: number;
  onReject?: () => void;
}) {
  const {
    maxConcurrent = 10,
    queueSize = 100,
    timeout = 30000,
    onReject,
  } = options;

  const [activeCount, setActiveCount] = useState(0);
  const [queuedCount, setQueuedCount] = useState(0);
  const queueRef = useRef<
    Array<{
      fn: () => Promise<any>;
      resolve: (value: any) => void;
      reject: (error: any) => void;
    }>
  >([]);

  const processQueue = useCallback(async () => {
    if (activeCount >= maxConcurrent || queueRef.current.length === 0) {
      return;
    }

    const item = queueRef.current.shift();
    if (!item) return;

    setActiveCount((prev) => prev + 1);
    setQueuedCount((prev) => prev - 1);

    try {
      const result = await item.fn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      setActiveCount((prev) => prev - 1);
      // Process next item in queue
      processQueue();
    }
  }, [activeCount, maxConcurrent]);

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      if (activeCount >= maxConcurrent) {
        if (queuedCount >= queueSize) {
          onReject?.();
          throw createError({
            type: "BULKHEAD_REJECTED",
            message: `Bulkhead queue is full (${queueSize} items)`,
            context: {
              activeCount,
              queuedCount,
              maxConcurrent,
              queueSize,
            },
          });
        }

        // Add to queue
        return new Promise((resolve, reject) => {
          queueRef.current.push({ fn, resolve, reject });
          setQueuedCount((prev) => prev + 1);
        });
      }

      // Execute immediately
      setActiveCount((prev) => prev + 1);

      try {
        const timeoutPromise = timeout
          ? new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    createError({
                      type: "BULKHEAD_TIMEOUT",
                      message: `Operation timed out after ${timeout}ms`,
                    })
                  ),
                timeout
              )
            )
          : null;

        const result = timeoutPromise
          ? await Promise.race([fn(), timeoutPromise])
          : await fn();

        return result;
      } finally {
        setActiveCount((prev) => prev - 1);
        processQueue();
      }
    },
    [
      activeCount,
      maxConcurrent,
      queuedCount,
      queueSize,
      onReject,
      timeout,
      processQueue,
    ]
  );

  return {
    execute,
    activeCount,
    queuedCount,
    isAtCapacity: activeCount >= maxConcurrent,
    isQueueFull: queuedCount >= queueSize,
  };
}
