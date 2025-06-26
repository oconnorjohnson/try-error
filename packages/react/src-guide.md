# try-error React Package Source Code Guide

This document provides a comprehensive overview of the try-error React package's source code (`packages/react/src` directory). It serves as a reference for understanding the React-specific integrations, hooks, and components.

## 📁 Directory Structure

```
packages/react/src/
├── index.ts              # Main entry point - exports all React APIs
├── test-setup.ts         # Test configuration file
├── components/           # React components
│   └── TryErrorBoundary.tsx  # Error boundary with try-error integration
├── hooks/                # React hooks for error handling
│   ├── useTry.ts        # Main async hook with AbortController support
│   ├── useTryCallback.ts # Memoized callback wrapper hooks
│   ├── useTryMutation.ts # Mutation hook for data changes
│   └── useTryState.ts   # State management with error handling
└── types/                # TypeScript type definitions
    └── index.ts         # React-specific types and interfaces
```

## 📄 File-by-File Breakdown

### `index.ts` - Main Entry Point

**Purpose**: Central export hub that re-exports core try-error functionality alongside React-specific hooks and components.

**Re-exports from core try-error**:

- Core types: `TryError`, `TryResult`, `TryTuple`, `TrySuccess`, `TryFailure`
- Type guards: `isTryError`, `isTrySuccess`, `isTryFailure`
- Error creation: `createError`, `wrapError`, `fromThrown`
- Sync operations: `trySync`, `trySyncTuple`, `tryCall`, `unwrap`, `unwrapOr`, etc.
- Async operations: `tryAsync`, `tryAsyncTuple`, `tryAwait`, `retry`, `withTimeout`
- Utilities: `transformResult`, `withDefault`, `filterSuccess`, `filterErrors`, etc.
- Factory functions: All error factory utilities

**React-specific exports**:

- All hooks from `./hooks/*`
- All components from `./components/*`
- All types from `./types/*`

---

### `test-setup.ts` - Test Configuration

**Purpose**: Minimal test setup file for Jest and React Testing Library.

**Content**:

- Imports `@testing-library/jest-dom` for enhanced Jest matchers

---

### `components/TryErrorBoundary.tsx` - Error Boundary Component

**Purpose**: Enhanced React Error Boundary with try-error integration, providing retry functionality, custom fallback UIs, and error reporting.

**Key Components**:

#### `TryErrorBoundary` Class Component

**Props** (`TryErrorBoundaryProps`):

- `children: ReactNode` - Components to wrap
- `fallback?: (error, errorInfo, retry) => ReactNode` - Custom error UI
- `onError?: (error, errorInfo) => void` - Error handler callback
- `showRetry?: boolean` - Show retry button (default: true)
- `errorMessage?: string` - Custom error message
- `showErrorDetails?: boolean` - Show details in development
- `className?: string` - CSS class for styling
- `isolate?: boolean` - Prevent error bubbling

**State** (`TryErrorBoundaryState`):

- `hasError: boolean` - Error occurrence flag
- `error: Error | TryError | null` - The caught error
- `errorInfo: ErrorInfo | null` - React error info
- `retryCount: number` - Number of retry attempts

**Key Methods**:

- `getDerivedStateFromError(error)` - Static method for error catching
- `componentDidCatch(error, errorInfo)` - Lifecycle method for error handling
  - Converts regular errors to TryError format
  - Logs detailed error info in development
  - Calls `onError` callback if provided
- `handleRetry()` - Reset state to retry rendering

#### `DefaultErrorFallback` Function Component

Default UI shown when error occurs, featuring:

- Error type detection (TryError vs regular Error)
- Retry button with attempt counter
- Collapsible error details in development
- Styled error display with source location

**Exported Functions**:

- `useErrorBoundaryTrigger()` - Hook to manually trigger error boundaries
- `withTryErrorBoundary(Component, boundaryProps?)` - HOC wrapper

