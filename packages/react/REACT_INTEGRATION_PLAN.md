# @try-error/react - React Integration Plan

## 🎯 Vision

Create a React-specific integration for try-error that provides **declarative error handling**, **suspense-compatible data fetching**, and **type-safe error boundaries** while maintaining the zero-overhead philosophy of the base package.

## 📦 Package Structure

```
packages/react/
├── src/
│   ├── hooks/
│   │   ├── useTry.ts              # Core data fetching hook
│   │   ├── useTryCallback.ts      # Callback wrapper hook
│   │   ├── useTryMutation.ts      # Mutation hook
│   │   ├── useTryQuery.ts         # Query hook with caching
│   │   ├── useTryInfinite.ts      # Infinite query hook
│   │   └── index.ts
│   ├── components/
│   │   ├── TryErrorBoundary.tsx   # Type-safe error boundary
│   │   ├── TryProvider.tsx        # Context provider
│   │   ├── TryFallback.tsx        # Default error fallback
│   │   └── index.ts
│   ├── context/
│   │   ├── TryContext.tsx         # Global error handling context
│   │   ├── TryCache.tsx           # Query cache context
│   │   └── index.ts
│   ├── utils/
│   │   ├── suspense.ts            # Suspense integration
│   │   ├── cache.ts               # Simple query cache
│   │   ├── devtools.ts            # React DevTools integration
│   │   └── index.ts
│   ├── types/
│   │   ├── hooks.ts               # Hook-specific types
│   │   ├── components.ts          # Component prop types
│   │   └── index.ts
│   └── index.ts                   # Main exports
├── examples/
│   ├── basic-usage/
│   ├── error-boundaries/
│   ├── data-fetching/
│   ├── forms/
│   └── real-world-app/
├── tests/
│   ├── hooks/
│   ├── components/
│   └── integration/
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

## 🎣 Core Hooks

### 1. `useTry` - Primary Data Fetching Hook

```typescript
interface UseTryOptions<T, E extends TryError> {
  // Execution control
  enabled?: boolean;
  suspense?: boolean;

  // Caching
  staleTime?: number;
  cacheTime?: number;
  cacheKey?: string;

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

function useTry<T, E extends TryError = TryError>(
  queryFn: () => Promise<T>,
  options?: UseTryOptions<T, E>
): UseTryResult<T, E>;
```

**Usage Examples:**

```typescript
// Basic usage
const { data, error, isLoading, refetch } = useTry(() => fetchUser(userId), {
  deps: [userId],
});

// With error handling
const { data, error } = useTry(() => fetchUser(userId), {
  onError: (error) => {
    if (isErrorOfType(error, "NetworkError")) {
      toast.error("Network connection failed");
    }
  },
  retry: 3,
  fallback: (error) => getGuestUser(),
});

// With suspense
const { data } = useTry(() => fetchUser(userId), {
  suspense: true,
  deps: [userId],
});
// No loading state needed - Suspense handles it
```

### 2. `useTryCallback` - Action Hook

```typescript
interface UseTryCallbackOptions<T, E extends TryError> {
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: (data: T | null, error: E | null) => void;

  // Optimistic updates
  optimisticUpdate?: (variables: any) => void;
  rollback?: (variables: any) => void;

  // Error handling
  throwOnError?: boolean;
  errorBoundary?: boolean;
}

interface UseTryCallbackResult<T, E extends TryError, Args extends any[]> {
  // Execute function
  execute: (...args: Args) => Promise<TryResult<T, E>>;

  // State
  data: T | null;
  error: E | null;
  isLoading: boolean;

  // Actions
  reset: () => void;

  // Status
  status: "idle" | "loading" | "success" | "error";
}

function useTryCallback<
  T,
  E extends TryError = TryError,
  Args extends any[] = []
>(
  fn: (...args: Args) => Promise<T>,
  options?: UseTryCallbackOptions<T, E>
): UseTryCallbackResult<T, E, Args>;
```

**Usage Examples:**

```typescript
// Form submission
const {
  execute: submitForm,
  isLoading,
  error,
} = useTryCallback(
  async (formData: FormData) => {
    const result = await submitUserForm(formData);
    return result;
  },
  {
    onSuccess: (user) => {
      toast.success("User created successfully");
      navigate(`/users/${user.id}`);
    },
    onError: (error) => {
      if (isErrorOfType(error, "ValidationError")) {
        setFieldErrors(error.fields);
      }
    },
  }
);

// Delete with optimistic update
const { execute: deleteUser } = useTryCallback(
  async (userId: string) => {
    return await deleteUserApi(userId);
  },
  {
    optimisticUpdate: (userId) => {
      // Remove from UI immediately
      setUsers((users) => users.filter((u) => u.id !== userId));
    },
    rollback: (userId) => {
      // Add back on error
      refetchUsers();
    },
  }
);
```

### 3. `useTryMutation` - Advanced Mutation Hook

```typescript
interface UseTryMutationOptions<T, E extends TryError, Variables> {
  // Cache invalidation
  invalidateQueries?: string[];
  updateQueries?: Record<
    string,
    (oldData: any, newData: T, variables: Variables) => any
  >;

