import { tryAsync, fromThrown } from "../../src";
import { TryError, TRY_ERROR_BRAND } from "../../src/types";

const ITERATIONS = 100_000;
const WARMUP = 10_000;

// Helper to measure time
function measure(name: string, fn: () => Promise<void>): Promise<number> {
  return (async () => {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    console.log(`${name.padEnd(40)}: ${ms.toFixed(2)}ms`);
    return ms;
  })();
}

// Warmup to ensure JIT optimization
async function warmup() {
  console.log("Warming up...");
  for (let i = 0; i < WARMUP; i++) {
    await Promise.resolve(42);
    await tryAsync(() => Promise.resolve(42));
  }
}

async function runMicroBenchmarks() {
  console.log("Async Micro-benchmarks");
  console.log("=".repeat(60));
  console.log(`Iterations: ${ITERATIONS.toLocaleString()}`);
  console.log("");

  await warmup();

  // 1. Baseline: Native async/await
  const nativeTime = await measure("Native async/await", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        await Promise.resolve(42);
      } catch (e) {}
    }
  });

  console.log("\n--- Promise Creation Overhead ---");

  // 2. Just wrapping in a function
  const fnWrapTime = await measure("Function wrapping", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const fn = () => Promise.resolve(42);
      await fn();
    }
  });

  // 3. Promise.race with single promise (no timeout/signal)
  const raceTime = await measure("Promise.race (single)", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await Promise.race([Promise.resolve(42)]);
    }
  });

  console.log("\n--- Error Handling Overhead ---");

  // 4. Try-catch around promise
  const tryCatchTime = await measure("Try-catch wrapper", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        await Promise.resolve(42);
      } catch (error) {
        // Never happens
      }
    }
  });

  // 5. Minimal tryAsync implementation
  const minimalTryAsync = async <T>(
    fn: () => Promise<T>
  ): Promise<T | TryError> => {
    try {
      return await fn();
    } catch (error) {
      return fromThrown(error);
    }
  };

  const minimalTime = await measure("Minimal tryAsync", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await minimalTryAsync(() => Promise.resolve(42));
    }
  });

  // 6. Ultra-minimal error creation
  const ultraMinimalTryAsync = async <T>(
    fn: () => Promise<T>
  ): Promise<T | TryError> => {
    try {
      return await fn();
    } catch (error) {
      // Ultra-minimal error
      return {
        [TRY_ERROR_BRAND]: true,
        type: "Error",
        message: error instanceof Error ? error.message : "Unknown",
        source: "unknown",
        timestamp: 0,
      } as TryError;
    }
  };

  const ultraMinimalTime = await measure("Ultra-minimal tryAsync", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await ultraMinimalTryAsync(() => Promise.resolve(42));
    }
  });

  console.log("\n--- Current Implementation ---");

  // 7. Full tryAsync
  const fullTime = await measure("Full tryAsync", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await tryAsync(() => Promise.resolve(42));
    }
  });

  // 8. tryAsync with options (no timeout/signal)
  const withOptionsTime = await measure(
    "tryAsync with empty options",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await tryAsync(() => Promise.resolve(42), {});
      }
    }
  );

  console.log("\n--- Error Path Comparison ---");

  // 9. Native error path
  const nativeErrorTime = await measure("Native with errors", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        await Promise.reject(new Error("Test"));
      } catch (e) {
        // Handle error
      }
    }
  });

  // 10. tryAsync error path
  const tryAsyncErrorTime = await measure("tryAsync with errors", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const result = await tryAsync(() => Promise.reject(new Error("Test")));
    }
  });

  console.log("\n--- Analysis ---");
  console.log("=".repeat(60));

  const overhead = (time: number) =>
    (((time - nativeTime) / nativeTime) * 100).toFixed(1);

  console.log(`Function wrapping overhead: +${overhead(fnWrapTime)}%`);
  console.log(`Promise.race overhead: +${overhead(raceTime)}%`);
  console.log(`Try-catch overhead: +${overhead(tryCatchTime)}%`);
  console.log(`Minimal tryAsync overhead: +${overhead(minimalTime)}%`);
  console.log(`Ultra-minimal overhead: +${overhead(ultraMinimalTime)}%`);
  console.log(`Full tryAsync overhead: +${overhead(fullTime)}%`);

  console.log("\nBreakdown:");
  console.log(`- Function call: ${(fnWrapTime - nativeTime).toFixed(2)}ms`);
  console.log(`- Try-catch: ${(tryCatchTime - fnWrapTime).toFixed(2)}ms`);
  console.log(`- Error creation: ${(minimalTime - tryCatchTime).toFixed(2)}ms`);
  console.log(
    `- Full implementation: ${(fullTime - minimalTime).toFixed(2)}ms`
  );
}

// Run the benchmarks
runMicroBenchmarks().catch(console.error);
