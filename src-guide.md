# try-error Source Code Guide

This document provides a comprehensive overview of the try-error package's core source code (`/src` directory). It serves as a reference for understanding the architecture, exports, and functionality of each module.

## 📁 Directory Structure

```
src/
├── index.ts       # Main entry point - re-exports all public APIs
├── types.ts       # Core type definitions and type guards
├── errors.ts      # Error creation and management utilities
├── sync.ts        # Synchronous error handling functions
├── async.ts       # Asynchronous error handling functions
├── config.ts      # Configuration system and presets
├── setup.ts       # One-liner setup utilities for common scenarios
├── factories.ts   # Domain-specific error factories and base types
└── utils.ts       # Utility functions for common error handling patterns
```

## 📄 File-by-File Breakdown

### `index.ts` - Main Entry Point

**Purpose**: Central export hub for all public APIs, providing a clean interface for package consumers.

**Exports**:

- All core types from `types.ts`
- All error creation utilities from `errors.ts`
- All synchronous error handling from `sync.ts`
- All asynchronous error handling from `async.ts`
- All configuration utilities from `config.ts`
- All factory utilities from `factories.ts`
- All helper utilities from `utils.ts`
- Convenience aliases: `try$` (trySync) and `try$$` (tryAsync)

---

### `types.ts` - Core Type Definitions

**Purpose**: Defines the fundamental types and type guards that form the foundation of try-error's type-safe error handling.

**Key Types**:

- `TryError<T>` - Core error type with rich context

  - `type: T` - Discriminated union support
  - `message: string` - Human-readable error message
  - `source: string` - Source location (file:line:column)
  - `timestamp: number` - Error creation time
  - `stack?: string` - Optional stack trace
  - `context?: Record<string, unknown>` - Additional debugging data
  - `cause?: unknown` - Original error that caused this error
  - `[TRY_ERROR_BRAND]: true` - Symbol branding for type safety

- `TryResult<T, E>` - Union type for success (T) or error (E)
- `TryTuple<T, E>` - Go-style tuple: `[T, null] | [null, E]`
- `TrySuccess<T>` - Extract success type from TryResult
- `TryFailure<R>` - Extract error type from TryResult
- `UnwrapTry<R>` - Utility to extract data type
- `UnwrapTryError<R>` - Utility to extract error type

**Key Functions**:

- `isTryError(value)` - Type guard for TryError (uses Symbol branding)
- `isTrySuccess(result)` - Type predicate for success case
- `isTryFailure(result)` - Type predicate for error case
- `matchTryResult(result, handlers)` - Pattern matching for results
- `unwrapTryResult(result)` - Safe unwrapping with discriminated union

**Constants**:

- `TRY_ERROR_BRAND` - Symbol for preventing type guard spoofing

---

### `errors.ts` - Error Creation and Management

**Purpose**: Provides utilities for creating, wrapping, and transforming errors with automatic source location detection and performance optimizations.

**Key Functions**:

- `createError(options)` - Create a TryError with automatic source detection

  - Supports stack trace capture control
  - Environment-aware optimizations
  - Configurable source location detection
  - Runtime-specific handlers (server/client/edge)

- `wrapError(type, cause, message?, context?)` - Wrap existing errors
- `createMinimalError(type, message, context?)` - Ultra-fast minimal errors
- `fromThrown(cause, context?)` - Create TryError from any thrown value
  - Automatic type detection (TypeError, ReferenceError, etc.)
  - Handles Error instances, strings, and unknown values

**Internal Utilities**:

- `getSourceLocation(stackOffset)` - Extract source from stack trace
- `detectEnvironment()` - Detect JS environment (node/chrome/firefox/safari/edge)
- `detectRuntime()` - Detect runtime (server/client/edge)
- `isProduction()` - Check if in production mode
- Stack parsers for different JS engines (V8, Firefox, Safari)

**Performance Features**:

- Cached environment detection
- Cached configuration retrieval
- Fast paths for production and minimal modes
- Optional stack trace capture

