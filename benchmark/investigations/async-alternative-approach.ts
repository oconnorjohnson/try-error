import { TryError, TryResult, TRY_ERROR_BRAND } from "../../src/types";
import { fromThrown } from "../../src/errors";

const ITERATIONS = 100_000;

// Alternative approach 1: Direct promise handling
export async function tryPromise<T>(
  promise: Promise<T>
): Promise<TryResult<T, TryError>> {
  try {
    return await promise;
  } catch (error) {
    return fromThrown(error);
  }
}

// Alternative approach 2: Then-based
export function tryThen<T>(
  promise: Promise<T>
): Promise<TryResult<T, TryError>> {
  return promise.then(
    (value) => value,
    (error) => fromThrown(error)
  );
}

// Alternative approach 3: Macro pattern
export function tryMacro<T>(promise: Promise<T>): {
  promise: Promise<T | TryError>;
  isError: (result: T | TryError) => result is TryError;
} {
  const wrapped = promise.catch((error) => fromThrown(error));
  return {
    promise: wrapped,
    isError: (result): result is TryError =>
      (result as any)?.[TRY_ERROR_BRAND] === true,
  };
}

async function measure(name: string, fn: () => Promise<void>): Promise<number> {
  const start = process.hrtime.bigint();
  await fn();
  const end = process.hrtime.bigint();
  const ms = Number(end - start) / 1_000_000;
  console.log(`${name.padEnd(45)}: ${ms.toFixed(2)}ms`);
  return ms;
}

async function benchmarkAlternatives() {
  console.log("Alternative Async Approaches Benchmark");
  console.log("=".repeat(70));
  console.log(`Iterations: ${ITERATIONS.toLocaleString()}\n`);

  // Warmup
  for (let i = 0; i < 10000; i++) {
    await Promise.resolve(42);
  }

  // Import original
  const { tryAsync } = await import("../../src/async");
  const { isTryError } = await import("../../src/types");

  // Test 1: Native baseline
  const nativeTime = await measure("Native async/await", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        await Promise.resolve(42);
      } catch (e) {}
    }
  });

  // Test 2: Original tryAsync with function
  const originalTime = await measure(
    "Original tryAsync (function)",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await tryAsync(() => Promise.resolve(42));
      }
    }
  );

  // Test 3: Direct promise (no function passing)
  const directTime = await measure("tryPromise (direct promise)", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await tryPromise(Promise.resolve(42));
    }
  });

  // Test 4: Then-based approach
  const thenTime = await measure("tryThen (promise.then)", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await tryThen(Promise.resolve(42));
    }
  });

  // Test 5: Macro pattern
  const macroTime = await measure("tryMacro pattern", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const { promise, isError } = tryMacro(Promise.resolve(42));
      const result = await promise;
      if (isError(result)) {
        // Handle error
      }
    }
  });

  // Test 6: Inline try-catch (for comparison)
  const inlineTime = await measure("Inline try-catch", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        const result = await Promise.resolve(42);
      } catch (error) {
        const err = fromThrown(error);
      }
    }
  });

  // Test 7: Pre-created promise
  const promise = Promise.resolve(42);
  const precreatedTime = await measure(
    "tryPromise (pre-created promise)",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await tryPromise(promise);
      }
    }
  );

  console.log("\n--- Analysis ---");
  console.log("=".repeat(70));

  const overhead = (time: number) =>
    (((time - nativeTime) / nativeTime) * 100).toFixed(1);

  console.log("\nOverhead vs native:");
  console.log(`Original tryAsync: +${overhead(originalTime)}%`);
  console.log(`tryPromise: +${overhead(directTime)}%`);
  console.log(`tryThen: +${overhead(thenTime)}%`);
  console.log(`tryMacro: +${overhead(macroTime)}%`);
  console.log(`Inline try-catch: +${overhead(inlineTime)}%`);
  console.log(`Pre-created promise: +${overhead(precreatedTime)}%`);

  console.log("\nKey Insights:");
  if (directTime < originalTime * 0.5) {
    console.log(
      "✓ Passing promises directly is MUCH faster than passing functions!"
    );
  }
  if (thenTime < directTime) {
    console.log("✓ Promise.then might be more optimized than async/await");
  }
  if (precreatedTime < directTime * 0.5) {
    console.log("✓ Pre-created promises have minimal overhead");
  }

  console.log("\nRecommendation:");
  const bestTime = Math.min(directTime, thenTime, macroTime);
  const bestApproach =
    bestTime === directTime
      ? "tryPromise"
      : bestTime === thenTime
      ? "tryThen"
      : "tryMacro";

  console.log(
    `Best approach: ${bestApproach} with ${overhead(bestTime)}% overhead`
  );
}

benchmarkAlternatives().catch(console.error);
