/**
 * Middleware system for extending try-error functionality
 *
 * This module provides a flexible middleware system that allows users to
 * extend error handling with custom logic, transformations, and integrations.
 */

import { TryError, TryResult, isTryError, TRY_ERROR_BRAND } from "./types";

/**
 * Middleware function signature
 */
export type ErrorMiddleware<T = any, E extends TryError = TryError> = (
  result: TryResult<T, E>,
  next: () => TryResult<T, E>
) => TryResult<T, E>;

/**
 * Async middleware function signature
 */
export type AsyncErrorMiddleware<T = any, E extends TryError = TryError> = (
  result: Promise<TryResult<T, E>>,
  next: () => Promise<TryResult<T, E>>
) => Promise<TryResult<T, E>>;

/**
 * Middleware context passed to middleware functions
 */
export interface MiddlewareContext {
  operation: string;
  metadata?: Record<string, unknown>;
}

/**
 * Enhanced middleware with context support
 */
export type ContextualMiddleware<T = any, E extends TryError = TryError> = (
  result: TryResult<T, E>,
  context: MiddlewareContext,
  next: () => TryResult<T, E>
) => TryResult<T, E>;

/**
 * Middleware pipeline for composing multiple middleware
 */
export class MiddlewarePipeline<T = any, E extends TryError = TryError> {
  private middleware: ErrorMiddleware<T, E>[] = [];

  /**
   * Add middleware to the pipeline
   */
  use(middleware: ErrorMiddleware<T, E>): this {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Execute the middleware pipeline
   */
  execute(
    initialResult: TryResult<T, E>,
    finalHandler?: () => TryResult<T, E>
  ): TryResult<T, E> {
    let index = 0;

    const next = (): TryResult<T, E> => {
      if (index >= this.middleware.length) {
        return finalHandler ? finalHandler() : initialResult;
      }

      const currentMiddleware = this.middleware[index++];
      return currentMiddleware(initialResult, next);
    };

    return next();
  }

  /**
   * Create a wrapped function that applies the middleware pipeline
   */
  wrap<Args extends any[]>(
    fn: (...args: Args) => TryResult<T, E>
  ): (...args: Args) => TryResult<T, E> {
    return (...args: Args) => {
      const result = fn(...args);
      return this.execute(result);
    };
  }

  /**
   * Clone the pipeline
   */
  clone(): MiddlewarePipeline<T, E> {
    const cloned = new MiddlewarePipeline<T, E>();
    cloned.middleware = [...this.middleware];
    return cloned;
  }

  /**
   * Get the number of middleware in the pipeline
   */
  get length(): number {
    return this.middleware.length;
  }
}

/**
 * Global middleware registry
 */
class MiddlewareRegistry {
  private pipelines = new Map<string, MiddlewarePipeline>();

  /**
   * Register a named pipeline
   */
  register(name: string, pipeline: MiddlewarePipeline): void {
    this.pipelines.set(name, pipeline);
  }

  /**
   * Get a registered pipeline
   */
  get(name: string): MiddlewarePipeline | undefined {
    return this.pipelines.get(name);
  }

  /**
   * Remove a pipeline
   */
  remove(name: string): boolean {
    return this.pipelines.delete(name);
  }