---

### `sync.ts` - Synchronous Error Handling

**Purpose**: Provides error handling utilities for synchronous operations with zero overhead for success cases.

**Key Functions**:

- `trySync(fn, options?)` - Wrap synchronous operations

  ```typescript
  const result = trySync(() => JSON.parse(jsonString));
  ```

- `trySyncTuple(fn, options?)` - Go-style error handling

  ```typescript
  const [result, error] = trySyncTuple(() => JSON.parse(jsonString));
  ```

- `tryCall(fn, ...args)` - Call function with error wrapping
- `tryMap(result, mapper)` - Transform success values
- `tryChain(result, chainer)` - Chain operations with short-circuiting
- `unwrap(result, message?)` - Extract value or throw
- `unwrapOr(result, defaultValue)` - Extract value or return default
- `unwrapOrElse(result, defaultFn)` - Extract value or compute default
- `isOk(result)` - Type guard for success
- `isErr(result)` - Type guard for error
- `tryAll(results)` - Combine multiple results (fail-fast)
- `tryAny(attempts)` - Try multiple operations (first success)

**Options Interface**:

- `TrySyncOptions`
  - `errorType?: string` - Custom error type
  - `context?: Record<string, unknown>` - Additional context
  - `message?: string` - Custom error message

---

### `async.ts` - Asynchronous Error Handling

**Purpose**: Provides error handling utilities for asynchronous operations, promises, and async/await patterns.

**Key Functions**:

- `tryAsync(fn, options?)` - Wrap async operations

  ```typescript
  const result = await tryAsync(async () => {
    const response = await fetch("/api/data");
    return response.json();
  });
  ```

- `tryAsyncTuple(fn, options?)` - Go-style async error handling
- `tryAwait(promise, options?)` - Wrap existing promises
- `tryMapAsync(resultPromise, mapper)` - Async transformation
- `tryMap(resultPromise, mapper)` - Sync transformation of async results
- `tryChainAsync(resultPromise, chainer)` - Chain async operations
- `tryChain(resultPromise, chainer)` - Chain with sync operations
- `tryAllAsync(resultPromises)` - Combine async results (fail-fast)
- `tryAnyAsync(attemptPromises)` - First successful async result
- `tryAnySequential(attemptFns)` - Try async operations in sequence
- `withTimeout(resultPromise, timeoutMs, message?)` - Add timeout
- `retry(fn, options)` - Retry with exponential backoff

**Options Interfaces**:

- `TryAsyncOptions` - Extends TrySyncOptions with:

  - `timeout?: number` - Operation timeout in milliseconds

- `RetryOptions`:
  - `attempts: number` - Number of retry attempts
  - `baseDelay?: number` - Initial delay (default: 1000ms)
  - `maxDelay?: number` - Maximum delay (default: 30000ms)
  - `backoffFactor?: number` - Exponential factor (default: 2)
  - `shouldRetry?: (error, attempt) => boolean` - Retry predicate

---

### `config.ts` - Configuration System

**Purpose**: Provides a flexible, tree-shakeable configuration system with environment-specific presets and performance optimizations.

**Key Types**:

- `TryErrorConfig` - Main configuration interface

  - `captureStackTrace?: boolean` - Stack trace control
  - `stackTraceLimit?: number` - Max stack depth
  - `includeSource?: boolean` - Source location inclusion
  - `minimalErrors?: boolean` - Ultra-lightweight mode
  - `skipTimestamp?: boolean` - Skip timestamp generation
  - `skipContext?: boolean` - Skip context processing
  - `sourceLocation?: {...}` - Source location options
  - `defaultErrorType?: string` - Default error type
  - `developmentMode?: boolean` - Dev mode features
  - `serializer?: (error) => object` - Custom serialization
  - `onError?: (error) => error` - Global error hook
  - `runtimeDetection?: boolean` - Auto-detect runtime
  - `environmentHandlers?: {...}` - Runtime-specific handlers

