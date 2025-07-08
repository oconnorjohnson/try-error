---
id: TryErrorBoundary-deep-dive
title: TryErrorBoundary - Complete Implementation Guide
tags: [react, error-boundary, component, retry, async-errors, event-handlers]
related: [useTry, useErrorRecovery, createError, fromThrown, React]
module: react
complexity: intermediate
performance_impact: low
stability: stable
---

# TryErrorBoundary - Complete Implementation Guide

## Quick Reference

Enhanced React Error Boundary with try-error integration, retry functionality, async error handling, and comprehensive error reporting. Catches both React render errors and unhandled promise rejections/event handler errors.

## Signature

```typescript
// Core Component
interface TryErrorBoundaryProps {
  children: ReactNode;
  fallback?: (
    error: Error | TryError,
    errorInfo: ErrorInfo | null,
    retry: () => void
  ) => ReactNode;
  onError?: (error: Error | TryError, errorInfo: ErrorInfo | null) => void;
  showRetry?: boolean;
  errorMessage?: string;
  showErrorDetails?: boolean;
  className?: string;
  isolate?: boolean;
  errorFilter?: (error: Error) => boolean;
  retryStrategy?: RetryStrategy;
  catchAsyncErrors?: boolean;
  catchEventHandlerErrors?: boolean;
}

// Retry Strategy
interface RetryStrategy {
  maxRetries?: number; // Default: 3
  delay?: number; // Default: 0
  backoff?: "linear" | "exponential"; // Default: "linear"
}

// HOC Wrapper
function withTryErrorBoundary<P>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<TryErrorBoundaryProps, "children">
): React.ComponentType<P>;

// Hooks
function useErrorBoundaryTrigger(): (error: Error) => void;
function useAsyncError(): (error: Error | TryError) => void;
function useAsyncErrorHandler(): (asyncFn: () => Promise<any>) => Promise<any>;
```

## Purpose

- **React error catching**: Catch errors during React render, lifecycle methods, and constructors
- **Async error handling**: Handle unhandled promise rejections and event handler errors
- **Retry mechanism**: Automatic retry with configurable strategies (linear/exponential backoff)
- **TryError integration**: Special handling for TryError objects with enhanced debugging
- **Custom fallback UIs**: Flexible error display with custom components
- **Error reporting**: Integration with error monitoring services
- **Development tools**: Enhanced error debugging in development mode

## Implementation Details

### Core Architecture

```
TryErrorBoundary
├── React Error Boundary (componentDidCatch)
│   ├── getDerivedStateFromError()
│   ├── componentDidCatch()
│   └── Error state management
├── Async Error Handler (global listeners)
│   ├── unhandledrejection events
│   ├── global error events
│   └── Event handler errors
├── Retry System
│   ├── Configurable retry strategies
│   ├── Exponential/linear backoff
│   └── Max retry limits
├── Error Context Provider
│   ├── ErrorProvider integration
│   ├── Error state sharing
│   └── Recovery utilities
└── Default Fallback UI
    ├── TryError-aware display
    ├── Retry controls
    └── Development debugging
```

### Performance Characteristics

- **Render Impact**: Minimal - only activates on errors
- **Memory Usage**: ~2KB per boundary + error state
- **Global Handlers**: Shared across all boundaries
- **Retry Overhead**: Configurable delays, non-blocking
- **Error Conversion**: TryError creation ~25-115ns

### Error Flow Process

```
1. Error Detection → 0-50ns
   a. React render/lifecycle errors → componentDidCatch
   b. Async errors → global event handlers
   c. Event handler errors → error event listener
2. Error Classification → 25-115ns
   a. Check if TryError (instanceof)
   b. Convert to TryError via createError()
   c. Merge additional context
3. State Update → React standard
   a. Set hasError = true
   b. Store error and errorInfo
   c. Trigger re-render
4. Fallback Rendering → Variable
   a. Custom fallback or default UI
   b. ErrorProvider context setup
   c. Retry mechanism activation
5. Error Reporting → 0-500ms
   a. Call onError callback
   b. Development logging
   c. Error monitoring integration
```

