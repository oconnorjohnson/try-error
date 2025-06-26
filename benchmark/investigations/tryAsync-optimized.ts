import {
  TryError,
  TryResult,
  TRY_ERROR_BRAND,
  isTryError,
} from "../../src/types";
import { fromThrown } from "../../src/errors";

// Pre-defined abort handler to avoid creating functions
const createAbortPromise = (signal: AbortSignal): Promise<never> => {
  return new Promise<never>((_, reject) => {
    if (signal.aborted) {
      reject(new Error("Operation was aborted"));
    } else {
      signal.addEventListener("abort", () => {
        reject(new Error("Operation was aborted"));
      });
    }
  });
};

// Pre-defined timeout creator
const createTimeoutPromise = (ms: number): [Promise<never>, () => void] => {
  let timeoutId: NodeJS.Timeout | number;
  const promise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Operation timed out after ${ms}ms`)),
      ms
    );
  });
  const cleanup = () => clearTimeout(timeoutId);
  return [promise, cleanup];
};

// Optimized tryAsync - avoids creating functions in hot path
export async function tryAsyncOptimized<T>(
  fn: () => Promise<T>,
  options?: {
    errorType?: string;
    context?: Record<string, unknown>;
    message?: string;
    timeout?: number;
    signal?: AbortSignal;
  }
): Promise<TryResult<T, TryError>> {
  try {
    let promise = fn();

    // Only use Promise.race if we have timeout or signal
    if (options?.signal || options?.timeout) {
      const promises: Promise<any>[] = [promise];
      let cleanup: (() => void) | undefined;

      if (options.signal) {
        promises.push(createAbortPromise(options.signal));
      }

      if (options.timeout) {
        const [timeoutPromise, timeoutCleanup] = createTimeoutPromise(
          options.timeout
        );
        promises.push(timeoutPromise);
        cleanup = timeoutCleanup;
      }

      try {
        const result = await Promise.race(promises);
        cleanup?.();
        return result;
      } catch (error) {
        cleanup?.();
        throw error;
      }
    }

    // Fast path - no timeout or signal
    return await promise;
  } catch (error) {
    if (options?.errorType) {
      return {
        [TRY_ERROR_BRAND]: true,
        type: options.errorType,
        message:
          options.message ||
          (error instanceof Error ? error.message : "Async operation failed"),
        source: "unknown",
        timestamp: Date.now(),
        cause: error,
        context: options.context,
      } as TryError;
    }

    return fromThrown(error, options?.context);
  }
}

// Ultra-optimized version for the common case (no options)
export async function tryAsyncUltra<T>(
  fn: () => Promise<T>
): Promise<TryResult<T, TryError>> {
  try {
    return await fn();
  } catch (error) {
    return fromThrown(error);
  }
}

// Benchmark comparison
const ITERATIONS = 100_000;

async function benchmarkOptimizations() {
  console.log("Benchmarking tryAsync Optimizations");
  console.log("=".repeat(60));
  console.log(`Iterations: ${ITERATIONS.toLocaleString()}\n`);

  // Warmup
  for (let i = 0; i < 10000; i++) {
    await Promise.resolve(42);
  }

  // Import original tryAsync
  const { tryAsync } = await import("../../src/async");

  async function measure(
    name: string,
    fn: () => Promise<void>
  ): Promise<number> {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    console.log(`${name.padEnd(40)}: ${ms.toFixed(2)}ms`);
    return ms;
  }

  // Baseline
  const nativeTime = await measure("Native async/await", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        await Promise.resolve(42);
      } catch (e) {}
    }
  });

  // Original tryAsync
  const originalTime = await measure("Original tryAsync", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await tryAsync(() => Promise.resolve(42));
    }
  });

  // Optimized tryAsync
  const optimizedTime = await measure("Optimized tryAsync", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await tryAsyncOptimized(() => Promise.resolve(42));
    }
  });

  // Ultra-optimized (no options)
  const ultraTime = await measure("Ultra-optimized tryAsync", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await tryAsyncUltra(() => Promise.resolve(42));
    }
  });

  // With pre-defined function
  const testFn = () => Promise.resolve(42);
  const predefinedTime = await measure(
    "Ultra-optimized (pre-defined fn)",
    async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await tryAsyncUltra(testFn);
      }
    }
  );

  console.log("\n--- Results ---");
  console.log("=".repeat(60));

  const overhead = (time: number) =>
    (((time - nativeTime) / nativeTime) * 100).toFixed(1);

  console.log(`Native baseline: ${nativeTime.toFixed(2)}ms`);
  console.log(`Original tryAsync: +${overhead(originalTime)}%`);
  console.log(`Optimized tryAsync: +${overhead(optimizedTime)}%`);
  console.log(`Ultra-optimized: +${overhead(ultraTime)}%`);
  console.log(`Ultra (pre-defined): +${overhead(predefinedTime)}%`);

  const improvement = (
    ((originalTime - optimizedTime) / originalTime) *
    100
  ).toFixed(1);
  const ultraImprovement = (
    ((originalTime - ultraTime) / originalTime) *
    100
  ).toFixed(1);

  console.log(`\nImprovement over original:`);
  console.log(`Optimized: ${improvement}% faster`);
  console.log(`Ultra: ${ultraImprovement}% faster`);
}

// Run benchmark
if (require.main === module) {
  benchmarkOptimizations().catch(console.error);
}
