---
id: withTimeout
title: withTimeout() - Deep Dive
tags: [function, async, async, internal]
complexity: low
sideEffects: yes
---

# withTimeout()

## Overview
Add a timeout to any Promise<TryResult>

**Location**: `src/async.ts`  
**Module**: async  
**Exported**: No  

## Signature
```typescript
async function withTimeout(resultPromise: Promise<TryResult<T, E>>: any, timeoutMs: number, timeoutMessage?: string): Promise<TryResult<T, E | TryError>>
```

## Parameters
- **resultPromise** (`Promise<TryResult<T`)
- **E>>** (`any`)
- **timeoutMs** (`number`)
- **timeoutMessage** (`string`) - Optional

## Characteristics

### Behavior
- **Async**: Yes
- **Throws Errors**: Yes
- **Uses Generics**: Yes
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
- throwsErrors

### Dependencies
- setTimeout()
- fromThrown()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const result = await withTimeout(
 *   tryAsync(() => fetch('/api/slow')),
 *   5000,
 *   'API request timed out'
 * );
 * ```
```



## Implementation Notes
- This is an async function - remember to use await or handle the returned Promise
- This function can throw errors - wrap in try/catch or use tryAsync()

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
