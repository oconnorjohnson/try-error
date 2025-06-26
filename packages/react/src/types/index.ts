// Type definitions for React integration
// TODO: Implement React-specific types for error handling

import { TryError, TryResult, TRY_ERROR_BRAND } from "try-error";
import { ReactNode, ErrorInfo } from "react";

// ============================================================================
// REACT-SPECIFIC ERROR TYPES
// ============================================================================

/**
 * React-specific error types for common React scenarios
 */
export type ReactErrorType =
  | "ComponentError"
  | "RenderError"
  | "EffectError"
  | "EventHandlerError"
  | "FormSubmissionError"
  | "ValidationError"
  | "AsyncComponentError"
  | "StateUpdateError"
  | "ABORTED"
  | "COMPONENT_UNMOUNTED"
  | "UNEXPECTED_ERROR";

/**
 * Enhanced TryError for React components with component-specific context
 */
export interface ReactTryError<T extends ReactErrorType = ReactErrorType>
  extends TryError<T> {
  /**
   * The React component where the error occurred
   */
  readonly componentName?: string;

  /**
   * React component stack trace
   */
  readonly componentStack?: string;

  /**
   * Props that were passed to the component when error occurred
   */
  readonly componentProps?: Record<string, unknown>;

  /**
   * React error boundary information
   */
  readonly errorBoundary?: {
    boundaryName?: string;
    retryCount?: number;
  };
}

// ============================================================================
// DISCRIMINATED UNIONS FOR ERROR TYPES
// ============================================================================

export interface ComponentError extends ReactTryError<"ComponentError"> {
  type: "ComponentError";
}

export interface RenderError extends ReactTryError<"RenderError"> {
  type: "RenderError";
}

export interface EffectError extends ReactTryError<"EffectError"> {
  type: "EffectError";
}

export interface EventHandlerError extends ReactTryError<"EventHandlerError"> {
  type: "EventHandlerError";
  event?: string;
}

export interface FormSubmissionError
  extends ReactTryError<"FormSubmissionError"> {
  type: "FormSubmissionError";
  fieldErrors?: Record<string, string[]>;
}

export interface ValidationError extends ReactTryError<"ValidationError"> {
  type: "ValidationError";
  field?: string;
  value?: unknown;
}

export interface AsyncComponentError
  extends ReactTryError<"AsyncComponentError"> {
  type: "AsyncComponentError";
}

export interface StateUpdateError extends ReactTryError<"StateUpdateError"> {
  type: "StateUpdateError";
}

export interface AbortedError extends ReactTryError<"ABORTED"> {
  type: "ABORTED";
  reason?: "manual_abort" | "unmount" | "timeout";
}

export interface ComponentUnmountedError
  extends ReactTryError<"COMPONENT_UNMOUNTED"> {
  type: "COMPONENT_UNMOUNTED";
}

export interface UnexpectedError extends ReactTryError<"UNEXPECTED_ERROR"> {
  type: "UNEXPECTED_ERROR";
}

/**
 * Union type of all React-specific errors
 */
export type ReactError =
  | ComponentError
  | RenderError
  | EffectError
  | EventHandlerError
  | FormSubmissionError
  | ValidationError
  | AsyncComponentError
  | StateUpdateError
  | AbortedError
  | ComponentUnmountedError
  | UnexpectedError;

// ============================================================================
// TYPE PREDICATES
// ============================================================================

export function isReactTryError(error: unknown): error is ReactTryError {
  return (
    typeof error === "object" &&
    error !== null &&
    TRY_ERROR_BRAND in error &&
    "type" in error &&
    "message" in error &&
    "timestamp" in error
  );
}

export function isComponentError(error: unknown): error is ComponentError {
  return isReactTryError(error) && error.type === "ComponentError";
}

export function isRenderError(error: unknown): error is RenderError {
  return isReactTryError(error) && error.type === "RenderError";
}

export function isEffectError(error: unknown): error is EffectError {
  return isReactTryError(error) && error.type === "EffectError";
}

export function isEventHandlerError(
  error: unknown
): error is EventHandlerError {
  return isReactTryError(error) && error.type === "EventHandlerError";
}

