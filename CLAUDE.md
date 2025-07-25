# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
`try-error` is a TypeScript library for lightweight, progressive, type-safe error handling. It provides an alternative to traditional try/catch blocks without the overhead of heavy functional programming libraries.

## Common Development Commands

### Building
```bash
pnpm build          # Build both CJS and ESM outputs
pnpm build:cjs      # Build CommonJS only
pnpm build:esm      # Build ESM only
pnpm build:browser  # Build browser bundles
pnpm dev            # Watch mode for development
```

### Testing
```bash
pnpm test           # Run all tests (including workspace packages)
pnpm test:watch     # Run tests in watch mode
pnpm test:types     # Type-check without emitting
pnpm test -- --coverage  # Run with coverage report
```

### Performance & Analysis
```bash
pnpm benchmark      # Run performance benchmarks
pnpm benchmark:minimal  # Run minimal overhead benchmarks
pnpm size           # Check bundle sizes
pnpm analyze        # Analyze bundle with detailed explanation
```

### Documentation
```bash
pnpm docs:api       # Generate API documentation with TypeDoc
cd try-error-docs && pnpm dev  # Run documentation site locally
```

## Architecture & Code Structure

### Repository Layout
- **Monorepo** using pnpm workspaces
- `/src` - Core library source code
- `/packages/react` - React integration package (@try-error/react)
- `/try-error-docs` - Next.js documentation site
- `/tests` - Test files organized by type (critical/, stress/, integration/)
- `/benchmark` - Performance benchmarking suite
- `/llm` - Development memory and AI-related documentation

### Core Design Principles
1. **Zero-overhead success path** - Success values are returned directly without wrapping
2. **Modular imports** - Tree-shakeable exports (sync-only, async-only, core)
3. **Progressive enhancement** - Start simple, add complexity only when needed
4. **Type safety** - Full TypeScript support with automatic type inference
5. **Rich error context** - Automatic debugging info (stack traces, timestamps, source locations)

### Key APIs
```typescript
// Synchronous error handling
trySync(() => riskyOperation())
trySyncTuple(() => riskyOperation())  // Returns [value, error] tuple

// Asynchronous error handling
await tryAsync(async () => await fetch('/api'))
await tryAsyncTuple(async () => await fetch('/api'))

// Type guards
isTryError(result)
isOk(result)
isErr(result)

// React hooks (from @try-error/react)
useTry(() => fetchData())
useTryState(initialValue)
useTryCallback(() => action())
```

### Testing Patterns
- Test files follow `*.test.ts` pattern
- Critical functionality tests in `/tests/critical/`
- Performance/stress tests in `/tests/stress/`
- Integration tests in `/tests/integration/`
- Minimum 90% test coverage requirement (configured in jest.config.js)
- React package tests include SSR, hydration, and concurrent rendering scenarios

### Bundle Size Constraints
- Full bundle: < 8KB minified + gzipped
- Sync-only: < 4KB
- Async-only: < 4KB
- Core-only: < 3KB

### Development Workflow
1. Track progress in `/llm/memory.md` for complex features
2. Run tests in watch mode during development: `pnpm test:watch`
3. Check bundle size impact: `pnpm size`
4. Update API docs after interface changes: `pnpm docs:api`
5. Test React integration changes in both packages

### Important Implementation Details
- The library uses a special `TryError` class that extends native `Error`
- Success values are returned directly (not wrapped) for zero overhead
- Error objects include rich context: stack traces, timestamps, source locations
- React integration includes custom error boundaries and concurrent-safe hooks
- Full SSR/hydration support with proper cleanup and error recovery
- Event system for error lifecycle hooks
- Configuration system supports environment-aware settings