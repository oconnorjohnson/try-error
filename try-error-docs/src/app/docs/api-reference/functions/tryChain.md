[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / tryChain

# Function: tryChain()

```ts
function tryChain<T, U, E1, E2>(result, chainer): TryResult<U, E1 | E2>;
```

Defined in: [sync.ts:207](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L207)

Chain operations that return TryResult, short-circuiting on errors

## Type Parameters

### T

`T`

### U

`U`

### E1

`E1` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

### E2

`E2` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E1`\>

The result to chain from

### chainer

(`value`) => [`TryResult`](../type-aliases/TryResult.md)\<`U`, `E2`\>

Function that takes success value and returns new TryResult

## Returns

[`TryResult`](../type-aliases/TryResult.md)\<`U`, `E1` \| `E2`\>

Chained result or first error encountered

## Example

```typescript
const result = trySync(() => JSON.parse(jsonString))
  |> tryChain(obj => trySync(() => validateUser(obj)))
  |> tryChain(user => trySync(() => saveUser(user)));
```
