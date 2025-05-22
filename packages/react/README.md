# @try-error/react

React integration for try-error - type-safe error handling hooks and components.

## 🚀 Quick Start

```bash
npm install @try-error/react
# or
pnpm add @try-error/react
```

```tsx
import React from "react";
import { useTry, TryErrorBoundary } from "@try-error/react";

function UserProfile({ userId }: { userId: string }) {
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useTry(() => fetchUser(userId), { deps: [userId] });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

function App() {
  return (
    <TryErrorBoundary fallback={ErrorFallback}>
      <UserProfile userId="123" />
    </TryErrorBoundary>
  );
}
```

## 🎣 Core Hooks

### `useTry` - Data Fetching

The primary hook for data fetching with automatic error handling, retries, and caching.

```tsx
const { data, error, isLoading, refetch } = useTry(() => fetchUser(userId), {
  deps: [userId],
  retry: 3,
  onError: (error) => toast.error(error.message),
  fallback: (error) => getGuestUser(),
});
```

**Features:**

- ✅ Automatic error handling with type safety
- ✅ Built-in retry logic with exponential backoff
- ✅ Dependency-based refetching
- ✅ Suspense support
- ✅ Fallback data on errors
- ✅ Request cancellation

### `useTryCallback` - Actions & Mutations

Hook for handling user actions like form submissions and API mutations.

```tsx
const {
  execute: submitForm,
  isLoading,
  error,
} = useTryCallback(
  async (formData: FormData) => {
    return await submitUserForm(formData);
  },
  {
    onSuccess: (user) => {
      toast.success("User created!");
      navigate(`/users/${user.id}`);
    },
    onError: (error) => {
      if (isErrorOfType(error, "ValidationError")) {
        setFieldErrors(error.fields);
      }
    },
  }
);
```

**Features:**

- ✅ Optimistic updates with automatic rollback
- ✅ Loading states and error handling
- ✅ Success/error callbacks
- ✅ Type-safe error discrimination

## 🛡️ Error Boundaries

### `TryErrorBoundary` - Type-Safe Error Boundaries

React error boundary with try-error integration and advanced features.

```tsx
<TryErrorBoundary
  fallback={({ error, retry }) => (
    <div>
      <h3>Error: {error.type}</h3>
      <p>{error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  )}
  filter={(error) => isErrorOfType(error, "NetworkError")}
  resetKeys={[userId]}
  onError={(error, errorInfo) => {
    logError(error, errorInfo);
  }}
>
  <UserDashboard userId={userId} />
</TryErrorBoundary>
```

**Features:**

- ✅ Type-safe error handling
- ✅ Error filtering and isolation
- ✅ Automatic reset on prop changes
- ✅ Custom fallback components
- ✅ Error reporting integration

## 🔄 Suspense Integration

Use with React Suspense for declarative loading states:

```tsx
function UserProfile({ userId }: { userId: string }) {
  // No loading state needed - Suspense handles it
  const { data: user } = useTry(() => fetchUser(userId), {
    suspense: true,
    deps: [userId],
  });

  return <div>{user.name}</div>; // user is guaranteed to be defined
}

// Usage
<Suspense fallback={<UserProfileSkeleton />}>
  <UserProfile userId={userId} />
</Suspense>;
```

## 📊 Real-World Examples

### Form Handling with Validation

