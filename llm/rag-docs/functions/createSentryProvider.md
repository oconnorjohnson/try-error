---
id: createSentryProvider
title: createSentryProvider() - Deep Dive
tags: [function, react, sync, internal]
complexity: low
sideEffects: no
---

# createSentryProvider()

## Overview
Helper function to create a Sentry provider

**Location**: `packages/react/src/telemetry/providers/sentry.ts`  
**Module**: react  
**Exported**: No  

## Signature
```typescript
function createSentryProvider(sentryInstance: SentrySDK): SentryProvider
```

## Parameters
- **sentryInstance** (`SentrySDK`)

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
- createSentryProvider()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```ts
 * import * as Sentry from "
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
