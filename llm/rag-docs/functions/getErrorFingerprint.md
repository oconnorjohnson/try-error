---
id: getErrorFingerprint
title: getErrorFingerprint() - Deep Dive
tags: [function, utils, sync, internal]
complexity: low
sideEffects: no
---

# getErrorFingerprint()

## Overview
Create a fingerprint for an error for deduplication

**Location**: `src/utils.ts`  
**Module**: utils  
**Exported**: No  

## Signature
```typescript
function getErrorFingerprint(error: TryError, fields?: Array<keyof TryError> = ["type", "message"]: any): string
```

## Parameters
- **error** (`TryError`)
- **fields** (`Array<keyof TryError> = ["type"`) - Optional
- **"message"]** (`any`)

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
- getErrorFingerprint()

### Complexity
- **Estimated**: low
- **Loops**: Few/None
- **Conditions**: Simple


## Examples

### Example 1
```typescript
* ```typescript
 * const fingerprint = getErrorFingerprint(error, ["type", "message", "source"]);
 * if (!seenFingerprints.has(fingerprint)) {
 *   seenFingerprints.add(fingerprint);
 *   logError(error);
 * }
 * ```
```



## Implementation Notes
No special implementation notes.

## Performance Considerations
- Recursive implementation - watch for stack overflow with large inputs

## Common Patterns
No specific patterns identified.