## Basic Usage Examples

### Simple Error Boundary

```tsx
// Basic error boundary setup
function App() {
  return (
    <TryErrorBoundary>
      <Header />
      <MainContent />
      <Footer />
    </TryErrorBoundary>
  );
}

// Component that may throw errors
function MainContent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // This error will be caught by the boundary
    if (someCondition) {
      throw new Error("Failed to load data");
    }
  }, []);

  return <div>{data}</div>;
}
```

### Error Boundary with Retry

```tsx
function DataFetchingComponent() {
  return (
    <TryErrorBoundary
      showRetry={true}
      retryStrategy={{
        maxRetries: 3,
        delay: 1000,
        backoff: "exponential",
      }}
      onError={(error, errorInfo) => {
        console.error("Error caught:", error);
        reportErrorToService(error, errorInfo);
      }}
    >
      <UserProfile userId="123" />
    </TryErrorBoundary>
  );
}

// Component that may fail on initial load
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch((error) => {
        // This will be caught by the boundary
        throw new Error(`Failed to load user ${userId}: ${error.message}`);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  return <div>User: {user.name}</div>;
}
```

### Async Error Handling

```tsx
// Catch unhandled promise rejections
function AsyncErrorDemo() {
  return (
    <TryErrorBoundary
      catchAsyncErrors={true}
      catchEventHandlerErrors={true}
      onError={(error, errorInfo) => {
        console.log("Async error caught:", error);
      }}
    >
      <AsyncComponent />
    </TryErrorBoundary>
  );
}

function AsyncComponent() {
  const handleClick = () => {
    // This promise rejection will be caught
    fetch("/api/data")
      .then((response) => response.json())
      .then((data) => {
        // Don't handle errors - let boundary catch them
        if (data.error) {
          throw new Error(data.error);
        }
      });
    // No .catch() - unhandled rejection will be caught by boundary
  };

  return <button onClick={handleClick}>Load Data</button>;
}
```

### Custom Fallback UI

```tsx
function CustomFallbackExample() {
  return (
    <TryErrorBoundary
      fallback={(error, errorInfo, retry) => (
        <div className="custom-error-ui">
          <h2>🚨 Oops! Something went wrong</h2>
          <p>Error: {error.message}</p>

          {isTryError(error) && (
            <div className="try-error-details">
              <p>
                Type: <code>{error.type}</code>
              </p>
              <p>
                Source: <code>{error.source}</code>
              </p>
              {error.context && (
                <details>
                  <summary>Context</summary>
                  <pre>{JSON.stringify(error.context, null, 2)}</pre>
                </details>
              )}
            </div>
          )}

          <div className="error-actions">
            <button onClick={retry} className="retry-btn">
              🔄 Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="refresh-btn"
            >
              🔄 Refresh Page
            </button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <details className="error-debug">
              <summary>Debug Information</summary>
              <pre>{error.stack}</pre>
              {errorInfo && <pre>{errorInfo.componentStack}</pre>}
            </details>
          )}
        </div>
      )}
    >
      <ComplexComponent />
    </TryErrorBoundary>
  );
}
```

## Advanced Usage Patterns

### Nested Error Boundaries

