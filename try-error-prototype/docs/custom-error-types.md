# Custom Error Types with try-error

This guide shows how to define and use custom error types for API/client communication using the try-error package.

## Overview

The try-error package supports custom error types through TypeScript's string literal types and interface extension. This enables:

- **Type-safe error handling** with discriminated unions
- **Rich error context** with domain-specific fields
- **Shared error types** between API and client
- **Automatic error detection** with custom type guards

## Basic Pattern

### 1. Define Error Types

```typescript
import { TryError, createError } from "try-error";

// Define your error types using string literals
type ApiErrorType =
  | "NetworkError"
  | "AuthenticationError"
  | "ValidationError"
  | "NotFoundError";

// Extend TryError with custom fields
interface ApiError extends TryError<ApiErrorType> {
  readonly statusCode?: number;
  readonly endpoint?: string;
  readonly requestId?: string;
}
```

### 2. Create Error Factory Functions

```typescript
function createApiError(
  type: ApiErrorType,
  message: string,
  options: {
    statusCode?: number;
    endpoint?: string;
    requestId?: string;
    cause?: unknown;
  } = {}
): ApiError {
  return {
    ...createError({ type, message, cause: options.cause }),
    statusCode: options.statusCode,
    endpoint: options.endpoint,
    requestId: options.requestId,
  };
}
```

### 3. Use in API Operations

```typescript
import { tryAsync, isErr, TryResult } from "try-error";

async function fetchUser(id: string): Promise<TryResult<User, ApiError>> {
  const result = await tryAsync(async () => {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw createApiError("NotFoundError", "User not found", {
            statusCode: 404,
            endpoint: `/api/users/${id}`,
          });
        case 401:
          throw createApiError("AuthenticationError", "Invalid credentials", {
            statusCode: 401,
            endpoint: `/api/users/${id}`,
          });
        default:
          throw createApiError("NetworkError", `HTTP ${response.status}`, {
            statusCode: response.status,
            endpoint: `/api/users/${id}`,
          });
      }
    }

    return response.json();
  });

  return result;
}
```

### 4. Handle Errors Type-safely

```typescript
const userResult = await fetchUser("123");

if (isErr(userResult)) {
  // TypeScript knows this is an ApiError
  switch (userResult.type) {
    case "NotFoundError":
      console.error(`User not found at ${userResult.endpoint}`);
      break;
    case "AuthenticationError":
      console.error("Please log in again");
      break;
    case "NetworkError":
      console.error(`Network error: ${userResult.statusCode}`);
      break;
  }
  return;
}

// TypeScript knows this is User
console.log("User:", userResult);
```

## Advanced Patterns

### Validation Errors with Field Details

```typescript
interface ValidationError extends TryError<"ValidationError"> {
  readonly fields: Record<string, string[]>;
  readonly code: string;
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

// Usage
const validationError = createValidationError(
  "User data is invalid",
  {
    email: ["Must be a valid email address"],
    password: ["Must be at least 8 characters"],
  },
  "USER_VALIDATION_FAILED"
);
```

### Business Logic Errors

```typescript
type BusinessErrorType =
  | "InsufficientFunds"
  | "AccountLocked"
  | "InvalidOperation";

interface BusinessError extends TryError<BusinessErrorType> {
  readonly errorCode: string;
  readonly details: Record<string, unknown>;
}

function createBusinessError(
  type: BusinessErrorType,
  message: string,
  errorCode: string,
  details: Record<string, unknown> = {}
): BusinessError {
  return {
    ...createError({ type, message }),
    errorCode,
    details,
  };
}

// Usage in financial operations
async function transferFunds(
  from: string,
  to: string,
  amount: number
): Promise<TryResult<TransferResult, ApiError | BusinessError>> {
  const result = await tryAsync(async () => {
    const response = await fetch("/api/transfers", {
      method: "POST",
      body: JSON.stringify({ from, to, amount }),
    });

    const data = await response.json();

    if (data.status === "failed") {
      switch (data.errorCode) {
        case "INSUFFICIENT_FUNDS":
          throw createBusinessError(
            "InsufficientFunds",
            "Account has insufficient funds",
            data.errorCode,
            { availableBalance: data.balance, requestedAmount: amount }
          );
        case "ACCOUNT_LOCKED":
          throw createBusinessError(
            "AccountLocked",
            "Account is temporarily locked",
            data.errorCode,
            { lockReason: data.reason }
          );
      }
    }

    return data;
  });

  return result;
}
```

### Type Guards for Error Handling