**Example Usage**:

```tsx
<TryErrorBoundary
  fallback={(error, errorInfo, retry) => (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  )}
  onError={(error) => reportError(error)}
>
  <MyComponent />
</TryErrorBoundary>
```

---

### `hooks/useTry.ts` - Main Async Hook

**Purpose**: Primary React hook for managing asynchronous operations with automatic cleanup, abort support, and comprehensive state management.

**Key Exports**:

#### `useTry<T>(asyncFn, options?)` Hook

**Parameters**:

- `asyncFn: (signal: AbortSignal) => Promise<T>` - Async function with abort signal
- `options: UseTryOptions`
  - `immediate?: boolean` - Execute on mount
  - `resetOnExecute?: boolean` - Reset state before execution
  - `deps?: React.DependencyList` - Dependencies for re-execution
  - `abortMessage?: string` - Custom abort message

**Returns** (`UseTryReturn<T>`):

- State properties:
  - `data: T | null` - Success data
  - `error: TryError | null` - Error if failed
  - `isLoading: boolean` - Loading state
  - `isSuccess: boolean` - Success flag
  - `isError: boolean` - Error flag
- Methods:
  - `execute()` - Manually trigger execution
  - `reset()` - Reset to initial state
  - `mutate(data)` - Set data optimistically
  - `abort()` - Cancel in-flight request

**Features**:

- Automatic AbortController management
- Race condition handling with execution IDs
- Component unmount cleanup
- Dependency-based re-execution
- Abort error detection and handling

#### `useTrySync<T>(syncFn, options?)` Hook

Simplified version for synchronous operations without abort support.

**Example Usage**:

```tsx
const { data, error, isLoading, execute, abort } = useTry(
  async (signal) => {
    const response = await fetch(`/api/users/${userId}`, { signal });
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
  },
  { immediate: true, deps: [userId] }
);
```

---

### `hooks/useTryCallback.ts` - Callback Wrapper Hooks

**Purpose**: Provides memoized callbacks with built-in try-error handling, similar to useCallback but with error management.

**Key Exports**:

#### `useTryCallback<TArgs, TReturn>(callback, options?, deps?)` Hook

Creates memoized async callbacks with error handling.

**Options** (`UseTryCallbackOptions`):

- `onError?: (error) => void` - Error handler
- `onSuccess?: (data) => void` - Success handler
- `transformError?: (error) => TryError` - Error transformer
- `transformData?: (data) => T` - Data transformer

#### `useTryCallbackSync<TArgs, TReturn>(callback, options?, deps?)` Hook

Synchronous version of useTryCallback.

#### Utility Hooks:

- `useErrorCallback(errorHandler, deps?)` - Memoized error handler
- `useSuccessCallback(successHandler, deps?)` - Memoized success handler
- `useResultCallback(resultHandler, deps?)` - Handles both cases
- `useFormSubmitCallback(submitHandler, options?, deps?)` - Form submission wrapper

**Example Usage**:

```tsx
const handleSubmit = useTryCallback(
  async (formData: FormData) => {
    return await submitForm(formData);
  },
  {
    onSuccess: (data) => setSuccessMessage("Form submitted!"),
    onError: (error) => setErrorMessage(error.message),
  },
  [submitForm]
);
```

---

### `hooks/useTryMutation.ts` - Mutation Hook

**Purpose**: Handles data mutations (POST, PUT, DELETE) with try-error integration, similar to React Query's useMutation.

**Key Exports**:

#### `useTryMutation<T, TVariables>(mutationFn, options?)` Hook

**Parameters**:

- `mutationFn: (variables, signal) => Promise<T>` - Mutation function
- `options: UseTryMutationOptions<T>`
  - `onSuccess?: (data) => void`
  - `onError?: (error) => void`
  - `onSettled?: () => void`
  - `abortMessage?: string`

**Returns** (`UseTryMutationResult<T, TVariables>`):

