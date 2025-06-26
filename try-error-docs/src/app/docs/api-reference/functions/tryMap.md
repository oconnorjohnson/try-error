[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / tryMap

# Function: tryMap()

```ts
function tryMap<T, U, E>(result, mapper): TryResult<U, TryError<string> | E>;
```

Defined in: [sync.ts:182](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L182)

Transform a successful result, leaving errors unchanged

## Type Parameters

### T

`T`

### U

`U`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

The result to transform

### mapper

(`value`) => `U`

Function to transform the success value

## Returns

[`TryResult`](../type-aliases/TryResult.md)\<`U`, [`TryError`](../interfaces/TryError.md)\<`string`\> \| `E`\>

Transformed result or original error

## Example

```typescript
const parseResult = trySync(() => JSON.parse(jsonString));
const upperResult = tryMap(parseResult, (obj) => obj.name.toUpperCase());
```
