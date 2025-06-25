import { TryError, TRY_ERROR_BRAND } from "./types";
import { getConfig } from "./config";

// Performance optimization: Cache environment detection
let cachedEnvironment: string | null = null;
let cachedIsProduction: boolean | null = null;
let cachedConfig: ReturnType<typeof getConfig> | null = null;
let configVersion = 0;

// Track config changes
const originalGetConfig = getConfig;
(getConfig as any).version = 0;

/**
 * Get cached config or fetch new one if changed
 */
function getCachedConfig() {
  const currentVersion = (getConfig as any).version || 0;
  if (cachedConfig === null || configVersion !== currentVersion) {
    cachedConfig = getConfig();
    configVersion = currentVersion;
  }
  return cachedConfig;
}

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
 * Safely check if we're in a production environment (cached)
 */
function isProduction(): boolean {
  // Don't cache in test environment as tests change NODE_ENV
  const isTest =
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV === "test";

  if (!isTest && cachedIsProduction !== null) {
    return cachedIsProduction;
  }

  // Check for Node.js environment
  if (typeof process !== "undefined" && process.env) {
    const isProd = process.env.NODE_ENV === "production";
    if (!isTest) {
      cachedIsProduction = isProd;
    }
    return isProd;
  } else {
    // Default to production for browsers to avoid exposing stack traces
    if (!isTest) {
      cachedIsProduction = true;
    }
    return true;
  }
}

/**
 * Detect the JavaScript environment (cached)
 */
function detectEnvironment():
  | "node"
  | "chrome"
  | "firefox"
  | "safari"
  | "edge"
  | "unknown" {
  if (cachedEnvironment !== null) {
    return cachedEnvironment as any;
  }

  // Node.js
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    cachedEnvironment = "node";
    return "node";
  }

  // Browser detection
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("firefox")) {
      cachedEnvironment = "firefox";
      return "firefox";
    }
    if (ua.includes("edg/")) {
      cachedEnvironment = "edge";
      return "edge";
    }
    if (ua.includes("chrome") && !ua.includes("edg/")) {
      cachedEnvironment = "chrome";
      return "chrome";
    }
    if (ua.includes("safari") && !ua.includes("chrome")) {
      cachedEnvironment = "safari";
      return "safari";
    }
  }

  cachedEnvironment = "unknown";
  return "unknown";
}

/**
 * Stack trace parsers for different environments
 */
const stackParsers = {
  // V8 (Chrome, Node.js, Edge)
  v8: (line: string): { file: string; line: string; column: string } | null => {
    // Format: "    at functionName (file:line:column)" or "    at file:line:column"
    // Updated regex to handle various V8 formats
    const patterns = [
      // "    at functionName (file:line:column)"
      /\s+at\s+.*?\s+\((.+):(\d+):(\d+)\)/,
      // "    at file:line:column"
      /\s+at\s+(.+):(\d+):(\d+)$/,
      // "    at async functionName (file:line:column)"
      /\s+at\s+async\s+.*?\s+\((.+):(\d+):(\d+)\)/,
      // "    at Object.<anonymous> (file:line:column)"
      /\s+at\s+Object\.<anonymous>\s+\((.+):(\d+):(\d+)\)/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return { file: match[1], line: match[2], column: match[3] };
      }
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
  const config = getCachedConfig();

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

    // Debug logging for tests
    if (process.env.NODE_ENV === "test" && process.env.DEBUG_STACK) {
      console.log("Stack trace lines:", lines);
      console.log("Target offset:", stackOffset);
    }

    // Look for the first line that contains actual source information
    let targetLine: string | undefined;
    let adjustedOffset = 1; // Start at 1 to skip the error message line

    // Find the first line that's not from node_modules and contains source info
    while (adjustedOffset < lines.length) {
      const line = lines[adjustedOffset];
      if (line && line.includes(".ts") && !line.includes("node_modules")) {
        targetLine = line;
        break;
      }
      adjustedOffset++;
    }

    if (!targetLine) {
      // Fallback to the original offset if we can't find a good line
      targetLine = lines[stackOffset];
      if (!targetLine) return "unknown";
    }

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
  const config = getCachedConfig();

  // Ultra-fast path for minimal mode
  if (config.minimalErrors) {
    return createMinimalError(
      options.type,
      options.message,
      config.skipContext ? undefined : options.context
    );
  }

  // Fast path for production with minimal features
  if (isProduction() && !options.captureStackTrace && !config.includeSource) {
    const error: TryError<T> = {
      [TRY_ERROR_BRAND]: true,
      type: options.type,
      message: options.message,
      source: options.source ?? "production",
      timestamp: config.skipTimestamp ? 0 : options.timestamp ?? Date.now(),
      stack: undefined,
      context: config.skipContext ? undefined : options.context,
      cause: options.cause,
    };

    // Apply global error transformation if configured
    if (config.onError) {
      return config.onError(error) as TryError<T>;
    }

    return error;
  }

  // Normal path with all features
  const stackOffset =
    options.stackOffset ?? config.sourceLocation?.defaultStackOffset ?? 3;
  const source = options.source ?? getSourceLocation(stackOffset);
  const timestamp = config.skipTimestamp ? 0 : options.timestamp ?? Date.now();

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
 * Create a minimal error for performance-critical paths
 * This bypasses all expensive operations like stack trace capture
 */
export function createMinimalError<T extends string = string>(
  type: T,
  message: string,
  context?: Record<string, unknown>
): TryError<T> {
  const config = getCachedConfig();

  return {
    [TRY_ERROR_BRAND]: true,
    type,
    message,
    source: "minimal",
    timestamp: config.skipTimestamp ? 0 : Date.now(),
    stack: undefined,
    context: config.skipContext ? undefined : context,
    cause: undefined,
  };
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
