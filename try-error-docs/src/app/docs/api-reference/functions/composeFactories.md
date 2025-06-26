[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / composeFactories

# Function: composeFactories()

```ts
function composeFactories<T, E>(factories): (type, message, domainFields?, options?) => E;
```

Defined in: [factories.ts:158](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L158)

Compose multiple factories together

## Type Parameters

### T

`T` *extends* `string`

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`T`\>

## Parameters

### factories

(`type`, `message`, `domainFields?`, `options?`) => [`TryError`](../interfaces/TryError.md)[]

Array of factories to compose

## Returns

A new factory that applies all factory defaults

```ts
(
   type, 
   message, 
   domainFields?, 
   options?): E;
```

### Parameters

#### type

`T`

#### message

`string`

#### domainFields?

`Partial`\<`Omit`\<`E`, keyof [`TryError`](../interfaces/TryError.md)\<`string`\>\>\>

#### options?

[`ErrorFactoryOptions`](../interfaces/ErrorFactoryOptions.md)

### Returns

`E`

## Example

```typescript
const baseApiFactory = createErrorFactory({ provider: "api" });
const authFactory = createErrorFactory({ authenticated: false });

const composedFactory = composeFactories([baseApiFactory, authFactory]);
```
