[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / deserializeTryError

# Function: deserializeTryError()

```ts
function deserializeTryError<T>(obj): null | TryError<T>;
```

Defined in: [types.ts:196](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L196)

Deserialize a JSON object back to a TryError
Adds back the Symbol property

## Type Parameters

### T

`T` *extends* `string` = `string`

## Parameters

### obj

`Record`\<`string`, `unknown`\>

## Returns

`null` \| [`TryError`](../interfaces/TryError.md)\<`T`\>
