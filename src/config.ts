/**
 * Configuration utilities for try-error optimization and customization
 *
 * This module provides lightweight configuration options that can be tree-shaken
 * when not used, maintaining the zero-overhead philosophy while making
 * optimizations more accessible.
 */

import { TryError } from "./types";

/**
 * Global configuration state (only created when used)
 */
let globalConfig: TryErrorConfig | null = null;

/**
 * Configuration options for try-error behavior
 */
export interface TryErrorConfig {
  /**
   * Whether to capture stack traces (expensive operation)
   * @default true in development, false in production
   */
  captureStackTrace?: boolean;

  /**
   * Maximum stack trace depth to capture
   * @default 10
   */
  stackTraceLimit?: number;

  /**
   * Include source location in errors
   * @default true
   */
  includeSource?: boolean;

  /**
   * Enable minimal error mode for ultra-lightweight errors
   * @default false
   */
  minimalErrors?: boolean;

  /**
   * Skip timestamp generation (Date.now() calls)
   * @default false
   */
  skipTimestamp?: boolean;

  /**
   * Skip context processing
   * @default false
   */
  skipContext?: boolean;

  /**
   * Source location configuration
   */
  sourceLocation?: {
    /**
     * Default stack offset for source detection
     * Useful when wrapping error creation
     * @default 3
     */
    defaultStackOffset?: number;

    /**
     * Format for source location string
     * @default "file:line:column"
     */
    format?: "full" | "file:line:column" | "file:line" | "file";

    /**
     * Include full file path or just filename
     * @default false (just filename)
     */
    includeFullPath?: boolean;

    /**
     * Custom source location formatter
     */
    formatter?: (file: string, line: string, column: string) => string;
  };

  /**
   * Default error type for untyped errors
   * @default "Error"
   */
  defaultErrorType?: string;

  /**
   * Enable development mode features (verbose logging, etc.)
   * @default false
   */
  developmentMode?: boolean;

  /**
   * Custom error serialization function
   */
  serializer?: (error: TryError) => Record<string, unknown>;

  /**
   * Global error transformation hook
   */
  onError?: (error: TryError) => TryError;

  /**
   * Runtime environment detection for isomorphic apps (Next.js, Nuxt, etc.)
   * When enabled, environment-specific handlers are called based on runtime detection
   * @default false
   */
  runtimeDetection?: boolean;

  /**
   * Environment-specific error handlers (used with runtimeDetection)
   */
  environmentHandlers?: {
    server?: (error: TryError) => TryError;
    client?: (error: TryError) => TryError;
    edge?: (error: TryError) => TryError;
  };
}

/**
 * Performance-specific configuration options
 */
export interface PerformanceConfig {
  /**
   * Error creation optimization settings
   */
  errorCreation?: {
    /**
     * Cache error constructors for reuse
     * @default false
     */
    cacheConstructors?: boolean;

    /**
     * Only capture stack trace when accessed (lazy)
     * @default false
     */
    lazyStackTrace?: boolean;

    /**
     * Enable experimental object pooling
     * @default false
     */
    objectPooling?: boolean;

    /**
     * Object pool size when pooling is enabled
     * @default 50
     */
    poolSize?: number;
  };

  /**
   * Context capture optimization settings
   */
  contextCapture?: {
    /**
     * Maximum context size in bytes
     * @default 10240 (10KB)
     */
    maxContextSize?: number;

    /**
     * Whether to deep clone context objects
     * @default true
     */
    deepClone?: boolean;

    /**
     * Timeout for async context capture in milliseconds
     * @default 100
     */
    timeout?: number;
  };

  /**
   * Memory management settings
   */
  memory?: {
    /**
     * Maximum number of errors to keep in history
     * @default 100
     */
    maxErrorHistory?: number;

    /**
     * Use weak references for large contexts
     * @default false
     */
    useWeakRefs?: boolean;

    /**
     * Provide garbage collection hints
     * @default false
     */
    gcHints?: boolean;
  };
}

/**
 * Environment-specific configuration presets
 */
