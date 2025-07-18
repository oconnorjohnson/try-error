/**
 * Object pooling implementation for high-performance error creation
 *
 * This module provides object pooling to reduce garbage collection pressure
 * in high-throughput scenarios. The pool pre-allocates error objects and
 * reuses them instead of creating new ones.
 */

import { TryError, TRY_ERROR_BRAND } from "./types";

/**
 * Mutable version of TryError for pooling
 */
interface MutableTryError<T extends string = string> {
  [TRY_ERROR_BRAND]: true;
  type: T;
  message: string;
  source: string;
  timestamp: number;
  stack?: string;
  context?: Record<string, unknown>;
  cause?: unknown;
}

/**
 * Poolable error object that can be reset and reused
 */
interface PoolableError<T extends string = string> extends MutableTryError<T> {
  _pooled: boolean;
  _reset(): void;
}

/**
 * Type guard for poolable errors
 */
function isPoolableError(error: unknown): error is PoolableError {
  return (
    typeof error === "object" &&
    error !== null &&
    "_pooled" in error &&
    (error as PoolableError)._pooled === true
  );
}

/**
 * Object pool for TryError instances
 */
export class ErrorPool {
  private pool: PoolableError[] = [];
  private maxSize: number;
  private activeCount = 0;
  private stats = {
    hits: 0,
    misses: 0,
    creates: 0,
    returns: 0,
  };

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    // Pre-allocate some errors
    this.preallocate(Math.min(10, maxSize));
  }

  /**
   * Pre-allocate errors to the pool
   */
  private preallocate(count: number): void {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.createPoolableError());
    }
  }

  /**
   * Create a new poolable error
   */
  private createPoolableError(): PoolableError {
    const error: PoolableError = {
      [TRY_ERROR_BRAND]: true,
      type: "",
      message: "",
      source: "",
      timestamp: 0,
      stack: undefined,
      context: undefined,
      cause: undefined,
      _pooled: true,
      _reset() {
        this.type = "";
        this.message = "";
        this.source = "";
        this.timestamp = 0;
        this.stack = undefined;
        this.context = undefined;
        this.cause = undefined;
      },
    };

    this.stats.creates++;
    return error;
  }

  /**
   * Acquire an error from the pool
   */
  acquire<T extends string = string>(): PoolableError<T> & TryError<T> {
    let error: PoolableError;

    if (this.pool.length > 0) {
      error = this.pool.pop()!;
      this.stats.hits++;
    } else {
      error = this.createPoolableError();
      this.stats.misses++;
    }

    this.activeCount++;
    // Cast to both PoolableError<T> and TryError<T> for compatibility
    return error as PoolableError<T> & TryError<T>;
  }

  /**
   * Release an error back to the pool
   */
  release(error: TryError): void {
    if (!isPoolableError(error)) {
      return; // Not a pooled error
    }

    error._reset();

    if (this.pool.length < this.maxSize) {
      this.pool.push(error);
      this.stats.returns++;
    }

    this.activeCount--;
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      activeCount: this.activeCount,
      maxSize: this.maxSize,
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
    this.activeCount = 0;
  }

  /**
   * Resize the pool
   */
  resize(newSize: number): void {
    this.maxSize = newSize;
    if (this.pool.length > newSize) {
      this.pool = this.pool.slice(0, newSize);
    }
  }
}

/**
 * Global error pool instance (created lazily)
 */
let globalErrorPool: ErrorPool | null = null;

/**
 * Get or create the global error pool
 */
export function getGlobalErrorPool(): ErrorPool {
  if (!globalErrorPool) {
    globalErrorPool = new ErrorPool();
  }
  return globalErrorPool;
}

/**
 * Configure the global error pool
 */
export function configureErrorPool(options: {
  maxSize?: number;
  enabled?: boolean;
}): void {
  if (options.enabled === false) {
    globalErrorPool = null;
  } else if (options.maxSize !== undefined) {
    const pool = getGlobalErrorPool();
    pool.resize(options.maxSize);
  }
}

/**
 * Reset the global error pool
 */
export function resetErrorPool(): void {
  if (globalErrorPool) {
    globalErrorPool.clear();
  }
  globalErrorPool = null;
}

/**
 * Get error pool statistics
 */
export function getErrorPoolStats() {
  return globalErrorPool ? globalErrorPool.getStats() : null;
}
