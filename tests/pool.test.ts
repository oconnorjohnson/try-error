import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  ErrorPool,
  getGlobalErrorPool,
  configureErrorPool,
  resetErrorPool,
  getErrorPoolStats,
} from "../src/pool";
import { isTryError } from "../src/types";

describe("ErrorPool", () => {
  let pool: ErrorPool;

  beforeEach(() => {
    pool = new ErrorPool(10);
  });

  describe("basic functionality", () => {
    it("should acquire and release errors", () => {
      const error = pool.acquire();

      expect(isTryError(error)).toBe(true);
      expect(error.type).toBe("");
      expect(error.message).toBe("");

      // Modify the error
      (error as any).type = "TestError";
      (error as any).message = "Test message";

      pool.release(error);

      // Acquire again - should get reset error
      const error2 = pool.acquire();
      expect(error2.type).toBe("");
      expect(error2.message).toBe("");
    });

    it("should track pool statistics", () => {
      const stats = pool.getStats();
      expect(stats.poolSize).toBeGreaterThan(0);
      expect(stats.activeCount).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);

      // Acquire an error
      const error = pool.acquire();
      const stats2 = pool.getStats();
      expect(stats2.activeCount).toBe(1);
      expect(stats2.hits).toBe(1);

      // Release it
      pool.release(error);
      const stats3 = pool.getStats();
      expect(stats3.activeCount).toBe(0);
      expect(stats3.returns).toBe(1);
    });

    it("should handle pool overflow", () => {
      const errors: any[] = [];

      // Acquire more than pool size
      for (let i = 0; i < 15; i++) {
        errors.push(pool.acquire());
      }

      const stats = pool.getStats();
      expect(stats.misses).toBeGreaterThan(0);
      expect(stats.creates).toBeGreaterThan(10);
    });

    it("should not release non-pooled errors", () => {
      const nonPooledError = {
        type: "Error",
        message: "Not from pool",
      };

      const statsBefore = pool.getStats();
      pool.release(nonPooledError as any);
      const statsAfter = pool.getStats();

      expect(statsAfter.returns).toBe(statsBefore.returns);
    });

    it("should respect max pool size on release", () => {
      const smallPool = new ErrorPool(2);
      const errors: any[] = [];

      // Acquire 5 errors
      for (let i = 0; i < 5; i++) {
        errors.push(smallPool.acquire());
      }

      // Release all 5
      for (const error of errors) {
        smallPool.release(error);
      }

      const stats = smallPool.getStats();
      expect(stats.poolSize).toBeLessThanOrEqual(2);
    });
  });

  describe("pool management", () => {
    it("should clear the pool", () => {
      // Acquire and release some errors
      const error1 = pool.acquire();
      const error2 = pool.acquire();
      pool.release(error1);
      pool.release(error2);

      const statsBefore = pool.getStats();
      expect(statsBefore.poolSize).toBeGreaterThan(0);

      pool.clear();

      const statsAfter = pool.getStats();
      expect(statsAfter.poolSize).toBe(0);
      expect(statsAfter.activeCount).toBe(0);
    });

    it("should resize the pool", () => {
      // Fill the pool
      const errors: any[] = [];
      for (let i = 0; i < 10; i++) {
        const error = pool.acquire();
        errors.push(error);
      }

      // Release all
      for (const error of errors) {
        pool.release(error);
      }

      // Resize to smaller
      pool.resize(5);
      const stats = pool.getStats();
      expect(stats.maxSize).toBe(5);
      expect(stats.poolSize).toBeLessThanOrEqual(5);
    });

    it("should calculate hit rate correctly", () => {
      // First acquire - should be a hit (pre-allocated)
      const error1 = pool.acquire();
      pool.release(error1);

      // Second acquire - should be a hit (reused)
      const error2 = pool.acquire();

      const stats = pool.getStats();
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe("error properties", () => {
    it("should properly reset error properties", () => {
      const error = pool.acquire();

      // Set all properties
      (error as any).type = "CustomError";
      (error as any).message = "Custom message";
      (error as any).source = "test.ts:10:5";
      (error as any).timestamp = Date.now();
      (error as any).stack = "Error stack trace";
      (error as any).context = { foo: "bar" };
      (error as any).cause = new Error("Cause");

      // Release and reacquire
      pool.release(error);
      const error2 = pool.acquire();

      // All properties should be reset
      expect(error2.type).toBe("");
      expect(error2.message).toBe("");
      expect(error2.source).toBe("");
      expect(error2.timestamp).toBe(0);
      expect(error2.stack).toBeUndefined();
      expect(error2.context).toBeUndefined();
      expect(error2.cause).toBeUndefined();
    });

    it("should maintain pooled flag", () => {
      const error = pool.acquire();
      expect((error as any)._pooled).toBe(true);

      pool.release(error);

      const error2 = pool.acquire();
      expect((error2 as any)._pooled).toBe(true);
    });
  });
});

describe("Global Error Pool", () => {
  afterEach(() => {
    resetErrorPool();
  });

  it("should create global pool lazily", () => {
    const stats1 = getErrorPoolStats();
    expect(stats1).toBeNull();

    const pool = getGlobalErrorPool();
    expect(pool).toBeDefined();

    const stats2 = getErrorPoolStats();
    expect(stats2).toBeDefined();
    expect(stats2!.maxSize).toBe(100); // Default size
  });

  it("should configure global pool", () => {
    configureErrorPool({ maxSize: 50 });

    const pool = getGlobalErrorPool();
    const stats = pool.getStats();
    expect(stats.maxSize).toBe(50);
  });

  it("should disable global pool", () => {
    // Create pool first
    getGlobalErrorPool();
    expect(getErrorPoolStats()).toBeDefined();

    // Disable it
    configureErrorPool({ enabled: false });
    expect(getErrorPoolStats()).toBeNull();
  });

  it("should reset global pool", () => {
    const pool = getGlobalErrorPool();
    const error = pool.acquire();

    const statsBefore = getErrorPoolStats();
    expect(statsBefore!.activeCount).toBe(1);

    resetErrorPool();

    const statsAfter = getErrorPoolStats();
    expect(statsAfter).toBeNull();
  });
});

describe("Pool Integration", () => {
  it("should work with error creation", async () => {
    // This would be tested in integration with createError
    // when pooling is enabled in config
    const pool = new ErrorPool();

    // Simulate high-throughput scenario
    const iterations = 1000;
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      const error = pool.acquire();
      (error as any).type = `Error${i}`;
      (error as any).message = `Message ${i}`;

      // Simulate some processing
      await Promise.resolve();

      pool.release(error);
    }

    const duration = Date.now() - start;
    const stats = pool.getStats();

    // Pool should be efficient
    expect(stats.hits).toBeGreaterThan(stats.misses);
    expect(stats.hitRate).toBeGreaterThan(0.9); // 90%+ hit rate

    console.log(`Pool performance: ${iterations} iterations in ${duration}ms`);
    console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
  });
});
