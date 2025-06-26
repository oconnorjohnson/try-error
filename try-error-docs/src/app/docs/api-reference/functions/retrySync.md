[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / retrySync

# Function: retrySync()

```ts
function retrySync<T>(fn, options): TryResult<T, TryError<string>>;
```

Defined in: [sync.ts:416](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L416)

Retry a synchronous operation with configurable attempts

## Type Parameters

### T

`T`

## Parameters

### fn

() => `T`

Function to retry

### options

Retry configuration

#### attempts

`number`

#### delay?

`number`

#### shouldRetry?

(`error`, `attempt`) => `boolean`

## Returns

[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

TryResult with final result or last error

## Example

```typescript
const result = retrySync(
  () => readFileSync('config.json'),
  { attempts: 3, delay: 100 }
);
```
