[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / tryAllAsync

# Function: tryAllAsync()

```ts
function tryAllAsync<T>(resultPromises): Promise<TryResult<{ [K in string | number | symbol]: T[K<K>] extends Promise<any> ? U : never }, TryError<string>>>;
```

Defined in: [async.ts:312](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L312)

Combine multiple async TryResults, succeeding only if all succeed

## Type Parameters

### T

`T` *extends* readonly `Promise`\<`any`\>[]

## Parameters

### resultPromises

`T`

Array of Promise<TryResult> to combine

## Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<\{ \[K in string \| number \| symbol\]: T\[K\<K\>\] extends Promise\<any\> ? U : never \}, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Promise of array of success values or first error encountered

## Example

```typescript
const results = await tryAllAsync([
  tryAsync(() => fetch('/api/user')),
  tryAsync(() => fetch('/api/posts')),
  tryAsync(() => fetch('/api/comments'))
]);
```
