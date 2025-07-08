---
id: tryAsync-deep-dive
title: tryAsync() - Complete Implementation Guide
tags: [api, core, async, error-handling, promises, cancellation]
related: [trySync, isTryError, AbortSignal, timeout, Promise]
module: async
complexity: intermediate
performance_impact: low
stability: stable
---

# tryAsync() - Complete Implementation Guide

## Quick Reference

Wraps asynchronous operations that might throw or reject, returning a Promise of a discriminated union (`TryResult`) that contains either the successful result or a structured error object. This is the primary entry point for converting Promise-based error handling to functional error handling.

## Signature

```typescript
async function tryAsync<T>(
  fn: () => Promise<T>,
  options?: TryAsyncOptions
): Promise<TryResult<T, TryError>>;

interface TryAsyncOptions {
  errorType?: string; // Custom error type override
  context?: Record<string, unknown>; // Runtime context injection
  message?: string; // Custom error message
  timeout?: number; // Timeout in milliseconds
  signal?: AbortSignal; // AbortSignal for cancellation
}

// Return type is a Promise of discriminated union
type TryResult<T, E> = T | E; // Where E extends TryError
```

## Purpose

- **Promise rejection to Result conversion**: Transforms rejecting Promises into resolved Promises with results
- **Cancellation support**: Built-in AbortSignal integration for operation cancellation
- **Timeout handling**: Automatic timeout management with configurable delays
- **Type safety**: Provides compile-time guarantees about async error handling
- **Context injection**: Allows runtime context to be attached to async errors
- **Performance**: Minimal overhead, preserves Promise chain optimizations

## Implementation Details

### Algorithm Flow

```
1. Options validation → 1-2ns
2. Promise creation/wrapping → 5-10ns
3. Cancellation setup (if signal provided) → 10-20ns
4. Timeout setup (if timeout provided) → 15-25ns
5. Promise.race setup (if timeout/signal) → 20-30ns
6. Function execution → Variable (user function time)
7. Success path → Return value directly (0ns overhead)
8. Error path → Error transformation (20-100ns)
   a. Abort/timeout detection
   b. Custom error type check
   c. Context merging
   d. TryError creation via fromThrown()
9. Promise resolution → 0ns
```

### Performance Characteristics

- **Time Complexity**: O(1) + O(user function) + O(Promise resolution)
- **Space Complexity**: O(1) on success, O(context size) on error
- **Success Path Overhead**: **0ns** (direct return)
- **Error Path Overhead**: 20-100ns depending on configuration
- **Cancellation Overhead**: 10-20ns when AbortSignal provided
- **Timeout Overhead**: 15-25ns when timeout provided

### Memory Usage

```typescript
// Success case: No additional memory allocation
const result = await tryAsync(() => Promise.resolve(42));
// result === 42, no wrapper object

// Error case: TryError object allocation
const result = await tryAsync(() => Promise.reject(new Error("fail")));
// result = { type: "Error", message: "fail", source: "...", ... }
// Memory: ~450 bytes (standard) or ~120 bytes (minimal mode)

// Cancellation case: AbortController event listener
const controller = new AbortController();
const result = await tryAsync(() => longRunningOperation(), {
  signal: controller.signal,
});
// Additional memory: ~100 bytes for event listener
```

### Internal Dependencies

```typescript
// Direct dependencies
-fromThrown(error, context) - // Automatic error type detection
  createError() - // TryError creation (via fromThrown)
  Promise.race() - // Timeout/cancellation implementation
  AbortSignal.addEventListener() - // Cancellation support
  setTimeout / clearTimeout - // Timeout management
  // Indirect dependencies (via fromThrown)
  getCachedConfig() - // Configuration access
  getSourceLocation() - // Stack trace parsing
  ErrorPool.acquire(); // Object pooling (if enabled)
```

## Runtime Context Injection

### Basic Async Context Usage

