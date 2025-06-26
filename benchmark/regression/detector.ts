import * as fs from "fs";
import * as path from "path";
import { BenchmarkResult } from "../utils/statistics";

interface Baseline {
  version: string;
  date: string;
  results: Record<string, BenchmarkResult>;
}

interface RegressionReport {
  passed: boolean;
  regressions: Array<{
    name: string;
    baseline: number;
    current: number;
    regression: number;
    threshold: number;
  }>;
  improvements: Array<{
    name: string;
    baseline: number;
    current: number;
    improvement: number;
  }>;
}

export class RegressionDetector {
  private baselinePath: string;
  private threshold: number;

  constructor(
    baselinePath: string = path.join(__dirname, "../baseline.json"),
    threshold: number = 10 // 10% regression threshold
  ) {
    this.baselinePath = baselinePath;
    this.threshold = threshold;
  }

  /**
   * Load baseline results from file
   */
  loadBaseline(): Baseline | null {
    try {
      if (!fs.existsSync(this.baselinePath)) {
        console.log(
          "⚠️  No baseline found. Run with --save-baseline to create one."
        );
        return null;
      }

      const data = fs.readFileSync(this.baselinePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading baseline:", error);
      return null;
    }
  }

  /**
   * Save current results as baseline
   */
  saveBaseline(results: Record<string, BenchmarkResult>): void {
    const baseline: Baseline = {
      version: process.version,
      date: new Date().toISOString(),
      results,
    };

    fs.writeFileSync(this.baselinePath, JSON.stringify(baseline, null, 2));
    console.log(`✅ Baseline saved to ${this.baselinePath}`);
  }

  /**
   * Compare current results against baseline
   */
  compare(
    current: Record<string, BenchmarkResult>,
    customThreshold?: number
  ): RegressionReport {
    const baseline = this.loadBaseline();
    if (!baseline) {
      return {
        passed: true,
        regressions: [],
        improvements: [],
      };
    }

    const threshold = customThreshold ?? this.threshold;
    const regressions: RegressionReport["regressions"] = [];
    const improvements: RegressionReport["improvements"] = [];

    for (const [name, currentResult] of Object.entries(current)) {
      const baselineResult = baseline.results[name];
      if (!baselineResult) {
        console.log(`⚠️  No baseline for "${name}", skipping...`);
        continue;
      }

      const percentChange =
        ((currentResult.mean - baselineResult.mean) / baselineResult.mean) *
        100;

      if (percentChange > threshold) {
        // Performance regression
        regressions.push({
          name,
          baseline: baselineResult.mean,
          current: currentResult.mean,
          regression: percentChange,
          threshold,
        });
      } else if (percentChange < -5) {
        // Significant improvement (5% or better)
        improvements.push({
          name,
          baseline: baselineResult.mean,
          current: currentResult.mean,
          improvement: Math.abs(percentChange),
        });
      }
    }

    return {
      passed: regressions.length === 0,
      regressions,
      improvements,
    };
  }

  /**
   * Generate a markdown report
   */
  generateReport(report: RegressionReport): string {
    const lines: string[] = [];

    lines.push("# Performance Regression Report");
    lines.push(`Date: ${new Date().toISOString()}`);
    lines.push(`Status: ${report.passed ? "✅ PASSED" : "❌ FAILED"}`);
    lines.push("");

    if (report.regressions.length > 0) {
      lines.push("## ❌ Regressions");
      lines.push("");
      lines.push("| Test | Baseline | Current | Regression | Threshold |");
      lines.push("|------|----------|---------|------------|-----------|");

      for (const reg of report.regressions) {
        lines.push(
          `| ${reg.name} | ${reg.baseline.toFixed(2)}ms | ${reg.current.toFixed(
            2
          )}ms | +${reg.regression.toFixed(1)}% | ${reg.threshold}% |`
        );
      }
      lines.push("");
    }

    if (report.improvements.length > 0) {
      lines.push("## ✅ Improvements");
      lines.push("");
      lines.push("| Test | Baseline | Current | Improvement |");
      lines.push("|------|----------|---------|-------------|");

      for (const imp of report.improvements) {
        lines.push(
          `| ${imp.name} | ${imp.baseline.toFixed(2)}ms | ${imp.current.toFixed(
            2
          )}ms | -${imp.improvement.toFixed(1)}% |`
        );
      }
      lines.push("");
    }

    if (
      report.passed &&
      report.regressions.length === 0 &&
      report.improvements.length === 0
    ) {
      lines.push("No significant performance changes detected.");
    }

    return lines.join("\n");
  }

  /**
   * Run regression detection and optionally fail the process
   */
  async detectRegressions(
    results: Record<string, BenchmarkResult>,
    options: {
      saveBaseline?: boolean;
      failOnRegression?: boolean;
      outputPath?: string;
    } = {}
  ): Promise<boolean> {
    if (options.saveBaseline) {
      this.saveBaseline(results);
      return true;
    }

    const report = this.compare(results);
    const markdown = this.generateReport(report);

    console.log("\n" + markdown);

    if (options.outputPath) {
      fs.writeFileSync(options.outputPath, markdown);
      console.log(`\nReport saved to ${options.outputPath}`);
    }

    if (!report.passed && options.failOnRegression) {
      console.error("\n❌ Performance regressions detected!");
      process.exit(1);
    }

    return report.passed;
  }
}

// CLI integration helper
export function setupRegressionDetection(
  results: Record<string, BenchmarkResult>
): void {
  const detector = new RegressionDetector();

  const args = process.argv.slice(2);
  const saveBaseline = args.includes("--save-baseline");
  const failOnRegression = args.includes("--fail-on-regression");

  detector.detectRegressions(results, {
    saveBaseline,
    failOnRegression,
    outputPath: failOnRegression ? "regression-report.md" : undefined,
  });
}
