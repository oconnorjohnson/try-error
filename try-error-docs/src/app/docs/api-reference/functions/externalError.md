[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / externalError

# Function: externalError()

```ts
function externalError<T>(
   service, 
   operation, 
   message, 
context?): ExternalError<T>;
```

Defined in: [factories.ts:671](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L671)

IMPROVED: More intuitive external service error factory

## Type Parameters

### T

`T` *extends* `string` = `"ExternalError"`

## Parameters

### service

`string`

### operation

`string`

### message

`string`

### context?

`Record`\<`string`, `unknown`\> & \{
  `externalId?`: `string`;
  `statusCode?`: `number`;
\}

## Returns

[`ExternalError`](../interfaces/ExternalError.md)\<`T`\>

## Example

```typescript
const error = externalError('API', 'failed', 'Service unavailable', {
  transactionId: 'tx_123',
  statusCode: 503
});
```
