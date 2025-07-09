[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / makeLazy

# Function: makeLazy()

```ts
function makeLazy<E>(error, lazyProps): E;
```

Defined in: [lazy.ts:75](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/lazy.ts#L75)

Wrap an existing error to make certain properties lazy

## Type Parameters

### E

`E` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### error

`E`

### lazyProps

#### context?

() => `undefined` \| `Record`\<`string`, `unknown`\>

#### source?

() => `string`

#### stack?

() => `undefined` \| `string`

## Returns

`E`
