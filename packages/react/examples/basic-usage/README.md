# Basic Usage Examples

This directory contains simple examples demonstrating the core concepts of using try-error with React.

## Examples

### SimpleCounter.tsx

A basic counter component that demonstrates:

- Basic error handling with `trySync`
- Type-safe error checking with `isTryError`
- State management with error states
- Custom error creation with `createError`
- Range validation and user feedback

**Key Concepts:**

- Using `trySync` for synchronous operations
- Error state management in React
- Conditional rendering based on error states

### TupleExample.tsx

A number parsing component that demonstrates:

- Tuple-style error handling with `trySyncTuple`
- Go-style `[value, err]` destructuring
- Multiple validation steps in a single operation
- Different error types for different validation failures

**Key Concepts:**

- Using `trySyncTuple` for Go-style error handling
- Destructuring tuple results
- Multiple validation layers
- Custom error messages

## Running the Examples

These examples are designed to be used within a React application. To use them:

1. Import the component you want to use
2. Ensure you have the `try-error` package installed
3. Add Tailwind CSS for styling (or replace with your preferred styling)

```tsx
import { SimpleCounter } from "./examples/basic-usage/SimpleCounter";
import { TupleExample } from "./examples/basic-usage/TupleExample";

function App() {
  return (
    <div className="space-y-8 p-8">
      <SimpleCounter />
      <TupleExample />
    </div>
  );
}
```

## Key Takeaways

- **Progressive Adoption**: Start with simple `trySync` calls
- **Type Safety**: All errors are properly typed
- **No Wrapping**: Success values are returned directly
- **Flexible Patterns**: Choose between Result-style and tuple-style APIs
- **React Integration**: Works naturally with React state and event handlers
