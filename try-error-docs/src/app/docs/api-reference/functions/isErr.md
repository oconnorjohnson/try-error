[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / isErr

# Function: isErr()

```ts
function isErr<T, E>(result): result is E;
```

Defined in: [sync.ts:331](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L331)

Check if a TryResult is an error
Type predicate that narrows the type

## Type Parameters

### T

`T`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

The result to check

## Returns

`result is E`

True if result is an error

## Example

```typescript
const result = trySync(() => JSON.parse(jsonString));
if (isErr(result)) {
  // result is narrowed to error type
  console.error(result.message);
}
```
