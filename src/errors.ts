import { TryError, TRY_ERROR_BRAND } from "./types";
import { getConfig } from "./config";

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

  /**
   * Stack offset for source location detection
   * Useful when wrapping error creation in utility functions
   * @default 3
   */
  stackOffset?: number;

  /**
   * Whether to capture stack trace for this specific error
   * Overrides global configuration
   */
  captureStackTrace?: boolean;
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
 * Detect the JavaScript environment
 */
function detectEnvironment():
  | "node"
  | "chrome"
  | "firefox"
  | "safari"
  | "edge"
  | "unknown" {
  // Node.js
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return "node";
  }

  // Browser detection
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("firefox")) return "firefox";
    if (ua.includes("edg/")) return "edge";
    if (ua.includes("chrome") && !ua.includes("edg/")) return "chrome";
    if (ua.includes("safari") && !ua.includes("chrome")) return "safari";
  }

  return "unknown";
}

/**
 * Stack trace parsers for different environments
 */
const stackParsers = {
  // V8 (Chrome, Node.js, Edge)
  v8: (line: string): { file: string; line: string; column: string } | null => {
    // Format: "    at functionName (file:line:column)" or "    at file:line:column"
    const match = line.match(/\s+at\s+(?:.*?\s+\()?(.+):(\d+):(\d+)\)?/);
    if (match) {
      return { file: match[1], line: match[2], column: match[3] };
    }
    return null;
  },

  // Firefox
  firefox: (
    line: string
  ): { file: string; line: string; column: string } | null => {
    // Format: "functionName@file:line:column"
    const match = line.match(/(?:.*@)?(.+):(\d+):(\d+)/);
    if (match) {
      return { file: match[1], line: match[2], column: match[3] };
    }
    return null;
  },

  // Safari
  safari: (
    line: string
  ): { file: string; line: string; column: string } | null => {
    // Format: "functionName@file:line:column" or "global code@file:line:column"
    const match = line.match(/(?:.*@)?(.+):(\d+):(\d+)/);
    if (match) {
      return { file: match[1], line: match[2], column: match[3] };
    }
    return null;
  },
};

/**
 * Extract source location from stack trace
 * Returns format: "file:line:column" or "unknown" if not available
 */
function getSourceLocation(stackOffset: number = 2): string {
  const config = getConfig();

  // Check if source location is disabled
  if (!config.includeSource) {
    return "disabled";
  }

  try {
    // Create error to get stack trace
    const error = new Error();

    // Use Error.captureStackTrace if available (V8 only)
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(error, getSourceLocation);
    }

    const stack = error.stack;
    if (!stack) return "unknown";

    const lines = stack.split("\n");
    const targetLine = lines[stackOffset];
    if (!targetLine) return "unknown";

    // Detect environment and use appropriate parser
    const env = detectEnvironment();
    let parser: (
      line: string
    ) => { file: string; line: string; column: string } | null;

    switch (env) {
      case "node":
      case "chrome":
      case "edge":
        parser = stackParsers.v8;
        break;
      case "firefox":
        parser = stackParsers.firefox;
        break;
      case "safari":
        parser = stackParsers.safari;
        break;
      default:
        // Try all parsers
        parser = (line) =>
          stackParsers.v8(line) ||
          stackParsers.firefox(line) ||
          stackParsers.safari(line);
    }

    const result = parser(targetLine);
    if (result) {
      // Handle file path based on configuration
      const fullPath = result.file;
      const filename = fullPath.split("/").pop() || fullPath;
      const file = config.sourceLocation?.includeFullPath ? fullPath : filename;

      // Format based on configuration
      if (config.sourceLocation?.formatter) {
        return config.sourceLocation.formatter(
          file,
          result.line,
          result.column
        );
      }

      const format = config.sourceLocation?.format || "file:line:column";
      switch (format) {
        case "full":
          return `${fullPath}:${result.line}:${result.column}`;
        case "file:line":
          return `${file}:${result.line}`;
        case "file":
          return file;
        case "file:line:column":
        default:
          return `${file}:${result.line}:${result.column}`;
      }
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
  const config = getConfig();
  const stackOffset = options.stackOffset ?? 3;
  const source = options.source ?? getSourceLocation(stackOffset);
  const timestamp = options.timestamp ?? Date.now();

  // Determine if we should capture stack trace
  const shouldCaptureStack =
    options.captureStackTrace ?? config.captureStackTrace ?? !isProduction();

  // Capture stack trace if enabled
  let stack: string | undefined;
  if (shouldCaptureStack) {
    try {
      const error = new Error(options.message);

      // Set stack trace limit if configured
      if (config.stackTraceLimit && typeof Error.stackTraceLimit === "number") {
        const originalLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = config.stackTraceLimit;
        stack = error.stack;
        Error.stackTraceLimit = originalLimit;
      } else {
        stack = error.stack;
      }
    } catch {
      // Stack trace capture failed, continue without it
    }
  }

  const error: TryError<T> = {
    [TRY_ERROR_BRAND]: true,
    type: options.type,
    message: options.message,
    source,
    timestamp,
    stack,
    context: options.context,
    cause: options.cause,
  };

  // Apply global error transformation if configured
  if (config.onError) {
    return config.onError(error) as TryError<T>;
  }

  return error;
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
