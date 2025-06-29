---
id: withDefault
title: withDefault() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# withDefault()

## Overview
Transform a result value while preserving errors

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function withDefault(result: TryResult<T, E>: any, defaultValue: T): T
```

## Parameters
- **result** (`TryResult<T`)
- **E>** (`any`)
- **defaultValue** (`T`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- getDefault()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const userResult = fetchUser("123");
 * const nameResult = transformResult(userResult, user => user.name);
 * ```
```

### Example 2
```typescript
* ```typescript
 * const user = withDefault(userResult, { id: "unknown", name: "Guest" });
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
