# Data Fetching Examples

This directory contains examples demonstrating async data fetching patterns with try-error in React applications.

## Examples

### UserProfile.tsx

A comprehensive user profile fetcher that demonstrates:

- Async data fetching with `tryAsync`
- Automatic retry with exponential backoff using `retry`
- Request timeout handling with `withTimeout`
- Loading states and error recovery
- Type-safe error handling for network operations

**Key Features:**

- Simulated network delays and failures
- Retry mechanism with configurable attempts
- Timeout protection for slow requests
- User-friendly error messages and retry buttons
- Loading indicators and state management

### ParallelRequests.tsx

A parallel data fetching example that demonstrates:

- `tryAllAsync` - All requests must succeed (fail-fast)
- `tryAnyAsync` - First successful request wins (fallback strategy)
- Concurrent execution for better performance
- Different strategies for different use cases

**Key Features:**

- Multiple concurrent API calls
- Strategy selection (all vs any)
- Graceful handling of partial failures
- Performance comparison between strategies
- Real-world scenarios (post + comments + user data)

## Patterns Demonstrated

### 1. Basic Async Handling

```tsx
const result = await tryAsync(async () => {
  return await fetchUser(userId);
});

if (isTryError(result)) {
  setError(result.message);
} else {
  setUser(result);
}
```

### 2. Retry with Timeout

```tsx
const result = await tryAsync(async () => {
  return await retry(() => withTimeout(fetchUser(id), 5000), {
    maxAttempts: 3,
    delay: 1000,
    backoff: "exponential",
  });
});
```

### 3. Parallel All (Fail-Fast)

```tsx
const result = await tryAllAsync([
  () => fetchPost(postId),
  () => fetchComments(postId),
  () => fetchUser(userId),
]);

if (isTryError(result)) {
  // Any failure fails the whole operation
} else {
  const [post, comments, user] = result;
  // All data available
}
```

### 4. Parallel Any (Fallback)

```tsx
const result = await tryAnyAsync([
  () => fetchFromPrimaryAPI(),
  () => fetchFromSecondaryAPI(),
  () => fetchFromCacheAPI(),
]);

if (isTryError(result)) {
  // All sources failed
} else {
  // First successful result
}
```

## Common Use Cases

### Loading States

- Show loading indicators during async operations
- Disable UI elements during requests
- Provide feedback about operation progress

### Error Recovery

- Automatic retry with exponential backoff
- Manual retry buttons for user-initiated recovery
- Fallback data sources when primary fails

### Performance Optimization

- Parallel requests when data is independent
- Timeout protection for slow operations
- Caching strategies with fallback patterns

### User Experience

- Clear error messages with actionable advice
- Loading states that don't block the UI
- Progressive data loading (show what's available)

## Best Practices

1. **Always handle loading states** - Users need feedback
2. **Provide retry mechanisms** - Network issues are temporary
3. **Use timeouts** - Don't let requests hang indefinitely
4. **Choose the right parallel strategy** - All vs Any based on requirements
5. **Show meaningful error messages** - Help users understand what went wrong
6. **Consider fallback data** - Cached or default data when fresh data fails

## Integration Tips

- Use these patterns with React Query or SWR for caching
- Combine with Suspense for declarative loading states
- Add analytics to track error rates and retry success
- Consider offline scenarios with service workers
