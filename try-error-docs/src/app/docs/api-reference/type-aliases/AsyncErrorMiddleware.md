[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / AsyncErrorMiddleware

# Type Alias: AsyncErrorMiddleware()\<T, E\>

```ts
type AsyncErrorMiddleware<T, E> = (result, next) => Promise<TryResult<T, E>>;
```

Defined in: [middleware.ts:21](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L21)

Async middleware function signature

## Type Parameters

### T

`T` = `any`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md) = [`TryError`](../interfaces/TryError.md)

## Parameters

### result

`Promise`\<[`TryResult`](TryResult.md)\<`T`, `E`\>\>

### next

() => `Promise`\<[`TryResult`](TryResult.md)\<`T`, `E`\>\>

## Returns

`Promise`\<[`TryResult`](TryResult.md)\<`T`, `E`\>\>
