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
  const context = {
    ...options.context,
    ...(options.tags && { tags: options.tags }),
  };

  return {
    [TRY_ERROR_BRAND]: true,
    type,
    message: options.message || message,
    source: "unknown", // Will be set by createError if needed
    timestamp: Date.now(),
    context: Object.keys(context).length > 0 ? context : undefined,
    stack:
      options.includeStack !== false && process.env.NODE_ENV !== "production"
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
  return results.filter((result) => !isTryError(result)) as T[];
}

/**
 * Filter results to only error values
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
  return results.filter((result) => isTryError(result)) as E[];
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
  const parts = [
    `[${error.type}] ${error.message}`,
    `Source: ${error.source}`,
    `Timestamp: ${new Date(error.timestamp).toISOString()}`,
  ];

  if (error.context) {
    parts.push(`Context: ${JSON.stringify(error.context, null, 2)}`);
  }

  if (error.cause) {
    parts.push(`Cause: ${error.cause}`);
  }

  if (includeStack && error.stack) {
    parts.push(`Stack: ${error.stack}`);
  }

  return parts.join("\n");
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
