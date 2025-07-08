---
id: wrapError-deep-dive
title: wrapError() - Complete Implementation Guide
tags: [api, core, error-wrapping, cause-preservation, error-chaining]
related: [fromThrown, createError, trySync, tryAsync, Error]
module: errors
complexity: intermediate
performance_impact: low
stability: stable
---

# wrapError() - Complete Implementation Guide

## Quick Reference

Wraps existing errors or thrown values into a structured TryError while preserving the original error as the `cause`. This is essential for error chaining, maintaining stack traces, and converting exception-based code to functional error handling.

## Signature

```typescript
function wrapError<T extends string = string>(
  type: T,
  cause: unknown,
  message?: string,
  context?: Record<string, unknown>
): TryError<T>;

// Parameters
type: T                               // New error type for the wrapper
cause: unknown                        // Original error or thrown value
message?: string                      // Optional custom message
context?: Record<string, unknown>     // Optional runtime context

// Return type
TryError<T>                          // Structured error with cause preserved
```

## Purpose

- **Error conversion**: Transform any thrown value into a structured TryError
- **Cause preservation**: Maintain original error information and stack traces
- **Error chaining**: Create error hierarchies with clear causation
- **Message customization**: Override or enhance error messages
- **Context enhancement**: Add debugging context while preserving original error
- **Type safety**: Provide type-safe error handling with custom error types

## Implementation Details

### Algorithm Flow

```
1. Message extraction → 5-15ns
   a. Use provided message if given
   b. Extract from Error.message if Error instance
   c. Use string value if cause is string
   d. Default fallback message
2. createError() delegation → 20-100ns
   a. Pass through type, extracted message
   b. Include original cause
   c. Add optional context
3. TryError creation → Variable (depends on config)
4. Return structured error → 0ns
```

### Performance Characteristics

- **Time Complexity**: O(1) + O(message extraction)
- **Space Complexity**: O(1) + O(context size)
- **Execution Time**: 25-115ns total
- **Memory Usage**: ~450 bytes (standard) or ~120 bytes (minimal mode)
- **Overhead**: Same as createError() since it delegates

### Message Extraction Logic

```typescript
function extractMessage(cause: unknown, customMessage?: string): string {
  // 1. Use custom message if provided
  if (customMessage) {
    return customMessage;
  }

  // 2. Extract from Error instance
  if (cause instanceof Error) {
    return cause.message;
  }

  // 3. Use string directly
  if (typeof cause === "string") {
    return cause;
  }

  // 4. Fallback for unknown types
  return "Unknown error occurred";
}
```

### Internal Dependencies

```typescript
// Direct dependencies
- createError()                      // Core error creation
- typeof cause checks               // Type detection
- Error.message extraction          // Message extraction

// Indirect dependencies (via createError)
- getCachedConfig()                 // Configuration access
- getSourceLocation()               // Stack trace parsing
- ErrorPool.acquire()               // Object pooling (if enabled)
- TRY_ERROR_BRAND                   // Symbol branding
```

## Basic Usage Examples

### Wrapping Standard Errors

```typescript
// Basic Error wrapping
try {
  JSON.parse(invalidJson);
} catch (error) {
  return wrapError("ParseError", error, "Failed to parse configuration");
}

// Network error wrapping
try {
  const response = await fetch("/api/data");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
} catch (error) {
  return wrapError("NetworkError", error, "Failed to fetch user data");
}

// File system error wrapping
try {
  const content = fs.readFileSync("config.json", "utf8");
  return JSON.parse(content);
} catch (error) {
  return wrapError("ConfigError", error, "Failed to load configuration file");
}
```

### Preserving Error Messages

```typescript
// Use original error message
const originalError = new Error("Connection timeout after 5000ms");
const wrapped = wrapError("NetworkError", originalError);
console.log(wrapped.message); // "Connection timeout after 5000ms"

// Override with custom message
const wrappedCustom = wrapError(
  "NetworkError",
  originalError,
  "Network request failed during user authentication"
);
console.log(wrappedCustom.message); // "Network request failed during user authentication"

// Access original message via cause
console.log(wrappedCustom.cause.message); // "Connection timeout after 5000ms"
```

### Adding Context

