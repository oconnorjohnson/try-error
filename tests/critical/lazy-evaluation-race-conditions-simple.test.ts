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
  isTryError,
  createDebugProxy,
  makeLazy,
  forceLazyEvaluation,
  isLazyProperty,
} from "../../src";

describe("Lazy Evaluation Race Conditions", () => {
  let originalConfig: any;

  beforeEach(() => {
    originalConfig = getConfig();
    configure(ConfigPresets.development());
  });

  afterEach(() => {
    configure(originalConfig);
    jest.clearAllMocks();
  });

  describe("Concurrent Property Access", () => {
    it("should handle concurrent access to lazy stack property", async () => {
      const error = createError({
        type: "LazyTest",
        message: "Concurrent access test",
      });

      // Make the stack property lazy with a custom getter
      const lazyError = makeLazy(error, {
        stack: () => {
          // Simulate expensive computation
          const start = Date.now();
          while (Date.now() - start < 10) {
            /* busy wait */
          }
          return "custom-stack-trace";
        },
      });

      // Simulate concurrent access to stack property
      const promises = Array.from({ length: 10 }, async () => {
        return new Promise<string | undefined>((resolve) => {
          setTimeout(() => {
            resolve(lazyError.stack);
          }, Math.random() * 5);
        });
      });

      const results = await Promise.all(promises);

      // All results should be identical (no race condition corruption)
      const firstResult = results[0];
      results.forEach((result) => {
        expect(result).toBe(firstResult);
      });

      // Should be our custom value
      expect(firstResult).toBe("custom-stack-trace");
    });

    it("should handle concurrent access to multiple lazy properties", async () => {
      const error = createError({
        type: "MultiLazyTest",
        message: "Multi-property test",
      });

      const lazyError = makeLazy(error, {
        stack: () => "lazy-stack",
        source: () => "lazy-source",
      });

      // Concurrent access to different properties
      const accessPromises = [
        Promise.resolve(lazyError.stack),
        Promise.resolve(lazyError.source),
        Promise.resolve(lazyError.stack), // Duplicate access
        Promise.resolve(lazyError.source), // Duplicate access
      ];

      const results = await Promise.all(accessPromises);

      // Verify all properties are properly evaluated
      expect(results[0]).toBe("lazy-stack");
      expect(results[1]).toBe("lazy-source");

      // Verify duplicate accesses return same values
      expect(results[0]).toBe(results[2]); // stack
      expect(results[1]).toBe(results[3]); // source
    });

    it("should handle rapid sequential property access", () => {
      const error = createError({
        type: "RapidAccessTest",
        message: "Rapid access test",
      });

      const lazyError = makeLazy(error, {
        stack: () => "rapid-stack",
      });

      const results: (string | undefined)[] = [];

      // Rapid sequential access (no async gaps)
      for (let i = 0; i < 100; i++) {
        results.push(lazyError.stack);
      }

      // All results should be identical
      const firstResult = results[0];
      results.forEach((result) => {
        expect(result).toBe(firstResult);
      });
      expect(firstResult).toBe("rapid-stack");
    });
  });

  describe("Lazy Property Creation Race Conditions", () => {
    it("should handle race conditions in lazy property descriptor creation", async () => {
      const baseError = createError({
        type: "DescriptorRaceTest",
        message: "Descriptor race test",
      });

      // Create multiple lazy errors concurrently
      const lazyErrorPromises = Array.from({ length: 20 }, async (_, i) => {
        return new Promise<any>((resolve) => {
          setTimeout(() => {
            const lazyError = makeLazy(
              { ...baseError },
              {
                stack: () => `stack-${i}`,
                source: () => `source-${i}`,
              }
            );
            resolve(lazyError);
          }, Math.random() * 10);
        });
      });

      const lazyErrors = await Promise.all(lazyErrorPromises);

      // Access properties from all lazy errors concurrently
      const stackPromises = lazyErrors.map((err) => Promise.resolve(err.stack));
      const sourcePromises = lazyErrors.map((err) =>
        Promise.resolve(err.source)
      );

      const [stacks, sources] = await Promise.all([
        Promise.all(stackPromises),
        Promise.all(sourcePromises),
      ]);

      // All should be properly evaluated
      stacks.forEach((stack, i) => {
        expect(stack).toBe(`stack-${i}`);
      });

      sources.forEach((source, i) => {
        expect(source).toBe(`source-${i}`);
      });
    });

    it("should handle errors during lazy property creation", () => {
      const error = createError({
        type: "LazyCreationErrorTest",
        message: "Lazy creation error test",
      });

      let creationAttempts = 0;
      const lazyError = makeLazy(error, {
        stack: () => {
          creationAttempts++;
          if (creationAttempts === 1) {
            throw new Error("Property creation failed");
          }
          return "fallback-stack";
        },
      });

      // First access should handle the error gracefully or throw consistently
      expect(() => lazyError.stack).toThrow("Property creation failed");

      // Second access should get the fallback
      expect(lazyError.stack).toBe("fallback-stack");
    });
  });

  describe("Debug Proxy Race Conditions", () => {
    it("should handle concurrent access with debug proxy", async () => {
      const error = createError({
        type: "DebugProxyTest",
        message: "Debug proxy test",
      });

      const lazyError = makeLazy(error, {
        stack: () => "debug-stack",
        source: () => "debug-source",
      });

      const debugError = createDebugProxy(lazyError);

      // Concurrent access through debug proxy
      const promises = [
        Promise.resolve(debugError.stack),
        Promise.resolve(debugError.source),
        Promise.resolve(debugError.message),
        Promise.resolve(debugError.type),
        Promise.resolve(debugError.stack), // Duplicate
      ];

      const results = await Promise.all(promises);

      // All should work correctly
      expect(results[0]).toBe("debug-stack");
      expect(results[1]).toBe("debug-source");
      expect(results[2]).toBe("Debug proxy test");
      expect(results[3]).toBe("DebugProxyTest");
      expect(results[4]).toBe("debug-stack"); // Duplicate should be same
    });
  });

  describe("Force Lazy Evaluation Race Conditions", () => {
    it("should handle concurrent forced evaluation", async () => {
      const error = createError({
        type: "ForceEvalTest",
        message: "Force evaluation test",
      });

      const lazyError = makeLazy(error, {
        stack: () => "forced-stack",
        source: () => "forced-source",
      });

      // Force evaluation concurrently from multiple threads
      const forcePromises = Array.from({ length: 10 }, async () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            forceLazyEvaluation(lazyError);
            resolve();
          }, Math.random() * 10);
        });
      });

      await Promise.all(forcePromises);

      // All properties should be evaluated after forcing
      expect(lazyError.stack).toBe("forced-stack");
      expect(lazyError.source).toBe("forced-source");

      // Should no longer be lazy
      expect(isLazyProperty(lazyError, "stack")).toBe(false);
      expect(isLazyProperty(lazyError, "source")).toBe(false);
    });

    it("should handle forced evaluation with property access race", async () => {
      const error = createError({
        type: "ForceAccessRaceTest",
        message: "Force access race test",
      });

      const lazyError = makeLazy(error, {
        stack: () => "race-stack",
      });

      // Start property access and forced evaluation simultaneously
      const accessPromise = new Promise<string | undefined>((resolve) => {
        setTimeout(() => resolve(lazyError.stack), 5);
      });

      const forcePromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          forceLazyEvaluation(lazyError);
          resolve();
        }, 3);
      });

      const [accessResult] = await Promise.all([accessPromise, forcePromise]);

      // Should get a valid result regardless of timing
      expect(accessResult).toBe("race-stack");
    });
  });

  describe("Memory Consistency in Concurrent Access", () => {
    it("should maintain memory consistency across concurrent lazy evaluations", async () => {
      const errors = Array.from({ length: 20 }, (_, i) =>
        createError({
          type: "MemoryConsistencyTest",
          message: `Test error ${i}`,
          context: { index: i },
        })
      );

      // Make all errors lazy concurrently
      const lazyErrors = errors.map((error, i) =>
        makeLazy(error, {
          stack: () => `stack-${i}`,
          source: () => `source-${i}`,
        })
      );

      // Access all properties concurrently
      const allPromises = lazyErrors.flatMap((lazyError) => [
        Promise.resolve(lazyError.stack),
        Promise.resolve(lazyError.source),
        Promise.resolve(lazyError.message),
      ]);

      const results = await Promise.all(allPromises);

      // All results should be defined and properly typed
      results.forEach((result, index) => {
        expect(result).toBeDefined();

        // Check specific patterns
        const group = Math.floor(index / 3);
        const position = index % 3;

        if (position === 0) {
          // stack
          expect(result).toBe(`stack-${group}`);
        } else if (position === 1) {
          // source
          expect(result).toBe(`source-${group}`);
        } else {
          // message
          expect(result).toBe(`Test error ${group}`);
        }
      });

      // Verify no memory corruption by checking specific errors
      expect(lazyErrors[0].message).toBe("Test error 0");
      expect(lazyErrors[19].message).toBe("Test error 19");
      expect(lazyErrors[10].context?.index).toBe(10);
    });
  });

  describe("Error State Consistency", () => {
    it("should maintain error state consistency during concurrent lazy access", async () => {
      const error = createError({
        type: "StateConsistencyTest",
        message: "State consistency test",
      });

      const lazyError = makeLazy(error, {
        stack: () => "consistent-stack",
        source: () => "consistent-source",
      });

      // Verify isTryError remains consistent during lazy evaluation
      const isErrorPromises = Array.from({ length: 20 }, async () => {
        const stack = lazyError.stack; // Trigger lazy evaluation
        return isTryError(lazyError);
      });

      const isErrorResults = await Promise.all(isErrorPromises);

      // Should always be true
      isErrorResults.forEach((result) => {
        expect(result).toBe(true);
      });

      // Properties should be consistently available
      expect(lazyError.type).toBe("StateConsistencyTest");
      expect(lazyError.message).toBe("State consistency test");
      expect(lazyError.stack).toBe("consistent-stack");
      expect(lazyError.source).toBe("consistent-source");
    });

    it("should handle error serialization during lazy evaluation", async () => {
      const error = createError({
        type: "SerializationRaceTest",
        message: "Serialization race test",
        context: { data: "test-data" },
      });

      const lazyError = makeLazy(error, {
        stack: () => "serialization-stack",
      });

      // Start lazy evaluation and serialization concurrently
      const evalPromise = Promise.resolve(lazyError.stack);
      const serializePromise = Promise.resolve(JSON.stringify(lazyError));

      const [stackResult, serializedResult] = await Promise.all([
        evalPromise,
        serializePromise,
      ]);

      expect(stackResult).toBe("serialization-stack");

      const parsed = JSON.parse(serializedResult);
      expect(parsed.type).toBe("SerializationRaceTest");
      expect(parsed.message).toBe("Serialization race test");
      expect(parsed.context?.data).toBe("test-data");
    });
  });
});
