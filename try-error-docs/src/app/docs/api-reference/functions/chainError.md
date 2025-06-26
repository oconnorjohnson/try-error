[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / chainError

# Function: chainError()

```ts
function chainError<T, E>(
   originalError, 
   newType, 
   newMessage, 
   additionalFields?): E;
```

Defined in: [factories.ts:385](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L385)

Chain errors while preserving the original error context

Useful for wrapping lower-level errors with higher-level context
while maintaining the full error chain for debugging.

## Type Parameters

### T

`T` *extends* `string`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`T`\>

## Parameters

### originalError

[`TryError`](../interfaces/TryError.md)

The original error to chain from

### newType

`T`

The type for the new error

### newMessage

`string`

The message for the new error

### additionalFields?

`Partial`\<`Omit`\<`E`, keyof [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Additional domain-specific fields

## Returns

`E`

A new error with the original error as the cause

## Example

```typescript
const dbError = trySync(() => database.query("SELECT * FROM users"));
if (isErr(dbError)) {
  return chainError(dbError, "UserServiceError", "Failed to fetch user data", {
    operation: "getUserById",
    userId: "123"
  });
}
```
