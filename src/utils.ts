/**
 * Utility functions for common error handling patterns
 *
 * These utilities make Stage 1 usage smoother by providing common patterns
 * and operations that developers frequently need.
 */

import { TryError, TryResult, isTryError, TRY_ERROR_BRAND } from "./types";

// ============================================================================
// STAGE 1 IMPROVEMENTS - BETTER ERROR HANDLING PATTERNS
// ============================================================================

/**
 * Options for enhanced error handling
 */
export interface ErrorHandlingOptions {
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

  /**
   * Whether to include stack trace (defaults to true in development)
   */
  includeStack?: boolean;

  /**
   * Tags for categorizing errors
   */
  tags?: string[];
}

/**
 * Enhanced error creation with common patterns
 *
 * Provides a more convenient API for creating errors with common options.
 *
 * @param type - Error type
 * @param message - Error message
 * @param options - Additional options
 * @returns A TryError with enhanced context
 *
 * @example
 * ```typescript
 * const error = createEnhancedError("ValidationError", "Invalid input", {
 *   context: { field: "email", value: "invalid" },
 *   tags: ["user-input", "validation"]
 * });
 * ```
 */
export function createEnhancedError(
  type: string,
  message: string,
  options: Omit<ErrorHandlingOptions, "errorType"> = {}
): TryError {
  // Safer environment detection
  let isDevelopment = false;
  try {
    // Check multiple ways to detect development environment
    isDevelopment =
      // Node.js environment
      (typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV === "development") ||
      // Browser with webpack/vite dev mode
      (typeof window !== "undefined" &&
        window.location &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")) ||
      // Check for common dev indicators
      (typeof globalThis !== "undefined" &&
        ((globalThis as any).__DEV__ === true ||
          (globalThis as any).DEBUG === true));
  } catch {
    // If any check fails, assume production
    isDevelopment = false;
  }

  const context = {
    ...options.context,
    ...(options.tags && { tags: options.tags }),
    // Include stack trace in development
    ...(isDevelopment &&
      options.includeStack !== false && {
        stackTrace: new Error().stack,
      }),
  };

  return {
    [TRY_ERROR_BRAND]: true,
    type,
    message: options.message || message,
    source: "unknown", // Will be set by createError if needed
    timestamp: Date.now(),
    context: Object.keys(context).length > 0 ? context : undefined,
    stack:
      options.includeStack !== false && !isDevelopment
        ? new Error().stack
        : undefined,
  };
}

/**
 * Check if a value is a specific type of error
 *
 * @param value - Value to check
 * @param errorType - Error type to check for
 * @returns True if value is a TryError of the specified type
 *
 * @example
 * ```typescript
 * if (isErrorOfType(result, "ValidationError")) {
 *   // Handle validation error
 * }
 * ```
 */
export function isErrorOfType(
  value: unknown,
  errorType: string
): value is TryError {
  return isTryError(value) && value.type === errorType;
}

/**
 * Check if a value is one of several error types
 *
 * @param value - Value to check
 * @param errorTypes - Array of error types to check for
 * @returns True if value is a TryError of one of the specified types
 *
 * @example
 * ```typescript
 * if (isErrorOfTypes(result, ["NetworkError", "TimeoutError"])) {
 *   // Handle network-related errors
 * }
 * ```
 */
export function isErrorOfTypes(
  value: unknown,
  errorTypes: string[]
): value is TryError {
  return isTryError(value) && errorTypes.includes(value.type);
}

/**
 * Extract error message with fallback
 *
 * @param value - Value that might be an error
 * @param fallback - Fallback message if not an error
 * @returns Error message or fallback
 *
 * @example
 * ```typescript
 * const message = getErrorMessage(result, "Unknown error occurred");
 * console.error(message);
 * ```
 */
export function getErrorMessage(
  value: unknown,
  fallback: string = "Unknown error"
): string {
  if (isTryError(value)) {
    return value.message;
  }
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === "string") {
    return value;
  }
  return fallback;
}

/**
 * Get error context with type safety
 *
 * @param error - TryError to extract context from
 * @param key - Context key to extract
 * @returns Context value or undefined
 *
 * @example
 * ```typescript
 * const userId = getErrorContext(error, "userId") as string;
 * const requestId = getErrorContext(error, "requestId") as string;
 * ```
 */
export function getErrorContext<T = unknown>(
  error: TryError,
  key: string
): T | undefined {
  return error.context?.[key] as T | undefined;
}

/**
 * Check if error has specific context
 *
 * @param error - TryError to check
 * @param key - Context key to check for
 * @returns True if error has the specified context key
 *
 * @example
 * ```typescript
 * if (hasErrorContext(error, "userId")) {
 *   const userId = getErrorContext(error, "userId");
 *   // Handle user-specific error
 * }
 * ```
 */
