[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / PluginCapabilities

# Interface: PluginCapabilities

Defined in: [plugins.ts:56](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L56)

Plugin capabilities

## Properties

### config?

```ts
optional config: Partial<TryErrorConfig>;
```

Defined in: [plugins.ts:60](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L60)

Configuration modifications

***

### errorTypes?

```ts
optional errorTypes: Record<string, (message, context?) => TryError>;
```

Defined in: [plugins.ts:70](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L70)

Custom error types to register

***

### middleware?

```ts
optional middleware: ErrorMiddleware[];
```

Defined in: [plugins.ts:65](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L65)

Middleware to add

***

### transformers?

```ts
optional transformers: {
  error?: (error) => TryError;
  result?: <T>(result) => TryResult<T>;
};
```

Defined in: [plugins.ts:80](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L80)

Custom transformers

#### error()?

```ts
optional error: (error) => TryError;
```

##### Parameters

###### error

[`TryError`](TryError.md)

##### Returns

[`TryError`](TryError.md)

#### result()?

```ts
optional result: <T>(result) => TryResult<T>;
```

##### Type Parameters

###### T

`T`

##### Parameters

###### result

[`TryResult`](../type-aliases/TryResult.md)\<`T`\>

##### Returns

[`TryResult`](../type-aliases/TryResult.md)\<`T`\>

***

### utilities?

```ts
optional utilities: Record<string, Function>;
```

Defined in: [plugins.ts:75](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L75)

Custom utilities to expose
