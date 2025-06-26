[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / withProgress

# Function: withProgress()

```ts
function withProgress<T>(fn, options?): ProgressTracker<T>;
```

Defined in: [async.ts:581](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L581)

Create an async operation with progress tracking

## Type Parameters

### T

`T`

## Parameters

### fn

(`setProgress`) => `Promise`\<`T`\>

Async function that receives a progress callback

### options?

[`TryAsyncOptions`](../interfaces/TryAsyncOptions.md)

Optional configuration

## Returns

[`ProgressTracker`](../interfaces/ProgressTracker.md)\<`T`\>

ProgressTracker with promise and progress methods

## Example

```typescript
const tracker = withProgress(async (setProgress) => {
  setProgress(0);
  await processChunk1();
  setProgress(33);
  await processChunk2();
  setProgress(66);
  await processChunk3();
  setProgress(100);
  return result;
});

// Check progress
const interval = setInterval(() => {
  console.log(`Progress: ${tracker.getProgress()}%`);
}, 1000);

const result = await tracker.promise;
clearInterval(interval);
```
