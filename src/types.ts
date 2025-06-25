/**
 * Private symbol for brand checking - prevents type guard spoofing
 * Using Symbol.for() to ensure the same symbol across module boundaries
 */
export const TRY_ERROR_BRAND = Symbol.for("try-error.TryError");

/**
 * Core error type with rich context for debugging and error handling
 */
export interface TryError<T extends string = string> {
  /**
   * Brand for type guard checking - prevents spoofing
   * @internal
   */
  readonly [TRY_ERROR_BRAND]: true;

  /**
   * The type of error - used for discriminated unions
   */
  readonly type: T;

  /**
   * Human-readable error message
   */
  readonly message: string;

  /**
   * Stack trace if available (may be stripped in production)
   */
  readonly stack?: string;

  /**
   * Source location where the error occurred (file:line:column)
   */
  readonly source: string;

  /**
   * Timestamp when the error was created
   */
  readonly timestamp: number;

  /**
   * Additional context data for debugging
   */
  readonly context?: Record<string, unknown>;

  /**
   * The original error or thrown value that caused this error
   */
  readonly cause?: unknown;
}

/**
 * Result type for operations that might fail
 * Success case: returns T directly (zero overhead)
 * Error case: returns TryError
 */
export type TryResult<T, E extends TryError = TryError> = T | E;

/**
 * Tuple result for Go-style error handling
 * Success: [value, null]
 * Error: [null, error]
 */
export type TryTuple<T, E extends TryError = TryError> =
  | readonly [T, null]
  | readonly [null, E];

/**
 * Type guard to check if a value is a TryError
 *
 * IMPROVED: This is the most reliable type guard - use this for type narrowing
 * Now uses Symbol branding to prevent spoofing
 */
export function isTryError<E extends TryError = TryError>(
  value: unknown
): value is E {
  return (
    typeof value === "object" &&
    value !== null &&
    TRY_ERROR_BRAND in value &&
    (value as any)[TRY_ERROR_BRAND] === true &&
    "type" in value &&
    "message" in value &&
    "source" in value &&
    "timestamp" in value &&
    typeof (value as any).type === "string" &&
    typeof (value as any).message === "string" &&
    typeof (value as any).source === "string" &&
    typeof (value as any).timestamp === "number"
  );
}

/**
 * Type predicate to narrow a TryResult to its success type
 *
 * IMPROVED: More reliable than negating isTryError
 */
export function isTrySuccess<T, E extends TryError>(
  result: TryResult<T, E>
): result is T {
  return !isTryError(result);
}

/**
 * IMPROVED: More explicit type guard for errors that works better with TypeScript
 */
export function isTryFailure<T, E extends TryError>(
  result: TryResult<T, E>
): result is E {
  return isTryError(result);
}

/**
 * Extract the success type from a TryResult
 */
export type TrySuccess<T> = T extends TryError ? never : T;

/**
 * Extract the error type from a TryResult
 */
export type TryFailure<R> = R extends TryError ? R : never;

/**
 * Utility type to extract the data type from a TryResult
 */
export type UnwrapTry<R> = R extends TryResult<infer T, infer E>
  ? Exclude<T, E>
  : never;

/**
 * Utility type to extract the error type from a TryResult
 */
export type UnwrapTryError<R> = R extends TryResult<any, infer E> ? E : never;

/**
 * IMPROVED: Discriminated union helper for better type inference
 *
 * This helps TypeScript understand the discriminated union pattern better
 */
export function matchTryResult<T, E extends TryError, U>(
  result: TryResult<T, E>,
  handlers: {
    success: (value: T) => U;
    error: (error: E) => U;
  }
): U {
  if (isTryError(result)) {
    return handlers.error(result);
  }
  return handlers.success(result);
}

/**
 * IMPROVED: Type-safe result unwrapping with better inference
 */
export function unwrapTryResult<T, E extends TryError>(
  result: TryResult<T, E>
): { success: true; data: T } | { success: false; error: E } {
  if (isTryError(result)) {
    return { success: false, error: result };
  }
  return { success: true, data: result };
}