```typescript
// Static context at call site
const result = await tryAsync(() => fetch("/api/users"), {
  context: {
    operation: "user-fetch",
    endpoint: "/api/users",
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  },
});

// Dynamic context with runtime values
async function fetchUserData(userId: string, options: RequestOptions) {
  return await tryAsync(() => fetch(`/api/users/${userId}`, options), {
    context: {
      userId,
      method: options.method,
      timeout: options.timeout,
      retryCount: options.retryCount || 0,
      sessionId: await getCurrentSessionId(),
    },
  });
}
```

### Request Correlation Context

```typescript
// Trace async operations across service boundaries
async function processOrderChain(orderId: string) {
  const traceId = generateTraceId();

  const validateResult = await tryAsync(() => validateOrder(orderId), {
    context: {
      traceId,
      operation: "validate-order",
      orderId,
      step: 1,
      totalSteps: 3,
    },
  });

  if (isTryError(validateResult)) return validateResult;

  const paymentResult = await tryAsync(
    () => processPayment(validateResult.paymentInfo),
    {
      context: {
        traceId,
        operation: "process-payment",
        orderId,
        step: 2,
        totalSteps: 3,
        paymentMethod: validateResult.paymentInfo.method,
      },
    }
  );

  if (isTryError(paymentResult)) return paymentResult;

  const fulfillResult = await tryAsync(
    () => fulfillOrder(orderId, paymentResult.transactionId),
    {
      context: {
        traceId,
        operation: "fulfill-order",
        orderId,
        step: 3,
        totalSteps: 3,
        transactionId: paymentResult.transactionId,
      },
    }
  );

  return fulfillResult;
}
```

### Async Context Inheritance

```typescript
class AsyncDataProcessor {
  private baseContext: Record<string, unknown>;

  constructor(processorId: string) {
    this.baseContext = {
      processorId,
      version: "1.0.0",
      startTime: Date.now(),
    };
  }

  async processAsync<T>(
    operation: () => Promise<T>,
    operationName: string,
    options?: TryAsyncOptions
  ) {
    return await tryAsync(operation, {
      ...options,
      context: {
        ...this.baseContext,
        ...options?.context,
        operation: operationName,
        timestamp: Date.now(),
      },
    });
  }
}
```

## Usage Examples

### Basic Async Error Handling

```typescript
// Simple API call that might fail
const result = await tryAsync(() => fetch("/api/data"));

if (isTryError(result)) {
  console.error(`Request failed: ${result.message}`);
  console.error(`Error type: ${result.type}`);
  console.error(`Source: ${result.source}`);
} else {
  console.log(`Response received:`, result);
}
```

### With Timeout

```typescript
// API call with 5-second timeout
const result = await tryAsync(() => fetch("/api/slow-endpoint"), {
  timeout: 5000,
  context: {
    endpoint: "/api/slow-endpoint",
    maxWaitTime: 5000,
  },
});

if (isTryError(result)) {
  if (result.message.includes("timed out")) {
    console.error("Request timed out after 5 seconds");
  } else {
    console.error(`Request failed: ${result.message}`);
  }
}
```

### With Cancellation

```typescript
// Long-running operation with cancellation
const controller = new AbortController();

// Start the operation
const operationPromise = tryAsync(
  () => longRunningDataProcessing(controller.signal),
  {
    signal: controller.signal,
    context: {
      operation: "data-processing",
      startTime: Date.now(),
    },
  }
);

// Cancel after 10 seconds
setTimeout(() => {
  controller.abort();
}, 10000);

const result = await operationPromise;

if (isTryError(result)) {
  if (result.type === "ABORTED") {
    console.log("Operation was cancelled");
  } else {
    console.error(`Operation failed: ${result.message}`);
  }
}
```

### Database Operations with Context

```typescript
async function createUser(userData: UserData) {
  const result = await tryAsync(() => db.users.create(userData), {
    errorType: "DatabaseError",
    context: {
      operation: "user-creation",
      userId: userData.id,
      email: userData.email,
      createdAt: new Date().toISOString(),
      dbConnection: db.connectionId,
    },
  });

  if (isTryError(result)) {
    console.error(`User creation failed: ${result.message}`);
    console.error(`Database connection: ${result.context?.dbConnection}`);
    console.error(`User email: ${result.context?.email}`);
  }

  return result;
}
```