```typescript
// Wrap with debugging context
function processUserData(userId: string, data: unknown) {
  try {
    return validateUserSchema(data);
  } catch (error) {
    return wrapError("ValidationError", error, "User data validation failed", {
      userId,
      dataKeys: Object.keys(data as object),
      validationSchema: "userSchemaV2",
      timestamp: Date.now(),
    });
  }
}

// Wrap with operational context
async function saveToDatabase(record: any) {
  try {
    return await db.insert("users", record);
  } catch (error) {
    return wrapError("DatabaseError", error, "Failed to insert user record", {
      table: "users",
      recordId: record.id,
      operation: "insert",
      connectionId: db.connectionId,
      retryCount: 0,
    });
  }
}
```

## Advanced Usage Patterns

### Error Chaining

```typescript
// Create error chain with preserved causation
function processPayment(paymentData: PaymentData) {
  try {
    // Step 1: Validate payment data
    const validatedData = validatePaymentData(paymentData);

    // Step 2: Process with payment provider
    return processWithStripe(validatedData);
  } catch (error) {
    // Wrap validation errors
    if (error.name === "ValidationError") {
      return wrapError(
        "PaymentValidationError",
        error,
        "Payment data validation failed",
        {
          paymentMethod: paymentData.method,
          amount: paymentData.amount,
          currency: paymentData.currency,
        }
      );
    }

    // Wrap provider errors
    if (error.name === "StripeError") {
      return wrapError(
        "PaymentProviderError",
        error,
        "Payment provider rejected the transaction",
        {
          provider: "stripe",
          errorCode: error.code,
          paymentIntent: error.payment_intent?.id,
        }
      );
    }

    // Wrap unknown errors
    return wrapError(
      "PaymentProcessingError",
      error,
      "Unexpected error during payment processing",
      {
        paymentId: paymentData.id,
        step: "unknown",
      }
    );
  }
}
```

### Multi-Level Error Wrapping

```typescript
// Service layer
class UserService {
  async getUser(id: string) {
    try {
      const user = await this.repository.findById(id);
      return user;
    } catch (error) {
      return wrapError(
        "UserServiceError",
        error,
        "Failed to retrieve user from service",
        {
          userId: id,
          service: "UserService",
          method: "getUser",
        }
      );
    }
  }
}

// Repository layer
class UserRepository {
  async findById(id: string) {
    try {
      const result = await this.database.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      return result[0];
    } catch (error) {
      return wrapError("DatabaseError", error, "Database query failed", {
        table: "users",
        operation: "SELECT",
        userId: id,
      });
    }
  }
}

// Controller layer
class UserController {
  async handleGetUser(req: Request, res: Response) {
    const result = await this.userService.getUser(req.params.id);

    if (isTryError(result)) {
      // Error chain: Controller -> Service -> Repository -> Database
      const controllerError = wrapError(
        "ControllerError",
        result,
        "Failed to handle user request",
        {
          requestId: req.id,
          endpoint: req.path,
          method: req.method,
          userId: req.params.id,
        }
      );

      return res.status(500).json({
        error: controllerError.message,
        type: controllerError.type,
        requestId: req.id,
      });
    }

    return res.json(result);
  }
}
```

### Third-Party Integration Patterns

```typescript
// Axios integration
async function makeApiRequest(url: string, options: RequestOptions) {
  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return wrapError(
        "ApiError",
        error,
        `API request failed: ${error.response?.status} ${error.response?.statusText}`,
        {
          url,
          method: options.method || "GET",
          status: error.response?.status,
          responseData: error.response?.data,
          requestId: options.headers?.["x-request-id"],
        }
      );
    }

    return wrapError("UnknownApiError", error, "Unexpected API error");
  }
}

// AWS SDK integration
async function uploadToS3(bucket: string, key: string, body: Buffer) {
  try {
    const result = await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: body,
      })
      .promise();

    return result.Location;
  } catch (error) {
    return wrapError("S3Error", error, "Failed to upload file to S3", {
      bucket,
      key,
      fileSize: body.length,
      region: s3.config.region,
      errorCode: error.code,
      errorMessage: error.message,
    });
  }
}

// Database integration (MongoDB)
async function findUserInMongo(userId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user;
  } catch (error) {
    if (error.name === "CastError") {
      return wrapError("InvalidUserIdError", error, "Invalid user ID format", {
        userId,
        expectedFormat: "ObjectId",
        providedFormat: typeof userId,
      });
    }

    if (error.name === "MongoError") {
      return wrapError(
        "DatabaseConnectionError",
        error,
        "Database connection failed",
        {
          database: "users",
          operation: "findById",
          errorCode: error.code,
        }
      );
    }

    return wrapError(
      "UserLookupError",
      error,
      "Failed to find user in database",
      { userId }
    );
  }
}
```

### Framework-Specific Patterns

