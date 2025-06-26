[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / withDefault

# Function: withDefault()

```ts
function withDefault<T, E>(result, defaultValue): T;
```

Defined in: [utils.ts:265](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L265)

Provide a default value for error cases

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

Result that might be an error

### defaultValue

`T`

Default value to use if result is an error

## Returns

`T`

The success value or default value

## Example

```typescript
const user = withDefault(userResult, { id: "unknown", name: "Guest" });
```
