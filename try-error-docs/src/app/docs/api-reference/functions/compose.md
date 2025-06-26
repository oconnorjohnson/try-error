[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / compose

# Function: compose()

```ts
function compose<T, E>(...middleware): ErrorMiddleware<T, E>;
```

Defined in: [middleware.ts:272](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L272)

Compose multiple middleware into a single middleware

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### middleware

...[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>[]

## Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>
