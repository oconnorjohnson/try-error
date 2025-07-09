[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / getErrorMessage

# Function: getErrorMessage()

```ts
function getErrorMessage(value, fallback): string;
```

Defined in: [utils.ts:169](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L169)

Extract error message with fallback

## Parameters

### value

`unknown`

Value that might be an error

### fallback

`string` = `"Unknown error"`

Fallback message if not an error

## Returns

`string`

Error message or fallback

## Example

```typescript
const message = getErrorMessage(result, "Unknown error occurred");
console.error(message);
```
