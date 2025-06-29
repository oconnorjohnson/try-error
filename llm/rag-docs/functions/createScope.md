---
id: createScope
title: createScope() - Deep Dive
tags: [function, config, sync, internal]
complexity: medium
sideEffects: no
---

# createScope()

## Overview
Reset configuration to defaults

**Location**: `src/config.ts`  
**Module**: config  
**Exported**: No  

## Signature
```typescript
function createScope(config: TryErrorConfig): unknown
```

## Parameters
- **config** (`TryErrorConfig`)

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: Yes

### Integration
- **Uses Config**: Yes
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- createScope()
- getConfig()
- createError()
- configure()
- createEnvConfig()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * const { createError } = createScope({
 *   captureStackTrace: false,
 *   defaultErrorType: 'CustomError'
 * });
 *
 * const error = createError({ message: 'Test error' });
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
