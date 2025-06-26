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
 * Simple LRU cache implementation for preset configurations
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Remove key if it exists (to reorder)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Evict oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Preset cache with LRU eviction
const presetCache = new LRUCache<string, TryErrorConfig>(20);

/**
 * Configuration version tracker for cache invalidation
 * More robust than attaching version to function objects
 */
class ConfigVersionTracker {
  private version = 0;
  private listeners = new Set<() => void>();

  increment(): void {
    this.version++;
    // Notify all listeners about version change
    this.listeners.forEach((listener) => listener());
  }

  getVersion(): number {
    return this.version;
  }

  addListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }
}

const configVersionTracker = new ConfigVersionTracker();

// Export for use in errors.ts
export function getConfigVersion(): number {
  return configVersionTracker.getVersion();
}

export function addConfigChangeListener(listener: () => void): void {
  configVersionTracker.addListener(listener);
}

export function removeConfigChangeListener(listener: () => void): void {
  configVersionTracker.removeListener(listener);
}

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
 * Deep merge two configuration objects
 */
function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

/**
 * Validate configuration object
 */
function validateConfig(config: unknown): config is TryErrorConfig {
  if (typeof config !== "object" || config === null) {
    return false;
  }

  const cfg = config as any;

  // Validate boolean fields
  const booleanFields = [
    "captureStackTrace",
    "includeSource",
    "minimalErrors",
    "skipTimestamp",
    "skipContext",
    "developmentMode",
    "runtimeDetection",
  ];

  for (const field of booleanFields) {
    if (field in cfg && typeof cfg[field] !== "boolean") {
      console.warn(`Configuration field '${field}' must be a boolean`);
      return false;
    }
  }

  // Validate number fields
  if ("stackTraceLimit" in cfg && typeof cfg.stackTraceLimit !== "number") {
    console.warn("Configuration field 'stackTraceLimit' must be a number");
    return false;
  }

  // Validate string fields
  if ("defaultErrorType" in cfg && typeof cfg.defaultErrorType !== "string") {
    console.warn("Configuration field 'defaultErrorType' must be a string");
    return false;
  }

  // Validate function fields
  const functionFields = ["serializer", "onError"];
  for (const field of functionFields) {
    if (field in cfg && typeof cfg[field] !== "function") {
      console.warn(`Configuration field '${field}' must be a function`);
      return false;
    }
  }

  return true;
}

/**
 * Environment-specific configuration presets
 * Made immutable by using Object.freeze
 */
