[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / CircuitBreaker

# Class: CircuitBreaker

Defined in: [sync.ts:467](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L467)

Circuit breaker pattern for synchronous operations

## Example

```typescript
const breaker = createCircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000
});

const result = breaker.execute(() => riskyOperation());
```

## Constructors

### Constructor

```ts
new CircuitBreaker(options): CircuitBreaker;
```

Defined in: [sync.ts:472](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L472)

#### Parameters

##### options

###### failureThreshold

`number`

###### onClose?

() => `void`

###### onOpen?

() => `void`

###### resetTimeout

`number`

#### Returns

`CircuitBreaker`

## Methods

### execute()

```ts
execute<T>(fn): TryResult<T, TryError<string>>;
```

Defined in: [sync.ts:481](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L481)

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

() => `T`

#### Returns

[`TryResult`](../type-aliases/TryResult.md)\<`T`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

***

### getState()

```ts
getState(): "closed" | "open" | "half-open";
```

Defined in: [sync.ts:525](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L525)

#### Returns

`"closed"` \| `"open"` \| `"half-open"`

***

### reset()

```ts
reset(): void;
```

Defined in: [sync.ts:519](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L519)

#### Returns

`void`
