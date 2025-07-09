[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / rateLimitMiddleware

# Function: rateLimitMiddleware()

```ts
function rateLimitMiddleware<T, E>(windowMs, maxErrors): ErrorMiddleware<T, E>;
```

Defined in: [middleware.ts:309](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L309)

Time-based rate limiting middleware

## Type Parameters

### T

`T`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### windowMs

`number`

### maxErrors

`number`

## Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>
