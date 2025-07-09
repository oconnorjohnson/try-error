[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / isTrySuccess

# Function: isTrySuccess()

```ts
function isTrySuccess<T, E>(result): result is T;
```

Defined in: [types.ts:120](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L120)

Type predicate to narrow a TryResult to its success type

IMPROVED: More reliable than negating isTryError

## Type Parameters

### T

`T`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

## Returns

`result is T`
