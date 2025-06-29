---
id: createErrorReport
title: createErrorReport() - Deep Dive
tags: [function, utils, sync, internal]
complexity: medium
sideEffects: no
---

# createErrorReport()

## Overview
Create a simple error report from multiple errors

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function createErrorReport(errors: TryError[]): string
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
- createErrorReport()
- getErrorSummary()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * const errors = filterErrors(results);
 * console.error(createErrorReport(errors));
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
- Context pattern - accepts runtime values via context parameter
