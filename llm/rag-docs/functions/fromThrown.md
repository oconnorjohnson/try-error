---
id: fromThrown
title: fromThrown() - Deep Dive
tags: [function, errors, sync, internal]
complexity: medium
sideEffects: no
---

# fromThrown()

## Overview
Create a minimal error for performance-critical paths

**Location**: `src/errors.ts`  
**Module**: errors  
**Exported**: No  

## Signature
```typescript
function fromThrown(cause: unknown, context?: Record<string, unknown>: any): TryError
```

## Parameters
- **cause** (`unknown`)
- **context** (`Record<string`) - Optional
- **unknown>** (`any`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- fromThrown()
- wrapError()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * try {
 *   riskyOperation();
 * } catch (error) {
 *   return fromThrown(error);
 * }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
