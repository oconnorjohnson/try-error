---
id: emitErrorCreated
title: emitErrorCreated() - Deep Dive
tags: [function, core, sync, public]
complexity: low
sideEffects: yes
---

# emitErrorCreated()

## Overview
Clear all listeners

**Location**: `src/events.ts`  
**Module**: core  
**Exported**: Yes  

## Signature
```typescript
function emitErrorCreated(error: TryError): void
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
- emitErrorCreated()
- emit()
- emitErrorTransformed()
- emitErrorPooled()
- emitErrorReleased()
- emitErrorSerialized()

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
