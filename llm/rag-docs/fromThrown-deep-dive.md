---
id: fromThrown-deep-dive
title: fromThrown() - Complete Implementation Guide
tags: [api, core, auto-detection, type-classification, catch-blocks]
related: [wrapError, createError, trySync, tryAsync, Error]
module: errors
complexity: beginner
performance_impact: low
stability: stable
---

# fromThrown() - Complete Implementation Guide

## Quick Reference

Automatically detects and wraps any thrown value into a structured TryError with intelligent type classification. Perfect for catch blocks where you don't know the exact error type but want structured error handling.

## Signature

```typescript
function fromThrown(
  cause: unknown,
  context?: Record<string, unknown>
): TryError;

// Parameters
cause: unknown                        // Any thrown value
context?: Record<string, unknown>     // Optional runtime context

// Return type
TryError                             // Always returns a TryError with detected type
```

## Purpose

- **Automatic type detection**: Classify thrown values based on their type
- **Catch block integration**: Perfect for generic catch blocks
- **Type safety**: Convert any thrown value to structured TryError
- **Smart classification**: Distinguish between Error types, strings, and unknown values
- **Zero configuration**: Works without any setup or type annotations
- **Consistent interface**: Always returns a TryError regardless of input type

## Implementation Details

### Algorithm Flow

```
1. Type detection → 5-25ns
   a. Check instanceof TypeError
   b. Check instanceof ReferenceError
   c. Check instanceof SyntaxError
   d. Check instanceof Error (generic)
   e. Check typeof === "string"
   f. Default to unknown
2. wrapError() delegation → 25-115ns
   a. Pass detected type
   b. Include original cause
   c. Extract or generate message
   d. Add optional context
3. TryError creation → Variable (via wrapError)
4. Return structured error → 0ns
```

### Performance Characteristics

- **Time Complexity**: O(1) - constant time type checks
- **Space Complexity**: O(1) + O(context size)
- **Execution Time**: 30-140ns total
- **Memory Usage**: Same as wrapError() (standard mode)
- **Overhead**: Minimal - just type detection overhead

### Type Detection Logic

```typescript
function classifyError(cause: unknown): string {
  // 1. Specific Error types (most common first)
  if (cause instanceof TypeError) return "TypeError";
  if (cause instanceof ReferenceError) return "ReferenceError";
  if (cause instanceof SyntaxError) return "SyntaxError";

  // 2. Generic Error (catch-all for Error instances)
  if (cause instanceof Error) return "Error";

  // 3. String errors (common in legacy code)
  if (typeof cause === "string") return "StringError";

  // 4. Unknown types (objects, numbers, etc.)
  return "UnknownError";
}
```

### Internal Dependencies

```typescript
// Direct dependencies
- wrapError()                       // Error wrapping logic
- instanceof checks                 // Type detection
- typeof checks                     // Primitive type detection

// Indirect dependencies (via wrapError)
- createError()                     // Core error creation
- getCachedConfig()                 // Configuration access
- getSourceLocation()               // Stack trace parsing
- ErrorPool.acquire()               // Object pooling (if enabled)
```

## Basic Usage Examples

### Simple Catch Block Integration

```typescript
// Basic usage in try-catch
function parseJsonSafely(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fromThrown(error); // Automatically detects SyntaxError
  }
}

// Usage example
const result = parseJsonSafely('{"invalid": json}');
if (isTryError(result)) {
  console.log(result.type); // "SyntaxError"
  console.log(result.message); // "Unexpected token j in JSON at position 12"
  console.log(result.cause); // Original SyntaxError object
}
```

### Generic Error Handling

```typescript
// Handle any thrown value
function safeOperation(operation: () => any) {
  try {
    return operation();
  } catch (error) {
    return fromThrown(error);
  }
}

// Examples of different error types
function throwTypeError() {
  const obj: any = null;
  return obj.someProperty; // TypeError
}

function throwReferenceError() {
  return undefinedVariable; // ReferenceError
}

function throwSyntaxError() {
  return eval("invalid syntax"); // SyntaxError
}

function throwStringError() {
  throw "String error message"; // String
}

function throwObjectError() {
  throw { code: 500, message: "Server error" }; // Object
}

// All handle correctly
const typeError = safeOperation(throwTypeError);
console.log(typeError.type); // "TypeError"

const refError = safeOperation(throwReferenceError);
console.log(refError.type); // "ReferenceError"

const syntaxError = safeOperation(throwSyntaxError);
console.log(syntaxError.type); // "SyntaxError"

const stringError = safeOperation(throwStringError);
console.log(stringError.type); // "StringError"

const objectError = safeOperation(throwObjectError);
console.log(objectError.type); // "UnknownError"
```

