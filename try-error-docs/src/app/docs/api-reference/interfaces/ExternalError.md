[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / ExternalError

# Interface: ExternalError\<T\>

Defined in: [factories.ts:306](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L306)

Base type for errors from external services (APIs, third-party services, etc.)

Provides consistent fields for external service errors across different integrations.

## Example

```typescript
interface ApiError extends ExternalError<"NetworkError" | "AuthError" | "RateLimited"> {
  readonly endpoint: string;
}

const error: ApiError = {
  ...createError({ type: "RateLimited", message: "Rate limit exceeded" }),
  provider: "stripe",
  externalId: "req_123",
  statusCode: 429,
  endpoint: "/v1/charges"
};
```

## Extends

- [`TryError`](TryError.md)\<`T`\>

## Type Parameters

### T

`T` *extends* `string`

## Properties

### cause?

```ts
readonly optional cause: unknown;
```

Defined in: [types.ts:50](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L50)

The original error or thrown value that caused this error

#### Inherited from

[`TryError`](TryError.md).[`cause`](TryError.md#cause)

***

### context?

```ts
readonly optional context: Record<string, unknown>;
```

Defined in: [types.ts:45](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L45)

Additional context data for debugging

#### Inherited from

[`TryError`](TryError.md).[`context`](TryError.md#context)

***

### externalId?

```ts
readonly optional externalId: string;
```

Defined in: [factories.ts:315](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L315)

External reference ID (request ID, transaction ID, etc.)

***

### message

```ts
readonly message: string;
```

Defined in: [types.ts:25](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L25)

Human-readable error message

#### Inherited from

[`TryError`](TryError.md).[`message`](TryError.md#message)

***

### provider

```ts
readonly provider: string;
```

Defined in: [factories.ts:310](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L310)

The name of the external service/provider

***

### source

```ts
readonly source: string;
```

Defined in: [types.ts:35](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L35)

Source location where the error occurred (file:line:column)

#### Inherited from

[`TryError`](TryError.md).[`source`](TryError.md#source)

***

### stack?

```ts
readonly optional stack: string;
```

Defined in: [types.ts:30](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L30)

Stack trace if available (may be stripped in production)

#### Inherited from

[`TryError`](TryError.md).[`stack`](TryError.md#stack)

***

### statusCode?

```ts
readonly optional statusCode: number;
```

Defined in: [factories.ts:320](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L320)

HTTP status code or equivalent error code

***

### timestamp

```ts
readonly timestamp: number;
```

Defined in: [types.ts:40](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L40)

Timestamp when the error was created

#### Inherited from

[`TryError`](TryError.md).[`timestamp`](TryError.md#timestamp)

***

### type

```ts
readonly type: T;
```

Defined in: [types.ts:20](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L20)

The type of error - used for discriminated unions

#### Inherited from

[`TryError`](TryError.md).[`type`](TryError.md#type)
