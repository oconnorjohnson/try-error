export default function ErrorTypesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Error Types</h1>
        <p className="text-xl text-slate-600">
          Understanding TryError structure and creating custom error types
        </p>
      </div>

      <div className="space-y-8">
        {/* TryError Interface */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            TryError Interface
          </h2>

          <p className="text-slate-600 mb-4">
            All errors in try-error implement the TryError interface, providing
            rich context and debugging information:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`interface TryError {
  readonly type: 'TryError';
  readonly message: string;
  readonly stack?: string;
  readonly source: string;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;
  readonly cause?: Error | TryError;
}`}</code>
            </pre>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Properties
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">type</h4>
              <p className="text-slate-600 text-sm">
                Always{" "}
                <code className="bg-slate-200 px-1 rounded">'TryError'</code> -
                used for type discrimination
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">message</h4>
              <p className="text-slate-600 text-sm">
                Human-readable error description
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">stack</h4>
              <p className="text-slate-600 text-sm">
                Stack trace (when available) for debugging
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">source</h4>
              <p className="text-slate-600 text-sm">
                Indicates where the error originated (e.g., 'trySync',
                'tryAsync', 'custom')
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">timestamp</h4>
              <p className="text-slate-600 text-sm">
                When the error occurred (milliseconds since epoch)
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">context</h4>
              <p className="text-slate-600 text-sm">
                Additional debugging information and metadata
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">cause</h4>
              <p className="text-slate-600 text-sm">
                The original error that caused this TryError (for error
                chaining)
              </p>
            </div>
          </div>
        </section>

        {/* Creating Custom Errors */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Creating Custom Errors
          </h2>

          <p className="text-slate-600 mb-4">
            Use the{" "}
            <code className="bg-slate-100 px-2 py-1 rounded">
              createTryError
            </code>{" "}
            function to create custom errors with additional context:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { createTryError } from 'try-error';

// Basic custom error
const validationError = createTryError(
  'VALIDATION_ERROR',
  'Email format is invalid'
);

// Error with context
const dbError = createTryError(
  'DATABASE_ERROR',
  'Failed to connect to database',
  {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    retryAttempt: 3
  }
);

// Error with cause (error chaining)
const parseError = createTryError(
  'CONFIG_PARSE_ERROR',
  'Failed to parse configuration file',
  { filePath: './config.json' },
  originalError // The original Error that was caught
);`}</code>
            </pre>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            createTryError Signature
          </h3>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`function createTryError(
  source: string,
  message: string,
  context?: Record<string, unknown>,
  cause?: Error | TryError
): TryError`}</code>
            </pre>
          </div>
        </section>

        {/* Error Categories */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Common Error Categories
          </h2>

          <p className="text-slate-600 mb-4">
            Here are some common patterns for categorizing errors:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// Network errors
const networkError = createTryError(
  'NETWORK_ERROR',
  'Request timeout after 5000ms',
  { url: '/api/users', timeout: 5000 }
);

// Validation errors
const validationError = createTryError(
  'VALIDATION_ERROR',
  'Invalid email format',
  { field: 'email', value: 'invalid-email' }
);

// Authentication errors
const authError = createTryError(
  'AUTH_ERROR',
  'Invalid credentials',
  { userId: '123', action: 'login' }
);

// Business logic errors
const businessError = createTryError(
  'BUSINESS_ERROR',
  'Insufficient funds for transaction',
  { 
    accountId: 'acc_123',
    requestedAmount: 1000,
    availableBalance: 500
  }
);

// System errors
const systemError = createTryError(
  'SYSTEM_ERROR',
  'Database connection failed',
  { 
    service: 'postgresql',
    host: 'db.example.com',
    port: 5432
  }
);`}</code>
            </pre>
          </div>
        </section>

        {/* Error Factories */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Factories
          </h2>

          <p className="text-slate-600 mb-4">
            Create factory functions for consistent error creation across your
            application:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// Error factory for validation errors
export function createValidationError(
  field: string,
  value: unknown,
  reason: string
): TryError {
  return createTryError(
    'VALIDATION_ERROR',
    \`Validation failed for \${field}: \${reason}\`,
    { field, value, reason }
  );
}

// Error factory for API errors
export function createApiError(
  endpoint: string,
  status: number,
  statusText: string
): TryError {
  return createTryError(
    'API_ERROR',
    \`API request failed: \${status} \${statusText}\`,
    { endpoint, status, statusText }
  );
}

// Error factory for database errors
export function createDatabaseError(
  operation: string,
  table: string,
  cause?: Error
): TryError {
  return createTryError(
    'DATABASE_ERROR',
    \`Database \${operation} failed on table \${table}\`,
    { operation, table },
    cause
  );
}

// Usage
const emailError = createValidationError(
  'email',
  'not-an-email',
  'must contain @ symbol'
);

const apiError = createApiError('/api/users', 404, 'Not Found');

const dbError = createDatabaseError('INSERT', 'users', originalError);`}</code>
            </pre>
          </div>
        </section>

        {/* Error Matching */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Matching and Handling
          </h2>

          <p className="text-slate-600 mb-4">
            Use the source property to handle different types of errors:
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { tryAsync, isTryError } from 'try-error';

async function handleUserOperation(userId: string) {
  const result = await tryAsync(() => fetchUser(userId));
  
  if (isTryError(result)) {
    switch (result.source) {
      case 'NETWORK_ERROR':
        console.error('Network issue:', result.message);
        // Maybe retry the operation
        break;
        
      case 'VALIDATION_ERROR':
        console.error('Invalid input:', result.message);
        // Show user-friendly error message
        break;
        
      case 'AUTH_ERROR':
        console.error('Authentication failed:', result.message);
        // Redirect to login
        break;
        
      default:
        console.error('Unexpected error:', result.message);
        // Generic error handling
    }
    
    return null;
  }
  
  return result;
}

// You can also check error context
function handleError(error: TryError) {
  if (error.source === 'VALIDATION_ERROR' && error.context?.field === 'email') {
    return 'Please enter a valid email address';
  }
  
  if (error.source === 'API_ERROR' && error.context?.status === 429) {
    return 'Too many requests. Please try again later.';
  }
  
  return 'An unexpected error occurred';
}`}</code>
            </pre>
          </div>
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
                <li>
                  • Use consistent error source naming (e.g., UPPER_SNAKE_CASE)
                </li>
                <li>• Include relevant context for debugging</li>
                <li>• Use error factories for consistency</li>
                <li>• Chain errors to preserve the original cause</li>
                <li>• Make error messages user-friendly when appropriate</li>
                <li>• Include actionable information in error context</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>
                  • Include sensitive information in error messages or context
                </li>
                <li>• Use generic error messages without context</li>
                <li>• Create too many specific error types</li>
                <li>• Ignore the original error when creating custom errors</li>
                <li>• Put large objects in error context</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Next Steps
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Error Factories
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn advanced patterns for error creation
              </p>
              <a
                href="/docs/advanced/factories"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Explore Factories →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Custom Errors
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Advanced custom error patterns
              </p>
              <a
                href="/docs/advanced/custom-errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn Custom Errors →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                API Reference
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Complete error creation API
              </p>
              <a
                href="/docs/api/errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error API →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
