[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / circuitBreakerMiddleware

# Function: circuitBreakerMiddleware()

```ts
function circuitBreakerMiddleware<T, E>(options): ErrorMiddleware<T, E>;
```

Defined in: [middleware.ts:218](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L218)

Circuit breaker middleware

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### options

#### onClose?

() => `void`

#### onOpen?

() => `void`

#### threshold

`number`

#### timeout

`number`

## Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>