export function hasErrorContext(error: TryError, key: string): boolean {
  return error.context !== undefined && key in error.context;
}

// ============================================================================
// RESULT TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform a result value while preserving errors
 *
 * Similar to tryMap but with a simpler API for common transformations.
 *
 * @param result - Result to transform
 * @param transform - Transformation function
 * @returns Transformed result or original error
 *
 * @example
 * ```typescript
 * const userResult = fetchUser("123");
 * const nameResult = transformResult(userResult, user => user.name);
 * ```
 */
export function transformResult<T, U, E extends TryError>(
  result: TryResult<T, E>,
  transform: (value: T) => U
): TryResult<U, E> {
  if (isTryError(result)) {
    return result;
  }
  return transform(result);
}

/**
 * Provide a default value for error cases
 *
 * @param result - Result that might be an error
 * @param defaultValue - Default value to use if result is an error
 * @returns The success value or default value
 *
 * @example
 * ```typescript
 * const user = withDefault(userResult, { id: "unknown", name: "Guest" });
 * ```
 */
export function withDefault<T, E extends TryError>(
  result: TryResult<T, E>,
  defaultValue: T
): T {
  return isTryError(result) ? defaultValue : result;
}

/**
 * Provide a default value using a function for error cases
 *
 * @param result - Result that might be an error
 * @param getDefault - Function to generate default value
 * @returns The success value or computed default value
 *
 * @example
 * ```typescript
 * const user = withDefaultFn(userResult, (error) => ({
 *   id: "unknown",
 *   name: `Guest (${error.type})`
 * }));
 * ```
 */
export function withDefaultFn<T, E extends TryError>(
  result: TryResult<T, E>,
  getDefault: (error: E) => T
): T {
  return isTryError(result) ? getDefault(result) : result;
}

/**
 * Filter results to only success values
 * Optimized to process in a single pass
 *
 * @param results - Array of results
 * @returns Array of only the success values
 *
 * @example
 * ```typescript
 * const allResults = [userResult1, userResult2, userResult3];
 * const successfulUsers = filterSuccess(allResults);
 * ```
 */
export function filterSuccess<T, E extends TryError>(
  results: Array<TryResult<T, E>>
): T[] {
  return results.reduce<T[]>((acc, result) => {
    if (!isTryError(result)) {
      acc.push(result);
    }
    return acc;
  }, []);
}

/**
 * Filter results to only error values
 * Optimized to process in a single pass
 *
 * @param results - Array of results
 * @returns Array of only the error values
 *
 * @example
 * ```typescript
 * const allResults = [userResult1, userResult2, userResult3];
 * const errors = filterErrors(allResults);
 * ```
 */
export function filterErrors<T, E extends TryError>(
  results: Array<TryResult<T, E>>
): E[] {
  return results.reduce<E[]>((acc, result) => {
    if (isTryError(result)) {
      acc.push(result);
    }
    return acc;
  }, []);
}

/**
 * Partition results into success and error arrays
 *
 * @param results - Array of results
 * @returns Tuple of [successes, errors]
 *
 * @example
 * ```typescript
 * const allResults = [userResult1, userResult2, userResult3];
 * const [users, errors] = partitionResults(allResults);
 * ```
 */
export function partitionResults<T, E extends TryError>(
  results: Array<TryResult<T, E>>
): [T[], E[]] {
  const successes: T[] = [];
  const errors: E[] = [];

  for (const result of results) {
    if (isTryError(result)) {
      errors.push(result);
    } else {
      successes.push(result);
    }
  }

  return [successes, errors];
}

// ============================================================================
// ERROR AGGREGATION UTILITIES
// ============================================================================

/**
 * Combine multiple errors into a single error
 *
 * @param errors - Array of errors to combine
 * @param type - Type for the combined error
 * @param message - Message for the combined error
 * @returns A single error containing all the individual errors
 *
 * @example
 * ```typescript
 * const validationErrors = filterErrors(validationResults);
 * const combinedError = combineErrors(validationErrors, "MultipleValidationErrors",
 *   `${validationErrors.length} validation errors occurred`);
 * ```
 */
export function combineErrors<E extends TryError>(
  errors: E[],
  type: string,
  message: string
): TryError {
  return createEnhancedError(type, message, {
    context: {
      errorCount: errors.length,
      errors: errors.map((error) => ({
        type: error.type,
        message: error.message,
        source: error.source,
      })),
    },
  });
}

