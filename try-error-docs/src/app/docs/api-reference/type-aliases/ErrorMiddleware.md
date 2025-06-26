[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / ErrorMiddleware

# Type Alias: ErrorMiddleware()\<T, E\>

```ts
type ErrorMiddleware<T, E> = (result, next) => TryResult<T, E>;
```

Defined in: [middleware.ts:13](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L13)

Middleware function signature

## Type Parameters

### T

`T` = `any`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md) = [`TryError`](../interfaces/TryError.md)

## Parameters

### result

[`TryResult`](TryResult.md)\<`T`, `E`\>

### next

() => [`TryResult`](TryResult.md)\<`T`, `E`\>

## Returns

[`TryResult`](TryResult.md)\<`T`, `E`\>
