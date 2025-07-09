[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / getErrorFingerprint

# Function: getErrorFingerprint()

```ts
function getErrorFingerprint(error, fields): string;
```

Defined in: [utils.ts:772](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L772)

Create a fingerprint for an error for deduplication

## Parameters

### error

[`TryError`](../interfaces/TryError.md)

Error to fingerprint

### fields

keyof [`TryError`](../interfaces/TryError.md)\<`string`\>[] = `...`

Fields to include in fingerprint

## Returns

`string`

Fingerprint string

## Example

```typescript
const fingerprint = getErrorFingerprint(error, ["type", "message", "source"]);
if (!seenFingerprints.has(fingerprint)) {
  seenFingerprints.add(fingerprint);
  logError(error);
}
```
