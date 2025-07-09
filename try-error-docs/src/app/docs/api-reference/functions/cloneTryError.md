[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / cloneTryError

# Function: cloneTryError()

```ts
function cloneTryError<E>(error, modifications?): E;
```

Defined in: [types.ts:239](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L239)

Clone a TryError with optional modifications
Creates a new error with the same properties, optionally overriding some

## Type Parameters

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### error

`E`

### modifications?

`Partial`\<`Omit`\<`E`, _typeof_ `TRY_ERROR_BRAND`\>\>

## Returns

`E`
