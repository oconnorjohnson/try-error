---
id: tryAnyAsync
title: tryAnyAsync() - Deep Dive
tags: [function, async, async, internal]
complexity: low
sideEffects: no
---

# tryAnyAsync()

## Overview
Try multiple async operations, returning the first successful result

**Location**: `src/async.ts`  
**Module**: async  
**Exported**: No  

## Signature
```typescript
async function tryAnyAsync(attemptPromises: Array<Promise<TryResult<T, TryError>>>: any): Promise<TryResult<T, TryError>>
```

## Parameters
- **attemptPromises** (`Array<Promise<TryResult<T`)
- **TryError>>>** (`any`)

## Characteristics

### Behavior
- **Async**: Yes
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- fromThrown()
- tryAnySequential()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const result = await tryAnyAsync([
 *   tryAsync(() => fetch('/api/primary')),
 *   tryAsync(() => fetch('/api/fallback')),
 *   tryAsync(() => fetch('/api/backup'))
 * ]);
 * ```
```



## Implementation Notes
- This is an async function - remember to use await or handle the returned Promise

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Error handling pattern - returns Result type instead of throwing
