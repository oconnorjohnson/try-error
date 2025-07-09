[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / isErrorOfType

# Function: isErrorOfType()

```ts
function isErrorOfType(value, errorType): value is TryError<string>;
```

Defined in: [utils.ts:128](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L128)

Check if a value is a specific type of error

## Parameters

### value

`unknown`

Value to check

### errorType

`string`

Error type to check for

## Returns

`value is TryError<string>`

True if value is a TryError of the specified type

## Example

```typescript
if (isErrorOfType(result, "ValidationError")) {
  // Handle validation error
}
```
