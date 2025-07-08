import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  createError, 
  configure, 
  getConfig,
  ConfigPresets,
  isTryError,
  createDebugProxy,
  makeLazy,
  forceLazyEvaluation
} from '../../src';

describe("Lazy Evaluation Race Conditions", () => {
  let originalConfig: any;

  beforeEach(() => {
    originalConfig = configure();
    configure(ConfigPresets.development());
  });

  afterEach(() => {
    configure(originalConfig);
    jest.clearAllMocks();
  });

  describe("Concurrent Property Access", () => {
    it("should handle concurrent access to the same lazy property", async () => {
      const error = createError({
        type: "LazyTest",
        message: "Concurrent access test",
        context: { large: new Array(1000).fill('data') }
      });

      // Make the stack property lazy
      const lazyError = makeLazy(error, ['stack']);
      
      // Simulate concurrent access to stack property
      const promises = Array.from({ length: 10 }, async (_, i) => {
        return new Promise<string | undefined>((resolve) => {
          setTimeout(() => {
            resolve(lazyError.stack);
          }, Math.random() * 10);
        });
      });

      const results = await Promise.all(promises);

      // All results should be identical (no race condition corruption)
      const firstResult = results[0];
      results.forEach((result, index) => {
        expect(result).toBe(firstResult);
      });

      // Should be a valid stack trace
      expect(firstResult).toBeDefined();
      expect(typeof firstResult).toBe('string');
    });

    it("should handle concurrent access to multiple lazy properties", async () => {
      const error = createError({
        type: "MultiLazyTest",
        message: "Multi-property test",
        context: { data: "test-data" }
      });

      const lazyError = makeLazy(error, ['stack', 'source', 'timestamp']);
      
      // Concurrent access to different properties
      const accessPromises = [
        Promise.resolve(lazyError.stack),
        Promise.resolve(lazyError.source),
        Promise.resolve(lazyError.timestamp),
        Promise.resolve(lazyError.stack), // Duplicate access
        Promise.resolve(lazyError.source), // Duplicate access
      ];

      const results = await Promise.all(accessPromises);

      // Verify all properties are properly evaluated
      expect(results[0]).toBeDefined(); // stack
      expect(results[1]).toBeDefined(); // source
      expect(results[2]).toBeDefined(); // timestamp
      
      // Verify duplicate accesses return same values
      expect(results[0]).toBe(results[3]); // stack
      expect(results[1]).toBe(results[4]); // source
    });

    it("should handle rapid sequential property access", async () => {
      const error = createError({
        type: "RapidAccessTest",
        message: "Rapid access test"
      });

      const lazyError = makeLazy(error, ['stack']);
      const results: (string | undefined)[] = [];

      // Rapid sequential access (no async gaps)
      for (let i = 0; i < 100; i++) {
        results.push(lazyError.stack);
      }

      // All results should be identical
      const firstResult = results[0];
      results.forEach((result, index) => {
        expect(result).toBe(firstResult);
      });
    });

    it("should handle concurrent access with property modification", async () => {
      const error = createError({
        type: "ModificationTest",
        message: "Modification test"
      });

      const lazyError = makeLazy(error, ['stack']);
      
      // Start concurrent access
      const accessPromise = new Promise<string | undefined>((resolve) => {
        setTimeout(() => resolve(lazyError.stack), 5);
      });

      // Try to modify the property concurrently
      setTimeout(() => {
        try {
          (lazyError as any).stack = "modified-stack";
        } catch (e) {
          // Expected to fail or be ignored
        }
      }, 2);

      const result = await accessPromise;
      
      // Should get the lazily evaluated value, not the modified one
      expect(result).toBeDefined();
      expect(result).not.toBe("modified-stack");
    });
  });

  describe("Lazy Property Creation Race Conditions", () => {
    it("should handle race conditions in lazy property descriptor creation", async () => {
      const baseError = createError({
        type: "DescriptorRaceTest",
        message: "Descriptor race test"
      });

      // Create multiple lazy errors concurrently
      const lazyErrorPromises = Array.from({ length: 20 }, async (_, i) => {
        return new Promise<any>((resolve) => {
          setTimeout(() => {
            const lazyError = makeLazy({ ...baseError }, ['stack', 'source']);
            resolve(lazyError);
          }, Math.random() * 10);
        });
      });

      const lazyErrors = await Promise.all(lazyErrorPromises);

      // Access properties from all lazy errors concurrently
      const stackPromises = lazyErrors.map(err => Promise.resolve(err.stack));
      const sourcePromises = lazyErrors.map(err => Promise.resolve(err.source));

      const [stacks, sources] = await Promise.all([
        Promise.all(stackPromises),
        Promise.all(sourcePromises)
      ]);

      // All should be properly evaluated
      stacks.forEach(stack => {
        expect(stack).toBeDefined();
        expect(typeof stack).toBe('string');
      });

      sources.forEach(source => {
        expect(source).toBeDefined();
        expect(typeof source).toBe('string');
      });
    });

    it("should handle errors during lazy property creation", async () => {
      const error = createError({
        type: "LazyCreationErrorTest",
        message: "Lazy creation error test"
      });

      // Mock a scenario where property creation might fail
      const originalDescriptor = Object.getOwnPropertyDescriptor(error, 'stack');
      
      let creationAttempts = 0;
      Object.defineProperty(error, 'stack', {
        get() {
          creationAttempts++;
          if (creationAttempts === 1) {
            throw new Error("Property creation failed");
          }
          return originalDescriptor?.get?.call(this) || "fallback-stack";
        },
        configurable: true
      });

      const lazyError = makeLazy(error, ['stack']);

      // First access should handle the error gracefully
      const firstAccess = lazyError.stack;
      
      // Should not crash and should provide some fallback
      expect(firstAccess).toBeDefined();
    });

    it("should handle concurrent lazy evaluation with different configurations", async () => {
      // Create errors with different configurations
      const errors = [
        createError({ type: "Config1", message: "Test 1" }),
        createError({ type: "Config2", message: "Test 2" }),
        createError({ type: "Config3", message: "Test 3" })
      ];

      // Apply different configurations and make lazy concurrently
      const lazyPromises = errors.map(async (error, index) => {
        return new Promise<any>((resolve) => {
          setTimeout(() => {
            // Different config for each
            if (index === 0) configure({ captureStackTrace: true });
            if (index === 1) configure({ captureStackTrace: false });
            if (index === 2) configure(ConfigPresets.minimal());
            
            const lazyError = makeLazy(error, ['stack', 'source']);
            resolve(lazyError);
          }, index * 5);
        });
      });

      const lazyErrors = await Promise.all(lazyPromises);

      // Access properties concurrently
      const resultPromises = lazyErrors.map(async (lazyError) => {
        return {
          stack: lazyError.stack,
          source: lazyError.source
        };
      });

      const results = await Promise.all(resultPromises);

      // Each should be properly evaluated according to its config
      results.forEach((result, index) => {
        expect(result.source).toBeDefined();
        
        // Stack might be undefined depending on config
        if (index === 1) {
          // captureStackTrace: false
          expect(result.stack).toBeUndefined();
        } else {
          expect(result.stack).toBeDefined();
        }
      });
    });
  });

  describe("Debug Proxy Race Conditions", () => {
    it("should handle concurrent access with debug proxy", async () => {
      const error = createError({
        type: "DebugProxyTest",
        message: "Debug proxy test"
      });

      // Create debug proxy with access tracking
      const accessLog: string[] = [];
      const debugError = createDebugProxy(error, (property) => {
        accessLog.push(`accessed: ${property}`);
      });

      const lazyError = makeLazy(debugError, ['stack', 'source']);

      // Concurrent access through debug proxy
      const promises = [
        Promise.resolve(lazyError.stack),
        Promise.resolve(lazyError.source),
        Promise.resolve(lazyError.message),
        Promise.resolve(lazyError.type),
        Promise.resolve(lazyError.stack), // Duplicate
      ];

      await Promise.all(promises);

      // Should have logged all accesses
      expect(accessLog).toContain('accessed: stack');
      expect(accessLog).toContain('accessed: source');
      expect(accessLog).toContain('accessed: message');
      expect(accessLog).toContain('accessed: type');
      
      // Should have multiple stack accesses
      const stackAccesses = accessLog.filter(log => log === 'accessed: stack');
      expect(stackAccesses.length).toBeGreaterThan(1);
    });

    it("should handle debug proxy with throwing accessor", async () => {
      const error = createError({
        type: "ThrowingDebugTest",
        message: "Throwing debug test"
      });

      let accessCount = 0;
      const debugError = createDebugProxy(error, (property) => {
        accessCount++;
        if (accessCount === 3) {
          throw new Error("Debug proxy error");
        }
      });

      const lazyError = makeLazy(debugError, ['stack']);

      // Multiple accesses, some should trigger the throwing behavior
      const promises = Array.from({ length: 5 }, () => 
        Promise.resolve().then(() => {
          try {
            return lazyError.stack;
          } catch (e) {
            return null; // Handle error gracefully
          }
        })
      );

      const results = await Promise.all(promises);

      // Some results might be null due to debug proxy throwing
      const validResults = results.filter(r => r !== null);
      expect(validResults.length).toBeGreaterThan(0);
    });
  });

  describe("Force Lazy Evaluation Race Conditions", () => {
    it("should handle concurrent forced evaluation", async () => {
      const error = createError({
        type: "ForceEvalTest",
        message: "Force evaluation test"
      });

      const lazyError = makeLazy(error, ['stack', 'source', 'timestamp']);

      // Force evaluation concurrently from multiple threads
      const forcePromises = Array.from({ length: 10 }, async (_, i) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            forceLazyEvaluation(lazyError);
            resolve();
          }, Math.random() * 10);
        });
      });

      await Promise.all(forcePromises);

      // All properties should be evaluated after forcing
      expect(lazyError.stack).toBeDefined();
      expect(lazyError.source).toBeDefined();
      expect(lazyError.timestamp).toBeDefined();

      // Subsequent access should be immediate (no lazy evaluation)
      const accessStart = Date.now();
      const stack = lazyError.stack;
      const accessTime = Date.now() - accessStart;
      
      expect(stack).toBeDefined();
      expect(accessTime).toBeLessThan(5); // Should be immediate
    });

    it("should handle forced evaluation with property access race", async () => {
      const error = createError({
        type: "ForceAccessRaceTest",
        message: "Force access race test"
      });

      const lazyError = makeLazy(error, ['stack']);

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
      expect(accessResult).toBeDefined();
      expect(typeof accessResult).toBe('string');
    });
  });

  describe("Memory Consistency in Concurrent Access", () => {
    it("should maintain memory consistency across concurrent lazy evaluations", async () => {
      const errors = Array.from({ length: 50 }, (_, i) => 
        createError({
          type: "MemoryConsistencyTest",
          message: `Test error ${i}`,
          context: { index: i, data: new Array(100).fill(`data-${i}`) }
        })
      );

      // Make all errors lazy concurrently
      const lazyErrors = errors.map(error => makeLazy(error, ['stack', 'source']));

      // Access all properties concurrently
      const allPromises = lazyErrors.flatMap(lazyError => [
        Promise.resolve(lazyError.stack),
        Promise.resolve(lazyError.source),
        Promise.resolve(lazyError.message),
      ]);

      const results = await Promise.all(allPromises);

      // All results should be defined and properly typed
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        
        // Every third result is a message (should be string)
        if (index % 3 === 2) {
          expect(typeof result).toBe('string');
          expect(result).toMatch(/Test error \d+/);
        }
      });

      // Verify no memory corruption by checking specific errors
      expect(lazyErrors[0].message).toBe("Test error 0");
      expect(lazyErrors[49].message).toBe("Test error 49");
      expect(lazyErrors[25].context?.index).toBe(25);
    });

    it("should handle memory pressure during concurrent lazy evaluation", async () => {
      // Create errors with large context data
      const largeErrors = Array.from({ length: 20 }, (_, i) => 
        createError({
          type: "MemoryPressureTest",
          message: `Large error ${i}`,
          context: { 
            data: new Array(10000).fill(`large-data-${i}`),
            nested: {
              moreData: new Array(5000).fill(`nested-${i}`)
            }
          }
        })
      );

      const lazyErrors = largeErrors.map(error => makeLazy(error, ['stack']));

      // Access properties with memory pressure
      const promises = lazyErrors.map(async (lazyError, index) => {
        // Stagger access to create memory pressure
        await new Promise(resolve => setTimeout(resolve, index * 2));
        return {
          stack: lazyError.stack,
          message: lazyError.message,
          contextSize: JSON.stringify(lazyError.context).length
        };
      });

      const results = await Promise.all(promises);

      // All should complete successfully despite memory pressure
      results.forEach((result, index) => {
        expect(result.stack).toBeDefined();
        expect(result.message).toBe(`Large error ${index}`);
        expect(result.contextSize).toBeGreaterThan(100000); // Large context
      });

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    });
  });

  describe("Error State Consistency", () => {
    it("should maintain error state consistency during concurrent lazy access", async () => {
      const error = createError({
        type: "StateConsistencyTest",
        message: "State consistency test"
      });

      const lazyError = makeLazy(error, ['stack', 'source']);

      // Verify isTryError remains consistent during lazy evaluation
      const isErrorPromises = Array.from({ length, 20 }, async () => {
        const stack = lazyError.stack; // Trigger lazy evaluation
        return isTryError(lazyError);
      });

      const isErrorResults = await Promise.all(isErrorPromises);

      // Should always be true
      isErrorResults.forEach(result => {
        expect(result).toBe(true);
      });

      // Properties should be consistently available
      expect(lazyError.type).toBe("StateConsistencyTest");
      expect(lazyError.message).toBe("State consistency test");
      expect(lazyError.stack).toBeDefined();
      expect(lazyError.source).toBeDefined();
    });

    it("should handle error serialization during lazy evaluation", async () => {
      const error = createError({
        type: "SerializationRaceTest",
        message: "Serialization race test",
        context: { data: "test-data" }
      });

      const lazyError = makeLazy(error, ['stack']);

      // Start lazy evaluation and serialization concurrently
      const evalPromise = Promise.resolve(lazyError.stack);
      const serializePromise = Promise.resolve(JSON.stringify(lazyError));

      const [stackResult, serializedResult] = await Promise.all([
        evalPromise,
        serializePromise
      ]);

      expect(stackResult).toBeDefined();
      
      const parsed = JSON.parse(serializedResult);
      expect(parsed.type).toBe("SerializationRaceTest");
      expect(parsed.message).toBe("Serialization race test");
      expect(parsed.context?.data).toBe("test-data");
    });
  });
}); 