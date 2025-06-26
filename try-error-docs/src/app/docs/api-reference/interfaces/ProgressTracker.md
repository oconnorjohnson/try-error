[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / ProgressTracker

# Interface: ProgressTracker\<T\>

Defined in: [async.ts:546](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L546)

Progress tracking for long-running async operations

## Type Parameters

### T

`T`

## Properties

### cancel()

```ts
cancel: () => void;
```

Defined in: [async.ts:549](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L549)

#### Returns

`void`

***

### getProgress()

```ts
getProgress: () => number;
```

Defined in: [async.ts:548](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L548)

#### Returns

`number`

***

### promise

```ts
promise: Promise<TryResult<T, TryError<string>>>;
```

Defined in: [async.ts:547](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L547)