```typescript
// Express.js middleware
function errorWrapperMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalSend = res.send;

  res.send = function (body) {
    if (isTryError(body)) {
      const requestError = wrapError(
        "RequestError",
        body,
        "Request processing failed",
        {
          requestId: req.id,
          path: req.path,
          method: req.method,
          userAgent: req.get("User-Agent"),
          timestamp: Date.now(),
        }
      );

      return originalSend.call(this, {
        error: requestError.message,
        type: requestError.type,
        requestId: req.id,
      });
    }

    return originalSend.call(this, body);
  };

  next();
}

// React error boundary integration
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const wrappedError = wrapError(
      "ReactError",
      error,
      "React component error occurred",
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
        timestamp: Date.now(),
      }
    );

    // Send to error reporting service
    errorReportingService.captureError(wrappedError);
  }
}

// Next.js API route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await processApiRequest(req.body);
    return res.status(200).json(result);
  } catch (error) {
    const apiError = wrapError(
      "NextApiError",
      error,
      "API route processing failed",
      {
        route: req.url,
        method: req.method,
        query: req.query,
        timestamp: Date.now(),
      }
    );

    return res.status(500).json({
      error: apiError.message,
      type: apiError.type,
    });
  }
}
```

## Error Type Handling

### Specific Error Types

```typescript
// Handle different error types specifically
function processFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    // File system errors
    if (error.code === "ENOENT") {
      return wrapError(
        "FileNotFoundError",
        error,
        `File not found: ${filePath}`,
        {
          filePath,
          operation: "read",
          errorCode: error.code,
        }
      );
    }

    if (error.code === "EACCES") {
      return wrapError(
        "FilePermissionError",
        error,
        `Permission denied: ${filePath}`,
        {
          filePath,
          operation: "read",
          errorCode: error.code,
        }
      );
    }

    // JSON parsing errors
    if (error instanceof SyntaxError) {
      return wrapError(
        "JsonParseError",
        error,
        `Invalid JSON in file: ${filePath}`,
        {
          filePath,
          operation: "parse",
          syntaxError: error.message,
        }
      );
    }

    // Generic file processing error
    return wrapError(
      "FileProcessingError",
      error,
      `Failed to process file: ${filePath}`,
      { filePath }
    );
  }
}
```

### Custom Error Classes

```typescript
// Working with custom error classes
class ValidationError extends Error {
  constructor(message: string, public field: string, public value: unknown) {
    super(message);
    this.name = "ValidationError";
  }
}

class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

function handleCustomErrors(error: unknown) {
  if (error instanceof ValidationError) {
    return wrapError("FormValidationError", error, "Form validation failed", {
      field: error.field,
      value: error.value,
      validationType: "client-side",
    });
  }

  if (error instanceof NetworkError) {
    return wrapError("ApiConnectionError", error, "API connection failed", {
      endpoint: error.endpoint,
      statusCode: error.statusCode,
      retryable: error.statusCode >= 500,
    });
  }

  return wrapError("UnhandledError", error, "Unhandled error type");
}
```

## Performance Optimization

### Minimal Wrapping

```typescript
// Use minimal error mode for performance-critical paths
configure({ minimalErrors: true });

function performantErrorWrapping(cause: unknown) {
  // This will create minimal TryError objects
  return wrapError("FastError", cause, "Performance-critical error");
}

// Conditional context for hot paths
function conditionalContextWrapping(
  cause: unknown,
  includeContext: boolean = false
) {
  if (includeContext) {
    return wrapError("DetailedError", cause, "Error with full context", {
      timestamp: Date.now(),
      stack: new Error().stack,
      memory: process.memoryUsage(),
    });
  }

  // Minimal wrapping for performance
  return wrapError("SimpleError", cause, "Simple error");
}
```

### Lazy Context Evaluation

```typescript
// Expensive context computation only when needed
function wrapWithLazyContext(
  cause: unknown,
  computeExpensiveContext: () => Record<string, unknown>
) {
  // Check if we're in debug mode or error will be logged
  const shouldIncludeContext =
    process.env.NODE_ENV === "development" || process.env.DEBUG === "true";

  return wrapError(
    "ContextualError",
    cause,
    "Error with conditional context",
    shouldIncludeContext ? computeExpensiveContext() : { minimal: true }
  );
}

// Usage
function expensiveOperation() {
  try {
    return performComplexCalculation();
  } catch (error) {
    return wrapWithLazyContext(error, () => ({
      systemMetrics: gatherSystemMetrics(),
      performanceData: gatherPerformanceData(),
      debugTrace: gatherDebugTrace(),
    }));
  }
}
```

