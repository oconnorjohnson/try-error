[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / withDefaultFn

# Function: withDefaultFn()

```ts
function withDefaultFn<T, E>(result, getDefault): T;
```

Defined in: [utils.ts:287](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L287)

Provide a default value using a function for error cases

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

Result that might be an error

### getDefault

(`error`) => `T`

Function to generate default value

## Returns

`T`

The success value or computed default value

## Example

```typescript
const user = withDefaultFn(userResult, (error) => ({
  id: "unknown",
  name: `Guest (${error.type})`
}));
```
