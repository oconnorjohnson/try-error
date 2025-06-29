---
id: createExternalError
title: createExternalError() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: yes
---

# createExternalError()

## Overview
Pre-built factory for external service errors with validation

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function createExternalError(provider: string, errorType: T, message: string, options?: ErrorFactoryOptions & {
    statusCode?): ExternalError<T>
```

## Parameters
- **provider** (`string`)
- **errorType** (`T`)
- **message** (`string`)
- **options** (`ErrorFactoryOptions & {
    statusCode?`) - Optional

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
- createValidationError()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * const apiError = createExternalError("stripe", "NetworkError", "Connection failed", {
 *   statusCode: 500,
 *   externalId: "req_123"
 * });
 * ```
```



## Implementation Notes
- This function can throw errors - wrap in try/catch or use tryAsync()

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Factory pattern - creates and returns new instances
- Context pattern - accepts runtime values via context parameter
