/**
 * One-liner setup utilities for common try-error configurations
 *
 * This module provides simple setup functions that configure try-error
 * for common scenarios with sensible defaults, reducing boilerplate
 * while maintaining full customization options.
 */

import { configure, createEnvConfig, TryErrorConfig } from "./config";

/**
 * Quick setup for Node.js/Express applications
 * Automatically configures based on NODE_ENV with sensible defaults
 *
 * @param options - Optional custom configuration overrides
 *
 * @example
 * ```typescript
 * // At the top of your app.ts or server.ts
 * import { setupNode } from 'try-error/setup';
 *
 * setupNode(); // Uses environment-based defaults
 *
 * // Or with custom options
 * setupNode({
 *   onError: (error) => sendToSentry(error)
 * });
 * ```
 */
export function setupNode(options: TryErrorConfig = {}): void {
  const config = createEnvConfig({
    development: {
      captureStackTrace: true,
      stackTraceLimit: 50,
      developmentMode: true,
      onError: (error) => {
        console.group(`🚨 TryError: ${error.type}`);
        console.error("Message:", error.message);
        console.error("Source:", error.source);
        console.error("Context:", error.context);
        if (error.stack) console.error("Stack:", error.stack);
        console.groupEnd();
        return error;
      },
    },
    production: {
      captureStackTrace: false,
      stackTraceLimit: 0,
      includeSource: false,
      developmentMode: false,
      onError: (error) => {
        console.error(`[ERROR] ${error.type}: ${error.message}`);
        return error;
      },
    },
    test: {
      captureStackTrace: true,
      stackTraceLimit: 10,
      developmentMode: true,
    },
  });

  configure({ ...config, ...options });
}

/**
 * Quick setup for React applications (client-side)
 * Optimized for browser environments with client-side error reporting
 *
 * @param options - Optional custom configuration overrides
 *
 * @example
 * ```typescript
 * // In your main.tsx or index.tsx
 * import { setupReact } from 'try-error/setup';
 *
 * setupReact(); // Basic setup
 *
 * // With error reporting
 * setupReact({
 *   onError: (error) => {
 *     // Send to analytics
 *     gtag('event', 'exception', {
 *       description: `${error.type}: ${error.message}`,
 *       fatal: false
 *     });
 *   }
 * });
 * ```
 */
export function setupReact(options: TryErrorConfig = {}): void {
  const isDev =
    typeof process !== "undefined"
      ? process.env.NODE_ENV === "development"
      : !window.location.hostname.includes("localhost") === false;

  const config: TryErrorConfig = {
    captureStackTrace: isDev,
    stackTraceLimit: isDev ? 20 : 3,
    includeSource: isDev,
    developmentMode: isDev,
    onError: (error) => {
      if (isDev && typeof console !== "undefined") {
        console.group(`🚨 TryError: ${error.type}`);
        console.error("Message:", error.message);
        console.error("Context:", error.context);
        console.groupEnd();
      }
      return error;
    },
  };

  configure({ ...config, ...options });
}

/**
 * Quick setup for Next.js applications
 * Handles both server-side and client-side environments
 *
 * @param options - Optional custom configuration overrides
 *
 * @example
 * ```typescript
 * // In your layout.tsx or _app.tsx
 * import { setupNextJs } from 'try-error/setup';
 *
 * setupNextJs(); // Automatic server/client detection
 *
 * // With custom error reporting
 * setupNextJs({
 *   onError: (error) => {
 *     if (typeof window !== 'undefined') {
 *       // Client-side: send to API
 *       fetch('/api/errors', {
 *         method: 'POST',
 *         body: JSON.stringify({ error: error.message, type: error.type })
 *       }).catch(() => {});
 *     } else {
 *       // Server-side: log to console
 *       console.error(`[SSR ERROR] ${error.type}: ${error.message}`);
 *     }
 *   }
 * });
 * ```
 */
export function setupNextJs(options: TryErrorConfig = {}): void {
  const isServer = typeof window === "undefined";
  const isDev =
    typeof process !== "undefined"
      ? process.env.NODE_ENV === "development"
      : false;

  const config: TryErrorConfig = {
    captureStackTrace: isDev,
    stackTraceLimit: isDev ? (isServer ? 50 : 20) : isServer ? 5 : 3,
    includeSource: isDev,
    developmentMode: isDev,
    onError: (error) => {
      if (isDev && typeof console !== "undefined") {
        const prefix = isServer ? "[SSR]" : "[Client]";
        console.group(`🚨 ${prefix} TryError: ${error.type}`);
        console.error("Message:", error.message);
        console.error("Source:", error.source);
        console.error("Context:", error.context);
        console.groupEnd();
      }
      return error;
    },
  };

  configure({ ...config, ...options });
}

