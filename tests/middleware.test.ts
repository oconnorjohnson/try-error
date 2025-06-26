import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  MiddlewarePipeline,
  globalRegistry,
  loggingMiddleware,
  retryMiddleware,
  transformMiddleware,
  enrichContextMiddleware,
  circuitBreakerMiddleware,
  compose,
  filterMiddleware,
  rateLimitMiddleware,
} from "../src/middleware";
import { TryError, TryResult, isTryError, TRY_ERROR_BRAND } from "../src/types";

describe("MiddlewarePipeline", () => {
  let pipeline: MiddlewarePipeline;

  beforeEach(() => {
    pipeline = new MiddlewarePipeline();
  });

  describe("basic functionality", () => {
    it("should execute middleware in order", () => {
      const order: number[] = [];

      pipeline.use((result, next) => {
        order.push(1);
        const nextResult = next();
        order.push(4);
        return nextResult;
      });

      pipeline.use((result, next) => {
        order.push(2);
        const nextResult = next();
        order.push(3);
        return nextResult;
      });

      const result: TryResult<string> = "test";
      pipeline.execute(result);

      expect(order).toEqual([1, 2, 3, 4]);
    });

    it("should pass result through middleware", () => {
      const middleware1 = jest.fn((result: any, next: any) => next());
      const middleware2 = jest.fn((result: any, next: any) => next());

      pipeline.use(middleware1);
      pipeline.use(middleware2);

      const result: TryResult<string> = "test";
      const output = pipeline.execute(result);

      expect(middleware1).toHaveBeenCalledWith(result, expect.any(Function));
      expect(middleware2).toHaveBeenCalledWith(result, expect.any(Function));
      expect(output).toBe(result);
    });

    it("should support middleware that modifies result", () => {
      pipeline.use((result, next) => {
        if (isTryError(result)) {
          return {
            ...result,
            message: result.message + " [modified]",
          };
        }
        return next();
      });

      const error: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "TestError",
        message: "Original",
        source: "test.ts",
        timestamp: Date.now(),
      };

      const result = pipeline.execute(error);
      expect(isTryError(result)).toBe(true);
      expect((result as TryError).message).toBe("Original [modified]");
    });

    it("should support final handler", () => {
      pipeline.use((result, next) => {
        return next();
      });

      const finalHandler = jest.fn((): TryResult<string> => "final");
      const initialResult: TryResult<string> = "initial";
      const result = pipeline.execute(initialResult, finalHandler);

      expect(finalHandler).toHaveBeenCalled();
      expect(result).toBe("final");
    });
  });

  describe("wrap functionality", () => {
    it("should wrap a function with middleware", () => {
      let middlewareCalled = false;

      pipeline.use((result, next) => {
        middlewareCalled = true;
        return next();
      });

      const fn = (x: number): TryResult<number> => x * 2;
      const wrapped = pipeline.wrap(fn);

      const result = wrapped(5);
      expect(middlewareCalled).toBe(true);
      expect(result).toBe(10);
    });
  });

  describe("clone functionality", () => {
    it("should create independent clone", () => {
      const middleware1 = jest.fn((result: any, next: any) => next());
      const middleware2 = jest.fn((result: any, next: any) => next());

      pipeline.use(middleware1);
      const cloned = pipeline.clone();
      cloned.use(middleware2);

      expect(pipeline.length).toBe(1);
      expect(cloned.length).toBe(2);
    });
  });
});

describe("Global Registry", () => {
  beforeEach(() => {
    // Clear registry
    globalRegistry.list().forEach((name) => globalRegistry.remove(name));
  });

  it("should register and retrieve pipelines", () => {
    const pipeline = new MiddlewarePipeline();
    globalRegistry.register("test", pipeline);

    expect(globalRegistry.get("test")).toBe(pipeline);
    expect(globalRegistry.list()).toContain("test");
  });

  it("should remove pipelines", () => {
    const pipeline = new MiddlewarePipeline();
    globalRegistry.register("test", pipeline);

    expect(globalRegistry.remove("test")).toBe(true);
    expect(globalRegistry.get("test")).toBeUndefined();
    expect(globalRegistry.remove("test")).toBe(false);
  });
});

