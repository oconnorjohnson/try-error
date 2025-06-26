[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / validationError

# Function: validationError()

```ts
function validationError<T>(
   field, 
   code, 
   message, 
context?): ValidationError<T>;
```

Defined in: [factories.ts:615](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L615)

IMPROVED: More intuitive validation error factory

Common usage pattern with field and message as primary parameters

## Type Parameters

### T

`T` *extends* `string` = `"ValidationError"`

## Parameters

### field

`string`

### code

`string`

### message

`string`

### context?

`Record`\<`string`, `unknown`\>

## Returns

[`ValidationError`](../interfaces/ValidationError.md)\<`T`\>

## Example

```typescript
const error = validationError('email', 'invalid', 'Must be a valid email address', {
  value: 'invalid-email',
  pattern: /^\S+@\S+\.\S+$/
});
```