## Testing Strategies

### Unit Testing

```typescript
describe("wrapError", () => {
  it("should wrap Error instances correctly", () => {
    const originalError = new Error("Original message");
    const wrapped = wrapError("TestError", originalError);

    expect(wrapped.type).toBe("TestError");
    expect(wrapped.message).toBe("Original message");
    expect(wrapped.cause).toBe(originalError);
    expect(isTryError(wrapped)).toBe(true);
  });

  it("should handle string errors", () => {
    const stringError = "String error message";
    const wrapped = wrapError("StringError", stringError);

    expect(wrapped.type).toBe("StringError");
    expect(wrapped.message).toBe("String error message");
    expect(wrapped.cause).toBe(stringError);
  });

  it("should use custom message when provided", () => {
    const originalError = new Error("Original");
    const wrapped = wrapError("CustomError", originalError, "Custom message");

    expect(wrapped.message).toBe("Custom message");
    expect(wrapped.cause).toBe(originalError);
  });

  it("should include context", () => {
    const context = { key: "value" };
    const wrapped = wrapError(
      "ContextError",
      new Error("test"),
      undefined,
      context
    );

    expect(wrapped.context).toEqual(context);
  });

  it("should handle unknown error types", () => {
    const unknownError = { weird: "object" };
    const wrapped = wrapError("UnknownError", unknownError);

    expect(wrapped.type).toBe("UnknownError");
    expect(wrapped.message).toBe("Unknown error occurred");
    expect(wrapped.cause).toBe(unknownError);
  });
});
```

### Integration Testing

```typescript
describe("wrapError integration", () => {
  it("should work with real API errors", async () => {
    // Mock failed API call
    nock("https://api.example.com")
      .get("/users/123")
      .replyWithError("Network error");

    try {
      await fetch("https://api.example.com/users/123");
    } catch (error) {
      const wrapped = wrapError("ApiError", error, "Failed to fetch user");

      expect(wrapped.type).toBe("ApiError");
      expect(wrapped.message).toBe("Failed to fetch user");
      expect(wrapped.cause).toBe(error);
    }
  });

  it("should preserve stack traces", () => {
    function throwingFunction() {
      throw new Error("Deep error");
    }

    function wrapperFunction() {
      try {
        throwingFunction();
      } catch (error) {
        return wrapError("WrapperError", error);
      }
    }

    const result = wrapperFunction();

    expect(isTryError(result)).toBe(true);
    expect(result.cause instanceof Error).toBe(true);
    expect(result.cause.stack).toContain("throwingFunction");
  });
});
```

### Property-Based Testing

```typescript
import { fc } from "fast-check";

describe("wrapError property tests", () => {
  it("should always preserve the cause", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.anything(),
        fc.option(fc.string()),
        fc.option(fc.record(fc.string(), fc.anything())),
        (type, cause, message, context) => {
          const wrapped = wrapError(type, cause, message, context);

          expect(wrapped.cause).toBe(cause);
          expect(wrapped.type).toBe(type);
          expect(isTryError(wrapped)).toBe(true);
        }
      )
    );
  });

  it("should extract messages correctly", () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (type, errorMessage) => {
        const error = new Error(errorMessage);
        const wrapped = wrapError(type, error);

        expect(wrapped.message).toBe(errorMessage);
        expect(wrapped.cause).toBe(error);
      })
    );
  });
});
```

## Common Patterns and Best Practices

### Error Transformation Pipeline

```typescript
// Create reusable error transformation pipeline
class ErrorTransformer {
  private transformers: Array<(error: unknown) => TryError | null> = [];

  addTransformer(transformer: (error: unknown) => TryError | null) {
    this.transformers.push(transformer);
    return this;
  }

  transform(error: unknown): TryError {
    for (const transformer of this.transformers) {
      const result = transformer(error);
      if (result) return result;
    }

    // Fallback
    return wrapError("UnhandledError", error, "No transformer matched");
  }
}

// Usage
const errorTransformer = new ErrorTransformer()
  .addTransformer((error) => {
    if (error instanceof ValidationError) {
      return wrapError("FormError", error, "Form validation failed");
    }
    return null;
  })
  .addTransformer((error) => {
    if (error.name === "NetworkError") {
      return wrapError(
        "ConnectivityError",
        error,
        "Network connectivity issue"
      );
    }
    return null;
  })
  .addTransformer((error) => {
    if (error.code === "ENOENT") {
      return wrapError("FileNotFoundError", error, "Required file missing");
    }
    return null;
  });

// Transform any error
const transformedError = errorTransformer.transform(someError);
```

