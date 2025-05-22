# try-error Package Architecture & Implementation Guide

## Package Overview

A lightweight, progressive, type-safe error handling library for TypeScript that bridges the gap between traditional `try/catch` and functional programming approaches.

## Project Structure

```
try-error/
├── src/
│   ├── core/
│   │   ├── try.ts              # Core try/tryAsync functions
│   │   ├── types.ts            # Core type definitions
│   │   ├── error.ts            # TryError base class and utilities
│   │   └── index.ts            # Core exports
│   ├── utils/
│   │   ├── pipe.ts             # Composition utilities
│   │   ├── match.ts            # Pattern matching
│   │   ├── recovery.ts         # Error recovery patterns
│   │   ├── aggregate.ts        # Error aggregation (tryAll, tryRace)
│   │   └── index.ts            # Utils exports
│   ├── errors/
│   │   ├── common.ts           # Common error types
│   │   ├── network.ts          # Network-specific errors
│   │   ├── validation.ts       # Validation errors
│   │   └── index.ts            # Error exports
│   ├── integrations/
│   │   ├── react/
│   │   │   ├── hooks.ts        # React hooks (useTry)
│   │   │   └── index.ts
│   │   ├── express/
│   │   │   ├── middleware.ts   # Express middleware
│   │   │   └── index.ts
│   │   └── index.ts            # Integration exports
│   ├── debug/
│   │   ├── logger.ts           # Debug logging
│   │   ├── devtools.ts         # Browser devtools integration
│   │   └── index.ts
│   └── index.ts                # Main entry point
├── tests/
│   ├── core/
│   ├── utils/
│   ├── errors/
│   └── integrations/
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── migration-guide.md
│   └── best-practices.md
├── examples/
│   ├── basic/
│   ├── react-app/
│   ├── express-api/
│   └── migration/
├── scripts/
│   ├── build.ts
│   ├── benchmark.ts
│   └── size-check.ts
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## Core Architecture

### 1. Type System

```typescript
// src/core/types.ts

/**
 * Core error type with rich context
 */
export interface TryError<T extends string = string> {
  readonly type: T;
  readonly message: string;
  readonly stack?: string;
  readonly source: string;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;
  readonly cause?: unknown;
}

/**
 * Result type for sync operations
 */
export type TryResult<T, E extends TryError = TryError> = T | E;

/**
 * Tuple result for Go-style returns
 */
export type TryTuple<T, E extends TryError = TryError> = [T, null] | [null, E];

/**
 * Type guard for error checking
 */
export function isTryError<E extends TryError>(value: unknown): value is E {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "message" in value &&
    "source" in value &&
    "timestamp" in value
  );
}

/**
 * Extract success type from TryResult
 */
export type TrySuccess<T> = T extends TryError ? never : T;

/**
 * Extract error type from TryResult
 */
export type TryFailure<T> = T extends TryError ? T : never;
```

### 2. Core Functions

```typescript
// src/core/try.ts

/**
 * Execute a synchronous function safely
 */
export function trySync<T, E extends TryError = TryError>(
  fn: () => T,
  errorTransform?: (error: unknown) => E
): TryResult<T, E>;

/**
 * Execute an async function safely
 */
export async function tryAsync<T, E extends TryError = TryError>(
  fn: () => Promise<T>,
  errorTransform?: (error: unknown) => E
): Promise<TryResult<T, E>>;

/**
 * Auto-detect sync/async and handle appropriately
 */
export function tryAuto<T, E extends TryError = TryError>(
  fn: () => T | Promise<T>,
  errorTransform?: (error: unknown) => E
): TryResult<T, E> | Promise<TryResult<T, E>>;

/**
 * Execute with tuple return style
 */
export function tryTuple<T, E extends TryError = TryError>(
  fn: () => T
): TryTuple<T, E>;

export async function tryTupleAsync<T, E extends TryError = TryError>(
  fn: () => Promise<T>
): Promise<TryTuple<T, E>>;
```

### 3. Error Base Class

```typescript
// src/core/error.ts

