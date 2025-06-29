---
id: tryAwait
title: tryAwait() - Deep Dive
tags: [function, async, async, internal]
complexity: low
sideEffects: yes
---

# tryAwait()

## Overview
Safely await a Promise, wrapping any rejection in a TryError

**Location**: `src/async.ts`  
**Module**: async  
**Exported**: No  

## Signature
```typescript
async function tryAwait(promise: Promise<T>, options?: TryAsyncOptions): Promise<TryResult<T, TryError>>
```

## Parameters
- **promise** (`Promise<T>`)
- **options** (`TryAsyncOptions`) - Optional

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
- performsIO

### Dependencies
- tryAsync()
- tryMapAsync()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const result = await tryAwait(fetch('/api/data'));
 * if (isTryError(result)) {
 *   console.error('Fetch failed:', result.message);
 * } else {
 *   console.log('Response:', result);
 * }
 * ```
```



## Implementation Notes
- This is an async function - remember to use await or handle the returned Promise

## Performance Considerations
- Performs I/O operations - may be slow, consider caching

## Common Patterns
- Error handling pattern - returns Result type instead of throwing
