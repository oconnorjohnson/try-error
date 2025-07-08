---
id: trySync-deep-dive
title: trySync() - Complete Implementation Guide
tags: [api, core, sync, error-handling, performance]
related: [tryAsync, isTryError, wrapError, fromThrown, createError]
module: sync
complexity: intermediate
performance_impact: low
stability: stable
---

# trySync() - Complete Implementation Guide

## Quick Reference

Wraps synchronous operations that might throw, returning a discriminated union (`TryResult`) that contains either the successful result or a structured error object. This is the primary entry point for converting exception-based error handling to functional error handling.

## Signature

```typescript
function trySync<T>(
  fn: () => T,
  options?: TrySyncOptions
): TryResult<T, TryError>;

interface TrySyncOptions {
  errorType?: string; // Custom error type override
  context?: Record<string, unknown>; // Runtime context injection
  message?: string; // Custom error message
}

// Return type is a discriminated union
type TryResult<T, E> = T | E; // Where E extends TryError
```

## Purpose

- **Exception to Result conversion**: Transforms throwing functions into functions that return results
- **Type safety**: Provides compile-time guarantees about error handling
- **Context injection**: Allows runtime context to be attached to errors
- **Performance**: Zero-overhead on success path, minimal overhead on error path
- **Consistency**: Standardizes error handling across the codebase

## Implementation Details

### Algorithm Flow

```
1. Options validation → 1-2ns
2. Function execution → Variable (user function time)
3. Success path → Return value directly (0ns overhead)
4. Error path → Error transformation (20-100ns)
   a. Custom error type check
   b. Context merging
   c. Stack trace preservation
   d. TryError creation via createTryError()
5. Return TryResult → 0ns
```

### Performance Characteristics

- **Time Complexity**: O(1) + O(user function)
- **Space Complexity**: O(1) on success, O(context size) on error
- **Success Path Overhead**: **0ns** (direct return)
- **Error Path Overhead**: 20-100ns depending on configuration

### Memory Usage

```typescript
// Success case: No additional memory allocation
const result = trySync(() => 42); // result === 42, no wrapper object

// Error case: TryError object allocation
const result = trySync(() => {
  throw new Error("fail");
});
// result = { type: "Error", message: "fail", source: "...", ... }
// Memory: ~450 bytes (standard) or ~120 bytes (minimal mode)
```

### Internal Dependencies

```typescript
// Direct dependencies
-createTryError(error, options) - // Error creation with context
  fromThrown(error, context) - // Automatic error type detection
  wrapError(type, error, msg, ctx) - // Custom error type wrapping
  // Indirect dependencies (via createTryError)
  createError() - // Core error creation
  getCachedConfig() - // Configuration access
  getSourceLocation() - // Stack trace parsing
  ErrorPool.acquire(); // Object pooling (if enabled)
```

## Runtime Context Injection

### Basic Context Usage

```typescript
// Static context at call site
const result = trySync(() => JSON.parse(userInput), {
  context: {
    operation: "user-input-parsing",
    inputLength: userInput.length,
    timestamp: Date.now(),
  },
});

// Dynamic context with runtime values
function processUserData(userId: string, data: unknown) {
  return trySync(() => validateUserData(data), {
    context: {
      userId,
      dataType: typeof data,
      validation: "strict",
      sessionId: getCurrentSessionId(),
    },
  });
}
```

### Context Inheritance Pattern

```typescript
class DataProcessor {
  private baseContext: Record<string, unknown>;

  constructor(processorId: string) {
    this.baseContext = {
      processorId,
      version: "1.0.0",
      startTime: Date.now(),
    };
  }

  process(data: unknown, operation: string) {
    return trySync(() => this.performOperation(data, operation), {
      context: {
        ...this.baseContext,
        operation,
        dataSize: JSON.stringify(data).length,
        timestamp: Date.now(),
      },
    });
  }
}
```

### Request-Scoped Context

```typescript
// Express middleware pattern
function errorContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Monkey-patch trySync for this request
  const originalTrySync = trySync;

  (req as any).trySync = function <T>(fn: () => T, options?: TrySyncOptions) {
    return originalTrySync(fn, {
      ...options,
      context: {
        ...options?.context,
        requestId: req.id,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
        userAgent: req.get("user-agent"),
      },
    });
  };

  next();
}
```

