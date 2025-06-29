/**
 * Private symbol for brand checking - prevents type guard spoofing
 * Using a private symbol instead of Symbol.for() for better performance
 */
export const TRY_ERROR_BRAND = Symbol("try-error.TryError");

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
 * Now uses Symbol branding to prevent spoofing and validates all fields
 */
export function isTryError<E extends TryError = TryError>(
  value: unknown
): value is E {
  // Early return for null/undefined
  if (typeof value !== "object" || value === null) {
    return false;
  }

  // Type narrow to object with index signature
  const obj = value as Record<string | symbol, unknown>;

  // Check for brand symbol
  if (!(TRY_ERROR_BRAND in obj) || obj[TRY_ERROR_BRAND] !== true) {
    return false;
  }

  // Check required string fields
  if (
    typeof obj.type !== "string" ||
    typeof obj.message !== "string" ||
    typeof obj.source !== "string" ||
    typeof obj.timestamp !== "number"
  ) {
    return false;
  }

  // Validate optional context field
  if (
    "context" in obj &&
    obj.context !== undefined &&
    (typeof obj.context !== "object" ||
      obj.context === null ||
      Array.isArray(obj.context))
  ) {
    return false;
  }

  return true;
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

/**
 * Serialize a TryError to a JSON-safe format
 * Removes the Symbol property and converts to a plain object
 */
export function serializeTryError<E extends TryError>(
  error: E
): Record<string, unknown> {
  const { [TRY_ERROR_BRAND]: _, ...serializable } = error;
  return {
    ...serializable,
    __tryError: true, // Marker for deserialization
  };
}

/**
 * Deserialize a JSON object back to a TryError
 * Adds back the Symbol property
 */
export function deserializeTryError<T extends string = string>(
  obj: Record<string, unknown>
): TryError<T> | null {
  if (
    typeof obj === "object" &&
    obj !== null &&
    obj.__tryError === true &&
    typeof obj.type === "string" &&
    typeof obj.message === "string" &&
    typeof obj.source === "string" &&
    typeof obj.timestamp === "number"
  ) {
    const { __tryError, ...rest } = obj;
    return {
      [TRY_ERROR_BRAND]: true,
      ...rest,
    } as TryError<T>;
  }
  return null;
}

/**
 * Compare two TryErrors for equality
 * Compares all fields except the Symbol and stack trace
 */
export function areTryErrorsEqual<E1 extends TryError, E2 extends TryError>(
  error1: E1,
  error2: E2
): boolean {
  return (
    error1.type === error2.type &&
    error1.message === error2.message &&
    error1.source === error2.source &&
    error1.timestamp === error2.timestamp &&
    JSON.stringify(error1.context) === JSON.stringify(error2.context) &&
    error1.cause === error2.cause
  );
}

/**
 * Clone a TryError with optional modifications
 * Creates a new error with the same properties, optionally overriding some
 */
export function cloneTryError<E extends TryError>(
  error: E,
  modifications?: Partial<Omit<E, typeof TRY_ERROR_BRAND>>
): E {
  return {
    ...error,
    ...modifications,
    [TRY_ERROR_BRAND]: true,
  } as E;
}