### File Operations with Retry

```typescript
async function readFileWithRetry(filePath: string, maxRetries: number = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await tryAsync(
      () => fs.promises.readFile(filePath, "utf8"),
      {
        context: {
          filePath,
          attempt,
          maxRetries,
          timestamp: Date.now(),
        },
      }
    );

    if (!isTryError(result)) {
      return result;
    }

    // Check if it's a recoverable error
    if (result.type === "ENOENT" || result.type === "EACCES") {
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }

    return result;
  }
}
```

## Advanced Patterns

### Parallel Operations

```typescript
async function fetchUserProfile(userId: string) {
  // Execute multiple operations in parallel
  const [userResult, postsResult, friendsResult] = await Promise.all([
    tryAsync(() => fetch(`/api/users/${userId}`), {
      context: { operation: "fetch-user", userId },
    }),
    tryAsync(() => fetch(`/api/users/${userId}/posts`), {
      context: { operation: "fetch-posts", userId },
    }),
    tryAsync(() => fetch(`/api/users/${userId}/friends`), {
      context: { operation: "fetch-friends", userId },
    }),
  ]);

  // Handle partial failures
  const profile: any = {};

  if (isTryError(userResult)) {
    return userResult; // User data is critical
  }
  profile.user = userResult;

  if (isTryError(postsResult)) {
    console.warn(`Failed to load posts: ${postsResult.message}`);
    profile.posts = [];
  } else {
    profile.posts = postsResult;
  }

  if (isTryError(friendsResult)) {
    console.warn(`Failed to load friends: ${friendsResult.message}`);
    profile.friends = [];
  } else {
    profile.friends = friendsResult;
  }

  return profile;
}
```

### Sequential Operations with Context Chaining

```typescript
async function processWorkflow(inputData: any) {
  let workflowContext = {
    workflowId: generateId(),
    startTime: Date.now(),
    steps: [] as Array<{ step: string; duration: number; success: boolean }>,
  };

  // Step 1: Validate
  const stepStart = Date.now();
  const validateResult = await tryAsync(() => validateInput(inputData), {
    context: {
      ...workflowContext,
      currentStep: "validate",
      stepNumber: 1,
    },
  });

  workflowContext.steps.push({
    step: "validate",
    duration: Date.now() - stepStart,
    success: !isTryError(validateResult),
  });

  if (isTryError(validateResult)) {
    return validateResult;
  }

  // Step 2: Process
  const processStart = Date.now();
  const processResult = await tryAsync(() => processData(validateResult), {
    context: {
      ...workflowContext,
      currentStep: "process",
      stepNumber: 2,
      inputSize: JSON.stringify(validateResult).length,
    },
  });

  workflowContext.steps.push({
    step: "process",
    duration: Date.now() - processStart,
    success: !isTryError(processResult),
  });

  if (isTryError(processResult)) {
    return processResult;
  }

  // Step 3: Store
  const storeStart = Date.now();
  const storeResult = await tryAsync(() => storeResult(processResult), {
    context: {
      ...workflowContext,
      currentStep: "store",
      stepNumber: 3,
      outputSize: JSON.stringify(processResult).length,
    },
  });

  workflowContext.steps.push({
    step: "store",
    duration: Date.now() - storeStart,
    success: !isTryError(storeResult),
  });

  return storeResult;
}
```

### Rate-Limited Operations