export const ConfigPresets = Object.freeze({
  /**
   * Development configuration with full debugging features
   */
  development: (): TryErrorConfig => {
    const cached = presetCache.get("development");
    if (cached) return cached;

    const config = Object.freeze({
      captureStackTrace: true,
      stackTraceLimit: 50,
      includeSource: true,
      developmentMode: true,
      onError: (error: TryError) => {
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
    });

    presetCache.set("development", config);
    return config;
  },

  /**
   * Production configuration optimized for performance
   */
  production: (): TryErrorConfig => {
    const cached = presetCache.get("production");
    if (cached) return cached;

    const config = Object.freeze({
      captureStackTrace: false,
      stackTraceLimit: 0,
      includeSource: true, // Keep source for debugging in logs
      developmentMode: false,
      serializer: (error: TryError) => ({
        type: error.type,
        message: error.message,
        timestamp: error.timestamp,
        source: error.source,
        // Omit sensitive context in serialization
      }),
      onError: (error: TryError) => {
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
    });

    presetCache.set("production", config);
    return config;
  },

  /**
   * Testing configuration with assertion-friendly features
   */
  test: (): TryErrorConfig => {
    const cached = presetCache.get("test");
    if (cached) return cached;

    const config = Object.freeze({
      captureStackTrace: true,
      stackTraceLimit: 10,
      includeSource: true,
      developmentMode: true,
      serializer: (error: TryError) => ({
        type: error.type,
        message: error.message,
        context: error.context,
        source: error.source,
      }),
    });

    presetCache.set("test", config);
    return config;
  },

  /**
   * High-performance configuration for critical paths
   */
  performance: (): TryErrorConfig & { performance: PerformanceConfig } => {
    const cached = presetCache.get("performance");
    if (cached) return cached as any;

    const config = Object.freeze({
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
    });

    presetCache.set("performance", config);
    return config;
  },

  /**
   * Minimal configuration for <50% overhead target
   */
  minimal: (): TryErrorConfig => {
    const cached = presetCache.get("minimal");
    if (cached) return cached;

    const config = Object.freeze({
      captureStackTrace: false,
      stackTraceLimit: 0,
      includeSource: false,
      developmentMode: false,
      minimalErrors: true,
      skipTimestamp: true,
      skipContext: true,
    });

    presetCache.set("minimal", config);
    return config;
  },

  /**
   * Server production with logging
   */
  serverProduction: (): TryErrorConfig => {
    const cached = presetCache.get("serverProduction");
    if (cached) return cached;

    const config = Object.freeze({
      captureStackTrace: false,
      stackTraceLimit: 0,
      includeSource: true,
      developmentMode: false,
      onError: (error: TryError) => {
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
    });

    presetCache.set("serverProduction", config);
    return config;
  },

  /**
   * Client production with error tracking
   */
  clientProduction: (): TryErrorConfig => {
    const cached = presetCache.get("clientProduction");
    if (cached) return cached;

    const config = Object.freeze({
      captureStackTrace: false,
      stackTraceLimit: 0,
      includeSource: true,
      developmentMode: false,
      serializer: (error: TryError) => ({
        // Only send non-sensitive data to tracking services
        type: error.type,
        message: error.message,
        timestamp: error.timestamp,
        source: error.source,
        // Omit potentially sensitive context
      }),
      onError: (error: TryError) => {
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
    });

    presetCache.set("clientProduction", config);
    return config;
  },

  /**
   * Edge/Serverless optimized
   */
  edge: (): TryErrorConfig => {
    const cached = presetCache.get("edge");
    if (cached) return cached;

    const config = Object.freeze({
      captureStackTrace: false,
      stackTraceLimit: 0,
      includeSource: false, // Minimize overhead
      developmentMode: false,
      minimalErrors: true,
      skipTimestamp: false, // Keep timestamp for logs
      skipContext: false, // Keep context for debugging
      onError: (error: TryError) => {
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
    });

    presetCache.set("edge", config);
    return config;
  },

  /**
   * Next.js optimized configuration with runtime detection
   * Automatically applies the correct handler based on where the error occurs
   */
  nextjs: (): TryErrorConfig => {
    const cached = presetCache.get("nextjs");
    if (cached) return cached;

    const config = Object.freeze({
      runtimeDetection: true,
      captureStackTrace: process.env.NODE_ENV !== "production",
      stackTraceLimit: process.env.NODE_ENV === "production" ? 5 : 20,
      includeSource: true,
      developmentMode: process.env.NODE_ENV === "development",

      environmentHandlers: {
        server: (error: TryError) => {
          // Server-side: Log to console or logging service
          if (process.env.NODE_ENV === "production") {
            // Production: Minimal logging
            console.error(`[Server Error] ${error.type}: ${error.message}`);

            // Example integration with logging service:
            // logger.error({
            //   type: error.type,
            //   message: error.message,
            //   source: error.source,
            //   timestamp: error.timestamp,
            //   context: error.context,
            // });
          } else {
            // Development: Detailed logging
            console.group(`🚨 [Server] TryError: ${error.type}`);
            console.error("Message:", error.message);
            console.error("Source:", error.source);
            console.error("Context:", error.context);
            if (error.stack) console.error("Stack:", error.stack);
            console.groupEnd();
          }
          return error;
        },

        client: (error: TryError) => {
          // Client-side: Send to error tracking, no console in production
          if (process.env.NODE_ENV === "production") {
            // Example integrations:
            // if (window.Sentry) {
            //   window.Sentry.captureException(error);
            // }
            // if (window.LogRocket) {
            //   window.LogRocket.captureException(error);
            // }
            // No console output in production
          } else {
            // Development: Console logging
            console.group(`🚨 [Client] TryError: ${error.type}`);
            console.error("Message:", error.message);
            console.error("Context:", error.context);
            console.groupEnd();
          }
          return error;
        },

        edge: (error: TryError) => {
          // Edge runtime: Minimal logging
          console.log(
            JSON.stringify({
              type: error.type,
              message: error.message,
              timestamp: error.timestamp,
              runtime: "edge",
            })
          );
          return error;
        },
      },
    });

    presetCache.set("nextjs", config);
    return config;
  },
} as const);

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
    const presetFn = ConfigPresets[config];
    if (!presetFn) {
      throw new Error(`Unknown configuration preset: ${config}`);
    }
    const presetConfig = presetFn();
    if (!validateConfig(presetConfig)) {
      throw new Error(`Invalid preset configuration: ${config}`);
    }
    globalConfig = presetConfig;
  } else {
    if (!validateConfig(config)) {
      throw new Error("Invalid configuration object");
    }
    globalConfig = globalConfig ? deepMerge(globalConfig, config) : config;
  }
  // Increment version to invalidate caches
  configVersionTracker.increment();
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
  configVersionTracker.increment();
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
   * Get high-resolution time in milliseconds
   * Falls back gracefully based on environment
   */
  now(): number {
    // Node.js high-resolution time
    if (
      typeof process !== "undefined" &&
      process.hrtime &&
      process.hrtime.bigint
    ) {
      const hrTime = process.hrtime.bigint();
      return Number(hrTime) / 1_000_000; // Convert nanoseconds to milliseconds
    }

    // Browser performance.now()
    if (typeof performance !== "undefined" && performance.now) {
      return performance.now();
    }

    // Fallback to Date.now() with warning in development
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(
        "High-resolution timing not available, falling back to Date.now()"
      );
    }
    return Date.now();
  },

  /**
   * Measure error creation performance
   */
  measureErrorCreation: async (iterations: number = 1000) => {
    // Import createError dynamically to avoid circular dependencies
    const { createError } = await import("./errors");

    // Warm up to avoid JIT compilation affecting measurements
    for (let i = 0; i < 10; i++) {
      createError({
        type: "WarmupError",
        message: "Warmup",
        context: { iteration: i },
      });
    }

    const start = Performance.now();

    // Create errors synchronously to measure actual performance
    const errors: TryError[] = [];
    for (let i = 0; i < iterations; i++) {
      errors.push(
        createError({
          type: "TestError",
          message: "Performance test",
          context: { iteration: i },
        })
      );
    }

    const end = Performance.now();

    return {
      totalTime: end - start,
      averageTime: (end - start) / iterations,
      iterations,
      errors: errors.length, // Ensure errors are not optimized away
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
