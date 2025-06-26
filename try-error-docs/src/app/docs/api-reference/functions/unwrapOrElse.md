[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / unwrapOrElse

# Function: unwrapOrElse()

```ts
function unwrapOrElse<T, D, E>(result, defaultFn): T | D;
```

Defined in: [sync.ts:283](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L283)

Extract the success value from a TryResult, computing a default if it's an error

## Type Parameters

### T

`T`

### D

`D`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

The result to unwrap

### defaultFn

(`error`) => `D`

Function to compute default value from error

## Returns

`T` \| `D`

The success value or computed default

## Example

```typescript
const result = trySync(() => JSON.parse(jsonString));
const parsed = unwrapOrElse(result, (error) => {
  console.warn('Parse failed:', error.message);
  return {};
});
```
