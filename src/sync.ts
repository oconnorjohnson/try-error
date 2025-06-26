import {
  TryError,
  TryResult,
  TryTuple,
  isTryError,
  TRY_ERROR_BRAND,
} from "./types";
import { fromThrown, wrapError } from "./errors";

/**
 * Options for trySync function
 */
export interface TrySyncOptions {
  /**
   * Custom error type to use instead of automatic detection
   */
  errorType?: string;

  /**
   * Additional context to include in error
   */
  context?: Record<string, unknown>;

  /**
   * Custom error message
   */
  message?: string;
}

/**
 * Shared error creation logic that preserves stack traces
 */
function createTryError(error: unknown, options?: TrySyncOptions): TryError {
  if (options?.errorType) {
    // Use wrapError to preserve the original error and its stack trace
    return wrapError(
      options.errorType,
      error,
      options.message,
      options.context
    );
  }

  return fromThrown(error, options?.context);
}

/**
 * Wrap a synchronous operation that might throw
 * Returns either the result or a TryError
 *
 * @param fn - Function to execute
 * @param options - Optional configuration
 * @returns TryResult with success value or error
 *
 * @example
 * ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * if (isTryError(result)) {
 *   console.error('Parse failed:', result.message);
 * } else {
 *   console.log('Parsed:', result);
 * }
 * ```
 */
export function trySync<T>(
  fn: () => T,
  options?: TrySyncOptions
): TryResult<T, TryError> {
  try {
    return fn();
  } catch (error) {
    return createTryError(error, options);
  }
}

/**
 * Wrap a synchronous operation and return a tuple [result, error]
 * Go-style error handling
 *
 * @param fn - Function to execute
 * @param options - Optional configuration
 * @returns Tuple with [result, null] on success or [null, error] on failure
 *
 * @example
 * ```typescript
 * const [result, error] = trySyncTuple(() => JSON.parse(jsonString));
 * if (error) {
 *   console.error('Parse failed:', error.message);
 * } else {
 *   console.log('Parsed:', result);
 * }
 * ```
 */
export function trySyncTuple<T>(
  fn: () => T,
  options?: TrySyncOptions
): TryTuple<T, TryError> {
  const result = trySync(fn, options);
  if (isTryError(result)) {
    return [null, result];
  }
  return [result, null];
}

/**
 * Call a function with arguments, wrapping any thrown errors
 *
 * @param fn - Function to call
 * @param args - Arguments to pass to the function
 * @param options - Optional configuration
 * @returns TryResult with success value or error
 *
 * @example
 * ```typescript
 * // Without options
 * const result = tryCall(parseInt, "123", 10);
 *
 * // With options
 * const result2 = tryCall(JSON.parse, { errorType: "ParseError" }, invalidJson);
 * ```
 */
export function tryCall<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  ...args: TArgs
): TryResult<TReturn, TryError>;
export function tryCall<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  options: TrySyncOptions,
  ...args: TArgs
): TryResult<TReturn, TryError>;
export function tryCall<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  optionsOrFirstArg?: TrySyncOptions | TArgs[0],
  ...restArgs: unknown[]
): TryResult<TReturn, TryError> {
  // Helper to check if value is TrySyncOptions
  const isTrySyncOptions = (value: unknown): value is TrySyncOptions => {
    if (value === null || value === undefined) return false;
    if (typeof value !== "object" || Array.isArray(value)) return false;

    // Check if it's a plain object (not a class instance)
    if ((value as any).constructor !== Object) return false;

    const obj = value as any;

    // Must have at least one of the TrySyncOptions properties
    const hasErrorType =
      "errorType" in obj && typeof obj.errorType === "string";
    const hasContext = "context" in obj && typeof obj.context === "object";
    const hasMessage = "message" in obj && typeof obj.message === "string";

    return hasErrorType || hasContext || hasMessage;
  };

  if (isTrySyncOptions(optionsOrFirstArg)) {
    return trySync(
      () => fn(...(restArgs as unknown as TArgs)),
      optionsOrFirstArg
    );
  } else {
    const allArgs =
      optionsOrFirstArg !== undefined
        ? [optionsOrFirstArg, ...restArgs]
        : restArgs;
    return trySync(() => fn(...(allArgs as unknown as TArgs)));
  }
}

/**
 * Transform a successful result, leaving errors unchanged
 *
 * @param result - The result to transform
 * @param mapper - Function to transform the success value
 * @returns Transformed result or original error
 *
 * @example
 * ```typescript
 * const parseResult = trySync(() => JSON.parse(jsonString));
 * const upperResult = tryMap(parseResult, (obj) => obj.name.toUpperCase());
 * ```
 */
