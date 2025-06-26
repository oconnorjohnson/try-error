[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / TryError

# Interface: TryError\<T\>

Defined in: [types.ts:10](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L10)

Core error type with rich context for debugging and error handling

## Extended by

- [`EntityError`](EntityError.md)
- [`AmountError`](AmountError.md)
- [`ExternalError`](ExternalError.md)
- [`ValidationError`](ValidationError.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### cause?

```ts
readonly optional cause: unknown;
```

Defined in: [types.ts:50](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L50)

The original error or thrown value that caused this error

***

### context?

```ts
readonly optional context: Record<string, unknown>;
```

Defined in: [types.ts:45](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L45)

Additional context data for debugging

***

### message

```ts
readonly message: string;
```

Defined in: [types.ts:25](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L25)

Human-readable error message

***

### source

```ts
readonly source: string;
```

Defined in: [types.ts:35](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L35)

Source location where the error occurred (file:line:column)

***

### stack?

```ts
readonly optional stack: string;
```

Defined in: [types.ts:30](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L30)

Stack trace if available (may be stripped in production)

***

### timestamp

```ts
readonly timestamp: number;
```

Defined in: [types.ts:40](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L40)

Timestamp when the error was created

***

### type

```ts
readonly type: T;
```

Defined in: [types.ts:20](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L20)

The type of error - used for discriminated unions
