[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / correlateErrors

# Function: correlateErrors()

```ts
function correlateErrors<E>(errors, correlationFn): E[][];
```

Defined in: [utils.ts:730](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L730)

Correlate related errors across operations

## Type Parameters

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### errors

`E`[]

Array of errors to correlate

### correlationFn

(`error1`, `error2`) => `boolean`

Function to determine if errors are related

## Returns

`E`[][]

Array of correlated error groups

## Example

```typescript
const errors = await collectErrors();
const correlated = correlateErrors(errors, (e1, e2) => {
  // Errors are related if they have the same transaction ID
  return e1.context?.transactionId === e2.context?.transactionId;
});
```