  /**
   * List all registered pipeline names
   */
  list(): string[] {
    return Array.from(this.pipelines.keys());
  }
}

export const globalRegistry = new MiddlewareRegistry();

/**
 * Common middleware implementations
 */

/**
 * Logging middleware
 */
export function loggingMiddleware<T, E extends TryError>(
  logger: (error: E) => void
): ErrorMiddleware<T, E> {
  return (result, next) => {
    if (isTryError(result)) {
      logger(result);
    }
    return next();
  };
}

/**
 * Retry middleware
 */
export function retryMiddleware<T, E extends TryError>(
  maxAttempts: number,
  shouldRetry: (error: E) => boolean = () => true
): ErrorMiddleware<T, E> {
  let attempts = 0;

  return (result, next) => {
    if (isTryError(result) && attempts < maxAttempts && shouldRetry(result)) {
      attempts++;
      return next();
    }
    return result;
  };
}

/**
 * Error transformation middleware
 */
export function transformMiddleware<T, E extends TryError>(
  transform: (error: E) => E
): ErrorMiddleware<T, E> {
  return (result, next) => {
    if (isTryError(result)) {
      return transform(result);
    }
    return next();
  };
}

/**
 * Context enrichment middleware
 */
export function enrichContextMiddleware<T, E extends TryError>(
  enricher: () => Record<string, unknown>
): ErrorMiddleware<T, E> {
  return (result, next) => {
    if (isTryError(result)) {
      const enrichedError = {
        ...result,
        context: {
          ...result.context,
          ...enricher(),
        },
      };
      return enrichedError;
    }
    return next();
  };
}

/**
 * Circuit breaker middleware
 */
export function circuitBreakerMiddleware<T, E extends TryError>(options: {
  threshold: number;
  timeout: number;
  onOpen?: () => void;
  onClose?: () => void;
}): ErrorMiddleware<T, E> {
  let failures = 0;
  let lastFailureTime = 0;
  let isOpen = false;

  return (result, next) => {
    const now = Date.now();

    // Check if circuit should be closed
    if (isOpen && now - lastFailureTime > options.timeout) {
      isOpen = false;
      failures = 0;
      options.onClose?.();
    }

    // If circuit is open, fail fast
    if (isOpen) {
      return {
        [TRY_ERROR_BRAND]: true,
        type: "CircuitBreakerOpen",
        message: "Circuit breaker is open",
        source: "middleware",
        timestamp: now,
      } as unknown as E;
    }

    const nextResult = next();

    // Track failures
    if (isTryError(nextResult)) {
      failures++;
      lastFailureTime = now;

      if (failures >= options.threshold) {
        isOpen = true;
        options.onOpen?.();
      }
    } else {
      // Reset on success
      failures = 0;
    }

    return nextResult;
  };
}

/**
 * Compose multiple middleware into a single middleware
 */
export function compose<T, E extends TryError>(
  ...middleware: ErrorMiddleware<T, E>[]
): ErrorMiddleware<T, E> {
  return (result, next) => {
    let index = 0;

    const dispatch = (): TryResult<T, E> => {
      if (index >= middleware.length) {
        return next();
      }

      const currentMiddleware = middleware[index++];
      return currentMiddleware(result, dispatch);
    };

    return dispatch();
  };
}

/**
 * Create a middleware that only runs for specific error types
 */
export function filterMiddleware<T, E extends TryError>(
  errorTypes: string[],
  middleware: ErrorMiddleware<T, E>
): ErrorMiddleware<T, E> {
  return (result, next) => {
    if (isTryError(result) && errorTypes.includes(result.type)) {
      return middleware(result, next);
    }
    return next();
  };
}

/**
 * Time-based rate limiting middleware
 */
export function rateLimitMiddleware<T, E extends TryError>(
  windowMs: number,
  maxErrors: number
): ErrorMiddleware<T, E> {
  const errorTimestamps: number[] = [];

  return (result, next) => {
    if (isTryError(result)) {
      const now = Date.now();

      // Remove old timestamps
      while (
        errorTimestamps.length > 0 &&
        errorTimestamps[0] < now - windowMs
      ) {
        errorTimestamps.shift();
      }

      // Check rate limit
      if (errorTimestamps.length >= maxErrors) {
        return {
          [TRY_ERROR_BRAND]: true,
          type: "RateLimitExceeded",
          message: `Rate limit exceeded: ${maxErrors} errors in ${windowMs}ms`,
          source: "middleware",
          timestamp: now,
          context: {
            windowMs,
            maxErrors,
            currentCount: errorTimestamps.length,
          },
        } as unknown as E;
      }

      errorTimestamps.push(now);
    }

    return next();
  };
}
