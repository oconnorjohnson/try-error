[**tryError API Documentation v0.0.1-alpha.1**](../index.md)

***

[tryError API Documentation](../index.md) / getInternStats

# Function: getInternStats()

```ts
function getInternStats(): {
  evictions: number;
  hitRate: number;
  hits: number;
  misses: number;
  poolSize: number;
  strongRefCount: number;
};
```

Defined in: [intern.ts:190](https://github.com/oconnorjohnson/tryError/blob/e3ae0308069a4fba073f4543d527ad76373db795/src/intern.ts#L190)

Get intern pool statistics

## Returns

```ts
{
  evictions: number;
  hitRate: number;
  hits: number;
  misses: number;
  poolSize: number;
  strongRefCount: number;
}
```

### evictions

```ts
evictions: number = 0;
```

### hitRate

```ts
hitRate: number;
```

### hits

```ts
hits: number = 0;
```

### misses

```ts
misses: number = 0;
```

### poolSize

```ts
poolSize: number;
```

### strongRefCount

```ts
strongRefCount: number;
```
