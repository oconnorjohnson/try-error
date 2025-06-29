---
id: filterErrors
title: filterErrors() - Deep Dive
tags: [function, utils, sync, internal]
complexity: medium
sideEffects: no
---

# filterErrors()

## Overview
Filter results to only success values

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function filterErrors(results: Array<TryResult<T, E>>: any): E[]
```

## Parameters
- **results** (`Array<TryResult<T`)
- **E>>** (`any`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: No

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
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * const allResults = [userResult1, userResult2, userResult3];
 * const successfulUsers = filterSuccess(allResults);
 * ```
```

### Example 2
```typescript
* ```typescript
 * const allResults = [userResult1, userResult2, userResult3];
 * const errors = filterErrors(allResults);
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
