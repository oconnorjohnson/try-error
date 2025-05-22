/**
 * Demo: Custom Error Types in Action
 *
 * This demo shows how custom error types work in practice
 */

import {
  TryError,
  TryResult,
  createError,
  trySync,
  tryAsync,
  isErr,
} from "../src/index";

// ============================================================================
// 1. DEFINE CUSTOM ERROR TYPES
// ============================================================================

type ApiErrorType =
  | "NetworkError"
  | "AuthenticationError"
  | "ValidationError"
  | "NotFoundError";

interface ApiError extends TryError<ApiErrorType> {
  readonly statusCode?: number;
  readonly endpoint?: string;
}

interface ValidationError extends TryError<"ValidationError"> {
  readonly fields: Record<string, string[]>;
  readonly code: string;
}

// ============================================================================
// 2. ERROR FACTORY FUNCTIONS
// ============================================================================

function createApiError(
  type: ApiErrorType,
  message: string,
  options: {
    statusCode?: number;
    endpoint?: string;
    cause?: unknown;
  } = {}
): ApiError {
  return {
    ...createError({ type, message, cause: options.cause }),
    statusCode: options.statusCode,
    endpoint: options.endpoint,
  };
}

function createValidationError(
  message: string,
  fields: Record<string, string[]>,
  code: string
): ValidationError {
  return {
    ...createError({ type: "ValidationError", message }),
    fields,
    code,
  };
}

// ============================================================================
// 3. MOCK API FUNCTIONS
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

// Mock function that simulates API calls with different error scenarios
function mockApiCall(scenario: string): TryResult<User, ApiError> {
  const result = trySync(() => {
    switch (scenario) {
      case "success":
        return { id: "1", name: "John Doe", email: "john@example.com" };

      case "not-found":
        throw createApiError("NotFoundError", "User not found", {
          statusCode: 404,
          endpoint: "/api/users/999",
        });

      case "auth-error":
        throw createApiError("AuthenticationError", "Invalid API key", {
          statusCode: 401,
          endpoint: "/api/users/1",
        });

      case "network-error":
        throw createApiError("NetworkError", "Connection timeout", {
          statusCode: 500,
          endpoint: "/api/users/1",
        });

      default:
        throw new Error("Unknown scenario");
    }
  });

  // Type assertion to ensure the error type matches ApiError
  if (isErr(result)) {
    return result as ApiError;
  }
  return result;
}

// Mock validation function
function validateUser(
  userData: Partial<User>
): TryResult<User, ValidationError> {
  const result = trySync(() => {
    const fields: Record<string, string[]> = {};

    if (!userData.name || userData.name.trim().length < 2) {
      fields.name = ["Name must be at least 2 characters long"];
    }

    if (!userData.email || !userData.email.includes("@")) {
      fields.email = ["Must be a valid email address"];
    }

    if (Object.keys(fields).length > 0) {
      throw createValidationError(
        "User validation failed",
        fields,
        "USER_VALIDATION_ERROR"
      );
    }

    return userData as User;
  });

  // Type assertion to ensure the error type matches ValidationError
  if (isErr(result)) {
    return result as ValidationError;
  }
  return result;
}

// ============================================================================
// 4. TYPE GUARDS
// ============================================================================

function isApiError(error: TryError): error is ApiError {
  return [
    "NetworkError",
    "AuthenticationError",
    "ValidationError",
    "NotFoundError",
  ].includes(error.type);
}

function isValidationError(error: TryError): error is ValidationError {
  return error.type === "ValidationError" && "fields" in error;
}

// ============================================================================
// 5. DEMO FUNCTIONS
// ============================================================================

function demoApiErrors() {
  console.log("🔥 API Error Handling Demo");
  console.log("=".repeat(50));

  const scenarios = ["success", "not-found", "auth-error", "network-error"];

  scenarios.forEach((scenario) => {
    console.log(`\n📡 Testing scenario: ${scenario}`);

    const result = mockApiCall(scenario);

    if (isErr(result)) {
      if (isApiError(result)) {
        console.log(`❌ ${result.type}: ${result.message}`);
        console.log(`   Status: ${result.statusCode}`);
        console.log(`   Endpoint: ${result.endpoint}`);
        console.log(`   Source: ${result.source}`);
        console.log(
          `   Timestamp: ${new Date(result.timestamp).toISOString()}`
        );
      } else {
        console.log(`❌ Unknown error: ${result.message}`);
      }
    } else {
      console.log(`✅ Success: User ${result.name} (${result.email})`);
    }
  });
}

function demoValidationErrors() {
  console.log("\n\n🔍 Validation Error Handling Demo");
  console.log("=".repeat(50));

  const testCases = [
    { name: "John Doe", email: "john@example.com" }, // Valid
    { name: "", email: "john@example.com" }, // Invalid name
    { name: "John", email: "invalid-email" }, // Invalid email
    { name: "", email: "invalid" }, // Both invalid
  ];

  testCases.forEach((userData, index) => {
    console.log(`\n🧪 Test case ${index + 1}: ${JSON.stringify(userData)}`);

    const result = validateUser(userData);

    if (isErr(result)) {
      if (isValidationError(result)) {
        console.log(`❌ ${result.type}: ${result.message}`);
        console.log(`   Code: ${result.code}`);
        console.log(`   Fields:`);
        Object.entries(result.fields).forEach(([field, errors]) => {
          console.log(`     ${field}: ${errors.join(", ")}`);
        });
      } else {
        console.log(`❌ Unknown error: ${result.message}`);
      }
    } else {
      console.log(`✅ Valid user: ${result.name} (${result.email})`);
    }
  });
}

function demoTypeDiscrimination() {
  console.log("\n\n🎯 Type Discrimination Demo");
  console.log("=".repeat(50));

  // Create different types of errors
  const errors: TryError[] = [
    createApiError("NotFoundError", "Resource not found", { statusCode: 404 }),
    createValidationError(
      "Invalid data",
      { email: ["Required"] },
      "VALIDATION_001"
    ),
    createApiError("NetworkError", "Connection failed", { statusCode: 500 }),
  ];

  errors.forEach((error, index) => {
    console.log(`\n🔍 Error ${index + 1}: ${error.type}`);

    // Type-safe error handling with discrimination
    if (isApiError(error)) {
      console.log(`   API Error - Status: ${error.statusCode}`);
      console.log(`   Endpoint: ${error.endpoint || "unknown"}`);
    } else if (isValidationError(error)) {
      console.log(`   Validation Error - Code: ${error.code}`);
      console.log(`   Fields: ${Object.keys(error.fields).join(", ")}`);
    } else {
      console.log(`   Generic Error: ${error.message}`);
    }

    console.log(`   Message: ${error.message}`);
    console.log(`   Source: ${error.source}`);
  });
}

// ============================================================================
// 6. RUN DEMO
// ============================================================================

function runDemo() {
  console.log("🚀 Custom Error Types Demo");
  console.log(
    "This demo shows how to define and use custom error types with try-error\n"
  );

  try {
    demoApiErrors();
    demoValidationErrors();
    demoTypeDiscrimination();

    console.log("\n\n✨ Demo completed successfully!");
    console.log("\nKey takeaways:");
    console.log(
      "• Custom error types provide rich, structured error information"
    );
    console.log("• Type guards enable type-safe error handling");
    console.log("• Factory functions ensure consistent error creation");
    console.log(
      "• TypeScript discriminated unions provide compile-time safety"
    );
  } catch (error) {
    console.error("Demo failed:", error);
  }
}

// Run the demo
runDemo();
