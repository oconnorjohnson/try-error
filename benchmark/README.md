# try-error Performance Benchmarks

This directory contains a comprehensive performance benchmarking suite for the try-error library.

## 🚀 Quick Start

```bash
# Run the complete benchmark suite
./benchmark/run.sh

# Run with baseline saving (for regression detection)
./benchmark/run.sh --save-baseline

# Run individual benchmarks
npx tsx benchmark/index.ts                    # Core performance
npx tsx benchmark/minimal-overhead.ts         # Minimal config analysis
npx tsx benchmark/compare.ts                  # Library comparison
npx tsx benchmark/scenarios/real-world.ts     # Real-world scenarios
node --expose-gc benchmark/memory/profiler.js # Memory profiling
```

## 📊 Available Benchmarks

### 1. Core Performance (`index.ts`)

Measures fundamental performance characteristics:

- **Success path**: Overhead when no errors occur (target: <5%)
- **Error path**: Overhead when errors are thrown
- **Error creation**: Cost of creating TryError objects
- **Async operations**: Performance with promises
- **Configuration impact**: How settings affect performance

### 2. Minimal Overhead Analysis (`minimal-overhead.ts`)

Finds the sweet spot between features and performance:

- Tests various configuration presets
- Identifies configurations that are FASTER than native try/catch
- Provides recommendations for different use cases
- Shows real-world impact with mixed success/error rates

### 3. Library Comparison (`compare.ts`)

Compares try-error against other error handling libraries:

- Native try/catch (baseline)
- neverthrow (Result type pattern)
- fp-ts (functional programming approach)

### 4. Real-World Scenarios (`scenarios/real-world.ts`)

Tests common use cases with statistical rigor:

- **API Response Parsing**: Validation and error handling
- **Nested Error Handling**: Multiple error levels
- **Async with Timeouts**: Network operation patterns
- **Form Validation**: Complex validation logic

### 5. Memory Profiling (`memory/profiler.ts`)

Comprehensive memory analysis:

- Heap usage over time
- Memory leak detection
- Object allocation patterns
- Growth rate analysis

### 6. Regression Detection (`regression/detector.ts`)

Prevents performance regressions:

- Compares against saved baselines
- Configurable regression thresholds
- Generates markdown reports
- CI/CD integration ready

## 📈 Understanding Results

### Statistical Analysis

All benchmarks now include:

- **Mean & Median**: Central tendency measures
- **Standard Deviation**: Variability indicator
- **Percentiles**: 95th and 99th for outliers
- **Confidence Intervals**: Statistical significance
- **Multiple Samples**: 30+ runs for accuracy

### Key Metrics

| Metric                | Target | Indicates                             |
| --------------------- | ------ | ------------------------------------- |
| Success Path Overhead | <5%    | Cost when no errors occur             |
| Error Path Overhead   | Varies | Can be negative (faster than native!) |
| Memory per Error      | <1KB   | Object allocation efficiency          |
| Growth Rate           | ~0     | Memory leak indicator                 |

### Configuration Impact

```typescript
// Minimal config can be FASTER than native for errors!
configure({
  captureStackTrace: false, // Skip expensive stack traces
  includeSource: false, // Skip source location
  minimalErrors: true, // Bare minimum overhead
});
```

## 🎯 Recommended Configurations

### For Most Applications

```typescript
// Minimal + Type Safety (4% overhead, faster on errors)
configure({
  captureStackTrace: false,
  includeSource: false,
  skipTimestamp: false, // Keep for debugging
  skipContext: false, // Keep for error details
  minimalErrors: true,
});
```

### For High Performance

```typescript
// Ultra-minimal (3% overhead, 15% faster on errors)
configure(ConfigPresets.minimal());
```

### For Development

```typescript
// Full features for debugging
resetConfig(); // Use defaults
```

## 🔧 Advanced Usage

### Running with Memory Profiling

```bash
# Required for accurate memory analysis
node --expose-gc benchmark/memory/profiler.js
```

### Saving Performance Baselines

```bash
# Save current results as baseline
npx tsx benchmark/index.ts --save-baseline

# Check for regressions
npx tsx benchmark/index.ts --fail-on-regression
```

### Generating HTML Dashboard

```bash
# Create visual benchmark report
npx tsx benchmark/dashboard.ts
# Opens benchmark-dashboard.html
```

## 📊 Expected Results

Based on extensive testing:

| Scenario          | Success Path | Error Path  | Notes                   |
| ----------------- | ------------ | ----------- | ----------------------- |
| Default Config    | +3-5%        | +1000-2000% | Full debugging features |
| Production Preset | +5-7%        | -5-10%      | No stack traces         |
| Minimal Config    | +3-4%        | -10-15%     | FASTER than native!     |
| With Type Safety  | +4-5%        | -12%        | Best balance            |

## 🚨 CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Benchmarks

on:
  pull_request:
    paths:
      - "src/**"
      - "benchmark/**"

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: pnpm install

      - name: Run benchmarks
        run: |
          pnpm build
          ./benchmark/run.sh --fail-on-regression

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: |
            benchmark-dashboard.html
            regression-report.md
```

### Regression Prevention

```bash
# In CI pipeline
./benchmark/run.sh --fail-on-regression

# Locally before committing
pnpm benchmark:check
```

## 🔍 Troubleshooting

### High Variance in Results

- Close other applications
- Disable CPU throttling
- Run with higher sample count
- Check for background processes

### Memory Profiling Not Working

```bash
# Must use --expose-gc flag
node --expose-gc benchmark/memory/profiler.js
```

### Regression Detection Issues

```bash
# Reset baseline if needed
rm benchmark/baseline.json
./benchmark/run.sh --save-baseline
```

## 📚 Understanding the Science

### Why Minimal Config is Faster

JavaScript errors ALWAYS capture stack traces when thrown, even if never accessed. This is expensive (~487% overhead). try-error with minimal config skips this, making it faster than native try/catch for error paths.

### Statistical Significance

Results show confidence intervals. Non-overlapping intervals indicate statistically significant differences. The benchmarks run 30+ samples to ensure reliability.

### Memory Leak Detection

The profiler tracks heap growth over time. Consistent growth in the second half vs first half of runs indicates potential leaks.
