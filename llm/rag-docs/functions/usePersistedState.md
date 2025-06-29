---
id: usePersistedState
title: usePersistedState() - Deep Dive
tags: [function, react, sync, internal]
complexity: medium
sideEffects: no
---

# usePersistedState()

## Overview
Hook for state with localStorage persistence

**Location**: `packages/react/src/hooks/useTryState.ts`  
**Module**: react  
**Exported**: No  

## Signature
```typescript
function usePersistedState(key: string, initialValue: T): [T, (value: T | ((current: T) => T)) => void, TryError | null]
```

## Parameters
- **key** (`string`)
- **initialValue** (`T`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- getItem()
- setState()
- trySync()
- setItem()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```tsx
 * const [theme, setTheme, error] = usePersistedState('theme', 'light');
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
