---
id: createEntityError
title: createEntityError() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: yes
---

# createEntityError()

## Overview
Pre-built factory for entity-related errors with validation

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function createEntityError(entityType: string, entityId: string, errorType: T, message: string, options?: ErrorFactoryOptions): EntityError<T>
```

## Parameters
- **entityType** (`string`)
- **entityId** (`string`)
- **errorType** (`T`)
- **message** (`string`)
- **options** (`ErrorFactoryOptions`) - Optional

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: Yes
- **Uses Generics**: No
- **Recursive**: No

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: Yes

### Side Effects
- throwsErrors

### Dependencies
- createError()
- createAmountError()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * const userError = createEntityError("user", "user_123", "UserNotFound", "User not found");
 * const orderError = createEntityError("order", "order_456", "OrderCancelled", "Order was cancelled");
 * ```
```



## Implementation Notes
- This function can throw errors - wrap in try/catch or use tryAsync()

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Factory pattern - creates and returns new instances
- Context pattern - accepts runtime values via context parameter
