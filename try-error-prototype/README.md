# try-error

> Lightweight, progressive, type-safe error handling for TypeScript

[![npm version](https://badge.fury.io/js/try-error.svg)](https://badge.fury.io/js/try-error)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚧 Prototype Status

This is an early prototype to validate the core concepts. Not ready for production use.

## Why try-error?

**try-error** bridges the gap between traditional try/catch and heavy functional programming approaches. It provides **errors as values** with **zero-overhead success paths**, **progressive adoption**, and **developer-first experience**.

### The Problem

Current TypeScript error handling solutions have significant gaps:

- **Traditional try/catch**: Verbose, error-prone, poor composability
- **Heavy FP libraries**: Foreign feel, runtime overhead, steep learning curve
- **Existing Result libraries**: Missing async support, poor DX, limited real-world patterns

### The Solution

```typescript
// Before: Traditional try/catch
try {
  const response = await fetch("/api/user");
  const user = await response.json();
  const posts = await fetch(`/api/users/${user.id}/posts`);
  return await posts.json();
} catch (error) {
  // Lost context, unclear error types, verbose handling
  console.error("Something failed:", error);
  return null;
}

// After: try-error
const result = await tryAsyncChain(
  tryAsync(() => fetch("/api/user")),
  async (response) => tryAsync(() => response.json())
);

if (isErr(result)) {
  // Rich error context, type-safe, composable
  console.error("API call failed:", result.message, result.context);
  return null;
}

return result; // Type-safe success value
```

## Core Philosophy

### 1. Errors as Values (Not Abstractions)

```typescript
// Simple union types, not complex monads
type TryResult<T, E> = T | E;

// Zero overhead for success path
const result = trySync(() => JSON.parse(data));
// result is either the parsed object OR a TryError
```

### 2. Progressive Adoption

```typescript
// Start simple
const result = trySync(() => riskyOperation());

// Add complexity as needed
const result = await tryAsyncChain(
  tryAsync(() => fetchData()),
  async (data) => tryAsync(() => processData(data))
);
```

### 3. Type-Safe by Default

```typescript
// Automatic error type detection
const result = trySync(() => JSON.parse(invalidJson));
// result.type === "SyntaxError"

// Custom error types
const result = await tryAsync(() => apiCall(), {
  errorType: "NetworkError",
  context: { endpoint: "/api/users" },
});
```

### 4. Developer-First Experience

```typescript
// Rich error context
if (isErr(result)) {
  console.log(result.type); // "NetworkError"
  console.log(result.message); // "Connection failed"
  console.log(result.source); // "api.ts:42:15"
  console.log(result.context); // { endpoint: "/api/users" }
  console.log(result.timestamp); // 1640995200000
}
```

## Quick Start

### Installation

```bash
npm install try-error
# or
pnpm add try-error
```

### Basic Usage

```typescript
import { trySync, tryAsync, isOk, isErr } from "try-error";

// Synchronous operations
const parseResult = trySync(() => JSON.parse(jsonString));
if (isOk(parseResult)) {
  console.log("Parsed:", parseResult);
} else {
  console.error("Parse failed:", parseResult.message);
}

// Asynchronous operations
const fetchResult = await tryAsync(async () => {
  const response = await fetch("/api/data");
  return response.json();
});

if (isErr(fetchResult)) {
  console.error("Fetch failed:", fetchResult.message);
  return;
}

console.log("Data:", fetchResult);
```

### Go-Style Error Handling

```typescript
import { trySyncTuple, tryAsyncTuple } from "try-error";

// Synchronous
const [result, error] = trySyncTuple(() => JSON.parse(jsonString));
if (error) {
  console.error("Parse failed:", error.message);
  return;
}
console.log("Parsed:", result);

// Asynchronous
const [data, error] = await tryAsyncTuple(async () => {
  const response = await fetch("/api/data");
  return response.json();
});
if (error) {
  console.error("Fetch failed:", error.message);
  return;
}
console.log("Data:", data);
```

## API Reference

### Core Functions

#### `trySync<T>(fn: () => T, options?: TrySyncOptions): TryResult<T, TryError>`

Wraps a synchronous operation that might throw.

```typescript
const result = trySync(() => JSON.parse(jsonString));
const result = trySync(() => riskyOperation(), {
  errorType: "ValidationError",
  context: { input: "user data" },
});
```

#### `tryAsync<T>(fn: () => Promise<T>, options?: TryAsyncOptions): Promise<TryResult<T, TryError>>`

Wraps an asynchronous operation that might throw or reject.

```typescript
const result = await tryAsync(async () => {
  const response = await fetch("/api/data");
  return response.json();
});

// With timeout
const result = await tryAsync(() => slowOperation(), { timeout: 5000 });
```

### Transformation Functions

#### `tryMap<T, U>(result: TryResult<T, E>, mapper: (value: T) => U): TryResult<U, E | TryError>`

Transform success values, pass through errors.

```typescript
const parseResult = trySync(() => JSON.parse(jsonString));
const upperResult = tryMap(parseResult, (obj) => obj.name.toUpperCase());
```

#### `tryChain<T, U>(result: TryResult<T, E1>, chainer: (value: T) => TryResult<U, E2>): TryResult<U, E1 | E2>`

Chain operations that return TryResult, short-circuiting on errors.

```typescript
const result = tryChain(
  trySync(() => JSON.parse(jsonString)),
  (obj) => trySync(() => validateObject(obj))
);
```

### Async Transformations

#### `tryMapAsync<T, U>(resultPromise: Promise<TryResult<T, E>>, mapper: (value: T) => Promise<U>): Promise<TryResult<U, E | TryError>>`

Transform async results with async mappers.

```typescript
const fetchResult = tryAsync(() => fetch("/api/user"));
const jsonResult = await tryMapAsync(fetchResult, async (response) =>
  response.json()
);
```

#### `tryChainAsync<T, U>(resultPromise: Promise<TryResult<T, E1>>, chainer: (value: T) => Promise<TryResult<U, E2>>): Promise<TryResult<U, E1 | E2>>`

Chain async operations.

```typescript
const result = await tryChainAsync(
  tryAsync(() => fetch("/api/user")),
  async (response) => tryAsync(() => response.json())
);
```

### Collection Utilities

#### `tryAll<T>(results: TryResult<T, E>[]): TryResult<T[], E>`

All operations must succeed.

```typescript
const results = tryAll([
  trySync(() => operation1()),
  trySync(() => operation2()),
  trySync(() => operation3()),
]);
```

#### `tryAllAsync<T>(resultPromises: Promise<TryResult<T, E>>[]): Promise<TryResult<T[], E>>`

All async operations must succeed.

```typescript
const results = await tryAllAsync([
  tryAsync(() => fetch("/api/users")),
  tryAsync(() => fetch("/api/posts")),
  tryAsync(() => fetch("/api/comments")),
]);
```

#### `tryAny<T>(results: TryResult<T, E>[]): TryResult<T, E>`

First success wins.

```typescript
const result = tryAny([
  trySync(() => primaryOperation()),
  trySync(() => fallbackOperation()),
  trySync(() => lastResortOperation()),
]);
```

### Advanced Async Utilities

#### `withTimeout<T>(resultPromise: Promise<TryResult<T, E>>, timeoutMs: number, message?: string): Promise<TryResult<T, E | TryError>>`

Add timeout to any async operation.

```typescript
const result = await withTimeout(
  tryAsync(() => slowOperation()),
  5000,
  "Operation timed out"
);
```

#### `retry<T>(fn: () => Promise<TryResult<T, E>>, options: RetryOptions): Promise<TryResult<T, E>>`

Retry with exponential backoff.

```typescript
const result = await retry(() => tryAsync(() => unreliableOperation()), {
  attempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  shouldRetry: (error) => error.type === "NetworkError",
});
```

### Utility Functions

#### `isOk<T, E>(result: TryResult<T, E>): result is T`

Type guard for success values.

#### `isErr<T, E>(result: TryResult<T, E>): result is E`

Type guard for error values.

#### `unwrap<T, E>(result: TryResult<T, E>): T`

Extract value or throw error.

#### `unwrapOr<T, E>(result: TryResult<T, E>, defaultValue: T): T`

Extract value or return default.

#### `unwrapOrElse<T, E>(result: TryResult<T, E>, fn: (error: E) => T): T`

Extract value or compute default.

### Error Creation

#### `createError(options: CreateErrorOptions): TryError`

Create rich error objects.

```typescript
const error = createError({
  type: "ValidationError",
  message: "Invalid email format",
  context: { email: "invalid@", field: "email" },
});
```

#### `wrapError(type: string, cause: unknown, message?: string, context?: Record<string, unknown>): TryError`

Wrap existing errors with additional context.

```typescript
const wrappedError = wrapError(
  "ProcessingError",
  originalError,
  "Failed to process user data",
  { userId: 123, step: "validation" }
);
```

## Real-World Examples

### API Client with Error Recovery

```typescript
import { tryAsync, tryChainAsync, tryAnyAsync, isOk, isErr } from "try-error";

class ApiClient {
  async fetchUserWithFallback(id: number) {
    // Try multiple endpoints
    const result = await tryAnyAsync([
      tryAsync(() => this.fetchFromPrimary(id)),
      tryAsync(() => this.fetchFromSecondary(id)),
      tryAsync(() => this.fetchFromCache(id)),
    ]);

    if (isErr(result)) {
      console.error("All user fetch attempts failed:", result.message);
      return null;
    }

    return result;
  }

  async fetchUserPosts(userId: number) {
    return tryChainAsync(
      tryAsync(() => this.fetchUser(userId)),
      async (user) => tryAsync(() => this.fetchPosts(user.id))
    );
  }
}
```

### File Processing Pipeline

```typescript
import { trySync, tryAsync, tryChain, tryMap, unwrapOr } from "try-error";

async function processConfigFile(filePath: string) {
  // Read -> Parse -> Validate -> Apply defaults
  const result = await tryChainAsync(
    tryAsync(() => fs.readFile(filePath, "utf8")),
    async (content) => Promise.resolve(trySync(() => JSON.parse(content)))
  );

  const validatedConfig = tryChain(result, (config) =>
    trySync(() => validateConfig(config))
  );

  // Apply defaults for any validation failures
  return unwrapOr(validatedConfig, getDefaultConfig());
}
```

### Batch Operations with Partial Failures

```typescript
import { tryAsync, tryAllAsync, isOk, isErr } from "try-error";

async function processUsers(userIds: number[]) {
  // Process all users, collect successes and failures
  const userPromises = userIds.map((id) => tryAsync(() => processUser(id)));

  const results = await Promise.all(userPromises);
  const successes = results.filter(isOk);
  const failures = results.filter(isErr);

  console.log(`Processed ${successes.length} users successfully`);
  console.log(`Failed to process ${failures.length} users`);

  // Log failure details
  failures.forEach((error) => {
    console.error("Processing failed:", error.message, error.context);
  });

  return successes;
}
```

## Migration Guide

### From try/catch

```typescript
// Before
async function fetchUserData(id: number) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

// After
async function fetchUserData(id: number) {
  const result = await tryAsync(async () => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  });

  if (isErr(result)) {
    console.error("Failed to fetch user:", result.message, result.context);
    return null;
  }

  return result;
}
```

### From neverthrow

```typescript
// Before (neverthrow)
import { ok, err, Result } from "neverthrow";

function parseJson(input: string): Result<any, Error> {
  try {
    return ok(JSON.parse(input));
  } catch (error) {
    return err(error as Error);
  }
}

// After (try-error)
import { trySync } from "try-error";

function parseJson(input: string) {
  return trySync(() => JSON.parse(input));
}
```

### From fp-ts

```typescript
// Before (fp-ts)
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

const fetchUser = (id: number): TE.TaskEither<Error, User> =>
  TE.tryCatch(
    () => fetch(`/api/users/${id}`).then((r) => r.json()),
    (error) => error as Error
  );

// After (try-error)
import { tryAsync } from "try-error";

const fetchUser = (id: number) =>
  tryAsync(async () => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  });
```

## Performance

try-error is designed for **zero-overhead success paths**:

- Success values are returned directly (no wrapping)
- Error objects are only created when needed
- Minimal runtime overhead
- Tree-shakeable exports

```typescript
// Success path: just returns the value
const result = trySync(() => JSON.parse('{"valid": true}'));
// result === { valid: true } (no wrapper object)

// Error path: creates rich error object
const result = trySync(() => JSON.parse("invalid json"));
// result === { type: "SyntaxError", message: "...", ... }
```

## TypeScript Support

try-error is built with TypeScript-first design:

- Full type inference
- Discriminated unions for error types
- Generic type parameters
- Strict null checks compatible
- No any types in public API

```typescript
// Type inference works automatically
const result = trySync(() => JSON.parse(jsonString));
// result: { [key: string]: any } | TryError

if (isOk(result)) {
  // result is automatically narrowed to { [key: string]: any }
  console.log(result.someProperty);
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Your Name](https://github.com/yourusername/try-error)