/**
 * Get a summary of error types from an array of errors
 *
 * @param errors - Array of errors
 * @returns Object with error type counts
 *
 * @example
 * ```typescript
 * const errors = filterErrors(results);
 * const summary = getErrorSummary(errors);
 * // { "ValidationError": 3, "NetworkError": 1 }
 * ```
 */
export function getErrorSummary(errors: TryError[]): Record<string, number> {
  const summary: Record<string, number> = {};

  for (const error of errors) {
    summary[error.type] = (summary[error.type] || 0) + 1;
  }

  return summary;
}

// ============================================================================
// DEBUGGING UTILITIES
// ============================================================================

/**
 * Format an error for logging with all context
 * Uses efficient string building
 *
 * @param error - Error to format
 * @param includeStack - Whether to include stack trace
 * @returns Formatted error string
 *
 * @example
 * ```typescript
 * console.error(formatErrorForLogging(error, true));
 * ```
 */
export function formatErrorForLogging(
  error: TryError,
  includeStack: boolean = false
): string {
  // Use template literal for efficient string building
  let result = `[${error.type}] ${error.message}\nSource: ${
    error.source
  }\nTimestamp: ${new Date(error.timestamp).toISOString()}`;

  if (error.context) {
    result += `\nContext: ${JSON.stringify(error.context, null, 2)}`;
  }

  if (error.cause) {
    result += `\nCause: ${error.cause}`;
  }

  if (includeStack && error.stack) {
    result += `\nStack: ${error.stack}`;
  }

  return result;
}

/**
 * Create a simple error report from multiple errors
 *
 * @param errors - Array of errors
 * @returns Formatted error report
 *
 * @example
 * ```typescript
 * const errors = filterErrors(results);
 * console.error(createErrorReport(errors));
 * ```
 */
export function createErrorReport(errors: TryError[]): string {
  if (errors.length === 0) {
    return "No errors to report";
  }

  const summary = getErrorSummary(errors);
  const summaryText = Object.entries(summary)
    .map(([type, count]) => `${type}: ${count}`)
    .join(", ");

  const report = [
    `Error Report (${errors.length} total errors)`,
    `Summary: ${summaryText}`,
    "",
    "Details:",
    ...errors.map(
      (error, index) =>
        `${index + 1}. [${error.type}] ${error.message} (${error.source})`
    ),
  ];

  return report.join("\n");
}

/**
 * Diff two errors to see what changed
 *
 * @param error1 - First error
 * @param error2 - Second error
 * @returns Object describing the differences
 *
 * @example
 * ```typescript
 * const diff = diffErrors(originalError, modifiedError);
 * console.log(diff);
 * // {
 * //   type: { from: "ValidationError", to: "SchemaError" },
 * //   context: { added: { schema: "user" }, removed: { field: "email" } }
 * // }
 * ```
 */
export function diffErrors<E1 extends TryError, E2 extends TryError>(
  error1: E1,
  error2: E2
): {
  type?: { from: string; to: string };
  message?: { from: string; to: string };
  source?: { from: string; to: string };
  timestamp?: { from: number; to: number };
  context?: {
    added: Record<string, unknown>;
    removed: Record<string, unknown>;
    changed: Record<string, { from: unknown; to: unknown }>;
  };
} {
  const diff: any = {};

  if (error1.type !== error2.type) {
    diff.type = { from: error1.type, to: error2.type };
  }

  if (error1.message !== error2.message) {
    diff.message = { from: error1.message, to: error2.message };
  }

  if (error1.source !== error2.source) {
    diff.source = { from: error1.source, to: error2.source };
  }

  if (error1.timestamp !== error2.timestamp) {
    diff.timestamp = { from: error1.timestamp, to: error2.timestamp };
  }

  // Diff context
  if (error1.context || error2.context) {
    const ctx1 = error1.context || {};
    const ctx2 = error2.context || {};

    const added: Record<string, unknown> = {};
    const removed: Record<string, unknown> = {};
    const changed: Record<string, { from: unknown; to: unknown }> = {};

    // Check for added/changed fields
    for (const key in ctx2) {
      if (!(key in ctx1)) {
        added[key] = ctx2[key];
      } else if (ctx1[key] !== ctx2[key]) {
        changed[key] = { from: ctx1[key], to: ctx2[key] };
      }
    }

    // Check for removed fields
    for (const key in ctx1) {
      if (!(key in ctx2)) {
        removed[key] = ctx1[key];
      }
    }

    if (
      Object.keys(added).length ||
      Object.keys(removed).length ||
      Object.keys(changed).length
    ) {
      diff.context = { added, removed, changed };
    }
  }

  return diff;
}

