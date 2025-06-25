# try-error Performance Benchmarks

This directory contains performance benchmarks for the try-error library.

## Available Benchmarks

### 1. Main Performance Benchmark (`index.ts`)

Comprehensive benchmark suite that measures:

- Success path performance (no errors thrown)
- Error path performance (errors thrown and caught)
- Error creation overhead
- Async operation performance
- Configuration impact on performance
- Memory usage

**Run it:**

```bash
# Standard benchmark
npx tsx benchmark/index.ts

# With memory profiling
node --expose-gc dist/benchmark/index.js
```

### 2. Library Comparison (`compare.ts`)

Compares try-error performance against other popular error handling libraries:

- Native try/catch (baseline)
- neverthrow
- fp-ts

**Setup:**

```bash
# Install comparison libraries (optional)
pnpm add -D neverthrow fp-ts
```

**Run it:**

```bash
npx tsx benchmark/compare.ts
```

### 3. Automated Benchmark Script (`run.sh`)

Runs all benchmarks with proper build steps:

```bash
./benchmark/run.sh
```

## Understanding the Results

### Success Path

Measures the overhead when no errors occur. This is the most critical metric since most code paths succeed. Target: < 5% overhead vs native try/catch.

### Error Path

Measures the overhead when errors are thrown. Less critical than success path but still important. Our rich error context adds value here.

### Configuration Impact

Shows how much performance you can gain by disabling features like stack traces and source location capture in production.

### Memory Usage

Measures memory overhead of error objects. Important for applications that may create many errors.

## Benchmark Environment

For accurate results:

1. Close other applications
2. Run on consistent hardware
3. Use Node.js 18+ for best performance
4. Run multiple times and average results
5. Ensure your machine isn't thermal throttling

## Expected Results

Based on our testing:

- **Success path**: 2-5% overhead vs native try/catch
- **Error path**: 15-30% overhead (due to rich error context)
- **Async operations**: 5-10% overhead
- **With minimal config**: < 2% overhead on success path

## Continuous Benchmarking

Consider setting up automated benchmarks in CI to catch performance regressions:

```yaml
# .github/workflows/benchmark.yml
- name: Run benchmarks
  run: |
    pnpm build
    node benchmark/index.js > benchmark-results.txt

- name: Compare with baseline
  run: |
    # Compare results with previous runs
    # Fail if regression > 10%
```
