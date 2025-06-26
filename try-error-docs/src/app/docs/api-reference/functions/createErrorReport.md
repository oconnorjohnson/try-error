[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / createErrorReport

# Function: createErrorReport()

```ts
function createErrorReport(errors): string;
```

Defined in: [utils.ts:483](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L483)

Create a simple error report from multiple errors

## Parameters

### errors

[`TryError`](../interfaces/TryError.md)\<`string`\>[]

Array of errors

## Returns

`string`

Formatted error report

## Example

```typescript
const errors = filterErrors(results);
console.error(createErrorReport(errors));
```