## Usage Examples

### Basic Error Handling

```typescript
// Simple operation that might fail
const result = trySync(() => JSON.parse(jsonString));

if (isTryError(result)) {
  console.error(`Parse failed: ${result.message}`);
  console.error(`Error type: ${result.type}`);
  console.error(`Source: ${result.source}`);
} else {
  console.log(`Parsed successfully:`, result);
}
```

### Custom Error Types

```typescript
// Override automatic error type detection
const result = trySync(() => processPayment(amount), {
  errorType: "PaymentError",
  message: "Payment processing failed",
  context: {
    amount,
    currency: "USD",
    paymentMethod: "credit_card",
  },
});

// Result will have type "PaymentError" regardless of what was thrown
```

### File Operations with Context

```typescript
function readConfigFile(filePath: string) {
  return trySync(
    () => {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    },
    {
      context: {
        filePath,
        operation: "config-read",
        fileSize: fs.statSync(filePath).size,
        lastModified: fs.statSync(filePath).mtime,
      },
    }
  );
}

// Usage
const config = readConfigFile("./config.json");
if (isTryError(config)) {
  console.error(`Config load failed: ${config.message}`);
  console.error(`File: ${config.context?.filePath}`);
  console.error(`Size: ${config.context?.fileSize} bytes`);
}
```

### Form Validation Pattern

```typescript
interface FormData {
  email: string;
  password: string;
  age: number;
}

function validateForm(data: FormData) {
  // Validate email
  const emailResult = trySync(() => validateEmail(data.email), {
    errorType: "ValidationError",
    context: { field: "email", value: data.email },
  });

  if (isTryError(emailResult)) {
    return emailResult;
  }

  // Validate password
  const passwordResult = trySync(() => validatePassword(data.password), {
    errorType: "ValidationError",
    context: { field: "password", length: data.password.length },
  });

  if (isTryError(passwordResult)) {
    return passwordResult;
  }

  // Validate age
  const ageResult = trySync(() => validateAge(data.age), {
    errorType: "ValidationError",
    context: { field: "age", value: data.age },
  });

  if (isTryError(ageResult)) {
    return ageResult;
  }

  return { email: emailResult, password: passwordResult, age: ageResult };
}
```

## Advanced Patterns

### Retry with trySync

```typescript
function withRetry<T>(
  fn: () => T,
  maxAttempts: number = 3,
  delayMs: number = 1000
): TryResult<T, TryError> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = trySync(fn, {
      context: { attempt, maxAttempts },
    });

    if (!isTryError(result)) {
      return result;
    }

    // Don't wait on final attempt
    if (attempt < maxAttempts) {
      // Synchronous delay (not recommended for production)
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
    }
  }

  return createError({
    type: "MaxRetriesExceeded",
    message: `Operation failed after ${maxAttempts} attempts`,
    context: { maxAttempts },
  });
}
```

### Pipeline Processing

```typescript
function processData(rawData: unknown) {
  // Stage 1: Parse
  const parseResult = trySync(() => JSON.parse(rawData as string), {
    context: { stage: "parse", dataType: typeof rawData },
  });

  if (isTryError(parseResult)) {
    return parseResult;
  }

  // Stage 2: Validate
  const validateResult = trySync(() => validateSchema(parseResult), {
    context: { stage: "validate", recordCount: parseResult.length },
  });

  if (isTryError(validateResult)) {
    return validateResult;
  }

  // Stage 3: Transform
  const transformResult = trySync(() => transformData(validateResult), {
    context: { stage: "transform", inputSize: validateResult.length },
  });

  return transformResult;
}
```

### Conditional Error Handling

```typescript
function processWithFallback<T>(
  primary: () => T,
  fallback: () => T,
  shouldFallback: (error: TryError) => boolean
): TryResult<T, TryError> {
  const primaryResult = trySync(primary, {
    context: { strategy: "primary" },
  });

  if (isTryError(primaryResult)) {
    if (shouldFallback(primaryResult)) {
      return trySync(fallback, {
        context: {
          strategy: "fallback",
          primaryError: primaryResult.type,
          reason: "primary_failed",
        },
      });
    }
    return primaryResult;
  }

  return primaryResult;
}

// Usage
const result = processWithFallback(
  () => loadFromCache(),
  () => loadFromDatabase(),
  (error) => error.type === "CacheError"
);
```

