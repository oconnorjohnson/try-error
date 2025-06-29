---
id: createReactError
title: createReactError() - Deep Dive
tags: [function, react, async, internal]
complexity: low
sideEffects: no
---

# createReactError()

## Overview
Props for form components

**Location**: `packages/react/src/types/index.ts`  
**Module**: react  
**Exported**: No  

## Signature
```typescript
async function createReactError(type: T, message: string, context?: Record<string, unknown>: any): ReactTryError<T>
```

## Parameters
- **type** (`T`)
- **message** (`string`)
- **context** (`Record<string`) - Optional
- **unknown>** (`any`)

## Characteristics

### Behavior
- **Async**: Yes
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
- createError()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
- This is an async function - remember to use await or handle the returned Promise

## Performance Considerations
No specific performance considerations.

## Common Patterns
- Factory pattern - creates and returns new instances
