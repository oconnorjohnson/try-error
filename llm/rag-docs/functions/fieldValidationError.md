---
id: fieldValidationError
title: fieldValidationError() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# fieldValidationError()

## Overview
IMPROVED: Quick entity error factory

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function fieldValidationError(fields: Record<string, string[]>: any, code?: string = "VALIDATION_ERROR", message?: string): ValidationError<T>
```

## Parameters
- **fields** (`Record<string`)
- **string[]>** (`any`)
- **code** (`string = "VALIDATION_ERROR"`) - Optional
- **message** (`string`) - Optional

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
- createValidationError()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const error = entityError('user', 'user_123', 'User not found');
 * ```
```

### Example 2
```typescript
* ```typescript
 * const error = fieldValidationError({
 *   email: ['Must be a valid email address'],
 *   password: ['Must be at least 8 characters', 'Must contain a number']
 * }, 'FORM_VALIDATION_ERROR');
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
No specific performance considerations.

## Common Patterns
No specific patterns identified.
