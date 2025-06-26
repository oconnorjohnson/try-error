[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / configure

# Function: configure()

```ts
function configure(config): void;
```

Defined in: [config.ts:752](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L752)

Configure global tryError behavior

## Parameters

### config

Configuration options or preset name

[`TryErrorConfig`](../interfaces/TryErrorConfig.md) | `"development"` | `"production"` | `"test"` | `"performance"` | `"minimal"` | `"serverProduction"` | `"clientProduction"` | `"edge"` | `"nextjs"`

## Returns

`void`

## Example

```typescript
// Use a preset
configure('production');

// Custom configuration
configure({
  captureStackTrace: false,
  onError: (error) => sendToMonitoring(error)
});

// Environment-based configuration
configure(process.env.NODE_ENV === 'production' ? 'production' : 'development');
```
