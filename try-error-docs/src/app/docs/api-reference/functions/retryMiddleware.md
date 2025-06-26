[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / retryMiddleware

# Function: retryMiddleware()

```ts
function retryMiddleware<T, E>(maxAttempts, shouldRetry): ErrorMiddleware<T, E>;
```

Defined in: [middleware.ts:165](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L165)

Retry middleware

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### maxAttempts

`number`

### shouldRetry

(`error`) => `boolean`

## Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>
