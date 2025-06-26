[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / AmountError

# Interface: AmountError\<T\>

Defined in: [factories.ts:274](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L274)

Base type for errors involving monetary amounts (payments, billing, etc.)

Provides consistent fields for financial operations across different domains.

## Example

```typescript
interface PaymentError extends AmountError<"CardDeclined" | "InsufficientFunds"> {
  readonly transactionId: string;
}

const error: PaymentError = {
  ...createError({ type: "CardDeclined", message: "Card was declined" }),
  amount: 99.99,
  currency: "USD",
  transactionId: "tx_123"
};
```

## Extends

- [`TryError`](TryError.md)\<`T`\>

## Type Parameters

### T

`T` *extends* `string`

## Properties

### amount

```ts
readonly amount: number;
```

Defined in: [factories.ts:278](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L278)

The monetary amount involved in the error

***

### cause?

```ts
readonly optional cause: unknown;
```

Defined in: [types.ts:50](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L50)

The original error or thrown value that caused this error

#### Inherited from

[`TryError`](TryError.md).[`cause`](TryError.md#cause)

***

### context?

```ts
readonly optional context: Record<string, unknown>;
```

Defined in: [types.ts:45](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L45)

Additional context data for debugging

#### Inherited from

[`TryError`](TryError.md).[`context`](TryError.md#context)

***

### currency

```ts
readonly currency: string;
```

Defined in: [factories.ts:283](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L283)

The currency code (ISO 4217)

***

### message

```ts
readonly message: string;
```

Defined in: [types.ts:25](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L25)

Human-readable error message

#### Inherited from

[`TryError`](TryError.md).[`message`](TryError.md#message)

***

### source

```ts
readonly source: string;
```

Defined in: [types.ts:35](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L35)

Source location where the error occurred (file:line:column)

#### Inherited from

[`TryError`](TryError.md).[`source`](TryError.md#source)

***

### stack?

```ts
readonly optional stack: string;
```

Defined in: [types.ts:30](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L30)

Stack trace if available (may be stripped in production)

#### Inherited from

[`TryError`](TryError.md).[`stack`](TryError.md#stack)

***

### timestamp

```ts
readonly timestamp: number;
```

Defined in: [types.ts:40](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L40)

Timestamp when the error was created

#### Inherited from

[`TryError`](TryError.md).[`timestamp`](TryError.md#timestamp)

***

### type

```ts
readonly type: T;
```

Defined in: [types.ts:20](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L20)

The type of error - used for discriminated unions

#### Inherited from

[`TryError`](TryError.md).[`type`](TryError.md#type)