export const ConfigPresets = {
  /**
   * Development configuration with full debugging features
   */
  development: (): TryErrorConfig => ({
    captureStackTrace: true,
    stackTraceLimit: 50,
    includeSource: true,
    developmentMode: true,
    onError: (error) => {
      if (typeof console !== "undefined") {
        console.group(`🚨 TryError: ${error.type}`);
        console.error("Message:", error.message);
        console.error("Source:", error.source);
        console.error("Context:", error.context);
        if (error.stack) console.error("Stack:", error.stack);
        console.groupEnd();
      }
      return error;
    },
  }),

  /**
   * Production configuration optimized for performance
   */
  production: (): TryErrorConfig => ({
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: true, // Keep source for debugging in logs
    developmentMode: false,
    serializer: (error) => ({
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      source: error.source,
      // Omit sensitive context in serialization
    }),
    onError: (error) => {
      // Production: Send to monitoring, not console
      // Users should integrate their error service here

      // Example integrations (commented out):
      // if (typeof window !== 'undefined' && window.Sentry) {
      //   window.Sentry.captureException(error);
      // }
      // if (typeof process !== 'undefined' && global.logger) {
      //   global.logger.error('Application error', error);
      // }

      // By default: No console logging in production
      // This keeps end-user console clean
      return error;
    },
  }),

  /**
   * Testing configuration with assertion-friendly features
   */
  test: (): TryErrorConfig => ({
    captureStackTrace: true,
    stackTraceLimit: 10,
    includeSource: true,
    developmentMode: true,
    serializer: (error) => ({
      type: error.type,
      message: error.message,
      context: error.context,
      source: error.source,
    }),
  }),

  /**
   * High-performance configuration for critical paths
   */
  performance: (): TryErrorConfig & { performance: PerformanceConfig } => ({
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: false,
    developmentMode: false,
    performance: {
      errorCreation: {
        cacheConstructors: true,
        lazyStackTrace: true,
        objectPooling: true,
        poolSize: 100,
      },
      contextCapture: {
        maxContextSize: 1024 * 5, // 5KB
        deepClone: false,
        timeout: 50,
      },
      memory: {
        maxErrorHistory: 50,
        useWeakRefs: true,
        gcHints: true,
      },
    },
  }),

  /**
   * Minimal configuration for <50% overhead target
   */
  minimal: (): TryErrorConfig => ({
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: false,
    developmentMode: false,
    minimalErrors: true,
    skipTimestamp: true,
    skipContext: true,
  }),

  /**
   * Server production with logging
   */
  serverProduction: (): TryErrorConfig => ({
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: true,
    developmentMode: false,
    onError: (error) => {
      // Server: Log to your logging service
      // This is where you'd integrate with Winston, Pino, etc.

      // Example (implement based on your logger):
      // logger.error({
      //   type: error.type,
      //   message: error.message,
      //   source: error.source,
      //   timestamp: error.timestamp,
      //   context: error.context,
      // });

      return error;
    },
  }),

  /**
   * Client production with error tracking
   */
  clientProduction: (): TryErrorConfig => ({
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: true,
    developmentMode: false,
    serializer: (error) => ({
      // Only send non-sensitive data to tracking services
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      source: error.source,
      // Omit potentially sensitive context
    }),
    onError: (error) => {
      // Client: Send to error tracking, no console

      // Common integrations (implement as needed):
      // if (window.Sentry) {
      //   window.Sentry.captureException(error);
      // }
      // if (window.LogRocket) {
      //   window.LogRocket.captureException(error);
      // }
      // if (window.bugsnag) {
      //   window.bugsnag.notify(error);
      // }

      // No console output - keeps user console clean
      return error;
    },
  }),

  /**
   * Edge/Serverless optimized
   */
  edge: (): TryErrorConfig => ({
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: false, // Minimize overhead
    developmentMode: false,
    minimalErrors: true,
    skipTimestamp: false, // Keep timestamp for logs
    skipContext: false, // Keep context for debugging
    onError: (error) => {
      // Edge: Use platform-specific logging

      // Cloudflare Workers example:
      // if (typeof caches !== 'undefined') {
      //   console.log(JSON.stringify({
      //     type: error.type,
      //     message: error.message,
      //     timestamp: error.timestamp,
      //   }));
      // }

      return error;
    },
  }),
} as const;

/**
 * Configure global try-error behavior
 *
 * @param config - Configuration options or preset name
 *
 * @example
 * ```typescript
 * // Use a preset
 * configure('production');
 *
 * // Custom configuration
 * configure({
 *   captureStackTrace: false,
 *   onError: (error) => sendToMonitoring(error)
 * });
 *
 * // Environment-based configuration
 * configure(process.env.NODE_ENV === 'production' ? 'production' : 'development');
 * ```
 */