### Adding Context

```typescript
// Add operational context
function processUserAction(userId: string, action: () => any) {
  try {
    return action();
  } catch (error) {
    return fromThrown(error, {
      userId,
      action: action.name,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    });
  }
}

// Usage with context
const result = processUserAction("user123", () => {
  throw new Error("Operation failed");
});

if (isTryError(result)) {
  console.log(result.type); // "Error"
  console.log(result.context); // { userId: "user123", action: "anonymous", ... }
}
```

## Advanced Usage Patterns

### Error Type Discrimination

```typescript
// Type-safe error handling with discrimination
function handleDatabaseOperation(operation: () => any) {
  try {
    return operation();
  } catch (error) {
    const wrappedError = fromThrown(error, {
      operation: operation.name,
      timestamp: Date.now(),
    });

    // Type-safe handling based on detected type
    switch (wrappedError.type) {
      case "TypeError":
        console.log("Type-related error:", wrappedError.message);
        break;
      case "ReferenceError":
        console.log("Variable not found:", wrappedError.message);
        break;
      case "SyntaxError":
        console.log("Syntax error:", wrappedError.message);
        break;
      case "Error":
        console.log("Generic error:", wrappedError.message);
        break;
      case "StringError":
        console.log("String error:", wrappedError.message);
        break;
      case "UnknownError":
        console.log("Unknown error type:", wrappedError.message);
        break;
      default:
        // TypeScript exhaustiveness check
        const _exhaustive: never = wrappedError.type;
        console.log("Unexpected error type:", _exhaustive);
    }

    return wrappedError;
  }
}
```

### Async Error Handling

```typescript
// Handle async errors with automatic detection
async function safeAsyncOperation<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    return fromThrown(error, {
      async: true,
      timestamp: Date.now(),
    });
  }
}

// Usage examples
async function fetchUserData(userId: string) {
  // Network errors
  const networkResult = await safeAsyncOperation(async () => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  });

  if (isTryError(networkResult)) {
    console.log(networkResult.type); // "Error"
    console.log(networkResult.context.async); // true
  }

  // JSON parsing errors
  const parseResult = await safeAsyncOperation(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return JSON.parse(await response.text());
  });

  if (isTryError(parseResult)) {
    console.log(parseResult.type); // "SyntaxError" (if JSON is invalid)
  }
}
```

### Error Aggregation

```typescript
// Collect multiple errors with automatic type detection
function processMultipleOperations(operations: (() => any)[]) {
  const results: any[] = [];
  const errors: TryError[] = [];

  for (const [index, operation] of operations.entries()) {
    try {
      results.push(operation());
    } catch (error) {
      errors.push(
        fromThrown(error, {
          operationIndex: index,
          operationName: operation.name,
        })
      );
    }
  }

  return {
    results,
    errors,
    errorsByType: groupErrorsByType(errors),
  };
}

function groupErrorsByType(errors: TryError[]): Record<string, TryError[]> {
  return errors.reduce((acc, error) => {
    if (!acc[error.type]) acc[error.type] = [];
    acc[error.type].push(error);
    return acc;
  }, {} as Record<string, TryError[]>);
}

// Usage
const operations = [
  () => JSON.parse('{"valid": true}'),
  () => JSON.parse("invalid json"),
  () => {
    throw new TypeError("Type error");
  },
  () => {
    throw "String error";
  },
  () => {
    throw { code: 500 };
  },
];

const { results, errors, errorsByType } = processMultipleOperations(operations);

console.log(errorsByType);
// {
//   "SyntaxError": [TryError],
//   "TypeError": [TryError],
//   "StringError": [TryError],
//   "UnknownError": [TryError]
// }
```

### Framework Integration Patterns

