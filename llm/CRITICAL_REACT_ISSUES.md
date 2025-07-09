# Critical React Package Issues - July 8, 2025

## Overview

Based on comprehensive test suite analysis, the React package has multiple critical bugs that would cause production failures. Core library is solid (453/453 tests passing), but React integration is broken (11/245 tests failing).

## 🚨 CRITICAL ISSUE #1: Memory Management Crisis

### Test Failures

```
AbortController cleanup failing (expected <10 alive, got 50)
State reference cleanup failing (expected <5 alive, got 40)
Callback reference cleanup failing (expected <10 alive, got 30)
Mutation cache cleanup failing (expected <15 alive, got 392)
```

### Root Cause Analysis

**Problem**: React hook cleanup logic is fundamentally broken across all hooks.

**Location**: Affects multiple files in `packages/react/src/hooks/`:

- `useTry.ts` - AbortController and state cleanup
- `useTryMutation.ts` - Mutation cache and callback cleanup
- `useErrorRecovery.ts` - Error recovery state cleanup
- `useAsyncErrorHandler.ts` - Async error handler cleanup

### Underlying Issues

#### 1. **AbortController Cleanup Failure**

**Location**: `packages/react/src/hooks/useTry.ts` and `useTryMutation.ts`
**Issue**: AbortController references not being properly cleaned up on unmount

**Current Problem**:

```typescript
// AbortController created but cleanup not removing all references
const abortController = new AbortController();
useEffect(() => {
  return () => {
    abortController.abort(); // Not sufficient - reference still exists
  };
}, []);
```

**Fix Required**:

```typescript
// Proper cleanup pattern needed
const abortControllerRef = useRef<AbortController | null>(null);
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null; // Clear reference
    }
  };
}, []);
```

#### 2. **State Reference Cleanup Failure**

**Location**: All hooks in `packages/react/src/hooks/`
**Issue**: State setters and refs not being properly nullified

**Current Problem**:

```typescript
// State and refs maintained after unmount
const [state, setState] = useState();
const stateRef = useRef();
```

**Fix Required**:

```typescript
// Proper cleanup with isMounted pattern
const isMountedRef = useRef(true);
useEffect(() => {
  return () => {
    isMountedRef.current = false;
    // Clear all refs
    stateRef.current = null;
  };
}, []);
```

#### 3. **Callback Reference Cleanup Failure**

**Location**: `packages/react/src/hooks/useTryMutation.ts`
**Issue**: Callback functions maintaining closures over unmounted components

**Current Problem**:

```typescript
// Callbacks not being properly cleaned up
const onSuccess = useCallback(() => {
  // May reference unmounted component
}, [dependency]);
```

**Fix Required**:

```typescript
// Proper cleanup with mount checking
const onSuccess = useCallback(() => {
  if (!isMountedRef.current) return;
  // Safe callback logic
}, [dependency]);
```

#### 4. **Mutation Cache Cleanup Failure**

**Location**: `packages/react/src/hooks/useTryMutation.ts`
**Issue**: Massive cache leak (392 alive vs 15 expected)

**Current Problem**:

```typescript
// Cache not being cleared properly
const cacheRef = useRef(new Map());
```

**Fix Required**:

```typescript
// Proper cache cleanup
useEffect(() => {
  return () => {
    cacheRef.current.clear();
    cacheRef.current = null;
  };
}, []);
```

### Recommended Fixes

#### 1. **Implement Universal Cleanup Pattern**

Create a shared cleanup utility:

**File**: `packages/react/src/hooks/useCleanup.ts`

```typescript
export function useCleanup() {
  const isMountedRef = useRef(true);
  const cleanupRefs = useRef<(() => void)[]>([]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanupRefs.current.forEach((cleanup) => cleanup());
      cleanupRefs.current = [];
    };
  }, []);

  return {
    isMounted: () => isMountedRef.current,
    addCleanup: (cleanup: () => void) => cleanupRefs.current.push(cleanup),
  };
}
```

#### 2. **Fix Each Hook with Proper Cleanup**

Update all hooks to use the cleanup pattern and properly nullify references.

---

## 🚨 CRITICAL ISSUE #2: Event System Integration Failure

### Test Failures

```
expect(eventListener).toHaveBeenCalledWith(
  expect.objectContaining({
    type: "error:created",
    error: expect.objectContaining({
Number of calls: 0
```

### Root Cause Analysis

**Problem**: Core event system not integrated with React components - event listeners never called.

**Location**: Integration between core and React packages

