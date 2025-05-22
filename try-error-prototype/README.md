# try-error

> Lightweight, progressive, type-safe error handling for TypeScript

## 🚧 Prototype Status

This is an early prototype to validate the core concepts. Not ready for production use.

## Why try-error?

- **Type-safe errors** without the complexity
- **Zero runtime overhead** for success cases
- **Progressive adoption** - use it where you need it
- **Feels like JavaScript** - no monads, no functors
- **Rich error context** - stack traces, timestamps, and more

## Quick Example

```typescript
import { tryAsync, isTryError } from "try-error";

// Type-safe error handling
const result = await tryAsync(() => fetch("/api/user"));
if (isTryError(result)) {
  console.error(`Error: ${result.message}`);
  return;
}

// result is fully typed as Response
console.log(result.status);
```

## Development

```bash
npm install        # Install dependencies
npm test          # Run tests
npm run build     # Build the project
npm run dev       # Watch mode
```

## License

MIT
