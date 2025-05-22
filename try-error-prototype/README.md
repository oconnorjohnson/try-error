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
  return user;
} catch (error) {
  console.error("Something failed:", error);
  return null;
}

// After: try-error
const result = await tryAsync(async () => {
  const response = await fetch("/api/user");
  return response.json();
});

if (isErr(result)) {
  console.error("API call failed:", result.message, result.context);
  return null;
}

return result; // Type-safe success value
```

## Quick Start

### Installation

```bash
npm install try-error
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

// Asynchronous
const [data, error] = await tryAsyncTuple(async () => {
  const response = await fetch("/api/data");
  return response.json();
});
```

## Core Features

### 1. Errors as Values (Not Abstractions)

```typescript
// Simple union types, not complex monads
type TryResult<T, E> = T | E;

// Zero overhead for success path
const result = trySync(() => JSON.parse(data));
// result is either the parsed object OR a TryError
```

### 2. Rich Error Context

```typescript
if (isErr(result)) {
  console.log(result.type); // "SyntaxError"
  console.log(result.message); // "Unexpected token"
  console.log(result.source); // "api.ts:42:15"
  console.log(result.context); // Custom context
  console.log(result.timestamp); // When error occurred
}
```

### 3. Composable Operations

```typescript
// Chain operations with automatic error propagation
const result = await tryChainAsync(
  tryAsync(() => fetch("/api/user")),
  async (response) => tryAsync(() => response.json())
);

// Transform success values
const upperResult = tryMap(parseResult, (obj) => obj.name.toUpperCase());

// Combine multiple operations
const allResults = await tryAllAsync([
  tryAsync(() => fetch("/api/users")),
  tryAsync(() => fetch("/api/posts")),
]);
```

### 4. Advanced Async Utilities

```typescript
// Timeout support
const result = await withTimeout(
  tryAsync(() => slowOperation()),
  5000,
  "Operation timed out"
);

// Retry with exponential backoff
const result = await retry(() => tryAsync(() => unreliableOperation()), {
  attempts: 3,
  baseDelay: 1000,
});

// Try multiple strategies
const result = await tryAnyAsync([
  tryAsync(() => primaryEndpoint()),
  tryAsync(() => fallbackEndpoint()),
]);
```

## API Reference

### Core Functions

- `trySync<T>(fn: () => T): TryResult<T, TryError>` - Wrap sync operations
- `tryAsync<T>(fn: () => Promise<T>): Promise<TryResult<T, TryError>>` - Wrap async operations
- `isOk<T, E>(result: TryResult<T, E>): result is T` - Type guard for success
- `isErr<T, E>(result: TryResult<T, E>): result is E` - Type guard for errors

### Transformation Functions

- `tryMap<T, U>(result, mapper)` - Transform success values
- `tryChain<T, U>(result, chainer)` - Chain operations
- `tryMapAsync<T, U>(resultPromise, mapper)` - Async transformation
- `tryChainAsync<T, U>(resultPromise, chainer)` - Async chaining

### Collection Utilities

- `tryAll(results)` - All must succeed
- `tryAllAsync(resultPromises)` - All async must succeed
- `tryAny(results)` - First success wins
- `tryAnyAsync(resultPromises)` - First async success wins

### Advanced Utilities

- `withTimeout(resultPromise, timeoutMs)` - Add timeout
- `retry(fn, options)` - Retry with backoff
- `unwrap(result)` - Extract value or throw
- `unwrapOr(result, defaultValue)` - Extract value or default

## Real-World Examples

### API Client with Error Recovery

```typescript
class ApiClient {
  async fetchUserWithFallback(id: number) {
    const result = await tryAnyAsync([
      tryAsync(() => this.fetchFromPrimary(id)),
      tryAsync(() => this.fetchFromSecondary(id)),
      tryAsync(() => this.fetchFromCache(id)),
    ]);

    if (isErr(result)) {
      console.error("All fetch attempts failed:", result.message);
      return null;
    }

    return result;
  }
}
```

### File Processing Pipeline

```typescript
async function processConfigFile(filePath: string) {
  const result = await tryChainAsync(
    tryAsync(() => fs.readFile(filePath, "utf8")),
    async (content) => Promise.resolve(trySync(() => JSON.parse(content)))
  );

  return unwrapOr(result, getDefaultConfig());
}
```

## Performance

try-error is designed for **zero-overhead success paths**:

- Success values are returned directly (no wrapping)
- Error objects are only created when needed
- Minimal runtime overhead
- Tree-shakeable exports

## TypeScript Support

Built with TypeScript-first design:

- Full type inference
- Discriminated unions for error types
- Generic type parameters
- Strict null checks compatible

```typescript
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
