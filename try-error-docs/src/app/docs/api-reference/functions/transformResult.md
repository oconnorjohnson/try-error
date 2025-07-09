[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / transformResult

# Function: transformResult()

```ts
function transformResult<T, U, E>(result, transform): TryResult<U, E>;
```

Defined in: [utils.ts:243](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L243)

Transform a result value while preserving errors

Similar to tryMap but with a simpler API for common transformations.

## Type Parameters

### T

`T`

### U

`U`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

Result to transform

### transform

(`value`) => `U`

Transformation function

## Returns

[`TryResult`](../type-aliases/TryResult.md)\<`U`, `E`\>

Transformed result or original error

## Example

```typescript
const userResult = fetchUser("123");
const nameResult = transformResult(userResult, (user) => user.name);
```
