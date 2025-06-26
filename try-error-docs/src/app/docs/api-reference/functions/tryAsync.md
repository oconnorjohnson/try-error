[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / tryAsync

# Function: tryAsync()

```ts
function tryAsync<T>(fn, options?): Promise<TryResult<T, TryError<string>>>;
```

Defined in: [async.ts:62](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L62)

Wrap an asynchronous operation that might throw or reject
Returns a Promise of either the result or a TryError

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<`T`\>

Async function to execute

### options?

[`TryAsyncOptions`](../interfaces/TryAsyncOptions.md)

Optional configuration

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Promise<TryResult> with success value or error

## Example

```typescript
const result = await tryAsync(async () => {
  const response = await fetch('/api/data');
  return response.json();
});

if (isTryError(result)) {
  console.error('Request failed:', result.message);
} else {
  console.log('Data:', result);
}
```
