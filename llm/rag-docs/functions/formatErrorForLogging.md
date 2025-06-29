---
id: formatErrorForLogging
title: formatErrorForLogging() - Deep Dive
tags: [function, utils, sync, internal]
complexity: medium
sideEffects: no
---

# formatErrorForLogging()

## Overview
Format an error for logging with all context

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function formatErrorForLogging(error: TryError, includeStack?: boolean = false): string
```

## Parameters
- **error** (`TryError`)
- **includeStack** (`boolean = false`) - Optional

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
 * console.error(formatErrorForLogging(error, true));
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
