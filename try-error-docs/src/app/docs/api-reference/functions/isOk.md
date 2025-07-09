[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / isOk

# Function: isOk()

```ts
function isOk<T, E>(result): result is T;
```

Defined in: [sync.ts:309](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L309)

Check if a TryResult is successful (not an error)
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

`result is T`

True if result is successful

## Example

```typescript
const result = trySync(() => JSON.parse(jsonString));
if (isOk(result)) {
  // result is narrowed to success type
  console.log(result.name);
}
```
