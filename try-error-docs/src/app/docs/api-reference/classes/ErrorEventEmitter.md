[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / ErrorEventEmitter

# Class: ErrorEventEmitter

Defined in: [events.ts:51](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L51)

Event emitter for error lifecycle

## Constructors

### Constructor

```ts
new ErrorEventEmitter(): ErrorEventEmitter;
```

#### Returns

`ErrorEventEmitter`

## Methods

### clear()

```ts
clear(): void;
```

Defined in: [events.ts:180](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L180)

Clear all listeners

#### Returns

`void`

***

### emit()

```ts
emit(event): void;
```

Defined in: [events.ts:118](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L118)

Emit an event

#### Parameters

##### event

[`ErrorEvent`](../type-aliases/ErrorEvent.md)

#### Returns

`void`

***

### getListenerCount()

```ts
getListenerCount(eventType?): number;
```

Defined in: [events.ts:189](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L189)

Get listener count

#### Parameters

##### eventType?

`"error:created"` | `"error:transformed"` | `"error:pooled"` | `"error:released"` | `"error:serialized"` | `"error:wrapped"` | `"error:retry"` | `"error:recovered"`

#### Returns

`number`

***

### off()

```ts
off(eventType, listener): void;
```

Defined in: [events.ts:104](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L104)

Unsubscribe from a specific event type

#### Parameters

##### eventType

`"error:created"` | `"error:transformed"` | `"error:pooled"` | `"error:released"` | `"error:serialized"` | `"error:wrapped"` | `"error:retry"` | `"error:recovered"`

##### listener

[`ErrorEventListener`](../type-aliases/ErrorEventListener.md)

#### Returns

`void`

***

### offAll()

```ts
offAll(listener): void;
```

Defined in: [events.ts:111](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L111)

Unsubscribe from all events

#### Parameters

##### listener

[`ErrorEventListener`](../type-aliases/ErrorEventListener.md)

#### Returns

`void`

***

### on()

```ts
on(eventType, listener): () => void;
```

Defined in: [events.ts:61](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L61)

Subscribe to a specific event type

#### Parameters

##### eventType

`"error:created"` | `"error:transformed"` | `"error:pooled"` | `"error:released"` | `"error:serialized"` | `"error:wrapped"` | `"error:retry"` | `"error:recovered"`

##### listener

[`ErrorEventListener`](../type-aliases/ErrorEventListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`

***

### onAll()

```ts
onAll(listener): () => void;
```

Defined in: [events.ts:76](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L76)

Subscribe to all events

#### Parameters

##### listener

[`ErrorEventListener`](../type-aliases/ErrorEventListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`

***

### once()

```ts
once(eventType, listener): () => void;
```

Defined in: [events.ts:88](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L88)

Subscribe to an event once

#### Parameters

##### eventType

`"error:created"` | `"error:transformed"` | `"error:pooled"` | `"error:released"` | `"error:serialized"` | `"error:wrapped"` | `"error:retry"` | `"error:recovered"`

##### listener

[`ErrorEventListener`](../type-aliases/ErrorEventListener.md)

#### Returns

```ts
(): void;
```

##### Returns

`void`
