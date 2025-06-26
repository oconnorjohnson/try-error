[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / ValidationError

# Interface: ValidationError\<T\>

Defined in: [factories.ts:345](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L345)

Base type for validation errors with field-level details

Provides a consistent structure for validation errors across different forms/inputs.

## Example

```typescript
interface FormValidationError extends ValidationError<"FormValidation"> {
  readonly formId: string;
}

const error: FormValidationError = {
  ...createError({ type: "FormValidation", message: "Form validation failed" }),
  fields: {
    email: ["Must be a valid email address"],
    password: ["Must be at least 8 characters", "Must contain a number"]
  },
  code: "FORM_VALIDATION_ERROR",
  formId: "user-signup"
};
```

## Extends

- [`TryError`](TryError.md)\<`T`\>

## Type Parameters

### T

`T` *extends* `string`

## Properties

### cause?

```ts
readonly optional cause: unknown;
```

Defined in: [types.ts:50](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L50)

The original error or thrown value that caused this error

#### Inherited from

[`TryError`](TryError.md).[`cause`](TryError.md#cause)

***

### code

```ts
readonly code: string;
```

Defined in: [factories.ts:355](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L355)

Validation error code for programmatic handling

***

### context?

```ts
readonly optional context: Record<string, unknown>;
```

Defined in: [types.ts:45](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L45)

Additional context data for debugging

#### Inherited from

[`TryError`](TryError.md).[`context`](TryError.md#context)

***

### fields

```ts
readonly fields: Record<string, string[]>;
```

Defined in: [factories.ts:350](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L350)

Field-level validation errors
Key is the field name, value is array of error messages for that field

***

### message

```ts
readonly message: string;
```

Defined in: [types.ts:25](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L25)

Human-readable error message

#### Inherited from

[`TryError`](TryError.md).[`message`](TryError.md#message)

***

### source

```ts
readonly source: string;
```

Defined in: [types.ts:35](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L35)

Source location where the error occurred (file:line:column)

#### Inherited from

[`TryError`](TryError.md).[`source`](TryError.md#source)

***

### stack?

```ts
readonly optional stack: string;
```

Defined in: [types.ts:30](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L30)

Stack trace if available (may be stripped in production)

#### Inherited from

[`TryError`](TryError.md).[`stack`](TryError.md#stack)

***

### timestamp

```ts
readonly timestamp: number;
```

Defined in: [types.ts:40](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L40)

Timestamp when the error was created

#### Inherited from

[`TryError`](TryError.md).[`timestamp`](TryError.md#timestamp)

***

### type

```ts
readonly type: T;
```

Defined in: [types.ts:20](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L20)

The type of error - used for discriminated unions

#### Inherited from

[`TryError`](TryError.md).[`type`](TryError.md#type)
