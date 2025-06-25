import { createError } from "../src/errors";
import { configure, resetConfig, getConfig } from "../src/config";
import { isTryError } from "../src/types";

describe("Source Location Improvements", () => {
  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  describe("Basic source location", () => {
    it("should capture source location by default", () => {
      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      expect(error.source).toBeDefined();
      expect(error.source).not.toBe("unknown");
      expect(error.source).not.toBe("disabled");
      expect(error.source).toMatch(/^.+:\d+:\d+$/); // file:line:column format
    });

    it("should respect includeSource config", () => {
      configure({ includeSource: false });

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      expect(error.source).toBe("disabled");
    });

    it("should allow custom source override", () => {
      const error = createError({
        type: "TestError",
        message: "Test message",
        source: "custom-source.ts:42:10",
      });

      expect(error.source).toBe("custom-source.ts:42:10");
    });
  });

  describe("Stack offset configuration", () => {
    it("should use custom stack offset", () => {
      function wrapperFunction() {
        return createError({
          type: "TestError",
          message: "Test message",
          stackOffset: 4, // Adjust for wrapper
        });
      }

      const error = wrapperFunction();
      expect(error.source).toBeDefined();
      expect(error.source).not.toBe("unknown");
    });

    it("should use default stack offset from config", () => {
      configure({
        sourceLocation: {
          defaultStackOffset: 4,
        },
      });

      function wrapperFunction() {
        return createError({
          type: "TestError",
          message: "Test message",
        });
      }

      const error = wrapperFunction();
      expect(error.source).toBeDefined();
    });
  });

  describe("Source location formatting", () => {
    it("should format as file:line:column by default", () => {
      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      const parts = error.source.split(":");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/\.ts$/); // filename
      expect(parseInt(parts[1])).toBeGreaterThan(0); // line number
      expect(parseInt(parts[2])).toBeGreaterThan(0); // column number
    });

    it("should support file:line format", () => {
      configure({
        sourceLocation: {
          format: "file:line",
        },
      });

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      const parts = error.source.split(":");
      expect(parts).toHaveLength(2);
      expect(parts[0]).toMatch(/\.ts$/); // filename
      expect(parseInt(parts[1])).toBeGreaterThan(0); // line number
    });

    it("should support file only format", () => {
      configure({
        sourceLocation: {
          format: "file",
        },
      });

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      expect(error.source).toMatch(/^.+\.ts$/);
      expect(error.source).not.toContain(":");
    });

    it("should support full path when configured", () => {
      configure({
        sourceLocation: {
          includeFullPath: true,
        },
      });

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      // Should include directory separators
      expect(error.source).toContain("/");
    });

    it("should use custom formatter when provided", () => {
      configure({
        sourceLocation: {
          formatter: (file, line, column) =>
            `${file} at line ${line}, col ${column}`,
        },
      });

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      expect(error.source).toMatch(/^.+\.ts at line \d+, col \d+$/);
    });
  });

  describe("Stack trace configuration", () => {
    it("should capture stack trace by default in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("TestError");
      expect(error.stack).toContain("Test message");

      process.env.NODE_ENV = originalEnv;
    });

    it("should not capture stack trace in production by default", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      expect(error.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it("should respect captureStackTrace config", () => {
      configure({ captureStackTrace: true });

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      expect(error.stack).toBeDefined();
    });

    it("should respect per-error captureStackTrace option", () => {
      configure({ captureStackTrace: false });

      const errorWithStack = createError({
        type: "TestError",
        message: "Test message",
        captureStackTrace: true,
      });

      const errorWithoutStack = createError({
        type: "TestError",
        message: "Test message",
        captureStackTrace: false,
      });

      expect(errorWithStack.stack).toBeDefined();
      expect(errorWithoutStack.stack).toBeUndefined();
    });

    it("should limit stack trace depth when configured", () => {
      configure({
        captureStackTrace: true,
        stackTraceLimit: 5,
      });

      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      if (error.stack) {
        const lines = error.stack.split("\n");
        // Stack trace should be limited (accounting for error message line)
        expect(lines.length).toBeLessThanOrEqual(6);
      }
    });
  });

  describe("Environment detection", () => {
    it("should detect Node.js environment", () => {
      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      // In Node.js test environment
      expect(error.source).toBeDefined();
      expect(error.source).not.toBe("unknown");
    });

    it("should handle different stack trace formats", () => {
      // This test verifies that our parsers work, but we can't easily
      // test different browsers in Node.js environment
      const error = createError({
        type: "TestError",
        message: "Test message",
      });

      expect(error.source).toMatch(/^.+:\d+:\d+$/);
    });
  });

  describe("Global error transformation", () => {
    it("should apply onError transformation", () => {
      const transformedErrors: any[] = [];

      configure({
        onError: (error) => {
          transformedErrors.push(error);
          return {
            ...error,
            message: `[TRANSFORMED] ${error.message}`,
          };
        },
      });

      const error = createError({
        type: "TestError",
        message: "Original message",
      });

      expect(transformedErrors).toHaveLength(1);
      expect(error.message).toBe("[TRANSFORMED] Original message");
    });
  });

  describe("Integration with error utilities", () => {
    it("should work with wrapError", async () => {
      const { wrapError } = await import("../src/errors");

      const originalError = new Error("Original error");
      const wrapped = wrapError(
        "WrappedError",
        originalError,
        "Wrapped message"
      );

      expect(wrapped.source).toBeDefined();
      expect(wrapped.source).not.toBe("unknown");
    });

    it("should work with fromThrown", async () => {
      const { fromThrown } = await import("../src/errors");

      const error = fromThrown(new TypeError("Type error"));

      expect(error.type).toBe("TypeError");
      expect(error.source).toBeDefined();
      expect(error.source).not.toBe("unknown");
    });
  });

  describe("Performance considerations", () => {
    it("should skip source location when disabled", () => {
      configure({ includeSource: false });

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        createError({
          type: "TestError",
          message: "Test message",
        });
      }
      const withoutSource = Date.now() - start;

      resetConfig();
      configure({ includeSource: true });

      const start2 = Date.now();
      for (let i = 0; i < 1000; i++) {
        createError({
          type: "TestError",
          message: "Test message",
        });
      }
      const withSource = Date.now() - start2;

      // Without source location should generally be faster
      // (though this can vary based on system load)
      expect(withoutSource).toBeLessThanOrEqual(withSource * 2);
    });
  });
});