```typescript
class RateLimitedClient {
  private lastRequestTime: number = 0;
  private minInterval: number = 1000; // 1 second between requests

  async makeRequest<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<TryResult<T, TryError>> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();

    return await tryAsync(operation, {
      context: {
        operationName,
        requestTime: this.lastRequestTime,
        waitTime: Math.max(0, this.minInterval - timeSinceLastRequest),
        rateLimited: true,
      },
    });
  }
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private failureThreshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<TryResult<T, TryError>> {
    const now = Date.now();

    // Check if circuit should be half-open
    if (this.state === "OPEN" && now - this.lastFailureTime > this.timeout) {
      this.state = "HALF_OPEN";
    }

    // Fail fast if circuit is open
    if (this.state === "OPEN") {
      return createError({
        type: "CircuitBreakerOpen",
        message: "Circuit breaker is open",
        context: {
          operationName,
          failures: this.failures,
          lastFailureTime: this.lastFailureTime,
        },
      });
    }

    const result = await tryAsync(operation, {
      context: {
        operationName,
        circuitState: this.state,
        failureCount: this.failures,
      },
    });

    if (isTryError(result)) {
      this.failures++;
      this.lastFailureTime = now;

      if (this.failures >= this.failureThreshold) {
        this.state = "OPEN";
      }
    } else {
      // Success - reset circuit
      this.failures = 0;
      this.state = "CLOSED";
    }

    return result;
  }
}
```

## Performance Optimization

### Success Path - Zero Overhead

```typescript
// This has ZERO overhead when successful
const result = await tryAsync(() => Promise.resolve(42));
// result === 42 (not wrapped in object)

// No performance difference between:
const direct = await fetchData();
const wrapped = await tryAsync(() => fetchData());
// Both execute fetchData() with identical performance
```

### Cancellation Optimization

```typescript
// Efficient cancellation with shared AbortController
const controller = new AbortController();

// Multiple operations sharing same controller
const [result1, result2, result3] = await Promise.all([
  tryAsync(() => fetch("/api/data1", { signal: controller.signal }), {
    signal: controller.signal,
    context: { operation: "data1" },
  }),
  tryAsync(() => fetch("/api/data2", { signal: controller.signal }), {
    signal: controller.signal,
    context: { operation: "data2" },
  }),
  tryAsync(() => fetch("/api/data3", { signal: controller.signal }), {
    signal: controller.signal,
    context: { operation: "data3" },
  }),
]);

// Cancel all operations with single call
controller.abort();
```

### Timeout Optimization

```typescript
// Avoid creating multiple timeout timers
const GLOBAL_TIMEOUT = 5000;

async function fetchWithGlobalTimeout<T>(
  operation: () => Promise<T>,
  operationName: string
) {
  return await tryAsync(operation, {
    timeout: GLOBAL_TIMEOUT,
    context: { operation: operationName },
  });
}

// Use AbortSignal for better timeout control
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), GLOBAL_TIMEOUT);

const result = await tryAsync(
  () => fetch("/api/data", { signal: controller.signal }),
  {
    signal: controller.signal,
    context: { operation: "api-fetch" },
  }
);

clearTimeout(timeoutId);
```

### Hot Path Optimization

```typescript
// For high-frequency operations, minimize context allocation
async function highFrequencyOperation(data: any) {
  // Don't do this for high-frequency operations:
  // return await tryAsync(() => process(data), {
  //   context: {
  //     timestamp: Date.now(),
  //     dataSize: JSON.stringify(data).length
  //   }
  // });

  // Do this instead:
  return await tryAsync(() => process(data));
}

// Add context only when needed for debugging
async function highFrequencyWithConditionalContext(
  data: any,
  debug: boolean = false
) {
  if (debug) {
    return await tryAsync(() => process(data), {
      context: {
        timestamp: Date.now(),
        dataSize: JSON.stringify(data).length,
        debug: true,
      },
    });
  }

  return await tryAsync(() => process(data));
}
```

## Error Handling Patterns

### Async Error Aggregation

```typescript
async function aggregateAsyncErrors<T>(
  operations: Array<() => Promise<T>>
): Promise<TryResult<T[], TryError>> {
  const results: T[] = [];
  const errors: TryError[] = [];

  for (const [index, operation] of operations.entries()) {
    const result = await tryAsync(operation, {
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
      type: "MultipleAsyncErrors",
      message: `${errors.length} async operations failed`,
      context: {
        errors: errors.map((e) => ({
          type: e.type,
          message: e.message,
          context: e.context,
        })),
        successCount: results.length,
        totalCount: operations.length,
      },
    });
  }

  return results;
}
```

