[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / retry

# Function: retry()

```ts
function retry<T>(fn, options): Promise<TryResult<T, TryError<string>>>;
```

Defined in: [async.ts:472](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L472)

Retry an async operation with exponential backoff

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Async function to retry

### options

Retry configuration

#### attempts

`number`

#### backoffFactor?

`number`

#### baseDelay?

`number`

#### maxDelay?

`number`

#### shouldRetry?

(`error`, `attempt`) => `boolean`

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Promise<TryResult> with final result or last error

## Example

```typescript
const result = await retry(
  () => tryAsync(() => fetch('/api/unreliable')),
  { attempts: 3, baseDelay: 1000, maxDelay: 5000 }
);
```
