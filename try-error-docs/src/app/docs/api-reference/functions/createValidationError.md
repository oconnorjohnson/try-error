[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / createValidationError

# Function: createValidationError()

```ts
function createValidationError<T>(
   errorType, 
   message, 
   fields, 
   code, 
options?): ValidationError<T>;
```

Defined in: [factories.ts:563](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L563)

Pre-built factory for validation errors with field validation

## Type Parameters

### T

`T` *extends* `string`

## Parameters

### errorType

`T`

### message

`string`

### fields

`Record`\<`string`, `string`[]\>

### code

`string`

### options?

[`ErrorFactoryOptions`](../interfaces/ErrorFactoryOptions.md)

## Returns

[`ValidationError`](../interfaces/ValidationError.md)\<`T`\>

## Example

```typescript
const validationError = createValidationError("FormValidation", "Form validation failed", {
  email: ["Must be a valid email"],
  password: ["Must be at least 8 characters"]
}, "FORM_VALIDATION_ERROR");
```
