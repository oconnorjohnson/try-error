import {
  TryError,
  TryResult,
  TryTuple,
  isTryError,
  isTrySuccess,
  TrySuccess,
  TryFailure,
  UnwrapTry,
  UnwrapTryError,
} from "../src/types";

// Helper type for testing type equality
type Equal<T, U> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U
  ? 1
  : 2
  ? true
  : false;

// Helper to assert types are equal at compile time
const assertType = <_T extends true>() => {};

describe("Type Tests", () => {
  describe("TryError interface", () => {
    it("should have all required fields", () => {
      const error: TryError = {
        type: "TestError",
        message: "Test error message",
        source: "test.ts:10:5",
        timestamp: Date.now(),
      };

      expect(error.type).toBe("TestError");
      expect(error.message).toBe("Test error message");
      expect(error.source).toBe("test.ts:10:5");
      expect(error.timestamp).toBeGreaterThan(0);
    });

    it("should support generic type parameter", () => {
      type NetworkError = TryError<"NetworkError">;

      const networkError: NetworkError = {
        type: "NetworkError",
        message: "Network failed",
        source: "api.ts:20:10",
        timestamp: Date.now(),
      };

      expect(networkError.type).toBe("NetworkError");
    });

    it("should support optional fields", () => {
      const errorWithContext: TryError = {
        type: "ContextError",
        message: "Error with context",
        source: "test.ts:30:15",
        timestamp: Date.now(),
        context: { userId: 123, action: "update" },
        stack: "Error: Error with context\n    at test.ts:30:15",
        cause: new Error("Original error"),
      };

      expect(errorWithContext.context).toEqual({
        userId: 123,
        action: "update",
      });
      expect(errorWithContext.stack).toContain("Error with context");
      expect(errorWithContext.cause).toBeInstanceOf(Error);
    });
  });

  describe("isTryError type guard", () => {
    it("should correctly identify TryError objects", () => {
      const validError: TryError = {
        type: "TestError",
        message: "Test",
        source: "test.ts:1:1",
        timestamp: Date.now(),
      };

      expect(isTryError(validError)).toBe(true);
      expect(isTryError({ type: "Test" })).toBe(false);
      expect(isTryError(null)).toBe(false);
      expect(isTryError(undefined)).toBe(false);
      expect(isTryError("error")).toBe(false);
      expect(isTryError(123)).toBe(false);
    });

    it("should narrow types correctly", () => {
      const value: unknown = {
        type: "TestError",
        message: "Test",
        source: "test.ts:1:1",
        timestamp: Date.now(),
      };

      if (isTryError(value)) {
        // Type should be narrowed to TryError
        assertType<Equal<typeof value, TryError>>();
        expect(value.type).toBe("TestError");
      }
    });
  });

  describe("TryResult type", () => {
    it("should handle union of success and error", () => {
      type UserResult = TryResult<
        { id: number; name: string },
        TryError<"UserError">
      >;

      const success: UserResult = { id: 1, name: "John" };
      const error: UserResult = {
        type: "UserError",
        message: "User not found",
        source: "user.ts:10:5",
        timestamp: Date.now(),
      };

      expect(isTryError(success)).toBe(false);
      expect(isTryError(error)).toBe(true);
    });
  });

  describe("TryTuple type", () => {
    it("should handle Go-style tuples", () => {
      type UserTuple = TryTuple<
        { id: number; name: string },
        TryError<"UserError">
      >;

      const success: UserTuple = [{ id: 1, name: "John" }, null];
      const error: UserTuple = [
        null,
        {
          type: "UserError",
          message: "User not found",
          source: "user.ts:10:5",
          timestamp: Date.now(),
        },
      ];

      expect(success[0]).toEqual({ id: 1, name: "John" });
      expect(success[1]).toBeNull();
      expect(error[0]).toBeNull();
      expect(error[1]?.type).toBe("UserError");
    });
  });

  describe("Type utility functions", () => {
    it("TrySuccess should extract success type", () => {
      type Result = { data: string } | TryError<"DataError">;
      type Success = TrySuccess<Result>;

      assertType<Equal<Success, { data: string }>>();
    });

    it("TryFailure should extract error type", () => {
      type Result = { data: string } | TryError<"DataError">;
      type Failure = TryFailure<Result>;

      assertType<Equal<Failure, TryError<"DataError">>>();
    });

    it("UnwrapTry should extract data type from TryResult", () => {
      type Result = TryResult<{ id: number }, TryError<"TestError">>;
      type Data = UnwrapTry<Result>;

      // Test that the type is correctly extracted
      const testData: Data = { id: 123 };
      expect(testData.id).toBe(123);
    });

    it("UnwrapTryError should extract error type from TryResult", () => {
      type Result = TryResult<{ id: number }, TryError<"TestError">>;
      type Error = UnwrapTryError<Result>;

      // Test that the error type is correctly extracted
      const testError: Error = {
        type: "TestError",
        message: "Test error",
        source: "test.ts:1:1",
        timestamp: Date.now(),
      };
      expect(testError.type).toBe("TestError");
    });
  });

  describe("isTrySuccess type predicate", () => {
    it("should narrow to success type", () => {
      type UserResult = TryResult<{ id: number; name: string }, TryError>;

      const result: UserResult = { id: 1, name: "John" };

      if (isTrySuccess(result)) {
        // Type should be narrowed to success type
        assertType<Equal<typeof result, { id: number; name: string }>>();
        expect(result.id).toBe(1);
      }
    });
  });
});

// Additional compile-time type tests are covered in the runtime tests above
