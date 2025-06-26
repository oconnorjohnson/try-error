# Async Overhead Investigation

## 🚨 Problem Statement

Our benchmarks show that `tryAsync` has a **184-234% overhead** compared to native async/await, which is significantly higher than our sync overhead of only 1-5%. This is concerning and needs investigation.

## 📊 Initial Observations

### Benchmark Results

```
Standard benchmark (index.ts):
- Native async/await: 5.00ms (100k iterations)
- tryAsync: 14.23ms (100k iterations)
- Overhead: +184.41%

Library comparison (compare.ts):
- Native async/await: 5.08ms
- tryAsync: 16.96ms
- Overhead: +233.8%
```

### Context

- Sync operations have only 1-5% overhead
- Error path can even be FASTER than native (-6% to -28%)
- Memory usage is efficient (2.67 bytes per error)
- The async overhead is our biggest performance issue

## 🤔 Initial Hypotheses

### H1: Promise Wrapping Overhead

- `tryAsync` wraps the promise in additional error handling
- Each promise resolution goes through extra layers
- Native async/await might have JIT optimizations we're missing

### H2: Error Transformation Cost

- Converting thrown errors to TryErrors in async context
- Possible repeated error creation/transformation

### H3: Async Context Loss

- Loss of V8 optimization due to our wrapper
- Breaking the async/await optimization chain

### H4: Measurement Artifact

- Small absolute times (5ms for 100k) might amplify percentage
- Need to verify with longer-running async operations

## 🔍 Investigation Plan

### Phase 1: Profiling Current Implementation

1. **Examine tryAsync implementation**

   - [ ] Review the current code
   - [ ] Identify all operations in the async path
   - [ ] Count function calls and object allocations

2. **CPU Profiling**

   - [ ] Run with Node.js profiler
   - [ ] Identify hot spots
   - [ ] Compare native vs tryAsync flame graphs

3. **Micro-benchmarks**
   - [ ] Test just promise wrapping
   - [ ] Test error catching in async
   - [ ] Test with different promise complexities

### Phase 2: Comparative Analysis

1. **Other Libraries**

   - [ ] How does neverthrow handle async?
   - [ ] What about fp-ts Task?
   - [ ] Any libraries with better async performance?

2. **V8 Optimizations**
   - [ ] Research V8's async/await optimizations
   - [ ] Check if we're deoptimizing somehow
   - [ ] Test with different Node versions

### Phase 3: Optimization Experiments

1. **Minimal Async Wrapper**

   - [ ] Create bare minimum async wrapper
   - [ ] Measure overhead of each added feature
   - [ ] Find the expensive operations

2. **Alternative Implementations**
   - [ ] Try different promise handling approaches
   - [ ] Test with native Promise methods
   - [ ] Experiment with async generators?

## 📝 Investigation Log

### Entry 1: Initial Code Review (Date: Dec 2024)

Looking at the `tryAsync` implementation in `src/async.ts`:

- The function wraps the promise in a try-catch block
- Supports optional timeout and AbortSignal features
- Uses Promise.race for timeout/abort functionality
- Creates TryError objects on failure using `fromThrown`

Key observations:

1. Even without timeout/signal, there's significant overhead
2. The main function has multiple code paths for different options
3. Error creation goes through `fromThrown` which may be expensive

### Entry 2: Micro-benchmark Results (Date: Dec 2024)

Created `async-micro-benchmark.ts` to isolate overhead sources:

**Results:**

```
Native async/await: 5.15ms (baseline)
Function wrapping: 28.36ms (+451.0%)
Promise.race (single): 17.53ms (+240.6%)
Try-catch wrapper: 5.21ms (+1.2%)
Minimal tryAsync: 11.35ms (+120.5%)
Ultra-minimal tryAsync: 11.86ms (+130.4%)
Full tryAsync: 15.55ms (+202.1%)
```

**SHOCKING DISCOVERY: The function wrapping alone adds 451% overhead!**

