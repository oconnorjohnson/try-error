[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / areTryErrorsEqual

# Function: areTryErrorsEqual()

```ts
function areTryErrorsEqual<E1, E2>(error1, error2): boolean;
```

Defined in: [types.ts:221](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L221)

Compare two TryErrors for equality
Compares all fields except the Symbol and stack trace

## Type Parameters

### E1

`E1` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

### E2

`E2` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### error1

`E1`

### error2

`E2`

## Returns

`boolean`
