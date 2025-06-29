---
id: emitErrorSerialized
title: emitErrorSerialized() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: yes
---

# emitErrorSerialized()

## Overview
Global error event emitter

**Location**: `src/events.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function emitErrorSerialized(error: TryError, serialized: any): void
```

## Parameters
- **error** (`TryError`)
- **serialized** (`any`)

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
- emitErrorSerialized()
- emit()
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
