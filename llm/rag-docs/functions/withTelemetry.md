---
id: withTelemetry
title: withTelemetry() - Deep Dive
tags: [function, react, sync, internal]
complexity: low
sideEffects: no
---

# withTelemetry()

## Overview
Get all registered providers

**Location**: `packages/react/src/telemetry/index.ts`  
**Module**: react  
**Exported**: No  

## Signature
```typescript
function withTelemetry(Component: React.ComponentType<P>, componentName?: string): React.ComponentType<P>
```

## Parameters
- **Component** (`React.ComponentType<P>`)
- **componentName** (`string`) - Optional

## Characteristics

### Behavior
- **Async**: No
- **Throws Errors**: No
- **Uses Generics**: Yes
- **Recursive**: Yes

### Integration
- **Uses Config**: No
- **Emits Events**: No
- **Uses Object Pool**: No
- **Context Support**: No

### Side Effects
None detected

### Dependencies
- createElement()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
