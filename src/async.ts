import {
  TryError,
  TryResult,
  TryTuple,
  isTryError,
  TRY_ERROR_BRAND,
} from "./types";
import { fromThrown } from "./errors";

/**
 * Options for tryAsync function
 */
export interface TryAsyncOptions {
  /**
   * Custom error type to use instead of automatic detection
   */
  errorType?: string;

  /**
   * Additional context to include in error
   */
  context?: Record<string, unknown>;

  /**
   * Custom error message
   */
  message?: string;

  /**
   * Timeout in milliseconds (optional)
   */
  timeout?: number;

  /**
   * AbortSignal for cancellation (optional)
   */
  signal?: AbortSignal;
}

/**
 * Wrap an asynchronous operation that might throw or reject
 * Returns a Promise of either the result or a TryError
 *
 * @param fn - Async function to execute
 * @param options - Optional configuration
 * @returns Promise<TryResult> with success value or error
 *
 * @example
 * ```typescript
 * const result = await tryAsync(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 *
 * if (isTryError(result)) {
 *   console.error('Request failed:', result.message);
 * } else {
 *   console.log('Data:', result);
 * }
 * ```
 */
export async function tryAsync<T>(
  fn: () => Promise<T>,
  options?: TryAsyncOptions
): Promise<TryResult<T, TryError>> {
  try {
    let promise = fn();

    // Add cancellation support
    if (options?.signal) {
      promise = Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          if (options.signal!.aborted) {
            reject(new Error("Operation was aborted"));
          } else {
            options.signal!.addEventListener("abort", () => {
              reject(new Error("Operation was aborted"));
            });
          }
        }),
      ]);
    }

    // Add timeout if specified
    if (options?.timeout) {
      let timeoutId: NodeJS.Timeout | number;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () =>
            reject(new Error(`Operation timed out after ${options.timeout}ms`)),
          options.timeout
        );
      });

      try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
      } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
      }
    }

    const result = await promise;
    return result;
  } catch (error) {
    if (options?.errorType) {
      return {
        [TRY_ERROR_BRAND]: true,
        type: options.errorType,
        message:
          options.message ||
          (error instanceof Error ? error.message : "Async operation failed"),
        source: "unknown", // Will be set by createError if needed
        timestamp: Date.now(),
        cause: error,
        context: options.context,
      } as TryError;
    }

    return fromThrown(error, options?.context);
  }
}

/**
 * Wrap an asynchronous operation and return a tuple [result, error]
 * Go-style async error handling
 *
 * @param fn - Async function to execute
 * @param options - Optional configuration
 * @returns Promise<TryTuple> with [result, null] on success or [null, error] on failure
 *
 * @example
 * ```typescript
 * const [result, error] = await tryAsyncTuple(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 *
 * if (error) {
 *   console.error('Request failed:', error.message);
 * } else {
 *   console.log('Data:', result);
 * }
 * ```
 */
export async function tryAsyncTuple<T>(
  fn: () => Promise<T>,
  options?: TryAsyncOptions
): Promise<TryTuple<T, TryError>> {
  const result = await tryAsync(fn, options);
  if (isTryError(result)) {
    return [null, result];
  }
  return [result, null];
}

/**
 * Safely await a Promise, wrapping any rejection in a TryError
 *
 * @param promise - Promise to await
 * @param options - Optional configuration
 * @returns Promise<TryResult> with success value or error
 *
 * @example
 * ```typescript
 * const result = await tryAwait(fetch('/api/data'));
 * if (isTryError(result)) {
 *   console.error('Fetch failed:', result.message);
 * } else {
 *   console.log('Response:', result);
 * }
 * ```
 */
export async function tryAwait<T>(
  promise: Promise<T>,
  options?: TryAsyncOptions
): Promise<TryResult<T, TryError>> {
  return tryAsync(() => promise, options);
}

/**
 * Transform a successful async result, leaving errors unchanged
 *
 * @param resultPromise - Promise of TryResult to transform
 * @param mapper - Async function to transform the success value
 * @returns Promise of transformed result or original error
 *
 * @example
 * ```typescript
 * const fetchResult = tryAsync(() => fetch('/api/user'));
 * const jsonResult = await tryMapAsync(fetchResult, async (response) => response.json());
 * ```
 */
