---
id: listFactories
title: listFactories() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# listFactories()

## Overview
Get a registered factory by name

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function listFactories(): string[]
```

## Parameters
No parameters

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
- from()
- createErrorFactory()

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
