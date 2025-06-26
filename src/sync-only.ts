// Sync-only exports for smaller bundle size
// Import this module when you only need synchronous error handling

// Re-export all core functionality
export * from "./core";

// Export synchronous error handling
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

// Export factories (mostly sync operations)
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

// Export utilities (mostly sync operations)
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

// Export middleware system (supports both sync and async, but we'll only export sync parts)
export type {
  ErrorMiddleware,
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

// Export lazy evaluation utilities
export {
  createLazyError,
  makeLazy,
  isLazyProperty,
  forceLazyEvaluation,
  createDebugProxy,
} from "./lazy";

// Export plugin system
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

// Re-export commonly used sync function with clearer name
export { trySync as try$ } from "./sync";
