# @try-error/react

> React hooks and components for type-safe error handling with @try-error/core

[![npm version](https://img.shields.io/npm/v/@try-error/react.svg)](https://www.npmjs.com/package/@try-error/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-16.8%2B-61dafb)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@try-error/react` provides React-specific utilities for the [@try-error/core](https://www.npmjs.com/package/@try-error/core) error handling library. It includes:

- 🪝 **Custom hooks** for error-safe state and async operations
- 🛡️ **Error boundaries** with automatic error recovery
- 🔄 **Retry logic** with exponential backoff
- 📊 **Loading states** with proper TypeScript inference
- 🎯 **Form validation** with field-level error handling

## Installation

```bash
# Install both packages
npm install @try-error/core @try-error/react

# Or install React package only (core is a peer dependency)
npm install @try-error/react
```

## Quick Start

```tsx
import { useTry } from '@try-error/react';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, error, loading, retry } = useTry(
    () => fetchUser(userId),
    [userId]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## Key Features

### Async Data Fetching
```tsx
const { data, error, loading, retry } = useTry(
  async () => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
  [id] // Dependencies array like useEffect
);
```

### Error-Safe State Management
```tsx
const [count, setCount, error] = useTryState(0);

const increment = () => {
  setCount(prev => {
    if (prev >= 10) throw new Error('Count too high!');
    return prev + 1;
  });
};
```

### Safe Callbacks
```tsx
const [handleSubmit, { loading, error }] = useTryCallback(
  async (formData: FormData) => {
    const result = await api.submitForm(formData);
    if (!result.ok) throw new Error(result.message);
    return result.data;
  }
);
```

### Error Boundaries
```tsx
import { TryErrorBoundary } from '@try-error/react';

function App() {
  return (
    <TryErrorBoundary
      fallback={({ error, retry }) => (
        <div>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={retry}>Try again</button>
        </div>
      )}
    >
      <YourApp />
    </TryErrorBoundary>
  );
}
```

## Hooks API

- **`useTry`** - Async operations with loading/error states
- **`useTryState`** - Error-safe state management
- **`useTryCallback`** - Wrap callbacks with error handling
- **`useTryMutation`** - Optimistic updates with rollback
- **`useErrorRecovery`** - Custom error recovery strategies

## Documentation

For comprehensive documentation, examples, and API reference, visit:

**📚 [Full Documentation](https://try-error-docs.vercel.app/docs/react/installation)**

### Quick Links
- [React Installation Guide](https://try-error-docs.vercel.app/docs/react/installation)
- [Hooks Reference](https://try-error-docs.vercel.app/docs/react/hooks)
- [Components Reference](https://try-error-docs.vercel.app/docs/react/components)
- [React Examples](https://try-error-docs.vercel.app/docs/examples/react)
- [Full API Documentation](https://try-error-docs.vercel.app/docs/api-reference)

## Requirements

- React 16.8+ (requires hooks support)
- TypeScript 4.5+ (recommended)
- @try-error/core (peer dependency)

## License

MIT © [try-error contributors](https://github.com/oconnorjohnson/try-error)