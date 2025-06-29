---
id: getSourceLocation
title: getSourceLocation() - Deep Dive
tags: [function, errors, sync, internal]
complexity: medium
sideEffects: no
---

# getSourceLocation()

## Overview
Extract source location from stack trace

**Location**: `src/errors.ts`  
**Module**: errors  
**Exported**: No  

## Signature
```typescript
function getSourceLocation(stackOffset?: number = 2): string
```

## Parameters
- **stackOffset** (`number = 2`) - Optional

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
- getSourceLocation()
- getCachedConfig()

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