export async function tryMapAsync<T, U, E extends TryError>(
  resultPromise: Promise<TryResult<T, E>>,
  mapper: (value: T) => Promise<U>
): Promise<TryResult<U, E | TryError>> {
  const result = await resultPromise;
  if (isTryError(result)) {
    return result;
  }

  return tryAsync(() => mapper(result));
}

/**
 * Transform a successful result with a synchronous mapper
 *
 * @param resultPromise - Promise of TryResult to transform
 * @param mapper - Synchronous function to transform the success value
 * @returns Promise of transformed result or original error
 *
 * @example
 * ```typescript
 * const fetchResult = tryAsync(() => fetch('/api/user'));
 * const statusResult = await tryMap(fetchResult, (response) => response.status);
 * ```
 */
export async function tryMap<T, U, E extends TryError>(
  resultPromise: Promise<TryResult<T, E>>,
  mapper: (value: T) => U
): Promise<TryResult<U, E | TryError>> {
  const result = await resultPromise;
  if (isTryError(result)) {
    return result;
  }

  try {
    return mapper(result);
  } catch (error) {
    return fromThrown(error);
  }
}

/**
 * Chain async operations that return Promise<TryResult>, short-circuiting on errors
 *
 * @param resultPromise - Promise of TryResult to chain from
 * @param chainer - Async function that takes success value and returns new Promise<TryResult>
 * @returns Promise of chained result or first error encountered
 *
 * @example
 * ```typescript
 * const result = await tryChainAsync(
 *   tryAsync(() => fetch('/api/user')),
 *   async (response) => tryAsync(() => response.json())
 * );
 * ```
 */
export async function tryChainAsync<
  T,
  U,
  E1 extends TryError,
  E2 extends TryError
>(
  resultPromise: Promise<TryResult<T, E1>>,
  chainer: (value: T) => Promise<TryResult<U, E2>>
): Promise<TryResult<U, E1 | E2>> {
  const result = await resultPromise;
  if (isTryError(result)) {
    return result;
  }

  return chainer(result);
}

/**
 * Chain with a function that returns a synchronous TryResult
 *
 * @param resultPromise - Promise of TryResult to chain from
 * @param chainer - Function that takes success value and returns TryResult
 * @returns Promise of chained result or first error encountered
 *
 * @example
 * ```typescript
 * const result = await tryChain(
 *   tryAsync(() => fetch('/api/data')),
 *   (response) => trySync(() => response.headers.get('content-type'))
 * );
 * ```
 */
export async function tryChain<T, U, E1 extends TryError, E2 extends TryError>(
  resultPromise: Promise<TryResult<T, E1>>,
  chainer: (value: T) => TryResult<U, E2>
): Promise<TryResult<U, E1 | E2>> {
  const result = await resultPromise;
  if (isTryError(result)) {
    return result;
  }

  return chainer(result);
}

/**
 * Combine multiple async TryResults, succeeding only if all succeed
 *
 * @param resultPromises - Array of Promise<TryResult> to combine
 * @returns Promise of array of success values or first error encountered
 *
 * @example
 * ```typescript
 * const results = await tryAllAsync([
 *   tryAsync(() => fetch('/api/user')),
 *   tryAsync(() => fetch('/api/posts')),
 *   tryAsync(() => fetch('/api/comments'))
 * ]);
 * ```
 */
export async function tryAllAsync<
  T extends readonly Promise<TryResult<any, any>>[]
>(
  resultPromises: T
): Promise<
  TryResult<
    {
      [K in keyof T]: T[K] extends Promise<TryResult<infer U, any>> ? U : never;
    },
    TryError
  >
> {
  const results = await Promise.all(resultPromises);
  const values: any[] = [];

  for (const result of results) {
    if (isTryError(result)) {
      return result;
    }
    values.push(result);
  }

  return values as any;
}

