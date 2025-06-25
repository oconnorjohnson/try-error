import { trySync, tryAsync, createError } from "../src";
import { configure, resetConfig } from "../src/config";

// Benchmark configuration
const ITERATIONS = 1_000_000;
const ASYNC_ITERATIONS = 100_000;
const WARMUP_ITERATIONS = 1000;

// Color codes for output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Helper to format numbers with commas
function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Helper to calculate percentage difference
function percentDiff(base: number, compare: number): string {
  const diff = ((compare - base) / base) * 100;
  const color = diff > 0 ? colors.red : colors.green;
  const sign = diff > 0 ? "+" : "";
  return `${color}${sign}${diff.toFixed(2)}%${colors.reset}`;
}

// Warmup function to ensure JIT optimization
function warmup() {
  console.log(`${colors.blue}Warming up...${colors.reset}`);

  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    // Native
    try {
      JSON.parse('{"valid": true}');
    } catch (e) {}
    try {
      JSON.parse("invalid");
    } catch (e) {}

    // try-error
    trySync(() => JSON.parse('{"valid": true}'));
    trySync(() => JSON.parse("invalid"));
  }
}

// Benchmark runner
function runBenchmark(
  name: string,
  fn: () => void,
  iterations: number = ITERATIONS
): number {
  const start = process.hrtime.bigint();
  fn();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
  const opsPerSec = (iterations / duration) * 1000;

  return duration;
}

// Main benchmark suite
async function runBenchmarks() {
  console.log(`${colors.bold}try-error Performance Benchmarks${colors.reset}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Iterations: ${formatNumber(ITERATIONS)}`);
  console.log("=".repeat(60));

  warmup();
  console.log("");

  // 1. Success Path Benchmarks
  console.log(`${colors.bold}1. Success Path (JSON parsing)${colors.reset}`);

  const nativeSuccessTime = runBenchmark("Native try/catch - success", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        const result = JSON.parse('{"valid": true}');
      } catch (e) {}
    }
  });

  const tryErrorSuccessTime = runBenchmark("trySync - success", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const result = trySync(() => JSON.parse('{"valid": true}'));
    }
  });

  console.log(`Native try/catch: ${nativeSuccessTime.toFixed(2)}ms`);
  console.log(
    `trySync:         ${tryErrorSuccessTime.toFixed(2)}ms (${percentDiff(
      nativeSuccessTime,
      tryErrorSuccessTime
    )})`
  );
  console.log("");

  // 2. Error Path Benchmarks
  console.log(
    `${colors.bold}2. Error Path (JSON parsing failure)${colors.reset}`
  );

  const nativeErrorTime = runBenchmark("Native try/catch - error", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        const result = JSON.parse("invalid json");
      } catch (e) {
        const error = e;
      }
    }
  });

  const tryErrorErrorTime = runBenchmark("trySync - error", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const result = trySync(() => JSON.parse("invalid json"));
    }
  });

  console.log(`Native try/catch: ${nativeErrorTime.toFixed(2)}ms`);
  console.log(
    `trySync:         ${tryErrorErrorTime.toFixed(2)}ms (${percentDiff(
      nativeErrorTime,
      tryErrorErrorTime
    )})`
  );
  console.log("");

  // 3. Error Creation Benchmarks
  console.log(`${colors.bold}3. Error Creation${colors.reset}`);

  const nativeErrorCreation = runBenchmark("new Error()", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const error = new Error("Test error");
    }
  });

  const tryErrorCreation = runBenchmark("createError()", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const error = createError({
        type: "TestError",
        message: "Test error",
      });
    }
  });

  console.log(`new Error():   ${nativeErrorCreation.toFixed(2)}ms`);
  console.log(
    `createError(): ${tryErrorCreation.toFixed(2)}ms (${percentDiff(
      nativeErrorCreation,
      tryErrorCreation
    )})`
  );
  console.log("");

  // 4. Async Benchmarks
  console.log(
    `${colors.bold}4. Async Operations (${formatNumber(
      ASYNC_ITERATIONS
    )} iterations)${colors.reset}`
  );

  const nativeAsyncTime = await (async () => {
    const start = process.hrtime.bigint();
    for (let i = 0; i < ASYNC_ITERATIONS; i++) {
      try {
        await Promise.resolve(42);
      } catch (e) {}
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000;
  })();

  const tryAsyncTime = await (async () => {
    const start = process.hrtime.bigint();
    for (let i = 0; i < ASYNC_ITERATIONS; i++) {
      await tryAsync(() => Promise.resolve(42));
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000;
  })();

  console.log(`Native async/await: ${nativeAsyncTime.toFixed(2)}ms`);
  console.log(
    `tryAsync:          ${tryAsyncTime.toFixed(2)}ms (${percentDiff(
      nativeAsyncTime,
      tryAsyncTime
    )})`
  );
  console.log("");

  // 5. Configuration Impact
  console.log(`${colors.bold}5. Configuration Impact${colors.reset}`);

  // Default configuration
  resetConfig();
  const defaultTime = runBenchmark("Default config", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const error = createError({
        type: "TestError",
        message: "Test error",
      });
    }
  });

  // Minimal configuration
  configure({
    captureStackTrace: false,
    includeSource: false,
  });

  const minimalTime = runBenchmark("Minimal config", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const error = createError({
        type: "TestError",
        message: "Test error",
      });
    }
  });

  console.log(`Default config: ${defaultTime.toFixed(2)}ms`);
  console.log(
    `Minimal config: ${minimalTime.toFixed(2)}ms (${percentDiff(
      defaultTime,
      minimalTime
    )})`
  );
  console.log("");

  // 6. Memory Usage (if available)
  if (global.gc) {
    console.log(`${colors.bold}6. Memory Usage${colors.reset}`);

    // Force GC before measurement
    global.gc();
    const beforeMem = process.memoryUsage();

    // Create many errors
    const errors: any[] = [];
    for (let i = 0; i < 10000; i++) {
      errors.push(
        createError({
          type: "TestError",
          message: "Test error with context",
          context: { index: i, data: "x".repeat(100) },
        })
      );
    }

    const afterMem = process.memoryUsage();
    const heapUsed = (afterMem.heapUsed - beforeMem.heapUsed) / 1024 / 1024;

    console.log(`Heap used for 10,000 errors: ${heapUsed.toFixed(2)} MB`);
    console.log(
      `Average per error: ${((heapUsed * 1024) / 10000).toFixed(2)} KB`
    );
  } else {
    console.log(
      `${colors.yellow}Note: Run with --expose-gc flag for memory benchmarks${colors.reset}`
    );
  }

  console.log("\n" + "=".repeat(60));
  console.log(`${colors.bold}Summary${colors.reset}`);
  console.log(
    "Success path overhead: " +
      percentDiff(nativeSuccessTime, tryErrorSuccessTime)
  );
  console.log(
    "Error path overhead: " + percentDiff(nativeErrorTime, tryErrorErrorTime)
  );
  console.log("Async overhead: " + percentDiff(nativeAsyncTime, tryAsyncTime));
  console.log(
    "Config optimization potential: " + percentDiff(defaultTime, minimalTime)
  );
}

// Run benchmarks
runBenchmarks().catch(console.error);
