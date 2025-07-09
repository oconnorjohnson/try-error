[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / ContextualMiddleware

# Type Alias: ContextualMiddleware()\<T, E\>

```ts
type ContextualMiddleware<T, E> = (result, context, next) => TryResult<T, E>;
```

Defined in: [middleware.ts:37](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L37)

Enhanced middleware with context support

## Type Parameters

### T

`T` = `any`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md) = [`TryError`](../interfaces/TryError.md)

## Parameters

### result

[`TryResult`](TryResult.md)\<`T`, `E`\>

### context

[`MiddlewareContext`](../interfaces/MiddlewareContext.md)

### next

() => [`TryResult`](TryResult.md)\<`T`, `E`\>

## Returns

[`TryResult`](TryResult.md)\<`T`, `E`\>
