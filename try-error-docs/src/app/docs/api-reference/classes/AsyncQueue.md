[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / AsyncQueue

# Class: AsyncQueue\<T\>

Defined in: [async.ts:698](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L698)

Queue for managing async operations

## Type Parameters

### T

`T`

## Constructors

### Constructor

```ts
new AsyncQueue<T>(options): AsyncQueue<T>;
```

Defined in: [async.ts:706](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L706)

#### Parameters

##### options

###### concurrency?

`number`

###### onError?

(`error`) => `void`

#### Returns

`AsyncQueue`\<`T`\>

## Methods

### add()

```ts
add(fn): Promise<TryResult<T, TryError<string>>>;
```

Defined in: [async.ts:716](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L716)

Add an operation to the queue

#### Parameters

##### fn

() => `Promise`\<`T`\>

#### Returns

`Promise`\<[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

***

### clear()

```ts
clear(): void;
```

Defined in: [async.ts:765](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L765)

Clear the queue

#### Returns

`void`

***

### getSize()

```ts
getSize(): number;
```

Defined in: [async.ts:758](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/async.ts#L758)

Get current queue size

#### Returns

`number`
