---
id: isPoolableError
title: isPoolableError() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: yes
---

# isPoolableError()

## Overview
Object pooling implementation for high-performance error creation

**Location**: `src/pool.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function isPoolableError(error: unknown): error is PoolableError
```

## Parameters
- **error** (`unknown`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: Yes
- **Context Support**: No

### Side Effects
- mutatesState

### Dependencies
- createPoolableError()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
- Uses object pooling for performance - objects may be reused

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
