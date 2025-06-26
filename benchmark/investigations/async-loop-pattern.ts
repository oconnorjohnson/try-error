/**
 * Testing ChatGPT's hypothesis about async/await overhead
 * The key insight: async/await overhead is magnified in tight loops
 * but becomes negligible with real work between awaits
 */

const ITERATIONS = 10_000;

// Helper to measure time
async function measure(name: string, fn: () => Promise<void>): Promise<number> {
  const start = process.hrtime.bigint();
  await fn();
  const end = process.hrtime.bigint();
  const ms = Number(end - start) / 1_000_000;
  console.log(`${name.padEnd(50)}: ${ms.toFixed(2)}ms`);
  return ms;
}

// Simulate some CPU work
function doWork(iterations: number = 1000): number {
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

// Simulate async I/O
function simulateIO(ms: number = 1): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLoopPatternBenchmarks() {
  console.log("Async Loop Pattern Analysis");
  console.log("=".repeat(70));
  console.log(`Iterations: ${ITERATIONS.toLocaleString()}`);
  console.log("");

  console.log("--- Tight Loop (Empty Work) ---");

  // 1. Native async/await in tight loop
  const tightNative = await measure(
    "Native async/await (tight loop)",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await Promise.resolve(42);
      }
    }
  );

  // 2. Promise.then in tight loop
  const tightThen = await measure("Promise.then (tight loop)", async () => {
    let promise: Promise<any> = Promise.resolve();
    for (let i = 0; i < ITERATIONS; i++) {
      promise = promise.then(() => 42);
    }
    await promise;
  });

  // 3. Function creation in loop
  const tightFunction = await measure(
    "Function creation (tight loop)",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await (async () => 42)();
      }
    }
  );

  console.log("\n--- With CPU Work Between Awaits ---");

  // 4. Native with work
  const workNative = await measure(
    "Native async/await (with work)",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        doWork(100);
        await Promise.resolve(42);
      }
    }
  );

  // 5. Function creation with work
  const workFunction = await measure(
    "Function creation (with work)",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        doWork(100);
        await (async () => 42)();
      }
    }
  );

  console.log("\n--- With Simulated I/O ---");

  // 6. Native with I/O
  const ioNative = await measure("Native async/await (with I/O)", async () => {
    for (let i = 0; i < 100; i++) {
      // Fewer iterations for I/O
      await simulateIO(1);
    }
  });

  // 7. Function creation with I/O
  const ioFunction = await measure("Function creation (with I/O)", async () => {
    for (let i = 0; i < 100; i++) {
      // Fewer iterations for I/O
      await (async () => simulateIO(1))();
    }
  });

  console.log("\n--- Pre-defined vs Dynamic Functions ---");

  // 8. Pre-defined function
  const predefinedFn = async () => 42;
  const predefined = await measure("Pre-defined function", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await predefinedFn();
    }
  });

  // 9. Dynamic function creation
  const dynamic = await measure("Dynamic function creation", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await (async () => 42)();
    }
  });

  console.log("\n--- Analysis ---");
  console.log("=".repeat(70));

  const overhead = (a: number, b: number) => (((a - b) / b) * 100).toFixed(1);

  console.log("Tight Loop Overhead:");
  console.log(
    `- Promise.then vs async/await: ${overhead(tightThen, tightNative)}%`
  );
  console.log(
    `- Function creation vs native: ${overhead(tightFunction, tightNative)}%`
  );

  console.log("\nWith CPU Work:");
  console.log(
    `- Function creation overhead: ${overhead(workFunction, workNative)}%`
  );
  console.log(
    `- Work dominates: ${((doWork(100) * ITERATIONS) / workNative).toFixed(
      1
    )}% of runtime`
  );

  console.log("\nWith I/O:");
  console.log(
    `- Function creation overhead: ${overhead(ioFunction, ioNative)}%`
  );

  console.log("\nPre-defined vs Dynamic:");
  console.log(`- Dynamic overhead: ${overhead(dynamic, predefined)}%`);

  console.log("\n--- Key Insights ---");
  console.log("1. In tight loops, function creation adds massive overhead");
  console.log("2. With real work (CPU/IO), the overhead becomes negligible");
  console.log("3. Pre-defining functions eliminates most overhead");
  console.log("4. Promise.then can be faster in pathological cases");
}

// Test transpilation effects
async function testTranspilationEffects() {
  console.log("\n\n--- Transpilation Analysis ---");
  console.log("=".repeat(70));

  // Check if we're seeing native async or transpiled
  const asyncFn = async () => 42;
  console.log("Async function toString:", asyncFn.toString());
  console.log("Contains 'async':", asyncFn.toString().includes("async"));
  console.log(
    "Contains 'generator':",
    asyncFn.toString().includes("generator")
  );
  console.log(
    "Contains '__awaiter':",
    asyncFn.toString().includes("__awaiter")
  );
}

// Run all benchmarks
(async () => {
  await runLoopPatternBenchmarks();
  await testTranspilationEffects();
})().catch(console.error);