- `PerformanceConfig` - Performance optimization options
  - `errorCreation?: {...}` - Error creation optimizations
  - `contextCapture?: {...}` - Context capture settings
  - `memory?: {...}` - Memory management settings

**Key Functions**:

- `configure(config)` - Set global configuration
- `getConfig()` - Get current configuration
- `resetConfig()` - Reset to defaults
- `createScope(config)` - Create isolated configuration scope
- `createEnvConfig(configs)` - Environment-aware configuration
- `withErrorService(handler, options?)` - Error service integration helper

**Configuration Presets** (`ConfigPresets`):

- `development()` - Full debugging features with console logging
- `production()` - Optimized for performance, no console output
- `test()` - Assertion-friendly for testing
- `performance()` - High-performance with object pooling
- `minimal()` - Ultra-minimal for <50% overhead target
- `serverProduction()` - Server-side with logging hooks
- `clientProduction()` - Client-side with error tracking hooks
- `edge()` - Optimized for edge/serverless environments
- `nextjs()` - Next.js with runtime detection

**Performance Utilities**:

- `Performance.measureErrorCreation(iterations)` - Benchmark error creation
- `Performance.getMemoryUsage()` - Get memory stats (Node.js)

---

### `setup.ts` - One-liner Setup Utilities

**Purpose**: Provides convenient setup functions for common scenarios, reducing configuration boilerplate.

**Key Functions**:

- `setupNode(options?)` - Configure for Node.js/Express apps

  - Auto-detects NODE_ENV
  - Console logging in development
  - Minimal logging in production

- `setupReact(options?)` - Configure for React applications

  - Browser-optimized settings
  - Development console output
  - Production error tracking hooks

- `setupNextJs(options?)` - Configure for Next.js apps

  - Runtime detection enabled
  - Server/client/edge handlers
  - Environment-aware logging

- `setupPerformance(options?)` - High-performance configuration

  - No stack traces
  - Minimal overhead
  - Optimized serialization

- `setupTesting(options?)` - Testing-friendly configuration

  - Full stack traces
  - Detailed serialization
  - Development mode enabled

- `autoSetup(options?)` - Auto-detect and configure

  - Detects Node.js, React, Next.js, test environments
  - Applies appropriate configuration automatically

- `createCustomSetup(baseConfig)` - Create custom setup function
  - Returns a setup function with your defaults
  - Useful for organization-wide standards

---

### `factories.ts` - Domain-Specific Error Factories

**Purpose**: Provides utilities for creating consistent, domain-specific error types with reduced boilerplate.

**Base Error Types**:

- `EntityError<T, EntityType>` - For entity-related errors

  - `entityId: string` - ID of the entity
  - `entityType: EntityType` - Type of entity

- `AmountError<T>` - For monetary/quantity errors

  - `amount: number` - The amount involved
  - `currency: string` - Currency code (ISO 4217)

- `ExternalError<T>` - For external service errors

  - `provider: string` - Service name
  - `externalId?: string` - External reference
  - `statusCode?: number` - HTTP status or error code

- `ValidationError<T>` - For validation errors
  - `fields: Record<string, string[]>` - Field-level errors
  - `code: string` - Error code for programmatic handling

**Factory Functions**:

- `createErrorFactory(defaultFields?)` - Create domain-specific factory
- `createEntityError(entityType, entityId, errorType, message, options?)`
- `createAmountError(amount, currency, errorType, message, options?)`
- `createExternalError(provider, errorType, message, options?)`
- `createValidationError(errorType, message, fields, code, options?)`

**Improved Ergonomic Factories**:

- `validationError(field, code, message, context?)` - Single field validation
- `amountError(requested, available, code, message, currency?)`
- `externalError(service, operation, message, context?)`
- `entityError(entityType, entityId, message, context?)`
- `fieldValidationError(fields, code?, message?)` - Multi-field validation

**Utility Functions**:

- `chainError(originalError, newType, newMessage, additionalFields?)` - Error chaining
- `wrapWithContext(error, additionalContext)` - Add context to existing error