```tsx
// Hierarchical error handling
function App() {
  return (
    <TryErrorBoundary
      fallback={(error, errorInfo, retry) => (
        <div className="app-error">
          <h1>Application Error</h1>
          <p>The entire application has encountered an error.</p>
          <button onClick={retry}>Restart App</button>
        </div>
      )}
      onError={(error) => {
        // Global error reporting
        reportCriticalError(error);
      }}
    >
      <Header />

      <main>
        <TryErrorBoundary
          fallback={(error, errorInfo, retry) => (
            <div className="sidebar-error">
              <h3>Sidebar Error</h3>
              <p>The sidebar failed to load.</p>
              <button onClick={retry}>Retry Sidebar</button>
            </div>
          )}
          isolate={true}
        >
          <Sidebar />
        </TryErrorBoundary>

        <TryErrorBoundary
          fallback={(error, errorInfo, retry) => (
            <div className="content-error">
              <h3>Content Error</h3>
              <p>The main content failed to load.</p>
              <button onClick={retry}>Retry Content</button>
            </div>
          )}
          isolate={true}
        >
          <MainContent />
        </TryErrorBoundary>
      </main>

      <Footer />
    </TryErrorBoundary>
  );
}
```

### Error Filtering and Routing

```tsx
// Selective error handling
function SelectiveErrorBoundary() {
  return (
    <TryErrorBoundary
      errorFilter={(error) => {
        // Only catch specific error types
        return (
          error.name === "ValidationError" ||
          error.name === "NetworkError" ||
          error.message.includes("API")
        );
      }}
      fallback={(error, errorInfo, retry) => {
        // Different UIs based on error type
        if (error.name === "ValidationError") {
          return (
            <div className="validation-error">
              <h3>Validation Error</h3>
              <p>Please check your input and try again.</p>
              <button onClick={retry}>Fix and Retry</button>
            </div>
          );
        }

        if (error.name === "NetworkError") {
          return (
            <div className="network-error">
              <h3>Network Error</h3>
              <p>Please check your internet connection.</p>
              <button onClick={retry}>Try Again</button>
            </div>
          );
        }

        return (
          <div className="generic-error">
            <h3>Something went wrong</h3>
            <p>{error.message}</p>
            <button onClick={retry}>Retry</button>
          </div>
        );
      }}
    >
      <FormComponent />
    </TryErrorBoundary>
  );
}
```

### Error Recovery Strategies

```tsx
// Advanced retry strategies
function ResilientComponent() {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <TryErrorBoundary
      retryStrategy={{
        maxRetries: 5,
        delay: 1000,
        backoff: "exponential",
      }}
      fallback={(error, errorInfo, retry) => (
        <div className="resilient-error">
          <h3>Temporary Issue</h3>
          <p>We're experiencing some technical difficulties.</p>

          {retryCount < 3 && (
            <button onClick={retry} className="retry-auto">
              🔄 Retry Automatically
            </button>
          )}

          {retryCount >= 3 && (
            <div className="manual-actions">
              <p>Multiple retries failed. Try these actions:</p>
              <button onClick={() => window.location.reload()}>
                🔄 Refresh Page
              </button>
              <button onClick={() => localStorage.clear()}>
                🗑️ Clear Cache
              </button>
              <button onClick={() => (window.location.href = "/help")}>
                ❓ Get Help
              </button>
            </div>
          )}

          <details className="error-details">
            <summary>Technical Details</summary>
            <p>Error: {error.message}</p>
            <p>Retry Count: {retryCount}</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
          </details>
        </div>
      )}
      onError={(error, errorInfo) => {
        setRetryCount((prev) => prev + 1);

        // Escalate to different services based on retry count
        if (retryCount === 0) {
          reportToErrorService(error, { level: "warning" });
        } else if (retryCount >= 3) {
          reportToErrorService(error, { level: "critical" });
        }
      }}
    >
      <CriticalComponent />
    </TryErrorBoundary>
  );
}
```

### HOC Pattern

```tsx
// Higher-order component pattern
const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<TryErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <TryErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </TryErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};

// Usage
const SafeUserProfile = withErrorBoundary(UserProfile, {
  errorMessage: "Failed to load user profile",
  showRetry: true,
  onError: (error) => reportError(error, { component: "UserProfile" }),
});

const SafeProductList = withErrorBoundary(ProductList, {
  retryStrategy: { maxRetries: 3, delay: 2000 },
  fallback: (error, errorInfo, retry) => (
    <div className="product-list-error">
      <h3>Products temporarily unavailable</h3>
      <button onClick={retry}>Reload Products</button>
    </div>
  ),
});
```

