/**
 * Lazy evaluation implementation for error properties
 *
 * This module provides lazy evaluation of expensive error properties
 * like stack traces and source locations, computing them only when accessed.
 */

import { TryError, TRY_ERROR_BRAND } from "./types";

/**
 * Lazy property descriptor that computes value on first access
 */
function createLazyProperty<T>(
  target: any,
  propertyKey: string,
  compute: () => T
): void {
  let cached: T | undefined;
  let computed = false;

  Object.defineProperty(target, propertyKey, {
    get(): T {
      if (!computed) {
        cached = compute();
        computed = true;
      }
      return cached!;
    },
    enumerable: true,
    configurable: true,
  });
}

/**
 * Create a lazy error where expensive properties are computed on demand
 */
export function createLazyError<T extends string = string>(options: {
  type: T;
  message: string;
  getSource: () => string;
  getStack?: () => string | undefined;
  getTimestamp?: () => number;
  context?: Record<string, unknown>;
  cause?: unknown;
}): TryError<T> {
  const error: any = {
    [TRY_ERROR_BRAND]: true,
    type: options.type,
    message: options.message,
    context: options.context,
    cause: options.cause,
  };

  // Create lazy properties
  createLazyProperty(error, "source", options.getSource);

  if (options.getStack) {
    createLazyProperty(error, "stack", options.getStack);
  } else {
    error.stack = undefined;
  }

  if (options.getTimestamp) {
    createLazyProperty(error, "timestamp", options.getTimestamp);
  } else {
    error.timestamp = Date.now();
  }

  return error as TryError<T>;
}

/**
 * Wrap an existing error to make certain properties lazy
 */
export function makeLazy<E extends TryError>(
  error: E,
  lazyProps: {
    source?: () => string;
    stack?: () => string | undefined;
    context?: () => Record<string, unknown> | undefined;
  }
): E {
  const lazyError = { ...error };

  if (lazyProps.source) {
    createLazyProperty(lazyError, "source", lazyProps.source);
  }

  if (lazyProps.stack) {
    createLazyProperty(lazyError, "stack", lazyProps.stack);
  }

  if (lazyProps.context) {
    createLazyProperty(lazyError, "context", lazyProps.context);
  }

  return lazyError;
}

/**
 * Check if a property is lazy (not yet computed)
 */
export function isLazyProperty(obj: any, prop: string): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
  return descriptor?.get !== undefined;
}

/**
 * Force evaluation of all lazy properties
 */
export function forceLazyEvaluation<E extends TryError>(error: E): E {
  // Access each property to force evaluation
  const _ = {
    source: error.source,
    stack: error.stack,
    timestamp: error.timestamp,
    context: error.context,
  };
  return error;
}

/**
 * Create a proxy that logs property access for debugging
 */
export function createDebugProxy<E extends TryError>(error: E): E {
  return new Proxy(error, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && isLazyProperty(target, prop)) {
        console.debug(`Lazy evaluation triggered for property: ${prop}`);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}
