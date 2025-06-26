[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / tryAnySequential

# Function: tryAnySequential()

```ts
function tryAnySequential<T>(attemptFns): Promise<TryResult<T, TryError<string>>>;
```

Defined in: [async.ts:391](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L391)

Try multiple async operations in sequence, returning the first successful result
Stops on first success (doesn't wait for remaining promises)

## Type Parameters

### T

`T`

## Parameters

### attemptFns

() => `Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>[]

Array of functions that return Promise<TryResult>

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Promise of first successful result or last error if all fail

## Example

```typescript
const result = await tryAnySequential([
  () => tryAsync(() => fetch('/api/primary')),
  () => tryAsync(() => fetch('/api/fallback')),
  () => tryAsync(() => fetch('/api/backup'))
]);
```
