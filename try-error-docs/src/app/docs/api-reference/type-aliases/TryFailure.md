[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / TryFailure

# Type Alias: TryFailure\<R\>

```ts
type TryFailure<R> = R extends TryError ? R : never;
```

Defined in: [types.ts:134](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L134)

Extract the error type from a TryResult

## Type Parameters

### R

`R`
