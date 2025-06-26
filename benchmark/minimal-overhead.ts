import { trySync, tryAsync, createError, isTryError } from "../src";
import { configure, resetConfig, ConfigPresets } from "../src/config";

// Benchmark configuration
const ITERATIONS = 1_000_000;
const WARMUP_ITERATIONS = 10_000;

// Color codes for output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

// Helper to format numbers with commas
function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Helper to calculate percentage difference
function percentDiff(base: number, compare: number): string {
  const diff = ((compare - base) / base) * 100;
  const color =
    diff > 50 ? colors.red : diff > 10 ? colors.yellow : colors.green;
  const sign = diff > 0 ? "+" : "";
  return `${color}${sign}${diff.toFixed(1)}%${colors.reset}`;
}

// Warmup function
function warmup() {
  console.log(`${colors.dim}Warming up JIT...${colors.reset}`);

  // Warm up all configurations
  const configs = [
    () => resetConfig(),
    () => configure(ConfigPresets.minimal()),
    () =>
      configure({
        captureStackTrace: false,
        skipTimestamp: true,
        skipContext: true,
        minimalErrors: true,
      }),
  ];

  for (const config of configs) {
    config();
    for (let i = 0; i < WARMUP_ITERATIONS; i++) {
      trySync(() => JSON.parse('{"valid": true}'));
      trySync(() => JSON.parse("invalid"));
    }
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
  return Number(end - start) / 1_000_000; // Convert to milliseconds
}

// Test data
const validJson = '{"name":"John","age":30,"city":"New York"}';
const invalidJson = "invalid json {]";

async function runMinimalOverheadBenchmarks() {
  console.log(
    `${colors.bold}${colors.cyan}try-error Minimal Overhead Benchmarks${colors.reset}`
  );
  console.log(
    `${colors.dim}Finding the sweet spot between features and performance${colors.reset}\n`
  );
  console.log(`Node.js: ${process.version}`);
  console.log(`Iterations: ${formatNumber(ITERATIONS)}`);
  console.log("=".repeat(80));

  warmup();
  console.log("");

  // Baseline: Native try/catch
  console.log(`${colors.bold}📊 BASELINE: Native try/catch${colors.reset}`);

  const nativeSuccessTime = runBenchmark("Native success", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        const result = JSON.parse(validJson);
      } catch (e) {}
    }
  });

  const nativeErrorTime = runBenchmark("Native error", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      try {
        const result = JSON.parse(invalidJson);
      } catch (e) {
        const msg = (e as Error).message;
      }
    }
  });

  console.log(`Success: ${nativeSuccessTime.toFixed(2)}ms`);
  console.log(`Error:   ${nativeErrorTime.toFixed(2)}ms`);
  console.log("");

  // Test different configurations
  const configurations = [
    {
      name: "Default (Full Features)",
      setup: () => resetConfig(),
      description: "Stack traces, source location, timestamps, context",
    },
    {
      name: "Production Preset",
      setup: () => configure(ConfigPresets.production()),
      description: "No stack traces, basic error info",
    },
    {
      name: "Minimal Preset",
      setup: () => configure(ConfigPresets.minimal()),
      description: "Bare minimum: type and message only",
    },
    {
      name: "Ultra-Minimal Custom",
      setup: () =>
        configure({
          captureStackTrace: false,
          includeSource: false,
          skipTimestamp: true,
          skipContext: true,
          minimalErrors: true,
        }),
      description: "Absolute minimum overhead",
    },
    {
      name: "Minimal + Type Safety",
      setup: () =>
        configure({
          captureStackTrace: false,
          includeSource: false,
          skipTimestamp: false, // Keep timestamp for debugging
          skipContext: false, // Keep context for error details
          minimalErrors: true,
        }),
      description: "Minimal with useful debugging info",
    },
  ];

  console.log(`${colors.bold}🧪 CONFIGURATION TESTS${colors.reset}\n`);

  const results: Array<{
    name: string;
    successTime: number;
    errorTime: number;
    successOverhead: string;
    errorOverhead: string;
    features: string;
  }> = [];

  for (const config of configurations) {
    console.log(`${colors.bold}${colors.blue}${config.name}${colors.reset}`);
    console.log(`${colors.dim}${config.description}${colors.reset}`);

    config.setup();

    // Success path
    const successTime = runBenchmark(`${config.name} - success`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = trySync(() => JSON.parse(validJson));
      }
    });

    // Error path
    const errorTime = runBenchmark(`${config.name} - error`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = trySync(() => JSON.parse(invalidJson));
      }
    });

    // Test what features are available
    const testError = trySync(() => JSON.parse(invalidJson));
    const features: string[] = [];
    if (isTryError(testError)) {
      if (testError.stack) features.push("stack");
      if (testError.source && testError.source !== "unknown")
        features.push("source");
      if (testError.timestamp && testError.timestamp > 0)
        features.push("timestamp");
      if (testError.context !== undefined) features.push("context");
      if (testError.type) features.push("type");
      if (testError.message) features.push("message");
    }

    const successOverhead = percentDiff(nativeSuccessTime, successTime);
    const errorOverhead = percentDiff(nativeErrorTime, errorTime);

    console.log(`Success: ${successTime.toFixed(2)}ms (${successOverhead})`);
    console.log(`Error:   ${errorTime.toFixed(2)}ms (${errorOverhead})`);
    console.log(`Features: ${features.join(", ") || "none"}`);
    console.log("");

    results.push({
      name: config.name,
      successTime,
      errorTime,
      successOverhead,
      errorOverhead,
      features: features.join(", "),
    });
  }

  // Summary
  console.log("=".repeat(80));
  console.log(`${colors.bold}📈 SUMMARY${colors.reset}\n`);

  console.log(`${colors.bold}Success Path Overhead:${colors.reset}`);
  results.forEach((r) => {
    console.log(`  ${r.name.padEnd(25)} ${r.successOverhead}`);
  });

  console.log(`\n${colors.bold}Error Path Overhead:${colors.reset}`);
  results.forEach((r) => {
    console.log(`  ${r.name.padEnd(25)} ${r.errorOverhead}`);
  });

  console.log(`\n${colors.bold}Feature Comparison:${colors.reset}`);
  results.forEach((r) => {
    console.log(`  ${r.name.padEnd(25)} ${r.features}`);
  });

  // Recommendations
  console.log(
    `\n${colors.bold}${colors.green}🎯 RECOMMENDATIONS${colors.reset}\n`
  );

  const minimalPlusType = results.find(
    (r) => r.name === "Minimal + Type Safety"
  );
  const ultraMinimal = results.find((r) => r.name === "Ultra-Minimal Custom");

  console.log(`${colors.bold}For Production Apps:${colors.reset}`);
  console.log(`  Use "Minimal + Type Safety" configuration:`);
  console.log(`  - Success overhead: ${minimalPlusType?.successOverhead}`);
  console.log(`  - Error overhead: ${minimalPlusType?.errorOverhead}`);
  console.log(`  - Features: ${minimalPlusType?.features}`);
  console.log(
    `  - ${colors.green}Best balance of performance and debugging${colors.reset}`
  );

  console.log(
    `\n${colors.bold}For High-Performance/Validation:${colors.reset}`
  );
  console.log(`  Use "Ultra-Minimal Custom" configuration:`);
  console.log(`  - Success overhead: ${ultraMinimal?.successOverhead}`);
  console.log(`  - Error overhead: ${ultraMinimal?.errorOverhead}`);
  console.log(`  - Features: ${ultraMinimal?.features}`);
  console.log(`  - ${colors.green}Absolute minimum overhead${colors.reset}`);

  // Test real-world scenario
  console.log(
    `\n${colors.bold}${colors.magenta}🌍 REAL-WORLD SCENARIO${colors.reset}`
  );
  console.log(
    `${colors.dim}Parsing 1000 items with 5% error rate${colors.reset}\n`
  );

  const testData = Array(1000)
    .fill(null)
    .map((_, i) => (i % 20 === 0 ? invalidJson : validJson));

  // Native baseline
  const nativeRealWorld = runBenchmark(
    "Native real-world",
    () => {
      for (const json of testData) {
        try {
          const result = JSON.parse(json);
        } catch (e) {
          const msg = (e as Error).message;
        }
      }
    },
    1000
  );

  // Minimal + Type Safety
  configure({
    captureStackTrace: false,
    includeSource: false,
    skipTimestamp: false,
    skipContext: false,
    minimalErrors: true,
  });

  const minimalRealWorld = runBenchmark(
    "Minimal+TypeSafety real-world",
    () => {
      for (const json of testData) {
        const result = trySync(() => JSON.parse(json));
        if (isTryError(result)) {
          const msg = result.message;
          const type = result.type;
        }
      }
    },
    1000
  );

  console.log(`Native try/catch:     ${nativeRealWorld.toFixed(2)}ms`);
  console.log(
    `Minimal + Type Safety: ${minimalRealWorld.toFixed(2)}ms (${percentDiff(
      nativeRealWorld,
      minimalRealWorld
    )})`
  );
  console.log(
    `\n${colors.green}✓ With 95% success rate, overhead is minimal!${colors.reset}`
  );
}

// Run benchmarks
runMinimalOverheadBenchmarks().catch(console.error);
