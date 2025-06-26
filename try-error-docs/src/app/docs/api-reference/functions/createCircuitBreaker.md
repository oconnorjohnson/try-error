[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / createCircuitBreaker

# Function: createCircuitBreaker()

```ts
function createCircuitBreaker(options): CircuitBreaker;
```

Defined in: [sync.ts:533](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L533)

Create a circuit breaker instance

## Parameters

### options

#### failureThreshold

`number`

#### onClose?

() => `void`

#### onOpen?

() => `void`

#### resetTimeout

`number`

## Returns

[`CircuitBreaker`](../classes/CircuitBreaker.md)
