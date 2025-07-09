[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / EntityError

# Interface: EntityError\<T, EntityType\>

Defined in: [factories.ts:240](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L240)

Base type for errors related to specific entities (users, orders, products, etc.)

Provides consistent fields for entity-related errors across different domains.

## Example

```typescript
interface UserError
  extends EntityError<"UserNotFound" | "UserSuspended", "user"> {
  readonly accountStatus?: string;
}

const error: UserError = {
  ...createError({ type: "UserNotFound", message: "User not found" }),
  entityId: "user_123",
  entityType: "user",
  accountStatus: "active",
};
```

## Extends

- [`TryError`](TryError.md)\<`T`\>

## Type Parameters

### T

`T` _extends_ `string`

### EntityType

`EntityType` _extends_ `string` = `string`

## Properties

### cause?

```ts
readonly optional cause: unknown;
```

Defined in: [types.ts:50](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L50)

The original error or thrown value that caused this error

#### Inherited from

[`TryError`](TryError.md).[`cause`](TryError.md#cause)

---

### context?

```ts
readonly optional context: Record<string, unknown>;
```

Defined in: [types.ts:45](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L45)

Additional context data for debugging

#### Inherited from

[`TryError`](TryError.md).[`context`](TryError.md#context)

---

### entityId

```ts
readonly entityId: string;
```

Defined in: [factories.ts:247](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L247)

The ID of the entity that caused the error

---

### entityType

```ts
readonly entityType: EntityType;
```

Defined in: [factories.ts:252](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/factories.ts#L252)

The type of entity (user, order, product, etc.)

---

### message

```ts
readonly message: string;
```

Defined in: [types.ts:25](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L25)

Human-readable error message

#### Inherited from

[`TryError`](TryError.md).[`message`](TryError.md#message)

---

### source

```ts
readonly source: string;
```

Defined in: [types.ts:35](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L35)

Source location where the error occurred (file:line:column)

#### Inherited from

[`TryError`](TryError.md).[`source`](TryError.md#source)

---

### stack?

```ts
readonly optional stack: string;
```

Defined in: [types.ts:30](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L30)

Stack trace if available (may be stripped in production)

#### Inherited from

[`TryError`](TryError.md).[`stack`](TryError.md#stack)

---

### timestamp

```ts
readonly timestamp: number;
```

Defined in: [types.ts:40](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L40)

Timestamp when the error was created

#### Inherited from

[`TryError`](TryError.md).[`timestamp`](TryError.md#timestamp)

---

### type

```ts
readonly type: T;
```

Defined in: [types.ts:20](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/types.ts#L20)

The type of error - used for discriminated unions

#### Inherited from

[`TryError`](TryError.md).[`type`](TryError.md#type)
