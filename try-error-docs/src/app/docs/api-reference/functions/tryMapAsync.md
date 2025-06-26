[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / tryMapAsync

# Function: tryMapAsync()

```ts
function tryMapAsync<T, U, E>(resultPromise, mapper): Promise<TryResult<U, TryError<string> | E>>;
```

Defined in: [async.ts:197](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L197)

Transform a successful async result, leaving errors unchanged

## Type Parameters

### T

`T`

### U

`U`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### resultPromise

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>\>

Promise of TryResult to transform

### mapper

(`value`) => `Promise`\<`U`\>

Async function to transform the success value

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`U`, [`TryError`](../interfaces/TryError.md)\<`string`\> \| `E`\>\>

Promise of transformed result or original error

## Example

```typescript
const fetchResult = tryAsync(() => fetch('/api/user'));
const jsonResult = await tryMapAsync(fetchResult, async (response) => response.json());
```
