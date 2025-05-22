/**
 * Custom Error Types Example
 *
 * This example demonstrates how to define and use custom error types
 * for API/client communication using the try-error package.
 */

import {
  TryError,
  TryResult,
  createError,
  tryAsync,
  trySync,
  isErr,
  tryMapAsync,
} from "../src/index";

// ============================================================================
// 1. DEFINE CUSTOM ERROR TYPES
// ============================================================================

/**
 * API-specific error types using string literal types for type safety
 */
type ApiErrorType =
  | "NetworkError"
  | "AuthenticationError"
  | "AuthorizationError"
  | "ValidationError"
  | "NotFoundError"
  | "RateLimitError"
  | "ServerError"
  | "TimeoutError";

/**
 * Custom error interface extending TryError with API-specific fields
 */
interface ApiError extends TryError<ApiErrorType> {
  readonly statusCode?: number;
  readonly endpoint?: string;
  readonly requestId?: string;
  readonly retryAfter?: number; // For rate limiting
}

/**
 * Validation-specific error with field-level details
 */
interface ValidationError extends TryError<"ValidationError"> {
  readonly fields: Record<string, string[]>; // field -> error messages
  readonly code: string; // Validation error code
}

/**
 * Business logic error types
 */
type BusinessErrorType =
  | "InsufficientFunds"
  | "AccountLocked"
  | "InvalidOperation"
  | "ResourceConflict";

interface BusinessError extends TryError<BusinessErrorType> {
  readonly errorCode: string;
  readonly details: Record<string, unknown>;
}

// ============================================================================
// 2. ERROR CREATION UTILITIES
// ============================================================================

/**
 * Create an API error with rich context
 */
function createApiError(
  type: ApiErrorType,
  message: string,
  options: {
    statusCode?: number;
    endpoint?: string;
    requestId?: string;
    retryAfter?: number;
    cause?: unknown;
    context?: Record<string, unknown>;
  } = {}
): ApiError {
  return {
    ...createError({
      type,
      message,
      cause: options.cause,
      context: options.context,
    }),
    statusCode: options.statusCode,
    endpoint: options.endpoint,
    requestId: options.requestId,
    retryAfter: options.retryAfter,
  };
}

/**
 * Create a validation error with field-level details
 */
function createValidationError(
  message: string,
  fields: Record<string, string[]>,
  code: string,
  context?: Record<string, unknown>
): ValidationError {
  return {
    ...createError({
      type: "ValidationError",
      message,
      context,
    }),
    fields,
    code,
  };
}

/**
 * Create a business logic error
 */
function createBusinessError(
  type: BusinessErrorType,
  message: string,
  errorCode: string,
  details: Record<string, unknown> = {},
  context?: Record<string, unknown>
): BusinessError {
  return {
    ...createError({
      type,
      message,
      context,
    }),
    errorCode,
    details,
  };
}

// ============================================================================
// 3. API CLIENT WITH CUSTOM ERROR TYPES
// ============================================================================

/**
 * HTTP response wrapper
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  requestId: string;
}

/**
 * API client that returns custom error types
 */
class ApiClient {
  constructor(private baseUrl: string, private apiKey: string) {}

