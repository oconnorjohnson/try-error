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

### Experiment 1: Minimal Async Wrapper

```typescript
// Code for experiment
```

**Results**:

### Experiment 2: [Title]

```typescript
// Code for experiment
```

**Results**:

## 📈 Progress Tracking

| Date    | Overhead  | Change | Notes                    |
| ------- | --------- | ------ | ------------------------ |
| Initial | +184-234% | -      | Baseline measurement     |
| TBD     | TBD       | TBD    | After first optimization |

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

1. [ ] Review tryAsync implementation in detail
2. [ ] Set up CPU profiling environment
3. [ ] Create isolated micro-benchmarks
4. [ ] Research V8 async optimizations
5. [ ] Test with different Node.js versions
6. [ ] Compare with other libraries' approaches
7. [ ] Experiment with alternative implementations

## 🏁 Success Criteria

- Reduce async overhead to <20% (from current 184-234%)
- Maintain all current functionality
- No breaking changes to API
- Document all trade-offs clearly

## 📋 Notes

_Space for additional notes, observations, and ideas during the investigation_

---

**Last Updated**: [Date]
**Investigator**: [Name]
**Status**: 🔴 Not Started
