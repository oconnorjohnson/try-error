---
id: setupNextJs
title: setupNextJs() - Deep Dive
tags: [function, core, sync, internal]
complexity: low
sideEffects: no
---

# setupNextJs()

## Overview
Quick setup for Next.js applications

**Location**: `src/setup.ts`  
**Module**: core  
**Exported**: No  

## Signature
```typescript
function setupNextJs(options?: TryErrorConfig = {}): void
```

## Parameters
- **options** (`TryErrorConfig = {}`) - Optional

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
- setupNextJs()
- configure()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * // Simple setup with automatic runtime detection
 * setupNextJs();
 *
 * // With custom error handlers
 * setupNextJs({
 *   environmentHandlers: {
 *     server: (error) => {
 *       logger.error('Server error', error);
 *       return error;
 *     },
 *     client: (error) => {
 *       Sentry.captureException(error);
 *       return error;
 *     }
 *   }
 * });
 *
 * // Or override specific options
 * setupNextJs({
 *   captureStackTrace: false,
 *   includeSource: true
 * });
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