## Performance Optimization

### Success Path - Zero Overhead

```typescript
// This has ZERO overhead when successful
const result = trySync(() => 42);
// result === 42 (not wrapped in object)

// No performance difference between:
const direct = computeValue();
const wrapped = trySync(() => computeValue());
// Both execute computeValue() with identical performance
```

### Error Path - Minimal Overhead

```typescript
// Configure for minimal error overhead
configure({
  minimalErrors: true, // Skip stack traces, source location
  skipContext: true, // Skip context merging
  skipTimestamp: true, // Skip timestamp generation
});

// This will have ~20ns overhead on errors instead of ~100ns
const result = trySync(() => {
  throw new Error("fail");
});
```

### Hot Path Optimization

```typescript
// For hot paths, avoid context allocation
function hotPathOperation(data: unknown) {
  // Don't do this in hot paths:
  // return trySync(() => process(data), {
  //   context: {
  //     timestamp: Date.now(),
  //     dataSize: JSON.stringify(data).length
  //   }
  // });

  // Do this instead:
  return trySync(() => process(data));
}

// Add context only when error occurs
function hotPathWithLazyContext(data: unknown) {
  const result = trySync(() => process(data));

  if (isTryError(result)) {
    // Add context after error for debugging
    return {
      ...result,
      context: {
        ...result.context,
        timestamp: Date.now(),
        dataSize: JSON.stringify(data).length,
      },
    };
  }

  return result;
}
```

## Common Patterns

### Result Chaining

```typescript
function chainOperations(input: string) {
  return trySync(() => {
    const parsed = trySync(() => JSON.parse(input));
    if (isTryError(parsed)) throw parsed;

    const validated = trySync(() => validateData(parsed));
    if (isTryError(validated)) throw validated;

    const transformed = trySync(() => transformData(validated));
    if (isTryError(transformed)) throw transformed;

    return transformed;
  });
}
```

### Multiple Operations

```typescript
function processMultiple(items: unknown[]) {
  const results: Array<TryResult<ProcessedItem, TryError>> = [];

  for (const [index, item] of items.entries()) {
    const result = trySync(() => processItem(item), {
      context: { index, totalItems: items.length },
    });

    results.push(result);
  }

  return results;
}
```

### Error Aggregation

```typescript
function aggregateErrors<T>(
  operations: Array<() => T>
): TryResult<T[], TryError> {
  const results: T[] = [];
  const errors: TryError[] = [];

  for (const [index, operation] of operations.entries()) {
    const result = trySync(operation, {
      context: { operationIndex: index },
    });

    if (isTryError(result)) {
      errors.push(result);
    } else {
      results.push(result);
    }
  }

  if (errors.length > 0) {
    return createError({
      type: "MultipleErrors",
      message: `${errors.length} operations failed`,
      context: {
        errors: errors.map((e) => ({ type: e.type, message: e.message })),
        successCount: results.length,
        totalCount: operations.length,
      },
    });
  }

  return results;
}
```

## Edge Cases and Gotchas

### Function That Returns TryError

```typescript
// Function that returns a TryError as a valid result
function getLastError(): TryError {
  return createError({
    type: "PreviousError",
    message: "This is a valid return value",
  });
}

// This will work correctly - the returned TryError is the success value
const result = trySync(() => getLastError());
// result is the TryError object as the success value
// Use isTryError(result) to check if it's actually an error from trySync
```

### Sync Function That Throws TryError

```typescript
function problematicFunction() {
  throw createError({
    type: "CustomError",
    message: "I'm throwing a TryError",
  });
}

const result = trySync(() => problematicFunction());
// result will be the thrown TryError, properly handled
// The error won't be double-wrapped
```

### Context Mutation

```typescript
const sharedContext = { counter: 0 };

// Context is not deep cloned - mutations affect all references
const result1 = trySync(
  () => {
    throw new Error("fail");
  },
  {
    context: sharedContext,
  }
);

sharedContext.counter++; // This affects result1.context!

// Best practice: pass new objects or freeze context
const result2 = trySync(
  () => {
    throw new Error("fail");
  },
  {
    context: Object.freeze({ ...sharedContext }),
  }
);
```