---

### `utils.ts` - Common Error Handling Utilities

**Purpose**: Provides utility functions for common error handling patterns and operations.

**Error Creation & Checking**:

- `createEnhancedError(type, message, options)` - Enhanced error creation
- `isErrorOfType(value, errorType)` - Check specific error type
- `isErrorOfTypes(value, errorTypes[])` - Check multiple error types
- `getErrorMessage(value, fallback?)` - Extract error message safely
- `getErrorContext(error, key)` - Get typed context value
- `hasErrorContext(error, key)` - Check if context key exists

**Result Transformation**:

- `transformResult(result, transform)` - Transform success values
- `withDefault(result, defaultValue)` - Provide default for errors
- `withDefaultFn(result, getDefault)` - Compute default for errors
- `filterSuccess(results[])` - Extract only success values
- `filterErrors(results[])` - Extract only error values
- `partitionResults(results[])` - Split into [successes, errors]

**Error Aggregation**:

- `combineErrors(errors[], type, message)` - Combine multiple errors
- `getErrorSummary(errors[])` - Count errors by type

**Debugging Utilities**:

- `formatErrorForLogging(error, includeStack?)` - Format for logs
- `createErrorReport(errors[])` - Create error summary report

**Types**:

- `ErrorHandlingOptions` - Options for enhanced error handling
  - `errorType?: string`
  - `context?: Record<string, unknown>`
  - `message?: string`
  - `includeStack?: boolean`
  - `tags?: string[]`

## 🏗️ Architecture Principles

1. **Zero-Overhead Abstraction**: Success cases return values directly without wrapping
2. **Tree-Shaking Friendly**: Each module can be imported independently
3. **Progressive Enhancement**: Start simple, add features as needed
4. **Type Safety**: Leverages TypeScript's type system for compile-time safety
5. **Performance First**: Multiple optimization paths based on environment
6. **Isomorphic**: Works in Node.js, browsers, and edge runtimes

## 🔄 Common Usage Patterns

### Basic Error Handling

```typescript
import { trySync, isTryError } from "try-error";

const result = trySync(() => JSON.parse(jsonString));
if (isTryError(result)) {
  console.error("Parse failed:", result.message);
} else {
  console.log("Parsed:", result);
}
```

### Async Operations

```typescript
import { tryAsync } from "try-error";

const result = await tryAsync(async () => {
  const response = await fetch("/api/data");
  return response.json();
});
```

### Configuration

```typescript
import { configure, ConfigPresets } from "try-error";

// Use a preset
configure(ConfigPresets.production());

// Or custom configuration
configure({
  captureStackTrace: false,
  onError: (error) => sendToMonitoring(error),
});
```

### Domain-Specific Errors

```typescript
import { createErrorFactory } from "try-error";

const createPaymentError = createErrorFactory({
  provider: "stripe",
});

const error = createPaymentError("CardDeclined", "Card was declined", {
  transactionId: "tx_123",
  amount: 99.99,
});
```

## 📊 Performance Characteristics

- **Minimal Mode**: <50% overhead vs try-catch
- **Production Mode**: ~2-3x overhead with source location
- **Development Mode**: ~5-10x overhead with full stack traces
- **Memory**: Configurable object pooling and weak references
- **Bundle Size**: Core ~2.7KB minified + gzipped

## 🔗 Module Dependencies

```
index.ts
├── types.ts (core types)
├── errors.ts
│   ├── types.ts
│   └── config.ts
├── sync.ts
│   ├── types.ts
│   └── errors.ts
├── async.ts
│   ├── types.ts
│   └── errors.ts
├── config.ts
│   └── types.ts
├── factories.ts
│   ├── types.ts
│   └── errors.ts
└── utils.ts
    └── types.ts

setup.ts (separate import)
└── config.ts
```

This modular structure ensures that importing specific functionality doesn't pull in unnecessary code, maintaining the library's lightweight nature.
