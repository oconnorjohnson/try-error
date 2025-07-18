import { TryError, TRY_ERROR_BRAND } from "./types";
import {
  getConfig,
  getConfigVersion,
  addConfigChangeListener,
  removeConfigChangeListener,
} from "./config";
import { getGlobalErrorPool } from "./pool";
import { createLazyError } from "./lazy";
import { emitErrorCreated } from "./events";

// Performance optimization: Use WeakMap for config cache
const configCache = new WeakMap<
  typeof getConfig,
  ReturnType<typeof getConfig>
>();
let configVersion = 0;

// Environment detection cache with invalidation support
let cachedEnvironment: string | null = null;
let cachedRuntime: "server" | "client" | "edge" | null = null;
let environmentVersion = 0;

// Production detection cache
let cachedIsProduction: boolean | null = null;

// Error deduplication cache
const errorCache = new Map<string, TryError>();
const MAX_ERROR_CACHE_SIZE = 1000;

// Listen for config changes to clear caches
addConfigChangeListener(() => {
  cachedIsProduction = null;
  errorCache.clear();
});

/**
 * Invalidate environment caches (useful for SSR)
 */
export function invalidateEnvironmentCache(): void {
  cachedEnvironment = null;
  cachedRuntime = null;
  cachedIsProduction = null;
  environmentVersion++;
}

/**
 * Get cached config or fetch new one if changed
 */
function getCachedConfig() {
  const currentVersion = getConfigVersion();
  const cached = configCache.get(getConfig);

  if (!cached || configVersion !== currentVersion) {
    const newConfig = getConfig();
    configCache.set(getConfig, newConfig);
    configVersion = currentVersion;
    return newConfig;
  }

  return cached;
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
  // Always re-check in test environment
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
 * Unified environment and runtime detection
 */
function detectEnvironmentAndRuntime(): {
  environment: "node" | "chrome" | "firefox" | "safari" | "edge" | "unknown";
  runtime: "server" | "client" | "edge";
} {
  // Check cache first
  if (cachedEnvironment !== null && cachedRuntime !== null) {
    return {
      environment: cachedEnvironment as
        | "node"
        | "chrome"
        | "firefox"
        | "safari"
        | "edge"
        | "unknown",
      runtime: cachedRuntime,
    };
  }

  let environment:
    | "node"
    | "chrome"
    | "firefox"
    | "safari"
    | "edge"
    | "unknown" = "unknown";
  let runtime: "server" | "client" | "edge" = "client";

  // Edge runtime detection (Cloudflare Workers, Vercel Edge, etc.)
  if (
    typeof globalThis !== "undefined" &&
    // @ts-ignore
    (globalThis.EdgeRuntime ||
      globalThis.caches ||
      // @ts-ignore
      (typeof process !== "undefined" && process.env?.NEXT_RUNTIME === "edge"))
  ) {
    runtime = "edge";
    environment = "edge";
  }
  // Node.js detection
  else if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    environment = "node";
    runtime = "server";
  }
  // Browser detection
  else if (typeof navigator !== "undefined" && navigator.userAgent) {
    runtime = "client";
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes("firefox")) {
      environment = "firefox";
    } else if (ua.includes("edg/")) {
      environment = "edge";
    } else if (ua.includes("chrome") && !ua.includes("edg/")) {
      environment = "chrome";
    } else if (ua.includes("safari") && !ua.includes("chrome")) {
      environment = "safari";
    }
  }

  // Cache the results
  cachedEnvironment = environment;
  cachedRuntime = runtime;

  return { environment, runtime };
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
  return detectEnvironmentAndRuntime().environment;
}

/**
 * Detect the current runtime environment
 * @returns The detected runtime environment
 */
function detectRuntime(): "server" | "client" | "edge" {
  return detectEnvironmentAndRuntime().runtime;
}

/**
 * Stack trace parsers for different environments
 */