This is completely unexpected. Simply wrapping `Promise.resolve(42)` in a function and calling it is dramatically slower than the direct call. This suggests a V8 optimization issue.

## 💡 Findings

### Finding 1: Function Wrapping Creates Massive Overhead

**Impact**: High
**Details**:

- Wrapping `Promise.resolve(42)` in a function adds 451% overhead
- This accounts for most of the tryAsync overhead
- The issue appears to be V8 optimization related

**Evidence**:

```
Direct call: await Promise.resolve(42) // 5.15ms for 100k
Wrapped: const fn = () => Promise.resolve(42); await fn() // 28.36ms
```

### Finding 2: Promise.race Also Adds Significant Overhead

**Impact**: Medium
**Details**:

- Even with a single promise, Promise.race adds 240% overhead
- This is used in tryAsync for timeout/abort support
- Should be avoided when not needed

**Evidence**:

```
await Promise.race([Promise.resolve(42)]) // 17.53ms vs 5.15ms baseline
```

### Finding 3: Try-Catch Has Minimal Impact

**Impact**: Low
**Details**:

- Adding try-catch around await only adds 1.2% overhead
- This is not the source of our performance issues
- The overhead comes from function calls and promise manipulation

### Entry 3: Function Overhead Deep Dive (Date: Dec 2024)

Created `async-function-overhead.ts` to investigate why function wrapping is so expensive:

**Critical Discovery:**

```
Direct Promise.resolve: 4.94ms (baseline)
Pre-defined arrow function: 5.12ms (+3.6%)
Arrow function (created in loop): 28.10ms (+468.8%)
Pre-defined async function: 4.92ms (-0.5%)
```

**The problem is creating functions inside loops!** Pre-defined functions have almost no overhead.

## 🎯 Optimization Opportunities

### Opportunity 1: Pre-define tryAsync Internal Functions

**Potential Impact**: 90%+ reduction (from 200% to <10%)
**Complexity**: Low
**Trade-offs**:

- Need to restructure tryAsync to avoid creating functions in the hot path
- May need to pass more parameters around

**Evidence**: Pre-defined functions only add 3.6% overhead vs 468.8% for inline functions

### Opportunity 2: Avoid Promise.race When Not Needed

**Potential Impact**: 20-30% reduction
**Complexity**: Low
**Trade-offs**:

- Need conditional logic to check if timeout/signal are provided
- Slightly more complex code paths

**Evidence**: Promise.race adds 240% overhead even with single promise

### Opportunity 3: Use Async Functions Instead of Promise-Returning Functions

**Potential Impact**: Minor (5-10%)
**Complexity**: Medium
**Trade-offs**:

- Need to ensure compatibility
- May affect error handling slightly

**Evidence**: Pre-defined async functions are slightly faster than arrow functions returning promises

## 🧪 Experiments

### Experiment 1: Optimized tryAsync Implementation

Created optimized versions that:

- Pre-define helper functions to avoid creation in hot path
- Skip Promise.race when no timeout/signal
- Ultra-minimal version with just try-catch

**Results**:

```
Native baseline: 5.16ms
Original tryAsync: +146.4%
Optimized tryAsync: +147.3% (no improvement!)
Ultra-optimized: +118.7% (11.3% better)
```

**Conclusion**: The overhead is NOT primarily from function creation inside tryAsync. The ultra-minimal version still has 118% overhead!

### Experiment 2: The Real Culprit Investigation

The problem appears to be that passing a function to another async function breaks V8's optimization. Even this minimal wrapper has huge overhead:

```typescript
async function wrapper<T>(fn: () => Promise<T>): Promise<T> {
  return await fn();
}
```

This suggests the issue is fundamental to how V8 optimizes async/await with function parameters.

### Experiment 3: Alternative API Approaches

Tested different API designs that don't involve passing functions:

**Results**:

```
Native async/await: 5.11ms (baseline)
Original tryAsync: +145.0% (passing function)
tryPromise: +101.7% (passing promise directly)
tryThen: +64.2% (using promise.then)
Inline try-catch: +0.3% (baseline check)
```