## Hook Integration

### useErrorBoundaryTrigger

```tsx
// Manual error triggering
function ComponentWithManualErrors() {
  const throwError = useErrorBoundaryTrigger();

  const handleCriticalError = () => {
    // Manually trigger error boundary
    throwError(new Error("Critical operation failed"));
  };

  const handleValidationError = () => {
    throwError(
      createError({
        type: "ValidationError",
        message: "Form validation failed",
        context: { fields: ["email", "password"] },
      })
    );
  };

  return (
    <div>
      <button onClick={handleCriticalError}>Trigger Critical Error</button>
      <button onClick={handleValidationError}>Trigger Validation Error</button>
    </div>
  );
}
```

### useAsyncError and useAsyncErrorHandler

```tsx
// Async error handling hooks
function AsyncDataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const throwAsyncError = useAsyncError();
  const handleAsyncError = useAsyncErrorHandler();

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await handleAsyncError(async () => {
        const response = await fetch("/api/data");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      });
      setData(result);
    } catch (error) {
      // This will be caught by the error boundary
      throwAsyncError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnhandledAsync = () => {
    // This will be caught by boundary with catchAsyncErrors={true}
    Promise.reject(new Error("Unhandled async error"));
  };

  return (
    <div>
      <button onClick={loadData} disabled={loading}>
        {loading ? "Loading..." : "Load Data"}
      </button>
      <button onClick={handleUnhandledAsync}>
        Trigger Unhandled Async Error
      </button>
      {data && <div>Data: {JSON.stringify(data)}</div>}
    </div>
  );
}
```

## Error Monitoring Integration

### Sentry Integration

```tsx
// Sentry error reporting
import * as Sentry from "@sentry/react";

function SentryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <TryErrorBoundary
      onError={(error, errorInfo) => {
        // Enhanced Sentry reporting
        Sentry.withScope((scope) => {
          scope.setTag("errorBoundary", true);
          scope.setLevel("error");

          if (isTryError(error)) {
            scope.setTag("errorType", error.type);
            scope.setTag("errorSource", error.source);
            scope.setContext("tryError", {
              type: error.type,
              source: error.source,
              timestamp: error.timestamp,
              context: error.context,
            });
          }

          if (errorInfo) {
            scope.setContext("errorInfo", {
              componentStack: errorInfo.componentStack,
            });
          }

          Sentry.captureException(error.cause || error);
        });
      }}
      fallback={(error, errorInfo, retry) => (
        <div className="sentry-error-ui">
          <h2>Something went wrong</h2>
          <p>The error has been reported to our team.</p>
          <button onClick={retry}>Try Again</button>
          <button onClick={() => Sentry.showReportDialog()}>
            Report Feedback
          </button>
        </div>
      )}
    >
      {children}
    </TryErrorBoundary>
  );
}
```

### Custom Error Service

```tsx
// Custom error monitoring service
class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;

  static getInstance() {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  reportError(error: Error | TryError, context?: any) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    };

    if (isTryError(error)) {
      Object.assign(errorReport, {
        type: error.type,
        source: error.source,
        tryErrorContext: error.context,
      });
    }

    // Send to monitoring service
    fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorReport),
    });
  }
}

// Usage
function MonitoredErrorBoundary({ children }: { children: ReactNode }) {
  const errorService = ErrorMonitoringService.getInstance();

  return (
    <TryErrorBoundary
      onError={(error, errorInfo) => {
        errorService.reportError(error, {
          componentStack: errorInfo?.componentStack,
          timestamp: Date.now(),
        });
      }}
    >
      {children}
    </TryErrorBoundary>
  );
}
```

## Testing Strategies

### Unit Testing

