[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / createEnvConfig

# Function: createEnvConfig()

```ts
function createEnvConfig(configs): TryErrorConfig;
```

Defined in: [config.ts:852](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L852)

Utility to create environment-aware configuration

## Parameters

### configs

#### development?

[`TryErrorConfig`](../interfaces/TryErrorConfig.md)

#### production?

[`TryErrorConfig`](../interfaces/TryErrorConfig.md)

#### test?

[`TryErrorConfig`](../interfaces/TryErrorConfig.md)

## Returns

[`TryErrorConfig`](../interfaces/TryErrorConfig.md)

## Example

```typescript
configure(
  createEnvConfig({
    development: { captureStackTrace: true, developmentMode: true },
    production: { captureStackTrace: false, onError: sendToSentry },
    test: { captureStackTrace: true, developmentMode: true },
  })
);
```
