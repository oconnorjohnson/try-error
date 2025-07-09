[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / wrapWithContext

# Function: wrapWithContext()

```ts
function wrapWithContext<E>(error, additionalContext): E;
```

Defined in: [factories.ts:424](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L424)

Wrap an error with additional context while preserving the original type

Useful for adding context to an error without changing its type,
such as adding request IDs or user context.

## Type Parameters

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### error

`E`

The original error

### additionalContext

`Record`\<`string`, `unknown`\>

Additional context to merge

## Returns

`E`

The same error with additional context

## Example

```typescript
const error = createError({
  type: "ValidationError",
  message: "Invalid input",
});
const contextualError = wrapWithContext(error, {
  requestId: "req_123",
  userId: "user_456",
});
```
