---
id: wrapError
title: wrapError() - Deep Dive
tags: [function, errors, sync, internal]
complexity: medium
sideEffects: no
---

# wrapError()

## Overview
Wrap an existing error or thrown value into a TryError

**Location**: `src/errors.ts`  
**Module**: errors  
**Exported**: No  

## Signature
```typescript
function wrapError(type: T, cause: unknown, message?: string, context?: Record<string, unknown>: any): TryError<T>
```

## Parameters
- **type** (`T`)
- **cause** (`unknown`)
- **message** (`string`) - Optional
- **context** (`Record<string`) - Optional
- **unknown>** (`any`)

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
- createError()
- getCachedConfig()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * try {
 *   JSON.parse(invalidJson);
 * } catch (error) {
 *   return wrapError("ParseError", error, "Failed to parse JSON");
 * }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
