[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / withFallback

# Function: withFallback()

```ts
function withFallback<T>(
   primary, 
   fallback, 
shouldFallback?): TryResult<T, TryError<string>>;
```

Defined in: [sync.ts:559](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L559)

Error recovery pattern - try operation with fallback

## Type Parameters

### T

`T`

## Parameters

### primary

() => `T`

Primary operation to try

### fallback

() => `T`

Fallback operation if primary fails

### shouldFallback?

(`error`) => `boolean`

Optional predicate to determine if fallback should be used

## Returns

[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

Result from primary or fallback operation

## Example

```typescript
const config = withFallback(
  () => JSON.parse(readFileSync('config.json', 'utf8')),
  () => ({ defaultConfig: true }),
  (error) => error.type === 'SyntaxError'
);
```
