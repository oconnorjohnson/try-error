[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / tryAny

# Function: tryAny()

```ts
function tryAny<T>(attempts): TryResult<T, TryError<string>>;
```

Defined in: [sync.ts:385](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L385)

Try multiple operations, returning the first successful result

## Type Parameters

### T

`T`

## Parameters

### attempts

() => [`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>[]

Array of functions to try

## Returns

[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

First successful result or last error if all fail

## Example

```typescript
const result = tryAny([
  () => trySync(() => JSON.parse(primaryJson)),
  () => trySync(() => JSON.parse(fallbackJson)),
  () => ({ fallback: true }),
]);
```