### Async Chain with Early Return

```typescript
async function processChain(input: any) {
  return await tryAsync(
    async () => {
      const step1 = await tryAsync(() => processStep1(input));
      if (isTryError(step1)) throw step1;

      const step2 = await tryAsync(() => processStep2(step1));
      if (isTryError(step2)) throw step2;

      const step3 = await tryAsync(() => processStep3(step2));
      if (isTryError(step3)) throw step3;

      return step3;
    },
    {
      context: {
        chainType: "sequential",
        inputType: typeof input,
        totalSteps: 3,
      },
    }
  );
}
```

## Edge Cases and Gotchas

### Promise That Resolves to TryError

```typescript
// Function that returns a TryError as a valid result
async function getLastAsyncError(): Promise<TryError> {
  return createError({
    type: "PreviousAsyncError",
    message: "This is a valid return value",
  });
}

// This will work correctly - the returned TryError is the success value
const result = await tryAsync(() => getLastAsyncError());
// result is the TryError object as the success value
// Use isTryError(result) to check if it's actually an error from tryAsync
```

### Async Function That Rejects with TryError

```typescript
async function problematicAsyncFunction() {
  throw createError({
    type: "CustomAsyncError",
    message: "I'm rejecting with a TryError",
  });
}

const result = await tryAsync(() => problematicAsyncFunction());
// result will be the thrown TryError, properly handled
// The error won't be double-wrapped
```

### Timeout Race Condition

```typescript
// Potential race condition with cleanup
async function timeoutRaceCondition() {
  const controller = new AbortController();

  // Set timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 5000);

  const result = await tryAsync(() => longRunningOperation(controller.signal), {
    signal: controller.signal,
    timeout: 5000, // This creates a second timeout!
  });

  clearTimeout(timeoutId); // May not be called if timeout occurred

  return result;
}

// Better approach - use only one timeout mechanism
async function betterTimeoutHandling() {
  const controller = new AbortController();

  const result = await tryAsync(() => longRunningOperation(controller.signal), {
    timeout: 5000, // Use built-in timeout
    signal: controller.signal,
  });

  return result;
}
```

### Memory Leaks with Event Listeners

```typescript
// Potential memory leak
async function potentialMemoryLeak() {
  const controller = new AbortController();

  // Multiple event listeners without cleanup
  controller.signal.addEventListener("abort", () => console.log("Aborted 1"));
  controller.signal.addEventListener("abort", () => console.log("Aborted 2"));

  const result = await tryAsync(() => longRunningOperation(controller.signal), {
    signal: controller.signal,
  });

  // Event listeners remain in memory
  return result;
}

// Better approach with cleanup
async function betterEventHandling() {
  const controller = new AbortController();

  const handler = () => console.log("Operation aborted");
  controller.signal.addEventListener("abort", handler);

  try {
    const result = await tryAsync(
      () => longRunningOperation(controller.signal),
      { signal: controller.signal }
    );

    return result;
  } finally {
    controller.signal.removeEventListener("abort", handler);
  }
}
```

## Platform-Specific Behavior

### Node.js

```typescript
// Node.js specific timeout behavior
const result = await tryAsync(() => fetch("https://api.example.com/data"), {
  timeout: 5000,
});

// Node.js provides more detailed timeout information
if (isTryError(result) && result.message.includes("timeout")) {
  console.log("Request timed out");
  // result.stack includes Node.js-specific stack trace
}
```

### Browser

```typescript
// Browser-specific AbortController support
const controller = new AbortController();

// Some browsers have different AbortSignal.timeout implementations
const result = await tryAsync(
  () => fetch("/api/data", { signal: controller.signal }),
  {
    signal: controller.signal,
    timeout: 5000,
    context: { userAgent: navigator.userAgent },
  }
);
```

### Service Workers

