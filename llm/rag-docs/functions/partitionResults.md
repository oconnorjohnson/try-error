---
id: partitionResults
title: partitionResults() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# partitionResults()

## Overview
Filter results to only error values

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function partitionResults(results: Array<TryResult<T, E>>: any): [T[], E[]]
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
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const allResults = [userResult1, userResult2, userResult3];
 * const errors = filterErrors(allResults);
 * ```
```

### Example 2
```typescript
* ```typescript
 * const allResults = [userResult1, userResult2, userResult3];
 * const [users, errors] = partitionResults(allResults);
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
