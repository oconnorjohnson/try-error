[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / PluginAPI

# Interface: PluginAPI

Defined in: [plugins.ts:398](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L398)

Plugin API provided to plugins during setup

## Properties

### addMiddleware()

```ts
addMiddleware: (...middleware) => ErrorMiddleware[];
```

Defined in: [plugins.ts:403](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L403)

#### Parameters

##### middleware

...[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)[]

#### Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)[]

***

### addUtility()

```ts
addUtility: (name, fn) => Record<string, Function>;
```

Defined in: [plugins.ts:404](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L404)

#### Parameters

##### name

`string`

##### fn

`Function`

#### Returns

`Record`\<`string`, `Function`\>

***

### createErrorType()

```ts
createErrorType: (type, factory) => Record<string, (message, context?) => TryError>;
```

Defined in: [plugins.ts:399](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L399)

#### Parameters

##### type

`string`

##### factory

(`message`, `context?`) => [`TryError`](TryError.md)

#### Returns

`Record`\<`string`, (`message`, `context?`) => [`TryError`](TryError.md)\>
