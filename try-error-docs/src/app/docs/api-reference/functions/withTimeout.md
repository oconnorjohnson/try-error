[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / withTimeout

# Function: withTimeout()

```ts
function withTimeout<T, E>(
   resultPromise, 
   timeoutMs, 
timeoutMessage?): Promise<TryResult<T, TryError<string> | E>>;
```

Defined in: [async.ts:428](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L428)

Add a timeout to any Promise<TryResult>

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### resultPromise

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>\>

Promise to add timeout to

### timeoutMs

`number`

Timeout in milliseconds

### timeoutMessage?

`string`

Optional custom timeout message

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\> \| `E`\>\>

Promise that rejects with timeout error if not resolved in time

## Example

```typescript
const result = await withTimeout(
  tryAsync(() => fetch('/api/slow')),
  5000,
  'API request timed out'
);
```
