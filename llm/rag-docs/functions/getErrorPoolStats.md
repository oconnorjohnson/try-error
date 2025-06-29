---
id: getErrorPoolStats
title: getErrorPoolStats() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# getErrorPoolStats()

## Overview
Global error pool instance (created lazily)

**Location**: `src/pool.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function getErrorPoolStats(): unknown
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
- **Uses Object Pool**: Yes
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- getErrorPoolStats()
- getStats()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
- Uses object pooling for performance - objects may be reused

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