export function isFormSubmissionError(
  error: unknown
): error is FormSubmissionError {
  return isReactTryError(error) && error.type === "FormSubmissionError";
}

export function isValidationError(error: unknown): error is ValidationError {
  return isReactTryError(error) && error.type === "ValidationError";
}

export function isAsyncComponentError(
  error: unknown
): error is AsyncComponentError {
  return isReactTryError(error) && error.type === "AsyncComponentError";
}

export function isStateUpdateError(error: unknown): error is StateUpdateError {
  return isReactTryError(error) && error.type === "StateUpdateError";
}

export function isAbortedError(error: unknown): error is AbortedError {
  return isReactTryError(error) && error.type === "ABORTED";
}

export function isComponentUnmountedError(
  error: unknown
): error is ComponentUnmountedError {
  return isReactTryError(error) && error.type === "COMPONENT_UNMOUNTED";
}

export function isUnexpectedError(error: unknown): error is UnexpectedError {
  return isReactTryError(error) && error.type === "UNEXPECTED_ERROR";
}

// Additional utility type predicates

/**
 * Check if an error is any type of React error
 */
export function isReactError(error: unknown): error is ReactError {
  return (
    isReactTryError(error) &&
    (isComponentError(error) ||
      isRenderError(error) ||
      isEffectError(error) ||
      isEventHandlerError(error) ||
      isFormSubmissionError(error) ||
      isValidationError(error) ||
      isAsyncComponentError(error) ||
      isStateUpdateError(error) ||
      isAbortedError(error) ||
      isComponentUnmountedError(error) ||
      isUnexpectedError(error))
  );
}

/**
 * Check if an error has field errors (form-related)
 */
export function hasFieldErrors(
  error: unknown
): error is FormSubmissionError | ValidationError {
  return (
    isFormSubmissionError(error) ||
    (isValidationError(error) && "field" in error)
  );
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!isReactTryError(error)) return false;

  // Don't retry validation errors or component unmounted errors
  return !(
    isValidationError(error) ||
    isComponentUnmountedError(error) ||
    (isAbortedError(error) && error.reason === "unmount")
  );
}

/**
 * Get the React component name from an error
 */
export function getComponentName(error: unknown): string | undefined {
  if (isReactTryError(error)) {
    return error.componentName;
  }
  return undefined;
}

/**
 * Get field errors from a form error
 */
export function getFieldErrors(
  error: unknown
): Record<string, string[]> | undefined {
  if (isFormSubmissionError(error)) {
    return error.fieldErrors;
  }
  if (isValidationError(error) && error.field) {
    return { [error.field]: [error.message] };
  }
  return undefined;
}

/**
 * Check if error happened in a specific component
 */
export function isErrorFromComponent(
  error: unknown,
  componentName: string
): boolean {
  return isReactTryError(error) && error.componentName === componentName;
}

/**
 * Type guard for TryState
 */
export function isTryState<T>(value: unknown): value is TryState<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "error" in value &&
    "isLoading" in value &&
    "isSuccess" in value &&
    "isError" in value
  );
}

/**
 * Type guard for RetryableTryState
 */
export function isRetryableTryState<T>(
  value: unknown
): value is RetryableTryState<T> {
  return (
    isTryState<T>(value) &&
    "retryCount" in value &&
    "isRetrying" in value &&
    "maxRetriesReached" in value
  );
}

/**
 * Type guard for FormTryState
 */
export function isFormTryState<T>(value: unknown): value is FormTryState<T> {
  return (
    isTryState<T>(value) &&
    "fieldErrors" in value &&
    "isValidating" in value &&
    "isValid" in value &&
    "isDirty" in value &&
    "isSubmitted" in value
  );
}

// ============================================================================
// HOOK CONFIGURATION TYPES
// ============================================================================

/**
 * Base configuration for React hooks that use try-error
 */
export interface TryReactConfig {
  /**
   * Whether to automatically retry failed operations
   */
  autoRetry?: boolean;

  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;

  /**
   * Delay between retry attempts (in milliseconds)
   */
  retryDelay?: number;