export function configure(
  config: TryErrorConfig | keyof typeof ConfigPresets
): void {
  if (typeof config === "string") {
    globalConfig = ConfigPresets[config]();
  } else {
    globalConfig = { ...globalConfig, ...config };
  }
  // Increment version to invalidate caches
  (getConfig as any).version = ((getConfig as any).version || 0) + 1;
}

/**
 * Get the current global configuration
 * Returns default values if no configuration has been set
 */
export function getConfig(): TryErrorConfig {
  return (
    globalConfig || {
      captureStackTrace:
        typeof process !== "undefined"
          ? process.env.NODE_ENV !== "production"
          : true,
      stackTraceLimit: 10,
      includeSource: true,
      defaultErrorType: "Error",
      developmentMode: false,
    }
  );
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  globalConfig = null;
  // Increment version to invalidate caches
  (getConfig as any).version = ((getConfig as any).version || 0) + 1;
}

/**
 * Create a scoped configuration that doesn't affect global state
 * Useful for testing or isolated components
 *
 * @param config - Scoped configuration
 * @returns Functions that use the scoped config
 *
 * @example
 * ```typescript
 * const { createError } = createScope({
 *   captureStackTrace: false,
 *   defaultErrorType: 'CustomError'
 * });
 *
 * const error = createError({ message: 'Test error' });
 * ```
 */
export function createScope(config: TryErrorConfig) {
  const scopedConfig = { ...getConfig(), ...config };

  return {
    config: scopedConfig,
    createError: (
      options: Omit<import("./errors").CreateErrorOptions, "type"> & {
        type?: string;
      }
    ) => {
      return import("./errors").then(({ createError }) =>
        createError({
          type: scopedConfig.defaultErrorType || "Error",
          ...options,
        })
      );
    },
  };
}

/**
 * Utility to create environment-aware configuration
 *
 * @example
 * ```typescript
 * configure(createEnvConfig({
 *   development: { captureStackTrace: true, developmentMode: true },
 *   production: { captureStackTrace: false, onError: sendToSentry },
 *   test: { captureStackTrace: true, developmentMode: true }
 * }));
 * ```
 */
export function createEnvConfig(configs: {
  development?: TryErrorConfig;
  production?: TryErrorConfig;
  test?: TryErrorConfig;
  [key: string]: TryErrorConfig | undefined;
}): TryErrorConfig {
  const env =
    typeof process !== "undefined"
      ? process.env.NODE_ENV || "development"
      : "development";

  return configs[env] || configs.development || {};
}

/**
 * Helper to create production config with error service integration
 *
 * @example
 * ```typescript
 * // Sentry integration
 * configure(withErrorService((error) => {
 *   Sentry.captureException(error);
 * }));
 *
 * // Multiple services
 * configure(withErrorService((error) => {
 *   Sentry.captureException(error);
 *   analytics.track('error', { type: error.type });
 * }));
 * ```
 */
export function withErrorService(
  handler: (error: TryError) => void,
  options?: Partial<TryErrorConfig>
): TryErrorConfig {
  const isServer = typeof window === "undefined";
  const baseConfig = isServer
    ? ConfigPresets.serverProduction()
    : ConfigPresets.clientProduction();

  return {
    ...baseConfig,
    ...options,
    onError: (error) => {
      try {
        handler(error);
      } catch (e) {
        // Don't let error service failures break the app
        if (
          typeof console !== "undefined" &&
          process.env.NODE_ENV !== "production"
        ) {
          console.warn("Error service integration failed:", e);
        }
      }
      return options?.onError ? options.onError(error) : error;
    },
  };
}

/**
 * Performance monitoring utilities
 */
export const Performance = {
  /**
   * Measure error creation performance
   */
  measureErrorCreation: (iterations: number = 1000) => {
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    for (let i = 0; i < iterations; i++) {
      import("./errors").then(({ createError }) =>
        createError({
          type: "TestError",
          message: "Performance test",
          context: { iteration: i },
        })
      );
    }

    const end =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    return {
      totalTime: end - start,
      averageTime: (end - start) / iterations,
      iterations,
    };
  },

  /**
   * Get memory usage information (Node.js only)
   */
  getMemoryUsage: () => {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage();
    }
    return null;
  },
};
