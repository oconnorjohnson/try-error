/**
 * One-liner setup utilities for common try-error configurations
 *
 * This module provides simple setup functions that configure try-error
 * for common scenarios with sensible defaults, reducing boilerplate
 * while maintaining full customization options.
 */

import {
  configure,
  createEnvConfig,
  TryErrorConfig,
  ConfigPresets,
  getConfig,
  resetConfig,
} from "./config";

// Track active setups for teardown
const activeSetups = new Set<string>();

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
  activeSetups.add("node");
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
      : typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.startsWith("192.168.") ||
          window.location.hostname.startsWith("10.") ||
          window.location.hostname === "[::1]"); // IPv6 localhost

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
  activeSetups.add("react");
}

/**
 * Quick setup for Next.js applications
 * Uses runtime detection to automatically apply the correct configuration
 *
 * @param options - Optional custom configuration overrides
 *
 * @example
 * ```typescript
 * // Simple setup with automatic runtime detection
 * setupNextJs();
 *
 * // With custom error handlers
 * setupNextJs({
 *   environmentHandlers: {
 *     server: (error) => {
 *       logger.error('Server error', error);
 *       return error;
 *     },
 *     client: (error) => {
 *       Sentry.captureException(error);
 *       return error;
 *     }
 *   }
 * });
 *
 * // Or override specific options
 * setupNextJs({
 *   captureStackTrace: false,
 *   includeSource: true
 * });
 * ```
 */