/**
 * Try multiple async operations, returning the first successful result
 * Uses Promise.allSettled to wait for all attempts
 *
 * @param attemptPromises - Array of Promise<TryResult> to try
 * @returns Promise of first successful result or last error if all fail
 *
 * @example
 * ```typescript
 * const result = await tryAnyAsync([
 *   tryAsync(() => fetch('/api/primary')),
 *   tryAsync(() => fetch('/api/fallback')),
 *   tryAsync(() => fetch('/api/backup'))
 * ]);
 * ```
 */
export async function tryAnyAsync<T>(
  attemptPromises: Array<Promise<TryResult<T, TryError>>>
): Promise<TryResult<T, TryError>> {
  const results = await Promise.allSettled(attemptPromises);
  let lastError: TryError | null = null;

  for (const settled of results) {
    if (settled.status === "fulfilled") {
      const result = settled.value;
      if (!isTryError(result)) {
        return result;
      }
      lastError = result;
    } else {
      // Promise was rejected
      lastError = fromThrown(settled.reason);
    }
  }

  return lastError || fromThrown("All async attempts failed");
}

/**
 * Try multiple async operations in sequence, returning the first successful result
 * Stops on first success (doesn't wait for remaining promises)
 *
 * @param attemptFns - Array of functions that return Promise<TryResult>
 * @returns Promise of first successful result or last error if all fail
 *
 * @example
 * ```typescript
 * const result = await tryAnySequential([
 *   () => tryAsync(() => fetch('/api/primary')),
 *   () => tryAsync(() => fetch('/api/fallback')),
 *   () => tryAsync(() => fetch('/api/backup'))
 * ]);
 * ```
 */
export async function tryAnySequential<T>(
  attemptFns: Array<() => Promise<TryResult<T, TryError>>>
): Promise<TryResult<T, TryError>> {
  let lastError: TryError | null = null;

  for (const attemptFn of attemptFns) {
    try {
      const result = await attemptFn();
      if (!isTryError(result)) {
        return result;
      }
      lastError = result;
    } catch (error) {
      lastError = fromThrown(error);
    }
  }

  return lastError || fromThrown("All sequential attempts failed");
}

/**
 * Add a timeout to any Promise<TryResult>
 *
 * @param resultPromise - Promise to add timeout to
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Optional custom timeout message
 * @returns Promise that rejects with timeout error if not resolved in time
 *
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   tryAsync(() => fetch('/api/slow')),
 *   5000,
 *   'API request timed out'
 * );
 * ```
 */