```typescript
// Service Worker context
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const result = await tryAsync(() => fetch(event.request), {
        context: {
          url: event.request.url,
          method: event.request.method,
          serviceWorker: true,
        },
      });

      if (isTryError(result)) {
        // Return fallback response
        return new Response("Service temporarily unavailable", {
          status: 503,
        });
      }

      return result;
    })()
  );
});
```

## Testing Strategies

### Unit Testing

```typescript
describe("tryAsync", () => {
  it("should return success value directly", async () => {
    const result = await tryAsync(() => Promise.resolve(42));
    expect(result).toBe(42);
    expect(isTryError(result)).toBe(false);
  });

  it("should handle promise rejections", async () => {
    const result = await tryAsync(() => Promise.reject(new Error("test")));
    expect(isTryError(result)).toBe(true);
    expect(result.message).toBe("test");
  });

  it("should handle timeout", async () => {
    const result = await tryAsync(
      () => new Promise((resolve) => setTimeout(resolve, 2000)),
      { timeout: 1000 }
    );

    expect(isTryError(result)).toBe(true);
    expect(result.message).toContain("timed out");
  });

  it("should handle cancellation", async () => {
    const controller = new AbortController();

    const resultPromise = tryAsync(
      () => new Promise((resolve) => setTimeout(resolve, 2000)),
      { signal: controller.signal }
    );

    setTimeout(() => controller.abort(), 100);

    const result = await resultPromise;
    expect(isTryError(result)).toBe(true);
    expect(result.message).toContain("aborted");
  });
});
```

### Integration Testing

```typescript
describe("tryAsync integration", () => {
  it("should work with real HTTP requests", async () => {
    const result = await tryAsync(
      () => fetch("https://jsonplaceholder.typicode.com/posts/1"),
      { timeout: 5000 }
    );

    if (isTryError(result)) {
      console.log("Request failed:", result.message);
    } else {
      expect(result.ok).toBe(true);
    }
  });

  it("should handle network errors gracefully", async () => {
    const result = await tryAsync(
      () => fetch("https://nonexistent-domain-12345.com"),
      { timeout: 1000 }
    );

    expect(isTryError(result)).toBe(true);
    expect(result.type).toBe("TypeError");
  });
});
```

## Common Pitfalls

### 1. Forgetting to Await

```typescript
// BAD: Not awaiting the Promise
const result = tryAsync(() => fetch("/api/data"));
// result is a Promise, not the actual result

// GOOD: Always await tryAsync
const result = await tryAsync(() => fetch("/api/data"));
```

### 2. Sync Function in tryAsync

```typescript
// BAD: Using sync function in tryAsync
const result = await tryAsync(() => JSON.parse(input));
// This works but is unnecessary overhead

// GOOD: Use trySync for sync operations
const result = trySync(() => JSON.parse(input));
```

### 3. Double Timeout

```typescript
// BAD: Setting timeout in multiple places
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

const result = await tryAsync(
  () => fetch("/api/data", { signal: controller.signal }),
  {
    signal: controller.signal,
    timeout: 5000, // Duplicate timeout!
  }
);

// GOOD: Use single timeout mechanism
const result = await tryAsync(() => fetch("/api/data"), { timeout: 5000 });
```

### 4. AbortSignal Reuse

```typescript
// BAD: Reusing aborted AbortSignal
const controller = new AbortController();
controller.abort();

const result = await tryAsync(
  () => fetch("/api/data"),
  { signal: controller.signal } // Already aborted!
);

// GOOD: Create new AbortController for each operation
const controller = new AbortController();
const result = await tryAsync(() => fetch("/api/data"), {
  signal: controller.signal,
});
```

## See Also

- [trySync() - Sync Error Handling](./trySync-deep-dive.md)
- [isTryError() - Type Guards](./isTryError-deep-dive.md)
- [AbortSignal Integration](./abort-signal-guide.md)
- [Timeout Handling](./timeout-patterns.md)
- [Promise Error Patterns](./promise-error-patterns.md)
- [React Async Hooks](./react-async-hooks.md)
- [Performance Optimization](./performance-optimization.md)
- [Error Handling Best Practices](./error-handling-best-practices.md)
