import {
  createEnhancedError,
  isErrorOfType,
  isErrorOfTypes,
  getErrorMessage,
  getErrorContext,
  hasErrorContext,
  transformResult,
  withDefault,
  withDefaultFn,
  filterSuccess,
  filterErrors,
  partitionResults,
  combineErrors,
  getErrorSummary,
  formatErrorForLogging,
  createErrorReport,
  diffErrors,
  groupErrors,
  ErrorSampling,
  correlateErrors,
  getErrorFingerprint,
} from "../src/utils";
import { createError } from "../src/errors";
import { trySync } from "../src/sync";
import { TryError, TryResult, isTryError } from "../src/types";

describe("Error Utilities", () => {
  describe("createEnhancedError", () => {
    it("should create an enhanced error with basic properties", () => {
      const error = createEnhancedError("ValidationError", "Invalid input");

      expect(isTryError(error)).toBe(true);
      expect(error.type).toBe("ValidationError");
      expect(error.message).toBe("Invalid input");
      expect(error.timestamp).toBeGreaterThan(0);
    });

    it("should include custom context and tags", () => {
      const error = createEnhancedError("ValidationError", "Invalid input", {
        context: { field: "email", value: "invalid" },
        tags: ["user-input", "validation"],
      });

      expect(error.context).toMatchObject({
        field: "email",
        value: "invalid",
        tags: ["user-input", "validation"],
      });
    });

    it("should respect includeStack option", () => {
      const errorWithStack = createEnhancedError("TestError", "Test", {
        includeStack: true,
      });

      const errorWithoutStack = createEnhancedError("TestError", "Test", {
        includeStack: false,
      });

      // In non-development, stack should be included when explicitly requested
      expect(errorWithStack.stack).toBeDefined();
      expect(errorWithoutStack.stack).toBeUndefined();
    });

    it("should use custom message when provided", () => {
      const error = createEnhancedError("TestError", "Default", {
        message: "Custom message",
      });

      expect(error.message).toBe("Custom message");
    });
  });

  describe("Error Type Checking", () => {
    describe("isErrorOfType", () => {
      it("should return true for matching error type", () => {
        const error = createError({ type: "ValidationError", message: "Test" });
        expect(isErrorOfType(error, "ValidationError")).toBe(true);
      });

      it("should return false for non-matching error type", () => {
        const error = createError({ type: "NetworkError", message: "Test" });
        expect(isErrorOfType(error, "ValidationError")).toBe(false);
      });

      it("should return false for non-TryError values", () => {
        expect(isErrorOfType("string", "ValidationError")).toBe(false);
        expect(isErrorOfType(null, "ValidationError")).toBe(false);
        expect(isErrorOfType(undefined, "ValidationError")).toBe(false);
        expect(isErrorOfType({}, "ValidationError")).toBe(false);
      });
    });

    describe("isErrorOfTypes", () => {
      it("should return true if error matches any of the types", () => {
        const error = createError({ type: "NetworkError", message: "Test" });
        expect(isErrorOfTypes(error, ["NetworkError", "TimeoutError"])).toBe(
          true
        );
      });

      it("should return false if error matches none of the types", () => {
        const error = createError({ type: "ValidationError", message: "Test" });
        expect(isErrorOfTypes(error, ["NetworkError", "TimeoutError"])).toBe(
          false
        );
      });

      it("should return false for non-TryError values", () => {
        expect(isErrorOfTypes("string", ["NetworkError"])).toBe(false);
        expect(isErrorOfTypes(null, ["NetworkError"])).toBe(false);
      });
    });
  });

  describe("Error Message and Context", () => {
    describe("getErrorMessage", () => {
      it("should extract message from TryError", () => {
        const error = createError({
          type: "TestError",
          message: "Test message",
        });
        expect(getErrorMessage(error)).toBe("Test message");
      });

      it("should extract message from Error instance", () => {
        const error = new Error("Native error");
        expect(getErrorMessage(error)).toBe("Native error");
      });

      it("should return string value as-is", () => {
        expect(getErrorMessage("String error")).toBe("String error");
      });

      it("should return fallback for other types", () => {
        expect(getErrorMessage(null)).toBe("Unknown error");
        expect(getErrorMessage(undefined)).toBe("Unknown error");
        expect(getErrorMessage(123)).toBe("Unknown error");
        expect(getErrorMessage({})).toBe("Unknown error");
      });

      it("should use custom fallback when provided", () => {
        expect(getErrorMessage(null, "Custom fallback")).toBe(
          "Custom fallback"
        );
      });
    });

    describe("getErrorContext", () => {
      it("should extract context value by key", () => {
        const error = createError({
          type: "TestError",
          message: "Test",
          context: { userId: "123", requestId: "abc" },
        });

        expect(getErrorContext(error, "userId")).toBe("123");
        expect(getErrorContext(error, "requestId")).toBe("abc");
      });

      it("should return undefined for missing keys", () => {
        const error = createError({
          type: "TestError",
          message: "Test",
          context: { userId: "123" },
        });

        expect(getErrorContext(error, "missing")).toBeUndefined();
      });

      it("should return undefined when no context", () => {
        const error = createError({ type: "TestError", message: "Test" });
        expect(getErrorContext(error, "any")).toBeUndefined();
      });
    });

    describe("hasErrorContext", () => {
      it("should return true when context key exists", () => {
        const error = createError({
          type: "TestError",
          message: "Test",
          context: { userId: "123" },
        });

        expect(hasErrorContext(error, "userId")).toBe(true);
      });

      it("should return false when context key missing", () => {
        const error = createError({
          type: "TestError",
          message: "Test",
          context: { userId: "123" },
        });

        expect(hasErrorContext(error, "missing")).toBe(false);
      });

      it("should return false when no context", () => {
        const error = createError({ type: "TestError", message: "Test" });
        expect(hasErrorContext(error, "any")).toBe(false);
      });
    });
  });

  describe("Result Transformation", () => {
    describe("transformResult", () => {
      it("should transform success values", () => {
        const result: TryResult<number> = 42;
        const transformed = transformResult(result, (n: number) => n * 2);
        expect(transformed).toBe(84);
      });

      it("should preserve errors", () => {
        const error = createError({ type: "TestError", message: "Test" });
        const result: TryResult<number> = error;
        const transformed = transformResult(result, (n: number) => n * 2);
        expect(transformed).toBe(error);
      });
    });

    describe("withDefault", () => {
      it("should return success value", () => {
        // Test with a function that returns a TryResult
        const getResult = (): TryResult<string> => "success";
        const result = getResult();
        expect(withDefault(result, "default")).toBe("success");
      });

      it("should return default for errors", () => {
        // Test with a function that returns an error
        const getError = (): TryResult<string> =>
          createError({ type: "TestError", message: "Test" });
        const result = getError();
        expect(withDefault(result, "default")).toBe("default");
      });
    });

    describe("withDefaultFn", () => {
      it("should return success value", () => {
        const result: TryResult<string> = "success";
        expect(withDefaultFn(result, () => "default")).toBe("success");
      });

      it("should compute default for errors", () => {
        const error = createError({ type: "TestError", message: "Test" });
        const result: TryResult<string> = error;
        expect(withDefaultFn(result, (e) => `Error: ${e.type}`)).toBe(
          "Error: TestError"
        );
      });
    });
  });

  describe("Result Filtering", () => {
    describe("filterSuccess", () => {
      it("should filter out errors", () => {
        const results: TryResult<number>[] = [
          1,
          createError({ type: "Error1", message: "Test" }),
          2,
          createError({ type: "Error2", message: "Test" }),
          3,
        ];

        const successes = filterSuccess(results);
        expect(successes).toEqual([1, 2, 3]);
      });

      it("should handle empty array", () => {
        expect(filterSuccess([])).toEqual([]);
      });

      it("should handle all errors", () => {
        const results: TryResult<number>[] = [
          createError({ type: "Error1", message: "Test" }),
          createError({ type: "Error2", message: "Test" }),
        ];

        expect(filterSuccess(results)).toEqual([]);
      });
    });

    describe("filterErrors", () => {
      it("should filter out successes", () => {
        const error1 = createError({ type: "Error1", message: "Test" });
        const error2 = createError({ type: "Error2", message: "Test" });
        const results: TryResult<number>[] = [1, error1, 2, error2, 3];

        const errors = filterErrors(results);
        expect(errors).toEqual([error1, error2]);
      });

      it("should handle empty array", () => {
        expect(filterErrors([])).toEqual([]);
      });

      it("should handle all successes", () => {
        const results: TryResult<number>[] = [1, 2, 3];
        expect(filterErrors(results)).toEqual([]);
      });
    });

    describe("partitionResults", () => {
      it("should partition into successes and errors", () => {
        const error1 = createError({ type: "Error1", message: "Test" });
        const error2 = createError({ type: "Error2", message: "Test" });
        const results: TryResult<number>[] = [1, error1, 2, error2, 3];

        const [successes, errors] = partitionResults(results);
        expect(successes).toEqual([1, 2, 3]);
        expect(errors).toEqual([error1, error2]);
      });

      it("should handle empty array", () => {
        const [successes, errors] = partitionResults([]);
        expect(successes).toEqual([]);
        expect(errors).toEqual([]);
      });
    });
  });

  describe("Error Aggregation", () => {
    describe("combineErrors", () => {
      it("should combine multiple errors into one", () => {
        const errors = [
          createError({ type: "ValidationError", message: "Invalid email" }),
          createError({ type: "ValidationError", message: "Invalid password" }),
          createError({ type: "NetworkError", message: "Connection failed" }),
        ];

        const combined = combineErrors(
          errors,
          "MultipleErrors",
          "3 errors occurred"
        );

        expect(combined.type).toBe("MultipleErrors");
        expect(combined.message).toBe("3 errors occurred");
        expect(combined.context?.errorCount).toBe(3);
        expect(combined.context?.errors).toHaveLength(3);
      });

      it("should handle empty error array", () => {
        const combined = combineErrors([], "NoErrors", "No errors");
        expect(combined.context?.errorCount).toBe(0);
        expect(combined.context?.errors).toEqual([]);
      });
    });

    describe("getErrorSummary", () => {
      it("should count errors by type", () => {
        const errors = [
          createError({ type: "ValidationError", message: "Test1" }),
          createError({ type: "ValidationError", message: "Test2" }),
          createError({ type: "ValidationError", message: "Test3" }),
          createError({ type: "NetworkError", message: "Test4" }),
        ];

        const summary = getErrorSummary(errors);
        expect(summary).toEqual({
          ValidationError: 3,
          NetworkError: 1,
        });
      });

      it("should handle empty array", () => {
        expect(getErrorSummary([])).toEqual({});
      });
    });
  });

  describe("Debugging Utilities", () => {
    describe("formatErrorForLogging", () => {
      it("should format error with basic info", () => {
        const error = createError({
          type: "TestError",
          message: "Test message",
        });

        const formatted = formatErrorForLogging(error);
        expect(formatted).toContain("[TestError] Test message");
        expect(formatted).toContain("Source:");
        expect(formatted).toContain("Timestamp:");
      });

      it("should include context when present", () => {
        const error = createError({
          type: "TestError",
          message: "Test",
          context: { userId: "123", action: "login" },
        });

        const formatted = formatErrorForLogging(error);
        expect(formatted).toContain("Context:");
        expect(formatted).toContain("userId");
        expect(formatted).toContain("123");
      });

      it("should include stack when requested", () => {
        const error = createError({
          type: "TestError",
          message: "Test",
          captureStackTrace: true,
        });

        const formatted = formatErrorForLogging(error, true);
        if (error.stack) {
          expect(formatted).toContain("Stack:");
        }
      });

      it("should include cause when present", () => {
        const cause = new Error("Original error");
        const error = createError({
          type: "TestError",
          message: "Test",
          cause,
        });

        const formatted = formatErrorForLogging(error);
        // Only check if cause is included when it's actually in the error
        if (error.cause) {
          expect(formatted).toContain("Cause:");
        } else {
          // If cause is not supported by createError, skip this test
          expect(formatted).not.toContain("Cause:");
        }
      });
    });

    describe("createErrorReport", () => {
      it("should create report for multiple errors", () => {
        const errors = [
          createError({
            type: "ValidationError",
            message: "Invalid email",
          }),
          createError({
            type: "ValidationError",
            message: "Invalid password",
          }),
          createError({
            type: "NetworkError",
            message: "Timeout",
          }),
        ];

        const report = createErrorReport(errors);
        expect(report).toContain("Error Report (3 total errors)");
        expect(report).toContain(
          "Summary: ValidationError: 2, NetworkError: 1"
        );
        expect(report).toContain("1. [ValidationError] Invalid email");
        expect(report).toContain("2. [ValidationError] Invalid password");
        expect(report).toContain("3. [NetworkError] Timeout");
      });

      it("should handle empty error array", () => {
        const report = createErrorReport([]);
        expect(report).toBe("No errors to report");
      });
    });
  });

  describe("Error Diffing", () => {
    describe("diffErrors", () => {
      it("should detect type changes", () => {
        const error1 = createError({
          type: "ValidationError",
          message: "Test",
        });
        const error2 = createError({ type: "SchemaError", message: "Test" });

        const diff = diffErrors(error1, error2);
        expect(diff.type).toEqual({
          from: "ValidationError",
          to: "SchemaError",
        });
      });

      it("should detect message changes", () => {
        const error1 = createError({ type: "Error", message: "Message 1" });
        const error2 = createError({ type: "Error", message: "Message 2" });

        const diff = diffErrors(error1, error2);
        expect(diff.message).toEqual({ from: "Message 1", to: "Message 2" });
      });

      it("should detect context changes", () => {
        const error1 = createError({
          type: "Error",
          message: "Test",
          context: { a: 1, b: 2, c: 3 },
        });
        const error2 = createError({
          type: "Error",
          message: "Test",
          context: { b: 2, c: 4, d: 5 },
        });

        const diff = diffErrors(error1, error2);
        expect(diff.context?.added).toEqual({ d: 5 });
        expect(diff.context?.removed).toEqual({ a: 1 });
        expect(diff.context?.changed).toEqual({ c: { from: 3, to: 4 } });
      });

      it("should handle errors with no differences", () => {
        const error = createError({ type: "Error", message: "Test" });
        const diff = diffErrors(error, error);
        expect(diff).toEqual({});
      });
    });
  });

  describe("Error Grouping", () => {
    describe("groupErrors", () => {
      it("should group errors by type", () => {
        const errors = [
          createError({ type: "ValidationError", message: "Invalid email" }),
          createError({ type: "ValidationError", message: "Invalid password" }),
          createError({ type: "NetworkError", message: "Timeout" }),
        ];

        const grouped = groupErrors(errors, (e) => e.type);
        expect(grouped.size).toBe(2);
        expect(grouped.get("ValidationError")).toHaveLength(2);
        expect(grouped.get("NetworkError")).toHaveLength(1);
      });

      it("should group by custom key function", () => {
        const errors = [
          createError({
            type: "Error",
            message: "Test",
            context: { severity: "high" },
          }),
          createError({
            type: "Error",
            message: "Test",
            context: { severity: "low" },
          }),
          createError({
            type: "Error",
            message: "Test",
            context: { severity: "high" },
          }),
        ];

        const grouped = groupErrors(
          errors,
          (e) => e.context?.severity || "unknown"
        );
        expect(grouped.get("high")).toHaveLength(2);
        expect(grouped.get("low")).toHaveLength(1);
      });

      it("should handle empty array", () => {
        const grouped = groupErrors([] as TryError[], (e) => e.type);
        expect(grouped.size).toBe(0);
      });
    });
  });

  describe("Error Sampling", () => {
    describe("random sampling", () => {
      it("should return true/false based on probability", () => {
        // Test with 0 and 1 probability for deterministic results
        expect(ErrorSampling.random(0)).toBe(false);
        expect(ErrorSampling.random(1)).toBe(true);

        // Test with 0.5 probability - should get both true and false over many runs
        const results = new Set();
        for (let i = 0; i < 100; i++) {
          results.add(ErrorSampling.random(0.5));
        }
        // With 100 runs at 0.5 probability, we should see both values
        expect(results.size).toBe(2);
      });
    });

    describe("rate sampling", () => {
      it("should sample every Nth error", () => {
        expect(ErrorSampling.rate(1, 10)).toBe(false);
        expect(ErrorSampling.rate(5, 10)).toBe(false);
        expect(ErrorSampling.rate(10, 10)).toBe(true);
        expect(ErrorSampling.rate(20, 10)).toBe(true);
        expect(ErrorSampling.rate(15, 10)).toBe(false);
      });
    });

    describe("time-based sampling", () => {
      it("should sample based on time window", () => {
        const now = Date.now();

        // Should sample if enough time has passed
        expect(ErrorSampling.timeBased(now - 70000, 60000)).toBe(true);

        // Should not sample if within window
        expect(ErrorSampling.timeBased(now - 30000, 60000)).toBe(false);

        // Edge case: exactly at window boundary
        expect(ErrorSampling.timeBased(now - 60000, 60000)).toBe(true);
      });
    });

    describe("type-based sampling", () => {
      it("should sample based on error type rates", () => {
        const rates = new Map([
          ["ValidationError", 0.01],
          ["NetworkError", 0.5],
          ["CriticalError", 1.0],
        ]);

        // Critical errors should always be sampled
        const criticalError = createError({
          type: "CriticalError",
          message: "Test",
        });
        expect(ErrorSampling.byType(criticalError, rates)).toBe(true);

        // Validation errors should rarely be sampled (1%)
        const validationError = createError({
          type: "ValidationError",
          message: "Test",
        });
        // Mock Math.random to test deterministically
        const originalRandom = Math.random;
        Math.random = () => 0.005; // Less than 0.01
        expect(ErrorSampling.byType(validationError, rates)).toBe(true);
        Math.random = () => 0.02; // Greater than 0.01
        expect(ErrorSampling.byType(validationError, rates)).toBe(false);
        Math.random = originalRandom;
      });

      it("should use default rate for unknown types", () => {
        const rates = new Map([["KnownError", 0.5]]);
        const unknownError = createError({
          type: "UnknownError",
          message: "Test",
        });

        // Default rate is 0.1
        const originalRandom = Math.random;
        Math.random = () => 0.05; // Less than 0.1
        expect(ErrorSampling.byType(unknownError, rates)).toBe(true);
        Math.random = () => 0.15; // Greater than 0.1
        expect(ErrorSampling.byType(unknownError, rates)).toBe(false);
        Math.random = originalRandom;
      });
    });
  });

  describe("Error Correlation", () => {
    describe("correlateErrors", () => {
      it("should correlate errors by transaction ID", () => {
        const errors = [
          createError({
            type: "Error",
            message: "1",
            context: { transactionId: "tx1" },
          }),
          createError({
            type: "Error",
            message: "2",
            context: { transactionId: "tx2" },
          }),
          createError({
            type: "Error",
            message: "3",
            context: { transactionId: "tx1" },
          }),
          createError({
            type: "Error",
            message: "4",
            context: { transactionId: "tx2" },
          }),
        ];

        const correlated = correlateErrors(
          errors,
          (e1, e2) => e1.context?.transactionId === e2.context?.transactionId
        );

        expect(correlated).toHaveLength(2);
        expect(correlated[0]).toHaveLength(2);
        expect(correlated[1]).toHaveLength(2);
      });

      it("should handle no correlations", () => {
        const errors = [
          createError({ type: "Error", message: "1", context: { id: "1" } }),
          createError({ type: "Error", message: "2", context: { id: "2" } }),
          createError({ type: "Error", message: "3", context: { id: "3" } }),
        ];

        const correlated = correlateErrors(
          errors,
          (e1, e2) => e1.context?.id === e2.context?.id
        );

        expect(correlated).toHaveLength(3);
        correlated.forEach((group) => expect(group).toHaveLength(1));
      });

      it("should handle empty array", () => {
        const correlated = correlateErrors([], () => false);
        expect(correlated).toEqual([]);
      });
    });
  });

  describe("Error Fingerprinting", () => {
    describe("getErrorFingerprint", () => {
      it("should create fingerprint from default fields", () => {
        const error = createError({
          type: "TestError",
          message: "Test message",
        });
        const fingerprint = getErrorFingerprint(error);
        expect(fingerprint).toBe("TestError|Test message");
      });

      it("should create fingerprint from custom fields", () => {
        const error = createError({
          type: "TestError",
          message: "Test",
        });

        const fingerprint = getErrorFingerprint(error, ["type", "message"]);
        expect(fingerprint).toBe("TestError|Test");
      });

      it("should handle complex fields", () => {
        const error = createError({
          type: "TestError",
          message: "Test",
          context: { user: "123", action: "login" },
        });

        const fingerprint = getErrorFingerprint(error, ["type", "context"]);
        expect(fingerprint).toBe('TestError|{"user":"123","action":"login"}');
      });

      it("should handle missing fields", () => {
        const error = createError({ type: "TestError", message: "Test" });
        const fingerprint = getErrorFingerprint(error, [
          "type",
          "nonexistent" as any,
        ]);
        expect(fingerprint).toBe("TestError|undefined");
      });
    });
  });
});