export async function withTimeout<T, E extends TryError>(
  resultPromise: Promise<TryResult<T, E>>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<TryResult<T, E | TryError>> {
  let timeoutId: NodeJS.Timeout | number;

  const timeoutPromise = new Promise<TryError>((resolve) => {
    timeoutId = setTimeout(() => {
      resolve(
        fromThrown(
          new Error(
            timeoutMessage || `Operation timed out after ${timeoutMs}ms`
          )
        )
      );
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([resultPromise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Retry an async operation with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Promise<TryResult> with final result or last error
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => tryAsync(() => fetch('/api/unreliable')),
 *   { attempts: 3, baseDelay: 1000, maxDelay: 5000 }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<TryResult<T, TryError>>,
  options: {
    attempts: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    shouldRetry?: (error: TryError, attempt: number) => boolean;
  }
): Promise<TryResult<T, TryError>> {
  const {
    attempts,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: TryError | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await fn();
      if (!isTryError(result)) {
        return result;
      }

      lastError = result;

      // Check if we should retry this error
      if (attempt < attempts && shouldRetry(result, attempt)) {
        // Calculate delay with overflow protection
        const exponentialDelay =
          baseDelay * Math.pow(backoffFactor, attempt - 1);
        const delay = Math.min(exponentialDelay, maxDelay);

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    } catch (error) {
      lastError = fromThrown(error);

      if (attempt < attempts && shouldRetry(lastError, attempt)) {
        const exponentialDelay =
          baseDelay * Math.pow(backoffFactor, attempt - 1);
        const delay = Math.min(exponentialDelay, maxDelay);

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  return lastError || fromThrown("Retry failed");
}

/**
 * Progress tracking for long-running async operations
 */
export interface ProgressTracker<T> {
  promise: Promise<TryResult<T, TryError>>;
  getProgress: () => number;
  cancel: () => void;
}

/**
 * Create an async operation with progress tracking
 *
 * @param fn - Async function that receives a progress callback
 * @param options - Optional configuration
 * @returns ProgressTracker with promise and progress methods
 *
 * @example
 * ```typescript
 * const tracker = withProgress(async (setProgress) => {
 *   setProgress(0);
 *   await processChunk1();
 *   setProgress(33);
 *   await processChunk2();
 *   setProgress(66);
 *   await processChunk3();
 *   setProgress(100);
 *   return result;
 * });
 *
 * // Check progress
 * const interval = setInterval(() => {
 *   console.log(`Progress: ${tracker.getProgress()}%`);
 * }, 1000);
 *
 * const result = await tracker.promise;
 * clearInterval(interval);
 * ```
 */
export function withProgress<T>(
  fn: (setProgress: (percent: number) => void) => Promise<T>,
  options?: TryAsyncOptions
): ProgressTracker<T> {
  let progress = 0;
  let cancelled = false;
  const abortController = new AbortController();

  const setProgress = (percent: number) => {
    progress = Math.max(0, Math.min(100, percent));
  };

  const promise = tryAsync(
    async () => {
      if (cancelled) {
        throw new Error("Operation was cancelled");
      }
      return await fn(setProgress);
    },
    {
      ...options,
      signal: options?.signal || abortController.signal,
    }
  );

  return {
    promise,
    getProgress: () => progress,
    cancel: () => {
      cancelled = true;
      abortController.abort();
    },
  };
}

/**
 * Rate limiter for async operations
 */
export class RateLimiter {
  private queue: Array<() => void> = [];
  private activeCount = 0;

  constructor(
    private options: {
      maxConcurrent: number;
      minDelay?: number;
    }
  ) {}

  /**
   * Execute an async operation with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<TryResult<T, TryError>> {
    // Wait for a slot to become available
    await new Promise<void>((resolve) => {
      const tryExecute = () => {
        if (this.activeCount < this.options.maxConcurrent) {
          this.activeCount++;
          resolve();
        } else {
          this.queue.push(tryExecute);
        }
      };
      tryExecute();
    });

    try {
      const startTime = Date.now();
      const result = await tryAsync(fn);

      // Ensure minimum delay between operations
      if (this.options.minDelay) {
        const elapsed = Date.now() - startTime;
        const remainingDelay = this.options.minDelay - elapsed;
        if (remainingDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingDelay));
        }
      }

      return result;
    } finally {
      this.activeCount--;
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get number of active operations
   */
  getActiveCount(): number {
    return this.activeCount;
  }
}

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(options: {
  maxConcurrent: number;
  minDelay?: number;
}): RateLimiter {
  return new RateLimiter(options);
}

/**
 * Queue for managing async operations
 */
export class AsyncQueue<T> {
  private queue: Array<{
    fn: () => Promise<T>;
    resolve: (value: TryResult<T, TryError>) => void;
    reject: (error: any) => void;
  }> = [];
  private processing = false;

  constructor(
    private options: {
      concurrency?: number;
      onError?: (error: TryError) => void;
    } = {}
  ) {}

  /**
   * Add an operation to the queue
   */
  async add(fn: () => Promise<T>): Promise<TryResult<T, TryError>> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  /**
   * Process queued operations
   */
  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const concurrency = this.options.concurrency || 1;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, concurrency);

      await Promise.all(
        batch.map(async ({ fn, resolve, reject }) => {
          try {
            const result = await tryAsync(fn);
            if (isTryError(result) && this.options.onError) {
              this.options.onError(result);
            }
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
      );
    }

    this.processing = false;
  }

  /**
   * Get current queue size
   */
  getSize(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }
}

/**
 * Create an async queue instance
 */
export function createAsyncQueue<T>(options?: {
  concurrency?: number;
  onError?: (error: TryError) => void;
}): AsyncQueue<T> {
  return new AsyncQueue<T>(options);
}