```typescript
// Express.js error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const error = fromThrown(err, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    timestamp: Date.now(),
  });

  // Type-specific handling
  const statusCode = getStatusCodeFromErrorType(error.type);

  res.status(statusCode).json({
    error: error.message,
    type: error.type,
    requestId: req.id,
  });
});

function getStatusCodeFromErrorType(type: string): number {
  switch (type) {
    case "TypeError":
    case "ReferenceError":
    case "SyntaxError":
      return 400; // Bad Request
    case "Error":
      return 500; // Internal Server Error
    case "StringError":
      return 422; // Unprocessable Entity
    case "UnknownError":
      return 500; // Internal Server Error
    default:
      return 500;
  }
}

// React error boundary
class ErrorBoundary extends React.Component<any, { error: TryError | null }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): { error: TryError } {
    return {
      error: fromThrown(error, {
        boundary: "ErrorBoundary",
        timestamp: Date.now(),
      }),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const wrappedError = fromThrown(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    });

    // Log to error service
    logErrorToService(wrappedError);
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <p>Type: {this.state.error.type}</p>
            <p>Message: {this.state.error.message}</p>
            <p>Context: {JSON.stringify(this.state.error.context, null, 2)}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Testing Integration

```typescript
// Use in test helpers
function expectError(operation: () => any, expectedType: string) {
  try {
    operation();
    throw new Error("Expected operation to throw");
  } catch (error) {
    const wrappedError = fromThrown(error);
    expect(wrappedError.type).toBe(expectedType);
    return wrappedError;
  }
}

// Test examples
describe("Error handling", () => {
  it("should handle TypeError", () => {
    const error = expectError(() => {
      const obj: any = null;
      return obj.someProperty;
    }, "TypeError");

    expect(error.message).toContain("Cannot read property");
  });

  it("should handle ReferenceError", () => {
    const error = expectError(() => {
      return (window as any).undefinedVariable;
    }, "ReferenceError");

    expect(error.message).toContain("not defined");
  });

  it("should handle SyntaxError", () => {
    const error = expectError(() => {
      return eval("invalid syntax");
    }, "SyntaxError");

    expect(error.message).toContain("Unexpected");
  });

  it("should handle string errors", () => {
    const error = expectError(() => {
      throw "String error";
    }, "StringError");

    expect(error.message).toBe("String error");
  });
});
```

## Error Type Classification

### JavaScript Built-in Error Types

```typescript
// Complete error type mapping
const errorTypeMap = {
  TypeError: "TypeError",
  ReferenceError: "ReferenceError",
  SyntaxError: "SyntaxError",
  RangeError: "RangeError", // Not directly handled
  URIError: "URIError", // Not directly handled
  EvalError: "EvalError", // Not directly handled
  Error: "Error", // Generic fallback
} as const;

// Extended error handling for more types
function fromThrownExtended(
  cause: unknown,
  context?: Record<string, unknown>
): TryError {
  // Standard fromThrown() handles the most common cases
  if (cause instanceof TypeError)
    return wrapError("TypeError", cause, undefined, context);
  if (cause instanceof ReferenceError)
    return wrapError("ReferenceError", cause, undefined, context);
  if (cause instanceof SyntaxError)
    return wrapError("SyntaxError", cause, undefined, context);

  // Additional error types
  if (cause instanceof RangeError)
    return wrapError("RangeError", cause, undefined, context);
  if (cause instanceof URIError)
    return wrapError("URIError", cause, undefined, context);
  if (cause instanceof EvalError)
    return wrapError("EvalError", cause, undefined, context);

  // Generic Error and fallbacks
  if (cause instanceof Error)
    return wrapError("Error", cause, undefined, context);
  if (typeof cause === "string")
    return wrapError("StringError", cause, cause, context);

  return wrapError("UnknownError", cause, "An unknown error occurred", context);
}
```

### Custom Error Types

```typescript
// Handle custom error classes
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class NetworkError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "NetworkError";
  }
}

// Custom detection logic
function fromThrownWithCustomTypes(
  cause: unknown,
  context?: Record<string, unknown>
): TryError {
  // Custom error types
  if (cause instanceof ValidationError) {
    return wrapError("ValidationError", cause, undefined, {
      ...context,
      field: cause.field,
    });
  }

  if (cause instanceof NetworkError) {
    return wrapError("NetworkError", cause, undefined, {
      ...context,
      statusCode: cause.statusCode,
    });
  }

  // Fall back to standard detection
  return fromThrown(cause, context);
}
```

## Performance Optimization

### Fast Path Detection

```typescript
// Optimized version for hot paths
function fromThrownFast(cause: unknown): TryError {
  // Skip context for performance
  if (cause instanceof Error) {
    // Fast path for most common case
    return wrapError("Error", cause);
  }

  if (typeof cause === "string") {
    // Fast path for string errors
    return wrapError("StringError", cause, cause);
  }

  // Fallback to full detection
  return fromThrown(cause);
}
```

### Cached Type Detection

```typescript
// Cache constructor checks for performance
const constructorCache = new WeakMap<Function, string>();

