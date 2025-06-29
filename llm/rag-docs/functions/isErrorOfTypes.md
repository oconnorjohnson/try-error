---
id: isErrorOfTypes
title: isErrorOfTypes() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# isErrorOfTypes()

## Overview
Check if a value is a specific type of error

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function isErrorOfTypes(value: unknown, errorTypes: string[]): value is TryError
```

## Parameters
- **value** (`unknown`)
- **errorTypes** (`string[]`)

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

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * if (isErrorOfType(result, "ValidationError")) {
 *   // Handle validation error
 * }
 * ```
```

### Example 2
```typescript
* ```typescript
 * if (isErrorOfTypes(result, ["NetworkError", "TimeoutError"])) {
 *   // Handle network-related errors
 * }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Context pattern - accepts runtime values via context parameter
