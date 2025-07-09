[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / fieldValidationError

# Function: fieldValidationError()

```ts
function fieldValidationError<T>(fields, code, message?): ValidationError<T>;
```

Defined in: [factories.ts:720](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L720)

IMPROVED: Multi-field validation error factory

## Type Parameters

### T

`T` _extends_ `string` = `"ValidationError"`

## Parameters

### fields

`Record`\<`string`, `string`[]\>

### code

`string` = `"VALIDATION_ERROR"`

### message?

`string`

## Returns

[`ValidationError`](../interfaces/ValidationError.md)\<`T`\>

## Example

```typescript
const error = fieldValidationError(
  {
    email: ["Must be a valid email address"],
    password: ["Must be at least 8 characters", "Must contain a number"],
  },
  "FORM_VALIDATION_ERROR"
);
```