function fromThrownCached(
  cause: unknown,
  context?: Record<string, unknown>
): TryError {
  if (cause && typeof cause === "object" && "constructor" in cause) {
    const constructor = cause.constructor;
    let errorType = constructorCache.get(constructor);

    if (!errorType) {
      // Determine type and cache it
      if (constructor === TypeError) errorType = "TypeError";
      else if (constructor === ReferenceError) errorType = "ReferenceError";
      else if (constructor === SyntaxError) errorType = "SyntaxError";
      else if (constructor === Error) errorType = "Error";
      else errorType = "UnknownError";

      constructorCache.set(constructor, errorType);
    }

    return wrapError(errorType, cause, undefined, context);
  }

  return fromThrown(cause, context);
}
```

## Testing Strategies

### Unit Testing

```typescript
describe("fromThrown", () => {
  it("should detect TypeError", () => {
    const typeError = new TypeError("Cannot read property");
    const result = fromThrown(typeError);

    expect(result.type).toBe("TypeError");
    expect(result.message).toBe("Cannot read property");
    expect(result.cause).toBe(typeError);
  });

  it("should detect ReferenceError", () => {
    const refError = new ReferenceError("Variable not defined");
    const result = fromThrown(refError);

    expect(result.type).toBe("ReferenceError");
    expect(result.message).toBe("Variable not defined");
    expect(result.cause).toBe(refError);
  });

  it("should detect SyntaxError", () => {
    const syntaxError = new SyntaxError("Unexpected token");
    const result = fromThrown(syntaxError);

    expect(result.type).toBe("SyntaxError");
    expect(result.message).toBe("Unexpected token");
    expect(result.cause).toBe(syntaxError);
  });

  it("should handle generic Error", () => {
    const genericError = new Error("Generic error");
    const result = fromThrown(genericError);

    expect(result.type).toBe("Error");
    expect(result.message).toBe("Generic error");
    expect(result.cause).toBe(genericError);
  });

  it("should handle string errors", () => {
    const stringError = "String error message";
    const result = fromThrown(stringError);

    expect(result.type).toBe("StringError");
    expect(result.message).toBe("String error message");
    expect(result.cause).toBe(stringError);
  });

  it("should handle unknown types", () => {
    const unknownError = { weird: "object" };
    const result = fromThrown(unknownError);

    expect(result.type).toBe("UnknownError");
    expect(result.message).toBe("An unknown error occurred");
    expect(result.cause).toBe(unknownError);
  });

  it("should include context when provided", () => {
    const context = { operation: "test", attempt: 1 };
    const error = new Error("Test error");
    const result = fromThrown(error, context);

    expect(result.context).toEqual(context);
  });
});
```

### Integration Testing

```typescript
describe("fromThrown integration", () => {
  it("should work with real runtime errors", () => {
    const operations = [
      () => JSON.parse("invalid json"),
      () => {
        const obj: any = null;
        return obj.prop;
      },
      () => {
        return undefinedVar;
      },
      () => {
        throw "string error";
      },
      () => {
        throw { code: 500 };
      },
    ];

    const results = operations.map((op) => {
      try {
        return op();
      } catch (error) {
        return fromThrown(error);
      }
    });

    expect(results[0].type).toBe("SyntaxError");
    expect(results[1].type).toBe("TypeError");
    expect(results[2].type).toBe("ReferenceError");
    expect(results[3].type).toBe("StringError");
    expect(results[4].type).toBe("UnknownError");
  });

  it("should work with async operations", async () => {
    const asyncOp = async () => {
      throw new Error("Async error");
    };

    try {
      await asyncOp();
    } catch (error) {
      const result = fromThrown(error);
      expect(result.type).toBe("Error");
      expect(result.message).toBe("Async error");
    }
  });
});
```

### Property-Based Testing

```typescript
import { fc } from "fast-check";

describe("fromThrown property tests", () => {
  it("should always return a TryError", () => {
    fc.assert(
      fc.property(
        fc.anything(),
        fc.option(fc.record(fc.string(), fc.anything())),
        (cause, context) => {
          const result = fromThrown(cause, context);

          expect(isTryError(result)).toBe(true);
          expect(result.cause).toBe(cause);
          expect(typeof result.type).toBe("string");
          expect(typeof result.message).toBe("string");

          if (context) {
            expect(result.context).toEqual(context);
          }
        }
      )
    );
  });

  it("should handle Error instances correctly", () => {
    fc.assert(
      fc.property(fc.string(), (message) => {
        const error = new Error(message);
        const result = fromThrown(error);

        expect(result.type).toBe("Error");
        expect(result.message).toBe(message);
        expect(result.cause).toBe(error);
      })
    );
  });
});
```

## Common Patterns and Best Practices

### Generic Error Handler

```typescript
// Create a reusable error handler
function createErrorHandler<T>(
  operationName: string,
  defaultContext?: Record<string, unknown>
) {
  return (error: unknown): TryError => {
    return fromThrown(error, {
      operation: operationName,
      ...defaultContext,
      timestamp: Date.now(),
    });
  };
}

