---
id: externalError
title: externalError() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: no
---

# externalError()

## Overview
IMPROVED: More intuitive amount error factory

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function externalError(service: string, operation: string, message: string, context?: Record<string, unknown> & {
    statusCode?: number;
    externalId?): ExternalError<T>
```

## Parameters
- **service** (`string`)
- **operation** (`string`)
- **message** (`string`)
- **context** (`Record<string`) - Optional
- **unknown> & {
    statusCode** (`number;
    externalId?`) - Optional

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
- createExternalError()
- createEntityError()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * const error = amountError(150, 100, 'insufficient', 'Insufficient funds available');
 * ```
```

### Example 2
```typescript
* ```typescript
 * const error = externalError('API', 'failed', 'Service unavailable', {
 *   transactionId: 'tx_123',
 *   statusCode: 503
 * });
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Context pattern - accepts runtime values via context parameter
