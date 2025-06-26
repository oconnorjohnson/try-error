[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / TryErrorConfig

# Interface: TryErrorConfig

Defined in: [config.ts:108](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L108)

Configuration options for try-error behavior

## Properties

### captureStackTrace?

```ts
optional captureStackTrace: boolean;
```

Defined in: [config.ts:113](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L113)

Whether to capture stack traces (expensive operation)

#### Default

```ts
true in development, false in production
```

***

### defaultErrorType?

```ts
optional defaultErrorType: string;
```

Defined in: [config.ts:178](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L178)

Default error type for untyped errors

#### Default

```ts
"Error"
```

***

### developmentMode?

```ts
optional developmentMode: boolean;
```

Defined in: [config.ts:184](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L184)

Enable development mode features (verbose logging, etc.)

#### Default

```ts
false
```

***

### environmentHandlers?

```ts
optional environmentHandlers: {
  client?: (error) => TryError;
  edge?: (error) => TryError;
  server?: (error) => TryError;
};
```

Defined in: [config.ts:206](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L206)

Environment-specific error handlers (used with runtimeDetection)

#### client()?

```ts
optional client: (error) => TryError;
```

##### Parameters

###### error

[`TryError`](TryError.md)

##### Returns

[`TryError`](TryError.md)

#### edge()?

```ts
optional edge: (error) => TryError;
```

##### Parameters

###### error

[`TryError`](TryError.md)

##### Returns

[`TryError`](TryError.md)

#### server()?

```ts
optional server: (error) => TryError;
```

##### Parameters

###### error

[`TryError`](TryError.md)

##### Returns

[`TryError`](TryError.md)

***

### includeSource?

```ts
optional includeSource: boolean;
```

Defined in: [config.ts:125](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L125)

Include source location in errors

#### Default

```ts
true
```

***

### minimalErrors?

```ts
optional minimalErrors: boolean;
```

Defined in: [config.ts:131](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L131)

Enable minimal error mode for ultra-lightweight errors

#### Default

```ts
false
```

***

### onError()?

```ts
optional onError: (error) => TryError;
```

Defined in: [config.ts:194](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L194)

Global error transformation hook

#### Parameters

##### error

[`TryError`](TryError.md)

#### Returns

[`TryError`](TryError.md)

***

### performance?

```ts
optional performance: PerformanceConfig;
```

Defined in: [config.ts:215](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L215)

Performance optimization configuration

***

### runtimeDetection?

```ts
optional runtimeDetection: boolean;
```

Defined in: [config.ts:201](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L201)

Runtime environment detection for isomorphic apps (Next.js, Nuxt, etc.)
When enabled, environment-specific handlers are called based on runtime detection

#### Default

```ts
false
```

***

### serializer()?

```ts
optional serializer: (error) => Record<string, unknown>;
```

Defined in: [config.ts:189](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L189)

Custom error serialization function

#### Parameters

##### error

[`TryError`](TryError.md)

#### Returns

`Record`\<`string`, `unknown`\>

***

### skipContext?

```ts
optional skipContext: boolean;
```

Defined in: [config.ts:143](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L143)

Skip context processing

#### Default

```ts
false
```

***

### skipTimestamp?

```ts
optional skipTimestamp: boolean;
```

Defined in: [config.ts:137](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L137)

Skip timestamp generation (Date.now() calls)

#### Default

```ts
false
```

***

### sourceLocation?

```ts
optional sourceLocation: {
  defaultStackOffset?: number;
  format?: "full" | "file:line:column" | "file:line" | "file";
  formatter?: (file, line, column) => string;
  includeFullPath?: boolean;
};
```

Defined in: [config.ts:148](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L148)

Source location configuration

#### defaultStackOffset?

```ts
optional defaultStackOffset: number;
```

Default stack offset for source detection
Useful when wrapping error creation

##### Default

```ts
3
```

#### format?

```ts
optional format: "full" | "file:line:column" | "file:line" | "file";
```

Format for source location string

##### Default

```ts
"file:line:column"
```

#### formatter()?

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

#### includeFullPath?

```ts
optional includeFullPath: boolean;
```

Include full file path or just filename

##### Default

```ts
false (just filename)
```

***

### stackTraceLimit?

```ts
optional stackTraceLimit: number;
```

Defined in: [config.ts:119](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/config.ts#L119)

Maximum stack trace depth to capture

#### Default

```ts
10
```
