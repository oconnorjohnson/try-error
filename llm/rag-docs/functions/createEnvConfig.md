---
id: createEnvConfig
title: createEnvConfig() - Deep Dive
tags: [function, config, sync, internal]
complexity: medium
sideEffects: no
---

# createEnvConfig()

## Overview
Utility to create environment-aware configuration

**Location**: `src/config.ts`  
**Module**: config  
**Exported**: No  

## Signature
```typescript
function createEnvConfig(configs?: {
  development?): TryErrorConfig
```

## Parameters
- **configs** (`{
  development?`) - Optional

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
- createEnvConfig()
- configure()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * configure(createEnvConfig({
 *   development: { captureStackTrace: true, developmentMode: true },
 *   production: { captureStackTrace: false, onError: sendToSentry },
 *   test: { captureStackTrace: true, developmentMode: true }
 * }));
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
