---
id: withTryErrorBoundary
title: withTryErrorBoundary() - Deep Dive
tags: [function, react, sync, internal]
complexity: low
sideEffects: no
---

# withTryErrorBoundary()

## Overview
Higher-order component that wraps a component with TryErrorBoundary

**Location**: `packages/react/src/components/TryErrorBoundary.tsx`  
**Module**: react  
**Exported**: No  

## Signature
```typescript
function withTryErrorBoundary(Component: React.ComponentType<P>, boundaryProps?: Omit<TryErrorBoundaryProps, "children">: any): unknown
```

## Parameters
- **Component** (`React.ComponentType<P>`)
- **boundaryProps** (`Omit<TryErrorBoundaryProps`) - Optional
- **"children">** (`any`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
No internal dependencies

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```tsx
 * const SafeComponent = withTryErrorBoundary(MyComponent, {
 *   fallback: (error, errorInfo, retry) => <div>Error: {error.message}</div>,
 *   onError: (error) => reportError(error)
 * });
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