### Error Recovery Strategies

```typescript
// Use wrapError in error recovery
async function resilientOperation(data: any, maxRetries: number = 3) {
  let lastError: TryError | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await performOperation(data);
    } catch (error) {
      lastError = wrapError(
        "OperationAttemptError",
        error,
        `Operation failed on attempt ${attempt}`,
        {
          attempt,
          maxRetries,
          data: sanitizeDataForLogging(data),
          timestamp: Date.now(),
        }
      );

      // Don't retry on certain error types
      if (isNonRetryableError(error)) {
        break;
      }

      // Wait before retry
      if (attempt < maxRetries) {
        await wait(Math.pow(2, attempt) * 1000);
      }
    }
  }

  // Final error with complete context
  return wrapError(
    "OperationFailedError",
    lastError,
    "Operation failed after all retry attempts",
    {
      totalAttempts: maxRetries,
      finalError: lastError,
    }
  );
}
```

## Edge Cases and Gotchas

### Circular References

```typescript
// Handle potential circular references in causes
function safeWrapError(type: string, cause: unknown, message?: string) {
  let safeContext: Record<string, unknown> | undefined;

  try {
    // Test if cause can be serialized (no circular refs)
    JSON.stringify(cause);
    safeContext = { originalCause: cause };
  } catch (circularError) {
    // Handle circular reference
    safeContext = {
      causeType: typeof cause,
      causeName: cause?.constructor?.name || "unknown",
      circularReference: true,
    };
  }

  return wrapError(type, cause, message, safeContext);
}
```

### Error Mutation

```typescript
// Be careful with mutable error objects
function wrapMutableError(cause: unknown) {
  // If cause is mutable, consider freezing it
  if (typeof cause === "object" && cause !== null) {
    try {
      Object.freeze(cause);
    } catch {
      // Ignore if already frozen or non-configurable
    }
  }

  return wrapError("FrozenError", cause, "Error with frozen cause");
}
```

### Large Error Objects

```typescript
// Handle large error objects efficiently
function wrapLargeError(cause: unknown) {
  const causeSize = JSON.stringify(cause).length;

  if (causeSize > 10000) {
    // 10KB threshold
    // Store reference and minimal info
    const errorId = generateErrorId();
    largeErrorStorage.set(errorId, cause);

    return wrapError(
      "LargeError",
      { errorId, size: causeSize },
      "Large error object stored separately",
      { errorId, originalSize: causeSize }
    );
  }

  return wrapError("StandardError", cause);
}
```

## Common Pitfalls

### 1. Losing Original Stack Traces

```typescript
// BAD: Stack trace is lost
try {
  complexOperation();
} catch (error) {
  throw wrapError("ProcessingError", error.message); // Lost original error!
}

// GOOD: Preserve original error
try {
  complexOperation();
} catch (error) {
  return wrapError("ProcessingError", error); // Original error preserved
}
```

### 2. Double Wrapping

```typescript
// BAD: Wrapping already wrapped errors
function doubleWrap(error: unknown) {
  const wrapped = wrapError("FirstWrap", error);
  return wrapError("SecondWrap", wrapped); // Creates confusing chain
}

// GOOD: Check if already wrapped
function smartWrap(error: unknown) {
  if (isTryError(error)) {
    return error; // Already wrapped
  }
  return wrapError("SmartWrap", error);
}
```

### 3. Context Information Loss

```typescript
// BAD: Losing important context
function processWithoutContext(data: any) {
  try {
    return validateData(data);
  } catch (error) {
    return wrapError("ValidationError", error); // Lost data context
  }
}

// GOOD: Preserve context
function processWithContext(data: any) {
  try {
    return validateData(data);
  } catch (error) {
    return wrapError("ValidationError", error, "Data validation failed", {
      dataKeys: Object.keys(data),
      dataSize: JSON.stringify(data).length,
      timestamp: Date.now(),
    });
  }
}
```

## See Also

- [fromThrown() Function](./fromThrown-deep-dive.md)
- [createError() Function](./create-error-deep-dive.md)
- [trySync() Function](./trySync-deep-dive.md)
- [tryAsync() Function](./tryAsync-deep-dive.md)
- [Error Chaining Patterns](./error-chaining-patterns.md)
- [Error Recovery Strategies](./error-recovery-strategies.md)
- [JavaScript Error Types](./javascript-error-types.md)
- [Testing Error Handling](./testing-error-handling.md)