- `packages/react/src/hooks/useTry.ts` - Not emitting events
- `packages/react/src/components/TryErrorBoundary.tsx` - Not emitting events
- Missing bridge between core event system and React

### Underlying Issues

#### 1. **Missing Event Emission in React Hooks**

**Location**: `packages/react/src/hooks/useTry.ts`
**Issue**: Hooks create errors but don't emit events

**Current Problem**:

```typescript
// Error created but no event emitted
const error = createError({ type: "FETCH_ERROR", message: "Failed" });
setError(error);
```

**Fix Required**:

```typescript
import { getGlobalEventEmitter } from "try-error";

const error = createError({ type: "FETCH_ERROR", message: "Failed" });
getGlobalEventEmitter().emit("error:created", { error, source: "useTry" });
setError(error);
```

#### 2. **Missing Event Emission in Error Boundary**

**Location**: `packages/react/src/components/TryErrorBoundary.tsx`
**Issue**: Error boundary catches errors but doesn't emit events

**Current Problem**:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  const tryError = wrapError(error);
  this.setState({ error: tryError });
}
```

**Fix Required**:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  const tryError = wrapError(error);
  getGlobalEventEmitter().emit('error:created', {
    error: tryError,
    source: 'TryErrorBoundary',
    errorInfo
  });
  this.setState({ error: tryError });
}
```

#### 3. **Missing React-Specific Event Types**

**Location**: `packages/react/src/types/index.ts`
**Issue**: No React-specific event types defined

**Fix Required**:

```typescript
export interface ReactErrorEvent {
  type: "error:created" | "error:boundary" | "error:hook";
  error: TryError;
  source: "useTry" | "TryErrorBoundary" | "useErrorRecovery";
  componentStack?: string;
  errorInfo?: ErrorInfo;
}
```

### Recommended Fixes

#### 1. **Create React Event Bridge**

**File**: `packages/react/src/events/bridge.ts`

```typescript
import { getGlobalEventEmitter } from "try-error";
import type { ReactErrorEvent } from "../types";

export function emitReactError(event: ReactErrorEvent) {
  const emitter = getGlobalEventEmitter();
  emitter.emit(event.type, event);
}
```

#### 2. **Update All React Components to Emit Events**

Systematically update all hooks and components to emit appropriate events.

---

## 🚨 CRITICAL ISSUE #3: Error Boundary Race Conditions

### Test Failures

```
expect(onError).toHaveBeenCalledTimes(5);
Received number of calls: 1

expect(onError).toHaveBeenCalledWith(
  expect.objectContaining({
    message: "Concurrent render error"
Number of calls: 0
```

### Root Cause Analysis

**Problem**: Error boundary cannot handle concurrent errors properly - only 1 out of 5 errors handled.

**Location**: `packages/react/src/components/TryErrorBoundary.tsx`

### Underlying Issues

#### 1. **Single Error State Model**

**Location**: `packages/react/src/components/TryErrorBoundary.tsx`
**Issue**: Error boundary can only handle one error at a time

**Current Problem**:

```typescript
interface State {
  error: TryError | null; // Single error only
  errorId: string | null;
}
```

**Fix Required**:

```typescript
interface State {
  errors: TryError[]; // Array of errors
  primaryError: TryError | null;
  errorCount: number;
}
```

#### 2. **Race Condition in Error Handling**

**Location**: `packages/react/src/components/TryErrorBoundary.tsx`
**Issue**: Concurrent `setState` calls causing race conditions

**Current Problem**:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  const tryError = wrapError(error);
  this.setState({ error: tryError }); // Race condition
}
```

**Fix Required**:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  const tryError = wrapError(error);
  this.setState(prevState => ({
    errors: [...prevState.errors, tryError],
    primaryError: prevState.primaryError || tryError,
    errorCount: prevState.errorCount + 1
  }));
}
```

#### 3. **Missing Concurrent Error Handling**

**Location**: `packages/react/src/components/TryErrorBoundary.tsx`
**Issue**: No logic to handle multiple simultaneous errors

**Fix Required**:

```typescript
// Add concurrent error handling
private handleConcurrentErrors = (newError: TryError) => {
  this.setState(prevState => {
    const errors = [...prevState.errors, newError];
    const primaryError = this.determinePrimaryError(errors);
    return { errors, primaryError, errorCount: errors.length };
  });
};
```

### Recommended Fixes

#### 1. **Implement Concurrent Error Queue**

**File**: `packages/react/src/components/TryErrorBoundary.tsx`

```typescript
interface ConcurrentErrorHandler {
  addError(error: TryError): void;
  getPrimaryError(): TryError | null;
  getAllErrors(): TryError[];
  clear(): void;
}
```