- State: `data`, `error`, `isLoading`, `isSuccess`, `isError`
- Methods:
  - `mutate(variables)` - Execute mutation (void return)
  - `mutateAsync(variables)` - Execute with TryResult return
  - `reset()` - Reset mutation state
  - `abort()` - Cancel in-flight mutation

#### `useFormMutation<T>(submitFn, options?)` Hook

Specialized version for form submissions with event handler.

**Features**:

- Automatic abort controller management
- Component unmount protection
- Abort error detection
- Race condition prevention

**Example Usage**:

```tsx
const { mutate, isLoading, error, abort } = useTryMutation(
  async (userData: CreateUserData, signal: AbortSignal) => {
    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
      signal,
    });
    if (!response.ok) throw new Error("Failed to create user");
    return response.json();
  },
  {
    onSuccess: (user) => {
      toast.success(`User ${user.name} created!`);
      router.push(`/users/${user.id}`);
    },
  }
);
```

---

### `hooks/useTryState.ts` - State Management Hook

**Purpose**: Enhanced useState with built-in error handling for state updates.

**Key Exports**:

#### `useTryState<T>(initialValue)` Hook

**Returns**:

- `[state: T, setState: Function, error: TryError | null, clearError: Function]`

**Features**:

- Wraps state updates in try-catch
- Supports function updaters
- Tracks errors from state updates
- Provides error clearing function

#### `useStateWithError<T>(initialValue)` Hook

Simpler version that tracks errors without try-error wrapping.

**Example Usage**:

```tsx
const [data, setData, error, clearError] = useTryState<User>(null);

const updateUser = useCallback(
  (newUser: User) => {
    setData(() => validateUser(newUser)); // Can throw
  },
  [setData]
);
```

---

### `types/index.ts` - React-Specific Type Definitions

**Purpose**: Comprehensive TypeScript definitions for React-specific error handling patterns.

**Key Type Categories**:

#### React Error Types

- `ReactErrorType` - Union of React-specific error types
  - "ComponentError", "RenderError", "EffectError", etc.
- `ReactTryError<T>` - Enhanced TryError with React context
  - `componentName?: string`
  - `componentStack?: string`
  - `componentProps?: Record<string, unknown>`
  - `errorBoundary?: { boundaryName?, retryCount? }`

#### Configuration Types

- `TryReactConfig` - Base React hook configuration

  - `autoRetry?: boolean`
  - `maxRetries?: number`
  - `retryDelay?: number`
  - `transformError?: Function`
  - `transformData?: Function`

- `AsyncTryConfig` - Async-specific configuration

  - `timeout?: number`
  - `cancelOnUnmount?: boolean`
  - `signal?: AbortSignal`

- `FormTryConfig` - Form-specific configuration
  - `validateOnChange?: boolean`
  - `validateOnBlur?: boolean`
  - `validationDelay?: number`
  - `showFieldErrors?: boolean`

#### State Management Types

- `TryState<T>` - Base state interface

  - `data`, `error`, `isLoading`, `isSuccess`, `isError`, `isExecuted`

- `RetryableTryState<T>` - State with retry support

  - `retryCount`, `isRetrying`, `maxRetriesReached`

- `FormTryState<T>` - Form-specific state
  - `fieldErrors`, `isValidating`, `isValid`, `isDirty`, `isSubmitted`

#### Callback and Event Types

- `TryCallbacks<T>` - Lifecycle callbacks

  - `onSuccess`, `onError`, `onStart`, `onComplete`, `onRetry`

- `TryEventHandlers<T>` - React event handlers
  - `onSubmit`, `onClick`, `onChange`, `onBlur`

#### Error Boundary Types

- `ErrorBoundaryProps` - Props for error boundary
- `ErrorBoundaryState` - State for error boundary

#### Hook Return Types

- `TryHookReturn<T>` - Base hook return with utilities
- `AsyncTryHookReturn<T>` - Async hook with cancellation
- `FormTryHookReturn<T>` - Form hook with validation

