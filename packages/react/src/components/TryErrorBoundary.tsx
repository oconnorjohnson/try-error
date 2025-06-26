// TryErrorBoundary component for React error handling
// TODO: Implement React error boundary for try-error integration

import React, { Component, ReactNode, ErrorInfo } from "react";
import { isTryError, TryError, createError } from "try-error";
import { ErrorProvider, ErrorContextValue } from "../context/ErrorContext";

// Props for the TryErrorBoundary component
export interface TryErrorBoundaryProps {
  children: ReactNode;
  // Custom fallback component for errors
  fallback?: (
    error: Error | TryError,
    errorInfo: ErrorInfo | null,
    retry: () => void
  ) => ReactNode;
  // Called when an error occurs
  onError?: (error: Error | TryError, errorInfo: ErrorInfo | null) => void;
  // Whether to show retry button in default fallback
  showRetry?: boolean;
  // Custom error message for the default fallback
  errorMessage?: string;
  // Whether to show error details in development
  showErrorDetails?: boolean;
  // Custom CSS classes for styling
  className?: string;
  // Whether to isolate this boundary (prevent error bubbling up)
  isolate?: boolean;
  // Error filter function - return false to not catch the error
  errorFilter?: (error: Error) => boolean;
  // Custom retry strategy
  retryStrategy?: {
    maxRetries?: number;
    delay?: number;
    backoff?: "linear" | "exponential";
  };
}

// State for the error boundary
interface TryErrorBoundaryState {
  hasError: boolean;
  error: Error | TryError | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Enhanced React Error Boundary with try-error integration
 *
 * Catches both regular React errors and provides special handling for TryError objects.
 * Includes retry functionality, custom fallback UIs, and error reporting integration.
 *
 * @example
 * ```tsx
 * <TryErrorBoundary
 *   fallback={(error, errorInfo, retry) => (
 *     <div>
 *       <h2>Something went wrong</h2>
 *       <p>{error.message}</p>
 *       <button onClick={retry}>Try Again</button>
 *     </div>
 *   )}
 *   onError={(error) => reportError(error)}
 *   showRetry={true}
 * >
 *   <MyComponent />
 * </TryErrorBoundary>
 * ```
 */
export class TryErrorBoundary extends Component<
  TryErrorBoundaryProps,
  TryErrorBoundaryState
> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private errorLogMap = new WeakMap<Error, boolean>();
  private isRetrying = false;

  constructor(props: TryErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<TryErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if we should catch this error
    if (this.props.errorFilter && !this.props.errorFilter(error)) {
      throw error; // Re-throw to let parent boundary handle it
    }

    // Check if error is already a TryError to avoid double conversion
    const tryError = isTryError(error)
      ? error
      : createError({
          type: "ReactError",
          message: error.message,
          cause: error,
          context: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
            // Preserve original error's component stack if it exists
            originalStack: (error as any).componentStack,
          },
        });

    this.setState({
      error: tryError,
      errorInfo,
    });

    // Call the error handler if provided
    this.props.onError?.(tryError, errorInfo);

    // Log error in development with deduplication
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development" &&
      !this.errorLogMap.has(error)
    ) {
      this.errorLogMap.set(error, true);
      this.logError(tryError, errorInfo);
    }
  }

  private logError(error: TryError | Error, errorInfo: ErrorInfo) {
    // Safe console access
    if (
      typeof console !== "undefined" &&
      console.group &&
      console.error &&
      console.groupEnd
    ) {
      console.group("🚨 TryErrorBoundary caught an error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      if (isTryError(error)) {
        console.error("TryError Details:", {
          type: error.type,
          source: error.source,
          timestamp: new Date(error.timestamp).toISOString(),
          context: error.context,
        });
      }
      console.groupEnd();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }

  handleRetry = () => {
    const { retryStrategy } = this.props;
    const maxRetries = retryStrategy?.maxRetries ?? 3;

    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.isRetrying = true;

    // Calculate delay based on retry strategy
    let delay = 0;
    if (retryStrategy?.delay) {
      if (retryStrategy.backoff === "exponential") {
        delay = retryStrategy.delay * Math.pow(2, this.state.retryCount);
      } else {
        delay = retryStrategy.delay;
      }
    }

    if (delay > 0) {
      this.retryTimeoutId = setTimeout(() => {
        this.performRetry();
      }, delay);
    } else {
      this.performRetry();
    }
  };

  private performRetry = () => {
    this.isRetrying = false;
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private clearError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const errorContextValue: ErrorContextValue = {
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        retry: this.handleRetry,
        clearError: this.clearError,
        retryCount: this.state.retryCount,
        isRetrying: this.isRetrying,
      };

      const errorUI = (
        <>
          {/* Use custom fallback if provided */}
          {this.props.fallback ? (
            this.props.fallback(
              this.state.error,
              this.state.errorInfo,
              this.handleRetry
            )
          ) : (
            <DefaultErrorFallback
              error={this.state.error}
              errorInfo={this.state.errorInfo}
              onRetry={
                this.props.showRetry !== false ? this.handleRetry : undefined
              }
              errorMessage={this.props.errorMessage}
              showErrorDetails={this.props.showErrorDetails}
              className={this.props.className}
              retryCount={this.state.retryCount}
              maxRetries={this.props.retryStrategy?.maxRetries ?? 3}
            />
          )}
        </>
      );

      // Wrap in ErrorProvider to make error context available to children
      return <ErrorProvider value={errorContextValue}>{errorUI}</ErrorProvider>;
    }

    return this.props.children;
  }
}

