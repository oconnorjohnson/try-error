---
id: create-error-deep-dive
title: createError() - Complete Implementation Guide
tags: [api, core, error-creation, performance, context-injection]
related:
  [wrap-error, from-thrown, context-management, lazy-evaluation, object-pooling]
module: core
complexity: intermediate
performance_impact: low
stability: stable
---

# createError() - Complete Implementation Guide

## Quick Reference

Creates a TryError with automatic source location detection, configurable performance optimizations, and full support for runtime context injection.

## Signature

```typescript
function createError<T extends string = string>(
  options: CreateErrorOptions<T>
): TryError<T>;

interface CreateErrorOptions<T extends string = string> {
  type: T;
  message: string;
  context?: Record<string, unknown>; // Runtime context injection point
  cause?: unknown;
  source?: string;
  timestamp?: number;
  stackOffset?: number;
  captureStackTrace?: boolean;
}
```

## Purpose

- Primary factory function for creating type-safe error objects
- Provides consistent error structure across the application
- Enables runtime context injection for debugging
- Optimizes performance based on configuration

## Implementation Details

### Algorithm Flow

```
1. Configuration retrieval (cached) → 2-5ns
2. Minimal mode check → 1ns
3. Cache key generation → 5-10ns
4. Cache lookup (LRU) → 5-15ns
5. Error construction → 20-100ns
   a. Object allocation/pooling
   b. Field assignment
   c. Context merging
   d. Source detection (optional)
   e. Stack capture (optional)
6. Cache storage → 5-10ns
7. Event emission → 10-20ns
```

### Performance Characteristics

- **Time Complexity**: O(1) for all operations
- **Space Complexity**: O(n) where n is context object size
- **Memory Allocation**:
  - Minimal mode: ~120 bytes
  - Standard mode: ~450 bytes
  - Full mode with stack: ~1.2KB

### Internal Dependencies

```typescript
// Direct dependencies
-getCachedConfig() - // Configuration retrieval
  getErrorCacheKey() - // Cache key generation
  errorCache.get / set() - // LRU cache operations
  createMinimalError() - // Fast path for minimal mode
  getSourceLocation() - // Stack parsing
  ErrorPool.acquire() - // Object pooling
  emitErrorCreated() - // Event system
  // Indirect dependencies
  isProduction() - // Environment detection
  internString() - // String interning for memory optimization
  createLazyProperty(); // Lazy evaluation setup
```

## Runtime Context Injection

### How Context Works

The `context` parameter accepts any runtime values and is designed for maximum flexibility:

```typescript
// Static context (compile-time known)
const error = createError({
  type: "ValidationError",
  message: "Invalid input",
  context: { field: "email", rule: "format" },
});

// Dynamic context (runtime values)
const error = createError({
  type: "ApiError",
  message: "Request failed",
  context: {
    userId: req.user.id, // From request
    sessionId: req.session.id, // From session
    requestId: crypto.randomUUID(), // Generated
    timestamp: Date.now(), // Current time
    headers: req.headers, // Request headers
    attempt: retryCount, // From closure
  },
});

// Context with computed values
function createUserError(user: User, operation: string) {
  return createError({
    type: "UserError",
    message: `Failed to ${operation} user`,
    context: {
      userId: user.id,
      userName: user.name,
      userRoles: user.roles,
      operation,
      isAdmin: user.roles.includes("admin"),
      accountAge: Date.now() - user.createdAt,
    },
  });
}
```

### Context Injection Points

1. **Direct at creation** - Pass context to createError()
2. **Via middleware** - enrichContextMiddleware adds context
3. **Through wrapping** - wrapWithContext() adds to existing errors
4. **In try functions** - trySync/tryAsync accept context option

### Context Best Practices

```typescript
// DO: Include identifiers for correlation
context: {
  userId: user.id,
  requestId: req.id,
  traceId: span.traceId
}

// DO: Add debugging information
context: {
  input: sanitizedInput,
  validationRules: activeRules,
  configVersion: config.version
}

// DON'T: Include sensitive data
context: {
  password: user.password,        // NO!
  creditCard: payment.cardNumber, // NO!
  apiKey: process.env.SECRET_KEY  // NO!
}

// DON'T: Include huge objects
context: {
  entireDatabase: db,      // NO! Too large
  fullHttpResponse: res,   // NO! Circular references
  largeBuffer: buffer      // NO! Memory waste
}
```

## Usage Examples

### Basic Error Creation

```typescript
// Simple error
const error = createError({
  type: "NotFoundError",
  message: "User not found",
});

// With context
const error = createError({
  type: "ValidationError",
  message: "Email format invalid",
  context: {
    field: "email",
    value: "not-an-email",
    pattern: "^[^@]+@[^@]+$",
  },
});

// With cause (error chaining)
try {
  JSON.parse(invalidJson);
} catch (e) {
  const error = createError({
    type: "ParseError",
    message: "Failed to parse configuration",
    cause: e,
    context: {
      configFile: "./config.json",
      line: getCurrentLine(),
    },
  });
}
```

### Advanced Patterns

#### Request Context Pattern

