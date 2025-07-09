[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / createAsyncQueue

# Function: createAsyncQueue()

```ts
function createAsyncQueue<T>(options?): AsyncQueue<T>;
```

Defined in: [async.ts:773](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L773)

Create an async queue instance

## Type Parameters

### T

`T`

## Parameters

### options?

#### concurrency?

`number`

#### onError?

(`error`) => `void`

## Returns

[`AsyncQueue`](../classes/AsyncQueue.md)\<`T`\>