### Stack Trace Preservation

```typescript
function deepFunction() {
  function level1() {
    function level2() {
      function level3() {
        throw new Error("Deep error");
      }
      level3();
    }
    level2();
  }
  level1();
}

const result = trySync(() => deepFunction());
// The stack trace is preserved and includes the full call chain
// Can be disabled with skipContext: true for performance
```

## Platform-Specific Behavior

### Node.js

```typescript
// Full stack traces with file paths
const result = trySync(() => fs.readFileSync("nonexistent.txt"));
// result.stack includes full file paths and line numbers
// result.source includes actual file:line:column information
```

### Browser

```typescript
// Stack traces may be limited by browser
const result = trySync(() => JSON.parse("invalid"));
// result.stack format varies by browser
// result.source may be limited in production builds
```

### React Native

```typescript
// Metro bundler affects stack traces
const result = trySync(() => processData());
// result.source may show bundle paths instead of source paths
// Consider using source maps for better debugging
```

### Web Workers

```typescript
// Error serialization across worker boundaries
self.onmessage = function (e) {
  const result = trySync(() => processInWorker(e.data));

  // TryError objects can be serialized/deserialized
  if (isTryError(result)) {
    self.postMessage({
      error: serializeTryError(result),
    });
  } else {
    self.postMessage({ success: result });
  }
};
```

## Testing Strategies

### Unit Testing

```typescript
describe("trySync", () => {
  it("should return success value directly", () => {
    const result = trySync(() => 42);
    expect(result).toBe(42);
    expect(isTryError(result)).toBe(false);
  });

  it("should handle thrown errors", () => {
    const result = trySync(() => {
      throw new Error("test");
    });
    expect(isTryError(result)).toBe(true);
    expect(result.message).toBe("test");
  });

  it("should include context in errors", () => {
    const context = { userId: 123, operation: "test" };
    const result = trySync(
      () => {
        throw new Error("fail");
      },
      { context }
    );

    expect(isTryError(result)).toBe(true);
    expect(result.context).toEqual(context);
  });
});
```

### Integration Testing

```typescript
describe("trySync integration", () => {
  it("should work with real file operations", () => {
    const result = trySync(() => fs.readFileSync("test-file.txt", "utf8"));

    if (isTryError(result)) {
      expect(result.type).toBe("Error");
      expect(result.message).toContain("ENOENT");
    } else {
      expect(typeof result).toBe("string");
    }
  });
});
```

## Common Pitfalls

### 1. Forgetting to Check Results

```typescript
// BAD: Not checking if result is an error
const result = trySync(() => JSON.parse(input));
console.log(result.data); // Might fail if result is TryError

// GOOD: Always check with isTryError
const result = trySync(() => JSON.parse(input));
if (isTryError(result)) {
  console.error(result.message);
} else {
  console.log(result); // Safe to use
}
```

### 2. Async Function in trySync

```typescript
// BAD: Using async function in trySync
const result = trySync(async () => fetch("/api/data"));
// result will be a Promise, not the actual data

// GOOD: Use tryAsync for async operations
const result = await tryAsync(() => fetch("/api/data"));
```

### 3. Performance in Hot Loops

```typescript
// BAD: Creating context objects in hot loops
for (let i = 0; i < 1000000; i++) {
  const result = trySync(() => process(i), {
    context: { iteration: i, timestamp: Date.now() },
  });
}

// GOOD: Minimal context or no context in hot loops
for (let i = 0; i < 1000000; i++) {
  const result = trySync(() => process(i));
}
```

## See Also

- [tryAsync() - Async Error Handling](./tryAsync-deep-dive.md)
- [isTryError() - Type Guards](./isTryError-deep-dive.md)
- [createError() - Error Creation](./create-error-deep-dive.md)
- [wrapError() - Error Wrapping](./wrapError-deep-dive.md)
- [fromThrown() - Error Conversion](./fromThrown-deep-dive.md)
- [Configuration Guide](./configure-deep-dive.md)
- [Performance Optimization](./performance-optimization.md)
- [Error Handling Patterns](./error-patterns.md)
