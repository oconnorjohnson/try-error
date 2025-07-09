[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / TryAsyncOptions

# Interface: TryAsyncOptions

Defined in: [async.ts:13](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L13)

Options for tryAsync function

## Properties

### context?

```ts
optional context: Record<string, unknown>;
```

Defined in: [async.ts:22](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L22)

Additional context to include in error

---

### errorType?

```ts
optional errorType: string;
```

Defined in: [async.ts:17](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L17)

Custom error type to use instead of automatic detection

---

### message?

```ts
optional message: string;
```

Defined in: [async.ts:27](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L27)

Custom error message

---

### signal?

```ts
optional signal: AbortSignal;
```

Defined in: [async.ts:37](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L37)

AbortSignal for cancellation (optional)

---

### timeout?

```ts
optional timeout: number;
```

Defined in: [async.ts:32](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L32)

Timeout in milliseconds (optional)
