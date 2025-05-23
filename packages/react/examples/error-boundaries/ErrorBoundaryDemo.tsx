import React, { Component, ReactNode, useState } from "react";
import { createError, isTryError, TryError } from "../../../../src";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | TryError | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | TryError, retry: () => void) => ReactNode;
  onError?: (error: Error | TryError, errorInfo: React.ErrorInfo) => void;
}

// Enhanced Error Boundary that works with try-error
class TryErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error details
    console.error("Error caught by TryErrorBoundary:", {
      error,
      errorInfo,
      isTryError: isTryError(error),
      errorType: isTryError(error) ? error.type : "UNKNOWN",
    });
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      // Default error UI
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <div className="text-red-700 mb-4">
            {isTryError(this.state.error) ? (
              <div>
                <p>
                  <strong>Error Type:</strong> {this.state.error.type}
                </p>
                <p>
                  <strong>Message:</strong> {this.state.error.message}
                </p>
                {this.state.error.context && (
                  <p>
                    <strong>Context:</strong>{" "}
                    {JSON.stringify(this.state.error.context)}
                  </p>
                )}
              </div>
            ) : (
              <p>{this.state.error.message}</p>
            )}
          </div>
          <button
            onClick={this.retry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component that throws different types of errors
function ErrorThrowingComponent() {
  const [errorType, setErrorType] = useState<string>("none");

  const throwError = (type: string) => {
    setErrorType(type);

    switch (type) {
      case "try-error":
        throw createError({
          type: "DEMO_ERROR",
          message: "This is a try-error with context",
          context: { userId: 123, action: "demo" },
        });
      case "regular":
        throw new Error("This is a regular JavaScript error");
      case "async":
        // This won't be caught by error boundary (async errors need different handling)
        setTimeout(() => {
          throw createError({
            type: "ASYNC_ERROR",
            message: "This async error won't be caught",
          });
        }, 100);
        break;
      default:
        setErrorType("none");
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Error Throwing Component</h3>
      <div className="space-y-2">
        <button
          onClick={() => throwError("try-error")}
          className="block w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Throw TryError (will be caught)
        </button>
        <button
          onClick={() => throwError("regular")}
          className="block w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Throw Regular Error (will be caught)
        </button>
        <button
          onClick={() => throwError("async")}
          className="block w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Throw Async Error (won't be caught)
        </button>
      </div>
      {errorType === "none" && (
        <p className="mt-4 text-green-600">
          No errors thrown - component is working normally
        </p>
      )}
    </div>
  );
}

// Custom fallback component
function CustomErrorFallback(error: Error | TryError, retry: () => void) {
  return (
    <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
      <div className="flex items-center mb-4">
        <svg
          className="w-8 h-8 text-red-500 mr-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <h2 className="text-xl font-bold text-red-800">Custom Error Handler</h2>
      </div>

      <div className="bg-white p-4 rounded border mb-4">
        {isTryError(error) ? (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Type:</span> {error.type}
            </div>
            <div>
              <span className="font-semibold">Message:</span> {error.message}
            </div>
            <div>
              <span className="font-semibold">Source:</span> {error.source}
            </div>
            <div>
              <span className="font-semibold">Timestamp:</span>{" "}
              {new Date(error.timestamp).toLocaleString()}
            </div>
            {error.context && (
              <div>
                <span className="font-semibold">Context:</span>
                <pre className="mt-1 text-sm bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div>
              <span className="font-semibold">Type:</span> Regular Error
            </div>
            <div>
              <span className="font-semibold">Message:</span> {error.message}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🔄 Retry
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔃 Reload Page
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundaryDemo() {
  const [useCustomFallback, setUseCustomFallback] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Error Boundary Integration</h2>

      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useCustomFallback}
            onChange={(e) => setUseCustomFallback(e.target.checked)}
            className="mr-2"
          />
          Use custom error fallback UI
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default Error Boundary */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Default Error Boundary</h3>
          <TryErrorBoundary
            fallback={useCustomFallback ? CustomErrorFallback : undefined}
            onError={(error, errorInfo) => {
              console.log("Error logged:", { error, errorInfo });
            }}
          >
            <ErrorThrowingComponent />
          </TryErrorBoundary>
        </div>

        {/* Another Error Boundary Instance */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Another Boundary Instance
          </h3>
          <TryErrorBoundary
            fallback={useCustomFallback ? CustomErrorFallback : undefined}
          >
            <ErrorThrowingComponent />
          </TryErrorBoundary>
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 text-sm text-gray-600 bg-blue-50 p-4 rounded">
        <p className="font-medium mb-2">This example demonstrates:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Error boundaries that understand try-error types</li>
          <li>Custom fallback UI with detailed error information</li>
          <li>Retry functionality for error recovery</li>
          <li>Different error types (TryError vs regular Error)</li>
          <li>Error logging and reporting integration</li>
        </ul>

        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="font-medium text-yellow-800">Note:</p>
          <p className="text-yellow-700">
            Error boundaries only catch errors during rendering, in lifecycle
            methods, and in constructors. They don't catch errors in event
            handlers, async code, or during server-side rendering.
          </p>
        </div>
      </div>
    </div>
  );
}
