---
id: isReactError
title: isReactError() - Deep Dive
tags: [function, react, sync, internal]
complexity: low
sideEffects: no
---

# isReactError()

## Overview
Check if an error is any type of React error

**Location**: `packages/react/src/types/index.ts`  
**Module**: react  
**Exported**: No  

## Signature
```typescript
function isReactError(error: unknown): error is ReactError
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
No internal dependencies

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
