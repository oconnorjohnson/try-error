[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / createScope

# Function: createScope()

```ts
function createScope(config): {
  config: {
     captureStackTrace?: boolean;
     defaultErrorType?: string;
     developmentMode?: boolean;
     environmentHandlers?: {
        client?: (error) => TryError;
        edge?: (error) => TryError;
        server?: (error) => TryError;
     };
     includeSource?: boolean;
     minimalErrors?: boolean;
     onError?: (error) => TryError;
     performance?: PerformanceConfig;
     runtimeDetection?: boolean;
     serializer?: (error) => Record<string, unknown>;
     skipContext?: boolean;
     skipTimestamp?: boolean;
     sourceLocation?: {
        defaultStackOffset?: number;
        format?: "full" | "file:line:column" | "file:line" | "file";
        formatter?: (file, line, column) => string;
        includeFullPath?: boolean;
     };
     stackTraceLimit?: number;
  };
  createError: (options) => Promise<TryError<string>>;
};
```

Defined in: [config.ts:820](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L820)

Create a scoped configuration that doesn't affect global state
Useful for testing or isolated components

## Parameters

### config

[`TryErrorConfig`](../interfaces/TryErrorConfig.md)

Scoped configuration

## Returns

```ts
{
  config: {
     captureStackTrace?: boolean;
     defaultErrorType?: string;
     developmentMode?: boolean;
     environmentHandlers?: {
        client?: (error) => TryError;
        edge?: (error) => TryError;
        server?: (error) => TryError;
     };
     includeSource?: boolean;
     minimalErrors?: boolean;
     onError?: (error) => TryError;
     performance?: PerformanceConfig;
     runtimeDetection?: boolean;
     serializer?: (error) => Record<string, unknown>;
     skipContext?: boolean;
     skipTimestamp?: boolean;
     sourceLocation?: {
        defaultStackOffset?: number;
        format?: "full" | "file:line:column" | "file:line" | "file";
        formatter?: (file, line, column) => string;
        includeFullPath?: boolean;
     };
     stackTraceLimit?: number;
  };
  createError: (options) => Promise<TryError<string>>;
}
```

Functions that use the scoped config

### config

```ts
config: {
  captureStackTrace?: boolean;
  defaultErrorType?: string;
  developmentMode?: boolean;
  environmentHandlers?: {
     client?: (error) => TryError;
     edge?: (error) => TryError;
     server?: (error) => TryError;
  };
  includeSource?: boolean;
  minimalErrors?: boolean;
  onError?: (error) => TryError;
  performance?: PerformanceConfig;
  runtimeDetection?: boolean;
  serializer?: (error) => Record<string, unknown>;
  skipContext?: boolean;
  skipTimestamp?: boolean;
  sourceLocation?: {
     defaultStackOffset?: number;
     format?: "full" | "file:line:column" | "file:line" | "file";
     formatter?: (file, line, column) => string;
     includeFullPath?: boolean;
  };
  stackTraceLimit?: number;
} = scopedConfig;
```

#### config.captureStackTrace?

```ts
optional captureStackTrace: boolean;
```

Whether to capture stack traces (expensive operation)

##### Default

```ts
true in development, false in production
```

#### config.defaultErrorType?

```ts
optional defaultErrorType: string;
```

Default error type for untyped errors

##### Default

```ts
"Error"
```

#### config.developmentMode?

```ts
optional developmentMode: boolean;
```

Enable development mode features (verbose logging, etc.)

##### Default

```ts
false
```

#### config.environmentHandlers?

```ts
optional environmentHandlers: {
  client?: (error) => TryError;
  edge?: (error) => TryError;
  server?: (error) => TryError;
};
```

Environment-specific error handlers (used with runtimeDetection)

#### config.environmentHandlers.client()?

```ts
optional client: (error) => TryError;
```

##### Parameters

###### error

[`TryError`](../interfaces/TryError.md)

##### Returns

[`TryError`](../interfaces/TryError.md)

#### config.environmentHandlers.edge()?

```ts
optional edge: (error) => TryError;
```

##### Parameters

###### error

[`TryError`](../interfaces/TryError.md)

##### Returns

[`TryError`](../interfaces/TryError.md)

#### config.environmentHandlers.server()?

```ts
optional server: (error) => TryError;
```

##### Parameters

###### error

[`TryError`](../interfaces/TryError.md)

##### Returns

[`TryError`](../interfaces/TryError.md)

#### config.includeSource?

```ts
optional includeSource: boolean;
```

Include source location in errors

##### Default

```ts
true
```

#### config.minimalErrors?

```ts
optional minimalErrors: boolean;
```

Enable minimal error mode for ultra-lightweight errors

##### Default

```ts
false
```

#### config.onError()?

```ts
optional onError: (error) => TryError;
```

Global error transformation hook

##### Parameters

###### error

[`TryError`](../interfaces/TryError.md)

##### Returns

[`TryError`](../interfaces/TryError.md)

#### config.performance?

```ts
optional performance: PerformanceConfig;
```

Performance optimization configuration

#### config.runtimeDetection?

```ts
optional runtimeDetection: boolean;
```

Runtime environment detection for isomorphic apps (Next.js, Nuxt, etc.)
When enabled, environment-specific handlers are called based on runtime detection

##### Default

```ts
false
```

#### config.serializer()?

```ts
optional serializer: (error) => Record<string, unknown>;
```

Custom error serialization function

##### Parameters

###### error

[`TryError`](../interfaces/TryError.md)

##### Returns

`Record`\<`string`, `unknown`\>

#### config.skipContext?

```ts
optional skipContext: boolean;
```

Skip context processing

##### Default

```ts
false
```

#### config.skipTimestamp?

```ts
optional skipTimestamp: boolean;
```

Skip timestamp generation (Date.now() calls)

##### Default

```ts
false
```

#### config.sourceLocation?

```ts
optional sourceLocation: {
  defaultStackOffset?: number;
  format?: "full" | "file:line:column" | "file:line" | "file";
  formatter?: (file, line, column) => string;
  includeFullPath?: boolean;
};
```

Source location configuration

#### config.sourceLocation.defaultStackOffset?

```ts
optional defaultStackOffset: number;
```

Default stack offset for source detection
Useful when wrapping error creation

##### Default

```ts
3
```

#### config.sourceLocation.format?

```ts
optional format: "full" | "file:line:column" | "file:line" | "file";
```

Format for source location string

##### Default

```ts
"file:line:column"
```

#### config.sourceLocation.formatter()?

```ts
optional formatter: (file, line, column) => string;
```

Custom source location formatter

##### Parameters

###### file

`string`

###### line

`string`

###### column

`string`

##### Returns

`string`

#### config.sourceLocation.includeFullPath?

```ts
optional includeFullPath: boolean;
```

Include full file path or just filename

##### Default

```ts
false (just filename)
```

#### config.stackTraceLimit?

```ts
optional stackTraceLimit: number;
```

Maximum stack trace depth to capture

##### Default

```ts
10
```

### createError()

```ts
createError: (options) => Promise<TryError<string>>;
```

#### Parameters

##### options

`Omit`\<[`CreateErrorOptions`](../interfaces/CreateErrorOptions.md)\<`string`\>, `"type"`\> & \{
  `type?`: `string`;
\}

#### Returns

`Promise`\<[`TryError`](../interfaces/TryError.md)\<`string`\>\>

## Example

```typescript
const { createError } = createScope({
  captureStackTrace: false,
  defaultErrorType: 'CustomError'
});

const error = createError({ message: 'Test error' });
```
