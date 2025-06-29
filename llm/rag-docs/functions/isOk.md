---
id: isOk
title: isOk() - Deep Dive
tags: [function, sync, sync, internal]
complexity: low
sideEffects: no
---

# isOk()

## Overview
Check if a TryResult is successful (not an error)

**Location**: `src/sync.ts`  
**Module**: sync  
**Exported**: No  

## Signature
```typescript
function isOk(result: TryResult<T, E>: any): result is T
```

## Parameters
- **result** (`TryResult<T`)
- **E>** (`any`)

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
- trySync()
- tryAll()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * if (isOk(result)) {
 *   // result is narrowed to success type
 *   console.log(result.name);
 * }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
