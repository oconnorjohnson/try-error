# Modular Imports

try-error now supports modular imports to help reduce bundle size when you only need specific functionality.

## Available Entry Points

### Full Bundle (Default)

```typescript
import { trySync, tryAsync, isTryError } from "try-error";
```

- Contains all functionality
- Use when you need both sync and async error handling
- Bundle size: ~13.5KB minified (with all dependencies)

### Sync-Only Module

```typescript
import { trySync, isTryError } from "try-error/sync";
```

- Contains only synchronous error handling functions
- Includes core types, factories, and utilities
- Perfect for Node.js scripts, CLI tools, or browser apps without async operations
- Bundle size: ~3-4KB minified (optimized for sync operations)

### Async-Only Module

```typescript
import { tryAsync, isTryError } from "try-error/async";
```

- Contains only asynchronous error handling functions
- Includes core types and utilities
- Ideal for modern async-first applications
- Bundle size: ~3-4KB minified (optimized for sync operations)

### Core Module

```typescript
import { isTryError, createError } from "try-error/core";
```

- Contains only core types and utilities
- No sync or async operations
- Use when building custom error handling on top of try-error
- Bundle size: ~2.5KB minified

## Usage Examples

### Sync-Only Application

```typescript
// Import only what you need
import { trySync, trySyncTuple, isTryError } from "try-error/sync";

// Use sync functions as normal
const result = trySync(() => JSON.parse(jsonString));
if (isTryError(result)) {
  console.error("Parse failed:", result.message);
}

// Tuple style
const [data, error] = trySyncTuple(() => readFileSync("config.json"));
if (error) {
  console.error("Read failed:", error);
}
```

### Async-Only Application

```typescript
// Import only async functions
import { tryAsync, tryAwait, isTryError } from "try-error/async";

// Use async functions
const result = await tryAsync(async () => {
  const response = await fetch("/api/data");
  return response.json();
});

if (isTryError(result)) {
  console.error("Request failed:", result.message);
}

// With timeout
const timedResult = await withTimeout(
  tryAsync(() => fetch("/api/slow")),
  5000
);
```

### Mixed Usage (Full Bundle)

```typescript
// When you need both sync and async
import { trySync, tryAsync, isTryError } from "try-error";

// Use both sync and async operations
const config = trySync(() => JSON.parse(configString));
const data = await tryAsync(() => fetchUserData());
```

## Bundle Size Comparison

| Import            | Size (minified) | Size (gzipped) | Use Case               |
| ----------------- | --------------- | -------------- | ---------------------- |
| `try-error`       | ~13.5KB         | ~2.7KB         | Full functionality     |
| `try-error/sync`  | ~3-4KB          | ~1.5KB         | Sync-only apps         |
| `try-error/async` | ~3-4KB          | ~1.5KB         | Async-only apps        |
| `try-error/core`  | ~3KB            | ~1KB           | Custom implementations |

## Tree-Shaking Benefits

Modern bundlers (webpack, rollup, esbuild, vite, etc.) will automatically tree-shake unused code. try-error is optimized for tree-shaking:

- **`"sideEffects": false`** in package.json tells bundlers all code is side-effect free
- **ESM builds** are provided for optimal tree-shaking (`import` in package.json exports)
- **Modular imports** allow you to import only what you need

```typescript
// ❌ Less optimal: Even with tree-shaking, may include some unused code
import { trySync } from "try-error";

// ✅ Optimal: Imports only sync functionality, guaranteed smaller bundle
import { trySync } from "try-error/sync";
```

### Tree-Shaking with Default Import

When using the default import (`from "try-error"`), modern bundlers will still tree-shake unused exports. However, using modular imports provides:

1. **Guaranteed smaller bundles** - No chance of accidental inclusion
2. **Faster build times** - Less code to analyze
3. **Clearer intent** - Makes it obvious what your code uses

## TypeScript Support

All entry points are fully typed with TypeScript declarations:

```typescript
// TypeScript will correctly infer types from any entry point
import { tryAsync } from "try-error/async";

const result = await tryAsync<User>(() => fetchUser());
// result is typed as: User | TryError
```

## Migration Guide

To migrate existing code to use modular imports:

1. Identify whether your code uses sync, async, or both
2. Update imports accordingly:

   ```typescript
   // Before
   import { trySync, tryAsync } from "try-error";

   // After (if only using sync)
   import { trySync } from "try-error/sync";

   // After (if only using async)
   import { tryAsync } from "try-error/async";

   // After (if using both - no change needed)
   import { trySync, tryAsync } from "try-error";
   ```

3. Run your build and tests to ensure everything works
4. Check your bundle size to confirm the reduction

## CommonJS Support

All entry points support both ESM and CommonJS:

```javascript
// CommonJS
const { trySync, isTryError } = require("try-error/sync");

// ESM
import { trySync, isTryError } from "try-error/sync";
```

## Browser Usage

For browser usage, we provide pre-bundled ESM files:

```html
<!-- Full bundle -->
<script type="module">
  import { trySync, tryAsync } from "/dist/try-error.esm.js";
</script>

<!-- Sync only -->
<script type="module">
  import { trySync } from "/dist/try-error-sync.esm.js";
</script>

<!-- Async only -->
<script type="module">
  import { tryAsync } from "/dist/try-error-async.esm.js";
</script>
```
