---
id: createFlags
title: createFlags() - Deep Dive
tags: [function, core, sync, internal]
complexity: high
sideEffects: no
---

# createFlags()

## Overview
Check if a flag is set

**Location**: `src/bitflags.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function createFlags(options?: {
  hasStack?): number
```

## Parameters
- **options** (`{
  hasStack?`) - Optional

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
- Factory pattern - creates and returns new instances
