[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / createLazyError

# Function: createLazyError()

```ts
function createLazyError<T>(options): TryError<T>;
```

Defined in: [lazy.ts:37](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/lazy.ts#L37)

Create a lazy error where expensive properties are computed on demand

## Type Parameters

### T

`T` _extends_ `string` = `string`

## Parameters

### options

#### cause?

`unknown`

#### context?

`Record`\<`string`, `unknown`\>

#### getSource

() => `string`

#### getStack?

() => `undefined` \| `string`

#### getTimestamp?

() => `number`

#### message

`string`

#### type

`T`

## Returns

[`TryError`](../interfaces/TryError.md)\<`T`\>