const stackParsers = {
  // V8 (Chrome, Node.js, Edge)
  v8: (line: string): { file: string; line: string; column: string } | null => {
    // Format: "    at functionName (file:line:column)" or "    at file:line:column"
    // Updated regex to handle various V8 formats including minified code
    const patterns = [
      // "    at functionName (file:line:column)"
      /\s+at\s+.*?\s+\((.+):(\d+):(\d+)\)/,
      // "    at file:line:column"
      /\s+at\s+(.+):(\d+):(\d+)$/,
      // "    at async functionName (file:line:column)"
      /\s+at\s+async\s+.*?\s+\((.+):(\d+):(\d+)\)/,
      // "    at Object.<anonymous> (file:line:column)"
      /\s+at\s+Object\.<anonymous>\s+\((.+):(\d+):(\d+)\)/,
      // Minified format: "at a.b.c (file:line:column)"
      /\s+at\s+[a-zA-Z$_][\w$]*(?:\.[a-zA-Z$_][\w$]*)*\s+\((.+):(\d+):(\d+)\)/,
      // Eval or anonymous: "at eval (eval at <anonymous> (file:line:column))"
      /\s+at\s+eval\s+\(eval\s+at\s+.*?\((.+):(\d+):(\d+)\)/,
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
    // Handle minified: "a@file:line:column"
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

    // Look for the correct stack frame
    let targetLine: string | undefined;
    let currentOffset = 1; // Start at 1 to skip the error message line
    let validFramesFound = 0;

    // Count valid frames (non-node_modules .ts files)
    const validFrames: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.includes(".ts") && !line.includes("node_modules")) {
        validFrames.push(line);
      }
    }

    // Use the requested frame or the last valid frame if offset is too high
    const adjustedOffset = Math.min(stackOffset - 1, validFrames.length - 1);
    if (adjustedOffset >= 0 && adjustedOffset < validFrames.length) {
      targetLine = validFrames[adjustedOffset];
    }

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
 * Safe JSON stringification that handles circular references
 */
function safeStringify(obj: any): string {
  const seen = new WeakSet();

  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    });
  } catch (error) {
    // Fallback for any other JSON.stringify errors
    return "[Unstringifiable]";
  }
}

/**
 * Generate a cache key for error deduplication
 */
