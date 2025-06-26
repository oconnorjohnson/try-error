[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / unwrapTryResult

# Function: unwrapTryResult()

```ts
function unwrapTryResult<T, E>(result): 
  | {
  data: T;
  success: true;
}
  | {
  error: E;
  success: false;
};
```

Defined in: [types.ts:169](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L169)

IMPROVED: Type-safe result unwrapping with better inference

## Type Parameters

### T

`T`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

## Returns

  \| \{
  `data`: `T`;
  `success`: `true`;
\}
  \| \{
  `error`: `E`;
  `success`: `false`;
\}
