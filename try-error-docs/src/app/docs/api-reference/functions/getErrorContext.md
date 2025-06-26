[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / getErrorContext

# Function: getErrorContext()

```ts
function getErrorContext<T>(error, key): undefined | T;
```

Defined in: [utils.ts:198](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L198)

Get error context with type safety

## Type Parameters

### T

`T` = `unknown`

## Parameters

### error

[`TryError`](../interfaces/TryError.md)

TryError to extract context from

### key

`string`

Context key to extract

## Returns

`undefined` \| `T`

Context value or undefined

## Example

```typescript
const userId = getErrorContext(error, "userId") as string;
const requestId = getErrorContext(error, "requestId") as string;
```
