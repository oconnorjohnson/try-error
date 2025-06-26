[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / entityError

# Function: entityError()

```ts
function entityError<T>(
   entityType, 
   entityId, 
   message, 
context?): EntityError<T>;
```

Defined in: [factories.ts:698](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L698)

IMPROVED: Quick entity error factory

## Type Parameters

### T

`T` *extends* `string` = `"EntityError"`

## Parameters

### entityType

`string`

### entityId

`string`

### message

`string`

### context?

`Record`\<`string`, `unknown`\>

## Returns

[`EntityError`](../interfaces/EntityError.md)\<`T`\>

## Example

```typescript
const error = entityError('user', 'user_123', 'User not found');
```
