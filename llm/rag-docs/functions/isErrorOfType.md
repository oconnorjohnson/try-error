---
id: isErrorOfType
title: isErrorOfType() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# isErrorOfType()

## Overview
Check if a value is a specific type of error

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function isErrorOfType(value: unknown, errorType: string): value is TryError
```

## Parameters
- **value** (`unknown`)
- **errorType** (`string`)

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
- **Context Support**: No

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



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