/**
 * Group errors by a specific field
 *
 * @param errors - Array of errors to group
 * @param keyFn - Function to extract grouping key
 * @returns Map of grouped errors
 *
 * @example
 * ```typescript
 * const errors = [
 *   createError({ type: "ValidationError", message: "Invalid email" }),
 *   createError({ type: "ValidationError", message: "Invalid password" }),
 *   createError({ type: "NetworkError", message: "Timeout" })
 * ];
 *
 * const grouped = groupErrors(errors, error => error.type);
 * // Map { "ValidationError" => [...], "NetworkError" => [...] }
 * ```
 */
export function groupErrors<E extends TryError, K>(
  errors: E[],
  keyFn: (error: E) => K
): Map<K, E[]> {
  const groups = new Map<K, E[]>();

  for (const error of errors) {
    const key = keyFn(error);
    const group = groups.get(key) || [];
    group.push(error);
    groups.set(key, group);
  }

  return groups;
}

/**
 * Error sampling utilities
 */
export const ErrorSampling = {
  /**
   * Random sampling - include error based on probability
   *
   * @param probability - Probability of including error (0-1)
   * @returns Whether to include the error
   *
   * @example
   * ```typescript
   * if (ErrorSampling.random(0.1)) { // 10% sampling
   *   logError(error);
   * }
   * ```
   */
  random(probability: number): boolean {
    return Math.random() < probability;
  },

  /**
   * Rate-based sampling - include every Nth error
   *
   * @param counter - Current counter value
   * @param rate - Sample every Nth error
   * @returns Whether to include the error
   *
   * @example
   * ```typescript
   * let errorCount = 0;
   * if (ErrorSampling.rate(++errorCount, 100)) { // Every 100th error
   *   logError(error);
   * }
   * ```
   */
  rate(counter: number, rate: number): boolean {
    return counter % rate === 0;
  },

  /**
   * Time-based sampling - include one error per time window
   *
   * @param lastSampleTime - Last time an error was sampled
   * @param windowMs - Time window in milliseconds
   * @returns Whether to include the error
   *
   * @example
   * ```typescript
   * let lastSample = 0;
   * if (ErrorSampling.timeBased(lastSample, 60000)) { // Once per minute
   *   lastSample = Date.now();
   *   logError(error);
   * }
   * ```
   */
  timeBased(lastSampleTime: number, windowMs: number): boolean {
    return Date.now() - lastSampleTime >= windowMs;
  },

  /**
   * Error type sampling - different rates for different error types
   *
   * @param error - The error to check
   * @param rates - Map of error types to sampling rates
   * @returns Whether to include the error
   *
   * @example
   * ```typescript
   * const samplingRates = new Map([
   *   ["ValidationError", 0.01], // 1% of validation errors
   *   ["NetworkError", 0.5],     // 50% of network errors
   *   ["CriticalError", 1.0]     // 100% of critical errors
   * ]);
   *
   * if (ErrorSampling.byType(error, samplingRates)) {
   *   logError(error);
   * }
   * ```
   */
  byType(error: TryError, rates: Map<string, number>): boolean {
    const rate = rates.get(error.type) || 0.1; // Default 10%
    return Math.random() < rate;
  },
};

/**
 * Correlate related errors across operations
 *
 * @param errors - Array of errors to correlate
 * @param correlationFn - Function to determine if errors are related
 * @returns Array of correlated error groups
 *
 * @example
 * ```typescript
 * const errors = await collectErrors();
 * const correlated = correlateErrors(errors, (e1, e2) => {
 *   // Errors are related if they have the same transaction ID
 *   return e1.context?.transactionId === e2.context?.transactionId;
 * });
 * ```
 */
export function correlateErrors<E extends TryError>(
  errors: E[],
  correlationFn: (error1: E, error2: E) => boolean
): E[][] {
  const groups: E[][] = [];
  const processed = new Set<E>();

  for (const error of errors) {
    if (processed.has(error)) continue;

    const group = [error];
    processed.add(error);

    for (const other of errors) {
      if (!processed.has(other) && correlationFn(error, other)) {
        group.push(other);
        processed.add(other);
      }
    }

    groups.push(group);
  }

  return groups;
}

/**
 * Create a fingerprint for an error for deduplication
 *
 * @param error - Error to fingerprint
 * @param fields - Fields to include in fingerprint
 * @returns Fingerprint string
 *
 * @example
 * ```typescript
 * const fingerprint = getErrorFingerprint(error, ["type", "message", "source"]);
 * if (!seenFingerprints.has(fingerprint)) {
 *   seenFingerprints.add(fingerprint);
 *   logError(error);
 * }
 * ```
 */
export function getErrorFingerprint(
  error: TryError,
  fields: Array<keyof TryError> = ["type", "message"]
): string {
  const parts = fields.map((field) => {
    const value = error[field];
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  });

  return parts.join("|");
}