// Usage
const dbErrorHandler = createErrorHandler("database", {
  component: "UserService",
});
const apiErrorHandler = createErrorHandler("api", { component: "HttpClient" });

function getUserFromDb(id: string) {
  try {
    return database.findUser(id);
  } catch (error) {
    return dbErrorHandler(error);
  }
}

function fetchUserFromApi(id: string) {
  try {
    return httpClient.get(`/users/${id}`);
  } catch (error) {
    return apiErrorHandler(error);
  }
}
```

### Error Monitoring Integration

```typescript
// Integration with error monitoring services
function fromThrownWithMonitoring(
  cause: unknown,
  context?: Record<string, unknown>
): TryError {
  const error = fromThrown(cause, context);

  // Send to monitoring service
  if (shouldReportError(error)) {
    reportToMonitoringService(error);
  }

  return error;
}

function shouldReportError(error: TryError): boolean {
  // Don't report certain error types
  if (error.type === "StringError") return false;
  if (error.type === "UnknownError" && !error.cause) return false;

  return true;
}

function reportToMonitoringService(error: TryError) {
  // Sentry integration
  Sentry.captureException(error.cause, {
    tags: {
      errorType: error.type,
      source: error.source,
    },
    extra: {
      message: error.message,
      context: error.context,
      timestamp: error.timestamp,
    },
  });
}
```

## Common Pitfalls

### 1. Forgetting to Check Return Type

```typescript
// BAD: Not checking if result is an error
function riskyOperation() {
  try {
    return performOperation();
  } catch (error) {
    return fromThrown(error);
  }
}

const result = riskyOperation();
// Using result directly without checking!
console.log(result.data); // May be undefined!

// GOOD: Always check error state
const result = riskyOperation();
if (isTryError(result)) {
  console.log("Error occurred:", result.message);
  return;
}
console.log("Success:", result.data);
```

### 2. Losing Type Information

```typescript
// BAD: Converting specific error types to generic
function badErrorHandling() {
  try {
    return JSON.parse(invalidJson);
  } catch (error) {
    throw new Error("Parsing failed"); // Lost SyntaxError type!
  }
}

// GOOD: Preserve original error type
function goodErrorHandling() {
  try {
    return JSON.parse(invalidJson);
  } catch (error) {
    return fromThrown(error); // Preserves SyntaxError type
  }
}
```

### 3. Not Adding Sufficient Context

```typescript
// BAD: No context about the operation
function parseUserData(data: string) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return fromThrown(error); // No context about what failed
  }
}

// GOOD: Include operation context
function parseUserData(data: string, userId?: string) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return fromThrown(error, {
      operation: "parseUserData",
      userId,
      dataLength: data.length,
      dataPreview: data.slice(0, 100),
    });
  }
}
```

## Migration Guide

### From Traditional Error Handling

```typescript
// Before: Traditional try-catch
function oldWay() {
  try {
    return riskyOperation();
  } catch (error) {
    console.error("Error:", error);
    throw error; // Re-throw
  }
}

// After: Using fromThrown
function newWay() {
  try {
    return riskyOperation();
  } catch (error) {
    const wrappedError = fromThrown(error, {
      operation: "riskyOperation",
    });

    // Handle error locally
    console.error("Error:", wrappedError.message);

    // Return structured error instead of throwing
    return wrappedError;
  }
}
```

### From Manual Error Wrapping

```typescript
// Before: Manual error detection
function oldDetection(error: unknown) {
  if (error instanceof TypeError) {
    return { type: "TypeError", message: error.message };
  }
  if (error instanceof SyntaxError) {
    return { type: "SyntaxError", message: error.message };
  }
  return { type: "UnknownError", message: "Unknown error" };
}

// After: Using fromThrown
function newDetection(error: unknown) {
  return fromThrown(error); // Handles all cases automatically
}
```

## See Also

- [wrapError() Function](./wrapError-deep-dive.md)
- [createError() Function](./create-error-deep-dive.md)
- [isTryError() Type Guard](./isTryError-deep-dive.md)
- [trySync() Function](./trySync-deep-dive.md)
- [tryAsync() Function](./tryAsync-deep-dive.md)
- [Error Type Classification](./error-type-classification.md)
- [Catch Block Patterns](./catch-block-patterns.md)
- [Error Monitoring Integration](./error-monitoring-integration.md)
