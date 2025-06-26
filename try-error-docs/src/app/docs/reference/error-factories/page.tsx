import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/EnhancedCodeBlock";

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

      {/* Philosophy and Overview Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Factory Philosophy</CardTitle>
            <CardDescription>
              Understanding the design principles behind tryError factories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Why Error Factories?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Error factories solve three core problems in JavaScript error
                handling:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-1">
                    Consistency
                  </h5>
                  <p className="text-xs text-blue-700">
                    Standardized error structure across your entire application
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-1">
                    Type Safety
                  </h5>
                  <p className="text-xs text-green-700">
                    Full TypeScript support with discriminated unions
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-purple-800 mb-1">
                    Rich Context
                  </h5>
                  <p className="text-xs text-purple-700">
                    Capture debugging information at the point of failure
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Design Principles</h4>
              <div className="bg-slate-50 p-4 rounded-lg">
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>
                      <strong>Progressive Enhancement:</strong> Start simple,
                      add complexity as needed
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>
                      <strong>Ergonomic API:</strong> Natural parameter order,
                      intuitive naming
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>
                      <strong>Context-Rich:</strong> Capture relevant debugging
                      information automatically
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>
                      <strong>Type-First:</strong> Leverage TypeScript's
                      discriminated unions
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Factory Methods</CardTitle>
            <CardDescription>
              Quick reference for all error factory functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">
                  Core Factories
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      createError()
                    </code>
                    <span className="text-muted-foreground">
                      Primary factory function
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      wrapError()
                    </code>
                    <span className="text-muted-foreground">
                      Wrap existing errors
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      fromThrown()
                    </code>
                    <span className="text-muted-foreground">
                      Convert thrown exceptions
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-green-600">
                  Domain-Specific Factories
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      validationError()
                    </code>
                    <span className="text-muted-foreground">
                      Field validation failures
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      amountError()
                    </code>
                    <span className="text-muted-foreground">
                      Financial/quantity errors
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      externalError()
                    </code>
                    <span className="text-muted-foreground">
                      External service failures
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      entityError()
                    </code>
                    <span className="text-muted-foreground">
                      Entity not found/conflicts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h5 className="font-semibold text-amber-800 mb-2">
                Choosing the Right Factory
              </h5>
              <div className="text-sm text-amber-700 space-y-1">
                <p>
                  • <strong>Start with domain-specific factories</strong> for
                  common use cases
                </p>
                <p>
                  • <strong>Use createError()</strong> for custom error types
                  and complex scenarios
                </p>
                <p>
                  • <strong>Use wrapError()</strong> when you need to add
                  context to existing errors
                </p>
                <p>
                  • <strong>Use fromThrown()</strong> in try/catch blocks to
                  convert exceptions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start Examples</CardTitle>
            <CardDescription>
              Common patterns to get you started immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Simple Validation</h4>
              <CodeBlock language="typescript" title="Quick field validation">
                {`// Quick field validation
const error = validationError('email', 'required', 'Email is required');

// With additional context
const error = validationError('age', 'range', 'Age must be 18-65', {
  min: 18,
  max: 65,
  provided: 16
});`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">API Error Handling</h4>
              <CodeBlock language="typescript" title="External service errors">
                {`// External service failure
const error = externalError('PaymentAPI', 'timeout', 'Payment service unavailable');

// With request context
const error = externalError('UserAPI', 'not_found', 'User not found', {
  userId: '123',
  endpoint: '/api/users/123'
});`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Business Logic Errors</h4>
              <CodeBlock language="typescript" title="Amount and entity errors">
                {`// Insufficient funds
const error = amountError(150, 100, 'insufficient', 'Insufficient balance');

// Entity conflicts
const error = entityError('user', 'john@example.com', 'User already exists');`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <CodeBlock
              language="typescript"
              title="Simplified validation errors"
            >
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
            <CodeBlock language="typescript" title="Simplified amount errors">
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
            <CodeBlock
              language="typescript"
              title="Simplified external service errors"
            >
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
              The primary function for creating custom tryError instances
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">Important</Badge>
              Working with Error Context
            </CardTitle>
            <CardDescription>
              Understanding and safely accessing error context data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">
                Why Context is Typed as `unknown`
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Error context is intentionally typed as `unknown` for type
                safety. Since errors can originate from anywhere in your
                application with different context structures, TypeScript can't
                guarantee the shape of the context data.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Design Decision:</strong> This forces you to validate
                  context before accessing properties, preventing runtime errors
                  from unexpected context structures.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Type-Safe Context Access Patterns
              </h4>
              <CodeBlock
                language="typescript"
                title="1. Type guards for known context"
              >
                {`// Define your expected context structure
interface ValidationContext {
  field: string;
  value: unknown;
  rule: string;
}

// Create a type guard
function isValidationContext(context: unknown): context is ValidationContext {
  return typeof context === 'object' && 
         context !== null && 
         'field' in context &&
         'rule' in context &&
         typeof (context as any).field === 'string';
}

// Safe usage
const result = trySync(() => validateEmail(email));
if (isTryError(result) && isValidationContext(result.context)) {
  // ✅ Now context is properly typed
  console.log(\`Field \${result.context.field} failed rule: \${result.context.rule}\`);
}`}
              </CodeBlock>

              <CodeBlock
                language="typescript"
                title="2. Type assertion with validation"
              >
                {`// Quick check with optional properties
function handleValidationError(error: TryError) {
  const context = error.context as { field?: string; rule?: string } | undefined;
  
  if (context?.field && context?.rule) {
    return \`Validation failed for \${context.field}: \${context.rule}\`;
  }
  
  return \`Validation failed: \${error.message}\`;
}`}
              </CodeBlock>

              <CodeBlock
                language="typescript"
                title="3. Generic context utility"
              >
                {`// Reusable helper for safe context access
function getContextValue<T>(
  error: TryError, 
  key: string, 
  defaultValue: T
): T {
  if (typeof error.context === 'object' && 
      error.context !== null && 
      key in error.context) {
    return (error.context as any)[key] ?? defaultValue;
  }
  return defaultValue;
}

// Usage
const field = getContextValue(error, 'field', 'unknown');
const status = getContextValue(error, 'status', 500);`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Best Practices for Context Design
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-semibold text-green-600 mb-2">
                    ✅ Do
                  </h5>
                  <ul className="text-sm space-y-1">
                    <li>• Use consistent context structure within domains</li>
                    <li>• Document your context interfaces</li>
                    <li>• Include debug-relevant information</li>
                    <li>• Create type guards for validation</li>
                    <li>• Provide fallback values</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-red-600 mb-2">
                    ❌ Don't
                  </h5>
                  <ul className="text-sm space-y-1">
                    <li>• Access context properties directly</li>
                    <li>• Assume context structure without validation</li>
                    <li>• Include sensitive data in context</li>
                    <li>• Create overly complex context structures</li>
                    <li>• Ignore context validation errors</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Domain-Specific Context Patterns
              </h4>
              <CodeBlock
                language="typescript"
                title="Consistent context interfaces"
              >
                {`// Define context interfaces for your domain
export interface ApiErrorContext {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status?: number;
  requestId?: string;
}

export interface ValidationErrorContext {
  field: string;
  value: unknown;
  rule: string;
  constraints?: Record<string, unknown>;
}

export interface BusinessErrorContext {
  entity: string;
  operation: string;
  businessRule: string;
  metadata?: Record<string, unknown>;
}

// Create factory functions with typed context
export function createApiError(
  message: string, 
  context: ApiErrorContext
): TryError<'ApiError'> {
  return createError({
    type: 'ApiError' as const,
    message,
    context
  });
}

// Type guards for each context type
export function isApiErrorContext(context: unknown): context is ApiErrorContext {
  return typeof context === 'object' && 
         context !== null && 
         'endpoint' in context &&
         'method' in context;
}

// Usage
const error = createApiError('Failed to fetch user', {
  endpoint: '/api/users/123',
  method: 'GET',
  status: 404,
  requestId: 'req_abc123'
});

if (isTryError(error) && isApiErrorContext(error.context)) {
  // ✅ Fully typed access to context
  console.log(\`\${error.context.method} \${error.context.endpoint} failed\`);
}`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
