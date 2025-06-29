---
id: emitErrorPooled
title: emitErrorPooled() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: yes
---

# emitErrorPooled()

## Overview
Get listener count

**Location**: `src/events.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function emitErrorPooled(error: TryError): void
```

## Parameters
- **error** (`TryError`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: Yes
- **Uses Object Pool**: Yes
- **Context Support**: No

### Side Effects
- emitsEvents

### Dependencies
- emitErrorPooled()
- emit()
- emitErrorReleased()
- emitErrorSerialized()
- emitErrorWrapped()
- emitErrorRetry()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
- Uses object pooling for performance - objects may be reused
- Emits events that can be listened to for lifecycle hooks

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
