[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / formatErrorForLogging

# Function: formatErrorForLogging()

```ts
function formatErrorForLogging(error, includeStack): string;
```

Defined in: [utils.ts:447](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L447)

Format an error for logging with all context
Uses efficient string building

## Parameters

### error

[`TryError`](../interfaces/TryError.md)

Error to format

### includeStack

`boolean` = `false`

Whether to include stack trace

## Returns

`string`

Formatted error string

## Example

```typescript
console.error(formatErrorForLogging(error, true));
```
