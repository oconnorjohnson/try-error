---
id: createEnhancedError
title: createEnhancedError() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# createEnhancedError()

## Overview
Custom error type to use instead of automatic detection

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function createEnhancedError(type: string, message: string, options: Omit<ErrorHandlingOptions, "errorType"> ?: any): TryError
```

## Parameters
- **type** (`string`)
- **message** (`string`)
- **options** (`Omit<ErrorHandlingOptions`)
- **"errorType"> ** (`any`) - Optional

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
- createEnhancedError()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const error = createEnhancedError("ValidationError", "Invalid input", {
 *   context: { field: "email", value: "invalid" },
 *   tags: ["user-input", "validation"]
 * });
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
- Context pattern - accepts runtime values via context parameter
