[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / isErrorOfTypes

# Function: isErrorOfTypes()

```ts
function isErrorOfTypes(value, errorTypes): value is TryError<string>;
```

Defined in: [utils.ts:149](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L149)

Check if a value is one of several error types

## Parameters

### value

`unknown`

Value to check

### errorTypes

`string`[]

Array of error types to check for

## Returns

`value is TryError<string>`

True if value is a TryError of one of the specified types

## Example

```typescript
if (isErrorOfTypes(result, ["NetworkError", "TimeoutError"])) {
  // Handle network-related errors
}
```
