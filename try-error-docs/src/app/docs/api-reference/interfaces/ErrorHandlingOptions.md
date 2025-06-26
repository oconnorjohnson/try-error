[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / ErrorHandlingOptions

# Interface: ErrorHandlingOptions

Defined in: [utils.ts:17](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L17)

Options for enhanced error handling

## Properties

### context?

```ts
optional context: Record<string, unknown>;
```

Defined in: [utils.ts:26](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L26)

Additional context to include in error

***

### errorType?

```ts
optional errorType: string;
```

Defined in: [utils.ts:21](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L21)

Custom error type to use instead of automatic detection

***

### includeStack?

```ts
optional includeStack: boolean;
```

Defined in: [utils.ts:36](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L36)

Whether to include stack trace (defaults to true in development)

***

### message?

```ts
optional message: string;
```

Defined in: [utils.ts:31](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L31)

Custom error message

***

### tags?

```ts
optional tags: string[];
```

Defined in: [utils.ts:41](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L41)

Tags for categorizing errors
