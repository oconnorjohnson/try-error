[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / hasErrorContext

# Function: hasErrorContext()

```ts
function hasErrorContext(error, key): boolean;
```

Defined in: [utils.ts:220](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L220)

Check if error has specific context

## Parameters

### error

[`TryError`](../interfaces/TryError.md)

TryError to check

### key

`string`

Context key to check for

## Returns

`boolean`

True if error has the specified context key

## Example

```typescript
if (hasErrorContext(error, "userId")) {
  const userId = getErrorContext(error, "userId");
  // Handle user-specific error
}
```
