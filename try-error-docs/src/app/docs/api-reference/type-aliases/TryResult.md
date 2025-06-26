[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / TryResult

# Type Alias: TryResult\<T, E\>

```ts
type TryResult<T, E> = T | E;
```

Defined in: [types.ts:58](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L58)

Result type for operations that might fail
Success case: returns T directly (zero overhead)
Error case: returns TryError

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md) = [`TryError`](../interfaces/TryError.md)
