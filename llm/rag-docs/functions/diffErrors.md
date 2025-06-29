---
id: diffErrors
title: diffErrors() - Deep Dive
tags: [function, utils, sync, internal]
complexity: high
sideEffects: no
---

# diffErrors()

## Overview
Diff two errors to see what changed

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function diffErrors(error1: E1, error2: E2): unknown
```

## Parameters
- **error1** (`E1`)
- **error2** (`E2`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: Yes

### Side Effects
None detected

### Dependencies
No internal dependencies

### Complexity
- **Estimated**: high
- **Loops**: Multiple
- **Conditions**: Complex


## Examples

### Example 1
```typescript
* ```typescript
 * const diff = diffErrors(originalError, modifiedError);
 * console.log(diff);
 * // {
 * //   type: { from: "ValidationError", to: "SchemaError" },
 * //   context: { added: { schema: "user" }, removed: { field: "email" } }
 * // }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- High complexity function - consider performance impact in hot paths

## Common Patterns
- Context pattern - accepts runtime values via context parameter
