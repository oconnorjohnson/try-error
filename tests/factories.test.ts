import {
  createErrorFactory,
  chainError,
  wrapWithContext,
  createEntityError,
  createAmountError,
  createExternalError,
  createValidationError,
  EntityError,
  AmountError,
} from "../src/factories";
import { TryError, TRY_ERROR_BRAND } from "../src/types";
import { createError } from "../src/errors";

describe("Error Factories", () => {
  describe("createErrorFactory", () => {
    it("should create a factory function with default fields", () => {
      type PaymentErrorType =
        | "CardDeclined"
        | "InsufficientFunds"
        | "ProcessingError";
      interface PaymentError extends TryError<PaymentErrorType> {
        readonly transactionId: string;
        readonly amount: number;
        readonly provider: string;
      }

      const createPaymentError = createErrorFactory<
        PaymentErrorType,
        PaymentError
      >({
        provider: "stripe",
      });

      const error = createPaymentError("CardDeclined", "Card was declined", {
        transactionId: "tx_123",
        amount: 99.99,
      });

      expect(error.type).toBe("CardDeclined");
      expect(error.message).toBe("Card was declined");
      expect(error.provider).toBe("stripe");
      expect(error.transactionId).toBe("tx_123");
      expect(error.amount).toBe(99.99);
      expect(error.timestamp).toBeGreaterThan(0);
      expect(error.source).toMatch(/factories\.(test\.)?ts:\d+:\d+/);
    });

    it("should override default fields with domain fields", () => {
      type ApiErrorType = "NetworkError" | "AuthError";
      interface ApiError extends TryError<ApiErrorType> {
        readonly provider: string;
        readonly statusCode: number;
      }

      const createApiError = createErrorFactory<ApiErrorType, ApiError>({
        provider: "default-api",
        statusCode: 500,
      });

      const error = createApiError("NetworkError", "Connection failed", {
        provider: "custom-api",
        statusCode: 404,
      });

      expect(error.provider).toBe("custom-api");
      expect(error.statusCode).toBe(404);
    });

    it("should handle options for cause and context", () => {
      type TestErrorType = "TestError";
      interface TestError extends TryError<TestErrorType> {
        readonly testField: string;
      }

      const createTestError = createErrorFactory<TestErrorType, TestError>();
      const originalError = new Error("Original error");

      const error = createTestError(
        "TestError",
        "Test message",
        { testField: "test-value" },
        {
          cause: originalError,
          context: { requestId: "req_123" },
        }
      );

      expect(error.cause).toBe(originalError);
      expect(error.context).toEqual({ requestId: "req_123" });
      expect(error.testField).toBe("test-value");
    });
  });

  describe("chainError", () => {
    it("should chain errors while preserving context", () => {
      const originalError: TryError = createError({
        type: "DatabaseError",
        message: "Connection failed",
        source: "db.ts:10:5",
        context: { query: "SELECT * FROM users" },
      });

      interface ServiceError extends TryError<"UserServiceError"> {
        readonly operation: string;
        readonly userId: string;
      }

      const chainedError = chainError<"UserServiceError", ServiceError>(
        originalError,
        "UserServiceError",
        "Failed to fetch user data",
        {
          operation: "getUserById",
          userId: "123",
        }
      );

      expect(chainedError.type).toBe("UserServiceError");
      expect(chainedError.message).toBe("Failed to fetch user data");
      expect(chainedError.cause).toBe(originalError);
      expect(chainedError.operation).toBe("getUserById");
      expect(chainedError.userId).toBe("123");
      expect(chainedError.context?.chainedFrom).toBe("DatabaseError");
      expect(chainedError.context?.query).toBe("SELECT * FROM users");
    });
  });

  describe("wrapWithContext", () => {
    it("should add context to existing error", () => {
      const error: TryError = createError({
        type: "ValidationError",
        message: "Invalid input",
        source: "validation.ts:5:10",
        context: { field: "email" },
      });

      const wrappedError = wrapWithContext(error, {
        requestId: "req_123",
        userId: "user_456",
      });

      expect(wrappedError.type).toBe("ValidationError");
      expect(wrappedError.message).toBe("Invalid input");
      expect(wrappedError.context).toEqual({
        field: "email",
        requestId: "req_123",
        userId: "user_456",
      });
    });

    it("should handle errors without existing context", () => {
      const error: TryError = createError({
        type: "NetworkError",
        message: "Connection timeout",
        source: "network.ts:15:20",
      });

      const wrappedError = wrapWithContext(error, {
        endpoint: "/api/users",
        retryCount: 3,
      });

      expect(wrappedError.context).toEqual({
        endpoint: "/api/users",
        retryCount: 3,
      });
    });
  });

  describe("Convenience Factories", () => {
    describe("createEntityError", () => {
      it("should create entity error with correct fields", () => {
        const error = createEntityError(
          "user",
          "user_123",
          "UserNotFound",
          "User not found"
        );

        expect(error.type).toBe("UserNotFound");
        expect(error.message).toBe("User not found");
        expect(error.entityType).toBe("user");
        expect(error.entityId).toBe("user_123");
        expect(error.timestamp).toBeGreaterThan(0);
      });

      it("should handle options", () => {
        const originalError = new Error("Database error");
        const error = createEntityError(
          "order",
          "order_456",
          "OrderNotFound",
          "Order not found",
          {
            cause: originalError,
            context: { shopId: "shop_789" },
          }
        );

        expect(error.cause).toBe(originalError);
        expect(error.context).toEqual({ shopId: "shop_789" });
      });
    });

    describe("createAmountError", () => {
      it("should create amount error with correct fields", () => {
        const error = createAmountError(
          99.99,
          "USD",
          "InsufficientFunds",
          "Insufficient funds"
        );

        expect(error.type).toBe("InsufficientFunds");
        expect(error.message).toBe("Insufficient funds");
        expect(error.amount).toBe(99.99);
        expect(error.currency).toBe("USD");
      });
    });

    describe("createExternalError", () => {
      it("should create external error with correct fields", () => {
        const error = createExternalError(
          "stripe",
          "PaymentFailed",
          "Payment processing failed"
        );

        expect(error.type).toBe("PaymentFailed");
        expect(error.message).toBe("Payment processing failed");
        expect(error.provider).toBe("stripe");
      });

      it("should handle optional fields", () => {
        const error = createExternalError(
          "api-service",
          "RateLimited",
          "Rate limit exceeded",
          {
            statusCode: 429,
            externalId: "req_123",
            context: { endpoint: "/api/data" },
          }
        );

        expect(error.statusCode).toBe(429);
        expect(error.externalId).toBe("req_123");
        expect(error.context).toEqual({ endpoint: "/api/data" });
      });
    });

    describe("createValidationError", () => {
      it("should create validation error with correct fields", () => {
        const fields = {
          email: ["Must be a valid email address"],
          password: ["Must be at least 8 characters", "Must contain a number"],
        };

        const error = createValidationError(
          "FormValidation",
          "Form validation failed",
          fields,
          "FORM_VALIDATION_ERROR"
        );

        expect(error.type).toBe("FormValidation");
        expect(error.message).toBe("Form validation failed");
        expect(error.fields).toEqual(fields);
        expect(error.code).toBe("FORM_VALIDATION_ERROR");
      });
    });
  });

  describe("Type Safety", () => {
    it("should maintain type safety for domain-specific errors", () => {
      // This test mainly checks that TypeScript compilation works correctly
      type UserErrorType = "UserNotFound" | "UserSuspended";
      interface UserError extends EntityError<UserErrorType, "user"> {
        readonly accountStatus?: string;
      }

      const createUserError = createErrorFactory<UserErrorType, UserError>({
        entityType: "user",
      });

      const error = createUserError("UserNotFound", "User not found", {
        entityId: "user_123",
        accountStatus: "active",
      });

      // TypeScript should know these fields exist
      expect(error.type).toBe("UserNotFound");
      expect(error.entityType).toBe("user");
      expect(error.entityId).toBe("user_123");
      expect(error.accountStatus).toBe("active");
    });

    it("should work with complex error hierarchies", () => {
      type PaymentErrorType = "CardDeclined" | "InsufficientFunds";
      interface PaymentError extends AmountError<PaymentErrorType> {
        readonly transactionId: string;
        readonly cardLast4?: string;
      }

      const createPaymentError = createErrorFactory<
        PaymentErrorType,
        PaymentError
      >();

      const error = createPaymentError("CardDeclined", "Card was declined", {
        amount: 99.99,
        currency: "USD",
        transactionId: "tx_123",
        cardLast4: "4242",
      });

      expect(error.type).toBe("CardDeclined");
      expect(error.amount).toBe(99.99);
      expect(error.currency).toBe("USD");
      expect(error.transactionId).toBe("tx_123");
      expect(error.cardLast4).toBe("4242");
    });
  });
});