```tsx
// Testing error boundaries
import { render, screen, fireEvent } from "@testing-library/react";
import { TryErrorBoundary } from "try-error-react";

describe("TryErrorBoundary", () => {
  const ThrowError = ({ error }: { error?: Error }) => {
    if (error) throw error;
    return <div>No error</div>;
  };

  it("should catch and display errors", () => {
    const error = new Error("Test error");

    render(
      <TryErrorBoundary>
        <ThrowError error={error} />
      </TryErrorBoundary>
    );

    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(screen.getByText("⚠️ Operation Failed")).toBeInTheDocument();
  });

  it("should handle retry functionality", () => {
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error("Retry test");
      }
      return <div>Success</div>;
    };

    render(
      <TryErrorBoundary>
        <TestComponent />
      </TryErrorBoundary>
    );

    expect(screen.getByText("Retry test")).toBeInTheDocument();

    // Simulate fix
    shouldThrow = false;
    fireEvent.click(screen.getByText("Try Again"));

    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("should call onError callback", () => {
    const onError = jest.fn();
    const error = new Error("Callback test");

    render(
      <TryErrorBoundary onError={onError}>
        <ThrowError error={error} />
      </TryErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ReactError",
        message: "Callback test",
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });
});
```

### Integration Testing

```tsx
// Integration tests with async errors
describe("TryErrorBoundary async integration", () => {
  it("should catch unhandled promise rejections", async () => {
    const AsyncComponent = () => {
      React.useEffect(() => {
        // Simulate unhandled promise rejection
        Promise.reject(new Error("Async error"));
      }, []);

      return <div>Async component</div>;
    };

    render(
      <TryErrorBoundary catchAsyncErrors={true}>
        <AsyncComponent />
      </TryErrorBoundary>
    );

    // Wait for async error to be caught
    await waitFor(() => {
      expect(screen.getByText("Async error")).toBeInTheDocument();
    });
  });

  it("should handle event handler errors", () => {
    const onError = jest.fn();

    const EventComponent = () => {
      const handleClick = () => {
        throw new Error("Event handler error");
      };

      return <button onClick={handleClick}>Click me</button>;
    };

    render(
      <TryErrorBoundary catchEventHandlerErrors={true} onError={onError}>
        <EventComponent />
      </TryErrorBoundary>
    );

    // Simulate event handler error
    fireEvent.click(screen.getByText("Click me"));

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Event handler error",
      }),
      null
    );
  });
});
```

### End-to-End Testing

```tsx
// E2E testing with error boundaries
describe("Error boundary E2E", () => {
  it("should recover from network errors", async () => {
    // Mock network failure then success
    const mockFetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ ok: true, json: () => ({ data: "success" }) });

    global.fetch = mockFetch;

    const NetworkComponent = () => {
      const [data, setData] = useState(null);

      useEffect(() => {
        fetch("/api/data")
          .then((res) => res.json())
          .then(setData)
          .catch((err) => {
            throw new Error(`Network failed: ${err.message}`);
          });
      }, []);

      return <div>{data ? `Data: ${data.data}` : "Loading..."}</div>;
    };

    render(
      <TryErrorBoundary retryStrategy={{ maxRetries: 3, delay: 100 }}>
        <NetworkComponent />
      </TryErrorBoundary>
    );

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Network failed/)).toBeInTheDocument();
    });

    // Retry should succeed
    fireEvent.click(screen.getByText("Try Again"));

    await waitFor(() => {
      expect(screen.getByText("Data: success")).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

## Performance Optimization

### Lazy Loading Error Boundaries

```tsx
// Lazy-loaded error boundaries
const LazyErrorBoundary = React.lazy(() => import("./ErrorBoundary"));

