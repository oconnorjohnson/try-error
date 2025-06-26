[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / cloneTryError

# Function: cloneTryError()

```ts
function cloneTryError<E>(error, modifications?): E;
```

Defined in: [types.ts:239](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L239)

Clone a TryError with optional modifications
Creates a new error with the same properties, optionally overriding some

## Type Parameters

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### error

`E`

### modifications?

`Partial`\<`Omit`\<`E`, *typeof* `TRY_ERROR_BRAND`\>\>

## Returns

`E`
