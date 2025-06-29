---
id: hasErrorContext
title: hasErrorContext() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: yes
---

# hasErrorContext()

## Overview
Get error context with type safety

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function hasErrorContext(error: TryError, key: string): boolean
```

## Parameters
- **error** (`TryError`)
- **key** (`string`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: Yes

### Side Effects
- performsIO

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
 * const userId = getErrorContext(error, "userId") as string;
 * const requestId = getErrorContext(error, "requestId") as string;
 * ```
```

### Example 2
```typescript
* ```typescript
 * if (hasErrorContext(error, "userId")) {
 *   const userId = getErrorContext(error, "userId");
 *   // Handle user-specific error
 * }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs
- Performs I/O operations - may be slow, consider caching

## Common Patterns
- Context pattern - accepts runtime values via context parameter
