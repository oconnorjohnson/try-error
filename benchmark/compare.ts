import { trySync, tryAsync } from "../src";

// Note: To run this benchmark, you'll need to install comparison libraries:
// pnpm add -D neverthrow fp-ts

const ITERATIONS = 100_000;

interface BenchmarkResult {
  library: string;
  successTime: number;
  errorTime: number;
  asyncTime: number;
}

const results: BenchmarkResult[] = [];

// Helper function
function runBenchmark(
  name: string,
  fn: () => void,
  iterations: number = ITERATIONS
): number {
  const start = process.hrtime.bigint();
  fn();
  const end = process.hrtime.bigint();
  return Number(end - start) / 1_000_000; // Convert to milliseconds
}

async function runAsyncBenchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = ITERATIONS
): Promise<number> {
  const start = process.hrtime.bigint();
  await fn();
  const end = process.hrtime.bigint();
  return Number(end - start) / 1_000_000; // Convert to milliseconds
}

// 1. Native try/catch
async function benchmarkNative() {
  console.log("Benchmarking native try/catch...");

  const successTime = runBenchmark("Native success", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        const result = JSON.parse('{"valid": true}');
      } catch (e) {}
    }
  });

  const errorTime = runBenchmark("Native error", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        const result = JSON.parse("invalid");
      } catch (e) {
        const error = e;
      }
    }
  });

  const asyncTime = await runAsyncBenchmark("Native async", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        await Promise.resolve(42);
      } catch (e) {}
    }
  });

  results.push({
    library: "Native try/catch",
    successTime,
    errorTime,
    asyncTime,
  });
}

// 2. try-error
async function benchmarkTryError() {
  console.log("Benchmarking try-error...");

  const successTime = runBenchmark("try-error success", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const result = trySync(() => JSON.parse('{"valid": true}'));
    }
  });

  const errorTime = runBenchmark("try-error error", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const result = trySync(() => JSON.parse("invalid"));
    }
  });

  const asyncTime = await runAsyncBenchmark("try-error async", async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      await tryAsync(() => Promise.resolve(42));
    }
  });

  results.push({ library: "try-error", successTime, errorTime, asyncTime });
}

// 3. neverthrow (if available)
async function benchmarkNeverthrow() {
  try {
    const { Result, ok, err } = await import("neverthrow");
    console.log("Benchmarking neverthrow...");

    const successTime = runBenchmark("neverthrow success", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = Result.fromThrowable(
          () => JSON.parse('{"valid": true}'),
          () => new Error("Parse error")
        )();
      }
    });

    const errorTime = runBenchmark("neverthrow error", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = Result.fromThrowable(
          () => JSON.parse("invalid"),
          () => new Error("Parse error")
        )();
      }
    });

    const asyncTime = await runAsyncBenchmark("neverthrow async", async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        await Result.fromPromise(
          Promise.resolve(42),
          () => new Error("Async error")
        );
      }
    });

    results.push({ library: "neverthrow", successTime, errorTime, asyncTime });
  } catch (e) {
    console.log("neverthrow not installed, skipping...");
  }
}

// 4. fp-ts Either (if available)
async function benchmarkFpTs() {
  try {
    const { tryCatch } = await import("fp-ts/Either");
    const { pipe } = await import("fp-ts/function");
    console.log("Benchmarking fp-ts...");

    const successTime = runBenchmark("fp-ts success", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = tryCatch(
          () => JSON.parse('{"valid": true}'),
          (e) => String(e)
        );
      }
    });

    const errorTime = runBenchmark("fp-ts error", () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = tryCatch(
          () => JSON.parse("invalid"),
          (e) => String(e)
        );
      }
    });

    // fp-ts doesn't have built-in async support like the others
    const asyncTime = 0; // Skip async benchmark for fp-ts

    results.push({ library: "fp-ts", successTime, errorTime, asyncTime });
  } catch (e) {
    console.log("fp-ts not installed, skipping...");
  }
}

// Display results
function displayResults() {
  console.log("\n" + "=".repeat(80));
  console.log("COMPARISON RESULTS");
  console.log("=".repeat(80));
  console.log(`Iterations: ${ITERATIONS.toLocaleString()}`);
  console.log("");

  // Find baseline (native)
  const native = results.find((r) => r.library === "Native try/catch")!;

  // Create comparison table
  console.log("Library          | Success Path | Error Path | Async Path");
  console.log("-".repeat(60));

  results.forEach((result) => {
    const successDiff = (
      ((result.successTime - native.successTime) / native.successTime) *
      100
    ).toFixed(1);
    const errorDiff = (
      ((result.errorTime - native.errorTime) / native.errorTime) *
      100
    ).toFixed(1);
    const asyncDiff = result.asyncTime
      ? (
          ((result.asyncTime - native.asyncTime) / native.asyncTime) *
          100
        ).toFixed(1)
      : "N/A";

    const successColor = parseFloat(successDiff) > 0 ? "\x1b[31m" : "\x1b[32m"; // red if slower, green if faster
    const errorColor = parseFloat(errorDiff) > 0 ? "\x1b[31m" : "\x1b[32m";
    const asyncColor =
      asyncDiff !== "N/A" && parseFloat(asyncDiff) > 0
        ? "\x1b[31m"
        : "\x1b[32m";
    const reset = "\x1b[0m";

    const successStr =
      result.library === "Native try/catch"
        ? `${result.successTime.toFixed(2)}ms`
        : `${result.successTime.toFixed(2)}ms ${successColor}(${
            successDiff > "0" ? "+" : ""
          }${successDiff}%)${reset}`;

    const errorStr =
      result.library === "Native try/catch"
        ? `${result.errorTime.toFixed(2)}ms`
        : `${result.errorTime.toFixed(2)}ms ${errorColor}(${
            errorDiff > "0" ? "+" : ""
          }${errorDiff}%)${reset}`;

    const asyncStr =
      result.asyncTime === 0
        ? "N/A"
        : result.library === "Native try/catch"
        ? `${result.asyncTime.toFixed(2)}ms`
        : `${result.asyncTime.toFixed(2)}ms ${asyncColor}(${
            asyncDiff > "0" && asyncDiff !== "N/A" ? "+" : ""
          }${asyncDiff}%)${reset}`;

    console.log(
      `${result.library.padEnd(16)} | ${successStr.padEnd(
        12
      )} | ${errorStr.padEnd(10)} | ${asyncStr}`
    );
  });

  console.log("\n" + "=".repeat(80));
  console.log(
    "Lower is better. Percentages show difference from native try/catch."
  );
  console.log("Green = faster than native, Red = slower than native");
}

// Run all benchmarks
async function runComparison() {
  console.log("Running library comparison benchmarks...\n");

  await benchmarkNative();
  await benchmarkTryError();
  await benchmarkNeverthrow();
  await benchmarkFpTs();

  displayResults();
}

// Run
runComparison().catch(console.error);
