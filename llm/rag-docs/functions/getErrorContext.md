---
id: getErrorContext
title: getErrorContext() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# getErrorContext()

## Overview
Extract error message with fallback

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function getErrorContext(error: TryError, key: string): T | undefined
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
None detected

### Dependencies
- getErrorContext()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const message = getErrorMessage(result, "Unknown error occurred");
 * console.error(message);
 * ```
```

### Example 2
```typescript
* ```typescript
 * const userId = getErrorContext(error, "userId") as string;
 * const requestId = getErrorContext(error, "requestId") as string;
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Context pattern - accepts runtime values via context parameter
