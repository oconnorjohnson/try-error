[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / enrichContextMiddleware

# Function: enrichContextMiddleware()

```ts
function enrichContextMiddleware<T, E>(enricher): ErrorMiddleware<T, E>;
```

Defined in: [middleware.ts:197](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L197)

Context enrichment middleware

## Type Parameters

### T

`T`

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### enricher

() => `Record`\<`string`, `unknown`\>

## Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>
