# try-error: Complete Code Walkthrough

This document walks you through the **try-error** repository, explaining how everything works together to provide lightweight, type-safe error handling for TypeScript.

## 📁 Repository Structure

```
try-error-prototype/
├── src/                    # Core implementation
│   ├── types.ts           # Type definitions and type guards
│   ├── errors.ts          # Error creation utilities
│   ├── sync.ts            # Synchronous error handling
│   ├── async.ts           # Asynchronous error handling
│   └── index.ts           # Main entry point
├── tests/                 # Comprehensive test suite
│   ├── types.test.ts      # Type system tests
│   ├── errors.test.ts     # Error creation tests
│   ├── sync.test.ts       # Sync functionality tests
│   ├── async.test.ts      # Async functionality tests
│   └── integration.test.ts # Real-world scenario tests
├── README.md              # User documentation
├── PROGRESS.md            # Development progress log
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
└── jest.config.js         # Test configuration
```

## 🧠 Core Concepts

### 1. Errors as Values (Not Exceptions)

Instead of throwing exceptions, **try-error** treats errors as regular values that can be passed around, transformed, and composed.

```typescript
// Traditional approach - exceptions
try {
  const result = riskyOperation();
  return result;
} catch (error) {
  // Error handling is separate from normal flow
  console.error(error);
  return null;
}

// try-error approach - errors as values
const result = trySync(() => riskyOperation());
if (isErr(result)) {
  // Error handling is part of normal flow
  console.error(result.message);
  return null;
}
return result; // Type-safe success value
```

### 2. Zero-Overhead Success Path

Success values are returned directly without any wrapping, ensuring no performance penalty for the happy path.

```typescript
const result = trySync(() => JSON.parse('{"valid": true}'));
// result === { valid: true } (direct value, no wrapper)

const errorResult = trySync(() => JSON.parse("invalid"));
// errorResult === { type: "SyntaxError", message: "...", ... } (TryError object)
```

### 3. Rich Error Context

Every error includes comprehensive debugging information automatically.

```typescript
const result = trySync(() => JSON.parse("invalid"));
if (isErr(result)) {
  console.log(result.type); // "SyntaxError"
  console.log(result.message); // "Unexpected token i in JSON"
  console.log(result.source); // "walkthrough.ts:42:15"
  console.log(result.timestamp); // 1640995200000
  console.log(result.stack); // Full stack trace
}
```

## 📋 Module Breakdown

### 1. `src/types.ts` - Type System Foundation

This is the heart of the type system. It defines the core types that everything else builds on.

```typescript
// Core error interface
interface TryError<T = string> {
  type: T; // Discriminated union key
  message: string; // Human-readable error message
  source: string; // File:line:column where error occurred
  timestamp: number; // When the error happened
  stack?: string; // Stack trace (optional)
  context?: Record<string, unknown>; // Custom debugging context
  cause?: unknown; // Original error that caused this
}

// Union type for results
type TryResult<T, E extends TryError = TryError> = T | E;

// Go-style tuple alternative
type TryTuple<T, E extends TryError = TryError> = [T, null] | [null, E];
```

**Key Functions:**

- `isTryError(value)` - Type guard to check if value is an error
- `isTrySuccess(value)` - Type predicate for success values

### 2. `src/errors.ts` - Error Creation & Context

This module handles creating rich error objects with automatic context detection.

```typescript
// Automatically detect source location from stack traces
function createError(options: CreateErrorOptions): TryError {
  const stack = new Error().stack;
  const source = extractSourceLocation(stack); // Parse stack trace

  return {
    type: options.type,
    message: options.message,
    source,
    timestamp: Date.now(),
    stack: process.env.NODE_ENV !== "production" ? stack : undefined,
    context: options.context,
    cause: options.cause,
  };
}
```

**Key Functions:**

- `createError(options)` - Create error with automatic source detection
- `wrapError(type, cause, message, context)` - Wrap existing errors
- `fromThrown(error, context)` - Convert thrown values to TryError

