[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / MiddlewarePipeline

# Class: MiddlewarePipeline\<T, E\>

Defined in: [middleware.ts:46](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L46)

Middleware pipeline for composing multiple middleware

## Type Parameters

### T

`T` = `any`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md) = [`TryError`](../interfaces/TryError.md)

## Constructors

### Constructor

```ts
new MiddlewarePipeline<T, E>(): MiddlewarePipeline<T, E>;
```

#### Returns

`MiddlewarePipeline`\<`T`, `E`\>

## Accessors

### length

#### Get Signature

```ts
get length(): number;
```

Defined in: [middleware.ts:102](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L102)

Get the number of middleware in the pipeline

##### Returns

`number`

## Methods

### clone()

```ts
clone(): MiddlewarePipeline<T, E>;
```

Defined in: [middleware.ts:93](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L93)

Clone the pipeline

#### Returns

`MiddlewarePipeline`\<`T`, `E`\>

***

### execute()

```ts
execute(initialResult, finalHandler?): TryResult<T, E>;
```

Defined in: [middleware.ts:60](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L60)

Execute the middleware pipeline

#### Parameters

##### initialResult

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

##### finalHandler?

() => [`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

#### Returns

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

***

### use()

```ts
use(middleware): this;
```

Defined in: [middleware.ts:52](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L52)

Add middleware to the pipeline

#### Parameters

##### middleware

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)\<`T`, `E`\>

#### Returns

`this`

***

### wrap()

```ts
wrap<Args>(fn): (...args) => TryResult<T, E>;
```

Defined in: [middleware.ts:81](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/middleware.ts#L81)

Create a wrapped function that applies the middleware pipeline

#### Type Parameters

##### Args

`Args` *extends* `any`[]

#### Parameters

##### fn

(...`args`) => [`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>

#### Returns

```ts
(...args): TryResult<T, E>;
```

##### Parameters

###### args

...`Args`

##### Returns

[`TryResult`](../type-aliases/TryResult.md)\<`T`, `E`\>