**BREAKTHROUGH**: Using `promise.then()` instead of async/await reduces overhead from 145% to 64%!

## 📈 Progress Tracking

| Date            | Overhead  | Change | Notes                     |
| --------------- | --------- | ------ | ------------------------- |
| Initial         | +184-234% | -      | Baseline measurement      |
| Dec 2024        | +145%     | -39%   | More accurate measurement |
| Optimization 1  | +118%     | -27%   | Ultra-minimal tryAsync    |
| Alternative API | +64%      | -81%   | Using promise.then()      |

## 🤓 Learning Resources

### V8 Async Optimization

- [Link to V8 blog posts]
- [Link to Node.js internals]

### Promise Performance

- [Link to performance articles]
- [Link to benchmarking guides]

### Similar Issues

- [Link to similar investigations]
- [Link to library discussions]

## 🎬 Action Items

1. [x] Review tryAsync implementation in detail
2. [ ] Set up CPU profiling environment
3. [x] Create isolated micro-benchmarks
4. [ ] Research V8 async optimizations
5. [ ] Test with different Node.js versions
6. [ ] Compare with other libraries' approaches
7. [x] Experiment with alternative implementations

## 🏁 Success Criteria

- Reduce async overhead to <20% (from current 184-234%) ❌ (Got to 64%)
- Maintain all current functionality ✅
- No breaking changes to API ❓ (May need new API)
- Document all trade-offs clearly ✅

## 📋 Implementation Plan: Async Performance Optimization

### Phase 1: Core Performance APIs (Priority: HIGH)

#### 1.1 Add `tryPromise` - The Fast Path

```typescript
/**
 * Fast async error handling for promises (64% overhead vs 145%)
 * Use this when you already have a promise
 */
export function tryPromise<T>(
  promise: Promise<T>
): Promise<TryResult<T, TryError>> {
  return promise.then(
    (value) => value,
    (error) => fromThrown(error)
  );
}

// Usage:
const result = await tryPromise(fetch("/api/data"));
```

#### 1.2 Add `tryAwait` - Convenience Alias

```typescript
/**
 * Alias for tryPromise with a more intuitive name
 * Makes migration easier: just add "try" before "await"
 */
export const tryAwait = tryPromise;

// Usage:
const result = await tryAwait(fetch("/api/data"));
```

#### 1.3 Optimize `tryAsync` for Common Case

```typescript
/**
 * Optimized tryAsync that uses fast path when no options provided
 */
export function tryAsync<T>(
  fn: () => Promise<T>,
  options?: TryAsyncOptions
): Promise<TryResult<T, TryError>> {
  // Fast path: no options
  if (!options) {
    try {
      // Execute function immediately and use tryPromise
      return tryPromise(fn());
    } catch (error) {
      // Handle sync errors from fn()
      return Promise.resolve(fromThrown(error));
    }
  }

  // Slow path: with options (timeout, signal, etc.)
  return tryAsyncWithOptions(fn, options);
}
```

### Phase 2: Advanced Patterns (Priority: MEDIUM)

#### 2.1 Lazy Evaluation Pattern

```typescript
/**
 * Returns a lazy wrapper that only executes when awaited
 * Allows building error handling chains without immediate execution
 */
export function tryLazy<T>(fn: () => Promise<T>): {
  then: Promise<TryResult<T>>["then"];
  catch: Promise<TryResult<T>>["catch"];
  finally: Promise<TryResult<T>>["finally"];
  with: (options: TryAsyncOptions) => Promise<TryResult<T>>;
} {
  return {
    then: (onFulfilled, onRejected) =>
      tryPromise(fn()).then(onFulfilled, onRejected),
    catch: (onRejected) => tryPromise(fn()).catch(onRejected),
    finally: (onFinally) => tryPromise(fn()).finally(onFinally),
    with: (options) => tryAsync(fn, options),
  };
}

// Usage:
const result = await tryLazy(() => fetch("/api/data"));
const resultWithTimeout = await tryLazy(() => fetch("/api/data")).with({
  timeout: 5000,
});
```