export function tryMap<T, U, E extends TryError>(
  result: TryResult<T, E>,
  mapper: (value: T) => U
): TryResult<U, E | TryError> {
  if (isTryError(result)) {
    return result;
  }

  return trySync(() => mapper(result));
}

/**
 * Chain operations that return TryResult, short-circuiting on errors
 *
 * @param result - The result to chain from
 * @param chainer - Function that takes success value and returns new TryResult
 * @returns Chained result or first error encountered
 *
 * @example
 * ```typescript
 * const result = trySync(() => JSON.parse(jsonString))
 *   |> tryChain(obj => trySync(() => validateUser(obj)))
 *   |> tryChain(user => trySync(() => saveUser(user)));
 * ```
 */
export function tryChain<T, U, E1 extends TryError, E2 extends TryError>(
  result: TryResult<T, E1>,
  chainer: (value: T) => TryResult<U, E2>
): TryResult<U, E1 | E2> {
  if (isTryError(result)) {
    return result;
  }

  return chainer(result);
}

/**
 * Extract the success value from a TryResult, throwing if it's an error
 *
 * @param result - The result to unwrap
 * @param message - Optional custom error message
 * @returns The success value
 * @throws The TryError if result is an error
 *
 * @example
 * ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * const parsed = unwrap(result); // Throws if parsing failed
 * ```
 */
export function unwrap<T, E extends TryError>(
  result: TryResult<T, E>,
  message?: string
): T {
  if (isTryError(result)) {
    const error = new Error(message || result.message);
    (error as any).cause = result;
    throw error;
  }
  return result;
}

/**
 * Extract the success value from a TryResult, returning a default if it's an error
 *
 * @param result - The result to unwrap
 * @param defaultValue - Value to return if result is an error
 * @returns The success value or default value
 *
 * @example
 * ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * const parsed = unwrapOr(result, {}); // Returns {} if parsing failed
 * ```
 */
export function unwrapOr<T, D, E extends TryError>(
  result: TryResult<T, E>,
  defaultValue: D
): T | D {
  if (isTryError(result)) {
    return defaultValue;
  }
  return result;
}

/**
 * Extract the success value from a TryResult, computing a default if it's an error
 *
 * @param result - The result to unwrap
 * @param defaultFn - Function to compute default value from error
 * @returns The success value or computed default
 *
 * @example
 * ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * const parsed = unwrapOrElse(result, (error) => {
 *   console.warn('Parse failed:', error.message);
 *   return {};
 * });
 * ```
 */
export function unwrapOrElse<T, D, E extends TryError>(
  result: TryResult<T, E>,
  defaultFn: (error: E) => D
): T | D {
  if (isTryError(result)) {
    return defaultFn(result);
  }
  return result;
}

/**
 * Check if a TryResult is successful (not an error)
 * Type predicate that narrows the type
 *
 * @param result - The result to check
 * @returns True if result is successful
 *
 * @example
 * ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * if (isOk(result)) {
 *   // result is narrowed to success type
 *   console.log(result.name);
 * }
 * ```
 */
export function isOk<T, E extends TryError>(
  result: TryResult<T, E>
): result is T {
  return !isTryError(result);
}

/**
 * Check if a TryResult is an error
 * Type predicate that narrows the type
 *
 * @param result - The result to check
 * @returns True if result is an error
 *
 * @example
 * ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * if (isErr(result)) {
 *   // result is narrowed to error type
 *   console.error(result.message);
 * }
 * ```
 */
export function isErr<T, E extends TryError>(
  result: TryResult<T, E>
): result is E {
  return isTryError(result);
}

/**
 * Combine multiple TryResults, succeeding only if all succeed
 *
 * @param results - Array of TryResults to combine
 * @returns Array of success values or first error encountered
 *
 * @example
 * ```typescript
 * const results = tryAll([
 *   trySync(() => JSON.parse(json1)),
 *   trySync(() => JSON.parse(json2)),
 *   trySync(() => JSON.parse(json3))
 * ]);
 * ```
 */
export function tryAll<T extends readonly TryResult<any, any>[]>(
  results: T
): TryResult<
  { [K in keyof T]: T[K] extends TryResult<infer U, any> ? U : never },
  TryError
> {
  const values: any[] = [];

  for (const result of results) {
    if (isTryError(result)) {
      return result;
    }
    values.push(result);
  }

  return values as any;
}

