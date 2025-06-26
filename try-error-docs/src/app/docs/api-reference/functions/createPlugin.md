[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / createPlugin

# Function: createPlugin()

```ts
function createPlugin(metadata, setup): Plugin;
```

Defined in: [plugins.ts:374](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/plugins.ts#L374)

Create a plugin helper

## Parameters

### metadata

[`PluginMetadata`](../interfaces/PluginMetadata.md)

### setup

(`api`) => `undefined` \| [`PluginCapabilities`](../interfaces/PluginCapabilities.md)

## Returns

[`Plugin`](../interfaces/Plugin.md)