// Default fallback component
interface DefaultErrorFallbackProps {
  error: Error | TryError;
  errorInfo: ErrorInfo | null;
  onRetry?: () => void;
  errorMessage?: string;
  showErrorDetails?: boolean;
  className?: string;
  retryCount: number;
  maxRetries: number;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  onRetry,
  errorMessage,
  showErrorDetails = typeof process !== "undefined" &&
    process.env?.NODE_ENV === "development",
  className = "",
  retryCount,
  maxRetries,
}: DefaultErrorFallbackProps) {
  const isTryErr = isTryError(error);
  const displayMessage =
    errorMessage || error.message || "An unexpected error occurred";

  return (
    <div
      className={`try-error-boundary ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="try-error-boundary__content">
        <h2 className="try-error-boundary__title">
          {isTryErr ? "⚠️ Operation Failed" : "🚨 Something went wrong"}
        </h2>

        <p className="try-error-boundary__message">{displayMessage}</p>

        {isTryErr && (
          <div className="try-error-boundary__try-error-details">
            <p className="try-error-boundary__error-type">
              Error Type: <code>{error.type}</code>
            </p>
            {error.source && (
              <p className="try-error-boundary__error-source">
                Source: <code>{error.source}</code>
              </p>
            )}
          </div>
        )}

        {onRetry && (
          <div className="try-error-boundary__actions">
            <button
              className="try-error-boundary__retry-button"
              onClick={onRetry}
              disabled={retryCount >= maxRetries}
              aria-label={
                retryCount >= maxRetries
                  ? "Maximum retry attempts reached"
                  : "Retry the failed operation"
              }
            >
              {retryCount >= maxRetries ? "Max retries reached" : "Try Again"}
            </button>
            {retryCount > 0 && (
              <p className="try-error-boundary__retry-count" aria-live="polite">
                Retry attempt: {retryCount} of {maxRetries}
              </p>
            )}
          </div>
        )}

        {showErrorDetails && (
          <details className="try-error-boundary__details">
            <summary>Error Details (Development)</summary>
            <pre className="try-error-boundary__stack">
              {error.stack || "No stack trace available"}
            </pre>
            {errorInfo && (
              <pre className="try-error-boundary__component-stack">
                {errorInfo.componentStack}
              </pre>
            )}
            {isTryErr && error.context && (
              <pre className="try-error-boundary__context">
                Context: {JSON.stringify(error.context, null, 2)}
              </pre>
            )}
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for manually triggering error boundaries
 *
 * Useful for testing error boundaries or manually throwing errors
 * that should be caught by the nearest error boundary.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const throwError = useErrorBoundaryTrigger();
 *
 *   const handleError = () => {
 *     throwError(createError({
 *       type: "ManualError",
 *       message: "This error was triggered manually"
 *     }));
 *   };
 *
 *   return <button onClick={handleError}>Trigger Error</button>;
 * }
 * ```
 */
export function useErrorBoundaryTrigger() {
  return (error: Error | TryError) => {
    throw error;
  };
}

/**
 * Higher-order component that wraps a component with TryErrorBoundary
 *
 * @example
 * ```tsx
 * const SafeComponent = withTryErrorBoundary(MyComponent, {
 *   fallback: (error, errorInfo, retry) => <div>Error: {error.message}</div>,
 *   onError: (error) => reportError(error)
 * });
 * ```
 */
export function withTryErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<TryErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <TryErrorBoundary {...boundaryProps}>
      <Component {...props} />
    </TryErrorBoundary>
  );

  WrappedComponent.displayName = `withTryErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
