[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / trySync

# Function: trySync()

```ts
function trySync<T>(fn, options?): TryResult<T, TryError<string>>;
```

Defined in: [sync.ts:65](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L65)

Wrap a synchronous operation that might throw
Returns either the result or a TryError

## Type Parameters

### T

`T`

## Parameters

### fn

() => `T`

Function to execute

### options?

[`TrySyncOptions`](../interfaces/TrySyncOptions.md)

Optional configuration

## Returns

[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

TryResult with success value or error

## Example

```typescript
const result = trySync(() => JSON.parse(jsonString));
if (isTryError(result)) {
  console.error('Parse failed:', result.message);
} else {
  console.log('Parsed:', result);
}
```
