[**try-error API Documentation v0.0.1-alpha.1**](../index.md)

***

[try-error API Documentation](../index.md) / getErrorPoolStats

# Function: getErrorPoolStats()

```ts
function getErrorPoolStats(): 
  | null
  | {
  activeCount: number;
  creates: number;
  hitRate: number;
  hits: number;
  maxSize: number;
  misses: number;
  poolSize: number;
  returns: number;
};
```

Defined in: [pool.ts:215](https://github.com/oconnorjohnson/try-error/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/pool.ts#L215)

Get error pool statistics

## Returns

  \| `null`
  \| \{
  `activeCount`: `number`;
  `creates`: `number`;
  `hitRate`: `number`;
  `hits`: `number`;
  `maxSize`: `number`;
  `misses`: `number`;
  `poolSize`: `number`;
  `returns`: `number`;
\}
