[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / isTryError

# Function: isTryError()

```ts
function isTryError<E>(value): value is E;
```

Defined in: [types.ts:75](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L75)

Type guard to check if a value is a TryError

IMPROVED: This is the most reliable type guard - use this for type narrowing
Now uses Symbol branding to prevent spoofing and validates all fields

## Type Parameters

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\> = [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### value

`unknown`

## Returns

`value is E`
