[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / filterSuccess

# Function: filterSuccess()

```ts
function filterSuccess<T, E>(results): T[];
```

Defined in: [utils.ts:307](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L307)

Filter results to only success values
Optimized to process in a single pass

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

`T`[]

Array of only the success values

## Example

```typescript
const allResults = [userResult1, userResult2, userResult3];
const successfulUsers = filterSuccess(allResults);
```
