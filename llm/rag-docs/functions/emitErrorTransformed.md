---
id: emitErrorTransformed
title: emitErrorTransformed() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: yes
---

# emitErrorTransformed()

## Overview
Clear all listeners

**Location**: `src/events.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function emitErrorTransformed(original: TryError, transformed: TryError): void
```

## Parameters
- **original** (`TryError`)
- **transformed** (`TryError`)

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
- emitErrorTransformed()
- emit()
- emitErrorPooled()
- emitErrorReleased()
- emitErrorSerialized()
- emitErrorWrapped()

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
