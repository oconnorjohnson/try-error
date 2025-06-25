import {
  TryError,
  TryResult,
  TryTuple,
  isTryError,
  TRY_ERROR_BRAND,
} from "./types";
import { fromThrown } from "./errors";

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
    if (options?.errorType) {
      return {
        type: options.errorType,
        message:
          options.message ||
          (error instanceof Error ? error.message : "Operation failed"),
        source: "unknown", // Will be set by createError if needed
        timestamp: Date.now(),
        cause: error,
        context: options.context,
      } as TryError;
    }

    return fromThrown(error, options?.context);
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
 * const result = tryCall(parseInt, "123", 10);
 * const result2 = tryCall(JSON.parse, invalidJson);
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
  ...restArgs: TArgs extends readonly [unknown, ...infer Rest] ? Rest : TArgs
): TryResult<TReturn, TryError> {
  // Check if first argument is options object
  const isOptionsObject =
    optionsOrFirstArg !== null &&
    typeof optionsOrFirstArg === "object" &&
    !Array.isArray(optionsOrFirstArg) &&
    ("errorType" in optionsOrFirstArg ||
      "context" in optionsOrFirstArg ||
      "message" in optionsOrFirstArg);

  if (isOptionsObject) {
    const options = optionsOrFirstArg as TrySyncOptions;
    return trySync(() => fn(...(restArgs as unknown as TArgs)), options);
  } else {
    const allArgs = [optionsOrFirstArg, ...restArgs] as unknown as TArgs;
    return trySync(() => fn(...allArgs));
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
