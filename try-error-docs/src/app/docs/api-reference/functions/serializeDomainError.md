[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / serializeDomainError

# Function: serializeDomainError()

```ts
function serializeDomainError<E>(error): Record<string, unknown>;
```

Defined in: [factories.ts:196](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L196)

Create a serializable version of domain-specific errors

## Type Parameters

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### error

`E`

The domain-specific error to serialize

## Returns

`Record`\<`string`, `unknown`\>

A JSON-safe object with all fields

## Example

```typescript
const error = createPaymentError("CardDeclined", "Card declined", {
  transactionId: "tx_123",
  amount: 99.99,
});

const serialized = serializeDomainError(error);
// Includes all domain-specific fields in addition to base fields
```