  /**
   * Generic HTTP request method with custom error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TryResult<ApiResponse<T>, ApiError>> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `req_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const result = await tryAsync(
      async () => {
        const response = await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
            ...options.headers,
          },
        });

        // Handle different HTTP status codes with specific error types
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          switch (response.status) {
            case 401:
              throw createApiError(
                "AuthenticationError",
                "Invalid credentials",
                {
                  statusCode: response.status,
                  endpoint,
                  requestId,
                  context: errorData,
                }
              );

            case 403:
              throw createApiError("AuthorizationError", "Access denied", {
                statusCode: response.status,
                endpoint,
                requestId,
                context: errorData,
              });

            case 404:
              throw createApiError("NotFoundError", "Resource not found", {
                statusCode: response.status,
                endpoint,
                requestId,
                context: errorData,
              });

            case 422:
              // Handle validation errors specially
              if (errorData.fields) {
                throw createValidationError(
                  errorData.message || "Validation failed",
                  errorData.fields,
                  errorData.code || "VALIDATION_ERROR",
                  { endpoint, requestId }
                );
              }
              throw createApiError(
                "ValidationError",
                errorData.message || "Invalid input",
                {
                  statusCode: response.status,
                  endpoint,
                  requestId,
                  context: errorData,
                }
              );

            case 429:
              const retryAfter = parseInt(
                response.headers.get("Retry-After") || "60"
              );
              throw createApiError("RateLimitError", "Rate limit exceeded", {
                statusCode: response.status,
                endpoint,
                requestId,
                retryAfter,
                context: errorData,
              });

            case 500:
            case 502:
            case 503:
            case 504:
              throw createApiError("ServerError", "Server error occurred", {
                statusCode: response.status,
                endpoint,
                requestId,
                context: errorData,
              });

            default:
              throw createApiError("NetworkError", `HTTP ${response.status}`, {
                statusCode: response.status,
                endpoint,
                requestId,
                context: errorData,
              });
          }
        }

        const data = await response.json();
        return {
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          requestId,
        };
      },
      {
        timeout: 30000, // 30 second timeout
        context: { endpoint, requestId },
      }
    );

    // Type assertion to ensure the error type matches ApiError
    if (isErr(result)) {
      return result as ApiError;
    }
    return result;
  }

  /**
   * Get user by ID
   */
  async getUser(
    userId: string
  ): Promise<TryResult<User, ApiError | ValidationError>> {
    // Input validation
    if (!userId || userId.trim() === "") {
      return createValidationError(
        "User ID is required",
        { userId: ["User ID cannot be empty"] },
        "MISSING_USER_ID"
      );
    }

    const result = await this.request<User>(`/users/${userId}`);
    return tryMapAsync(Promise.resolve(result), (response) => response.data);
  }

  /**
   * Create a new user
   */
  async createUser(
    userData: CreateUserRequest
  ): Promise<TryResult<User, ApiError | ValidationError>> {
    // Client-side validation
    const validationResult = this.validateUserData(userData);
    if (isErr(validationResult)) {
      return validationResult;
    }

    const result = await this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return tryMapAsync(Promise.resolve(result), (response) => response.data);
  }

  /**
   * Transfer funds between accounts
   */
  async transferFunds(
    fromAccount: string,
    toAccount: string,
    amount: number
  ): Promise<TryResult<TransferResult, ApiError | BusinessError>> {
    const result = await this.request<TransferResult>("/transfers", {
      method: "POST",
      body: JSON.stringify({ fromAccount, toAccount, amount }),
    });

    // Map API errors to business errors for specific cases
    return tryMapAsync(Promise.resolve(result), (response) => {
      // Check for business logic errors in the response
      if (response.data.status === "failed") {
        const { errorCode, reason } = response.data;

        switch (errorCode) {
          case "INSUFFICIENT_FUNDS":
            throw createBusinessError(
              "InsufficientFunds",
              "Account has insufficient funds for this transfer",
              errorCode,
              {
                availableBalance: response.data.availableBalance,
                requestedAmount: amount,
              }
            );

          case "ACCOUNT_LOCKED":
            throw createBusinessError(
              "AccountLocked",
              "Account is locked and cannot perform transfers",
              errorCode,
              { accountId: fromAccount, lockReason: response.data.lockReason }
            );

          default:
            throw createBusinessError(
              "InvalidOperation",
              reason || "Transfer failed",
              errorCode,
              response.data
            );
        }
      }

      return response.data;
    });
  }

  /**
   * Client-side validation helper
   */
  private validateUserData(
    userData: CreateUserRequest
  ): TryResult<void, ValidationError> {
    const fields: Record<string, string[]> = {};

    if (!userData.email || !userData.email.includes("@")) {
      fields.email = ["Valid email address is required"];
    }

    if (!userData.name || userData.name.trim().length < 2) {
      fields.name = ["Name must be at least 2 characters long"];
    }

    if (!userData.password || userData.password.length < 8) {
      fields.password = ["Password must be at least 8 characters long"];
    }

    if (Object.keys(fields).length > 0) {
      return createValidationError(
        "User data validation failed",
        fields,
        "CLIENT_VALIDATION_ERROR"
      );
    }

    return undefined as any; // Success case
  }
}

// ============================================================================
// 4. TYPE DEFINITIONS
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: "active" | "inactive" | "suspended";
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface TransferResult {
  id: string;
  status: "success" | "failed";
  fromAccount: string;
  toAccount: string;
  amount: number;
  errorCode?: string;
  reason?: string;
  availableBalance?: number;
  lockReason?: string;
}

// ============================================================================
// 5. CLIENT USAGE EXAMPLES
// ============================================================================

/**
 * Example: Using the API client with custom error handling
 */