/**
 * High-performance setup for critical applications
 * Minimal overhead configuration optimized for production performance
 *
 * @param options - Optional custom configuration overrides
 *
 * @example
 * ```typescript
 * // For high-throughput APIs or performance-critical applications
 * import { setupPerformance } from 'try-error/setup';
 *
 * setupPerformance(); // Maximum performance
 *
 * // With minimal error reporting
 * setupPerformance({
 *   onError: (error) => {
 *     // Only log critical errors
 *     if (error.type === 'CriticalError') {
 *       console.error(`CRITICAL: ${error.message}`);
 *     }
 *   }
 * });
 * ```
 */
export function setupPerformance(options: TryErrorConfig = {}): void {
  const config: TryErrorConfig = {
    captureStackTrace: false,
    stackTraceLimit: 0,
    includeSource: false,
    developmentMode: false,
    serializer: (error) => ({
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
    }),
  };

  configure({ ...config, ...options });
}

/**
 * Testing setup with assertion-friendly configuration
 * Optimized for unit tests and integration tests
 *
 * @param options - Optional custom configuration overrides
 *
 * @example
 * ```typescript
 * // In your test setup file
 * import { setupTesting } from 'try-error/setup';
 *
 * setupTesting(); // Test-friendly defaults
 *
 * // With test error collection
 * const errors: TryError[] = [];
 * setupTesting({
 *   onError: (error) => {
 *     errors.push(error);
 *     return error;
 *   }
 * });
 * ```
 */
export function setupTesting(options: TryErrorConfig = {}): void {
  const config: TryErrorConfig = {
    captureStackTrace: true,
    stackTraceLimit: 10,
    includeSource: true,
    developmentMode: true,
    serializer: (error) => ({
      type: error.type,
      message: error.message,
      context: error.context,
      source: error.source,
      stack: error.stack,
    }),
  };

  configure({ ...config, ...options });
}

/**
 * Auto-setup that detects the environment and applies appropriate configuration
 * Convenience function for projects that want zero-config setup
 *
 * @param options - Optional custom configuration overrides
 *
 * @example
 * ```typescript
 * // One-liner setup that works everywhere
 * import { autoSetup } from 'try-error/setup';
 *
 * autoSetup(); // Detects Node.js, React, Next.js, etc.
 * ```
 */
export function autoSetup(options: TryErrorConfig = {}): void {
  // Detect environment
  const isNode = typeof process !== "undefined" && process.versions?.node;
  const isBrowser = typeof window !== "undefined";
  const isNextJs =
    typeof process !== "undefined" &&
    process.env.__NEXT_PRIVATE_PREBUNDLED_REACT;
  const isTest =
    typeof process !== "undefined" &&
    (process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID);

  if (isTest) {
    setupTesting(options);
  } else if (isNextJs) {
    setupNextJs(options);
  } else if (isBrowser) {
    setupReact(options);
  } else if (isNode) {
    setupNode(options);
  } else {
    // Fallback to basic configuration
    configure({
      captureStackTrace: true,
      stackTraceLimit: 10,
      includeSource: true,
      developmentMode: false,
      ...options,
    });
  }
}

/**
 * Create a custom setup function with your own defaults
 * Useful for organizations that want to standardize configuration
 *
 * @param baseConfig - Base configuration to use as defaults
 * @returns A setup function that applies the base config with optional overrides
 *
 * @example
 * ```typescript
 * // Create your organization's standard setup
 * const setupMyApp = createCustomSetup({
 *   onError: (error) => sendToMyMonitoringService(error),
 *   serializer: (error) => myCustomSerializer(error)
 * });
 *
 * // Use in your applications
 * setupMyApp(); // Uses your defaults
 * setupMyApp({ developmentMode: true }); // Override specific options
 * ```
 */
export function createCustomSetup(baseConfig: TryErrorConfig) {
  return (options: TryErrorConfig = {}) => {
    configure({ ...baseConfig, ...options });
  };
}
