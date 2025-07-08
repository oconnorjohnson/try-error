import { createLazyError, isLazyProperty, makeLazy } from "../../src/lazy";
import { isTryError } from "../../src/types";

describe("Lazy Evaluation Behavior Issues", () => {
  describe("isLazyProperty State Tracking", () => {
    it("should return false after property has been evaluated", () => {
      const error = createLazyError({
        type: "TestError",
        message: "Test message",
        getSource: () => "test.ts:10:5",
        getStack: () => "Stack trace",
      });

      // Initially, properties should be lazy (not computed)
      expect(isLazyProperty(error, "source")).toBe(true);
      expect(isLazyProperty(error, "stack")).toBe(true);

      // Access the source property to trigger computation
      const source = error.source;
      expect(source).toBe("test.ts:10:5");

      // EXPECTED: isLazyProperty should now return false for computed property
      // ACTUAL: Currently returns true because it only checks for getter existence
      expect(isLazyProperty(error, "source")).toBe(false); // This will fail with current implementation

      // Stack should still be lazy (not accessed yet)
      expect(isLazyProperty(error, "stack")).toBe(true);

      // Access stack property
      const stack = error.stack;
      expect(stack).toBe("Stack trace");

      // Now both should be computed (not lazy)
      expect(isLazyProperty(error, "source")).toBe(false);
      expect(isLazyProperty(error, "stack")).toBe(false);
    });

    it("should track evaluation state for makeLazy properties", () => {
      const originalError = {
        type: "OriginalError",
        message: "Original message",
        source: "original.ts",
        timestamp: Date.now(),
      };

      const lazyError = makeLazy(originalError as any, {
        source: () => "lazy-source.ts",
        stack: () => "Lazy stack trace",
      });

      // Lazy properties should be detected as lazy
      expect(isLazyProperty(lazyError, "source")).toBe(true);
      expect(isLazyProperty(lazyError, "stack")).toBe(true);

      // Non-lazy properties should not be detected as lazy
      expect(isLazyProperty(lazyError, "type")).toBe(false);
      expect(isLazyProperty(lazyError, "message")).toBe(false);

      // Access source property
      const source = lazyError.source;
      expect(source).toBe("lazy-source.ts");

      // Source should no longer be lazy, stack should still be lazy
      expect(isLazyProperty(lazyError, "source")).toBe(false);
      expect(isLazyProperty(lazyError, "stack")).toBe(true);
    });

    it("should handle multiple accesses correctly", () => {
      let computeCount = 0;
      const error = createLazyError({
        type: "TestError",
        message: "Test message",
        getSource: () => {
          computeCount++;
          return `computed-${computeCount}`;
        },
      });

      // Initially lazy
      expect(isLazyProperty(error, "source")).toBe(true);

      // First access
      const source1 = error.source;
      expect(source1).toBe("computed-1");
      expect(computeCount).toBe(1);
      expect(isLazyProperty(error, "source")).toBe(false); // Should be false after computation

      // Second access (should use cached value)
      const source2 = error.source;
      expect(source2).toBe("computed-1");
      expect(computeCount).toBe(1); // Should not recompute
      expect(isLazyProperty(error, "source")).toBe(false); // Should still be false
    });

    it("should work with undefined values", () => {
      const error = createLazyError({
        type: "TestError",
        message: "Test message",
        getSource: () => "test.ts",
        getStack: () => undefined, // Return undefined
      });

      expect(isLazyProperty(error, "stack")).toBe(true);

      // Access stack (will be undefined)
      const stack = error.stack;
      expect(stack).toBeUndefined();

      // Should no longer be lazy even though value is undefined
      expect(isLazyProperty(error, "stack")).toBe(false);
    });

    it("should handle isTryError access correctly", () => {
      let sourceComputed = false;
      const error = createLazyError({
        type: "TestError",
        message: "Test message",
        getSource: () => {
          sourceComputed = true;
          return "test.ts";
        },
      });

      // Initially lazy
      expect(isLazyProperty(error, "source")).toBe(true);
      expect(sourceComputed).toBe(false);

      // isTryError will access source property
      const isValid = isTryError(error);
      expect(isValid).toBe(true);
      expect(sourceComputed).toBe(true);

      // Source should no longer be lazy
      expect(isLazyProperty(error, "source")).toBe(false);
    });
  });

  describe("Real-world Lazy Evaluation Scenarios", () => {
    it("should handle expensive stack trace computation", () => {
      let stackComputed = false;
      const error = createLazyError({
        type: "ExpensiveError",
        message: "Expensive computation",
        getSource: () => "expensive.ts",
        getStack: () => {
          stackComputed = true;
          // Simulate expensive stack trace computation
          const lines: string[] = [];
          for (let i = 0; i < 100; i++) {
            lines.push(`  at function${i} (file${i}.ts:${i}:${i})`);
          }
          return lines.join("\n");
        },
      });

      // Stack should be lazy initially
      expect(isLazyProperty(error, "stack")).toBe(true);
      expect(stackComputed).toBe(false);

      // Access stack
      const stack = error.stack;
      expect(stack).toBeDefined();
      expect(stack!.split("\n").length).toBe(100);
      expect(stackComputed).toBe(true);

      // Stack should no longer be lazy
      expect(isLazyProperty(error, "stack")).toBe(false);

      // Multiple accesses should not recompute
      const stack2 = error.stack;
      expect(stack2).toBe(stack);
    });

    it("should handle conditional lazy properties", () => {
      const error = createLazyError({
        type: "ConditionalError",
        message: "Conditional test",
        getSource: () => "conditional.ts",
        // No getStack provided
      });

      // Source should be lazy
      expect(isLazyProperty(error, "source")).toBe(true);

      // Stack should not be lazy (not a lazy property)
      expect(isLazyProperty(error, "stack")).toBe(false);

      // Access source
      const source = error.source;
      expect(source).toBe("conditional.ts");

      // Source should no longer be lazy
      expect(isLazyProperty(error, "source")).toBe(false);

      // Stack should still not be lazy
      expect(isLazyProperty(error, "stack")).toBe(false);
      expect(error.stack).toBeUndefined();
    });
  });
});
