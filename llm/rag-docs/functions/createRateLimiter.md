---
id: createRateLimiter
title: createRateLimiter() - Deep Dive
tags: [function, async, sync, internal]
complexity: medium
sideEffects: yes
---

# createRateLimiter()

## Overview
Get current queue size

**Location**: `src/async.ts`  
**Module**: async  
**Exported**: No  

## Signature
```typescript
function createRateLimiter(options?: {
  maxConcurrent): RateLimiter
```

## Parameters
- **options** (`{
  maxConcurrent`) - Optional

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
- mutatesState

### Dependencies
- createRateLimiter()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