async function exampleUsage() {
  const client = new ApiClient("https://api.example.com", "your-api-key");

  // Example 1: Get user with comprehensive error handling
  console.log("=== Example 1: Get User ===");
  const userResult = await client.getUser("user123");

  if (isErr(userResult)) {
    // Type-safe error handling based on error type
    switch (userResult.type) {
      case "NotFoundError":
        console.error(`User not found: ${userResult.message}`);
        console.error(`Request ID: ${userResult.requestId}`);
        break;

      case "AuthenticationError":
        console.error("Authentication failed - check API key");
        break;

      case "RateLimitError":
        console.error(
          `Rate limited - retry after ${userResult.retryAfter} seconds`
        );
        break;

      case "ValidationError":
        console.error("Validation error:", userResult.fields);
        break;

      default:
        console.error(`API error: ${userResult.message}`);
        console.error(`Status: ${userResult.statusCode}`);
    }
    return;
  }

  console.log("User retrieved successfully:", userResult);

  // Example 2: Create user with validation
  console.log("\n=== Example 2: Create User ===");
  const createResult = await client.createUser({
    name: "John Doe",
    email: "john@example.com",
    password: "securepassword123",
  });

  if (isErr(createResult)) {
    if (createResult.type === "ValidationError") {
      console.error("Validation failed:");
      Object.entries(createResult.fields).forEach(([field, errors]) => {
        console.error(`  ${field}: ${errors.join(", ")}`);
      });
    } else {
      console.error(`Create user failed: ${createResult.message}`);
    }
    return;
  }

  console.log("User created successfully:", createResult);

  // Example 3: Transfer funds with business logic error handling
  console.log("\n=== Example 3: Transfer Funds ===");
  const transferResult = await client.transferFunds("acc123", "acc456", 1000);

  if (isErr(transferResult)) {
    switch (transferResult.type) {
      case "InsufficientFunds":
        console.error("Transfer failed - insufficient funds");
        console.error(`Available: ${transferResult.details.availableBalance}`);
        console.error(`Requested: ${transferResult.details.requestedAmount}`);
        break;

      case "AccountLocked":
        console.error("Transfer failed - account is locked");
        console.error(`Reason: ${transferResult.details.lockReason}`);
        break;

      case "AuthorizationError":
        console.error("Transfer failed - not authorized for this operation");
        break;

      default:
        console.error(`Transfer failed: ${transferResult.message}`);
    }
    return;
  }

  console.log("Transfer completed successfully:", transferResult);
}

// ============================================================================
// 6. ERROR TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type guard for API errors
 */
function isApiError(error: TryError): error is ApiError {
  return (
    error.type in
    [
      "NetworkError",
      "AuthenticationError",
      "AuthorizationError",
      "ValidationError",
      "NotFoundError",
      "RateLimitError",
      "ServerError",
      "TimeoutError",
    ]
  );
}

/**
 * Type guard for validation errors
 */
function isValidationError(error: TryError): error is ValidationError {
  return error.type === "ValidationError" && "fields" in error;
}

/**
 * Type guard for business errors
 */
function isBusinessError(error: TryError): error is BusinessError {
  return (
    error.type in
    [
      "InsufficientFunds",
      "AccountLocked",
      "InvalidOperation",
      "ResourceConflict",
    ]
  );
}

/**
 * Utility to extract retry delay from rate limit errors
 */
function getRetryDelay(error: TryError): number | null {
  if (error.type === "RateLimitError" && "retryAfter" in error) {
    return (error as ApiError).retryAfter || null;
  }
  return null;
}

/**
 * Utility to check if an error is retryable
 */
function isRetryableError(error: TryError): boolean {
  return [
    "NetworkError",
    "ServerError",
    "TimeoutError",
    "RateLimitError",
  ].includes(error.type);
}

// ============================================================================
// 7. SHARED ERROR TYPES FOR API/CLIENT
// ============================================================================

/**
 * Shared error type definitions that can be used by both API and client
 * These would typically be in a shared package or types file
 */
export type {
  ApiErrorType,
  ApiError,
  ValidationError,
  BusinessErrorType,
  BusinessError,
};

export {
  createApiError,
  createValidationError,
  createBusinessError,
  isApiError,
  isValidationError,
  isBusinessError,
  getRetryDelay,
  isRetryableError,
  ApiClient,
};

// Run the example
if (require.main === module) {
  exampleUsage().catch(console.error);
}
