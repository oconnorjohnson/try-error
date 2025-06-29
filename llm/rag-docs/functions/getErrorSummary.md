---
id: getErrorSummary
title: getErrorSummary() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# getErrorSummary()

## Overview
Get a summary of error types from an array of errors

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function getErrorSummary(errors: TryError[]): Record<string, number>
```

## Parameters
- **errors** (`TryError[]`)

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
- getErrorSummary()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const errors = filterErrors(results);
 * const summary = getErrorSummary(errors);
 * // { "ValidationError": 3, "NetworkError": 1 }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Context pattern - accepts runtime values via context parameter