describe("Common Middleware", () => {
  describe("loggingMiddleware", () => {
    it("should log errors", () => {
      const logger = jest.fn();
      const middleware = loggingMiddleware(logger);

      const error: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "LogError",
        message: "Test log",
        source: "test.ts",
        timestamp: Date.now(),
      };

      middleware(error, () => error);
      expect(logger).toHaveBeenCalledWith(error);

      // Should not log success results
      logger.mockClear();
      const successResult: TryResult<string> = "success";
      middleware(successResult, () => successResult);
      expect(logger).not.toHaveBeenCalled();
    });
  });

  describe("retryMiddleware", () => {
    it("should pass through on first success", () => {
      const middleware = retryMiddleware(3);
      const next = jest.fn(() => "success" as TryResult<string>);

      const error: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "InitialError",
        message: "Initial",
        source: "test.ts",
        timestamp: Date.now(),
      };

      // First call with error - middleware should call next()
      const result = middleware(error, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(result).toBe("success");
    });

    it("should not retry when max attempts reached", () => {
      // Create a new instance for each test
      const createRetryMiddleware = () => {
        let attempts = 0;
        return (result: any, next: any) => {
          if (isTryError(result) && attempts < 3) {
            attempts++;
            return next();
          }
          return result;
        };
      };

      const middleware = createRetryMiddleware();
      const error: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "RetryError",
        message: "Retry me",
        source: "test.ts",
        timestamp: Date.now(),
      };

      // Simulate multiple calls
      let callCount = 0;
      const next = jest.fn(() => {
        callCount++;
        return error; // Always return error
      });

      // First 3 calls should retry (call next)
      for (let i = 0; i < 3; i++) {
        const result = middleware(error, next);
        expect(result).toBe(error);
      }
      expect(next).toHaveBeenCalledTimes(3);

      // 4th call should not retry
      next.mockClear();
      const result = middleware(error, next);
      expect(next).not.toHaveBeenCalled();
      expect(result).toBe(error);
    });

    it("should respect shouldRetry predicate", () => {
      const shouldRetry = jest.fn(
        (error: TryError) => error.type === "RetryableError"
      );
      const middleware = retryMiddleware(3, shouldRetry);

      const nonRetryableError: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "NonRetryableError",
        message: "Don't retry",
        source: "test.ts",
        timestamp: Date.now(),
      };

      const result = middleware(nonRetryableError, () => nonRetryableError);
      expect(shouldRetry).toHaveBeenCalledWith(nonRetryableError);
      expect(result).toBe(nonRetryableError);
    });
  });

  describe("transformMiddleware", () => {
    it("should transform errors", () => {
      const transform = jest.fn((error: TryError) => ({
        ...error,
        type: "TransformedError",
        message: `[TRANSFORMED] ${error.message}`,
      }));

      const middleware = transformMiddleware(transform);

      const error: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "OriginalError",
        message: "Original message",
        source: "test.ts",
        timestamp: Date.now(),
      };

      const result = middleware(error, () => error);
      expect(transform).toHaveBeenCalledWith(error);
      expect((result as TryError).type).toBe("TransformedError");
      expect((result as TryError).message).toBe(
        "[TRANSFORMED] Original message"
      );
    });
  });

  describe("enrichContextMiddleware", () => {
    it("should enrich error context", () => {
      const enricher = jest.fn(() => ({
        userId: 123,
        requestId: "abc-123",
      }));

      const middleware = enrichContextMiddleware(enricher);

      const error: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "ContextError",
        message: "Test",
        source: "test.ts",
        timestamp: Date.now(),
        context: { existing: true },
      };

      const result = middleware(error, () => error) as TryError;
      expect(enricher).toHaveBeenCalled();
      expect(result.context).toEqual({
        existing: true,
        userId: 123,
        requestId: "abc-123",
      });
    });
  });

  describe("circuitBreakerMiddleware", () => {
    it("should open circuit after threshold", () => {
      jest.useFakeTimers();
      const onOpen = jest.fn();
      const onClose = jest.fn();

      const middleware = circuitBreakerMiddleware({
        threshold: 3,
        timeout: 1000,
        onOpen,
        onClose,
      });

      const error: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "TestError",
        message: "Failing",
        source: "test.ts",
        timestamp: Date.now(),
      };

      // Fail 3 times to open circuit
      for (let i = 0; i < 3; i++) {
        middleware(error, () => error);
      }

      expect(onOpen).toHaveBeenCalled();

      // Next call should fail fast
      const result = middleware(
        error,
        () => "should not reach" as TryResult<string>
      ) as TryError;
      expect(result.type).toBe("CircuitBreakerOpen");

      // Wait for timeout
      jest.advanceTimersByTime(1001);

      // Circuit should close
      const successResult: TryResult<string> = "success";
      const result2 = middleware(error, () => successResult);
      expect(result2).toBe(successResult);
      expect(onClose).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe("compose", () => {
    it("should compose multiple middleware", () => {
      const order: string[] = [];

      const m1 = (result: any, next: any) => {
        order.push("m1-before");
        const r = next();
        order.push("m1-after");
        return r;
      };

      const m2 = (result: any, next: any) => {
        order.push("m2-before");
        const r = next();
        order.push("m2-after");
        return r;
      };

      const composed = compose(m1, m2);
      const testResult: TryResult<string> = "test";
      composed(testResult, () => {
        order.push("final");
        return "final" as TryResult<string>;
      });

      expect(order).toEqual([
        "m1-before",
        "m2-before",
        "final",
        "m2-after",
        "m1-after",
      ]);
    });
  });

  describe("filterMiddleware", () => {
    it("should only run for specific error types", () => {
      const innerMiddleware = jest.fn((result: any, next: any) => ({
        ...(result as TryError),
        message: "filtered",
      }));

      const filtered = filterMiddleware(
        ["NetworkError", "TimeoutError"],
        innerMiddleware
      );

      const networkError: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "NetworkError",
        message: "Network failed",
        source: "test.ts",
        timestamp: Date.now(),
      };

      const otherError: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "OtherError",
        message: "Other failed",
        source: "test.ts",
        timestamp: Date.now(),
      };

      const result1 = filtered(networkError, () => networkError) as TryError;
      expect(innerMiddleware).toHaveBeenCalled();
      expect(result1.message).toBe("filtered");

      innerMiddleware.mockClear();
      const result2 = filtered(otherError, () => otherError);
      expect(innerMiddleware).not.toHaveBeenCalled();
      expect(result2).toBe(otherError);
    });
  });

  describe("rateLimitMiddleware", () => {
    it("should limit error rate", () => {
      jest.useFakeTimers();
      const middleware = rateLimitMiddleware(1000, 3); // 3 errors per second

      const error: TryError = {
        [TRY_ERROR_BRAND]: true,
        type: "TestError",
        message: "Rate limited",
        source: "test.ts",
        timestamp: Date.now(),
      };

      // First 3 should pass
      for (let i = 0; i < 3; i++) {
        const result = middleware(error, () => error);
        expect(result).toBe(error);
      }

      // 4th should be rate limited
      const result = middleware(error, () => error) as TryError;
      expect(result.type).toBe("RateLimitExceeded");
      expect(result.context).toEqual({
        windowMs: 1000,
        maxErrors: 3,
        currentCount: 3,
      });

      // Advance time and try again
      jest.advanceTimersByTime(1001);
      const result2 = middleware(error, () => error);
      expect(result2).toBe(error);

      jest.useRealTimers();
    });
  });
});
