---
id: composedFactory
title: composedFactory() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# composedFactory()

## Overview
No description available.

**Location**: `src/factories.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function composedFactory(type: T, message: string, domainFields?: Partial<Omit<E, keyof TryError>>: any, options?: ErrorFactoryOptions): E
```

## Parameters
- **type** (`T`)
- **message** (`string`)
- **domainFields** (`Partial<Omit<E`) - Optional
- **keyof TryError>>** (`any`)
- **options** (`ErrorFactoryOptions`) - Optional

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
- createPaymentError()

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
