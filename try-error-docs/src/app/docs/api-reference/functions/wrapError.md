[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / wrapError

# Function: wrapError()

```ts
function wrapError<T>(
   type, 
   cause, 
   message?, 
context?): TryError<T>;
```

Defined in: [errors.ts:715](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L715)

Wrap an existing error or thrown value into a TryError

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### type

`T`

The error type for the new TryError

### cause

`unknown`

The original error or thrown value

### message?

`string`

Optional custom message (defaults to cause message)

### context?

`Record`\<`string`, `unknown`\>

Optional additional context

## Returns

[`TryError`](../interfaces/TryError.md)\<`T`\>

A TryError wrapping the original error

## Example

```typescript
try {
  JSON.parse(invalidJson);
} catch (error) {
  return wrapError("ParseError", error, "Failed to parse JSON");
}
```
