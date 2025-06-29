---
id: amountError
title: amountError() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# amountError()

## Overview
IMPROVED: More intuitive validation error factory

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function amountError(requestedAmount: number, availableAmount: number, errorCode: string, message: string, currency?: string = "USD"): AmountError<T>
```

## Parameters
- **requestedAmount** (`number`)
- **availableAmount** (`number`)
- **errorCode** (`string`)
- **message** (`string`)
- **currency** (`string = "USD"`) - Optional

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
- **Context Support**: Yes

### Side Effects
None detected

### Dependencies
- createAmountError()
- createExternalError()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const error = validationError('email', 'invalid', 'Must be a valid email address', {
 *   value: 'invalid-email',
 *   pattern: /^\S+
```

### Example 2
```typescript
* ```typescript
 * const error = amountError(150, 100, 'insufficient', 'Insufficient funds available');
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Context pattern - accepts runtime values via context parameter
