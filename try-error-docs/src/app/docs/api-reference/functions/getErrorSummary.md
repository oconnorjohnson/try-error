[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / getErrorSummary

# Function: getErrorSummary()

```ts
function getErrorSummary(errors): Record<string, number>;
```

Defined in: [utils.ts:420](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L420)

Get a summary of error types from an array of errors

## Parameters

### errors

[`TryError`](../interfaces/TryError.md)\<`string`\>[]

Array of errors

## Returns

`Record`\<`string`, `number`\>

Object with error type counts

## Example

```typescript
const errors = filterErrors(results);
const summary = getErrorSummary(errors);
// { "ValidationError": 3, "NetworkError": 1 }
```
