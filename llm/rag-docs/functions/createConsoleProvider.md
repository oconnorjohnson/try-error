---
id: createConsoleProvider
title: createConsoleProvider() - Deep Dive
tags: [function, react, sync, internal]
complexity: low
sideEffects: no
---

# createConsoleProvider()

## Overview
Enable or disable the console provider

**Location**: `packages/react/src/telemetry/providers/console.ts`  
**Module**: react  
**Exported**: No  

## Signature
```typescript
function createConsoleProvider(options?: ConstructorParameters<typeof ConsoleProvider>[0]): ConsoleProvider
```

## Parameters
- **options** (`ConstructorParameters<typeof ConsoleProvider>[0]`) - Optional

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: No
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- createConsoleProvider()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```ts
 * import { createConsoleProvider, telemetry } from "
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
