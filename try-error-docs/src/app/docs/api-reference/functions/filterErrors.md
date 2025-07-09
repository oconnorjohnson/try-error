[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / filterErrors

# Function: filterErrors()

```ts
function filterErrors<T, E>(results): E[];
```

Defined in: [utils.ts:331](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L331)

Filter results to only error values
Optimized to process in a single pass

## Type Parameters

### T

`T`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### results

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>[]

Array of results

## Returns

`E`[]

Array of only the error values

## Example

```typescript
const allResults = [userResult1, userResult2, userResult3];
const errors = filterErrors(allResults);
```
