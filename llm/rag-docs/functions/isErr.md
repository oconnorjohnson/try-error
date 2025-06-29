---
id: isErr
title: isErr() - Deep Dive
tags: [function, sync, sync, internal]
complexity: low
sideEffects: no
---

# isErr()

## Overview
Check if a TryResult is successful (not an error)

**Location**: `src/sync.ts`  
**Module**: sync  
**Exported**: No  

## Signature
```typescript
function isErr(result: TryResult<T, E>: any): result is E
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
- tryAll()
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
 * if (isOk(result)) {
 *   // result is narrowed to success type
 *   console.log(result.name);
 * }
 * ```
```

### Example 2
```typescript
* ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * if (isErr(result)) {
 *   // result is narrowed to error type
 *   console.error(result.message);
 * }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