#### 2. **Add Error Priority System**

Implement error priority to determine which error to display when multiple occur.

---

## 🚨 CRITICAL ISSUE #4: SSR/Hydration Compatibility

### Test Failures

```
ReferenceError: TextEncoder is not defined
```

### Root Cause Analysis

**Problem**: Missing polyfills for server-side rendering environment.

**Location**: Test environment setup and potentially SSR code

### Underlying Issues

#### 1. **Missing TextEncoder Polyfill**

**Location**: `packages/react/tests/test-setup.ts`
**Issue**: TextEncoder not available in Node.js test environment

**Fix Required**:

```typescript
// Add to test setup
if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
```

#### 2. **Potential SSR Compatibility Issues**

**Location**: Various React components
**Issue**: May be using browser-only APIs

**Fix Required**:

- Audit all React components for browser-only API usage
- Add proper feature detection and polyfills
- Test in actual SSR environment

### Recommended Fixes

#### 1. **Add Proper Test Environment Setup**

**File**: `packages/react/tests/test-setup.ts`

```typescript
// Add all necessary polyfills for SSR testing
import { setupTestEnvironment } from "./utils/test-env";
setupTestEnvironment();
```

#### 2. **Add SSR Compatibility Checks**

Systematic review of all React components for SSR compatibility.

---

## 🚨 CRITICAL ISSUE #5: Pool Integration Not Working

### Test Failures

```
Pool integration tests failing (expected event listeners not triggered)
```

### Root Cause Analysis

**Problem**: Object pooling performance optimizations not working in React context.

**Location**: Integration between core pooling and React hooks

### Underlying Issues

#### 1. **Missing Pool Integration in React Hooks**

**Location**: `packages/react/src/hooks/useTry.ts`
**Issue**: Hooks not using pooled errors

**Current Problem**:

```typescript
// Direct error creation, not using pool
const error = createError({ type: "ERROR", message: "Failed" });
```

**Fix Required**:

```typescript
// Use pooled error creation
const error = createError(
  { type: "ERROR", message: "Failed" },
  { usePool: true }
);
```

#### 2. **Missing Pool Statistics Tracking**

**Location**: React hooks
**Issue**: Pool statistics not being tracked for React-created errors

**Fix Required**:

```typescript
// Track pool usage in React context
useEffect(() => {
  const stats = getErrorPoolStats();
  // Report pool usage for monitoring
}, []);
```

### Recommended Fixes

#### 1. **Enable Pool Usage in React Hooks**

Update all React hooks to use pooled error creation by default.

#### 2. **Add Pool Monitoring for React**

Add pool statistics tracking and reporting for React-specific usage.

---

## 🎯 PRIORITY IMPLEMENTATION PLAN

### Phase 1: Critical Memory Issues (Week 1)

1. Implement universal cleanup pattern
2. Fix AbortController cleanup
3. Fix state reference cleanup
4. Fix callback reference cleanup
5. Fix mutation cache cleanup

### Phase 2: Event System Integration (Week 2)

1. Create React event bridge
2. Update all hooks to emit events
3. Update error boundary to emit events
4. Add React-specific event types

### Phase 3: Error Boundary Improvements (Week 3)

1. Implement concurrent error handling
2. Add error priority system
3. Fix race conditions

### Phase 4: SSR and Pool Integration (Week 4)

1. Add SSR compatibility
2. Enable pool usage in React hooks
3. Add pool monitoring

## 🔧 TESTING STRATEGY

### 1. Memory Leak Testing

- Add comprehensive memory leak detection
- Test with large numbers of component mounts/unmounts
- Monitor WeakRef cleanup behavior

### 2. Event Integration Testing

- Test event emission in all scenarios
- Verify event listener functionality
- Test React-specific event types

### 3. Concurrent Error Testing

- Test multiple simultaneous errors
- Verify error priority handling
- Test race condition scenarios

### 4. SSR Testing

- Test in actual SSR environment
- Verify polyfill functionality
- Test hydration scenarios

## 📋 SUCCESS METRICS

### Before (Current State)

- 11/245 React tests failing
- Memory leaks: 50+ objects not cleaned up
- Event listeners: 0 calls received
- Error handling: 1/5 concurrent errors handled

### After (Target State)

- 0/245 React tests failing
- Memory leaks: <10 objects after cleanup
- Event listeners: 100% of expected calls received
- Error handling: 5/5 concurrent errors handled

---

**This represents a complete overhaul of the React package's core functionality. The issues are fundamental and require immediate attention to prevent production failures.**
