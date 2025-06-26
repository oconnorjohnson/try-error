[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / UnwrapTry

# Type Alias: UnwrapTry\<R\>

```ts
type UnwrapTry<R> = R extends TryResult<infer T, infer E> ? Exclude<T, E> : never;
```

Defined in: [types.ts:139](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L139)

Utility type to extract the data type from a TryResult

## Type Parameters

### R

`R`
