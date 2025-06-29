---
id: createError
title: createError() - Deep Dive
tags: [function, errors, sync, internal]
complexity: low
sideEffects: no
---

# createError()

## Overview
Generate a cache key for error deduplication

**Location**: `src/errors.ts`  
**Module**: errors  
**Exported**: No  

## Signature
```typescript
function createError(options: CreateErrorOptions<T>): TryError<T>
```

## Parameters
- **options** (`CreateErrorOptions<T>`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: Yes
- **Context Support**: Yes

### Side Effects
None detected

### Dependencies
- getCachedConfig()
- getErrorCacheKey()
- get()
- createMinimalError()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const error = createError({
 *   type: "ValidationError",
 *   message: "Invalid email format",
 *   context: { email: "invalid-email" }
 * });
 * ```
```



## Implementation Notes
- Uses object pooling for performance - objects may be reused

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Factory pattern - creates and returns new instances
- Context pattern - accepts runtime values via context parameter