  /**
   * Whether to reset state on new attempts
   */
  resetOnRetry?: boolean;

  /**
   * Custom error transformation function
   */
  transformError?: (error: TryError) => TryError;

  /**
   * Custom success data transformation function
   */
  transformData?: <T>(data: T) => T;

  /**
   * Whether to include debug information in development
   */
  includeDebugInfo?: boolean;
}

/**
 * Configuration for async operations in React hooks
 */
export interface AsyncTryConfig extends TryReactConfig {
  /**
   * Timeout for async operations (in milliseconds)
   */
  timeout?: number;

  /**
   * Whether to cancel pending operations on component unmount
   */
  cancelOnUnmount?: boolean;

  /**
   * AbortController signal for cancellation
   */
  signal?: AbortSignal;
}

/**
 * Configuration for form-related try operations
 */
export interface FormTryConfig extends TryReactConfig {
  /**
   * Whether to validate on change
   */
  validateOnChange?: boolean;

  /**
   * Whether to validate on blur
   */
  validateOnBlur?: boolean;

  /**
   * Debounce delay for validation (in milliseconds)
   */
  validationDelay?: number;

  /**
   * Whether to show field-level errors
   */
  showFieldErrors?: boolean;

  /**
   * Whether to prevent form submission on validation errors
   */
  preventSubmitOnError?: boolean;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

/**
 * Base state for try operations in React
 */
export interface TryState<T> {
  /**
   * The successful result data
   */
  data: T | null;

  /**
   * The error if operation failed
   */
  error: TryError | null;

  /**
   * Whether the operation is currently in progress
   */
  isLoading: boolean;

  /**
   * Whether the operation completed successfully
   */
  isSuccess: boolean;

  /**
   * Whether the operation failed with an error
   */
  isError: boolean;

  /**
   * Whether the operation has been executed at least once
   */
  isExecuted?: boolean;
}

/**
 * Extended state for operations that support retries
 */
export interface RetryableTryState<T> extends TryState<T> {
  /**
   * Number of retry attempts made
   */
  retryCount: number;

  /**
   * Whether a retry is currently in progress
   */
  isRetrying: boolean;

  /**
   * Whether max retries have been reached
   */
  maxRetriesReached: boolean;
}

/**
 * State for form validation operations
 */
export interface FormTryState<T> extends TryState<T> {
  /**
   * Field-level validation errors
   */
  fieldErrors: Record<string, string[]>;

  /**
   * Whether the form is currently being validated
   */
  isValidating: boolean;

  /**
   * Whether the form is valid (no errors)
   */
  isValid: boolean;

  /**
   * Whether the form has been touched/modified
   */
  isDirty: boolean;

  /**
   * Whether the form has been submitted
   */
  isSubmitted: boolean;
}

// ============================================================================
// CALLBACK AND EVENT TYPES
// ============================================================================

/**
 * Callback function types for try operations
 */
export interface TryCallbacks<T> {
  /**
   * Called when operation succeeds
   */
  onSuccess?: (data: T) => void;

  /**
   * Called when operation fails
   */
  onError?: (error: TryError) => void;

  /**
   * Called when operation starts
   */
  onStart?: () => void;

  /**
   * Called when operation completes (success or error)
   */
  onComplete?: (result: TryResult<T>) => void;

  /**
   * Called before retry attempts
   */
  onRetry?: (attempt: number, error: TryError) => void;
}

/**
 * Event handler types for React components using try-error
 */
export interface TryEventHandlers<T> {
  /**
   * Form submission handler
   */
  onSubmit?: (event: React.FormEvent) => Promise<TryResult<T>>;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent) => Promise<TryResult<T>>;

  /**
   * Change handler for form inputs
   */
  onChange?: (event: React.ChangeEvent) => TryResult<T>;

  /**
   * Blur handler for form inputs
   */
  onBlur?: (event: React.FocusEvent) => TryResult<T>;
}

// ============================================================================
// ERROR BOUNDARY TYPES
// ============================================================================

/**
 * Props for error boundary components
 */
export interface ErrorBoundaryProps {
  /**
   * Child components to wrap
   */
  children: ReactNode;

