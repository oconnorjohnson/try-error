[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / createExternalError

# Function: createExternalError()

```ts
function createExternalError<T>(
   provider, 
   errorType, 
   message, 
options?): ExternalError<T>;
```

Defined in: [factories.ts:523](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L523)

Pre-built factory for external service errors with validation

## Type Parameters

### T

`T` *extends* `string`

## Parameters

### provider

`string`

### errorType

`T`

### message

`string`

### options?

[`ErrorFactoryOptions`](../interfaces/ErrorFactoryOptions.md) & \{
  `externalId?`: `string`;
  `statusCode?`: `number`;
\}

## Returns

[`ExternalError`](../interfaces/ExternalError.md)\<`T`\>

## Example

```typescript
const apiError = createExternalError("stripe", "NetworkError", "Connection failed", {
  statusCode: 500,
  externalId: "req_123"
});
```
