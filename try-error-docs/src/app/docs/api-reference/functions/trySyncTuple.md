[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / trySyncTuple

# Function: trySyncTuple()

```ts
function trySyncTuple<T>(fn, options?): TryTuple<T, TryError<string>>;
```

Defined in: [sync.ts:94](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L94)

Wrap a synchronous operation and return a tuple [result, error]
Go-style error handling

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

[`TryTuple`](../type-aliases/TryTuple.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

Tuple with [result, null] on success or [null, error] on failure

## Example

```typescript
const [result, error] = trySyncTuple(() => JSON.parse(jsonString));
if (error) {
  console.error('Parse failed:', error.message);
} else {
  console.log('Parsed:', result);
}
```
