// Type definitions for React integration
// TODO: Implement React-specific types for error handling

import { TryError, TryResult } from "try-error";
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
  | "AsyncComponentError";

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
  isExecuted: boolean;
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
  retryKey: number;
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
