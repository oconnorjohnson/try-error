[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / partitionResults

# Function: partitionResults()

```ts
function partitionResults<T, E>(results): [T[], E[]];
```

Defined in: [utils.ts:354](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L354)

Partition results into success and error arrays

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### results

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>[]

Array of results

## Returns

\[`T`[], `E`[]\]

Tuple of [successes, errors]

## Example

```typescript
const allResults = [userResult1, userResult2, userResult3];
const [users, errors] = partitionResults(allResults);
```
