---
id: serializeDomainError
title: serializeDomainError() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# serializeDomainError()

## Overview
Create a serializable version of domain-specific errors

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function serializeDomainError(error: E): Record<string, unknown>
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
- **Context Support**: No

### Side Effects
None detected

### Dependencies
No internal dependencies

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const error = createPaymentError("CardDeclined", "Card declined", {
 *   transactionId: "tx_123",
 *   amount: 99.99
 * });
 *
 * const serialized = serializeDomainError(error);
 * // Includes all domain-specific fields in addition to base fields
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
