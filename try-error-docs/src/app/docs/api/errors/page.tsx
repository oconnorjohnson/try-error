import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function ErrorAPIPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Error Creation API
        </h1>
        <p className="text-xl text-slate-600">
          API reference for creating and working with TryError objects
        </p>
      </div>

      <div className="space-y-8">
        {/* createTryError */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            createTryError
          </h2>

          <p className="text-slate-600 mb-4">
            The primary function for creating TryError instances with rich
            context and metadata.
          </p>

          <CodeBlock
            language="typescript"
            title="createTryError Function Signature"
            showLineNumbers={true}
            className="mb-4"
          >
            {`function createTryError<T = any>(
  type: string,
  message: string,
  context?: T,
  cause?: Error | TryError
): TryError<T>`}
          </CodeBlock>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Parameters
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>
                    •{" "}
                    <code className="bg-slate-200 px-2 py-1 rounded">type</code>{" "}
                    - Error classification (e.g., 'ValidationError',
                    'NetworkError')
                  </li>
                  <li>
                    •{" "}
                    <code className="bg-slate-200 px-2 py-1 rounded">
                      message
                    </code>{" "}
                    - Human-readable error description
                  </li>
                  <li>
                    •{" "}
                    <code className="bg-slate-200 px-2 py-1 rounded">
                      context
                    </code>{" "}
                    - Additional error context data (optional)
                  </li>
                  <li>
                    •{" "}
                    <code className="bg-slate-200 px-2 py-1 rounded">
                      cause
                    </code>{" "}
                    - Original error that caused this error (optional)
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Basic Usage
              </h3>
              <CodeBlock
                language="typescript"
                title="Basic Error Creation"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { createTryError } from 'try-error';

// Simple error
const error = createTryError('ValidationError', 'Email is required');

// Error with context
const errorWithContext = createTryError(
  'ValidationError', 
  'Invalid email format',
  {
    field: 'email',
    value: 'invalid-email',
    rule: 'email_format'
  }
);

// Error with cause
const errorWithCause = createTryError(
  'NetworkError',
  'Failed to fetch user data',
  { userId: '123', url: '/api/users/123' },
  originalNetworkError
);`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Advanced Context
              </h3>
              <CodeBlock
                language="typescript"
                title="Rich Error Context"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Complex context with multiple data types
const complexError = createTryError(
  'ProcessingError',
  'Failed to process user registration',
  {
    step: 'email_verification',
    userId: '123',
    email: 'user@example.com',
    attempts: 3,
    lastAttempt: new Date().toISOString(),
    validationErrors: [
      { field: 'password', message: 'Too weak' },
      { field: 'age', message: 'Must be 18+' }
    ],
    metadata: {
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1',
      sessionId: 'sess_abc123'
    }
  }
);

// Type-safe context
interface ValidationContext {
  field: string;
  value: unknown;
  rule: string;
  expected?: string;
}

const typedError = createTryError<ValidationContext>(
  'ValidationError',
  'Validation failed',
  {
    field: 'age',
    value: 15,
    rule: 'minimum_age',
    expected: '18 or older'
  }
);`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Error Factories */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Factories
          </h2>

          <p className="text-slate-600 mb-4">
            Pre-built factory functions for common error types with consistent
            structure and context.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Validation Errors
              </h3>
              <CodeBlock
                language="typescript"
                title="Validation Error Factories"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { createValidationError, createFieldError } from 'try-error';

// Field validation error
const fieldError = createFieldError('email', 'user@invalid', 'Invalid email format');

// Required field error
const requiredError = createValidationError('Name is required', {
  field: 'name',
  rule: 'required'
});

// Custom validation error
const customError = createValidationError('Password too weak', {
  field: 'password',
  rule: 'strength',
  requirements: ['8+ characters', 'uppercase', 'lowercase', 'number'],
  missing: ['uppercase', 'number']
});

// Multiple field errors
const multipleErrors = createValidationError('Multiple validation failures', {
  fields: [
    { field: 'email', message: 'Invalid format' },
    { field: 'age', message: 'Must be 18+' },
    { field: 'phone', message: 'Invalid phone number' }
  ]
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Network Errors
              </h3>
              <CodeBlock
                language="typescript"
                title="Network Error Factories"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { createNetworkError, createHttpError, createTimeoutError } from 'try-error';

// HTTP error
const httpError = createHttpError(404, 'User not found', {
  url: '/api/users/123',
  method: 'GET',
  headers: { 'Authorization': 'Bearer ...' }
});

// Network timeout
const timeoutError = createTimeoutError('/api/slow-endpoint', 5000);

// Connection error
const connectionError = createNetworkError('Connection refused', {
  host: 'api.example.com',
  port: 443,
  protocol: 'https'
});

// Rate limit error
const rateLimitError = createHttpError(429, 'Rate limit exceeded', {
  limit: 100,
  window: '1h',
  remaining: 0,
  resetTime: new Date(Date.now() + 3600000).toISOString()
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Authentication & Authorization
              </h3>
              <CodeBlock
                language="typescript"
                title="Auth Error Factories"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { 
  createAuthError, 
  createPermissionError, 
  createTokenError 
} from 'try-error';

// Authentication error
const authError = createAuthError('Invalid credentials', {
  username: 'user@example.com',
  provider: 'local',
  attempts: 3
});

// Token expiration
const tokenError = createTokenError('Token expired', {
  tokenType: 'access_token',
  expiresAt: '2024-01-01T00:00:00Z',
  issuedAt: '2024-01-01T00:00:00Z'
});

// Permission error
const permissionError = createPermissionError('Insufficient permissions', {
  userId: '123',
  resource: 'admin_panel',
  action: 'read',
  requiredRole: 'admin',
  userRole: 'user'
});

// Multi-factor authentication error
const mfaError = createAuthError('MFA verification required', {
  userId: '123',
  mfaMethod: 'totp',
  challenge: 'mfa_challenge_abc123'
});`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Error Utilities */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Utilities
          </h2>

          <p className="text-slate-600 mb-4">
            Utility functions for working with TryError objects, including
            transformation, serialization, and analysis.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Transformation
              </h3>
              <CodeBlock
                language="typescript"
                title="Error Transformation Utilities"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { 
  enrichError, 
  sanitizeError, 
  transformError,
  chainError 
} from 'try-error';

// Enrich error with additional context
const enrichedError = enrichError(originalError, {
  userId: '123',
  requestId: 'req_abc123',
  timestamp: Date.now()
});

// Sanitize error for client response
const sanitizedError = sanitizeError(error, {
  removeFields: ['password', 'token', 'secret'],
  truncateStrings: 100,
  includeStack: false
});

// Transform error type
const transformedError = transformError(error, {
  from: 'DatabaseError',
  to: 'ServiceUnavailableError',
  message: 'Service temporarily unavailable'
});

// Chain errors (create error hierarchy)
const chainedError = chainError(
  createTryError('ProcessingError', 'Failed to process request'),
  originalDatabaseError
);`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Serialization
              </h3>
              <CodeBlock
                language="typescript"
                title="Error Serialization Utilities"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { 
  serializeError, 
  deserializeError, 
  toJSON,
  fromJSON 
} from 'try-error';

// Serialize for logging
const serialized = serializeError(error, {
  includeStack: true,
  includeContext: true,
  includeSource: true
});

// Serialize for client response
const clientSafe = serializeError(error, {
  includeStack: false,
  includeContext: false,
  sanitize: true
});

// JSON serialization
const json = toJSON(error);
const restored = fromJSON(json);

// Custom serialization
const customSerialized = serializeError(error, {
  transform: (err) => ({
    id: generateErrorId(),
    type: err.type,
    message: err.message,
    timestamp: err.timestamp,
    severity: getSeverity(err.type),
    category: getCategory(err.type)
  })
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Analysis
              </h3>
              <CodeBlock
                language="typescript"
                title="Error Analysis Utilities"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { 
  isRetryable, 
  getSeverity, 
  getCategory,
  extractCause,
  getErrorChain 
} from 'try-error';

// Check if error is retryable
const canRetry = isRetryable(error);

// Get error severity
const severity = getSeverity(error); // 'low' | 'medium' | 'high' | 'critical'

// Get error category
const category = getCategory(error); // 'validation' | 'network' | 'auth' | 'system'

// Extract root cause
const rootCause = extractCause(error);

// Get full error chain
const errorChain = getErrorChain(error);

// Error pattern matching
const isUserError = matchesPattern(error, {
  types: ['ValidationError', 'AuthenticationError'],
  severity: ['low', 'medium']
});

// Error aggregation
const errorSummary = aggregateErrors([error1, error2, error3], {
  groupBy: 'type',
  includeCount: true,
  includeLatest: true
});`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Error Builders */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Builders
          </h2>

          <p className="text-slate-600 mb-4">
            Fluent builder pattern for creating complex errors with method
            chaining.
          </p>

          <CodeBlock
            language="typescript"
            title="Error Builder Pattern"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { ErrorBuilder } from 'try-error';

// Fluent error building
const error = new ErrorBuilder()
  .type('ValidationError')
  .message('User registration failed')
  .context('field', 'email')
  .context('value', 'invalid-email')
  .context('rule', 'email_format')
  .severity('medium')
  .retryable(false)
  .cause(originalError)
  .build();

// Conditional building
const conditionalError = new ErrorBuilder()
  .type('ProcessingError')
  .message('Processing failed')
  .when(isDevelopment, builder => 
    builder.context('debug', { stack: true, verbose: true })
  )
  .when(isProduction, builder => 
    builder.context('errorId', generateErrorId())
  )
  .build();

// Template-based building
const templateError = ErrorBuilder
  .fromTemplate('validation')
  .field('email')
  .value('invalid@')
  .rule('email_format')
  .build();

// Batch error building
const errors = ErrorBuilder
  .batch()
  .add('ValidationError', 'Email invalid', { field: 'email' })
  .add('ValidationError', 'Age too low', { field: 'age' })
  .add('ValidationError', 'Phone invalid', { field: 'phone' })
  .buildAll();`}
          </CodeBlock>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Best Practices
          </h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Do</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Use consistent error types across your application</li>
                <li>• Include relevant context for debugging</li>
                <li>• Use factory functions for common error patterns</li>
                <li>• Chain errors to preserve error history</li>
                <li>• Sanitize errors before sending to clients</li>
                <li>• Use type-safe context interfaces</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Include sensitive data in error context</li>
                <li>• Create overly generic error messages</li>
                <li>• Ignore the original error when chaining</li>
                <li>• Use inconsistent error type naming</li>
                <li>• Include large objects in error context</li>
                <li>• Expose internal system details to users</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Error Types</h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about TryError structure and custom error types
              </p>
              <a
                href="/docs/concepts/error-types"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error Types →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Utilities API
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Utility functions for working with try-error results
              </p>
              <a
                href="/docs/api/utils"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Utils API →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
