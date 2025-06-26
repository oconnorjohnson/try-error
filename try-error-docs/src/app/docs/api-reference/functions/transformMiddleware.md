[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / transformMiddleware

# Function: transformMiddleware()

```ts
function transformMiddleware<T, E>(transform): ErrorMiddleware<T, E>;
```

Defined in: [middleware.ts:183](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L183)

Error transformation middleware

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### transform

(`error`) => `E`

## Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>
