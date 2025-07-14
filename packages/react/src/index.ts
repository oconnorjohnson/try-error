// React integration for try-error
// This package provides React-specific hooks and components for error handling

// Check React version compatibility
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  try {
    const React = require("react");
    const version = React.version;
    const major = parseInt(version.split(".")[0], 10);
    if (major < 16) {
      console.warn(
        "try-error-react: This package requires React 16.8 or higher for hooks support. " +
          `You are using React ${version}.`
      );
    }
  } catch (e) {
    // React not found, will fail at runtime
  }
}

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
  // IMPROVED: More ergonomic error factories
  validationError,
  amountError,
  externalError,
  entityError,
  fieldValidationError,
} from "try-error";

// Export React-specific hooks (without conflicting exports)
export {
  // From useTry
  useTry,
  useTrySync,
  type UseTryOptions,
  type UseTryReturn,

  // From useTryCallback
  useTryCallback,
  useTryCallbackSync,
  useTryCallbackWithState,
  useErrorCallback,
  useSuccessCallback,
  useResultCallback,
  useFormSubmitCallback,
  type UseTryCallbackOptions,
  type UseTryCallbackWithStateOptions,
  type UseTryCallbackWithState,

  // From useTryState
  useTryState,
  useTryStateAsync,
  useStateWithError,
  useValidatedState,
  usePersistedState,

  // From useTryMutation
  useTryMutation,
  useFormMutation,
  type UseTryMutationOptions,
  type UseTryMutationResult,
} from "./hooks";

// Export React components
export * from "./components/TryErrorBoundary";

// Export context utilities
export * from "./context/ErrorContext";

// Re-export all types (TryState comes from here, not from hooks)
export * from "./types";

// Export telemetry functionality
export * from "./telemetry";
export { createSentryProvider } from "./telemetry/providers/sentry";
export { createConsoleProvider } from "./telemetry/providers/console";

// Version info
export const VERSION = "0.0.1-alpha.1";

// Utility to check try-error core version compatibility
export function checkCoreVersion(): boolean {
  try {
    const tryError = require("try-error");
    const coreVersion = tryError.VERSION || "0.0.0";
    const [coreMajor] = coreVersion.split(".").map(Number);
    const [reactMajor] = VERSION.split(".").map(Number);

    if (coreMajor !== reactMajor) {
      console.warn(
        `try-error-react: Version mismatch detected. ` +
          `try-error-react@${VERSION} may not be compatible with try-error@${coreVersion}. ` +
          `Consider updating to matching major versions.`
      );
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Check version compatibility in development
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  checkCoreVersion();
}
