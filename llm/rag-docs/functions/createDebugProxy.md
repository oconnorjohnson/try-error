---
id: createDebugProxy
title: createDebugProxy() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# createDebugProxy()

## Overview
Check if a property is lazy (not yet computed)

**Location**: `src/lazy.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function createDebugProxy(error: E): E
```

## Parameters
- **error** (`E`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- get()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Factory pattern - creates and returns new instances
