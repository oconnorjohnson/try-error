import { createError, wrapError, fromThrown } from "../src/errors";
import { TryError, isTryError } from "../src/types";

describe("Error Creation Utilities", () => {
  describe("createError", () => {
    it("should create a basic TryError with required fields", () => {
      const error = createError({
        type: "TestError",
        message: "Test error message",
      });

      expect(isTryError(error)).toBe(true);
      expect(error.type).toBe("TestError");
      expect(error.message).toBe("Test error message");
      expect(error.source).toMatch(/errors\.test\.ts:\d+:\d+/);
      expect(error.timestamp).toBeGreaterThan(0);
      expect(error.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it("should include optional fields when provided", () => {
      const context = { userId: 123, action: "update" };
      const cause = new Error("Original error");
      const customTimestamp = 1234567890;

      const error = createError({
        type: "ValidationError",
        message: "Validation failed",
        context,
        cause,
        timestamp: customTimestamp,
        source: "custom.ts:10:5",
      });

      expect(error.context).toEqual(context);
      expect(error.cause).toBe(cause);
      expect(error.timestamp).toBe(customTimestamp);
      expect(error.source).toBe("custom.ts:10:5");
    });

    it("should include stack trace in development", () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "development";

      const error = createError({
        type: "TestError",
        message: "Test with stack",
      });

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("Test with stack");

      (process.env as any).NODE_ENV = originalEnv;
    });

    it("should not include stack trace in production", () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "production";

      // Force reset of cached production check
      const { resetConfig } = require("../src/config");
      resetConfig();

      const error = createError({
        type: "TestError",
        message: "Test without stack",
      });

      expect(error.stack).toBeUndefined();

      (process.env as any).NODE_ENV = originalEnv;
      resetConfig();
    });

    it("should preserve generic type parameter", () => {
      type NetworkError = TryError<"NetworkError">;

      const error: NetworkError = createError({
        type: "NetworkError",
        message: "Network failed",
      });

      expect(error.type).toBe("NetworkError");
      // TypeScript should enforce the type at compile time
    });
  });

  describe("wrapError", () => {
    it("should wrap an Error instance", () => {
      const originalError = new Error("Original error message");
      const wrappedError = wrapError("WrappedError", originalError);

      expect(wrappedError.type).toBe("WrappedError");
      expect(wrappedError.message).toBe("Original error message");
      expect(wrappedError.cause).toBe(originalError);
      expect(wrappedError.source).toMatch(/errors\.(test\.)?ts:\d+:\d+/);
    });

    it("should wrap a string error", () => {
      const stringError = "Something went wrong";
      const wrappedError = wrapError("StringError", stringError);

      expect(wrappedError.type).toBe("StringError");
      expect(wrappedError.message).toBe("Something went wrong");
      expect(wrappedError.cause).toBe(stringError);
    });

    it("should use custom message when provided", () => {
      const originalError = new Error("Original message");
      const customMessage = "Custom wrapper message";
      const wrappedError = wrapError(
        "CustomError",
        originalError,
        customMessage
      );

      expect(wrappedError.message).toBe(customMessage);
      expect(wrappedError.cause).toBe(originalError);
    });

    it("should include context when provided", () => {
      const context = { operation: "parse", input: "invalid-json" };
      const originalError = new Error("Parse failed");
      const wrappedError = wrapError(
        "ParseError",
        originalError,
        undefined,
        context
      );

      expect(wrappedError.context).toEqual(context);
    });

    it("should handle unknown error types", () => {
      const unknownError = { weird: "object" };
      const wrappedError = wrapError("UnknownError", unknownError);

      expect(wrappedError.type).toBe("UnknownError");
      expect(wrappedError.message).toBe("Unknown error occurred");
      expect(wrappedError.cause).toBe(unknownError);
    });
  });

  describe("fromThrown", () => {
    it("should detect TypeError", () => {
      const typeError = new TypeError("Cannot read property");
      const wrappedError = fromThrown(typeError);

      expect(wrappedError.type).toBe("TypeError");
      expect(wrappedError.message).toBe("Cannot read property");
      expect(wrappedError.cause).toBe(typeError);
    });

    it("should detect ReferenceError", () => {
      const refError = new ReferenceError("Variable not defined");
      const wrappedError = fromThrown(refError);

      expect(wrappedError.type).toBe("ReferenceError");
      expect(wrappedError.message).toBe("Variable not defined");
      expect(wrappedError.cause).toBe(refError);
    });

    it("should detect SyntaxError", () => {
      const syntaxError = new SyntaxError("Unexpected token");
      const wrappedError = fromThrown(syntaxError);

      expect(wrappedError.type).toBe("SyntaxError");
      expect(wrappedError.message).toBe("Unexpected token");
      expect(wrappedError.cause).toBe(syntaxError);
    });

    it("should handle generic Error", () => {
      const genericError = new Error("Generic error");
      const wrappedError = fromThrown(genericError);

      expect(wrappedError.type).toBe("Error");
      expect(wrappedError.message).toBe("Generic error");
      expect(wrappedError.cause).toBe(genericError);
    });

    it("should handle string errors", () => {
      const stringError = "String error message";
      const wrappedError = fromThrown(stringError);

      expect(wrappedError.type).toBe("StringError");
      expect(wrappedError.message).toBe("String error message");
      expect(wrappedError.cause).toBe(stringError);
    });

    it("should handle unknown thrown values", () => {
      const unknownValue = { some: "object" };
      const wrappedError = fromThrown(unknownValue);

      expect(wrappedError.type).toBe("UnknownError");
      expect(wrappedError.message).toBe("An unknown error occurred");
      expect(wrappedError.cause).toBe(unknownValue);
    });

    it("should include context when provided", () => {
      const context = { operation: "risky", attempt: 3 };
      const error = new Error("Operation failed");
      const wrappedError = fromThrown(error, context);

      expect(wrappedError.context).toEqual(context);
    });
  });

  describe("source location detection", () => {
    it("should detect source location automatically", () => {
      const error = createError({
        type: "LocationTest",
        message: "Testing location detection",
      });

      // Should include the test file name and approximate line number
      expect(error.source).toMatch(/errors\.(test\.)?ts:\d+:\d+/);
    });

    it("should handle missing stack trace gracefully", () => {
      // Mock Error constructor to not provide stack
      const originalError = Error;
      const originalCaptureStackTrace = Error.captureStackTrace;

      global.Error = class extends originalError {
        constructor(message?: string) {
          super(message);
          this.stack = undefined;
        }
      } as any;

      // Also remove captureStackTrace if it exists
      if (typeof Error.captureStackTrace === "function") {
        delete (Error as any).captureStackTrace;
      }

      const error = createError({
        type: "NoStackTest",
        message: "Testing without stack",
      });

      expect(error.source).toBe("unknown");

      // Restore original Error
      global.Error = originalError;
      if (originalCaptureStackTrace) {
        Error.captureStackTrace = originalCaptureStackTrace;
      }
    });
  });

  describe("type safety", () => {
    it("should maintain type safety with generic parameters", () => {
      type ValidationError = TryError<"ValidationError">;
      type NetworkError = TryError<"NetworkError">;

      const validationError: ValidationError = createError({
        type: "ValidationError",
        message: "Validation failed",
      });

      const networkError: NetworkError = wrapError(
        "NetworkError",
        new Error("Network failed")
      );

      expect(validationError.type).toBe("ValidationError");
      expect(networkError.type).toBe("NetworkError");
    });
  });
});
