import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  createError,
  configure,
  getConfig,
  ConfigPresets,
  Performance,
} from "../../src";

describe("Performance Measurement Accuracy (Actual API)", () => {
  let originalConfig: any;

  beforeEach(() => {
    originalConfig = getConfig();
    configure(ConfigPresets.development());
  });

  afterEach(() => {
    configure(originalConfig);
    jest.clearAllMocks();
  });

  describe("Performance.now() Accuracy", () => {
    it("should provide consistent timing measurements", () => {
      const measurements: number[] = [];

      // Take multiple measurements
      for (let i = 0; i < 10; i++) {
        const start = Performance.now();
        // Small delay
        for (let j = 0; j < 1000; j++) {
          /* busy wait */
        }
        const end = Performance.now();
        measurements.push(end - start);
      }

      // All measurements should be positive numbers
      measurements.forEach((duration) => {
        expect(duration).toBeGreaterThan(0);
        expect(typeof duration).toBe("number");
        expect(Number.isFinite(duration)).toBe(true);
      });
    });

    it("should handle high-frequency timing calls", () => {
      const start = Performance.now();

      // Multiple rapid calls
      for (let i = 0; i < 1000; i++) {
        const time = Performance.now();
        expect(time).toBeGreaterThanOrEqual(start);
      }

      const end = Performance.now();
      expect(end).toBeGreaterThan(start);
    });

    it("should provide sub-millisecond precision when available", () => {
      const time1 = Performance.now();
      const time2 = Performance.now();

      // Should have some precision (though timing might be equal on fast systems)
      expect(time2).toBeGreaterThanOrEqual(time1);

      // If we get different values, check for decimal precision
      if (time2 > time1) {
        const diff = time2 - time1;
        // Should be a number with potential decimal places
        expect(typeof diff).toBe("number");
        expect(Number.isFinite(diff)).toBe(true);
      }
    });
  });

  describe("Performance.measureErrorCreation() Tests", () => {
    it("should measure error creation performance", async () => {
      const result = await Performance.measureErrorCreation(100);

      expect(result).toHaveProperty("totalTime");
      expect(result).toHaveProperty("averageTime");
      expect(result).toHaveProperty("iterations");
      expect(result).toHaveProperty("errors");

      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.iterations).toBe(100);
      expect(result.errors).toBe(100);

      // Average time should be total time divided by iterations
      expect(result.averageTime).toBeCloseTo(
        result.totalTime / result.iterations,
        5
      );
    });

    it("should handle different iteration counts", async () => {
      const results = await Promise.all([
        Performance.measureErrorCreation(10),
        Performance.measureErrorCreation(100),
        Performance.measureErrorCreation(1000),
      ]);

      results.forEach((result, index) => {
        const expectedIterations = [10, 100, 1000][index];
        expect(result.iterations).toBe(expectedIterations);
        expect(result.errors).toBe(expectedIterations);
        expect(result.totalTime).toBeGreaterThan(0);
        expect(result.averageTime).toBeGreaterThan(0);
      });

      // More iterations should generally take more total time
      expect(results[2].totalTime).toBeGreaterThan(results[0].totalTime);
    });

    it("should provide consistent measurements", async () => {
      // Run same measurement multiple times
      const measurements = await Promise.all(
        Array.from({ length: 5 }, () => Performance.measureErrorCreation(50))
      );

      measurements.forEach((result) => {
        expect(result.iterations).toBe(50);
        expect(result.errors).toBe(50);
        expect(result.totalTime).toBeGreaterThan(0);
        expect(result.averageTime).toBeGreaterThan(0);
      });

      // Calculate variance to ensure consistency
      const avgTimes = measurements.map((m) => m.averageTime);
      const mean = avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length;
      const variance =
        avgTimes.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
        avgTimes.length;
      const stdDev = Math.sqrt(variance);

      // Standard deviation should be reasonable (not excessive variance)
      expect(stdDev).toBeLessThan(mean * 2); // Allow up to 200% variance
    });

    it("should handle concurrent measurements", async () => {
      // Start multiple measurements concurrently
      const promises = Array.from({ length: 3 }, () =>
        Performance.measureErrorCreation(20)
      );

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.iterations).toBe(20);
        expect(result.errors).toBe(20);
        expect(result.totalTime).toBeGreaterThan(0);
        expect(result.averageTime).toBeGreaterThan(0);
      });
    });
  });

  describe("Performance.getMemoryUsage() Tests", () => {
    it("should return memory usage in Node.js environment", () => {
      const memoryUsage = Performance.getMemoryUsage();

      if (
        typeof process !== "undefined" &&
        process.memoryUsage &&
        typeof process.memoryUsage === "function"
      ) {
        // In Node.js environment
        expect(memoryUsage).toBeDefined();
        expect(memoryUsage).toHaveProperty("rss");
        expect(memoryUsage).toHaveProperty("heapTotal");
        expect(memoryUsage).toHaveProperty("heapUsed");
        expect(memoryUsage).toHaveProperty("external");

        expect(typeof memoryUsage!.rss).toBe("number");
        expect(typeof memoryUsage!.heapTotal).toBe("number");
        expect(typeof memoryUsage!.heapUsed).toBe("number");
        expect(typeof memoryUsage!.external).toBe("number");

        // Basic sanity checks
        expect(memoryUsage!.rss).toBeGreaterThan(0);
        expect(memoryUsage!.heapTotal).toBeGreaterThan(0);
        expect(memoryUsage!.heapUsed).toBeGreaterThan(0);
        expect(memoryUsage!.heapUsed).toBeLessThanOrEqual(
          memoryUsage!.heapTotal
        );
      } else {
        // In browser or other environment
        expect(memoryUsage).toBeNull();
      }
    });
  });

  describe("Performance Edge Cases", () => {
    it("should handle zero iterations gracefully", async () => {
      const result = await Performance.measureErrorCreation(0);

      expect(result.iterations).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
      // Average time might be 0 or NaN for zero iterations
      expect(typeof result.averageTime).toBe("number");
    });

    it("should handle single iteration", async () => {
      const result = await Performance.measureErrorCreation(1);

      expect(result.iterations).toBe(1);
      expect(result.errors).toBe(1);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBe(result.totalTime);
    });

    it("should handle large iteration counts", async () => {
      // Test with a larger number (but not too large to avoid timeout)
      const result = await Performance.measureErrorCreation(5000);

      expect(result.iterations).toBe(5000);
      expect(result.errors).toBe(5000);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.averageTime).toBe(result.totalTime / 5000);
    });
  });

  describe("Error Creation Performance with Different Configurations", () => {
    it("should measure performance with minimal config", async () => {
      configure(ConfigPresets.minimal());

      const result = await Performance.measureErrorCreation(100);

      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.iterations).toBe(100);
      expect(result.errors).toBe(100);
    });

    it("should measure performance with development config", async () => {
      configure(ConfigPresets.development());

      const result = await Performance.measureErrorCreation(100);

      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.iterations).toBe(100);
      expect(result.errors).toBe(100);
    });

    it("should compare performance between different configs", async () => {
      // Measure with minimal config
      configure(ConfigPresets.minimal());
      const minimalResult = await Performance.measureErrorCreation(100);

      // Measure with development config (typically slower due to stack traces)
      configure(ConfigPresets.development());
      const devResult = await Performance.measureErrorCreation(100);

      // Both should work
      expect(minimalResult.totalTime).toBeGreaterThan(0);
      expect(devResult.totalTime).toBeGreaterThan(0);

      // Generally minimal should be faster, but this isn't guaranteed
      // so we just verify both work correctly
      expect(minimalResult.iterations).toBe(100);
      expect(devResult.iterations).toBe(100);
    });
  });

  describe("Performance Monitoring Integration", () => {
    it("should work with actual error creation", async () => {
      const start = Performance.now();

      // Create some actual errors
      const errors: any[] = [];
      for (let i = 0; i < 10; i++) {
        errors.push(
          createError({
            type: "TestError",
            message: `Test error ${i}`,
            context: { index: i },
          })
        );
      }

      const end = Performance.now();

      expect(end).toBeGreaterThan(start);
      expect(errors).toHaveLength(10);

      // Verify all errors are valid
      errors.forEach((error, index) => {
        expect(error.type).toBe("TestError");
        expect(error.message).toBe(`Test error ${index}`);
        expect(error.context?.index).toBe(index);
      });
    });

    it("should maintain accuracy under load", async () => {
      // Create multiple measurement tasks
      const tasks = Array.from({ length: 3 }, async (_, taskIndex) => {
        const results: any[] = [];
        for (let i = 0; i < 3; i++) {
          const result = await Performance.measureErrorCreation(10);
          results.push(result);
        }
        return { taskIndex, results };
      });

      const taskResults = await Promise.all(tasks);

      taskResults.forEach(({ taskIndex, results }) => {
        results.forEach((result) => {
          expect(result.iterations).toBe(10);
          expect(result.errors).toBe(10);
          expect(result.totalTime).toBeGreaterThan(0);
          expect(result.averageTime).toBeGreaterThan(0);
        });
      });
    });
  });
});
