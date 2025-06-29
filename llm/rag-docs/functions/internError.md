---
id: internError
title: internError() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: no
---

# internError()

## Overview
Get statistics

**Location**: `src/intern.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function internError(type: string, message: string, source: string): unknown
```

## Parameters
- **type** (`string`)
- **message** (`string`)
- **source** (`string`)

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
- getInternStats()
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
