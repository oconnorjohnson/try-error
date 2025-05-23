// React integration for try-error
// This package provides React-specific hooks and components for error handling

// Re-export core try-error APIs that React developers commonly need
export {
  // Core types
  type TryError,
  type TryResult,
  type TryTuple,
  type TrySuccess,
  type TryFailure,
  isTryError,
  isTrySuccess,

  // Error creation
  createError,
  wrapError,
  fromThrown,

  // Synchronous operations
  trySync,
  trySyncTuple,
  tryCall,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  isOk,
  isErr,
  tryAll,
  tryAny,

  // Asynchronous operations
  tryAsync,
  tryAsyncTuple,
  tryAwait,
  tryAllAsync,
  tryAnyAsync,
  tryAnySequential,
  withTimeout,
  retry,

  // Utilities
  transformResult,
  withDefault,
  withDefaultFn,
  filterSuccess,
  filterErrors,
  partitionResults,
  combineErrors,
  getErrorMessage,
  getErrorContext,
  hasErrorContext,
  isErrorOfType,
  isErrorOfTypes,

  // Factories (commonly used in React forms/validation)
  createErrorFactory,
  chainError,
  wrapWithContext,
  createEntityError,
  createAmountError,
  createExternalError,
  createValidationError,
} from "try-error";

// Export React-specific APIs
export * from "./types";
export * from "./hooks/useTry";
export * from "./hooks/useTryCallback";
export * from "./components/TryErrorBoundary";

// Re-export specific types for convenience
export type {
  TryState,
  TryHookReturn,
  AsyncTryHookReturn,
  FormTryHookReturn,
  ReactTryError,
  ReactErrorType,
  TryReactConfig,
  AsyncTryConfig,
  FormTryConfig,
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./types";
