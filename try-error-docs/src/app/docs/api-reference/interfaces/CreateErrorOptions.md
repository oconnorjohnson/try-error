[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / CreateErrorOptions

# Interface: CreateErrorOptions\<T\>

Defined in: [errors.ts:66](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L66)

Options for creating a TryError

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### captureStackTrace?

```ts
optional captureStackTrace: boolean;
```

Defined in: [errors.ts:108](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L108)

Whether to capture stack trace for this specific error
Overrides global configuration

***

### cause?

```ts
optional cause: unknown;
```

Defined in: [errors.ts:85](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L85)

The original error or thrown value that caused this error

***

### context?

```ts
optional context: Record<string, unknown>;
```

Defined in: [errors.ts:80](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L80)

Additional context data for debugging

***

### message

```ts
message: string;
```

Defined in: [errors.ts:75](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L75)

Human-readable error message

***

### source?

```ts
optional source: string;
```

Defined in: [errors.ts:90](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L90)

Override the automatically detected source location

***

### stackOffset?

```ts
optional stackOffset: number;
```

Defined in: [errors.ts:102](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L102)

Stack offset for source location detection
Useful when wrapping error creation in utility functions

#### Default

```ts
3
```

***

### timestamp?

```ts
optional timestamp: number;
```

Defined in: [errors.ts:95](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L95)

Override the automatically generated timestamp

***

### type

```ts
type: T;
```

Defined in: [errors.ts:70](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/errors.ts#L70)

The error type - used for discriminated unions
