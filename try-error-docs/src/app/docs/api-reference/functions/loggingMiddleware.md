[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / loggingMiddleware

# Function: loggingMiddleware()

```ts
function loggingMiddleware<T, E>(logger): ErrorMiddleware<T, E>;
```

Defined in: [middleware.ts:151](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L151)

Logging middleware

## Type Parameters

### T

`T`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### logger

(`error`) => `void`

## Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>
