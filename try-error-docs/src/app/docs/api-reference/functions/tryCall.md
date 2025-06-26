[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / tryCall

# Function: tryCall()

## Call Signature

```ts
function tryCall<TArgs, TReturn>(fn, ...args): TryResult<TReturn, TryError<string>>;
```

Defined in: [sync.ts:122](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L122)

Call a function with arguments, wrapping any thrown errors

### Type Parameters

#### TArgs

`TArgs` *extends* readonly `unknown`[]

#### TReturn

`TReturn`

### Parameters

#### fn

(...`args`) => `TReturn`

Function to call

#### args

...`TArgs`

Arguments to pass to the function

### Returns

[`TryResult`](../type-aliases/TryResult.md)\<`TReturn`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

TryResult with success value or error

### Example

```typescript
// Without options
const result = tryCall(parseInt, "123", 10);

// With options
const result2 = tryCall(JSON.parse, { errorType: "ParseError" }, invalidJson);
```

## Call Signature

```ts
function tryCall<TArgs, TReturn>(
   fn, 
   options, ...
args): TryResult<TReturn, TryError<string>>;
```

Defined in: [sync.ts:126](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/sync.ts#L126)

Call a function with arguments, wrapping any thrown errors

### Type Parameters

#### TArgs

`TArgs` *extends* readonly `unknown`[]

#### TReturn

`TReturn`

### Parameters

#### fn

(...`args`) => `TReturn`

Function to call

#### options

[`TrySyncOptions`](../interfaces/TrySyncOptions.md)

Optional configuration

#### args

...`TArgs`

Arguments to pass to the function

### Returns

[`TryResult`](../type-aliases/TryResult.md)\<`TReturn`, [`TryError`](../interfaces/TryError.md)\<`string`\>\>

TryResult with success value or error

### Example

```typescript
// Without options
const result = tryCall(parseInt, "123", 10);

// With options
const result2 = tryCall(JSON.parse, { errorType: "ParseError" }, invalidJson);
```
