export interface BenchmarkResult {
  name: string;
  samples: number[];
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
  confidenceInterval: [number, number];
  outliers: number;
}

export function calculateStats(
  samples: number[]
): Omit<BenchmarkResult, "name"> {
  const sorted = [...samples].sort((a, b) => a - b);
  const n = samples.length;

  // Calculate mean
  const mean = samples.reduce((sum, val) => sum + val, 0) / n;

  // Calculate median
  const median =
    n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

  // Calculate standard deviation
  const variance =
    samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);

  // Calculate percentiles
  const p95 = sorted[Math.floor(n * 0.95)];
  const p99 = sorted[Math.floor(n * 0.99)];

  // Calculate confidence interval (95%)
  const standardError = stdDev / Math.sqrt(n);
  const marginOfError = 1.96 * standardError; // 95% confidence
  const confidenceInterval: [number, number] = [
    mean - marginOfError,
    mean + marginOfError,
  ];

  // Detect outliers using IQR method
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = samples.filter(
    (s) => s < lowerBound || s > upperBound
  ).length;

  return {
    samples,
    mean,
    median,
    stdDev,
    min: sorted[0],
    max: sorted[n - 1],
    p95,
    p99,
    confidenceInterval,
    outliers,
  };
}

export function runBenchmarkWithStats(
  name: string,
  fn: () => void,
  iterations: number,
  samples: number = 30
): BenchmarkResult {
  const results: number[] = [];

  // Warmup
  for (let i = 0; i < 5; i++) {
    fn();
  }

  // Collect samples
  for (let i = 0; i < samples; i++) {
    const start = process.hrtime.bigint();
    for (let j = 0; j < iterations; j++) {
      fn();
    }
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // ms
    results.push(duration);
  }

  return {
    name,
    ...calculateStats(results),
  };
}

export function formatResult(
  result: BenchmarkResult,
  baseline?: BenchmarkResult
): string {
  const lines: string[] = [];

  lines.push(`${result.name}:`);
  lines.push(
    `  Mean: ${result.mean.toFixed(2)}ms ± ${result.stdDev.toFixed(2)}ms`
  );
  lines.push(`  Median: ${result.median.toFixed(2)}ms`);
  lines.push(`  95th percentile: ${result.p95.toFixed(2)}ms`);
  lines.push(
    `  Range: ${result.min.toFixed(2)}ms - ${result.max.toFixed(2)}ms`
  );

  if (baseline) {
    const diff = ((result.mean - baseline.mean) / baseline.mean) * 100;
    const faster = diff < 0;
    lines.push(
      `  vs baseline: ${faster ? "" : "+"}${diff.toFixed(1)}% ${
        faster ? "(faster)" : "(slower)"
      }`
    );
  }

  if (result.outliers > 0) {
    lines.push(`  ⚠️  ${result.outliers} outliers detected`);
  }

  return lines.join("\n");
}

export function compareResults(
  a: BenchmarkResult,
  b: BenchmarkResult
): {
  faster: string;
  speedup: number;
  significant: boolean;
} {
  const speedup = ((b.mean - a.mean) / b.mean) * 100;
  const faster = a.mean < b.mean ? a.name : b.name;

  // Check if confidence intervals overlap
  const aLower = a.confidenceInterval[0];
  const aUpper = a.confidenceInterval[1];
  const bLower = b.confidenceInterval[0];
  const bUpper = b.confidenceInterval[1];

  const significant = aUpper < bLower || bUpper < aLower;

  return { faster, speedup: Math.abs(speedup), significant };
}
