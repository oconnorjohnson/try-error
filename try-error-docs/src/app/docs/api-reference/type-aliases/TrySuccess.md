[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / TrySuccess

# Type Alias: TrySuccess\<T\>

```ts
type TrySuccess<T> = T extends TryError ? never : T;
```

Defined in: [types.ts:129](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L129)

Extract the success type from a TryResult

## Type Parameters

### T

`T`
