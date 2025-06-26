[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / TryTuple

# Type Alias: TryTuple\<T, E\>

```ts
type TryTuple<T, E> = readonly [T, null] | readonly [null, E];
```

Defined in: [types.ts:65](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L65)

Tuple result for Go-style error handling
Success: [value, null]
Error: [null, error]

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md) = [`TryError`](../interfaces/TryError.md)
