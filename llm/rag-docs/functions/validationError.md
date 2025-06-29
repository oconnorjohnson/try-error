---
id: validationError
title: validationError() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# validationError()

## Overview
IMPROVED: More intuitive validation error factory

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function validationError(field: string, code: string, message: string, context?: Record<string, unknown>: any): ValidationError<T>
```

## Parameters
- **field** (`string`)
- **code** (`string`)
- **message** (`string`)
- **context** (`Record<string`) - Optional
- **unknown>** (`any`)

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
- **Context Support**: Yes

### Side Effects
None detected

### Dependencies
- createValidationError()
- createAmountError()

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



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Context pattern - accepts runtime values via context parameter
