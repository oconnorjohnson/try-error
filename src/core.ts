// Core types and utilities shared between sync and async modules
// This module contains the minimal set of types and functions needed by both

// Re-export core types
export type {
  TryError,
  TryResult,
  TryTuple,
  TrySuccess,
  TryFailure,
  UnwrapTry,
  UnwrapTryError,
} from "./types";

// Re-export core type guards and utilities
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

// Re-export minimal error creation utilities
export type { CreateErrorOptions } from "./errors";
export { createError, wrapError, fromThrown } from "./errors";

// Re-export configuration (tree-shakeable)
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

// Re-export event system (used by both sync and async)
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

// Re-export performance optimizations (used by both)
export { ErrorFlags, setFlag, clearFlag, hasFlag } from "./bitflags";
export {
  intern,
  internError,
  getInternStats,
  clearInternPool,
  preinternCommonStrings,
} from "./intern";

// Re-export pool (used by both)
export {
  ErrorPool,
  getGlobalErrorPool,
  configureErrorPool,
  resetErrorPool,
  getErrorPoolStats,
} from "./pool";

// Library version
export const VERSION = "0.0.1-alpha.1";

// Feature flags
export const FEATURES = /*#__PURE__*/ Object.freeze({
  serialization: true,
  errorComparison: true,
  errorCloning: true,
  asyncStackTraces: false,
  objectPooling: true,
  lazyEvaluation: true,
  eventSystem: true,
  stringInterning: true,
  bitFlags: true,
});
