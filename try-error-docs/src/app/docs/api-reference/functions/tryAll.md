[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / tryAll

# Function: tryAll()

```ts
function tryAll<T>(results): TryResult<{ [K in string | number | symbol]: T[K<K>] extends any ? U : never }, TryError<string>>;
```

Defined in: [sync.ts:352](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L352)

Combine multiple TryResults, succeeding only if all succeed

## Type Parameters

### T

`T` *extends* readonly `any`[]

## Parameters

### results

`T`

Array of TryResults to combine

## Returns

[`TryResult`](../type-aliases/TryResult.md)\<\{ \[K in string \| number \| symbol\]: T\[K\<K\>\] extends any ? U : never \}, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

Array of success values or first error encountered

## Example

```typescript
const results = tryAll([
  trySync(() => JSON.parse(json1)),
  trySync(() => JSON.parse(json2)),
  trySync(() => JSON.parse(json3))
]);
```
