[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / matchTryResult

# Function: matchTryResult()

```ts
function matchTryResult<T, E, U>(result, handlers): U;
```

Defined in: [types.ts:153](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L153)

IMPROVED: Discriminated union helper for better type inference

This helps TypeScript understand the discriminated union pattern better

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

### U

`U`

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

### handlers

#### error

(`error`) => `U`

#### success

(`value`) => `U`

## Returns

`U`
