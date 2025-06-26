[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / ErrorEvent

# Type Alias: ErrorEvent

```ts
type ErrorEvent = 
  | {
  error: TryError;
  timestamp: number;
  type: "error:created";
}
  | {
  original: TryError;
  timestamp: number;
  transformed: TryError;
  type: "error:transformed";
}
  | {
  error: TryError;
  timestamp: number;
  type: "error:pooled";
}
  | {
  error: TryError;
  timestamp: number;
  type: "error:released";
}
  | {
  error: TryError;
  serialized: any;
  timestamp: number;
  type: "error:serialized";
}
  | {
  cause: unknown;
  error: TryError;
  timestamp: number;
  type: "error:wrapped";
}
  | {
  attempt: number;
  error: TryError;
  timestamp: number;
  type: "error:retry";
}
  | {
  error: TryError;
  recovery: any;
  timestamp: number;
  type: "error:recovered";
};
```

Defined in: [events.ts:13](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/events.ts#L13)

Error lifecycle events