**Magic:** The source location detection parses stack traces to automatically include `file:line:column` information in every error.

### 3. `src/sync.ts` - Synchronous Error Handling

This module provides all synchronous error handling functionality.

```typescript
// Core sync wrapper
function trySync<T>(
  fn: () => T,
  options?: TrySyncOptions
): TryResult<T, TryError> {
  try {
    return fn(); // Direct return on success (zero overhead!)
  } catch (error) {
    return fromThrown(error, options?.context); // Convert to TryError
  }
}
```

**Key Functions:**

- `trySync(fn)` - Wrap any sync operation
- `trySyncTuple(fn)` - Go-style `[result, error]` tuples
- `tryMap(result, mapper)` - Transform success values
- `tryChain(result, chainer)` - Chain operations with error propagation
- `tryAll(results)` - All operations must succeed
- `tryAny(results)` - First success wins
- `unwrap(result)` - Extract value or throw
- `unwrapOr(result, default)` - Extract value or return default

**Pattern:** All functions follow the same pattern - operate on success values, pass through errors unchanged.

### 4. `src/async.ts` - Asynchronous Error Handling

This module extends the sync patterns to async operations with additional features like timeout and retry.

```typescript
// Core async wrapper
async function tryAsync<T>(
  fn: () => Promise<T>,
  options?: TryAsyncOptions
): Promise<TryResult<T, TryError>> {
  try {
    let promise = fn();

    // Built-in timeout support
    if (options?.timeout) {
      promise = Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout after ${options.timeout}ms`)),
            options.timeout
          )
        ),
      ]);
    }

    return await promise; // Direct return on success
  } catch (error) {
    return fromThrown(error, options?.context);
  }
}
```

**Key Functions:**

- `tryAsync(fn)` - Wrap async operations with optional timeout
- `tryAsyncTuple(fn)` - Go-style async tuples
- `tryMapAsync(resultPromise, mapper)` - Transform async results
- `tryChainAsync(resultPromise, chainer)` - Chain async operations
- `tryAllAsync(promises)` - All async operations must succeed
- `tryAnyAsync(promises)` - First async success wins (parallel)
- `tryAnySequential(fns)` - First async success wins (sequential)
- `withTimeout(promise, ms)` - Add timeout to any operation
- `retry(fn, options)` - Retry with exponential backoff

**Advanced Features:**

- Built-in timeout support
- Exponential backoff retry logic
- Parallel vs sequential operation strategies
- Promise rejection handling

### 5. `src/index.ts` - Public API

This module organizes and exports the public API in a clean, discoverable way.

```typescript
// Organized by category
export type { TryError, TryResult, TryTuple } from "./types";
export { isTryError, isTrySuccess } from "./types";

export { createError, wrapError, fromThrown } from "./errors";

export {
  trySync,
  tryMap as trySyncMap,
  tryChain as trySyncChain,
  // ... other sync functions
} from "./sync";

export {
  tryAsync,
  tryMapAsync,
  tryChainAsync,
  // ... other async functions
} from "./async";

// Convenience aliases
export { trySync as try$ } from "./sync";
export { tryAsync as try$$ } from "./async";
```

## 🔄 How It All Works Together

### Example: API Call Chain

Let's trace through a real example to see how all the pieces work together:

```typescript
import { tryAsync, tryChainAsync, isErr } from "try-error";

// 1. Fetch user data
const userResult = await tryAsync(async () => {
  const response = await fetch("/api/user/123");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
});

