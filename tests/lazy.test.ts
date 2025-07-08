import { describe, it, expect, jest } from "@jest/globals";
import {
  createLazyError,
  makeLazy,
  isLazyProperty,
  forceLazyEvaluation,
  createDebugProxy,
} from "../src/lazy";
import { isTryError } from "../src/types";

describe("Lazy Evaluation", () => {
  describe("createLazyError", () => {
    it("should create a valid TryError with lazy properties", () => {
      let sourceComputed = false;
      let stackComputed = false;

      const error = createLazyError({
        type: "LazyError",
        message: "Lazy error message",
        getSource: () => {
          sourceComputed = true;
          return "lazy.test.ts:10:5";
        },
        getStack: () => {
          stackComputed = true;
          return "Error: Lazy error\n  at test (lazy.test.ts:10:5)";
        },
      });

      // Don't call isTryError yet to avoid triggering lazy evaluation
      expect(error.type).toBe("LazyError");
      expect(error.message).toBe("Lazy error message");

      // Properties should not be computed yet
      expect(sourceComputed).toBe(false);
      expect(stackComputed).toBe(false);

      // Now validate it's a TryError - this will trigger source evaluation
      expect(isTryError(error)).toBe(true);
      expect(sourceComputed).toBe(true); // source is accessed by isTryError
      expect(stackComputed).toBe(false); // stack is optional, not checked

      // Access stack - should compute
      expect(error.stack).toBe(
        "Error: Lazy error\n  at test (lazy.test.ts:10:5)"
      );
      expect(stackComputed).toBe(true);
    });

    it("should cache computed values", () => {
      let computeCount = 0;

      const error = createLazyError({
        type: "CachedError",
        message: "Cached error",
        getSource: () => {
          computeCount++;
          return `computed-${computeCount}`;
        },
      });

      // First access
      expect(error.source).toBe("computed-1");
      expect(computeCount).toBe(1);

      // Second access - should use cached value
      expect(error.source).toBe("computed-1");
      expect(computeCount).toBe(1);

      // Third access - still cached
      expect(error.source).toBe("computed-1");
      expect(computeCount).toBe(1);
    });

    it("should handle optional lazy properties", () => {
      const error = createLazyError({
        type: "PartialLazy",
        message: "Partial lazy error",
        getSource: () => "source.ts",
        // No getStack provided
      });

      expect(error.source).toBe("source.ts");
      expect(error.stack).toBeUndefined();
    });

    it("should support lazy timestamp", () => {
      let timestampComputed = false;
      const expectedTime = Date.now() + 1000;

      const error = createLazyError({
        type: "TimestampError",
        message: "Timestamp error",
        getSource: () => "source.ts",
        getTimestamp: () => {
          timestampComputed = true;
          return expectedTime;
        },
      });

      expect(timestampComputed).toBe(false);
      expect(error.timestamp).toBe(expectedTime);
      expect(timestampComputed).toBe(true);
    });

    it("should support context and cause", () => {
      const cause = new Error("Original error");
      const context = { userId: 123, action: "test" };

      const error = createLazyError({
        type: "ContextError",
        message: "Error with context",
        getSource: () => "source.ts",
        context,
        cause,
      });

      expect(error.context).toBe(context);
      expect(error.cause).toBe(cause);
    });
  });

  describe("makeLazy", () => {
    it("should make existing error properties lazy", () => {
      const originalError = {
        type: "OriginalError",
        message: "Original message",
        source: "original.ts",
        timestamp: Date.now(),
        stack: "Original stack",
        context: { original: true },
      };

      let sourceComputed = false;
      let stackComputed = false;
      let contextComputed = false;

      const lazyError = makeLazy(originalError as any, {
        source: () => {
          sourceComputed = true;
          return "lazy-source.ts";
        },
        stack: () => {
          stackComputed = true;
          return "Lazy stack trace";
        },
        context: () => {
          contextComputed = true;
          return { lazy: true };
        },
      });

      // Non-lazy properties should remain
      expect(lazyError.type).toBe("OriginalError");
      expect(lazyError.message).toBe("Original message");

      // Lazy properties should not be computed yet
      expect(sourceComputed).toBe(false);
      expect(stackComputed).toBe(false);
      expect(contextComputed).toBe(false);

      // Access lazy properties
      expect(lazyError.source).toBe("lazy-source.ts");
      expect(sourceComputed).toBe(true);

      expect(lazyError.stack).toBe("Lazy stack trace");
      expect(stackComputed).toBe(true);

      expect(lazyError.context).toEqual({ lazy: true });
      expect(contextComputed).toBe(true);
    });

    it("should preserve non-lazy properties", () => {
      const originalError = {
        type: "MixedError",
        message: "Mixed message",
        source: "original.ts",
        timestamp: 12345,
      };

      const lazyError = makeLazy(originalError as any, {
        stack: () => "Lazy stack",
      });

      expect(lazyError.source).toBe("original.ts");
      expect(lazyError.timestamp).toBe(12345);
      expect(lazyError.stack).toBe("Lazy stack");
    });
  });

  describe("isLazyProperty", () => {
    it("should detect lazy properties", () => {
      const error = createLazyError({
        type: "TestError",
        message: "Test",
        getSource: () => "test.ts",
        getStack: () => "Stack trace",
      });

      expect(isLazyProperty(error, "source")).toBe(true);
      expect(isLazyProperty(error, "stack")).toBe(true);
      expect(isLazyProperty(error, "type")).toBe(false);
      expect(isLazyProperty(error, "message")).toBe(false);
    });

    it("should work after property access", () => {
      const error = createLazyError({
        type: "TestError",
        message: "Test",
        getSource: () => "test.ts",
      });

      expect(isLazyProperty(error, "source")).toBe(true);

      // Access the property
      const _ = error.source;

      // Should no longer be detected as lazy (already computed)
      expect(isLazyProperty(error, "source")).toBe(false);
    });
  });

  describe("forceLazyEvaluation", () => {
    it("should evaluate all lazy properties", () => {
      let sourceComputed = false;
      let stackComputed = false;
      let timestampComputed = false;

      const error = createLazyError({
        type: "ForceError",
        message: "Force evaluation",
        getSource: () => {
          sourceComputed = true;
          return "force.ts";
        },
        getStack: () => {
          stackComputed = true;
          return "Stack";
        },
        getTimestamp: () => {
          timestampComputed = true;
          return 99999;
        },
      });

      // Nothing computed yet
      expect(sourceComputed).toBe(false);
      expect(stackComputed).toBe(false);
      expect(timestampComputed).toBe(false);

      // Force evaluation
      const result = forceLazyEvaluation(error);

      // All lazy properties should be computed
      expect(sourceComputed).toBe(true);
      expect(stackComputed).toBe(true);
      expect(timestampComputed).toBe(true);

      // Should return the same error
      expect(result).toBe(error);
    });
  });

  describe("createDebugProxy", () => {
    it("should log lazy property access", () => {
      const consoleSpy = jest
        .spyOn(console, "debug")
        .mockImplementation(() => {});

      const error = createLazyError({
        type: "DebugError",
        message: "Debug test",
        getSource: () => "debug.ts",
        getStack: () => "Debug stack",
      });

      const debugError = createDebugProxy(error);

      // Access non-lazy property - no log
      const _ = debugError.type;
      expect(consoleSpy).not.toHaveBeenCalled();

      // Access lazy property - should log
      const source = debugError.source;
      expect(consoleSpy).toHaveBeenCalledWith(
        "Lazy evaluation triggered for property: source"
      );

      // Access another lazy property
      const stack = debugError.stack;
      expect(consoleSpy).toHaveBeenCalledWith(
        "Lazy evaluation triggered for property: stack"
      );

      consoleSpy.mockRestore();
    });

    it("should preserve error functionality", () => {
      const error = createLazyError({
        type: "ProxyError",
        message: "Proxy test",
        getSource: () => "proxy.ts",
      });

      const debugError = createDebugProxy(error);

      expect(isTryError(debugError)).toBe(true);
      expect(debugError.type).toBe("ProxyError");
      expect(debugError.message).toBe("Proxy test");
      expect(debugError.source).toBe("proxy.ts");
    });
  });

  describe("Performance", () => {
    it("should defer expensive computations", () => {
      const start = Date.now();

      const error = createLazyError({
        type: "ExpensiveError",
        message: "Expensive computation",
        getSource: () => {
          // Simulate expensive computation
          let sum = 0;
          for (let i = 0; i < 1000000; i++) {
            sum += i;
          }
          return `computed-${sum}`;
        },
        getStack: () => {
          // Another expensive computation
          const lines: string[] = [];
          for (let i = 0; i < 100; i++) {
            lines.push(`  at function${i} (file${i}.ts:${i}:${i})`);
          }
          return lines.join("\n");
        },
      });

      const creationTime = Date.now() - start;

      // Creation should be fast (no computation)
      expect(creationTime).toBeLessThan(5);

      // Now access the properties
      const accessStart = Date.now();
      const source = error.source;
      const stack = error.stack;
      const accessTime = Date.now() - accessStart;

      // Access should take longer (computation happens)
      expect(accessTime).toBeGreaterThan(creationTime);
      expect(source).toContain("computed-");
      expect(stack).toBeDefined();
      expect(stack!.split("\n").length).toBe(100);
    });
  });
});
