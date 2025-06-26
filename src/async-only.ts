// Async-only exports for smaller bundle size
// Import this module when you only need asynchronous error handling

// Re-export all core functionality
export * from "./core";

// Export asynchronous error handling
export type { TryAsyncOptions, ProgressTracker } from "./async";

export {
  tryAsync,
  tryAsyncTuple,
  tryAwait,
  tryMapAsync,
  tryChainAsync,
  tryAllAsync,
  tryAnyAsync,
  tryAnySequential,
  withTimeout,
  retry,
  withProgress,
  RateLimiter,
  createRateLimiter,
  AsyncQueue,
  createAsyncQueue,
} from "./async";

// Export async-specific middleware types
export type { AsyncErrorMiddleware } from "./middleware";

// Re-export commonly used async function with clearer name
export { tryAsync as try$$ } from "./async";

// Note: Most other exports (factories, utils, middleware, plugins) are available
// through the core module and work with both sync and async code
