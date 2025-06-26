[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / serializeTryError

# Function: serializeTryError()

```ts
function serializeTryError<E>(error): Record<string, unknown>;
```

Defined in: [types.ts:182](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L182)

Serialize a TryError to a JSON-safe format
Removes the Symbol property and converts to a plain object

## Type Parameters

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### error

`E`

## Returns

`Record`\<`string`, `unknown`\>
