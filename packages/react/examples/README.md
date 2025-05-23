# @try-error/react Examples

This directory contains comprehensive examples demonstrating how to use try-error with React for type-safe, progressive error handling.

## 📁 Example Categories

### [🚀 Basic Usage](./basic-usage/)

Start here! Simple examples showing core concepts:

- **SimpleCounter.tsx** - Basic error handling with state management
- **TupleExample.tsx** - Go-style tuple error handling

**Learn:** Core try-error patterns, error state management, type-safe error checking

### [🌐 Data Fetching](./data-fetching/)

Async operations and API integration:

- **UserProfile.tsx** - Retry logic, timeouts, loading states
- **ParallelRequests.tsx** - Concurrent operations with `tryAllAsync` and `tryAnyAsync`

**Learn:** Async error handling, retry strategies, parallel execution patterns

### [🛡️ Error Boundaries](./error-boundaries/)

React error boundary integration:

- **ErrorBoundaryDemo.tsx** - Enhanced error boundaries with try-error support

**Learn:** Error boundary patterns, fallback UIs, error reporting integration

### [📝 Forms](./forms/)

Form validation and user input handling:

- **ValidationForm.tsx** - Comprehensive form validation with real-time feedback

**Learn:** Field validation, form-wide validation, error display patterns

## 🎯 Quick Start

1. **Choose your starting point** based on your use case:

   - New to try-error? → Start with [Basic Usage](./basic-usage/)
   - Building APIs/data fetching? → Jump to [Data Fetching](./data-fetching/)
   - Need form validation? → Check out [Forms](./forms/)
   - Want error boundaries? → See [Error Boundaries](./error-boundaries/)

2. **Run the examples** in your React app:

   ```tsx
   import { SimpleCounter } from "@try-error/react/examples/basic-usage/SimpleCounter";

   function App() {
     return <SimpleCounter />;
   }
   ```

3. **Explore the patterns** and adapt them to your needs

## 🔧 Setup Requirements

### Dependencies

```json
{
  "try-error": "^1.0.0",
  "react": ">=16.8.0",
  "react-dom": ">=16.8.0"
}
```

### Styling

Examples use Tailwind CSS classes. You can:

- Install Tailwind CSS in your project
- Replace with your preferred CSS framework
- Use the examples as reference for the logic patterns

### TypeScript

All examples are written in TypeScript and demonstrate:

- Type-safe error handling
- Proper type inference
- Interface definitions for complex data

## 📚 Key Concepts Demonstrated

### Progressive Adoption

- Start with simple `trySync` calls
- Add complexity as needed (retry, timeout, parallel)
- No need to rewrite existing code

### Type Safety

- All errors are properly typed
- No `any` types or type assertions
- Full IntelliSense support

### Performance

- Zero overhead for success cases
- Efficient error handling patterns
- Minimal bundle size impact

### Developer Experience

- Natural JavaScript/React patterns
- Clear error messages and context
- Easy debugging and testing

## 🎨 Example Patterns

### Basic Error Handling

```tsx
const result = trySync(() => riskyOperation());
if (isTryError(result)) {
  setError(result.message);
} else {
  setData(result);
}
```

### Async with Retry

```tsx
const result = await tryAsync(() =>
  retry(() => fetchData(), { maxAttempts: 3 })
);
```

### Form Validation

```tsx
const emailResult = validateEmail(email);
if (isTryError(emailResult)) {
  setFieldError("email", emailResult.message);
}
```

### Parallel Operations

```tsx
const results = await tryAllAsync([
  () => fetchUser(),
  () => fetchPosts(),
  () => fetchComments(),
]);
```

## 🧪 Testing Examples

Each example includes testing patterns:

```tsx
import { render, fireEvent } from "@testing-library/react";
import { SimpleCounter } from "./SimpleCounter";

test("handles counter limits", () => {
  const { getByText } = render(<SimpleCounter />);
  // Test error handling behavior
});
```

## 🚀 Next Steps

After exploring these examples:

1. **Integrate into your app** - Copy patterns that fit your use cases
2. **Customize error types** - Create domain-specific error types
3. **Add error reporting** - Integrate with Sentry, LogRocket, etc.
4. **Build custom hooks** - Create reusable error handling hooks
5. **Explore advanced patterns** - Check out the main try-error documentation

## 🤝 Contributing

Found an issue or want to add an example?

- Open an issue on GitHub
- Submit a pull request
- Share your use cases and patterns

## 📖 Additional Resources

- [try-error Documentation](../../README.md)
- [React Integration Guide](../README.md)
- [API Reference](../../docs/api.md)
- [Best Practices](../../docs/best-practices.md)

---

**Happy error handling!** 🎉
