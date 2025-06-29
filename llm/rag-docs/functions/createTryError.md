---
id: createTryError
title: createTryError() - Deep Dive
tags: [function, sync, sync, internal]
complexity: medium
sideEffects: yes
---

# createTryError()

## Overview
Options for trySync function

**Location**: `src/sync.ts`  
**Module**: sync  
**Exported**: No  

## Signature
```typescript
function createTryError(error: unknown, options?: TrySyncOptions): TryError
```

## Parameters
- **error** (`unknown`)
- **options** (`TrySyncOptions`) - Optional

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: Yes
- **Uses Generics**: No
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: Yes

### Side Effects
- throwsErrors

### Dependencies
- createTryError()
- wrapError()
- fromThrown()
- trySync()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate



## Implementation Notes
- This function can throw errors - wrap in try/catch or use tryAsync()

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
- Context pattern - accepts runtime values via context parameter
