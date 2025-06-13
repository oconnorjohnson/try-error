import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/docs/code-block";

export default function ErrorFactoriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Error Factory API Reference</h1>
        <p className="text-xl text-muted-foreground">
          Complete reference for all error factory functions and their usage
          patterns.
        </p>
      </div>

      <Alert>
        <AlertDescription>
          Error factories provide a consistent way to create typed errors with
          rich context. They're designed to be both developer-friendly and
          type-safe.
        </AlertDescription>
      </Alert>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-3">
          ✅ New: Improved Ergonomic Error Factories
        </h3>
        <p className="text-green-700 mb-3">
          We've added more intuitive error factory functions with better
          parameter orders:
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-800 mb-2">
              Validation Errors (Simplified)
            </h4>
            <CodeBlock language="typescript" className="mb-2">
              {`// ✅ NEW: Simple field validation
const error = validationError('email', 'invalid', 'Must be a valid email address', { 
  value: 'invalid-email' 
});

// ✅ NEW: Multi-field validation
const formError = fieldValidationError({
  email: ['Must be a valid email address'],
  password: ['Must be at least 8 characters', 'Must contain a number']
}, 'FORM_VALIDATION_ERROR');`}
            </CodeBlock>
          </div>

          <div>
            <h4 className="font-semibold text-green-800 mb-2">
              Amount Errors (Simplified)
            </h4>
            <CodeBlock language="typescript" className="mb-2">
              {`// ✅ NEW: Intuitive amount error with context
const error = amountError(
  150,        // requested amount
  100,        // available amount  
  'insufficient', 
  'Insufficient funds available'
);

console.log(error.context.requestedAmount); // 150
console.log(error.context.availableAmount); // 100`}
            </CodeBlock>
          </div>

          <div>
            <h4 className="font-semibold text-green-800 mb-2">
              External Service Errors (Simplified)
            </h4>
            <CodeBlock language="typescript" className="mb-2">
              {`// ✅ NEW: Clear service error creation
const error = externalError('API', 'failed', 'Service unavailable', { 
  transactionId: 'tx_123',
  statusCode: 503 
});

// ✅ NEW: Quick entity errors
const userError = entityError('user', 'user_123', 'User not found');`}
            </CodeBlock>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> The original factory functions (
            <code>createValidationError</code>, <code>createAmountError</code>,
            etc.) are still available for backward compatibility. Use whichever
            style you prefer!
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>createError</Badge>
              Core Error Factory
            </CardTitle>
            <CardDescription>
              The primary function for creating custom try-error instances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock language="typescript" title="createError API">
              {`function createError<T extends string = string>(options: {
  type: T;                              // Error category (required)
  message: string;                      // Human-readable description (required)
  cause?: unknown;                      // Underlying error (optional)
  context?: Record<string, unknown>;    // Additional debug data (optional)
  timestamp?: number;                   // When error occurred (optional)
  source?: string;                      // Source location (optional)
}): TryError<T>

// Examples
const validationError = createError({
  type: 'ValidationError',
  message: 'Email address is required'
});

const detailedError = createError({
  type: 'DatabaseError',
  message: 'Connection failed',
  context: { host: 'localhost', port: 5432, retryAttempt: 3 },
  cause: originalError
});`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>wrapError</Badge>
              Error Wrapper Factory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock language="typescript" title="wrapError API">
              {`function wrapError<T extends string>(
  type: T,
  cause: unknown,
  message?: string,
  context?: Record<string, unknown>
): TryError<T>

// Examples
const wrappedError = wrapError('NetworkError', originalError, 'API call failed');

const detailedWrapper = wrapError(
  'ServiceError',
  error,
  'User service unavailable',
  { service: 'user-api', endpoint: '/users/123' }
);`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>fromThrown</Badge>
              Exception Converter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock language="typescript" title="fromThrown API">
              {`function fromThrown(
  error: unknown,
  context?: Record<string, unknown>
): TryError

// Automatically detects error types:
fromThrown(new TypeError('...'))      // -> TryError<'TypeError'>
fromThrown(new SyntaxError('...'))    // -> TryError<'SyntaxError'>
fromThrown(new Error('...'))          // -> TryError<'Error'>
fromThrown('string error')            // -> TryError<'StringError'>
fromThrown({ weird: 'object' })       // -> TryError<'UnknownError'>

// With context
const convertedError = fromThrown(caughtError, { 
  operation: 'parseJson',
  input: jsonString 
});`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain-Specific Factories</CardTitle>
            <CardDescription>
              Pre-built factories for common scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock
              language="typescript"
              title="Common error factory patterns"
            >
              {`// Validation errors
function createValidationError(field: string, rule: string, value?: unknown) {
  return createError({
    type: 'ValidationError' as const,
    message: \`Validation failed for field '\${field}': \${rule}\`,
    context: { field, rule, value }
  });
}

// Network errors
function createNetworkError(endpoint: string, status?: number) {
  return createError({
    type: 'NetworkError' as const,
    message: status ? \`\${endpoint} failed with \${status}\` : \`\${endpoint} failed\`,
    context: { endpoint, status }
  });
}

// Entity errors
function createNotFoundError(entityType: string, id: string | number) {
  return createError({
    type: 'NotFoundError' as const,
    message: \`\${entityType} with id '\${id}' not found\`,
    context: { entityType, id }
  });
}

// Business logic errors
function createBusinessRuleError(rule: string, details?: string) {
  return createError({
    type: 'BusinessRuleError' as const,
    message: \`Business rule violated: \${rule}\`,
    context: { rule, details }
  });
}`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Factory Best Practices</CardTitle>
            <CardDescription>
              Guidelines for creating effective error factories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">
                1. Use Descriptive Type Names
              </h4>
              <CodeBlock language="typescript" title="Good vs bad error types">
                {`// ✅ Good: Descriptive and specific
createError({ type: 'EmailValidationError', message: '...' });
createError({ type: 'DatabaseConnectionTimeout', message: '...' });
createError({ type: 'InsufficientInventoryError', message: '...' });

// ❌ Bad: Generic and unclear
createError({ type: 'Error', message: '...' });
createError({ type: 'ValidationError', message: '...' }); // Too generic
createError({ type: 'Err', message: '...' }); // Abbreviated`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                2. Include Actionable Context
              </h4>
              <CodeBlock language="typescript" title="Rich error context">
                {`// ✅ Good: Includes actionable debugging information
createError({
  type: 'ApiValidationError',
  message: 'Request validation failed',
  context: {
    endpoint: '/api/users',
    method: 'POST',
    validationErrors: {
      email: 'Invalid format',
      age: 'Must be between 18 and 120'
    },
    requestId: 'req_123456'
  }
});

// ❌ Bad: No context for debugging
createError({
  type: 'ValidationError',
  message: 'Validation failed'
});`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                3. Create Domain-Specific Factories
              </h4>
              <CodeBlock language="typescript" title="Custom factory patterns">
                {`// ✅ Create reusable factories for your domain
class UserErrorFactory {
  static notFound(userId: string) {
    return createError({
      type: 'UserNotFoundError' as const,
      message: \`User with ID \${userId} not found\`,
      context: { userId, entity: 'User' }
    });
  }

  static alreadyExists(email: string) {
    return createError({
      type: 'UserAlreadyExistsError' as const,
      message: \`User with email \${email} already exists\`,
      context: { email, entity: 'User' }
    });
  }

  static invalidCredentials() {
    return createError({
      type: 'InvalidCredentialsError' as const,
      message: 'Invalid email or password',
      context: { entity: 'User', action: 'authenticate' }
    });
  }
}

// Usage
const user = await tryAsync(() => findUser(userId));
if (!user) {
  return UserErrorFactory.notFound(userId);
}`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                4. Type-Safe Factory Functions
              </h4>
              <CodeBlock language="typescript" title="Type-safe error creation">
                {`// ✅ Use const assertions for literal types
function createApiError(status: number, message: string) {
  const type = status >= 500 
    ? 'ServerError' as const
    : status >= 400 
    ? 'ClientError' as const
    : 'ApiError' as const;
    
  return createError({
    type,
    message,
    context: { status, category: status >= 500 ? 'server' : 'client' }
  });
}

// ✅ Use union types for predefined error categories
type ValidationErrorType = 
  | 'RequiredFieldError'
  | 'FormatValidationError' 
  | 'RangeValidationError'
  | 'CustomValidationError';

function createValidationError(
  type: ValidationErrorType,
  field: string,
  message: string
) {
  return createError({
    type,
    message: \`\${type}: \${message}\`,
    context: { field, type, message }
  });
}

// Usage
const apiError = createApiError(404, 'Resource not found');
const validationError = createValidationError('email', 'Invalid format', 'The email is not valid');`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
