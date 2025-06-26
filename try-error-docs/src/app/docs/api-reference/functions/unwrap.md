[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / unwrap

# Function: unwrap()

```ts
function unwrap<T, E>(result, message?): T;
```

Defined in: [sync.ts:232](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L232)

Extract the success value from a TryResult, throwing if it's an error

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

The result to unwrap

### message?

`string`

Optional custom error message

## Returns

`T`

The success value

## Throws

The TryError if result is an error

## Example

```typescript
const result = trySync(() => JSON.parse(jsonString));
const parsed = unwrap(result); // Throws if parsing failed
```
