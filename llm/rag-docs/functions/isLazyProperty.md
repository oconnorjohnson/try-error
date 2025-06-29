---
id: isLazyProperty
title: isLazyProperty() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# isLazyProperty()

## Overview
Wrap an existing error to make certain properties lazy

**Location**: `src/lazy.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function isLazyProperty(obj: any, prop: string): boolean
```

## Parameters
- **obj** (`any`)
- **prop** (`string`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: Yes

### Side Effects
None detected

### Dependencies
- getOwnPropertyDescriptor()
- get()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Context pattern - accepts runtime values via context parameter