```tsx
function UserForm({ userId }: { userId?: string }) {
  const [formData, setFormData] = useState<UserFormData>({});

  // Load existing user for editing
  const { data: existingUser } = useTry(() => fetchUser(userId!), {
    enabled: !!userId,
    deps: [userId],
  });

  // Form submission
  const {
    execute: submitForm,
    isLoading,
    error,
  } = useTryCallback(
    async (data: UserFormData) => {
      return userId ? await updateUser(userId, data) : await createUser(data);
    },
    {
      onSuccess: (user) => {
        toast.success(userId ? "User updated" : "User created");
        navigate(`/users/${user.id}`);
      },
      onError: (error) => {
        if (isErrorOfType(error, "ValidationError")) {
          setFieldErrors(error.fields);
        } else {
          toast.error(error.message);
        }
      },
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitForm(formData);
      }}
    >
      {/* Form fields */}

      {error && isErrorOfType(error, "ValidationError") && (
        <ValidationErrorDisplay error={error} />
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

### Optimistic Updates

```tsx
function TodoList() {
  const { data: todos, mutate } = useTry(() => fetchTodos());

  const { execute: deleteTodo } = useTryCallback(
    async (todoId: string) => {
      return await deleteTodoApi(todoId);
    },
    {
      optimisticUpdate: (todoId) => {
        // Remove from UI immediately
        mutate(todos?.filter((todo) => todo.id !== todoId) || []);
      },
      rollback: () => {
        // Restore original data on error
        refetch();
      },
      onSuccess: () => {
        toast.success("Todo deleted");
      },
    }
  );

  return (
    <div>
      {todos?.map((todo) => (
        <div key={todo.id}>
          {todo.title}
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Parallel Data Fetching

```tsx
function UserDashboard({ userId }: { userId: string }) {
  // Fetch multiple resources in parallel
  const { data: user, error: userError } = useTry(() => fetchUser(userId), {
    deps: [userId],
  });

  const { data: posts, error: postsError } = useTry(
    () => fetchUserPosts(userId),
    {
      enabled: !!user, // Wait for user to load first
      deps: [userId],
    }
  );

  const { data: analytics } = useTry(() => fetchUserAnalytics(userId), {
    deps: [userId],
    retry: false, // Don't retry analytics if it fails
    fallback: () => getDefaultAnalytics(),
  });

  if (userError) {
    return <ErrorFallback error={userError} />;
  }

  return (
    <div>
      {user && <UserProfile user={user} />}

      <TryErrorBoundary fallback={PostsErrorFallback}>
        {posts && <PostsList posts={posts} />}
      </TryErrorBoundary>

      {analytics && <AnalyticsDashboard data={analytics} />}
    </div>
  );
}
```

## 🎯 Migration from Other Libraries

### From React Query

```tsx
// Before (React Query)
const { data, error, isLoading, refetch } = useQuery(
  ["user", userId],
  () => fetchUser(userId),
  {
    retry: 3,
    onError: (error) => toast.error(error.message),
  }
);

// After (@try-error/react)
const { data, error, isLoading, refetch } = useTry(() => fetchUser(userId), {
  deps: [userId],
  retry: 3,
  onError: (error) => toast.error(error.message),
});
```

### From SWR

```tsx
// Before (SWR)
const { data, error, isLoading, mutate } = useSWR(`/api/users/${userId}`, () =>
  fetchUser(userId)
);

// After (@try-error/react)
const { data, error, isLoading, mutate } = useTry(() => fetchUser(userId), {
  deps: [userId],
});
```

## 🔧 Configuration

### Global Provider

```tsx
import { TryProvider } from "@try-error/react";

function App() {
  return (
    <TryProvider
      defaultOptions={{
        retry: 3,
        errorBoundary: true,
      }}
      onError={(error) => {
        // Global error handling
        logError(error);
      }}
    >
      <Router>
        <Routes />
      </Router>
    </TryProvider>
  );
}
```

## 📋 API Reference

### Hook Options

```typescript
interface UseTryOptions<T, E extends TryError> {
  // Execution control
  enabled?: boolean;
  suspense?: boolean;

  // Retry logic
  retry?: boolean | number | ((error: E, attempt: number) => boolean);
  retryDelay?: number | ((attempt: number) => number);

  // Callbacks
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: (data: T | null, error: E | null) => void;

  // Error handling
  errorBoundary?: boolean;
  fallback?: (error: E) => T;

  // Dependencies
  deps?: React.DependencyList;
}
```

### Hook Results

```typescript
interface UseTryResult<T, E extends TryError> {
  // Data state
  data: T | null;
  error: E | null;

  // Loading states
  isLoading: boolean;
  isValidating: boolean;
  isStale: boolean;

  // Actions
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
  reset: () => void;

  // Status
  status: "idle" | "loading" | "success" | "error";
  fetchStatus: "idle" | "fetching" | "paused";
}
```

## 🤝 Integration with Base Package

This package seamlessly integrates with the core `@try-error` package:

```tsx
import { createErrorFactory, isErrorOfType } from "@try-error/react";

// Use all core functionality
const createUserError = createErrorFactory<"UserNotFound" | "UserSuspended">(
  "UserError"
);

const { data, error } = useTry(() => fetchUser(userId));

if (error && isErrorOfType(error, "UserError")) {
  // Type-safe error handling
  console.log(error.type); // 'UserNotFound' | 'UserSuspended'
}
```

## 📦 Bundle Size

- Core hooks: ~3KB gzipped
- Error boundary: ~1KB gzipped
- Total: ~4KB gzipped

## 🔗 Links

- [Core Package](../try-error)
- [Documentation](./docs)
- [Examples](./examples)
- [GitHub](https://github.com/try-error/try-error)

## 📄 License

MIT
