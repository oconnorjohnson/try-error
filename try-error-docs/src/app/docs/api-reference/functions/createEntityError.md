[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / createEntityError

# Function: createEntityError()

```ts
function createEntityError<T>(
  entityType,
  entityId,
  errorType,
  message,
  options?
): EntityError<T>;
```

Defined in: [factories.ts:450](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L450)

Pre-built factory for entity-related errors with validation

## Type Parameters

### T

`T` _extends_ `string`

## Parameters

### entityType

`string`

### entityId

`string`

### errorType

`T`

### message

`string`

### options?

[`ErrorFactoryOptions`](../interfaces/ErrorFactoryOptions.md)

## Returns

[`EntityError`](../interfaces/EntityError.md)\<`T`\>

## Example

```typescript
const userError = createEntityError(
  "user",
  "user_123",
  "UserNotFound",
  "User not found"
);
const orderError = createEntityError(
  "order",
  "order_456",
  "OrderCancelled",
  "Order was cancelled"
);
```
