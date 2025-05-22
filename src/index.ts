// try-error - Lightweight, progressive, type-safe error handling for TypeScript
// This file will export all public APIs

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

export { isTryError, isTrySuccess } from "./types";

// Error creation utilities
export type { CreateErrorOptions } from "./errors";

export { createError, wrapError, fromThrown } from "./errors";

// Synchronous error handling
export type { TrySyncOptions } from "./sync";

export {
  trySync,
  trySyncTuple,
  tryCall,
  tryMap as trySyncMap,
  tryChain as trySyncChain,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  isOk,
  isErr,
  tryAll,
  tryAny,
} from "./sync";

// Asynchronous error handling
export type { TryAsyncOptions } from "./async";

export {
  tryAsync,
  tryAsyncTuple,
  tryAwait,
  tryMapAsync,
  tryMap as tryAsyncMap,
  tryChainAsync,
  tryChain as tryAsyncChain,
  tryAllAsync,
  tryAnyAsync,
  tryAnySequential,
  withTimeout,
  retry,
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
  chainError,
  wrapWithContext,
  createEntityError,
  createAmountError,
  createExternalError,
  createValidationError,
} from "./factories";

// Stage 1: Enhanced utilities for common patterns
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
} from "./utils";

// Re-export commonly used functions with clearer names
export { trySync as try$ } from "./sync";

export { tryAsync as try$$ } from "./async";