  // Optimistic updates
  optimisticUpdate?: (variables: Variables) => void;
  rollback?: (variables: Variables, error: E) => void;

  // Callbacks
  onMutate?: (variables: Variables) => void;
  onSuccess?: (data: T, variables: Variables) => void;
  onError?: (error: E, variables: Variables) => void;
  onSettled?: (data: T | null, error: E | null, variables: Variables) => void;
}

function useTryMutation<T, E extends TryError = TryError, Variables = void>(
  mutationFn: (variables: Variables) => Promise<T>,
  options?: UseTryMutationOptions<T, E, Variables>
): UseTryCallbackResult<T, E, [Variables]>;
```

### 4. `useTryQuery` - Query Hook with Caching

```typescript
interface UseTryQueryOptions<T, E extends TryError>
  extends UseTryOptions<T, E> {
  queryKey: string | (string | number)[];

  // Cache behavior
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number;

  // Background updates
  refetchInBackground?: boolean;
  keepPreviousData?: boolean;
}

function useTryQuery<T, E extends TryError = TryError>(
  options: UseTryQueryOptions<T, E>
): UseTryResult<T, E>;
```

## 🛡️ Error Boundary Components

### 1. `TryErrorBoundary` - Type-Safe Error Boundary

```typescript
interface TryErrorBoundaryProps {
  children: React.ReactNode;

  // Error handling
  fallback?: React.ComponentType<{ error: TryError; retry: () => void }>;
  onError?: (error: TryError, errorInfo: React.ErrorInfo) => void;

  // Error filtering
  filter?: (error: TryError) => boolean;
  isolate?: boolean; // Prevent error propagation to parent boundaries

  // Reset behavior
  resetKeys?: (string | number)[];
  resetOnPropsChange?: boolean;
}

function TryErrorBoundary(props: TryErrorBoundaryProps): JSX.Element;
```

**Usage Examples:**

```typescript
// Basic error boundary
<TryErrorBoundary fallback={ErrorFallback}>
  <UserProfile userId={userId} />
</TryErrorBoundary>

// Filtered error boundary
<TryErrorBoundary
  filter={(error) => isErrorOfType(error, 'NetworkError')}
  fallback={({ error, retry }) => (
    <div>
      <p>Network error: {error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  )}
>
  <DataTable />
</TryErrorBoundary>

// Auto-reset on prop changes
<TryErrorBoundary resetKeys={[userId]}>
  <UserDashboard userId={userId} />
</TryErrorBoundary>
```

### 2. `TryProvider` - Global Configuration

```typescript
interface TryProviderProps {
  children: React.ReactNode;

  // Global defaults
  defaultOptions?: Partial<UseTryOptions<any, any>>;

  // Error handling
  onError?: (error: TryError) => void;
  errorBoundary?: React.ComponentType<{ error: TryError; retry: () => void }>;

  // Cache configuration
  cache?: TryCache;

  // Development
  devtools?: boolean;
}

function TryProvider(props: TryProviderProps): JSX.Element;
```

## 🔄 Suspense Integration

### Suspense-Compatible Hooks

```typescript
// Automatic suspense when enabled
const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user } = useTry(() => fetchUser(userId), {
    suspense: true,
    deps: [userId],
  });

  // No loading state needed - user is guaranteed to be defined
  return <div>{user.name}</div>;
};

// Usage with Suspense boundary
<Suspense fallback={<UserProfileSkeleton />}>
  <UserProfile userId={userId} />
</Suspense>;
```

### Resource Pattern

```typescript
// Create suspense-compatible resources
const userResource = createTryResource((userId: string) => fetchUser(userId));

const UserProfile = ({ userId }: { userId: string }) => {
  const user = userResource.read(userId);
  return <div>{user.name}</div>;
};
```

## 📊 Caching System

### Simple Query Cache

```typescript
interface TryCacheOptions {
  maxSize?: number;
  defaultStaleTime?: number;
  defaultCacheTime?: number;