#### 2.2 Chainable API

```typescript
/**
 * Fluent API for building async error handling chains
 */
export class TryChain<T> {
  constructor(private promise: Promise<TryResult<T>>) {}

  map<U>(fn: (value: T) => U): TryChain<U> {
    return new TryChain(
      this.promise.then((result) =>
        isTryError(result) ? result : trySync(() => fn(result))
      )
    );
  }

  flatMap<U>(fn: (value: T) => Promise<U>): TryChain<U> {
    return new TryChain(
      this.promise.then((result) =>
        isTryError(result) ? result : tryPromise(fn(result))
      )
    );
  }

  recover(fn: (error: TryError) => T): TryChain<T> {
    return new TryChain(
      this.promise.then((result) => (isTryError(result) ? fn(result) : result))
    );
  }

  get(): Promise<TryResult<T>> {
    return this.promise;
  }
}

export function tryChain<T>(promise: Promise<T>): TryChain<T> {
  return new TryChain(tryPromise(promise));
}

// Usage:
const result = await tryChain(fetch("/api/user"))
  .flatMap((response) => response.json())
  .map((user) => user.name)
  .recover((error) => "Anonymous")
  .get();
```

### Phase 3: Migration Strategy (Priority: HIGH)

#### 3.1 Compatibility Layer

```typescript
/**
 * Smart auto-detection for gradual migration
 */
export function tryAuto<T>(
  input: (() => Promise<T>) | Promise<T>,
  options?: TryAsyncOptions
): Promise<TryResult<T, TryError>> {
  // If it's a promise, use fast path
  if (input && typeof input.then === "function") {
    if (options?.timeout || options?.signal) {
      // Need to wrap with timeout/signal support
      return tryAsync(() => input as Promise<T>, options);
    }
    return tryPromise(input as Promise<T>);
  }

  // If it's a function, use traditional path
  return tryAsync(input as () => Promise<T>, options);
}
```

#### 3.2 ESLint Rule

```typescript
// Custom ESLint rule to suggest performance improvements
export const preferTryPromise = {
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.name === "tryAsync" &&
          node.arguments[0]?.type === "ArrowFunctionExpression" &&
          node.arguments[0].body.type === "CallExpression" &&
          !node.arguments[1] // No options
        ) {
          context.report({
            node,
            message: "Consider using tryPromise for better performance",
            fix(fixer) {
              const fnBody = node.arguments[0].body;
              return fixer.replaceText(
                node,
                `tryPromise(${context.getSourceCode().getText(fnBody)})`
              );
            },
          });
        }
      },
    };
  },
};
```

### Phase 4: Documentation & Communication (Priority: HIGH)

#### 4.1 Performance Guide

Create a dedicated performance guide explaining:

- When to use each function (decision tree)
- Performance characteristics of each approach
- Migration examples
- Benchmarks for different scenarios

#### 4.2 API Reference Update

```typescript
/**
 * tryAsync - Full-featured async error handling (145% overhead)
 * Best for: Complex scenarios with timeout/cancellation
 *
 * tryPromise - Fast promise error handling (64% overhead)
 * Best for: Simple promise wrapping, performance-critical code
 *
 * tryAwait - Alias for tryPromise
 * Best for: Drop-in replacement for await
 *
 * tryLazy - Deferred execution pattern
 * Best for: Building reusable error handling chains
 */
```

### Phase 5: Internal Optimizations (Priority: LOW)

#### 5.1 Optimize Existing tryAsync

```typescript
// Cache commonly used functions
const identityFn = <T>(x: T) => x;
const getError = (e: unknown) => fromThrown(e);

// Pre-compile timeout error messages
const timeoutError = (ms: number) =>
  new Error(`Operation timed out after ${ms}ms`);

// Use Promise.then internally where possible
export async function tryAsyncOptimized<T>(
  fn: () => Promise<T>,
  options?: TryAsyncOptions
): Promise<TryResult<T, TryError>> {
  if (!options?.timeout && !options?.signal) {
    // Use then-based approach for simple case
    try {
      return fn().then(identityFn, getError);
    } catch (syncError) {
      return Promise.resolve(fromThrown(syncError));
    }
  }

  // Complex case with timeout/signal
  // ... existing implementation
}
```

