---
id: getGlobalErrorPool
title: getGlobalErrorPool() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: no
---

# getGlobalErrorPool()

## Overview
Get pool statistics

**Location**: `src/pool.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function getGlobalErrorPool(): ErrorPool
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
- **Uses Config**: Yes
- **Emits Events**: No
- **Uses Object Pool**: Yes
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- getGlobalErrorPool()
- configureErrorPool()
- getErrorPoolStats()
- getStats()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate



## Implementation Notes
- Uses object pooling for performance - objects may be reused

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
