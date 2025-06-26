[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / PluginManager

# Class: PluginManager

Defined in: [plugins.ts:98](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L98)

Plugin manager

## Constructors

### Constructor

```ts
new PluginManager(): PluginManager;
```

#### Returns

`PluginManager`

## Methods

### disable()

```ts
disable(name): Promise<void>;
```

Defined in: [plugins.ts:201](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L201)

Disable a plugin

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`void`\>

***

### enable()

```ts
enable(name): Promise<void>;
```

Defined in: [plugins.ts:171](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L171)

Enable a plugin

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

```ts
get(name): undefined | Plugin;
```

Defined in: [plugins.ts:250](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L250)

Get a specific plugin

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`Plugin`](../interfaces/Plugin.md)

***

### getAllErrorTypes()

```ts
getAllErrorTypes(): Record<string, (message, context?) => TryError>;
```

Defined in: [plugins.ts:314](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L314)

Get all custom error types from enabled plugins

#### Returns

`Record`\<`string`, (`message`, `context?`) => [`TryError`](../interfaces/TryError.md)\>

***

### getAllMiddleware()

```ts
getAllMiddleware(): ErrorMiddleware[];
```

Defined in: [plugins.ts:296](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L296)

Get all middleware from enabled plugins

#### Returns

[`ErrorMiddleware`](../type-aliases/ErrorMiddleware.md)[]

***

### getAllUtilities()

```ts
getAllUtilities(): Record<string, Function>;
```

Defined in: [plugins.ts:338](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L338)

Get all utilities from enabled plugins

#### Returns

`Record`\<`string`, `Function`\>

***

### getEnabled()

```ts
getEnabled(): PluginMetadata[];
```

Defined in: [plugins.ts:241](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L241)

Get all enabled plugins

#### Returns

[`PluginMetadata`](../interfaces/PluginMetadata.md)[]

***

### getInstalled()

```ts
getInstalled(): PluginMetadata[];
```

Defined in: [plugins.ts:234](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L234)

Get all installed plugins

#### Returns

[`PluginMetadata`](../interfaces/PluginMetadata.md)[]

***

### getMergedConfig()

```ts
getMergedConfig(): Partial<TryErrorConfig>;
```

Defined in: [plugins.ts:271](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L271)

Get merged configuration from all enabled plugins

#### Returns

`Partial`\<[`TryErrorConfig`](../interfaces/TryErrorConfig.md)\>

***

### install()

```ts
install(plugin): Promise<void>;
```

Defined in: [plugins.ts:106](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L106)

Install a plugin

#### Parameters

##### plugin

[`Plugin`](../interfaces/Plugin.md)

#### Returns

`Promise`\<`void`\>

***

### isEnabled()

```ts
isEnabled(name): boolean;
```

Defined in: [plugins.ts:264](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L264)

Check if a plugin is enabled

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### isInstalled()

```ts
isInstalled(name): boolean;
```

Defined in: [plugins.ts:257](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L257)

Check if a plugin is installed

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### notifyConfigChange()

```ts
notifyConfigChange(config): Promise<void>;
```

Defined in: [plugins.ts:356](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L356)

Notify all plugins of a configuration change

#### Parameters

##### config

[`TryErrorConfig`](../interfaces/TryErrorConfig.md)

#### Returns

`Promise`\<`void`\>

***

### uninstall()

```ts
uninstall(name): Promise<void>;
```

Defined in: [plugins.ts:137](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L137)

Uninstall a plugin

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`void`\>
