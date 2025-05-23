# Error Boundaries Examples

This directory contains examples demonstrating how to integrate try-error with React Error Boundaries for comprehensive error handling.

## Examples

### ErrorBoundaryDemo.tsx

A comprehensive error boundary implementation that demonstrates:

- Enhanced error boundaries that understand try-error types
- Custom fallback UI with detailed error information
- Retry functionality for error recovery
- Different error types (TryError vs regular Error)
- Error logging and reporting integration

**Key Features:**

- Detects and displays try-error specific information
- Shows error context, timestamps, and source information
- Provides retry mechanisms for error recovery
- Demonstrates both default and custom fallback UIs
- Handles both synchronous and asynchronous errors appropriately

## Error Boundary Integration Patterns

### 1. Basic Error Boundary with try-error Support

```tsx
class TryErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isTryError(error)) {
      // Handle try-error with rich context
      console.error("TryError caught:", {
        type: error.type,
        message: error.message,
        context: error.context,
        source: error.source,
        timestamp: error.timestamp,
      });
    } else {
      // Handle regular errors
      console.error("Regular error caught:", error.message);
    }
  }
}
```

### 2. Custom Fallback UI

```tsx
function CustomErrorFallback({ error, retry }) {
  return (
    <div className="error-fallback">
      {isTryError(error) ? (
        <TryErrorDisplay error={error} />
      ) : (
        <RegularErrorDisplay error={error} />
      )}
      <button onClick={retry}>Try Again</button>
    </div>
  );
}
```

### 3. Error Reporting Integration

```tsx
<TryErrorBoundary
  onError={(error, errorInfo) => {
    // Send to error reporting service
    if (isTryError(error)) {
      errorReporter.captureException(error, {
        tags: { errorType: error.type },
        extra: { context: error.context },
      });
    } else {
      errorReporter.captureException(error);
    }
  }}
>
  <App />
</TryErrorBoundary>
```

## Error Types Handled

### TryError (from try-error library)

- **Type**: Specific error type identifier
- **Message**: Human-readable error message
- **Context**: Additional data about the error
- **Source**: Where the error originated
- **Timestamp**: When the error occurred
- **Stack**: Stack trace information

### Regular JavaScript Errors

- **Message**: Error message
- **Stack**: Stack trace
- **Name**: Error constructor name

## Best Practices

### 1. Error Boundary Placement

- Place error boundaries at strategic points in your component tree
- Use multiple boundaries to isolate failures
- Don't wrap every component - find the right granularity

### 2. Fallback UI Design

- Provide meaningful error messages to users
- Include retry mechanisms when appropriate
- Show partial UI when possible (graceful degradation)
- Consider different fallbacks for different error types

### 3. Error Reporting

- Log all errors for debugging and monitoring
- Include relevant context information
- Differentiate between try-error and regular errors
- Set up alerts for critical errors

### 4. Recovery Strategies

- Implement retry mechanisms for transient errors
- Provide alternative data sources or cached data
- Allow users to refresh or navigate away
- Consider automatic recovery for certain error types

## Limitations

### What Error Boundaries DON'T Catch

- Errors in event handlers
- Errors in asynchronous code (setTimeout, promises)
- Errors during server-side rendering
- Errors thrown in the error boundary itself

### Handling Async Errors

For async errors, use try-error patterns directly:

```tsx
const handleAsyncOperation = async () => {
  const result = await tryAsync(async () => {
    return await riskyAsyncOperation();
  });

  if (isTryError(result)) {
    // Handle async error in component state
    setError(result);
  } else {
    setData(result);
  }
};
```

## Integration with Error Reporting Services

### Sentry Integration

```tsx
import * as Sentry from '@sentry/react';

<TryErrorBoundary
  onError={(error, errorInfo) => {
    if (isTryError(error)) {
      Sentry.withScope(scope => {
        scope.setTag('errorType', error.type);
        scope.setContext('tryError', {
          type: error.type,
          source: error.source,
          context: error.context
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  }}
>
```

### Custom Analytics

```tsx
<TryErrorBoundary
  onError={(error, errorInfo) => {
    analytics.track('Error Boundary Triggered', {
      errorType: isTryError(error) ? error.type : 'REGULAR_ERROR',
      errorMessage: error.message,
      componentStack: errorInfo.componentStack
    });
  }}
>
```

## Testing Error Boundaries

### Unit Testing

```tsx
import { render } from "@testing-library/react";
import { createError } from "try-error";

const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw createError("TEST_ERROR", "Test error message");
  }
  return <div>No error</div>;
};

test("error boundary catches try-error", () => {
  const onError = jest.fn();
  render(
    <TryErrorBoundary onError={onError}>
      <ThrowError shouldThrow={true} />
    </TryErrorBoundary>
  );

  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "TEST_ERROR",
      message: "Test error message",
    }),
    expect.any(Object)
  );
});
```

## Performance Considerations

- Error boundaries add minimal overhead
- Fallback UIs should be lightweight
- Avoid complex operations in error handlers
- Consider lazy loading for error reporting libraries
