[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / filterMiddleware

# Function: filterMiddleware()

```ts
function filterMiddleware<T, E>(errorTypes, middleware): ErrorMiddleware<T, E>;
```

Defined in: [middleware.ts:294](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L294)

Create a middleware that only runs for specific error types

## Type Parameters

### T

`T`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### errorTypes

`string`[]

### middleware

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>

## Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>
