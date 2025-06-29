---
id: cloneTryError
title: cloneTryError() - Deep Dive
tags: [function, types, sync, internal]
complexity: low
sideEffects: no
---

# cloneTryError()

## Overview
Compare two TryErrors for equality

**Location**: `src/types.ts`  
**Module**: types  
**Exported**: No  

## Signature
```typescript
function cloneTryError(error: E, modifications?: Partial<Omit<E, typeof TRY_ERROR_BRAND>>: any): E
```

## Parameters
- **error** (`E`)
- **modifications** (`Partial<Omit<E`) - Optional
- **typeof TRY_ERROR_BRAND>>** (`any`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
No internal dependencies

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
