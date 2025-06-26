[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / tryAwait

# Function: tryAwait()

```ts
function tryAwait<T>(promise, options?): Promise<TryResult<T, TryError<string>>>;
```

Defined in: [async.ts:177](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L177)

Safely await a Promise, wrapping any rejection in a TryError

## Type Parameters

### T

`T`

## Parameters

### promise

`Promise`\<`T`\>

Promise to await

### options?

[`TryAsyncOptions`](../interfaces/TryAsyncOptions.md)

Optional configuration

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Promise<TryResult> with success value or error

## Example

```typescript
const result = await tryAwait(fetch('/api/data'));
if (isTryError(result)) {
  console.error('Fetch failed:', result.message);
} else {
  console.log('Response:', result);
}
```