export function setupNextJs(options: TryErrorConfig = {}): void {
  // Improved Next.js detection
  const isNextJs =
    typeof process !== "undefined" &&
    (process.env.NEXT_RUNTIME ||
      process.env.__NEXT_PRIVATE_PREBUNDLED_REACT ||
      process.env.NEXT_PUBLIC_VERCEL_ENV);

  if (!isNextJs) {
    console.warn("setupNextJs called but Next.js environment not detected");
  }

  const nextjsConfig = ConfigPresets.nextjs();

  // Merge custom options with Next.js preset
  const finalConfig: TryErrorConfig = {
    ...nextjsConfig,
    ...options,
  };

  // If custom environment handlers are provided, merge them with defaults
  if (options.environmentHandlers) {
    finalConfig.environmentHandlers = {
      ...nextjsConfig.environmentHandlers,
      ...options.environmentHandlers,
    };
  }

  configure(finalConfig);
  activeSetups.add("nextjs");
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
  activeSetups.add("performance");
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
  activeSetups.add("testing");
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
  // Detect environment with improved heuristics
  const hasProcess = typeof process !== "undefined";
  const hasWindow = typeof window !== "undefined";
  const hasDocument = typeof document !== "undefined";
  const hasNavigator = typeof navigator !== "undefined";

  // Node.js detection
  const isNode =
    hasProcess && process.versions?.node !== undefined && !hasWindow;

  // Browser detection
  const isBrowser = hasWindow && hasDocument && hasNavigator;

  // Next.js detection (works in both server and client)
  const isNextJs =
    hasProcess &&
    (process.env.NEXT_RUNTIME !== undefined ||
      process.env.__NEXT_PRIVATE_PREBUNDLED_REACT !== undefined ||
      process.env.NEXT_PUBLIC_VERCEL_ENV !== undefined ||
      (hasWindow && (window as any).__NEXT_DATA__ !== undefined));

  // Test environment detection
  const isTest =
    hasProcess &&
    (process.env.NODE_ENV === "test" ||
      process.env.JEST_WORKER_ID !== undefined ||
      process.env.VITEST !== undefined ||
      (hasWindow && (window as any).__karma__ !== undefined) || // Karma
      (hasWindow && (window as any).Cypress !== undefined)); // Cypress

  // Deno detection
  const isDeno = typeof (globalThis as any).Deno !== "undefined";

  // Bun detection
  const isBun = typeof (globalThis as any).Bun !== "undefined";

  // React Native detection
  const isReactNative = hasNavigator && navigator.product === "ReactNative";

  // Electron detection
  const isElectron = hasProcess && process.versions?.electron !== undefined;

  let setupType: string;

  if (isTest) {
    setupTesting(options);
    setupType = "test";
  } else if (isNextJs) {
    setupNextJs(options);
    setupType = "nextjs";
  } else if (isReactNative) {
    // React Native gets React setup with some modifications
    setupReact({
      captureStackTrace: false, // Stack traces are expensive on mobile
      stackTraceLimit: 5,
      ...options,
    });
    setupType = "react-native";
  } else if (isElectron) {
    // Electron can use Node setup
    setupNode(options);
    setupType = "electron";
  } else if (isBrowser) {
    setupReact(options);
    setupType = "react";
  } else if (isNode || isDeno || isBun) {
    setupNode(options);
    setupType = isNode ? "node" : isDeno ? "deno" : "bun";
  } else {
    // Fallback to basic configuration
    configure({
      captureStackTrace: true,
      stackTraceLimit: 10,
      includeSource: true,
      developmentMode: false,
      ...options,
    });
    setupType = "fallback";
  }

  activeSetups.add(setupType);
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

/**
 * Validate that setup was successful
 *
 * @returns Object with validation results
 *
 * @example
 * ```typescript
 * setupNode();
 * const validation = validateSetup();
 * if (!validation.isValid) {
 *   console.error('Setup failed:', validation.errors);
 * }
 * ```
 */
export function validateSetup(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  activeSetups: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = getConfig();

  // Check if any setup was called
  if (activeSetups.size === 0) {
    warnings.push("No setup function has been called");
  }

  // Check for conflicting setups
  if (activeSetups.has("node") && activeSetups.has("react")) {
    warnings.push("Both Node.js and React setups are active");
  }

  // Validate configuration
  if (typeof config.captureStackTrace !== "boolean") {
    errors.push("Invalid captureStackTrace configuration");
  }

  if (config.stackTraceLimit && typeof config.stackTraceLimit !== "number") {
    errors.push("Invalid stackTraceLimit configuration");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    activeSetups: Array.from(activeSetups),
  };
}

/**
 * Compose multiple setup configurations
 *
 * @param setups - Array of setup functions to compose
 * @returns A new setup function that applies all configurations
 *
 * @example
 * ```typescript
 * const mySetup = composeSetups([
 *   () => setupNode({ captureStackTrace: true }),
 *   () => configure({ onError: myErrorHandler })
 * ]);
 *
 * mySetup();
 * ```
 */
export function composeSetups(
  setups: Array<(options?: TryErrorConfig) => void>
): (options?: TryErrorConfig) => void {
  return (options: TryErrorConfig = {}) => {
    for (const setup of setups) {
      setup(options);
    }
    activeSetups.add("composed");
  };
}

/**
 * Create a dynamic setup that changes based on runtime conditions
 *
 * @param condition - Function that returns true when setup should be applied
 * @param trueSetup - Setup to use when condition is true
 * @param falseSetup - Setup to use when condition is false
 * @returns A setup function that applies the appropriate configuration
 *
 * @example
 * ```typescript
 * const dynamicSetup = createDynamicSetup(
 *   () => process.env.NODE_ENV === 'production',
 *   setupPerformance,
 *   setupTesting
 * );
 *
 * dynamicSetup();
 * ```
 */
export function createDynamicSetup(
  condition: () => boolean,
  trueSetup: (options?: TryErrorConfig) => void,
  falseSetup: (options?: TryErrorConfig) => void
): (options?: TryErrorConfig) => void {
  return (options: TryErrorConfig = {}) => {
    if (condition()) {
      trueSetup(options);
    } else {
      falseSetup(options);
    }
    activeSetups.add("dynamic");
  };
}

/**
 * Tear down all active setups and reset configuration
 *
 * @example
 * ```typescript
 * // In tests or when switching configurations
 * teardownSetup();
 * ```
 */
export function teardownSetup(): void {
  resetConfig();
  activeSetups.clear();
}
