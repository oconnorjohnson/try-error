---
id: createAmountError
title: createAmountError() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: yes
---

# createAmountError()

## Overview
Pre-built factory for amount-related errors with validation

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function createAmountError(amount: number, currency: string, errorType: T, message: string, options?: ErrorFactoryOptions): AmountError<T>
```

## Parameters
- **amount** (`number`)
- **currency** (`string`)
- **errorType** (`T`)
- **message** (`string`)
- **options** (`ErrorFactoryOptions`) - Optional

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: Yes
- **Uses Generics**: Yes
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
- createExternalError()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * const paymentError = createAmountError(99.99, "USD", "InsufficientFunds", "Insufficient funds");
 * ```
```



## Implementation Notes
- This function can throw errors - wrap in try/catch or use tryAsync()

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Factory pattern - creates and returns new instances
- Context pattern - accepts runtime values via context parameter
