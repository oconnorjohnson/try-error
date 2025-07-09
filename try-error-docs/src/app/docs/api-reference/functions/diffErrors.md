[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

---

[tryError API Documentation](../index.md) / diffErrors

# Function: diffErrors()

```ts
function diffErrors<E1, E2>(
  error1,
  error2
): {
  context?: {
    added: Record<string, unknown>;
    changed: Record<
      string,
      {
        from: unknown;
        to: unknown;
      }
    >;
    removed: Record<string, unknown>;
  };
  message?: {
    from: string;
    to: string;
  };
  source?: {
    from: string;
    to: string;
  };
  timestamp?: {
    from: number;
    to: number;
  };
  type?: {
    from: string;
    to: string;
  };
};
```

Defined in: [utils.ts:524](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/utils.ts#L524)

Diff two errors to see what changed

## Type Parameters

### E1

`E1` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

### E2

`E2` _extends_ [`TryError`](../interfaces/TryError.md)\<`string`\>

## Parameters

### error1

`E1`

First error

### error2

`E2`

Second error

## Returns

```ts
{
  context?: {
     added: Record<string, unknown>;
     changed: Record<string, {
        from: unknown;
        to: unknown;
     }>;
     removed: Record<string, unknown>;
  };
  message?: {
     from: string;
     to: string;
  };
  source?: {
     from: string;
     to: string;
  };
  timestamp?: {
     from: number;
     to: number;
  };
  type?: {
     from: string;
     to: string;
  };
}
```

Object describing the differences

### context?

```ts
optional context: {
  added: Record<string, unknown>;
  changed: Record<string, {
     from: unknown;
     to: unknown;
  }>;
  removed: Record<string, unknown>;
};
```

#### context.added

```ts
added: Record<string, unknown>;
```

#### context.changed

```ts
changed: Record<
  string,
  {
    from: unknown;
    to: unknown;
  }
>;
```

#### context.removed

```ts
removed: Record<string, unknown>;
```

### message?

```ts
optional message: {
  from: string;
  to: string;
};
```

#### message.from

```ts
from: string;
```

#### message.to

```ts
to: string;
```

### source?

```ts
optional source: {
  from: string;
  to: string;
};
```

#### source.from

```ts
from: string;
```

#### source.to

```ts
to: string;
```

### timestamp?

```ts
optional timestamp: {
  from: number;
  to: number;
};
```

#### timestamp.from

```ts
from: number;
```

#### timestamp.to

```ts
to: number;
```

### type?

```ts
optional type: {
  from: string;
  to: string;
};
```

#### type.from

```ts
from: string;
```

#### type.to

```ts
to: string;
```

## Example

```typescript
const diff = diffErrors(originalError, modifiedError);
console.log(diff);
// {
//   type: { from: "ValidationError", to: "SchemaError" },
//   context: { added: { schema: "user" }, removed: { field: "email" } }
// }
```
