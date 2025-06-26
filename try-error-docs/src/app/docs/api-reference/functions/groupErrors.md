[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / groupErrors

# Function: groupErrors()

```ts
function groupErrors<E, K>(errors, keyFn): Map<K, E[]>;
```

Defined in: [utils.ts:612](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L612)

Group errors by a specific field

## Type Parameters

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

### K

`K`

## Parameters

### errors

`E`[]

Array of errors to group

### keyFn

(`error`) => `K`

Function to extract grouping key

## Returns

`Map`\<`K`, `E`[]\>

Map of grouped errors

## Example

```typescript
const errors = [
  createError({ type: "ValidationError", message: "Invalid email" }),
  createError({ type: "ValidationError", message: "Invalid password" }),
  createError({ type: "NetworkError", message: "Timeout" })
];

const grouped = groupErrors(errors, error => error.type);
// Map { "ValidationError" => [...], "NetworkError" => [...] }
```
