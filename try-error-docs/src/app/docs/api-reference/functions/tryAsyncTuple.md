[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / tryAsyncTuple

# Function: tryAsyncTuple()

```ts
function tryAsyncTuple<T>(fn, options?): Promise<TryTuple<T, TryError<string>>>;
```

Defined in: [async.ts:149](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L149)

Wrap an asynchronous operation and return a tuple [result, error]
Go-style async error handling

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

`Promise`\<[`TryTuple`](../type-aliases/TryTuple.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Promise<TryTuple> with [result, null] on success or [null, error] on failure

## Example

```typescript
const [result, error] = await tryAsyncTuple(async () => {
  const response = await fetch("/api/data");
  return response.json();
});

if (error) {
  console.error("Request failed:", error.message);
} else {
  console.log("Data:", result);
}
```
