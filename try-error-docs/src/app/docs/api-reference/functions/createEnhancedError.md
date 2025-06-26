[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / createEnhancedError

# Function: createEnhancedError()

```ts
function createEnhancedError(
   type, 
   message, 
   options): TryError;
```

Defined in: [utils.ts:62](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L62)

Enhanced error creation with common patterns

Provides a more convenient API for creating errors with common options.

## Parameters

### type

`string`

Error type

### message

`string`

Error message

### options

`Omit`\<[`ErrorHandlingOptions`](../interfaces/ErrorHandlingOptions.md), `"errorType"`\> = `{}`

Additional options

## Returns

[`TryError`](../interfaces/TryError.md)

A TryError with enhanced context

## Example

```typescript
const error = createEnhancedError("ValidationError", "Invalid input", {
  context: { field: "email", value: "invalid" },
  tags: ["user-input", "validation"]
});
```
