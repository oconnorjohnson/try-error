# try-error

> Lightweight, progressive, type-safe error handling for TypeScript

[![npm version](https://img.shields.io/npm/v/try-error.svg)](https://www.npmjs.com/package/try-error)
[![npm downloads](https://img.shields.io/npm/dm/try-error.svg)](https://www.npmjs.com/package/try-error)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/try-error)](https://bundlephobia.com/package/try-error)
[![gzip size](https://img.badgesize.io/https://unpkg.com/try-error/dist/index.js?compression=gzip&label=gzip%20size)](https://unpkg.com/try-error/dist/index.js)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/danieljohnson/try-error/blob/main/CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/try-error/alpha)](https://www.npmjs.com/package/try-error)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/danieljohnson/try-error/graphs/commit-activity)
[![Dependencies](https://img.shields.io/librariesio/release/npm/try-error)](https://libraries.io/npm/try-error)

⚠️ **Alpha Version**: This library is currently in alpha and APIs may change. Not recommended for production use yet.

## Why try-error?

Traditional error handling in JavaScript forces you to choose between:

- **try/catch blocks**: Clunky syntax, no type safety, hidden control flow
- **Functional libraries**: Heavy abstractions, steep learning curve, large bundle size

**try-error** provides a middle ground:

- ✅ **Errors as values** - Explicit error handling without exceptions
- ✅ **Zero overhead** - Success values are returned directly
- ✅ **Type safe** - Full TypeScript support with type inference
- ✅ **Progressive** - Start simple, add complexity as needed
- ✅ **Tiny** - 4.7KB minified + gzipped (core), 3.1KB (React)
- ✅ **Familiar** - Looks and feels like JavaScript

## Installation

```bash
npm install try-error
# or
yarn add try-error
# or
pnpm add try-error
```

## Quick Start

```typescript
import { trySync, tryAsync, isTryError } from "try-error";

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

| Feature        | try-error | fp-ts    | neverthrow | native try/catch |
| -------------- | --------- | -------- | ---------- | ---------------- |
| Type Safety    | ✅ Full   | ✅ Full  | ✅ Full    | ❌ None          |
| Bundle Size    | 4.7KB     | ~50KB    | ~12KB      | 0KB              |
| Learning Curve | Low       | High     | Medium     | Low              |
| Zero Overhead  | ✅ Yes    | ❌ No    | ❌ No      | ✅ Yes           |
| Async Support  | ✅ Yes    | ✅ Yes   | ✅ Yes     | ✅ Yes           |
| Error Context  | ✅ Rich   | ❌ Basic | ❌ Basic   | ❌ Basic         |

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

- [Documentation](https://try-error.dev)
- [GitHub Repository](https://github.com/danieljohnson/try-error)
- [npm Package](https://www.npmjs.com/package/try-error)
- [Issue Tracker](https://github.com/danieljohnson/try-error/issues)
