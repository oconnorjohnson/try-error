---
id: getFieldErrors
title: getFieldErrors() - Deep Dive
tags: [function, react, sync, internal]
complexity: low
sideEffects: no
---

# getFieldErrors()

## Overview
Check if an error has field errors (form-related)

**Location**: `packages/react/src/types/index.ts`  
**Module**: react  
**Exported**: No  

## Signature
```typescript
function getFieldErrors(error: unknown): Record<string, string[]> | undefined
```

## Parameters
- **error** (`unknown`)

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
- getFieldErrors()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
