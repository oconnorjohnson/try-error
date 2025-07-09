[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / createAmountError

# Function: createAmountError()

```ts
function createAmountError<T>(
  amount,
  currency,
  errorType,
  message,
  options?
): AmountError<T>;
```

Defined in: [factories.ts:484](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L484)

Pre-built factory for amount-related errors with validation

## Type Parameters

### T

`T` _extends_ `string`

## Parameters

### amount

`number`

### currency

`string`

### errorType

`T`

### message

`string`

### options?

[`ErrorFactoryOptions`](../interfaces/ErrorFactoryOptions.md)

## Returns

[`AmountError`](../interfaces/AmountError.md)\<`T`\>

## Example

```typescript
const paymentError = createAmountError(
  99.99,
  "USD",
  "InsufficientFunds",
  "Insufficient funds"
);
```
