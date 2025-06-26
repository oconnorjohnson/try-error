[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / combineErrors

# Function: combineErrors()

```ts
function combineErrors<E>(
   errors, 
   type, 
   message): TryError;
```

Defined in: [utils.ts:390](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L390)

Combine multiple errors into a single error

## Type Parameters

### E

`E` *extends* [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### errors

`E`[]

Array of errors to combine

### type

`string`

Type for the combined error

### message

`string`

Message for the combined error

## Returns

[`TryError`](../interfaces/TryError.md)

A single error containing all the individual errors

## Example

```typescript
const validationErrors = filterErrors(validationResults);
const combinedError = combineErrors(validationErrors, "MultipleValidationErrors",
  `${validationErrors.length} validation errors occurred`);
```
