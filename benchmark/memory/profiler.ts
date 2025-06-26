import {
  trySync,
  tryAsync,
  createError,
  configure,
  resetConfig,
} from "../../src";
import * as v8 from "v8";

interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  timestamp: number;
}

export interface MemoryProfile {
  name: string;
  iterations: number;
  snapshots: MemorySnapshot[];
  baseline: MemorySnapshot;
  peak: MemorySnapshot;
  average: MemorySnapshot;
  growth: number;
  growthRate: number;
  possibleLeak: boolean;
}

export class MemoryProfiler {
  private forceGC(): void {
    if (global.gc) {
      global.gc();
      global.gc(); // Run twice to ensure cleanup
    } else {
      console.warn(
        "⚠️  Run with --expose-gc flag for accurate memory profiling"
      );
    }
  }

  private takeSnapshot(): MemorySnapshot {
    const mem = process.memoryUsage();
    return {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers,
      timestamp: Date.now(),
    };
  }

  private calculateAverage(snapshots: MemorySnapshot[]): MemorySnapshot {
    const sum = snapshots.reduce(
      (acc, snap) => ({
        heapUsed: acc.heapUsed + snap.heapUsed,
        heapTotal: acc.heapTotal + snap.heapTotal,
        external: acc.external + snap.external,
        arrayBuffers: acc.arrayBuffers + snap.arrayBuffers,
        timestamp: 0,
      }),
      {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        arrayBuffers: 0,
        timestamp: 0,
      }
    );

    const count = snapshots.length;
    return {
      heapUsed: sum.heapUsed / count,
      heapTotal: sum.heapTotal / count,
      external: sum.external / count,
      arrayBuffers: sum.arrayBuffers / count,
      timestamp: Date.now(),
    };
  }

  async profile(
    name: string,
    fn: () => void | Promise<void>,
    iterations: number = 10000,
    samplingInterval: number = 1000
  ): Promise<MemoryProfile> {
    console.log(`\n📊 Profiling: ${name}`);

    // Take baseline
    this.forceGC();
    await new Promise((resolve) => setTimeout(resolve, 100)); // Let GC settle
    const baseline = this.takeSnapshot();

    const snapshots: MemorySnapshot[] = [];
    let peak = baseline;

    // Run iterations with periodic snapshots
    for (let i = 0; i < iterations; i++) {
      await fn();

      if (i % samplingInterval === 0) {
        const snapshot = this.takeSnapshot();
        snapshots.push(snapshot);

        if (snapshot.heapUsed > peak.heapUsed) {
          peak = snapshot;
        }

        // Progress indicator
        if (i % (iterations / 10) === 0) {
          process.stdout.write(".");
        }
      }
    }
    console.log(" Done!");

    // Final snapshot after GC
    this.forceGC();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const final = this.takeSnapshot();
    snapshots.push(final);

    // Calculate metrics
    const average = this.calculateAverage(snapshots);
    const growth = final.heapUsed - baseline.heapUsed;
    const growthRate = growth / iterations;

    // Simple leak detection: consistent growth over time
    const firstHalf = snapshots.slice(0, snapshots.length / 2);
    const secondHalf = snapshots.slice(snapshots.length / 2);
    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);
    const possibleLeak = secondAvg.heapUsed > firstAvg.heapUsed * 1.1; // 10% growth

    return {
      name,
      iterations,
      snapshots,
      baseline,
      peak,
      average,
      growth,
      growthRate,
      possibleLeak,
    };
  }

  formatProfile(profile: MemoryProfile): string {
    const formatBytes = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const lines: string[] = [];
    lines.push(`\n${profile.name}:`);
    lines.push(`  Iterations: ${profile.iterations.toLocaleString()}`);
    lines.push(`  Baseline: ${formatBytes(profile.baseline.heapUsed)}`);
    lines.push(`  Peak: ${formatBytes(profile.peak.heapUsed)}`);
    lines.push(`  Average: ${formatBytes(profile.average.heapUsed)}`);
    lines.push(`  Total Growth: ${formatBytes(profile.growth)}`);
    lines.push(`  Growth/iteration: ${formatBytes(profile.growthRate)}`);

    if (profile.possibleLeak) {
      lines.push(`  ⚠️  Possible memory leak detected!`);
    } else {
      lines.push(`  ✅ No memory leaks detected`);
    }

    return lines.join("\n");
  }

  generateHeapSnapshot(filename: string): void {
    if (!v8.writeHeapSnapshot) {
      console.warn("Heap snapshots not available in this Node.js version");
      return;
    }

    const path = v8.writeHeapSnapshot(filename);
    console.log(`Heap snapshot written to: ${path}`);
  }
}

