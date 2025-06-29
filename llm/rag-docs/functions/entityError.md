---
id: entityError
title: entityError() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# entityError()

## Overview
IMPROVED: More intuitive external service error factory

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function entityError(entityType: string, entityId: string, message: string, context?: Record<string, unknown>: any): EntityError<T>
```

## Parameters
- **entityType** (`string`)
- **entityId** (`string`)
- **message** (`string`)
- **context** (`Record<string`) - Optional
- **unknown>** (`any`)

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
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- createEntityError()
- createValidationError()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const error = externalError('API', 'failed', 'Service unavailable', {
 *   transactionId: 'tx_123',
 *   statusCode: 503
 * });
 * ```
```

### Example 2
```typescript
* ```typescript
 * const error = entityError('user', 'user_123', 'User not found');
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