export abstract class BaseTryError<T extends string = string>
  implements TryError<T>
{
  readonly timestamp: number = Date.now();
  readonly stack?: string;
  readonly source: string;

  constructor(
    readonly type: T,
    readonly message: string,
    readonly context?: Record<string, unknown>,
    readonly cause?: unknown
  ) {
    this.stack = new Error().stack;
    this.source = this.extractSource();
  }

  private extractSource(): string {
    // Extract calling location from stack
    return "unknown";
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      source: this.source,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

/**
 * Create error from unknown thrown value
 */
export function createTryError(thrown: unknown, source?: string): TryError {
  if (isTryError(thrown)) {
    return thrown;
  }

  if (thrown instanceof Error) {
    return {
      type: "Error",
      message: thrown.message,
      stack: thrown.stack,
      source: source || "unknown",
      timestamp: Date.now(),
      cause: thrown,
    };
  }

  return {
    type: "UnknownError",
    message: String(thrown),
    source: source || "unknown",
    timestamp: Date.now(),
    cause: thrown,
  };
}
```

### 4. Composition Utilities

```typescript
// src/utils/pipe.ts

/**
 * Pipe operations with error propagation
 */
export function pipe<T, E extends TryError>(
  initial: TryResult<T, E>
): PipeBuilder<T, E>;

interface PipeBuilder<T, E extends TryError> {
  map<U>(fn: (value: T) => U): PipeBuilder<U, E>;
  mapError<F extends TryError>(fn: (error: E) => F): PipeBuilder<T, F>;
  chain<U, F extends TryError>(
    fn: (value: T) => TryResult<U, F>
  ): PipeBuilder<U, E | F>;
  recover<F extends TryError>(
    errorType: new (...args: any[]) => F,
    fn: (error: F) => T
  ): PipeBuilder<T, Exclude<E, F>>;
  execute(): TryResult<T, E>;
}

/**
 * Async pipe operations
 */
export function pipeAsync<T, E extends TryError>(
  initial: Promise<TryResult<T, E>>
): AsyncPipeBuilder<T, E>;
```

### 5. Pattern Matching

```typescript
// src/utils/match.ts

/**
 * Pattern match on errors
 */
export function match<E extends TryError, R>(error: E): ErrorMatcher<E, R>;

interface ErrorMatcher<E extends TryError, R> {
  with<T extends E["type"], U extends R>(
    type: T,
    handler: (error: Extract<E, { type: T }>) => U
  ): ErrorMatcher<E, R | U>;

  withError<F extends new (...args: any[]) => E, U extends R>(
    ErrorClass: F,
    handler: (error: InstanceType<F>) => U
  ): ErrorMatcher<E, R | U>;

  otherwise<U extends R>(handler: (error: E) => U): R | U;
}
```

### 6. Error Aggregation

```typescript
// src/utils/aggregate.ts

/**
 * Try multiple operations, collecting all results
 */
export async function tryAll<T, E extends TryError>(
  operations: Array<() => Promise<T>>
): Promise<{
  success: T[];
  errors: E[];
}>;

/**
 * Try operations until one succeeds
 */
export async function tryFirst<T, E extends TryError>(
  operations: Array<() => Promise<TryResult<T, E>>>
): Promise<TryResult<T, E[]>>;

/**
 * Race operations, first to complete wins
 */
export async function tryRace<T, E extends TryError>(
  operations: Array<() => Promise<TryResult<T, E>>>
): Promise<TryResult<T, E>>;
```

### 7. Common Error Types

```typescript
// src/errors/common.ts

export class NetworkError extends BaseTryError<"NetworkError"> {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly url?: string,
    context?: Record<string, unknown>
  ) {
    super("NetworkError", message, { ...context, statusCode, url });
  }
}

export class ValidationError extends BaseTryError<"ValidationError"> {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]>,
    context?: Record<string, unknown>
  ) {
    super("ValidationError", message, { ...context, fields });
  }
}

