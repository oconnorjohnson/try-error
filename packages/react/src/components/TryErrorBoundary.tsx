import React, { Component, ReactNode } from "react";
import { TryError, TryErrorBoundaryProps } from "../types";

interface TryErrorBoundaryState {
  hasError: boolean;
  error: TryError | null;
}

/**
 * Type-safe error boundary component for try-error
 *
 * Provides declarative error handling at the component level with
 * filtering, isolation, and automatic reset capabilities.
 */
export class TryErrorBoundary extends Component<
  TryErrorBoundaryProps,
  TryErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: TryErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TryErrorBoundaryState {
    // Check if this is a TryError
    const isTryError = error && typeof error === "object" && "type" in error;

    return {
      hasError: true,
      error: isTryError
        ? (error as TryError)
        : ({
            type: "UnknownError",
            message: error.message || "An unknown error occurred",
            source: "TryErrorBoundary",
            timestamp: Date.now(),
            stack: error.stack,
          } as TryError),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, filter } = this.props;
    const { error: tryError } = this.state;

    if (tryError) {
      // Apply filter if provided
      if (filter && !filter(tryError)) {
        // Don't handle this error, let it propagate
        this.setState({ hasError: false, error: null });
        throw error;
      }

      // Call error handler
      onError?.(tryError, errorInfo);
    }
  }

  componentDidUpdate(prevProps: TryErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset on key changes
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset on any prop change
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({ hasError: false, error: null });
    }, 0);
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback, isolate } = this.props;

    if (hasError && error) {
      // Render fallback component
      if (Fallback) {
        return <Fallback error={error} retry={this.resetErrorBoundary} />;
      }

      // Default fallback
      return (
        <div
          style={{
            padding: "20px",
            border: "1px solid #ff6b6b",
            borderRadius: "4px",
            backgroundColor: "#ffe0e0",
            color: "#d63031",
          }}
        >
          <h3>Something went wrong</h3>
          <p>{error.message}</p>
          <button
            onClick={this.resetErrorBoundary}
            style={{
              padding: "8px 16px",
              backgroundColor: "#d63031",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {process.env.NODE_ENV === "development" && (
            <details style={{ marginTop: "10px" }}>
              <summary>Error details</summary>
              <pre
                style={{
                  fontSize: "12px",
                  overflow: "auto",
                  backgroundColor: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "4px",
                  marginTop: "5px",
                }}
              >
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

// Default error fallback component
export const DefaultErrorFallback: React.FC<{
  error: TryError;
  retry: () => void;
}> = ({ error, retry }) => (
  <div
    style={{
      padding: "20px",
      border: "1px solid #ff6b6b",
      borderRadius: "4px",
      backgroundColor: "#ffe0e0",
      color: "#d63031",
    }}
  >
    <h3>Error: {error.type}</h3>
    <p>{error.message}</p>
    <button
      onClick={retry}
      style={{
        padding: "8px 16px",
        backgroundColor: "#d63031",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Retry
    </button>
  </div>
);
