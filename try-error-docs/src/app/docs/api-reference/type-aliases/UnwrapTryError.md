[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / UnwrapTryError

# Type Alias: UnwrapTryError\<R\>

```ts
type UnwrapTryError<R> = R extends TryResult<any, infer E> ? E : never;
```

Defined in: [types.ts:146](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L146)

Utility type to extract the error type from a TryResult

## Type Parameters

### R

`R`
