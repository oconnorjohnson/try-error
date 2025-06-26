[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / ErrorPool

# Class: ErrorPool

Defined in: [pool.ts:48](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/pool.ts#L48)

Object pool for TryError instances

## Constructors

### Constructor

```ts
new ErrorPool(maxSize): ErrorPool;
```

Defined in: [pool.ts:59](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/pool.ts#L59)

#### Parameters

##### maxSize

`number` = `100`

#### Returns

`ErrorPool`

## Methods

### acquire()

```ts
acquire<T>(): PoolableError<T> & TryError<T>;
```

Defined in: [pool.ts:106](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/pool.ts#L106)

Acquire an error from the pool

#### Type Parameters

##### T

`T` *extends* `string` = `string`

#### Returns

`PoolableError`\<`T`\> & [`TryError`](../interfaces/TryError.md)\<`T`\>

***

### clear()

```ts
clear(): void;
```

Defined in: [pool.ts:156](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/pool.ts#L156)

Clear the pool

#### Returns

`void`

***

### getStats()

```ts
getStats(): {
  activeCount: number;
  creates: number;
  hitRate: number;
  hits: number;
  maxSize: number;
  misses: number;
  poolSize: number;
  returns: number;
};
```

Defined in: [pool.ts:143](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/pool.ts#L143)

Get pool statistics

#### Returns

```ts
{
  activeCount: number;
  creates: number;
  hitRate: number;
  hits: number;
  maxSize: number;
  misses: number;
  poolSize: number;
  returns: number;
}
```

##### activeCount

```ts
activeCount: number;
```

##### creates

```ts
creates: number = 0;
```

##### hitRate

```ts
hitRate: number;
```

##### hits

```ts
hits: number = 0;
```

##### maxSize

```ts
maxSize: number;
```

##### misses

```ts
misses: number = 0;
```

##### poolSize

```ts
poolSize: number;
```

##### returns

```ts
returns: number = 0;
```

***

### release()

```ts
release(error): void;
```

Defined in: [pool.ts:125](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/pool.ts#L125)

Release an error back to the pool

#### Parameters

##### error

[`TryError`](../interfaces/TryError.md)

#### Returns

`void`

***

### resize()

```ts
resize(newSize): void;
```

Defined in: [pool.ts:164](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/pool.ts#L164)

Resize the pool

#### Parameters

##### newSize

`number`

#### Returns

`void`
