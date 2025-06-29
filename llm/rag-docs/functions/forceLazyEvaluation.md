---
id: forceLazyEvaluation
title: forceLazyEvaluation() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# forceLazyEvaluation()

## Overview
Wrap an existing error to make certain properties lazy

**Location**: `src/lazy.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function forceLazyEvaluation(error: E): E
```

## Parameters
- **error** (`E`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: Yes

### Side Effects
None detected

### Dependencies
- get()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Context pattern - accepts runtime values via context parameter
