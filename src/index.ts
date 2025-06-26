// try-error - Lightweight, progressive, type-safe error handling for TypeScript
// This file will export all public APIs

// Library version
export const VERSION = "1.0.0";

// Feature flags
export const FEATURES = /*#__PURE__*/ Object.freeze({
  serialization: true,
  errorComparison: true,
  errorCloning: true,
  asyncStackTraces: false, // Not implemented yet
  objectPooling: true, // Now implemented
  lazyEvaluation: true, // Now implemented
  eventSystem: true, // Now implemented
  stringInterning: true, // Now implemented
  bitFlags: true, // Now implemented
});

// Core types
export type {
  TryError,
  TryResult,
  TryTuple,
  TrySuccess,
  TryFailure,
  UnwrapTry,
  UnwrapTryError,
} from "./types";

// Core type guards and utilities
export {
  isTryError,
  isTrySuccess,
  matchTryResult,
  unwrapTryResult,
  serializeTryError,
  deserializeTryError,
  areTryErrorsEqual,
  cloneTryError,
} from "./types";

// Error creation utilities
export type { CreateErrorOptions } from "./errors";

export { createError, wrapError, fromThrown } from "./errors";

// Configuration utilities (tree-shakeable)
export type { TryErrorConfig, PerformanceConfig } from "./config";

export {
  configure,
  getConfig,
  resetConfig,
  createScope,
  createEnvConfig,
  ConfigPresets,
  Performance,
} from "./config";

// Setup utilities are available as separate imports to keep main bundle lightweight:
// import { setupNode, setupReact, setupNextJs, autoSetup } from 'try-error/setup';

// Synchronous error handling
export type { TrySyncOptions } from "./sync";

export {
  trySync,
  trySyncTuple,
  tryCall,
  tryMap,
  tryChain,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  isOk,
  isErr,
  tryAll,
  tryAny,
  retrySync,
  CircuitBreaker,
  createCircuitBreaker,
  withFallback,
} from "./sync";

// Asynchronous error handling
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

// Stage 2: Domain-specific error factories and base types
export type {
  ErrorFactoryOptions,
  EntityError,
  AmountError,
  ExternalError,
  ValidationError,
} from "./factories";

export {
  createErrorFactory,
  getFactory,
  listFactories,
  composeFactories,
  serializeDomainError,
  chainError,
  wrapWithContext,
  createEntityError,
  createAmountError,
  createExternalError,
  createValidationError,
  validationError,
  amountError,
  externalError,
  entityError,
  fieldValidationError,
} from "./factories";

// Enhanced utilities for common patterns
export type { ErrorHandlingOptions } from "./utils";

export {
  createEnhancedError,
  isErrorOfType,
  isErrorOfTypes,
  getErrorMessage,
  getErrorContext,
  hasErrorContext,
  transformResult,
  withDefault,
  withDefaultFn,
  filterSuccess,
  filterErrors,
  partitionResults,
  combineErrors,
  getErrorSummary,
  formatErrorForLogging,
  createErrorReport,
  diffErrors,
  groupErrors,
  ErrorSampling,
  correlateErrors,
  getErrorFingerprint,
} from "./utils";

// Middleware system
export type {
  ErrorMiddleware,
  AsyncErrorMiddleware,
  MiddlewareContext,
  ContextualMiddleware,
} from "./middleware";

export {
  MiddlewarePipeline,
  globalRegistry,
  loggingMiddleware,
  retryMiddleware,
  transformMiddleware,
  enrichContextMiddleware,
  circuitBreakerMiddleware,
  compose,
  filterMiddleware,
  rateLimitMiddleware,
} from "./middleware";

// Lazy evaluation utilities
export {
  createLazyError,
  makeLazy,
  isLazyProperty,
  forceLazyEvaluation,
  createDebugProxy,
} from "./lazy";

// Performance utilities
export {
  ErrorPool,
  getGlobalErrorPool,
  configureErrorPool,
  resetErrorPool,
  getErrorPoolStats,
} from "./pool";

// Plugin system
export type {
  PluginMetadata,
  PluginHooks,
  PluginCapabilities,
  Plugin,
  PluginAPI,
} from "./plugins";

export {
  PluginManager,
  pluginManager,
  createPlugin,
  sentryPlugin,
} from "./plugins";

// Event system
export type { ErrorEvent, ErrorEventListener } from "./events";

export {
  ErrorEventEmitter,
  errorEvents,
  emitErrorCreated,
  emitErrorTransformed,
  emitErrorPooled,
  emitErrorReleased,
  emitErrorSerialized,
  emitErrorWrapped,
  emitErrorRetry,
  emitErrorRecovered,
} from "./events";

// Performance optimizations
export { ErrorFlags, setFlag, clearFlag, hasFlag } from "./bitflags";
export {
  intern,
  internError,
  getInternStats,
  clearInternPool,
  preinternCommonStrings,
} from "./intern";

// Re-export commonly used functions with clearer names
export { trySync as try$ } from "./sync";

export { tryAsync as try$$ } from "./async";