```typescript
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

function isBusinessError(error: TryError): error is BusinessError {
  return ["InsufficientFunds", "AccountLocked", "InvalidOperation"].includes(
    error.type
  );
}

// Usage with type narrowing
const result = await transferFunds("acc1", "acc2", 1000);

if (isErr(result)) {
  if (isBusinessError(result)) {
    // TypeScript knows this is BusinessError
    console.error(`Business error: ${result.errorCode}`);
    console.error("Details:", result.details);
  } else if (isApiError(result)) {
    // TypeScript knows this is ApiError
    console.error(`API error: ${result.statusCode}`);
  }
}
```

## Shared Types Between API and Client

For full-stack TypeScript applications, you can share error types between your API and client:

### 1. Shared Types Package

```typescript
// packages/shared-types/src/errors.ts
export type ApiErrorType =
  | "NetworkError"
  | "AuthenticationError"
  | "ValidationError"
  | "NotFoundError"
  | "RateLimitError"
  | "ServerError";

export interface ApiError extends TryError<ApiErrorType> {
  readonly statusCode?: number;
  readonly endpoint?: string;
  readonly requestId?: string;
  readonly retryAfter?: number;
}

export interface ValidationError extends TryError<"ValidationError"> {
  readonly fields: Record<string, string[]>;
  readonly code: string;
}

// Export factory functions
export { createApiError, createValidationError };
```

### 2. API Server Usage

```typescript
// server/src/handlers/users.ts
import { createApiError, createValidationError } from "@myapp/shared-types";
import { trySync } from "try-error";

export async function createUser(req: Request, res: Response) {
  const validationResult = trySync(() => validateUserData(req.body));

  if (isErr(validationResult)) {
    const error = createValidationError(
      "User validation failed",
      validationResult.fields,
      "USER_VALIDATION_ERROR"
    );
    return res.status(422).json(error);
  }

  // ... create user logic
}
```

### 3. Client Usage

```typescript
// client/src/api/users.ts
import { ApiError, ValidationError } from "@myapp/shared-types";
import { tryAsync, TryResult } from "try-error";

export async function createUser(
  userData: CreateUserRequest
): Promise<TryResult<User, ApiError | ValidationError>> {
  return tryAsync(async () => {
    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Server returns our custom error format
      throw errorData; // This will be caught and wrapped by tryAsync
    }

    return response.json();
  });
}
```

## Best Practices

### 1. Use String Literal Types

Always use string literal types for error types to get full TypeScript support:

```typescript
// ✅ Good - string literal union
type ErrorType = "ValidationError" | "NetworkError" | "AuthError";

// ❌ Bad - generic string
type ErrorType = string;
```

### 2. Extend TryError Consistently

Always extend the base `TryError` interface for custom error types:

```typescript
// ✅ Good - extends TryError
interface CustomError extends TryError<"CustomError"> {
  readonly customField: string;
}

// ❌ Bad - doesn't extend TryError
interface CustomError {
  type: "CustomError";
  message: string;
  customField: string;
}
```

### 3. Use Factory Functions

Create factory functions for consistent error creation:

```typescript
// ✅ Good - factory function
function createCustomError(message: string, customField: string): CustomError {
  return {
    ...createError({ type: "CustomError", message }),
    customField,
  };
}

// ❌ Bad - manual object creation
const error: CustomError = {
  type: "CustomError",
  message: "Something went wrong",
  source: "unknown", // Missing automatic source detection
  timestamp: Date.now(),
  customField: "value",
};
```

### 4. Provide Type Guards

Create type guards for better error handling:

```typescript
function isCustomError(error: TryError): error is CustomError {
  return error.type === "CustomError";
}

// Usage
if (isErr(result) && isCustomError(result)) {
  // TypeScript knows result is CustomError
  console.log(result.customField);
}
```

### 5. Document Error Types

Document your error types and when they occur:

```typescript
/**
 * API errors that can occur during user operations
 */
type UserApiError =
  | "UserNotFound" // User ID doesn't exist
  | "UserAlreadyExists" // Email already registered
  | "InvalidUserData" // Validation failed
  | "UserPermissionDenied"; // Insufficient permissions
```

## Complete Example

See `examples/custom-error-types.ts` for a complete working example that demonstrates:

- Custom error type definitions
- Error factory functions
- API client with custom error handling
- Type-safe error handling in application code
- Shared error types between API and client

This example shows how to build a robust, type-safe error handling system that scales from simple validation errors to complex business logic errors.
