---
id: createValidationError
title: createValidationError() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: yes
---

# createValidationError()

## Overview
Pre-built factory for validation errors with field validation

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function createValidationError(errorType: T, message: string, fields: Record<string, string[]>: any, code: string, options?: ErrorFactoryOptions): ValidationError<T>
```

## Parameters
- **errorType** (`T`)
- **message** (`string`)
- **fields** (`Record<string`)
- **string[]>** (`any`)
- **code** (`string`)
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

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * const validationError = createValidationError("FormValidation", "Form validation failed", {
 *   email: ["Must be a valid email"],
 *   password: ["Must be at least 8 characters"]
 * }, "FORM_VALIDATION_ERROR");
 * ```
```



## Implementation Notes
- This function can throw errors - wrap in try/catch or use tryAsync()

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Factory pattern - creates and returns new instances
- Context pattern - accepts runtime values via context parameter
