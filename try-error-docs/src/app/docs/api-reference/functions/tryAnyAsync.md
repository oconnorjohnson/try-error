[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / tryAnyAsync

# Function: tryAnyAsync()

```ts
function tryAnyAsync<T>(attemptPromises): Promise<TryResult<T, TryError<string>>>;
```

Defined in: [async.ts:353](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L353)

Try multiple async operations, returning the first successful result
Uses Promise.allSettled to wait for all attempts

## Type Parameters

### T

`T`

## Parameters

### attemptPromises

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>[]

Array of Promise<TryResult> to try

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Promise of first successful result or last error if all fail

## Example

```typescript
const result = await tryAnyAsync([
  tryAsync(() => fetch('/api/primary')),
  tryAsync(() => fetch('/api/fallback')),
  tryAsync(() => fetch('/api/backup'))
]);
```