### Implementation Priority & Timeline

1. **Week 1**: Implement tryPromise/tryAwait (Phase 1.1-1.2)
2. **Week 2**: Optimize tryAsync & add tests (Phase 1.3)
3. **Week 3**: Documentation & migration guide (Phase 4)
4. **Week 4**: Advanced patterns (Phase 2)
5. **Week 5**: Migration tools & internal optimizations (Phase 3 & 5)

### Success Metrics

- [ ] tryPromise achieves <70% overhead (currently 64%)
- [ ] tryAsync optimized path achieves <100% overhead (from 145%)
- [ ] Zero breaking changes to existing API
- [ ] Clear migration path documented
- [ ] Performance regression tests in place

## 🎯 Key Learnings

1. **V8 doesn't optimize async functions that take function parameters well**

   - Creating functions inline makes it worse (468% overhead)
   - But even pre-defined functions have issues (118% overhead)

2. **Promise.then() is significantly faster than async/await for wrappers**

   - 64% overhead vs 145% overhead
   - This is a 55% performance improvement

3. **The overhead is NOT from our error handling**

   - It's from the async function wrapper pattern itself
   - Even minimal wrappers have huge overhead

4. **Alternative API designs can help**
   - Passing promises directly instead of functions
   - Using .then() chains instead of async/await
   - Providing multiple APIs for different use cases

## 🔍 Root Cause Analysis (with External Insights)

### Why We See High Overhead

After consulting with ChatGPT about async/await performance, we discovered:

1. **We're using Node v23.11.0** - Latest version with all V8 optimizations
2. **TypeScript target is ES2020** - Native async/await, no transpilation
3. **No polyfills or shims** - Using native Promise implementation

### The Real Issue: Tight Loop Benchmarking

Our benchmarks show high overhead because we're measuring **pathological cases**:

1. **Tight Loop Magnification**

   - We're measuring empty async operations in tight loops
   - Each await creates/destroys microtask queue entries
   - No real work to amortize the overhead

2. **Function Creation Pattern**

   ```typescript
   // This pattern in tryAsync creates overhead:
   await tryAsync(() => somePromise); // Creates new function each call
   ```

3. **Microtask Queue Overhead**
   - Each await = microtask enqueue/dequeue
   - In tight loops, this dominates runtime
   - With real I/O or CPU work, becomes negligible

### Proof from Loop Pattern Benchmark

Created `async-loop-pattern.ts` to test this hypothesis:

```
Tight Loop (no work):
- Function creation: 537% overhead
- Promise.then: -3.3% (slightly faster than async/await)

With CPU Work:
- Function creation: -36.2% (variance, essentially equal)
- Work dominates: 375,644% of runtime

With I/O (1ms delays):
- Function creation: 1.2% overhead (negligible)
```

### Key Insight: It's Not a Bug, It's a Benchmark Artifact

The overhead we're seeing is **expected behavior** for tight loops with no real work. In real-world scenarios:

- **API calls**: Network latency dominates (10-1000ms vs 0.001ms overhead)
- **Database queries**: I/O dominates (1-100ms)
- **File operations**: Disk I/O dominates (0.1-10ms)
- **CPU-intensive work**: Computation dominates

### Updated Recommendations

1. **Still implement tryPromise/tryAwait** - For users who need maximum performance in edge cases
2. **Document the performance characteristics** - Be transparent about when it matters
3. **Optimize tryAsync for common case** - Use tryPromise internally when no options
4. **Provide guidance** - Help users choose the right API for their use case

---

**Last Updated**: Dec 2024
**Investigator**: AI Assistant with ChatGPT consultation
**Status**: ✅ Root Cause Understood - Implementation Plan Ready
