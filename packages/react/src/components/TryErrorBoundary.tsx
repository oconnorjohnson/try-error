// TryErrorBoundary component for React error handling
// TODO: Implement React error boundary for try-error integration

import React, { Component, ReactNode, ErrorInfo } from "react";
import { isTryError, TryError, createError } from "try-error";

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
  private retryTimeoutId: number | null = null;

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
    // Convert regular Error to TryError for consistent handling
    const tryError = isTryError(error)
      ? error
      : createError({
          type: "ReactError",
          message: error.message,
          cause: error,
          context: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
          },
        });

    this.setState({
      error: tryError,
      errorInfo,
    });

    // Call the error handler if provided
    this.props.onError?.(tryError, errorInfo);

    // Log error in development
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development"
    ) {
      if (typeof console !== "undefined") {
        console.group("🚨 TryErrorBoundary caught an error");
        console.error("Error:", error);
        console.error("Error Info:", errorInfo);
        if (isTryError(tryError)) {
          console.error("TryError Details:", {
            type: tryError.type,
            source: tryError.source,
            timestamp: new Date(tryError.timestamp).toISOString(),
            context: tryError.context,
          });
        }
        console.groupEnd();
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId && typeof clearTimeout !== "undefined") {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.handleRetry
        );
      }

      // Default fallback UI
      return (
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
        />
      );
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
}: DefaultErrorFallbackProps) {
  const isTryErr = isTryError(error);
  const displayMessage =
    errorMessage || error.message || "An unexpected error occurred";

  return (
    <div className={`try-error-boundary ${className}`} role="alert">
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
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? "Max retries reached" : "Try Again"}
            </button>
            {retryCount > 0 && (
              <p className="try-error-boundary__retry-count">
                Retry attempt: {retryCount}
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
