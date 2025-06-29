---
id: emitErrorRetry
title: emitErrorRetry() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: yes
---

# emitErrorRetry()

## Overview
Emit error pooled event

**Location**: `src/events.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function emitErrorRetry(error: TryError, attempt: number): void
```

## Parameters
- **error** (`TryError`)
- **attempt** (`number`)

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
- emitErrorRetry()
- emit()
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
