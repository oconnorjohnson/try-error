[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / createErrorFactory

# Function: createErrorFactory()

```ts
function createErrorFactory<T, E>(
   defaultFields?, 
   requiredFields?, 
   factoryName?): (type, message, domainFields?, options?) => E;
```

Defined in: [factories.ts:73](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L73)

Creates a factory function for domain-specific errors

This eliminates boilerplate when creating multiple error types in the same domain.
Each domain can have its own factory with consistent defaults.

## Type Parameters

### T

`T` *extends* `string`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`T`\>

## Parameters

### defaultFields?

`Partial`\<`Omit`\<`E`, keyof [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

Default fields to include in all errors from this factory

### requiredFields?

`Exclude`\<keyof `E`, keyof [`TryError`](../interfaces/TryError.md)\<`string`\>\>[]

Fields that must be provided when creating errors

### factoryName?

`string`

Optional name for registry

## Returns

A factory function for creating errors of type E

```ts
(
   type, 
   message, 
   domainFields?, 
   options?): E;
```

### Parameters

#### type

`T`

#### message

`string`

#### domainFields?

`Partial`\<`Omit`\<`E`, keyof [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

#### options?

[`ErrorFactoryOptions`](../interfaces/ErrorFactoryOptions.md)

### Returns

`E`

## Example

```typescript
type PaymentErrorType = "CardDeclined" | "InsufficientFunds" | "ProcessingError";
interface PaymentError extends TryError<PaymentErrorType> {
  readonly transactionId: string;
  readonly amount: number;
  readonly provider: string;
}

const createPaymentError = createErrorFactory<PaymentErrorType, PaymentError>({
  provider: "stripe" // Default for all payment errors
}, ["transactionId", "amount"]);

const error = createPaymentError("CardDeclined", "Card was declined", {
  transactionId: "tx_123",
  amount: 99.99
});
```
