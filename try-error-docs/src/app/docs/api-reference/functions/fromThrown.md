[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / fromThrown

# Function: fromThrown()

```ts
function fromThrown(cause, context?): TryError;
```

Defined in: [errors.ts:780](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L780)

Create a TryError from a thrown value with automatic type detection

## Parameters

### cause

`unknown`

The thrown value

### context?

`Record`\<`string`, `unknown`\>

Optional additional context

## Returns

[`TryError`](../interfaces/TryError.md)

A TryError with appropriate type based on the cause

## Example

```typescript
try {
  riskyOperation();
} catch (error) {
  return fromThrown(error);
}
```
