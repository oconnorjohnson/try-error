---
id: createCustomSetup
title: createCustomSetup() - Deep Dive
tags: [function, core, sync, internal]
complexity: medium
sideEffects: no
---

# createCustomSetup()

## Overview
Create a custom setup function with your own defaults

**Location**: `src/setup.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function createCustomSetup(baseConfig: TryErrorConfig): unknown
```

## Parameters
- **baseConfig** (`TryErrorConfig`)

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
- createCustomSetup()
- configure()
- setupNode()
- getConfig()

### Complexity
- **Estimated**: medium
- **Loops**: Some
- **Conditions**: Moderate


## Examples

### Example 1
```typescript
* ```typescript
 * // Create your organization's standard setup
 * const setupMyApp = createCustomSetup({
 *   onError: (error) => sendToMyMonitoringService(error),
 *   serializer: (error) => myCustomSerializer(error)
 * });
 *
 * // Use in your applications
 * setupMyApp(); // Uses your defaults
 * setupMyApp({ developmentMode: true }); // Override specific options
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
- Factory pattern - creates and returns new instances
