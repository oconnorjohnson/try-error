[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / amountError

# Function: amountError()

```ts
function amountError<T>(
  requestedAmount,
  availableAmount,
  errorCode,
  message,
  currency
): AmountError<T>;
```

Defined in: [factories.ts:638](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L638)

IMPROVED: More intuitive amount error factory

## Type Parameters

### T

`T` _extends_ `string` = `"AmountError"`

## Parameters

### requestedAmount

`number`

### availableAmount

`number`

### errorCode

`string`

### message

`string`

### currency

`string` = `"USD"`

## Returns

[`AmountError`](../interfaces/AmountError.md)\<`T`\>

## Example

```typescript
const error = amountError(
  150,
  100,
  "insufficient",
  "Insufficient funds available"
);
```