#### Utility Types

- `ExtractTryData<T>` - Extract data type from TryResult
- `ExtractTryError<T>` - Extract error type from TryResult
- `PartialTryState<T, K>` - Partial state with required keys

---

## 🏗️ Architecture Principles

1. **React-First Design**: All hooks and components follow React best practices and conventions
2. **Abort Support**: Every async operation supports proper cleanup via AbortController
3. **Type Safety**: Comprehensive TypeScript types for all React patterns
4. **Memory Safety**: Prevents state updates after unmount
5. **Race Condition Handling**: Execution IDs prevent stale updates
6. **Progressive Enhancement**: Start with basic hooks, add features as needed

## 🔄 Common Usage Patterns

### Data Fetching with Cleanup

```tsx
const UserProfile = ({ userId }) => {
  const { data, error, isLoading, abort } = useTry(
    async (signal) => {
      const response = await fetch(`/api/users/${userId}`, { signal });
      return response.json();
    },
    { immediate: true, deps: [userId] }
  );

  useEffect(() => {
    return () => abort(); // Cleanup on unmount or userId change
  }, [userId, abort]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;
  return <UserDetails user={data} />;
};
```

### Form Handling with Mutations

```tsx
const CreateUserForm = () => {
  const { mutate, isLoading, error } = useTryMutation(
    async (formData: FormData, signal) => {
      return await createUser(formData, { signal });
    },
    {
      onSuccess: (user) => {
        toast.success("User created!");
        navigate(`/users/${user.id}`);
      },
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate(new FormData(e.currentTarget));
      }}
    >
      {/* form fields */}
      {error && <ErrorMessage error={error} />}
      <button disabled={isLoading}>
        {isLoading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
};
```

### Error Boundaries

```tsx
const App = () => (
  <TryErrorBoundary
    fallback={(error, _, retry) => <ErrorPage error={error} onRetry={retry} />}
    onError={(error) => logErrorToService(error)}
  >
    <Router>
      <Routes />
    </Router>
  </TryErrorBoundary>
);
```

## 📊 Hook Feature Comparison

| Hook             | Async | Abort | Auto-Execute | State Mgmt | Memoization |
| ---------------- | ----- | ----- | ------------ | ---------- | ----------- |
| `useTry`         | ✅    | ✅    | ✅           | ✅         | ❌          |
| `useTrySync`     | ❌    | ❌    | ❌           | ✅         | ❌          |
| `useTryCallback` | ✅    | ❌    | ❌           | ❌         | ✅          |
| `useTryMutation` | ✅    | ✅    | ❌           | ✅         | ❌          |
| `useTryState`    | ❌    | ❌    | ❌           | ✅         | ❌          |

## 🔗 Dependencies

```
index.ts
├── try-error (core package)
├── ./hooks/*
├── ./components/*
└── ./types/*

components/TryErrorBoundary.tsx
├── react
└── try-error

hooks/useTry.ts
├── react
└── try-error

hooks/useTryCallback.ts
├── react
└── try-error

hooks/useTryMutation.ts
├── react
└── try-error

hooks/useTryState.ts
├── react
└── try-error

types/index.ts
├── react
└── try-error
```

## 🚀 Key Features

1. **AbortController Integration**: All async hooks support request cancellation
2. **Race Condition Prevention**: Execution IDs ensure only latest results update state
3. **Memory Leak Prevention**: Automatic cleanup on unmount
4. **Type-Safe Error Handling**: Full TypeScript support with discriminated unions
5. **React DevTools Integration**: Hooks are properly named for debugging
6. **SSR Compatible**: Works with server-side rendering
7. **Tree-Shakeable**: Import only what you need

This React package extends try-error's philosophy of lightweight, type-safe error handling to React applications, providing hooks and components that integrate seamlessly with React's component lifecycle and patterns.
