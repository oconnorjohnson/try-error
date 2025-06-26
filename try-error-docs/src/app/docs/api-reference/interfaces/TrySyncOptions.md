[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / TrySyncOptions

# Interface: TrySyncOptions

Defined in: [sync.ts:13](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L13)

Options for trySync function

## Properties

### context?

```ts
optional context: Record<string, unknown>;
```

Defined in: [sync.ts:22](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L22)

Additional context to include in error

***

### errorType?

```ts
optional errorType: string;
```

Defined in: [sync.ts:17](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L17)

Custom error type to use instead of automatic detection

***

### message?

```ts
optional message: string;
```

Defined in: [sync.ts:27](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L27)

Custom error message