function getErrorCacheKey(
  type: string,
  message: string,
  context?: Record<string, unknown>
): string {
  const contextStr = context ? safeStringify(context) : "";
  return `${type}:${message}:${contextStr}`;
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

  // Check if object pooling is enabled
  const usePooling = config.performance?.errorCreation?.objectPooling ?? false;
  const useLazyEvaluation =
    config.performance?.errorCreation?.lazyStackTrace ?? false;

  // Check error cache for deduplication
  const cacheKey = getErrorCacheKey(
    options.type,
    options.message,
    options.context
  );
  const cachedError = errorCache.get(cacheKey);
  if (cachedError && options.captureStackTrace === undefined) {
    return cachedError as TryError<T>;
  }

  // Ultra-fast path for minimal mode
  if (config.minimalErrors) {
    return createMinimalError(
      options.type,
      options.message,
      config.skipContext ? undefined : options.context
    );
  }

  // Get config once and reuse
  const isProd = isProduction();
  const shouldCaptureStack =
    options.captureStackTrace !== undefined
      ? options.captureStackTrace
      : config.captureStackTrace ?? !isProd;

  // Lazy evaluation path
  if (useLazyEvaluation && !isProd) {
    const stackOffset =
      options.stackOffset ?? config.sourceLocation?.defaultStackOffset ?? 3;

    const lazyError = createLazyError({
      type: options.type,
      message: options.message,
      getSource: () =>
        options.source ??
        (config.includeSource ? getSourceLocation(stackOffset) : "disabled"),
      getStack: shouldCaptureStack
        ? () => {
            try {
              const error = new Error(options.message);
              if (
                config.stackTraceLimit &&
                typeof Error.stackTraceLimit === "number"
              ) {
                const originalLimit = Error.stackTraceLimit;
                Error.stackTraceLimit = config.stackTraceLimit;
                const stack = error.stack;
                Error.stackTraceLimit = originalLimit;
                return stack?.replace(/^Error:/, `${options.type}:`);
              }
              return error.stack?.replace(/^Error:/, `${options.type}:`);
            } catch {
              return undefined;
            }
          }
        : undefined,
      getTimestamp: () =>
        config.skipTimestamp ? 0 : options.timestamp ?? Date.now(),
      context: config.skipContext ? undefined : options.context,
      cause: options.cause,
    });

    // Apply transformations
    let transformedError = lazyError;

    if (config.onError) {
      try {
        transformedError = config.onError(transformedError) as TryError<T>;
      } catch (error) {
        // Log warning but continue with untransformed error
        if (typeof console !== "undefined") {
          console.warn("onError handler failed:", error);
        }
        // Continue with original error
      }
    }

    if (config.runtimeDetection && config.environmentHandlers) {
      const runtime = detectRuntime();
      const handler = config.environmentHandlers[runtime];
      if (handler) {
        try {
          transformedError = handler(transformedError) as TryError<T>;
        } catch (error) {
          // Log warning but continue with untransformed error
          if (typeof console !== "undefined") {
            console.warn("Environment handler failed:", error);
          }
          // Continue with original error
        }
      }
    }

    // Cache the error
    if (errorCache.size >= MAX_ERROR_CACHE_SIZE) {
      const firstKey = errorCache.keys().next().value;
      if (firstKey !== undefined) {
        errorCache.delete(firstKey);
      }
    }
    errorCache.set(cacheKey, transformedError);

    // Emit error created event
    emitErrorCreated(transformedError);

    return transformedError;
  }

  // Fast path for production with minimal features
  if (isProd && !shouldCaptureStack && !config.includeSource) {
    let error: TryError<T>;

    if (usePooling) {
      // Use object pool
      const pool = getGlobalErrorPool();
      const pooledError = pool.acquire<T>();

      // Set properties on pooled error using Object.assign for type safety
      Object.assign(pooledError, {
        type: options.type,
        message: options.message,
        source: options.source ?? "production",
        timestamp: config.skipTimestamp ? 0 : options.timestamp ?? Date.now(),
        stack: undefined,
        context: config.skipContext ? undefined : options.context,
        cause: options.cause,
      });

      error = pooledError as TryError<T>;
    } else {
      error = {
        [TRY_ERROR_BRAND]: true,
        type: options.type,
        message: options.message,
        source: options.source ?? "production",
        timestamp: config.skipTimestamp ? 0 : options.timestamp ?? Date.now(),
        stack: undefined,
        context: config.skipContext ? undefined : options.context,
        cause: options.cause,
      };
    }

    // Apply transformations
    let transformedError = error;

    // Apply global error transformation if configured
    if (config.onError) {
      try {
        transformedError = config.onError(transformedError) as TryError<T>;
      } catch (error) {
        // Log warning but continue with untransformed error
        if (typeof console !== "undefined") {
          console.warn("onError handler failed:", error);
        }
        // Continue with original error
      }
    }

    // Apply runtime-specific handlers if enabled
    if (config.runtimeDetection && config.environmentHandlers) {
      const runtime = detectRuntime();
      const handler = config.environmentHandlers[runtime];
      if (handler) {
        try {
          transformedError = handler(transformedError) as TryError<T>;
        } catch (error) {
          // Log warning but continue with untransformed error
          if (typeof console !== "undefined") {
            console.warn("Environment handler failed:", error);
          }
          // Continue with original error
        }
      }
    }

    // Cache the error
    if (errorCache.size >= MAX_ERROR_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = errorCache.keys().next().value;
      if (firstKey !== undefined) {
        errorCache.delete(firstKey);
      }
    }
    errorCache.set(cacheKey, transformedError);

    // Emit error created event
    emitErrorCreated(transformedError);

    return transformedError;
  }

  // Normal path with all features
  const stackOffset =
    options.stackOffset ?? config.sourceLocation?.defaultStackOffset ?? 3;
  const source =
    options.source ??
    (config.includeSource ? getSourceLocation(stackOffset) : "disabled");
  const timestamp = config.skipTimestamp ? 0 : options.timestamp ?? Date.now();

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

      // Replace "Error:" with the actual error type in the stack trace
      if (stack) {
        stack = stack.replace(/^Error:/, `${options.type}:`);
      }
    } catch {
      // Stack trace capture failed, continue without it
    }
  }

  let error: TryError<T>;

  if (usePooling) {
    // Use object pool for normal path too
    const pool = getGlobalErrorPool();
    const pooledError = pool.acquire<T>();

    // Set properties on pooled error using Object.assign for type safety
    Object.assign(pooledError, {
      type: options.type,
      message: options.message,
      source: source,
      timestamp: timestamp,
      stack: stack,
      context: options.context,
      cause: options.cause,
    });

    error = pooledError as TryError<T>;
  } else {
    error = {
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

  // Apply transformations
  let transformedError = error;

  // Apply global error transformation if configured
  if (config.onError) {
    try {
      transformedError = config.onError(transformedError) as TryError<T>;
    } catch (error) {
      // Log warning but continue with untransformed error
      if (typeof console !== "undefined") {
        console.warn("onError handler failed:", error);
      }
      // Continue with original error
    }
  }

  // Apply runtime-specific handlers if enabled
  if (config.runtimeDetection && config.environmentHandlers) {
    const runtime = detectRuntime();
    const handler = config.environmentHandlers[runtime];
    if (handler) {
      try {
        transformedError = handler(transformedError) as TryError<T>;
      } catch (error) {
        // Log warning but continue with untransformed error
        if (typeof console !== "undefined") {
          console.warn("Environment handler failed:", error);
        }
        // Continue with original error
      }
    }
  }

  // Cache the error
  if (errorCache.size >= MAX_ERROR_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = errorCache.keys().next().value;
    if (firstKey !== undefined) {
      errorCache.delete(firstKey);
    }
  }
  errorCache.set(cacheKey, transformedError);

  // Emit error created event
  emitErrorCreated(transformedError);

  return transformedError;
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

  const error = {
    [TRY_ERROR_BRAND]: true,
    type,
    message,
    source: "minimal",
    timestamp: config.skipTimestamp ? 0 : Date.now(),
    stack: undefined,
    context: config.skipContext ? undefined : context,
    cause: undefined,
  } as TryError<T>;

  // Emit error created event
  emitErrorCreated(error);

  return error;
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
