---
id: wrapWithContext
title: wrapWithContext() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: yes
---

# wrapWithContext()

## Overview
Wrap an error with additional context while preserving the original type

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function wrapWithContext(error: E, additionalContext: Record<string, unknown>: any): E
```

## Parameters
- **error** (`E`)
- **additionalContext** (`Record<string`)
- **unknown>** (`any`)

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
- createEntityError()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const error = createError({ type: "ValidationError", message: "Invalid input" });
 * const contextualError = wrapWithContext(error, {
 *   requestId: "req_123",
 *   userId: "user_456"
 * });
 * ```
```



## Implementation Notes
- This function can throw errors - wrap in try/catch or use tryAsync()

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Context pattern - accepts runtime values via context parameter
