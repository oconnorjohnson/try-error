[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / PluginHooks

# Interface: PluginHooks

Defined in: [plugins.ts:26](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L26)

Plugin lifecycle hooks

## Properties

### onConfigChange()?

```ts
optional onConfigChange: (config) => void | Promise<void>;
```

Defined in: [plugins.ts:50](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L50)

Called when configuration changes

#### Parameters

##### config

[`TryErrorConfig`](TryErrorConfig.md)

#### Returns

`void` \| `Promise`\<`void`\>

---

### onDisable()?

```ts
optional onDisable: () => void | Promise<void>;
```

Defined in: [plugins.ts:45](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L45)

Called when the plugin is disabled

#### Returns

`void` \| `Promise`\<`void`\>

---

### onEnable()?

```ts
optional onEnable: () => void | Promise<void>;
```

Defined in: [plugins.ts:40](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L40)

Called when the plugin is enabled

#### Returns

`void` \| `Promise`\<`void`\>

---

### onInstall()?

```ts
optional onInstall: () => void | Promise<void>;
```

Defined in: [plugins.ts:30](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L30)

Called when the plugin is installed

#### Returns

`void` \| `Promise`\<`void`\>

---

### onUninstall()?

```ts
optional onUninstall: () => void | Promise<void>;
```

Defined in: [plugins.ts:35](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L35)

Called when the plugin is uninstalled

#### Returns

`void` \| `Promise`\<`void`\>