function OptimizedApp() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LazyErrorBoundary>
        <MainApp />
      </LazyErrorBoundary>
    </React.Suspense>
  );
}
```

### Memoized Error Components

```tsx
// Memoized error fallback
const MemoizedErrorFallback = React.memo(
  ({
    error,
    errorInfo,
    retry,
  }: {
    error: Error | TryError;
    errorInfo: ErrorInfo | null;
    retry: () => void;
  }) => (
    <div className="error-fallback">
      <h2>Error: {error.message}</h2>
      <button onClick={retry}>Retry</button>
    </div>
  )
);

function OptimizedErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <TryErrorBoundary fallback={MemoizedErrorFallback}>
      {children}
    </TryErrorBoundary>
  );
}
```

## Common Pitfalls

### 1. Event Handler Errors

```tsx
// BAD: Error boundaries don't catch event handler errors by default
function BadExample() {
  const handleClick = () => {
    throw new Error("This won't be caught!");
  };

  return (
    <TryErrorBoundary>
      <button onClick={handleClick}>Click me</button>
    </TryErrorBoundary>
  );
}

// GOOD: Use catchEventHandlerErrors or manual error handling
function GoodExample() {
  const throwError = useErrorBoundaryTrigger();

  const handleClick = () => {
    try {
      riskyOperation();
    } catch (error) {
      throwError(error);
    }
  };

  return (
    <TryErrorBoundary catchEventHandlerErrors={true}>
      <button onClick={handleClick}>Click me</button>
    </TryErrorBoundary>
  );
}
```

### 2. Async Error Handling

```tsx
// BAD: Async errors aren't caught without special handling
function BadAsyncExample() {
  useEffect(() => {
    fetch("/api/data")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error); // Won't be caught!
        }
      });
  }, []);

  return <div>Component</div>;
}

// GOOD: Use catchAsyncErrors or proper error handling
function GoodAsyncExample() {
  const throwAsyncError = useAsyncError();

  useEffect(() => {
    fetch("/api/data")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          throwAsyncError(new Error(data.error));
        }
      })
      .catch((error) => {
        throwAsyncError(error);
      });
  }, []);

  return <div>Component</div>;
}
```

### 3. Retry Logic Issues

```tsx
// BAD: Retry without fixing underlying issue
function BadRetryExample() {
  const [failCount, setFailCount] = useState(0);

  useEffect(() => {
    // This will always fail
    throw new Error("Always fails");
  }, [failCount]);

  return (
    <TryErrorBoundary
      fallback={(error, errorInfo, retry) => (
        <button onClick={retry}>Retry</button>
      )}
    >
      <div>Content</div>
    </TryErrorBoundary>
  );
}

// GOOD: Implement proper retry logic
function GoodRetryExample() {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <TryErrorBoundary
      key={retryKey} // Force remount on retry
      fallback={(error, errorInfo, retry) => (
        <button
          onClick={() => {
            setRetryKey((prev) => prev + 1);
            retry();
          }}
        >
          Retry
        </button>
      )}
    >
      <div>Content</div>
    </TryErrorBoundary>
  );
}
```

## Migration Guide

### From React ErrorBoundary

```tsx
// Before: Basic React ErrorBoundary
class OldErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// After: TryErrorBoundary
function NewErrorBoundary({ children }) {
  return (
    <TryErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Error caught:", error, errorInfo);
      }}
      fallback={(error, errorInfo, retry) => (
        <div>
          <h1>Something went wrong.</h1>
          <button onClick={retry}>Try Again</button>
        </div>
      )}
    >
      {children}
    </TryErrorBoundary>
  );
}
```

## See Also

- [useTry() Hook](./useTry-deep-dive.md)
- [useErrorRecovery() Hook](./useErrorRecovery-deep-dive.md)
- [createError() Function](./create-error-deep-dive.md)
- [fromThrown() Function](./fromThrown-deep-dive.md)
- [React Error Boundary Patterns](./react-error-boundary-patterns.md)
- [Error Monitoring Integration](./error-monitoring-integration.md)
- [Testing Error Boundaries](./testing-error-boundaries.md)
- [Error Recovery Strategies](./error-recovery-strategies.md)
