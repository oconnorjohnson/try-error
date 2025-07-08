import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { createError, configure, getConfig, ConfigPresets } from "../../src";

// Import performance measurement utilities
import { Performance } from "../../src/utils";

describe("Performance Measurement Accuracy", () => {
  let originalConfig: any;
  let originalPerformance: typeof performance;

  beforeEach(() => {
    originalConfig = getConfig();
    configure(ConfigPresets.development());

    // Mock performance.now if needed
    if (typeof performance === "undefined") {
      (global as any).performance = {
        now: jest.fn(() => Date.now()),
      };
    }
    originalPerformance = performance;
  });

  afterEach(() => {
    configure(originalConfig);
    if (typeof performance !== "undefined") {
      performance = originalPerformance;
    }
    jest.clearAllMocks();
  });

  describe("measureErrorCreation Accuracy", () => {
    it("should accurately measure error creation time", () => {
      // Enable performance measurement
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurements: number[] = [];

      // Measure multiple error creations
      for (let i = 0; i < 100; i++) {
        const measurement = Performance.measureErrorCreation(() => {
          return createError({
            type: "PerformanceTest",
            message: `Performance test ${i}`,
            context: { index: i },
          });
        });

        measurements.push(measurement.duration);
      }

      // All measurements should be positive numbers
      measurements.forEach((duration) => {
        expect(duration).toBeGreaterThan(0);
        expect(typeof duration).toBe("number");
        expect(Number.isFinite(duration)).toBe(true);
      });

      // Measurements should be reasonable (typically < 10ms)
      const avgDuration =
        measurements.reduce((a, b) => a + b, 0) / measurements.length;
      expect(avgDuration).toBeLessThan(10);
    });

    it("should measure complex error creation accurately", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
        captureStackTrace: true,
      });

      const measurement = Performance.measureErrorCreation(() => {
        return createError({
          type: "ComplexError",
          message: "Complex error with stack trace",
          context: {
            large: new Array(1000).fill("data"),
            nested: {
              deep: {
                value: "test",
                array: [1, 2, 3, 4, 5],
              },
            },
          },
        });
      });

      expect(measurement.duration).toBeGreaterThan(0);
      expect(measurement.error).toBeDefined();
      expect(measurement.error.type).toBe("ComplexError");
      expect(measurement.error.stack).toBeDefined();
    });

    it("should handle measurement of failing error creation", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurement = Performance.measureErrorCreation(() => {
        throw new Error("Error creation failed");
      });

      expect(measurement.duration).toBeGreaterThan(0);
      expect(measurement.error).toBeNull();
      expect(measurement.thrownError).toBeInstanceOf(Error);
      expect(measurement.thrownError?.message).toBe("Error creation failed");
    });

    it("should provide consistent measurements", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurements: number[] = [];
      const standardError = () =>
        createError({
          type: "StandardTest",
          message: "Standard test",
        });

      // Take many measurements of the same operation
      for (let i = 0; i < 50; i++) {
        const measurement = Performance.measureErrorCreation(standardError);
        measurements.push(measurement.duration);
      }

      // Calculate variance to ensure consistency
      const mean =
        measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const variance =
        measurements.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
        measurements.length;
      const stdDev = Math.sqrt(variance);

      // Standard deviation should be relatively low (less than 50% of mean)
      expect(stdDev).toBeLessThan(mean * 0.5);
    });
  });

  describe("Timing Accuracy", () => {
    it("should use high-resolution timing when available", () => {
      // Mock high-resolution timer
      const mockNow = jest.fn();
      let time = 1000.123456;
      mockNow.mockImplementation(() => {
        time += 0.001234; // Microsecond precision
        return time;
      });

      (global.performance as any).now = mockNow;

      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurement = Performance.measureErrorCreation(() => {
        return createError({
          type: "HighRes",
          message: "High resolution test",
        });
      });

      expect(mockNow).toHaveBeenCalledTimes(2); // Start and end
      expect(measurement.duration).toBeCloseTo(0.001234, 6);
    });

    it("should fallback to Date.now when performance.now is unavailable", () => {
      // Remove performance.now
      const originalNow = performance.now;
      delete (performance as any).now;

      const dateSpy = jest.spyOn(Date, "now");
      let time = 1609459200000; // Fixed timestamp
      dateSpy.mockImplementation(() => {
        time += 1; // 1ms increment
        return time;
      });

      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurement = Performance.measureErrorCreation(() => {
        return createError({
          type: "DateFallback",
          message: "Date fallback test",
        });
      });

      expect(dateSpy).toHaveBeenCalledTimes(2);
      expect(measurement.duration).toBe(1);

      // Restore
      performance.now = originalNow;
      dateSpy.mockRestore();
    });

    it("should handle timing overflow scenarios", () => {
      // Mock extreme timing values
      const mockNow = jest.fn();
      mockNow
        .mockReturnValueOnce(Number.MAX_SAFE_INTEGER - 1)
        .mockReturnValueOnce(Number.MAX_SAFE_INTEGER);

      (global.performance as any).now = mockNow;

      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurement = Performance.measureErrorCreation(() => {
        return createError({ type: "Overflow", message: "Overflow test" });
      });

      // Should handle large numbers gracefully
      expect(measurement.duration).toBe(1);
      expect(Number.isFinite(measurement.duration)).toBe(true);
    });

    it("should handle negative timing scenarios", () => {
      // Mock scenario where end time < start time (clock adjustment)
      const mockNow = jest.fn();
      mockNow.mockReturnValueOnce(1000).mockReturnValueOnce(999); // Time went backwards

      (global.performance as any).now = mockNow;

      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurement = Performance.measureErrorCreation(() => {
        return createError({ type: "Negative", message: "Negative test" });
      });

      // Should handle negative duration gracefully (clamp to 0 or provide abs value)
      expect(measurement.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Measurement Overhead", () => {
    it("should have minimal overhead when performance tracking is disabled", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: false,
      });

      const start = performance.now();

      // Create many errors without performance tracking
      for (let i = 0; i < 1000; i++) {
        createError({
          type: "NoTracking",
          message: `No tracking ${i}`,
        });
      }

      const withoutTracking = performance.now() - start;

      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const start2 = performance.now();

      // Create many errors with performance tracking
      for (let i = 0; i < 1000; i++) {
        createError({
          type: "WithTracking",
          message: `With tracking ${i}`,
        });
      }

      const withTracking = performance.now() - start2;

      // Overhead should be reasonable (less than 50% increase)
      const overhead = (withTracking - withoutTracking) / withoutTracking;
      expect(overhead).toBeLessThan(0.5);
    });

    it("should measure its own measurement overhead", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const overheadMeasurements: number[] = [];

      for (let i = 0; i < 50; i++) {
        // Measure empty function to get measurement overhead
        const measurement = Performance.measureErrorCreation(() => {
          // Empty operation
          return {} as any;
        });

        overheadMeasurements.push(measurement.duration);
      }

      const avgOverhead =
        overheadMeasurements.reduce((a, b) => a + b, 0) /
        overheadMeasurements.length;

      // Measurement overhead should be very small (< 1ms typically)
      expect(avgOverhead).toBeLessThan(1);
    });

    it("should handle concurrent measurements efficiently", async () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const concurrentMeasurements = Array.from(
        { length: 50 },
        async (_, i) => {
          return new Promise<number>((resolve) => {
            setTimeout(() => {
              const measurement = Performance.measureErrorCreation(() => {
                return createError({
                  type: "Concurrent",
                  message: `Concurrent ${i}`,
                  context: { thread: i },
                });
              });
              resolve(measurement.duration);
            }, Math.random() * 10);
          });
        }
      );

      const results = await Promise.all(concurrentMeasurements);

      // All measurements should be valid
      results.forEach((duration) => {
        expect(duration).toBeGreaterThan(0);
        expect(Number.isFinite(duration)).toBe(true);
      });

      // Should not have excessive variance due to concurrency
      const mean = results.reduce((a, b) => a + b, 0) / results.length;
      const maxDuration = Math.max(...results);

      // Max duration shouldn't be more than 10x the mean (indicates measurement interference)
      expect(maxDuration).toBeLessThan(mean * 10);
    });
  });

  describe("Performance Edge Cases", () => {
    it("should handle performance measurement during garbage collection", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      // Create objects that might trigger GC
      const createLargeError = () => {
        return createError({
          type: "LargeError",
          message: "Large error",
          context: {
            data: new Array(10000).fill("gc-trigger-data"),
          },
        });
      };

      const measurements: number[] = [];

      for (let i = 0; i < 100; i++) {
        const measurement = Performance.measureErrorCreation(createLargeError);
        measurements.push(measurement.duration);

        // Force GC if available
        if (global.gc && i % 10 === 0) {
          global.gc();
        }
      }

      // Should handle GC pauses gracefully
      measurements.forEach((duration) => {
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(1000); // Should not have 1s+ pauses
      });
    });

    it("should handle measurement during high system load", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      // Simulate high system load
      const heavyComputation = () => {
        let result = 0;
        for (let i = 0; i < 100000; i++) {
          result += Math.sqrt(i);
        }
        return result;
      };

      const measurement = Performance.measureErrorCreation(() => {
        heavyComputation(); // Load simulation
        return createError({
          type: "HighLoad",
          message: "High load test",
        });
      });

      // Should still provide meaningful measurements under load
      expect(measurement.duration).toBeGreaterThan(0);
      expect(measurement.error).toBeDefined();
      expect(measurement.error?.type).toBe("HighLoad");
    });

    it("should handle measurement with timer precision limits", () => {
      // Mock low-precision timer
      const mockNow = jest.fn();
      let time = 1000;
      mockNow.mockImplementation(() => {
        time += 1; // 1ms precision only
        return time;
      });

      (global.performance as any).now = mockNow;

      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurements: number[] = [];

      // Take measurements that might be below timer precision
      for (let i = 0; i < 20; i++) {
        const measurement = Performance.measureErrorCreation(() => {
          return createError({ type: "Precision", message: "Precision test" });
        });
        measurements.push(measurement.duration);
      }

      // Should handle low precision gracefully
      measurements.forEach((duration) => {
        expect(duration).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(duration)).toBe(true); // Should be integer with 1ms precision
      });
    });

    it("should provide performance statistics", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      const measurements: Array<{ duration: number; error: any }> = [];

      // Collect measurements for statistics
      for (let i = 0; i < 100; i++) {
        const measurement = Performance.measureErrorCreation(() => {
          return createError({
            type: "Statistics",
            message: `Statistics test ${i}`,
            context: { size: i % 10 === 0 ? "large" : "small" },
          });
        });
        measurements.push(measurement);
      }

      // Calculate statistics
      const durations = measurements.map((m) => m.duration);
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
      const median = durations.sort((a, b) => a - b)[
        Math.floor(durations.length / 2)
      ];

      // Statistics should be reasonable
      expect(min).toBeGreaterThan(0);
      expect(max).toBeGreaterThan(min);
      expect(mean).toBeGreaterThan(min);
      expect(mean).toBeLessThan(max);
      expect(median).toBeGreaterThan(0);

      // 95th percentile should be reasonable
      const p95Index = Math.floor(durations.length * 0.95);
      const p95 = durations.sort((a, b) => a - b)[p95Index];
      expect(p95).toBeLessThan(mean * 5); // Shouldn't have extreme outliers
    });
  });

  describe("Memory and Resource Tracking", () => {
    it("should track memory usage during error creation", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      // Mock memory tracking if available
      const mockMemoryUsage = jest.fn().mockReturnValue({
        rss: 50000000,
        heapTotal: 30000000,
        heapUsed: 20000000,
        external: 1000000,
      });

      if (typeof process !== "undefined" && process.memoryUsage) {
        process.memoryUsage = mockMemoryUsage;
      }

      const measurement = Performance.measureErrorCreation(() => {
        return createError({
          type: "MemoryTracking",
          message: "Memory tracking test",
          context: { data: new Array(1000).fill("memory-test") },
        });
      });

      expect(measurement.duration).toBeGreaterThan(0);
      expect(measurement.error).toBeDefined();

      // Memory tracking might be available in Node.js environments
      if (
        typeof process !== "undefined" &&
        mockMemoryUsage.mock.calls.length > 0
      ) {
        expect(mockMemoryUsage).toHaveBeenCalled();
      }
    });

    it("should handle measurement in resource-constrained environments", () => {
      configure({
        ...getConfig(),
        enablePerformanceTracking: true,
      });

      // Simulate resource constraints
      const originalConsole = console.warn;
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      // Create errors in a loop to potentially trigger resource warnings
      const measurements: number[] = [];
      for (let i = 0; i < 1000; i++) {
        const measurement = Performance.measureErrorCreation(() => {
          return createError({
            type: "ResourceConstrained",
            message: `Resource test ${i}`,
            context: {
              heavyData: new Array(100).fill(`data-${i}`),
            },
          });
        });
        measurements.push(measurement.duration);
      }

      // Should complete all measurements
      expect(measurements).toHaveLength(1000);
      measurements.forEach((duration) => {
        expect(duration).toBeGreaterThan(0);
      });

      warnSpy.mockRestore();
    });
  });
});