// Memory benchmark scenarios
export async function runMemoryBenchmarks() {
  const profiler = new MemoryProfiler();
  const profiles: MemoryProfile[] = [];

  console.log("🧠 Memory Usage Profiling");
  console.log("=".repeat(50));

  // 1. Basic error creation
  profiles.push(
    await profiler.profile(
      "Basic Error Creation",
      () => {
        const error = createError({
          type: "TestError",
          message: "Test error message",
        });
      },
      100000
    )
  );

  // 2. Error with large context
  profiles.push(
    await profiler.profile(
      "Error with Large Context",
      () => {
        const error = createError({
          type: "TestError",
          message: "Test error message",
          context: {
            data: "x".repeat(1000),
            array: Array(100).fill(0),
            nested: {
              deep: {
                value: "test",
              },
            },
          },
        });
      },
      10000
    )
  );

  // 3. trySync with success
  profiles.push(
    await profiler.profile(
      "trySync Success Path",
      () => {
        const result = trySync(() => {
          return { value: 42 };
        });
      },
      100000
    )
  );

  // 4. trySync with errors
  profiles.push(
    await profiler.profile(
      "trySync Error Path",
      () => {
        const result = trySync(() => {
          throw new Error("Test error");
        });
      },
      50000
    )
  );

  // 5. Async operations
  profiles.push(
    await profiler.profile(
      "tryAsync Operations",
      async () => {
        const result = await tryAsync(async () => {
          return Promise.resolve({ value: 42 });
        });
      },
      10000
    )
  );

  // 6. Configuration changes
  profiles.push(
    await profiler.profile(
      "Configuration Changes",
      () => {
        configure({ captureStackTrace: false });
        const error = createError({
          type: "TestError",
          message: "Test",
        });
        resetConfig();
      },
      10000
    )
  );

  // 7. Error chain (nested errors)
  profiles.push(
    await profiler.profile(
      "Error Chains",
      () => {
        const inner = createError({
          type: "InnerError",
          message: "Inner error",
        });

        const middle = createError({
          type: "MiddleError",
          message: "Middle error",
          cause: inner,
        });

        const outer = createError({
          type: "OuterError",
          message: "Outer error",
          cause: middle,
        });
      },
      50000
    )
  );

  // Display results
  console.log("\n📊 Memory Profile Results:");
  console.log("=".repeat(50));

  for (const profile of profiles) {
    console.log(profiler.formatProfile(profile));
  }

  // Check for leaks
  const leaks = profiles.filter((p) => p.possibleLeak);
  if (leaks.length > 0) {
    console.log("\n⚠️  Possible memory leaks in:");
    leaks.forEach((p) => console.log(`  - ${p.name}`));
  } else {
    console.log("\n✅ No memory leaks detected!");
  }

  // Object allocation analysis
  console.log("\n📈 Object Allocation Analysis:");
  console.log("=".repeat(50));

  const errorProfile = profiles.find((p) => p.name === "Basic Error Creation");
  if (errorProfile) {
    const bytesPerError = errorProfile.growthRate;
    console.log(`Average bytes per TryError: ${bytesPerError.toFixed(2)}`);
    console.log(
      `Errors that fit in 1MB: ${Math.floor(
        (1024 * 1024) / bytesPerError
      ).toLocaleString()}`
    );
  }

  return profiles;
}

// Run if called directly
if (require.main === module) {
  if (!global.gc) {
    console.error(
      "❌ Please run with: node --expose-gc benchmark/memory/profiler.js"
    );
    process.exit(1);
  }

  runMemoryBenchmarks().catch(console.error);
}
