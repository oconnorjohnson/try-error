[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / createError

# Function: createError()

```ts
function createError<T>(options): TryError<T>;
```

Defined in: [errors.ts:437](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L437)

Create a TryError with automatic source location detection

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### options

[`CreateErrorOptions`](../interfaces/CreateErrorOptions.md)\<`T`\>

Error creation options

## Returns

[`TryError`](../interfaces/TryError.md)\<`T`\>

A properly formatted TryError

## Example

```typescript
const error = createError({
  type: "ValidationError",
  message: "Invalid email format",
  context: { email: "invalid-email" }
});
```
