[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / tryChainAsync

# Function: tryChainAsync()

```ts
function tryChainAsync<T, U, E1, E2>(resultPromise, chainer): Promise<TryResult<U, E1 | E2>>;
```

Defined in: [async.ts:253](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L253)

Chain async operations that return Promise<TryResult>, short-circuiting on errors

## Type Parameters

### T

`T`

### U

`U`

### E1

`E1` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

### E2

`E2` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### resultPromise

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E1`\>\>

Promise of TryResult to chain from

### chainer

(`value`) => `Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`U`, `E2`\>\>

Async function that takes success value and returns new Promise<TryResult>

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`U`, `E1` \| `E2`\>\>

Promise of chained result or first error encountered

## Example

```typescript
const result = await tryChainAsync(
  tryAsync(() => fetch('/api/user')),
  async (response) => tryAsync(() => response.json())
);
```
