[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / unwrapOr

# Function: unwrapOr()

```ts
function unwrapOr<T, D, E>(result, defaultValue): T | D;
```

Defined in: [sync.ts:257](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L257)

Extract the success value from a TryResult, returning a default if it's an error

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

### defaultValue

`D`

Value to return if result is an error

## Returns

`T` \| `D`

The success value or default value

## Example

```typescript
const result = trySync(() => JSON.parse(jsonString));
const parsed = unwrapOr(result, {}); // Returns {} if parsing failed
```
