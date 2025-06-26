[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / PerformanceConfig

# Interface: PerformanceConfig

Defined in: [config.ts:221](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L221)

Performance-specific configuration options

## Properties

### contextCapture?

```ts
optional contextCapture: {
  deepClone?: boolean;
  maxContextSize?: number;
  timeout?: number;
};
```

Defined in: [config.ts:254](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L254)

Context capture optimization settings

#### deepClone?

```ts
optional deepClone: boolean;
```

Whether to deep clone context objects

##### Default

```ts
true
```

#### maxContextSize?

```ts
optional maxContextSize: number;
```

Maximum context size in bytes

##### Default

```ts
10240 (10KB)
```

#### timeout?

```ts
optional timeout: number;
```

Timeout for async context capture in milliseconds

##### Default

```ts
100
```

***

### errorCreation?

```ts
optional errorCreation: {
  cacheConstructors?: boolean;
  lazyStackTrace?: boolean;
  objectPooling?: boolean;
  poolSize?: number;
};
```

Defined in: [config.ts:225](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L225)

Error creation optimization settings

#### cacheConstructors?

```ts
optional cacheConstructors: boolean;
```

Cache error constructors for reuse

##### Default

```ts
false
```

#### lazyStackTrace?

```ts
optional lazyStackTrace: boolean;
```

Only capture stack trace when accessed (lazy)

##### Default

```ts
false
```

#### objectPooling?

```ts
optional objectPooling: boolean;
```

Enable experimental object pooling

##### Default

```ts
false
```

#### poolSize?

```ts
optional poolSize: number;
```

Object pool size when pooling is enabled

##### Default

```ts
50
```

***

### memory?

```ts
optional memory: {
  gcHints?: boolean;
  maxErrorHistory?: number;
  useWeakRefs?: boolean;
};
```

Defined in: [config.ts:277](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L277)

Memory management settings

#### gcHints?

```ts
optional gcHints: boolean;
```

Provide garbage collection hints

##### Default

```ts
false
```

#### maxErrorHistory?

```ts
optional maxErrorHistory: number;
```

Maximum number of errors to keep in history

##### Default

```ts
100
```

#### useWeakRefs?

```ts
optional useWeakRefs: boolean;
```

Use weak references for large contexts

##### Default

```ts
false
```
