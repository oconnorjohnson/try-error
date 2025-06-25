import { TryError, TRY_ERROR_BRAND } from "./types";

/**
 * Options for creating a TryError
 */
export interface CreateErrorOptions<T extends string = string> {
  /**
   * The error type - used for discriminated unions
   */
  type: T;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Additional context data for debugging
   */
  context?: Record<string, unknown>;

  /**
   * The original error or thrown value that caused this error
   */
  cause?: unknown;

  /**
   * Override the automatically detected source location
   */
  source?: string;

  /**
   * Override the automatically generated timestamp
   */
  timestamp?: number;
}

/**
 * Safely check if we're in a production environment
 */
function isProduction(): boolean {
  // Check for Node.js environment
  if (typeof process !== "undefined" && process.env) {
    return process.env.NODE_ENV === "production";
  }
  // Default to production for browsers to avoid exposing stack traces
  return true;
}

/**
 * Extract source location from stack trace
 * Returns format: "file:line:column" or "unknown" if not available
 */
function getSourceLocation(stackOffset: number = 2): string {
  try {
    const stack = new Error().stack;
    if (!stack) return "unknown";

    const lines = stack.split("\n");
    // Skip Error constructor and this function
    const targetLine = lines[stackOffset];
    if (!targetLine) return "unknown";

    // Extract file:line:column from various stack formats
    // Chrome: "    at functionName (file:line:column)"
    // Node: "    at functionName (file:line:column)"
    // Firefox: "functionName@file:line:column"
    const chromeMatch = targetLine.match(/\s+at\s+.*?\((.+):(\d+):(\d+)\)/);
    if (chromeMatch && chromeMatch[1]) {
      const [, file, line, column] = chromeMatch;
      return `${file.split("/").pop()}:${line}:${column}`;
    }

    const nodeMatch = targetLine.match(/\s+at\s+(.+):(\d+):(\d+)/);
    if (nodeMatch && nodeMatch[1]) {
      const [, file, line, column] = nodeMatch;
      return `${file.split("/").pop()}:${line}:${column}`;
    }

    const firefoxMatch = targetLine.match(/(.+)@(.+):(\d+):(\d+)/);
    if (firefoxMatch && firefoxMatch[2]) {
      const [, , file, line, column] = firefoxMatch;
      return `${file.split("/").pop()}:${line}:${column}`;
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Create a TryError with automatic source location detection
 *
 * @param options - Error creation options
 * @returns A properly formatted TryError
 *
 * @example
 * ```typescript
 * const error = createError({
 *   type: "ValidationError",
 *   message: "Invalid email format",
 *   context: { email: "invalid-email" }
 * });
 * ```
 */
export function createError<T extends string = string>(
  options: CreateErrorOptions<T>
): TryError<T> {
  const source = options.source ?? getSourceLocation(3);
  const timestamp = options.timestamp ?? Date.now();

  // Capture stack trace if not in production
  let stack: string | undefined;
  if (!isProduction()) {
    try {
      const error = new Error(options.message);
      stack = error.stack;
    } catch {
      // Stack trace capture failed, continue without it
    }
  }

  return {
    [TRY_ERROR_BRAND]: true,
    type: options.type,
    message: options.message,
    source,
    timestamp,
    stack,
    context: options.context,
    cause: options.cause,
  };
}

/**
 * Wrap an existing error or thrown value into a TryError
 *
 * @param type - The error type for the new TryError
 * @param cause - The original error or thrown value
 * @param message - Optional custom message (defaults to cause message)
 * @param context - Optional additional context
 * @returns A TryError wrapping the original error
 *
 * @example
 * ```typescript
 * try {
 *   JSON.parse(invalidJson);
 * } catch (error) {
 *   return wrapError("ParseError", error, "Failed to parse JSON");
 * }
 * ```
 */
export function wrapError<T extends string = string>(
  type: T,
  cause: unknown,
  message?: string,
  context?: Record<string, unknown>
): TryError<T> {
  // Extract message from cause if not provided
  let errorMessage = message;
  if (!errorMessage) {
    if (cause instanceof Error) {
      errorMessage = cause.message;
    } else if (typeof cause === "string") {
      errorMessage = cause;
    } else {
      errorMessage = "Unknown error occurred";
    }
  }

  return createError({
    type,
    message: errorMessage,
    cause,
    context,
  });
}

/**
 * Create a TryError from a thrown value with automatic type detection
 *
 * @param cause - The thrown value
 * @param context - Optional additional context
 * @returns A TryError with appropriate type based on the cause
 *
 * @example
 * ```typescript
 * try {
 *   riskyOperation();
 * } catch (error) {
 *   return fromThrown(error);
 * }
 * ```
 */
export function fromThrown(
  cause: unknown,
  context?: Record<string, unknown>
): TryError {
  if (cause instanceof TypeError) {
    return wrapError("TypeError", cause, undefined, context);
  }

  if (cause instanceof ReferenceError) {
    return wrapError("ReferenceError", cause, undefined, context);
  }

  if (cause instanceof SyntaxError) {
    return wrapError("SyntaxError", cause, undefined, context);
  }

  if (cause instanceof Error) {
    return wrapError("Error", cause, undefined, context);
  }

  if (typeof cause === "string") {
    return wrapError("StringError", cause, cause, context);
  }

  return wrapError("UnknownError", cause, "An unknown error occurred", context);
}