  /**
   * Custom fallback component
   */
  fallback?: (
    error: Error | TryError,
    errorInfo: ErrorInfo | null,
    retry: () => void
  ) => ReactNode;

  /**
   * Error handler callback
   */
  onError?: (error: Error | TryError, errorInfo: ErrorInfo | null) => void;

  /**
   * Whether to show retry functionality
   */
  showRetry?: boolean;

  /**
   * Maximum number of retries allowed
   */
  maxRetries?: number;

  /**
   * Custom error message
   */
  errorMessage?: string;

  /**
   * Whether to show error details in development
   */
  showErrorDetails?: boolean;

  /**
   * CSS class name for styling
   */
  className?: string;

  /**
   * Whether to isolate this boundary (prevent error bubbling)
   */
  isolate?: boolean;
}

/**
 * State for error boundary components
 */
export interface ErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;

  /**
   * The error that occurred
   */
  error: Error | TryError | null;

  /**
   * React error info
   */
  errorInfo: ErrorInfo | null;

  /**
   * Number of retry attempts
   */
  retryCount: number;

  /**
   * Unique key for forcing re-render on retry
   */
  retryKey?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract the data type from a TryResult
 */
export type ExtractTryData<T> = T extends TryResult<infer U> ? U : never;

/**
 * Extract the error type from a TryResult
 */
export type ExtractTryError<T> = T extends TryResult<any, infer E>
  ? E
  : TryError;

/**
 * Make all properties of TryState optional except specified ones
 */
export type PartialTryState<T, K extends keyof TryState<T> = never> = Partial<
  TryState<T>
> &
  Pick<TryState<T>, K>;

/**
 * Hook return type with additional utility methods
 */
export interface TryHookReturn<T> extends TryState<T> {
  /**
   * Execute the operation
   */
  execute: () => Promise<void>;

  /**
   * Reset the state to initial values
   */
  reset: () => void;

  /**
   * Manually set the data (optimistic updates)
   */
  mutate: (data: T) => void;

  /**
   * Retry the last operation
   */
  retry?: () => Promise<void>;
}

/**
 * Async hook return type
 */
export interface AsyncTryHookReturn<T> extends TryHookReturn<T> {
  /**
   * Cancel the current operation
   */
  cancel: () => void;

  /**
   * Whether the operation can be cancelled
   */
  canCancel: boolean;
}

/**
 * Form hook return type
 */
export interface FormTryHookReturn<T> extends TryHookReturn<T> {
  /**
   * Validate specific fields
   */
  validateFields: (fields: string[]) => Promise<boolean>;

  /**
   * Clear field errors
   */
  clearFieldErrors: (fields?: string[]) => void;

  /**
   * Set field error
   */
  setFieldError: (field: string, errors: string[]) => void;

  /**
   * Get field errors
   */
  getFieldErrors: (field: string) => string[];
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Props for components that handle errors
 */
export interface WithErrorHandling<P = {}> {
  /**
   * Error handler
   */
  onError?: (error: TryError) => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Error state
   */
  error?: TryError | null;
}

/**
 * Props for form components
 */
export interface FormComponentProps<T> extends WithErrorHandling {
  /**
   * Form submission handler
   */
  onSubmit: (data: T) => Promise<void> | void;

  /**
   * Initial form values
   */
  initialValues?: Partial<T>;

  /**
   * Validation schema or function
   */
  validate?: (values: T) => Record<string, string> | undefined;

  /**
   * Whether form is submitting
   */
  isSubmitting?: boolean;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Type for async functions that can be aborted
 */
export type AbortableAsyncFn<T> = (signal: AbortSignal) => Promise<T>;

/**
 * Type for mutation functions
 */
export type MutationFn<TVariables, TData> = (
  variables: TVariables,
  signal: AbortSignal
) => Promise<TData>;

/**
 * Type-safe error factory for React errors
 */
export function createReactError<T extends ReactErrorType>(
  type: T,
  message: string,
  context?: Record<string, unknown>
): ReactTryError<T> {
  return {
    type,
    message,
    timestamp: Date.now(),
    source: "react",
    context,
  } as ReactTryError<T>;
}
