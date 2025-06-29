---
id: getErrorMessage
title: getErrorMessage() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# getErrorMessage()

## Overview
Check if a value is one of several error types

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function getErrorMessage(value: unknown, fallback?: string = "Unknown error"): string
```

## Parameters
- **value** (`unknown`)
- **fallback** (`string = "Unknown error"`) - Optional

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
- getErrorMessage()
- getErrorContext()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * if (isErrorOfTypes(result, ["NetworkError", "TimeoutError"])) {
 *   // Handle network-related errors
 * }
 * ```
```

### Example 2
```typescript
* ```typescript
 * const message = getErrorMessage(result, "Unknown error occurred");
 * console.error(message);
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Context pattern - accepts runtime values via context parameter
