---
id: emitErrorReleased
title: emitErrorReleased() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: yes
---

# emitErrorReleased()

## Overview
Global error event emitter

**Location**: `src/events.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function emitErrorReleased(error: TryError): void
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
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
- emitsEvents

### Dependencies
- emitErrorReleased()
- emit()
- emitErrorSerialized()
- emitErrorWrapped()
- emitErrorRetry()
- emitErrorRecovered()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
- Emits events that can be listened to for lifecycle hooks

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