// 2. Chain: fetch user posts if user fetch succeeded
const postsResult = await tryChainAsync(
  Promise.resolve(userResult),
  async (user) =>
    tryAsync(async () => {
      const response = await fetch(`/api/users/${user.id}/posts`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
);

// 3. Handle the final result
if (isErr(postsResult)) {
  console.error("Failed to fetch posts:", {
    type: postsResult.type,
    message: postsResult.message,
    source: postsResult.source,
    timestamp: new Date(postsResult.timestamp),
  });
  return [];
}

return postsResult; // Type-safe array of posts
```

**What happens internally:**

1. **First `tryAsync`**: Wraps the fetch operation, catches any thrown errors or promise rejections
2. **`tryChainAsync`**: Checks if `userResult` is an error - if so, returns it immediately (short-circuit). If success, calls the chainer function
3. **Second `tryAsync`**: Wraps the posts fetch, again catching any errors
4. **`isErr`**: Type guard that narrows the TypeScript type and checks if result is an error
5. **Success path**: If no errors, `postsResult` is automatically typed as the posts array

### Error Flow

When an error occurs anywhere in the chain:

1. **Error Creation**: `fromThrown()` converts the thrown error to a `TryError` with:

   - Automatic type detection (`TypeError`, `SyntaxError`, etc.)
   - Source location from stack trace
   - Timestamp
   - Original error as `cause`

2. **Error Propagation**: Chain functions like `tryChainAsync` automatically pass errors through without executing subsequent operations

3. **Error Handling**: Type guards like `isErr()` provide type-safe error checking

## 🧪 Test Structure

The test suite is organized to validate each layer:

### `tests/types.test.ts`

- Type guard functionality
- TypeScript type inference
- Discriminated union behavior

### `tests/errors.test.ts`

- Error creation with context
- Source location detection
- Error wrapping and cause preservation

### `tests/sync.test.ts`

- All synchronous operations
- Transformation and chaining
- Collection utilities

### `tests/async.test.ts`

- All asynchronous operations
- Timeout and retry logic
- Promise rejection handling

### `tests/integration.test.ts`

- Real-world scenarios
- API client patterns
- File processing workflows
- Complex error recovery

## 🎯 Key Design Decisions

### 1. Union Types vs Monads

**Choice**: Simple union types (`T | TryError`)
**Why**: Familiar to JS/TS developers, zero runtime overhead, excellent TypeScript support

### 2. Automatic Error Detection

**Choice**: Automatic type detection from thrown errors
**Why**: Reduces boilerplate, provides rich debugging info, maintains error context

### 3. Source Location Detection

**Choice**: Parse stack traces to extract `file:line:column`
**Why**: Invaluable for debugging, automatic with no developer effort

### 4. Progressive Complexity

**Choice**: Start with simple `trySync()`, add features as needed
**Why**: Easy adoption, familiar patterns, optional complexity

### 5. Rich Error Context

**Choice**: Include timestamp, source, context, cause in every error
**Why**: Better debugging, error tracking, production monitoring

## 🚀 Usage Patterns

### Basic Pattern

```typescript
const result = trySync(() => riskyOperation());
if (isErr(result)) {
  // Handle error
  return;
}
// Use result (type-safe)
```

### Transformation Pattern

```typescript
const result = tryMap(
  trySync(() => JSON.parse(input)),
  (obj) => obj.name.toUpperCase()
);
```

### Chaining Pattern

```typescript
const result = tryChain(
  trySync(() => parseInput(input)),
  (parsed) => trySync(() => validateInput(parsed))
);
```

### Async Pattern

```typescript
const result = await tryAsync(async () => {
  const response = await fetch("/api/data");
  return response.json();
});
```

### Error Recovery Pattern

```typescript
const result = await tryAnyAsync([
  tryAsync(() => primaryEndpoint()),
  tryAsync(() => fallbackEndpoint()),
  tryAsync(() => cacheEndpoint()),
]);
```

## 🎉 Why This Works

1. **Familiar**: Uses patterns JS/TS developers already know
2. **Fast**: Zero overhead for success cases
3. **Safe**: Full TypeScript type safety
4. **Rich**: Comprehensive error information
5. **Composable**: Operations chain naturally
6. **Progressive**: Start simple, add complexity as needed
7. **Debuggable**: Automatic source locations and context

The result is error handling that feels natural to JavaScript developers while providing the safety and composability of functional programming approaches, without the learning curve or performance overhead.
