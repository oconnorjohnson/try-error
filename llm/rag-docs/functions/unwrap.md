---
id: unwrap
title: unwrap() - Deep Dive
tags: [function, sync, sync, internal]
complexity: low
sideEffects: yes
---

# unwrap()

## Overview
Extract the success value from a TryResult, throwing if it's an error

**Location**: `src/sync.ts`  
**Module**: sync  
**Exported**: No  

## Signature
```typescript
function unwrap(result: TryResult<T, E>: any, message?: string): T
```

## Parameters
- **result** (`TryResult<T`)
- **E>** (`any`)
- **message** (`string`) - Optional

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: Yes
- **Uses Generics**: No
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
- throwsErrors

### Dependencies
- trySync()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * const parsed = unwrap(result); // Throws if parsing failed
 * ```
```



## Implementation Notes
- This function can throw errors - wrap in try/catch or use tryAsync()

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