  // Persistence
  persist?: boolean;
  storage?: Storage;

  // Background updates
  backgroundRefetch?: boolean;
}

class TryCache {
  get<T>(key: string): T | undefined;
  set<T>(
    key: string,
    data: T,
    options?: { staleTime?: number; cacheTime?: number }
  ): void;
  invalidate(key: string | string[]): void;
  clear(): void;

  // Subscriptions
  subscribe(key: string, callback: (data: any) => void): () => void;
}
```

## 🛠️ Development Tools

### React DevTools Integration

```typescript
// Automatic integration with React DevTools
// Shows query states, cache contents, error history
interface TryDevtools {
  queries: Record<string, QueryState>;
  mutations: MutationState[];
  errors: TryError[];
  cache: Record<string, any>;
}
```

### Debug Components

```typescript
// Development-only debug panel
<TryDebugPanel />

// Query inspector
<TryQueryInspector queryKey="user-123" />

// Error history
<TryErrorHistory />
```

## 🎨 Real-World Examples

### 1. User Dashboard

```typescript
const UserDashboard = ({ userId }: { userId: string }) => {
  // Parallel data fetching
  const { data: user, error: userError } = useTry(() => fetchUser(userId), {
    deps: [userId],
  });

  const { data: posts, error: postsError } = useTry(
    () => fetchUserPosts(userId),
    {
      enabled: !!user,
      deps: [userId],
    }
  );

  const { execute: updateUser, isLoading: isUpdating } = useTryCallback(
    async (updates: Partial<User>) => {
      return await updateUserApi(userId, updates);
    },
    {
      onSuccess: (updatedUser) => {
        // Optimistically update cache
        queryCache.setQueryData(["user", userId], updatedUser);
      },
    }
  );

  if (userError) {
    return <ErrorFallback error={userError} />;
  }

  if (!user) {
    return <UserSkeleton />;
  }

  return (
    <div>
      <UserProfile user={user} onUpdate={updateUser} isUpdating={isUpdating} />

      <TryErrorBoundary fallback={PostsErrorFallback}>
        {posts ? (
          <PostsList posts={posts} />
        ) : postsError ? (
          <PostsErrorFallback error={postsError} />
        ) : (
          <PostsSkeleton />
        )}
      </TryErrorBoundary>
    </div>
  );
};
```

### 2. Form with Validation

```typescript
const UserForm = ({ userId }: { userId?: string }) => {
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
          // Handle field-level validation errors
          setFieldErrors(error.fields);
        } else {
          toast.error(error.message);
        }
      },
    }
  );

  useEffect(() => {
    if (existingUser) {
      setFormData(existingUser);
    }
  }, [existingUser]);

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
};
```

## 📋 Implementation Roadmap

### Phase 1: Core Hooks (Week 1)

- [ ] `useTry` basic implementation
- [ ] `useTryCallback` implementation
- [ ] Basic error boundary component
- [ ] Core types and utilities
- [ ] Unit tests for hooks

### Phase 2: Advanced Features (Week 2)

- [ ] Suspense integration
- [ ] Simple caching system
- [ ] `useTryMutation` with optimistic updates
- [ ] `TryProvider` context
- [ ] Integration tests

### Phase 3: Developer Experience (Week 3)

- [ ] React DevTools integration
- [ ] Debug components
- [ ] Error boundary enhancements
- [ ] Performance optimizations
- [ ] Documentation and examples

### Phase 4: Polish & Ecosystem (Week 4)

- [ ] Real-world examples
- [ ] TypeScript strict mode
- [ ] Bundle size optimization
- [ ] Framework integrations (Next.js, etc.)
- [ ] Community feedback integration

## 🎯 Success Metrics

1. **Developer Experience**: Intuitive API that feels like React
2. **Type Safety**: 100% type-safe error handling in React
3. **Performance**: No unnecessary re-renders or memory leaks
4. **Bundle Size**: < 5KB gzipped for core hooks
5. **Adoption**: Works with existing React patterns
6. **Compatibility**: React 16.8+ (hooks), 18+ (suspense)

## 🔗 Integration with Base Package

The React package will:

- ✅ Import and extend `@try-error` core functionality
- ✅ Maintain the same error types and patterns
- ✅ Add React-specific features without changing core behavior
- ✅ Provide seamless migration from core to React hooks
- ✅ Support all existing error factories and utilities

This creates a cohesive ecosystem where developers can start with the core package and seamlessly add React-specific features as needed.