/**
 * Try multiple operations, returning the first successful result
 *
 * @param attempts - Array of functions to try
 * @returns First successful result or last error if all fail
 *
 * @example
 * ```typescript
 * const result = tryAny([
 *   () => trySync(() => JSON.parse(primaryJson)),
 *   () => trySync(() => JSON.parse(fallbackJson)),
 *   () => ({ fallback: true })
 * ]);
 * ```
 */
export function tryAny<T>(
  attempts: Array<() => TryResult<T, TryError>>
): TryResult<T, TryError> {
  let lastError: TryError | null = null;

  for (const attempt of attempts) {
    const result = attempt();
    if (!isTryError(result)) {
      return result;
    }
    lastError = result;
  }

  return lastError || fromThrown("All attempts failed");
}

/**
 * Retry a synchronous operation with configurable attempts
 *
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns TryResult with final result or last error
 *
 * @example
 * ```typescript
 * const result = retrySync(
 *   () => readFileSync('config.json'),
 *   { attempts: 3, delay: 100 }
 * );
 * ```
 */
export function retrySync<T>(
  fn: () => T,
  options: {
    attempts: number;
    delay?: number;
    shouldRetry?: (error: TryError, attempt: number) => boolean;
  }
): TryResult<T, TryError> {
  const { attempts, delay = 0, shouldRetry = () => true } = options;
  let lastError: TryError | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = trySync(fn);

    if (!isTryError(result)) {
      return result;
    }

    lastError = result;

    if (attempt < attempts && shouldRetry(result, attempt)) {
      if (delay > 0) {
        // Note: Synchronous delay is not recommended for production
        // Consider using async version for real delays
        const start = Date.now();
        while (Date.now() - start < delay) {
          // Busy wait
        }
      }
      continue;
    }

    break;
  }

  return lastError || fromThrown("Retry failed");
}

/**
 * Circuit breaker pattern for synchronous operations
 *
 * @example
 * ```typescript
 * const breaker = createCircuitBreaker({
 *   failureThreshold: 5,
 *   resetTimeout: 60000
 * });
 *
 * const result = breaker.execute(() => riskyOperation());
 * ```
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private options: {
      failureThreshold: number;
      resetTimeout: number;
      onOpen?: () => void;
      onClose?: () => void;
    }
  ) {}

  execute<T>(fn: () => T): TryResult<T, TryError> {
    // Check if circuit should be reset
    if (
      this.state === "open" &&
      Date.now() - this.lastFailureTime > this.options.resetTimeout
    ) {
      this.state = "half-open";
    }

    // If circuit is open, fail fast
    if (this.state === "open") {
      return fromThrown("Circuit breaker is open");
    }

    const result = trySync(fn);

    if (isTryError(result)) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.options.failureThreshold) {
        this.state = "open";
        this.options.onOpen?.();
      }

      return result;
    }

    // Success - reset failures
    if (this.state === "half-open") {
      this.state = "closed";
      this.options.onClose?.();
    }
    this.failures = 0;

    return result;
  }

  reset(): void {
    this.failures = 0;
    this.state = "closed";
    this.lastFailureTime = 0;
  }

  getState(): "closed" | "open" | "half-open" {
    return this.state;
  }
}

/**
 * Create a circuit breaker instance
 */
export function createCircuitBreaker(options: {
  failureThreshold: number;
  resetTimeout: number;
  onOpen?: () => void;
  onClose?: () => void;
}): CircuitBreaker {
  return new CircuitBreaker(options);
}

/**
 * Error recovery pattern - try operation with fallback
 *
 * @param primary - Primary operation to try
 * @param fallback - Fallback operation if primary fails
 * @param shouldFallback - Optional predicate to determine if fallback should be used
 * @returns Result from primary or fallback operation
 *
 * @example
 * ```typescript
 * const config = withFallback(
 *   () => JSON.parse(readFileSync('config.json', 'utf8')),
 *   () => ({ defaultConfig: true }),
 *   (error) => error.type === 'SyntaxError'
 * );
 * ```
 */
export function withFallback<T>(
  primary: () => T,
  fallback: () => T,
  shouldFallback?: (error: TryError) => boolean
): TryResult<T, TryError> {
  const primaryResult = trySync(primary);

  if (isTryError(primaryResult)) {
    if (!shouldFallback || shouldFallback(primaryResult)) {
      return trySync(fallback);
    }
    return primaryResult;
  }

  return primaryResult;
}
