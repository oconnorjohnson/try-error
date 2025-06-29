---
id: hasFlag
title: hasFlag() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: no
---

# hasFlag()

## Overview
Bit flag implementation for performance optimization

**Location**: `src/bitflags.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function hasFlag(flags: number, flag: ErrorFlags): boolean
```

## Parameters
- **flags** (`number`)
- **flag** (`ErrorFlags`)

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
- setFlags()
- createFlags()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
