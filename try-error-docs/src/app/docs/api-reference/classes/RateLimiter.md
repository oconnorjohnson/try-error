[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / RateLimiter

# Class: RateLimiter

Defined in: [async.ts:619](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L619)

Rate limiter for async operations

## Constructors

### Constructor

```ts
new RateLimiter(options): RateLimiter;
```

Defined in: [async.ts:623](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L623)

#### Parameters

##### options

###### maxConcurrent

`number`

###### minDelay?

`number`

#### Returns

`RateLimiter`

## Methods

### execute()

```ts
execute<T>(fn): Promise<TryResult<T, TryError<string>>>;
```

Defined in: [async.ts:633](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L633)

Execute an async operation with rate limiting

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

() => `Promise`\<`T`\>

#### Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

***

### getActiveCount()

```ts
getActiveCount(): number;
```

Defined in: [async.ts:680](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L680)

Get number of active operations

#### Returns

`number`

***

### getQueueSize()

```ts
getQueueSize(): number;
```

Defined in: [async.ts:673](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L673)

Get current queue size

#### Returns

`number`
