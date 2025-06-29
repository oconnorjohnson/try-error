---
id: hasAllFlags
title: hasAllFlags() - Deep Dive
tags: [function, core, sync, internal]
complexity: high
sideEffects: no
---

# hasAllFlags()

## Overview
Bit flags for TryError boolean properties

**Location**: `src/bitflags.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function hasAllFlags(flags: number, ...flagsToCheck: ErrorFlags[]): boolean
```

## Parameters
- **flags** (`number`)
- **...flagsToCheck** (`ErrorFlags[]`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: Yes
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- createFlags()
- setFlag()

### Complexity
- **Estimated**: high
- **Loops**: Multiple
- **Conditions**: Complex



## Implementation Notes
- Uses object pooling for performance - objects may be reused

## Performance Considerations
- High complexity function - consider performance impact in hot paths
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
