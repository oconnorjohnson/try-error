import { Performance } from "../../src/config";
import { createError, isTryError, TryError } from "../../src";

describe("Performance Measurement Context", () => {
  beforeEach(() => {
    // Reset any global state
  });

  afterEach(() => {
    // Clean up after each test
  });

  describe("Performance.measureErrorCreation()", () => {
    it("should properly pass context through performance measurement", async () => {
      const result = await Performance.measureErrorCreation(5);

      // The issue: we have no way to verify that context was properly passed
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.iterations).toBe(5);
      expect(result.errors).toBe(5);

      // BUT: We can't verify that context { iteration: i } was actually set!
      // This is the bug - there's no way to inspect the context in the measurement results
    });

    it("should expose created errors with context for verification", async () => {
      // This test verifies that we can access the errors to verify context
      const result = await Performance.measureErrorCreation(3);

      // FIXED: Now we can verify the context was set correctly
      expect(result.createdErrors).toBeDefined();
      expect(result.createdErrors).toHaveLength(3);
      expect((result.createdErrors[0].context as any)?.iteration).toBe(0);
      expect((result.createdErrors[1].context as any)?.iteration).toBe(1);
      expect((result.createdErrors[2].context as any)?.iteration).toBe(2);

      // Also verify all errors are valid TryErrors
      result.createdErrors.forEach((error, index) => {
        expect(isTryError(error)).toBe(true);
        expect(error.type).toBe("TestError");
        expect(error.message).toBe("Performance test");
        expect((error.context as any)?.iteration).toBe(index);
      });
    });

    it("should handle context correctly with different configurations", async () => {
      // Test that performance measurement works with various context sizes
      const largeContext = {
        iteration: 0,
        data: Array(100)
          .fill("test")
          .map((_, i) => ({ id: i, value: `item-${i}` })),
        timestamp: Date.now(),
        metadata: {
          environment: "test",
          version: "1.0.0",
          user: { id: "test-user", role: "admin" },
        },
      };

      const testError = createError({
        type: "TestError",
        message: "Performance test with large context",
        context: largeContext,
      });

      expect(isTryError(testError)).toBe(true);
      expect(testError.context?.iteration).toBe(0);
      expect(testError.context?.data).toHaveLength(100);
      expect((testError.context as any)?.metadata?.environment).toBe("test");
    });

    it("should preserve context integrity during performance measurements", async () => {
      // Create a custom performance measurement that exposes errors
      const { createError: createErrorImport } = await import(
        "../../src/errors"
      );

      const start = Performance.now();
      const errors: TryError[] = [];

      for (let i = 0; i < 10; i++) {
        const error = createErrorImport({
          type: "PerfTestError",
          message: `Performance test ${i}`,
          context: {
            iteration: i,
            batch: "test-batch",
            timestamp: Date.now() + i,
          },
        });
        errors.push(error);
      }

      const end = Performance.now();

      // Verify all errors have correct context
      errors.forEach((error, index) => {
        expect(isTryError(error)).toBe(true);
        expect(error.context?.iteration).toBe(index);
        expect(error.context?.batch).toBe("test-batch");
        expect(typeof error.context?.timestamp).toBe("number");
      });

      // Verify performance measurement is reasonable
      expect(end - start).toBeGreaterThan(0);
    });
  });

  describe("Context Preservation Edge Cases", () => {
    it("should handle undefined context gracefully", async () => {
      const result = await Performance.measureErrorCreation(2);

      // The current implementation uses context: { iteration: i }
      // Let's verify this works by creating errors manually
      const errorWithUndefinedContext = createError({
        type: "TestError",
        message: "Test without context",
        // No context provided
      });

      const errorWithNullContext = createError({
        type: "TestError",
        message: "Test with null context",
        context: undefined,
      });

      expect(isTryError(errorWithUndefinedContext)).toBe(true);
      expect(isTryError(errorWithNullContext)).toBe(true);
    });

    it("should handle context with circular references", async () => {
      const circular: any = { name: "test" };
      circular.self = circular;

      const error = createError({
        type: "TestError",
        message: "Test with circular context",
        context: {
          iteration: 1,
          circular: circular,
        },
      });

      expect(isTryError(error)).toBe(true);
      expect(error.context?.iteration).toBe(1);
      expect((error.context as any)?.circular?.name).toBe("test");
    });

    it("should handle context mutation during measurement", async () => {
      const sharedContext = { count: 0 };

      const errors: TryError[] = [];
      for (let i = 0; i < 3; i++) {
        sharedContext.count = i;

        const error = createError({
          type: "TestError",
          message: `Test ${i}`,
          context: {
            iteration: i,
            shared: { ...sharedContext }, // Spread to avoid mutation
          },
        });
        errors.push(error);
      }

      // Verify each error has the correct context at creation time
      errors.forEach((error, index) => {
        expect(error.context?.iteration).toBe(index);
        expect((error.context as any)?.shared?.count).toBe(index);
      });
    });
  });
});
