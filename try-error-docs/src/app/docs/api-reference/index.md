**tryError API Documentation v0.0.1-alpha.1**

---

# tryError

> Lightweight, progressive, type-safe error handling for TypeScript

[![npm version](https://img.shields.io/npm/v/tryError.svg)](https://www.npmjs.com/package/tryError)
[![npm downloads](https://img.shields.io/npm/dm/tryError.svg)](https://www.npmjs.com/package/tryError)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/tryError)](https://bundlephobia.com/package/tryError)
[![gzip size](https://img.badgesize.io/https://unpkg.com/tryError/dist/index.js?compression=gzip&label=gzip%20size)](https://unpkg.com/tryError/dist/index.js)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/danieljohnson/tryError/blob/main/CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/tryError/alpha)](https://www.npmjs.com/package/tryError)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/danieljohnson/tryError/graphs/commit-activity)
[![Dependencies](https://img.shields.io/librariesio/release/npm/tryError)](https://libraries.io/npm/tryError)

⚠️ **Alpha Version**: This library is currently in alpha and APIs may change. Not recommended for production use yet.

## Why tryError?

Traditional error handling in JavaScript forces you to choose between:

- **try/catch blocks**: Clunky syntax, no type safety, hidden control flow
- **Functional libraries**: Heavy abstractions, steep learning curve, large bundle size

**tryError** provides a middle ground:

- ✅ **Errors as values** - Explicit error handling without exceptions
- ✅ **Zero overhead** - Success values are returned directly
- ✅ **Type safe** - Full TypeScript support with type inference
- ✅ **Progressive** - Start simple, add complexity as needed
- ✅ **Tiny** - 4.7KB minified + gzipped (core), 3.1KB (React)
- ✅ **Familiar** - Looks and feels like JavaScript

## Installation

```bash
npm install @try-error/core
# or
yarn add @try-error/core
# or
pnpm add @try-error/core
```

## Quick Start

```typescript
import { trySync, tryAsync, isTryError } from "@try-error/core";

// Wrap synchronous operations
const result = trySync(() => JSON.parse(jsonString));
if (isTryError(result)) {
  console.error("Parse failed:", result.message);
} else {
  console.log("Parsed:", result); // Type-safe!
}

// Wrap async operations
const data = await tryAsync(async () => {
  const response = await fetch("/api/data");
  return response.json();
});

if (isTryError(data)) {
  console.error("Request failed:", data.message);
} else {
  console.log("Data:", data); // Type-safe!
}
```

## Core Concepts

### 1. Errors as Values

Instead of throwing exceptions, operations return either a success value or an error object:

```typescript
// Returns either User or TryError
const user = trySync(() => validateUser(input));

if (isTryError(user)) {
  // Handle error case
  console.error(user.message);
} else {
  // Use the user (fully typed!)
  console.log(user.name);
}
```

### 2. Rich Error Context

Every error includes debugging information automatically:

```typescript
const result = trySync(() => JSON.parse("invalid"));
if (isTryError(result)) {
  console.log(result.type); // "SyntaxError"
  console.log(result.message); // "Unexpected token i in JSON"
  console.log(result.source); // "app.ts:42:15"
  console.log(result.timestamp); // 1640995200000
  console.log(result.stack); // Stack trace (dev only)
}
```

### 3. Zero Overhead Success Path

Success values are returned directly without wrapping:

```typescript
const result = trySync(() => 2 + 2);
// result === 4 (not wrapped!)
```

## API Overview

### Basic Operations

```typescript
// Synchronous operations
trySync(() => riskyOperation());
trySyncTuple(() => riskyOperation()); // Go-style [value, error]

// Asynchronous operations
await tryAsync(async () => await fetch("/api"));
await tryAsyncTuple(async () => await fetch("/api"));

// Type guards
isTryError(result); // Check if error
isOk(result); // Check if success
isErr(result); // Alias for isTryError
```

### Transformations

```typescript
// Transform success values
const upper = tryMap(
  trySync(() => getUserName()),
  (name) => name.toUpperCase()
);

// Chain operations
const result = tryChain(
  trySync(() => parseJSON(input)),
  (parsed) => trySync(() => validate(parsed))
);
```

### Error Recovery

```typescript
// Provide defaults
const value = unwrapOr(result, defaultValue);

// Try multiple sources
const data = await tryAnyAsync([
  tryAsync(() => fetchFromAPI()),
  tryAsync(() => fetchFromCache()),
  tryAsync(() => fetchFromDisk()),
]);

// Retry with backoff
const response = await retry(() => tryAsync(() => fetch("/api/flaky")), {
  attempts: 3,
  baseDelay: 1000,
});
```

### Advanced Features

```typescript
// Add timeout to any operation
const result = await withTimeout(
  tryAsync(() => slowOperation()),
  5000 // 5 seconds
);

// Process multiple operations
const results = await tryAllAsync([
  tryAsync(() => fetch("/api/users")),
  tryAsync(() => fetch("/api/posts")),
  tryAsync(() => fetch("/api/comments")),
]);
```

## React Integration

```bash
npm install @try-error/react
```

```tsx
import { useTry } from "@try-error/react";

function UserProfile({ userId }) {
  const {
    data: user,
    error,
    isLoading,
    execute,
  } = useTry(() => fetchUser(userId), { immediate: true, deps: [userId] });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>Welcome, {user.name}!</div>;
}
```

## Comparison with Alternatives

| Feature        | tryError | fp-ts    | neverthrow | native try/catch |
| -------------- | -------- | -------- | ---------- | ---------------- |
| Type Safety    | ✅ Full  | ✅ Full  | ✅ Full    | ❌ None          |
| Bundle Size    | 4.7KB    | ~50KB    | ~12KB      | 0KB              |
| Learning Curve | Low      | High     | Medium     | Low              |
| Zero Overhead  | ✅ Yes   | ❌ No    | ❌ No      | ✅ Yes           |
| Async Support  | ✅ Yes   | ✅ Yes   | ✅ Yes     | ✅ Yes           |
| Error Context  | ✅ Rich  | ❌ Basic | ❌ Basic   | ❌ Basic         |

## Examples

### API Client

```typescript
class APIClient {
  async getUser(id: string) {
    return tryAsync(async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    });
  }
}

// Usage
const client = new APIClient();
const user = await client.getUser("123");
if (isTryError(user)) {
  console.error("Failed to fetch user:", user.message);
} else {
  console.log("User:", user.name);
}
```

### Form Validation

```typescript
function validateEmail(email: string) {
  return trySync(() => {
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }
    return email.toLowerCase();
  });
}

const result = validateEmail(userInput);
if (isTryError(result)) {
  setError(result.message);
} else {
  setEmail(result);
}
```

### File Processing

```typescript
async function processFile(path: string) {
  // Read file
  const content = await tryAsync(() => fs.readFile(path, "utf8"));
  if (isTryError(content)) return content;

  // Parse JSON
  const data = trySync(() => JSON.parse(content));
  if (isTryError(data)) return data;

  // Validate data
  const validated = trySync(() => validateSchema(data));
  if (isTryError(validated)) return validated;

  return validated;
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Daniel Johnson

## Links

- [Documentation](https://tryError.dev)
- [GitHub Repository](https://github.com/danieljohnson/tryError)
- [npm Package](https://www.npmjs.com/package/tryError)
- [Issue Tracker](https://github.com/danieljohnson/tryError/issues)

## Enumerations

- [ErrorFlags](enumerations/ErrorFlags.md)

## Classes

- [AsyncQueue](classes/AsyncQueue.md)
- [CircuitBreaker](classes/CircuitBreaker.md)
- [ErrorEventEmitter](classes/ErrorEventEmitter.md)
- [ErrorPool](classes/ErrorPool.md)
- [MiddlewarePipeline](classes/MiddlewarePipeline.md)
- [PluginManager](classes/PluginManager.md)
- [RateLimiter](classes/RateLimiter.md)

## Interfaces

- [AmountError](interfaces/AmountError.md)
- [CreateErrorOptions](interfaces/CreateErrorOptions.md)
- [EntityError](interfaces/EntityError.md)
- [ErrorFactoryOptions](interfaces/ErrorFactoryOptions.md)
- [ErrorHandlingOptions](interfaces/ErrorHandlingOptions.md)
- [ExternalError](interfaces/ExternalError.md)
- [MiddlewareContext](interfaces/MiddlewareContext.md)
- [PerformanceConfig](interfaces/PerformanceConfig.md)
- [Plugin](interfaces/Plugin.md)
- [PluginAPI](interfaces/PluginAPI.md)
- [PluginCapabilities](interfaces/PluginCapabilities.md)
- [PluginHooks](interfaces/PluginHooks.md)
- [PluginMetadata](interfaces/PluginMetadata.md)
- [ProgressTracker](interfaces/ProgressTracker.md)
- [TryAsyncOptions](interfaces/TryAsyncOptions.md)
- [TryError](interfaces/TryError.md)
- [TryErrorConfig](interfaces/TryErrorConfig.md)
- [TrySyncOptions](interfaces/TrySyncOptions.md)
- [ValidationError](interfaces/ValidationError.md)

## Type Aliases

- [AsyncErrorMiddleware](type-aliases/AsyncErrorMiddleware.md)
- [ContextualMiddleware](type-aliases/ContextualMiddleware.md)
- [ErrorEvent](type-aliases/ErrorEvent.md)
- [ErrorEventListener](type-aliases/ErrorEventListener.md)
- [ErrorMiddleware](type-aliases/ErrorMiddleware.md)
- [TryFailure](type-aliases/TryFailure.md)
- [TryResult](type-aliases/TryResult.md)
- [TrySuccess](type-aliases/TrySuccess.md)
- [TryTuple](type-aliases/TryTuple.md)
- [UnwrapTry](type-aliases/UnwrapTry.md)
- [UnwrapTryError](type-aliases/UnwrapTryError.md)

## Variables

### ConfigPresets

```ts
const ConfigPresets: Readonly<{
  clientProduction: () => TryErrorConfig;
  development: () => TryErrorConfig;
  edge: () => TryErrorConfig;
  minimal: () => TryErrorConfig;
  nextjs: () => TryErrorConfig;
  performance: () => TryErrorConfig & {
    performance: PerformanceConfig;
  };
  production: () => TryErrorConfig;
  serverProduction: () => TryErrorConfig;
  test: () => TryErrorConfig;
}>;
```

Defined in: [config.ts:386](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L386)

Environment-specific configuration presets
Made immutable by using Object.freeze

---

### errorEvents

```ts
const errorEvents: ErrorEventEmitter;
```

Defined in: [events.ts:207](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L207)

Global error event emitter

---

### ErrorSampling

```ts
const ErrorSampling: {
  byType: boolean;
  random: boolean;
  rate: boolean;
  timeBased: boolean;
};
```

Defined in: [utils.ts:631](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L631)

Error sampling utilities

#### Type declaration

##### byType()

```ts
byType(error, rates): boolean;
```

Error type sampling - different rates for different error types

###### Parameters

###### error

[`TryError`](interfaces/TryError.md)

The error to check

###### rates

`Map`\<`string`, `number`\>

Map of error types to sampling rates

###### Returns

`boolean`

Whether to include the error

###### Example

```typescript
const samplingRates = new Map([
  ["ValidationError", 0.01], // 1% of validation errors
  ["NetworkError", 0.5], // 50% of network errors
  ["CriticalError", 1.0], // 100% of critical errors
]);

if (ErrorSampling.byType(error, samplingRates)) {
  logError(error);
}
```

##### random()

```ts
random(probability): boolean;
```

Random sampling - include error based on probability

###### Parameters

###### probability

`number`

Probability of including error (0-1)

###### Returns

`boolean`

Whether to include the error

###### Example

```typescript
if (ErrorSampling.random(0.1)) {
  // 10% sampling
  logError(error);
}
```

##### rate()

```ts
rate(counter, rate): boolean;
```

Rate-based sampling - include every Nth error

###### Parameters

###### counter

`number`

Current counter value

###### rate

`number`

Sample every Nth error

###### Returns

`boolean`

Whether to include the error

###### Example

```typescript
let errorCount = 0;
if (ErrorSampling.rate(++errorCount, 100)) {
  // Every 100th error
  logError(error);
}
```

##### timeBased()

```ts
timeBased(lastSampleTime, windowMs): boolean;
```

Time-based sampling - include one error per time window

###### Parameters

###### lastSampleTime

`number`

Last time an error was sampled

###### windowMs

`number`

Time window in milliseconds

###### Returns

`boolean`

Whether to include the error

###### Example

```typescript
let lastSample = 0;
if (ErrorSampling.timeBased(lastSample, 60000)) {
  // Once per minute
  lastSample = Date.now();
  logError(error);
}
```

---

### FEATURES

```ts
const FEATURES: Readonly<{
  asyncStackTraces: false;
  bitFlags: true;
  errorCloning: true;
  errorComparison: true;
  eventSystem: true;
  lazyEvaluation: true;
  objectPooling: true;
  serialization: true;
  stringInterning: true;
}>;
```

Defined in: [index.ts:8](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/index.ts#L8)

---

### globalRegistry

```ts
const globalRegistry: MiddlewareRegistry;
```

Defined in: [middleware.ts:142](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L142)

---

### Performance

```ts
const Performance: {
  getMemoryUsage: () => null | MemoryUsage;
  measureErrorCreation: (iterations) => Promise<{
    averageTime: number;
    errors: number;
    iterations: number;
    totalTime: number;
  }>;
  now: number;
};
```

Defined in: [config.ts:915](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L915)

Performance monitoring utilities

#### Type declaration

##### getMemoryUsage()

```ts
getMemoryUsage: () => null | MemoryUsage;
```

Get memory usage information (Node.js only)

###### Returns

`null` \| `MemoryUsage`

##### measureErrorCreation()

```ts
measureErrorCreation: (iterations) =>
  Promise<{
    averageTime: number;
    errors: number;
    iterations: number;
    totalTime: number;
  }>;
```

Measure error creation performance

###### Parameters

###### iterations

`number` = `1000`

###### Returns

`Promise`\<\{
`averageTime`: `number`;
`errors`: `number`;
`iterations`: `number`;
`totalTime`: `number`;
\}\>

##### now()

```ts
now(): number;
```

Get high-resolution time in milliseconds
Falls back gracefully based on environment

###### Returns

`number`

---

### pluginManager

```ts
const pluginManager: PluginManager;
```

Defined in: [plugins.ts:369](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L369)

Global plugin manager instance

---

### sentryPlugin

```ts
const sentryPlugin: Plugin;
```

Defined in: [plugins.ts:410](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L410)

Example plugin: Sentry integration

---

### VERSION

```ts
const VERSION: "1.0.0" = "1.0.0";
```

Defined in: [index.ts:5](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/index.ts#L5)

## Functions

- [amountError](functions/amountError.md)
- [areTryErrorsEqual](functions/areTryErrorsEqual.md)
- [chainError](functions/chainError.md)
- [circuitBreakerMiddleware](functions/circuitBreakerMiddleware.md)
- [clearFlag](functions/clearFlag.md)
- [clearInternPool](functions/clearInternPool.md)
- [cloneTryError](functions/cloneTryError.md)
- [combineErrors](functions/combineErrors.md)
- [compose](functions/compose.md)
- [composeFactories](functions/composeFactories.md)
- [configure](functions/configure.md)
- [configureErrorPool](functions/configureErrorPool.md)
- [correlateErrors](functions/correlateErrors.md)
- [createAmountError](functions/createAmountError.md)
- [createAsyncQueue](functions/createAsyncQueue.md)
- [createCircuitBreaker](functions/createCircuitBreaker.md)
- [createDebugProxy](functions/createDebugProxy.md)
- [createEnhancedError](functions/createEnhancedError.md)
- [createEntityError](functions/createEntityError.md)
- [createEnvConfig](functions/createEnvConfig.md)
- [createError](functions/createError.md)
- [createErrorFactory](functions/createErrorFactory.md)
- [createErrorReport](functions/createErrorReport.md)
- [createExternalError](functions/createExternalError.md)
- [createLazyError](functions/createLazyError.md)
- [createPlugin](functions/createPlugin.md)
- [createRateLimiter](functions/createRateLimiter.md)
- [createScope](functions/createScope.md)
- [createValidationError](functions/createValidationError.md)
- [deserializeTryError](functions/deserializeTryError.md)
- [diffErrors](functions/diffErrors.md)
- [emitErrorCreated](functions/emitErrorCreated.md)
- [emitErrorPooled](functions/emitErrorPooled.md)
- [emitErrorRecovered](functions/emitErrorRecovered.md)
- [emitErrorReleased](functions/emitErrorReleased.md)
- [emitErrorRetry](functions/emitErrorRetry.md)
- [emitErrorSerialized](functions/emitErrorSerialized.md)
- [emitErrorTransformed](functions/emitErrorTransformed.md)
- [emitErrorWrapped](functions/emitErrorWrapped.md)
- [enrichContextMiddleware](functions/enrichContextMiddleware.md)
- [entityError](functions/entityError.md)
- [externalError](functions/externalError.md)
- [fieldValidationError](functions/fieldValidationError.md)
- [filterErrors](functions/filterErrors.md)
- [filterMiddleware](functions/filterMiddleware.md)
- [filterSuccess](functions/filterSuccess.md)
- [forceLazyEvaluation](functions/forceLazyEvaluation.md)
- [formatErrorForLogging](functions/formatErrorForLogging.md)
- [fromThrown](functions/fromThrown.md)
- [getConfig](functions/getConfig.md)
- [getErrorContext](functions/getErrorContext.md)
- [getErrorFingerprint](functions/getErrorFingerprint.md)
- [getErrorMessage](functions/getErrorMessage.md)
- [getErrorPoolStats](functions/getErrorPoolStats.md)
- [getErrorSummary](functions/getErrorSummary.md)
- [getFactory](functions/getFactory.md)
- [getGlobalErrorPool](functions/getGlobalErrorPool.md)
- [getInternStats](functions/getInternStats.md)
- [groupErrors](functions/groupErrors.md)
- [hasErrorContext](functions/hasErrorContext.md)
- [hasFlag](functions/hasFlag.md)
- [intern](functions/intern.md)
- [internError](functions/internError.md)
- [isErr](functions/isErr.md)
- [isErrorOfType](functions/isErrorOfType.md)
- [isErrorOfTypes](functions/isErrorOfTypes.md)
- [isLazyProperty](functions/isLazyProperty.md)
- [isOk](functions/isOk.md)
- [isTryError](functions/isTryError.md)
- [isTrySuccess](functions/isTrySuccess.md)
- [listFactories](functions/listFactories.md)
- [loggingMiddleware](functions/loggingMiddleware.md)
- [makeLazy](functions/makeLazy.md)
- [matchTryResult](functions/matchTryResult.md)
- [partitionResults](functions/partitionResults.md)
- [preinternCommonStrings](functions/preinternCommonStrings.md)
- [rateLimitMiddleware](functions/rateLimitMiddleware.md)
- [resetConfig](functions/resetConfig.md)
- [resetErrorPool](functions/resetErrorPool.md)
- [retry](functions/retry.md)
- [retryMiddleware](functions/retryMiddleware.md)
- [retrySync](functions/retrySync.md)
- [serializeDomainError](functions/serializeDomainError.md)
- [serializeTryError](functions/serializeTryError.md)
- [setFlag](functions/setFlag.md)
- [transformMiddleware](functions/transformMiddleware.md)
- [transformResult](functions/transformResult.md)
- [tryAll](functions/tryAll.md)
- [tryAllAsync](functions/tryAllAsync.md)
- [tryAny](functions/tryAny.md)
- [tryAnyAsync](functions/tryAnyAsync.md)
- [tryAnySequential](functions/tryAnySequential.md)
- [tryAsync](functions/tryAsync.md)
- [tryAsyncTuple](functions/tryAsyncTuple.md)
- [tryAwait](functions/tryAwait.md)
- [tryCall](functions/tryCall.md)
- [tryChain](functions/tryChain.md)
- [tryChainAsync](functions/tryChainAsync.md)
- [tryMap](functions/tryMap.md)
- [tryMapAsync](functions/tryMapAsync.md)
- [trySync](functions/trySync.md)
- [trySyncTuple](functions/trySyncTuple.md)
- [unwrap](functions/unwrap.md)
- [unwrapOr](functions/unwrapOr.md)
- [unwrapOrElse](functions/unwrapOrElse.md)
- [unwrapTryResult](functions/unwrapTryResult.md)
- [validationError](functions/validationError.md)
- [withDefault](functions/withDefault.md)
- [withDefaultFn](functions/withDefaultFn.md)
- [withFallback](functions/withFallback.md)
- [withProgress](functions/withProgress.md)
- [withTimeout](functions/withTimeout.md)
- [wrapError](functions/wrapError.md)
- [wrapWithContext](functions/wrapWithContext.md)

## References

### try$

Renames and re-exports [trySync](functions/trySync.md)

---

### try$$

Renames and re-exports [tryAsync](functions/tryAsync.md)
