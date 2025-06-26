const ITERATIONS = 100_000;

async function measure(name: string, fn: () => Promise<void>): Promise<number> {
  const start = process.hrtime.bigint();
  await fn();
  const end = process.hrtime.bigint();
  const ms = Number(end - start) / 1_000_000;
  console.log(`${name.padEnd(50)}: ${ms.toFixed(2)}ms`);
  return ms;
}

async function investigateFunctionOverhead() {
  console.log("Investigating Function Wrapping Overhead in Async Context");
  console.log("=".repeat(70));
  console.log(`Iterations: ${ITERATIONS.toLocaleString()}\n`);

  // Warmup
  for (let i = 0; i < 10000; i++) {
    await Promise.resolve(42);
  }

  // Test 1: Direct promise
  const directTime = await measure("Direct Promise.resolve", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await Promise.resolve(42);
    }
  });

  // Test 2: Pre-created promise
  const promise = Promise.resolve(42);
  const precreatedTime = await measure(
    "Pre-created promise (reused)",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await promise;
      }
    }
  );

  // Test 3: Arrow function returning promise
  const arrowTime = await measure("Arrow function", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const fn = () => Promise.resolve(42);
      await fn();
    }
  });

  // Test 4: Regular function returning promise
  const regularTime = await measure("Regular function", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      function fn() {
        return Promise.resolve(42);
      }
      await fn();
    }
  });

  // Test 5: Pre-defined arrow function
  const predefinedArrow = () => Promise.resolve(42);
  const predefinedArrowTime = await measure(
    "Pre-defined arrow function",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await predefinedArrow();
      }
    }
  );

  // Test 6: Async arrow function
  const asyncArrowTime = await measure("Async arrow function", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const fn = async () => 42;
      await fn();
    }
  });

  // Test 7: Pre-defined async function
  const predefinedAsync = async () => 42;
  const predefinedAsyncTime = await measure(
    "Pre-defined async function",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await predefinedAsync();
      }
    }
  );

  // Test 8: IIFE pattern
  const iifeTime = await measure("IIFE pattern", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await (async () => 42)();
    }
  });

  // Test 9: Promise constructor
  const promiseConstructorTime = await measure(
    "Promise constructor",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await new Promise((resolve) => resolve(42));
      }
    }
  );

  // Test 10: Promise with then
  const thenTime = await measure("Promise.resolve().then", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await Promise.resolve(42).then((x) => x);
    }
  });

  console.log("\n--- Analysis ---");
  console.log("=".repeat(70));

  const baseline = directTime;
  const overhead = (time: number) =>
    (((time - baseline) / baseline) * 100).toFixed(1);

  console.log("\nOverhead compared to direct Promise.resolve:");
  console.log(`Pre-created promise: ${overhead(precreatedTime)}%`);
  console.log(`Arrow function: ${overhead(arrowTime)}%`);
  console.log(`Regular function: ${overhead(regularTime)}%`);
  console.log(`Pre-defined arrow: ${overhead(predefinedArrowTime)}%`);
  console.log(`Async arrow: ${overhead(asyncArrowTime)}%`);
  console.log(`Pre-defined async: ${overhead(predefinedAsyncTime)}%`);
  console.log(`IIFE: ${overhead(iifeTime)}%`);
  console.log(`Promise constructor: ${overhead(promiseConstructorTime)}%`);
  console.log(`Promise.then: ${overhead(thenTime)}%`);

  console.log("\nKey Insights:");
  if (predefinedArrowTime < arrowTime * 0.5) {
    console.log("✓ Pre-defining functions significantly reduces overhead");
  }
  if (asyncArrowTime < arrowTime) {
    console.log(
      "✓ Async functions may be more optimized than regular functions returning promises"
    );
  }
  if (precreatedTime < directTime * 0.1) {
    console.log("✓ Reusing promises is extremely efficient");
  }
}

investigateFunctionOverhead().catch(console.error);