export class TimeoutError extends BaseTryError<"TimeoutError"> {
  constructor(
    message: string,
    public readonly timeout: number,
    context?: Record<string, unknown>
  ) {
    super("TimeoutError", message, { ...context, timeout });
  }
}
```

### 8. React Integration

```typescript
// src/integrations/react/hooks.ts

export interface UseTryResult<T, E extends TryError> {
  data: T | null;
  error: E | null;
  loading: boolean;
  retry: () => void;
}

export function useTry<T, E extends TryError>(
  fn: () => Promise<T>,
  deps?: React.DependencyList
): UseTryResult<T, E>;

export function useTryCallback<T, E extends TryError, Args extends any[]>(
  fn: (...args: Args) => Promise<T>
): [(...args: Args) => Promise<TryResult<T, E>>, UseTryResult<T, E>];
```

### 9. Express Integration

```typescript
// src/integrations/express/middleware.ts

export function tryMiddleware<E extends TryError = TryError>(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler;

export function errorHandler<E extends TryError = TryError>(options?: {
  logger?: (error: E) => void;
  transformer?: (error: E) => any;
}): ErrorRequestHandler;
```

## Implementation Priorities

### Phase 1: Core (Week 1)

1. **Core types and guards**

   - TryError interface
   - Type guards and utilities
   - Result types

2. **Basic try functions**

   - trySync implementation
   - tryAsync implementation
   - Error creation utilities

3. **Testing infrastructure**
   - Unit tests for core functions
   - Type tests
   - Error scenarios

### Phase 2: Enhanced API (Week 2)

1. **Tuple API**

   - tryTuple functions
   - Go-style ergonomics

2. **Error classes**

   - BaseTryError implementation
   - Common error types
   - Error factory functions

3. **Auto detection**
   - tryAuto implementation
   - Promise detection

### Phase 3: Composition (Week 3)

1. **Pipe utilities**

   - Sync pipe builder
   - Async pipe builder
   - Error propagation

2. **Pattern matching**

   - match implementation
   - Type narrowing
   - Exhaustiveness checking

3. **Recovery patterns**
   - recover utilities
   - Retry logic
   - Fallback patterns

### Phase 4: Utilities (Week 4)

1. **Aggregation**

   - tryAll implementation
   - tryFirst/tryRace
   - Error collection

2. **Debug support**
   - Debug logging
   - Development mode
   - Stack trace enhancement

### Phase 5: Integrations (Week 5)

1. **React support**

   - useTry hook
   - useTryCallback
   - Suspense integration

2. **Express support**
   - tryMiddleware
   - Error handler
   - Response helpers

### Phase 6: Polish (Week 6)

1. **Documentation**

   - API reference
   - Getting started guide
   - Migration guide

2. **Performance**

   - Benchmarks
   - Bundle size optimization
   - Tree shaking

3. **Developer Experience**
   - VS Code snippets
   - ESLint rules
   - TypeScript plugin

## Build Configuration

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  }
}
```

### Package Exports

```json
{
  "name": "try-error",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./react": {
      "types": "./dist/integrations/react/index.d.ts",
      "import": "./dist/integrations/react/index.js"
    },
    "./express": {
      "types": "./dist/integrations/express/index.d.ts",
      "import": "./dist/integrations/express/index.js"
    }
  },
  "sideEffects": false
}
```

## Testing Strategy

1. **Unit Tests**

   - Core functionality
   - Error scenarios
   - Type inference

2. **Integration Tests**

   - Framework integrations
   - Real-world scenarios
   - Performance benchmarks

3. **Type Tests**

   - Type inference
   - Error narrowing
   - Generic constraints

4. **Bundle Tests**
   - Tree shaking
   - Size limits
   - Import testing

## Success Metrics

1. **Bundle Size**: < 2KB gzipped for core
2. **Type Coverage**: 100% type-safe API
3. **Performance**: < 5% overhead vs try/catch
4. **Adoption**: Works in any TypeScript project
5. **Learning Curve**: Productive in < 30 minutes
