import {
  ErrorPool,
  getGlobalErrorPool,
  configureErrorPool,
  resetErrorPool,
  getErrorPoolStats,
} from "../../src/pool";
import { configure, ConfigPresets } from "../../src/config";
import { createError } from "../../src/errors";
import { isTryError } from "../../src/types";

describe("Object Pool Stress Tests", () => {
  beforeEach(() => {
    resetErrorPool();
    // Enable object pooling for tests
    configure(ConfigPresets.performance());
  });

  afterEach(() => {
    resetErrorPool();
  });

  describe("Pool Exhaustion Scenarios", () => {
    it("should handle pool exhaustion gracefully", () => {
      configureErrorPool({ maxSize: 10 });
      const pool = getGlobalErrorPool();

      // Exhaust the pool
      const errors: ReturnType<ErrorPool["acquire"]>[] = [];
      for (let i = 0; i < 20; i++) {
        errors.push(pool.acquire());
      }

      const stats = pool.getStats();
      expect(stats.activeCount).toBe(20);
      expect(stats.misses).toBeGreaterThan(0);
      expect(stats.poolSize).toBe(0);
    });

    it("should continue creating errors when pool is exhausted", () => {
      configure(ConfigPresets.performance());
      configureErrorPool({ maxSize: 5 });

      // Create more errors than pool capacity
      const errors: any[] = [];
      for (let i = 0; i < 20; i++) {
        errors.push(createError({ type: "Test", message: `Error ${i}` }));
      }

      // All errors should be valid
      errors.forEach((error, index) => {
        expect(isTryError(error)).toBe(true);
        expect(error.message).toBe(`Error ${index}`);
      });

      const stats = getErrorPoolStats();
      expect(stats?.activeCount).toBeGreaterThan(5);
    });

    it("should handle massive pool exhaustion", () => {
      const pool = new ErrorPool(10);

      // Create 1000 errors to stress test
      const errors: any[] = [];
      for (let i = 0; i < 1000; i++) {
        errors.push(pool.acquire());
      }

      expect(errors.length).toBe(1000);
      expect(pool.getStats().activeCount).toBe(1000);
      expect(pool.getStats().misses).toBeGreaterThan(0);
    });

    it("should handle zero-sized pool", () => {
      const pool = new ErrorPool(0);

      const error = pool.acquire();
      expect(error).toBeDefined();
      expect(error._pooled).toBe(true);

      const stats = pool.getStats();
      expect(stats.maxSize).toBe(0);
      expect(stats.poolSize).toBe(0);
      expect(stats.misses).toBe(1);
    });
  });

  describe("Memory Leak Detection", () => {
    it("should release errors back to pool properly", () => {
      const pool = new ErrorPool(10);
      const errors: any[] = [];

      // Acquire many errors
      for (let i = 0; i < 15; i++) {
        errors.push(pool.acquire());
      }

      const beforeRelease = pool.getStats();
      expect(beforeRelease.activeCount).toBe(15);
      expect(beforeRelease.poolSize).toBe(0);

      // Release them all
      errors.forEach((error) => pool.release(error));

      const afterRelease = pool.getStats();
      expect(afterRelease.activeCount).toBe(0);
      expect(afterRelease.poolSize).toBe(10); // Pool size capped at maxSize
      expect(afterRelease.returns).toBe(10); // Only 10 returned to pool
    });

    it("should handle double release gracefully", () => {
      const pool = new ErrorPool(10);
      const error = pool.acquire();

      pool.release(error);
      const stats1 = pool.getStats();

      // Double release should not crash
      pool.release(error);
      const stats2 = pool.getStats();

      expect(stats1.returns).toBe(stats2.returns);
    });

    it("should handle releasing non-pooled errors", () => {
      const pool = new ErrorPool(10);
      const regularError = createError({ type: "Test", message: "Test" });

      // Should not crash
      expect(() => pool.release(regularError)).not.toThrow();

      const stats = pool.getStats();
      expect(stats.returns).toBe(0);
    });

    it("should reset error properties on release", () => {
      const pool = new ErrorPool(10);
      const error = pool.acquire();

      // Set properties
      error.type = "CustomError";
      error.message = "Custom message";
      error.context = { custom: "data" };

      pool.release(error);

      // Properties should be reset
      expect(error.type).toBe("");
      expect(error.message).toBe("");
      expect(error.context).toBeUndefined();
    });
  });

  describe("Performance Under Stress", () => {
    it("should maintain performance under rapid acquire/release cycles", () => {
      const pool = new ErrorPool(50);
      const start = Date.now();

      // Perform many rapid cycles
      for (let i = 0; i < 1000; i++) {
        const error = pool.acquire();
        error.type = "Test";
        error.message = `Test ${i}`;
        pool.release(error);
      }

      const end = Date.now();
      const elapsed = end - start;

      // Should complete quickly (under 100ms)
      expect(elapsed).toBeLessThan(100);

      const stats = pool.getStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0.8); // Should have good hit rate
    });

    it("should handle concurrent access simulation", () => {
      const pool = new ErrorPool(20);
      const errors = [];

      // Simulate concurrent access patterns
      for (let i = 0; i < 5; i++) {
        // Acquire batch
        const batch = [];
        for (let j = 0; j < 10; j++) {
          batch.push(pool.acquire());
        }
        errors.push(...batch);

        // Release half
        for (let j = 0; j < 5; j++) {
          pool.release(batch[j]);
        }
      }

      const stats = pool.getStats();
      expect(stats.activeCount).toBe(25); // 5 * 5 remaining
      expect(stats.hits).toBeGreaterThan(0);
    });

    it("should handle memory pressure simulation", () => {
      const pool = new ErrorPool(100);
      const errors = [];

      // Fill pool completely
      for (let i = 0; i < 100; i++) {
        errors.push(pool.acquire());
      }

      // Create memory pressure by continuing to acquire
      for (let i = 0; i < 500; i++) {
        const error = pool.acquire();
        error.type = "MemoryPressure";
        error.message = `Pressure ${i}`;

        // Occasionally release some to simulate real usage
        if (i % 10 === 0 && errors.length > 0) {
          pool.release(errors.pop()!);
        }
      }

      const stats = pool.getStats();
      expect(stats.creates).toBeGreaterThan(100);
      expect(stats.misses).toBeGreaterThan(0);
    });
  });

  describe("Pool Management Edge Cases", () => {
    it("should handle pool resize during active usage", () => {
      const pool = new ErrorPool(20);
      const errors = [];

      // Fill pool
      for (let i = 0; i < 30; i++) {
        errors.push(pool.acquire());
      }

      // Resize to smaller
      pool.resize(10);
      expect(pool.getStats().maxSize).toBe(10);

      // Release some errors
      for (let i = 0; i < 15; i++) {
        pool.release(errors[i]);
      }

      // Only 10 should be in pool due to resize
      expect(pool.getStats().poolSize).toBe(10);

      // Resize to larger
      pool.resize(50);
      expect(pool.getStats().maxSize).toBe(50);
    });

    it("should handle pool clear during active usage", () => {
      const pool = new ErrorPool(20);
      const errors = [];

      // Fill pool
      for (let i = 0; i < 30; i++) {
        errors.push(pool.acquire());
      }

      // Clear pool
      pool.clear();

      const stats = pool.getStats();
      expect(stats.poolSize).toBe(0);
      expect(stats.activeCount).toBe(0);
    });

    it("should handle extreme pool sizes", () => {
      // Test very large pool
      const largePool = new ErrorPool(10000);
      const errors = [];

      for (let i = 0; i < 1000; i++) {
        errors.push(largePool.acquire());
      }

      expect(largePool.getStats().activeCount).toBe(1000);

      // Test very small pool
      const smallPool = new ErrorPool(1);
      const smallErrors = [];

      for (let i = 0; i < 10; i++) {
        smallErrors.push(smallPool.acquire());
      }

      expect(smallPool.getStats().activeCount).toBe(10);
      expect(smallPool.getStats().poolSize).toBe(0);
    });
  });

  describe("Statistics Accuracy", () => {
    it("should accurately track hit rate", () => {
      const pool = new ErrorPool(5);
      const errors = [];

      // First 5 should be misses (pool empty)
      for (let i = 0; i < 5; i++) {
        errors.push(pool.acquire());
      }

      errors.forEach((error) => pool.release(error));

      // Next 5 should be hits (pool full)
      for (let i = 0; i < 5; i++) {
        pool.acquire();
      }

      const stats = pool.getStats();
      expect(stats.hits).toBe(5);
      expect(stats.misses).toBe(5);
      expect(stats.hitRate).toBe(0.5);
    });

    it("should track creation statistics", () => {
      const pool = new ErrorPool(10);

      // Create 20 errors (10 from pool, 10 new)
      for (let i = 0; i < 20; i++) {
        pool.acquire();
      }

      const stats = pool.getStats();
      expect(stats.creates).toBeGreaterThan(10);
      expect(stats.misses).toBeGreaterThan(10);
    });

    it("should track return statistics", () => {
      const pool = new ErrorPool(10);
      const errors = [];

      for (let i = 0; i < 15; i++) {
        errors.push(pool.acquire());
      }

      // Return all 15 errors
      errors.forEach((error) => pool.release(error));

      const stats = pool.getStats();
      expect(stats.returns).toBe(10); // Only 10 can fit in pool
    });
  });

  describe("Global Pool Integration", () => {
    it("should handle global pool configuration changes", () => {
      configureErrorPool({ maxSize: 20 });
      const pool1 = getGlobalErrorPool();

      configureErrorPool({ maxSize: 40 });
      const pool2 = getGlobalErrorPool();

      expect(pool1).toBe(pool2); // Same instance
      expect(pool1.getStats().maxSize).toBe(40);
    });

    it("should handle global pool disabling", () => {
      configureErrorPool({ enabled: false });
      const pool = getGlobalErrorPool();

      // Should create new pool since disabled
      expect(pool).toBeDefined();
      expect(pool.getStats().maxSize).toBe(100); // Default size
    });

    it("should handle global pool with performance config", () => {
      configure(ConfigPresets.performance());

      const errors = [];
      for (let i = 0; i < 50; i++) {
        errors.push(createError({ type: "Test", message: `Test ${i}` }));
      }

      const stats = getErrorPoolStats();
      expect(stats).toBeDefined();
      expect(stats!.creates).toBeGreaterThan(0);
    });
  });
});
