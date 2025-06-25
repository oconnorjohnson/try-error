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
    includeSource: false,
    developmentMode: false,
    serializer: (error) => ({
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      // Don't include sensitive information in production
    }),
    onError: (error) => {
      // Minimal logging in production
      if (typeof console !== "undefined") {
        console.error(`Error: ${error.type} - ${error.message}`);
      }
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