```typescript
// Middleware that adds request context to all errors
function errorContextMiddleware(req: Request, res: Response, next: Next) {
  const originalCreate = createError;

  // Override createError in request scope
  (global as any).createError = (options) => {
    return originalCreate({
      ...options,
      context: {
        ...options.context,
        requestId: req.id,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
      },
    });
  };

  next();
}
```

#### Lazy Context Pattern

```typescript
// For expensive context computation
const error = createLazyError({
  type: "ProcessingError",
  message: "Failed to process data",
  context: {
    // Immediate values
    dataId: data.id,

    // Lazy computed - only evaluated if accessed
    get memorySnapshot() {
      return process.memoryUsage();
    },
    get stackAnalysis() {
      return analyzeCallStack();
    },
  },
});
```

#### Context Inheritance Pattern

```typescript
class ServiceClient {
  private baseContext: Record<string, unknown>;

  constructor(config: Config) {
    this.baseContext = {
      service: config.serviceName,
      version: config.version,
      environment: config.env,
    };
  }

  createError(
    type: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    return createError({
      type,
      message,
      context: {
        ...this.baseContext, // Inherited context
        ...context, // Specific context
        timestamp: Date.now(), // Always fresh
      },
    });
  }
}
```

## Performance Optimization

### Configuration Impact

```typescript
// Fastest: Minimal mode (~25ns)
configure({ minimalErrors: true });
const error = createError({
  type: "Error",
  message: "Fast error",
}); // No source, no stack, minimal overhead

// Balanced: Standard mode (~150ns)
configure({
  captureStackTrace: false,
  captureSource: true,
});

// Full features (~400ns)
configure({
  captureStackTrace: true,
  captureSource: true,
  skipTimestamp: false,
});
```

### Object Pooling

When enabled, reduces GC pressure:

```typescript
configure({
  performance: {
    errorCreation: {
      objectPooling: true,
      poolSize: 1000,
    },
  },
});

// Errors are recycled from pool
// ~60% memory reduction in high-throughput scenarios
```

### Context Size Impact

```typescript
// Fast: Small context (~10ns overhead)
context: { userId: 123, operation: "read" }

// Slower: Large context (~50ns overhead)
context: {
  ...largeObject,
  nested: { deep: { properties: [...] } }
}

// Use lazy evaluation for large contexts
context: {
  userId: 123,
  get fullData() { return expensiveComputation(); }
}
```

## Common Patterns

### With trySync/tryAsync

```typescript
const result = trySync(() => dangerousOperation(), {
  errorType: "OperationError",
  context: {
    operation: "user-update",
    userId: user.id,
  },
});
```

### With Middleware Pipeline

```typescript
const pipeline = new MiddlewarePipeline()
  .use(
    enrichContextMiddleware(() => ({
      timestamp: Date.now(),
      requestId: getRequestId(),
    }))
  )
  .use(loggingMiddleware());

const wrappedCreate = pipeline.wrap(createError);
```

### With Error Factories

```typescript
const createApiError = createErrorFactory({
  service: "user-api",
  version: "1.0.0",
});

const error = createApiError(
  "ApiError",
  "Failed to fetch user",
  { endpoint: "/users/123" },
  { context: { method: "GET" } }
);
```

## Edge Cases and Gotchas

### Circular References

```typescript
// This will cause issues
const obj = { name: "test" };
obj.self = obj; // Circular reference

// DON'T do this
createError({
  type: "Error",
  message: "Bad context",
  context: { obj }, // Will fail during serialization
});

// DO this instead
createError({
  type: "Error",
  message: "Good context",
  context: {
    objName: obj.name,
    objType: typeof obj,
  },
});
```

### Context Mutation

```typescript
const sharedContext = { count: 0 };

// Context is not cloned - mutations will affect all references
const error1 = createError({
  type: "Error",
  message: "First",
  context: sharedContext,
});

sharedContext.count++; // This affects error1.context!

// Best practice: pass new objects
const error2 = createError({
  type: "Error",
  message: "Second",
  context: { ...sharedContext }, // Shallow clone
});
```

### Performance Cliffs

```typescript
// Avoid creating errors in hot loops
for (let i = 0; i < 1000000; i++) {
  // This creates 1M error objects!
  const error = createError({
    type: "LoopError",
    message: `Iteration ${i}`,
  });
}

// Better: Create once, reuse or pool
const baseError = createError({
  type: "LoopError",
  message: "Loop failed",
});

for (let i = 0; i < 1000000; i++) {
  if (shouldFail(i)) {
    return wrapWithContext(baseError, { iteration: i });
  }
}
```

## Platform-Specific Behavior

### Node.js

- Full stack traces available
- Source maps supported via `source-map-support`
- AsyncLocalStorage integration possible

### Browser

- Stack traces may be limited
- Source location affected by minification
- Consider using minimal mode for production

### React Native

- Stack traces often symbolicated
- Source detection may need adjustment
- Metro bundler affects source paths

## See Also

- [Context Management System](./context-management.md)
- [Performance Optimization Guide](./performance-guide.md)
- [Error Factory Patterns](./error-factories.md)
- [Middleware System](./middleware-system.md)
- [Type System Architecture](./type-system.md)
