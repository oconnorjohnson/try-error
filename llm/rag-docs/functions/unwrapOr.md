---
id: unwrapOr
title: unwrapOr() - Deep Dive
tags: [function, sync, sync, internal]
complexity: low
sideEffects: no
---

# unwrapOr()

## Overview
Extract the success value from a TryResult, returning a default if it's an error

**Location**: `src/sync.ts`  
**Module**: sync  
**Exported**: No  

## Signature
```typescript
function unwrapOr(result: TryResult<T, E>: any, defaultValue: D): T | D
```

## Parameters
- **result** (`TryResult<T`)
- **E>** (`any`)
- **defaultValue** (`D`)

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

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const result = trySync(() => JSON.parse(jsonString));
 * const parsed = unwrapOr(result, {}); // Returns {} if parsing failed
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
