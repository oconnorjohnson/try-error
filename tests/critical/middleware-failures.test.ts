import {
  MiddlewarePipeline,
  ErrorMiddleware,
  loggingMiddleware,
  retryMiddleware,
  transformMiddleware,
  enrichContextMiddleware,
  circuitBreakerMiddleware,
  filterMiddleware,
  rateLimitMiddleware,
  compose,
  globalRegistry,
} from "../../src/middleware";
import { TryError, TryResult, isTryError } from "../../src/types";
import { createError } from "../../src/errors";

describe("Middleware Error Handling", () => {
  let mockError: TryError;
  let mockSuccess: string;

  beforeEach(() => {
    mockError = createError({ type: "TestError", message: "Test error" });
    mockSuccess = "success";
  });

  describe("Middleware That Throws Errors", () => {
    it("should handle middleware that throws during execution", () => {
      const pipeline = new MiddlewarePipeline();

      // Add middleware that throws
      pipeline.use(() => {
        throw new Error("Middleware failed");
      });

      // Should not crash the pipeline
      expect(() => {
        pipeline.execute(mockError);
      }).toThrow("Middleware failed");
    });

    it("should continue execution when middleware throws", () => {
      const pipeline = new MiddlewarePipeline();
      const logSpy = jest.fn();

      pipeline.use(() => {
        throw new Error("First middleware failed");
      });

      pipeline.use(loggingMiddleware(logSpy));

      // Should throw from first middleware
      expect(() => {
        pipeline.execute(mockError);
      }).toThrow("First middleware failed");

      // Logger should not be called since first middleware threw
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("should handle middleware that throws when processing success", () => {
      const pipeline = new MiddlewarePipeline();

      pipeline.use((result, next) => {
        if (!isTryError(result)) {
          throw new Error("Cannot process success");
        }
        return next();
      });

      expect(() => {
        pipeline.execute(mockSuccess);
      }).toThrow("Cannot process success");
    });

    it("should handle async middleware that throws", async () => {
      const pipeline = new MiddlewarePipeline();

      pipeline.use(async (result, next) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        throw new Error("Async middleware failed");
      });

      await expect(async () => {
        await pipeline.execute(Promise.resolve(mockError));
      }).rejects.toThrow("Async middleware failed");
    });
  });

  describe("Complex Pipeline Scenarios", () => {
    it("should handle multiple middleware with mixed success/failure", () => {
      const pipeline = new MiddlewarePipeline();
      const results: string[] = [];

      pipeline.use((result, next) => {
        results.push("middleware1");
        return next();
      });

      pipeline.use((result, next) => {
        results.push("middleware2");
        if (isTryError(result)) {
          throw new Error("Second middleware failed");
        }
        return next();
      });

      pipeline.use((result, next) => {
        results.push("middleware3");
        return next();
      });

      // With error, should throw at second middleware
      expect(() => {
        pipeline.execute(mockError);
      }).toThrow("Second middleware failed");

      expect(results).toEqual(["middleware1", "middleware2"]);
    });

    it("should handle middleware modifying the result", () => {
      const pipeline = new MiddlewarePipeline();

      pipeline.use((result, next) => {
        if (isTryError(result)) {
          return createError({
            type: "ModifiedError",
            message: "Modified: " + result.message,
          });
        }
        return next();
      });

      const result = pipeline.execute(mockError);
      expect(isTryError(result)).toBe(true);
      expect(result.type).toBe("ModifiedError");
      expect(result.message).toBe("Modified: Test error");
    });

    it("should handle middleware that doesn't call next()", () => {
      const pipeline = new MiddlewarePipeline();
      const results: string[] = [];

      pipeline.use((result, next) => {
        results.push("middleware1");
        return next();
      });

      pipeline.use((result, next) => {
        results.push("middleware2");
        // Don't call next() - terminate pipeline
        return result;
      });

      pipeline.use((result, next) => {
        results.push("middleware3");
        return next();
      });

      const result = pipeline.execute(mockError);
      expect(results).toEqual(["middleware1", "middleware2"]);
      expect(result).toBe(mockError);
    });

    it("should handle empty pipeline", () => {
      const pipeline = new MiddlewarePipeline();
      const result = pipeline.execute(mockError);
      expect(result).toBe(mockError);
    });
  });

  describe("Built-in Middleware Error Handling", () => {
    it("should handle logging middleware with failing logger", () => {
      const faultyLogger = jest.fn(() => {
        throw new Error("Logger failed");
      });

      const middleware = loggingMiddleware(faultyLogger);

      expect(() => {
        middleware(mockError, () => mockError);
      }).toThrow("Logger failed");

      expect(faultyLogger).toHaveBeenCalledWith(mockError);
    });

    it("should handle retry middleware with failing condition", () => {
      const faultyCondition = jest.fn(() => {
        throw new Error("Condition failed");
      });

      const middleware = retryMiddleware(3, faultyCondition);

      expect(() => {
        middleware(mockError, () => mockError);
      }).toThrow("Condition failed");
    });

    it("should handle transform middleware with failing transformer", () => {
      const faultyTransformer = jest.fn(() => {
        throw new Error("Transform failed");
      });

      const middleware = transformMiddleware(faultyTransformer);

      expect(() => {
        middleware(mockError, () => mockError);
      }).toThrow("Transform failed");
    });

    it("should handle enrich context middleware with failing enricher", () => {
      const faultyEnricher = jest.fn(() => {
        throw new Error("Enricher failed");
      });

      const middleware = enrichContextMiddleware(faultyEnricher);

      expect(() => {
        middleware(mockError, () => mockError);
      }).toThrow("Enricher failed");
    });

    it("should handle circuit breaker middleware failures", () => {
      const onOpenSpy = jest.fn(() => {
        throw new Error("onOpen failed");
      });

      const middleware = circuitBreakerMiddleware({
        threshold: 2,
        timeout: 1000,
        onOpen: onOpenSpy,
      });

      // First failure
      let result1 = middleware(mockError, () => mockError);
      expect(isTryError(result1)).toBe(true);

      // Second failure - should try to call onOpen and throw
      expect(() => {
        middleware(mockError, () => mockError);
      }).toThrow("onOpen failed");
    });

    it("should handle rate limit middleware with concurrent access", () => {
      const middleware = rateLimitMiddleware(100, 2);

      // First two errors should pass
      const result1 = middleware(mockError, () => mockError);
      const result2 = middleware(mockError, () => mockError);

      expect(result1).toBe(mockError);
      expect(result2).toBe(mockError);

      // Third should be rate limited
      const result3 = middleware(mockError, () => mockError);
      expect(isTryError(result3)).toBe(true);
      if (isTryError(result3)) {
        expect(result3.type).toBe("RateLimitExceeded");
      }
    });
  });

  describe("Pipeline Composition Edge Cases", () => {
    it("should handle composed middleware with failures", () => {
      const middleware1 = jest.fn((result, next) => {
        throw new Error("First composed middleware failed");
      });

      const middleware2 = jest.fn((result, next) => {
        return next();
      });

      const composed = compose(middleware1, middleware2);

      expect(() => {
        composed(mockError, () => mockError);
      }).toThrow("First composed middleware failed");

      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).not.toHaveBeenCalled();
    });

    it("should handle filter middleware with failing filter", () => {
      const middleware = filterMiddleware(["TestError"], (result, next) => {
        throw new Error("Filtered middleware failed");
      });

      // Should throw for matching error type
      expect(() => {
        middleware(mockError, () => mockError);
      }).toThrow("Filtered middleware failed");

      // Should not throw for non-matching error type
      const otherError = createError({ type: "OtherError", message: "Other" });
      const result = middleware(otherError, () => otherError);
      expect(result).toBe(otherError);
    });

    it("should handle wrapped functions with failing middleware", () => {
      const pipeline = new MiddlewarePipeline();
      pipeline.use(() => {
        throw new Error("Wrapped middleware failed");
      });

      const wrappedFn = pipeline.wrap(() => mockError);

      expect(() => {
        wrappedFn();
      }).toThrow("Wrapped middleware failed");
    });
  });

  describe("Global Registry Error Handling", () => {
    afterEach(() => {
      // Clean up registry
      globalRegistry.list().forEach((name) => {
        globalRegistry.remove(name);
      });
    });

    it("should handle registry operations with invalid names", () => {
      const pipeline = new MiddlewarePipeline();

      // Register with valid name
      globalRegistry.register("test-pipeline", pipeline);

      // Try to get non-existent pipeline
      const result = globalRegistry.get("non-existent");
      expect(result).toBeUndefined();

      // Try to remove non-existent pipeline
      const removed = globalRegistry.remove("non-existent");
      expect(removed).toBe(false);
    });

    it("should handle registry with duplicate names", () => {
      const pipeline1 = new MiddlewarePipeline();
      const pipeline2 = new MiddlewarePipeline();

      globalRegistry.register("test", pipeline1);
      globalRegistry.register("test", pipeline2); // Should overwrite

      const retrieved = globalRegistry.get("test");
      expect(retrieved).toBe(pipeline2);
    });
  });

  describe("Middleware Context Handling", () => {
    it("should handle middleware with corrupted context", () => {
      const pipeline = new MiddlewarePipeline();

      pipeline.use((result, next) => {
        if (isTryError(result)) {
          // Create new error with corrupted context
          return createError({
            type: result.type,
            message: result.message,
            context: null as any,
          });
        }
        return next();
      });

      const result = pipeline.execute(mockError);
      expect(isTryError(result)).toBe(true);
      expect(result.context).toBeNull();
    });

    it("should handle middleware that modifies context incorrectly", () => {
      const pipeline = new MiddlewarePipeline();

      pipeline.use((result, next) => {
        if (isTryError(result)) {
          // Try to modify context with circular reference
          const circular: any = { name: "test" };
          circular.self = circular;
          return createError({
            type: result.type,
            message: result.message,
            context: { circular },
          });
        }
        return next();
      });

      const result = pipeline.execute(mockError);
      expect(isTryError(result)).toBe(true);
      expect(result.context?.circular).toBeDefined();
    });
  });

  describe("Performance Under Error Conditions", () => {
    it("should handle middleware pipeline with many failing middleware", () => {
      const pipeline = new MiddlewarePipeline();

      // Add many middleware that all fail
      for (let i = 0; i < 100; i++) {
        pipeline.use((result, next) => {
          if (i === 50) {
            throw new Error(`Middleware ${i} failed`);
          }
          return next();
        });
      }

      expect(() => {
        pipeline.execute(mockError);
      }).toThrow("Middleware 50 failed");
    });

    it("should handle rapid middleware execution with errors", () => {
      const pipeline = new MiddlewarePipeline();
      let callCount = 0;

      pipeline.use((result, next) => {
        callCount++;
        if (callCount % 3 === 0) {
          throw new Error("Every third call fails");
        }
        return next();
      });

      // Execute many times
      for (let i = 0; i < 10; i++) {
        try {
          pipeline.execute(mockError);
        } catch (error: any) {
          expect(error.message).toBe("Every third call fails");
        }
      }

      expect(callCount).toBe(10);
    });
  });
});
