import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function SuccessVsErrorPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Success vs Error Paths
        </h1>
        <p className="text-xl text-slate-600">
          Understanding how try-error handles success and error cases
        </p>
      </div>

      <div className="space-y-8">
        {/* Core Concept */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Core Concept
          </h2>

          <p className="text-slate-600 mb-4">
            try-error uses a union type approach where functions return either a
            successful value or a TryError. This eliminates the need for
            try/catch blocks and makes error handling explicit and type-safe.
          </p>

          <CodeBlock
            language="typescript"
            title="Basic Success vs Error Pattern"
            showLineNumbers={true}
            className="mb-4"
          >
            {`import { tryAsync, isTryError } from 'try-error';

// Function returns either User or TryError
const result = await tryAsync(() => fetchUser('123'));

if (isTryError(result)) {
  // Error path - TypeScript knows result is TryError
  console.error('Failed to fetch user:', result.message);
  console.error('Error type:', result.type);
  console.error('Context:', result.context);
} else {
  // Success path - TypeScript knows result is User
  console.log('User loaded:', result.name);
  console.log('Email:', result.email);
  console.log('ID:', result.id);
}`}
          </CodeBlock>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Key Benefits</h4>
            <ul className="space-y-1 text-blue-700 text-sm">
              <li>
                • <strong>Type Safety:</strong> TypeScript knows exactly which
                type you're working with
              </li>
              <li>
                • <strong>Explicit Handling:</strong> You must handle both
                success and error cases
              </li>
              <li>
                • <strong>No Exceptions:</strong> Errors are values, not thrown
                exceptions
              </li>
              <li>
                • <strong>Composable:</strong> Easy to chain and transform
                operations
              </li>
              <li>
                • <strong>Performance:</strong> Success path has &lt;3%
                overhead, error path overhead is configurable
              </li>
            </ul>
          </div>
        </section>

        {/* Performance Characteristics */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Performance Characteristics
          </h2>

          <p className="text-slate-600 mb-4">
            try-error is designed with performance in mind, optimizing for the
            common success path while providing rich debugging information for
            errors.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                Success Path Performance
              </h3>
              <p className="text-green-700 text-sm mb-2">
                The success path is the common case and has minimal overhead:
              </p>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>
                  • <strong>&lt;3% overhead</strong> vs native try/catch
                </li>
                <li>• Direct value return (no wrapper objects)</li>
                <li>• No stack trace capture</li>
                <li>• No context cloning</li>
                <li>• Suitable for hot paths and loops</li>
              </ul>
              <CodeBlock
                language="typescript"
                title="Success Path - Minimal Overhead"
                className="mt-3"
              >
                {`// Native try/catch: 100ms for 1M operations
try {
  const result = JSON.parse(validJson);
} catch (e) {}

// try-error: 103ms for 1M operations (<3% overhead)
const result = trySync(() => JSON.parse(validJson));
if (!isTryError(result)) {
  // Use result
}`}
              </CodeBlock>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">
                Error Path Performance
              </h3>
              <p className="text-orange-700 text-sm mb-2">
                The error path has higher overhead due to debugging features:
              </p>
              <ul className="space-y-1 text-orange-700 text-sm">
                <li>
                  • <strong>20% to 120% overhead</strong> (configurable)
                </li>
                <li>• Stack trace capture: ~80% overhead</li>
                <li>• Context deep cloning: ~30% overhead</li>
                <li>• Source location: ~10% overhead</li>
                <li>• Timestamp generation: ~5% overhead</li>
              </ul>
              <CodeBlock
                language="typescript"
                title="Error Path - Configurable Overhead"
                className="mt-3"
              >
                {`// Default config: Rich debugging info (1700% overhead)
const error = trySync(() => JSON.parse(invalidJson));
// Full stack trace, source location, context, timestamp

// Minimal config: Bare essentials (50% overhead)
configure(ConfigPresets.minimal());
const error = trySync(() => JSON.parse(invalidJson));
// Just type and message, no expensive operations`}
              </CodeBlock>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">
              🤔 Why is Error Overhead Acceptable?
            </h4>
            <div className="space-y-3 text-blue-700 text-sm">
              <div>
                <strong>1. Errors Should Be Exceptional</strong>
                <p className="mt-1">
                  In well-designed systems, errors occur rarely. If you're
                  parsing valid JSON 99.9% of the time, the error overhead only
                  affects 0.1% of operations.
                </p>
              </div>

              <div>
                <strong>2. Debugging Information is Valuable</strong>
                <p className="mt-1">
                  Stack traces, source locations, and context make debugging
                  much easier. The time saved debugging often outweighs the
                  runtime overhead.
                </p>
              </div>

              <div>
                <strong>3. It's Configurable</strong>
                <p className="mt-1">
                  For high-error-rate scenarios (like user input validation),
                  use minimal configuration to reduce overhead to just 50%.
                </p>
              </div>

              <div>
                <strong>4. Errors Are Already Slow</strong>
                <p className="mt-1">
                  Exception throwing and catching is inherently expensive. The
                  additional overhead for better debugging is proportionally
                  small.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Optimizing for Your Use Case
            </h3>

            <CodeBlock
              language="typescript"
              title="Performance Optimization Strategies"
              showLineNumbers={true}
            >
              {`import { configure, ConfigPresets } from 'try-error';

// High-performance parsing (expected errors)
function parseUserInput(input: string) {
  // Use minimal config for validation scenarios
  configure(ConfigPresets.minimal());
  
  const result = trySync(() => JSON.parse(input));
  if (isTryError(result)) {
    return { valid: false, error: 'Invalid JSON' };
  }
  return { valid: true, data: result };
}

// API calls (unexpected errors)
async function fetchCriticalData(id: string) {
  // Use default config for better debugging
  configure(ConfigPresets.development());
  
  const result = await tryAsync(() => fetch(\`/api/data/\${id}\`));
  if (isTryError(result)) {
    // Rich error info helps debug API issues
    console.error('API Error:', {
      message: result.message,
      stack: result.stack,
      source: result.source,
      context: result.context
    });
    throw result;
  }
  return result;
}

// Mixed scenarios
function processDataPipeline(data: unknown[]) {
  // Use scoped configuration for different stages
  const parseResults = data.map(item => {
    // Minimal config for parsing (high error rate expected)
    configure(ConfigPresets.minimal());
    return trySync(() => validateAndParse(item));
  });
  
  // Full config for processing (errors are bugs)
  configure(ConfigPresets.development());
  const processResults = parseResults
    .filter(r => !isTryError(r))
    .map(item => trySync(() => processItem(item)));
  
  return {
    parsed: parseResults.filter(r => !isTryError(r)),
    errors: parseResults.filter(isTryError)
  };
}`}
            </CodeBlock>
          </div>
        </section>

        {/* Type Narrowing */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Type Narrowing with Guards
          </h2>

          <p className="text-slate-600 mb-4">
            Type guards are essential for narrowing union types and enabling
            TypeScript to understand which path you're on. try-error provides
            several type guards for different scenarios.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                isTryError Guard
              </h3>
              <p className="text-slate-600 mb-3">
                The primary type guard for distinguishing between success and
                error results.
              </p>
              <CodeBlock
                language="typescript"
                title="isTryError Type Guard"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { tryAsync, isTryError, TryResult } from 'try-error';

async function handleUserFetch(userId: string) {
  const result = await tryAsync(() => fetchUser(userId));
  
  // Type guard narrows the union type
  if (isTryError(result)) {
    // result is TryError here
    return {
      success: false,
      error: result.message,
      errorType: result.type
    };
  }
  
  // result is User here
  return {
    success: true,
    user: {
      id: result.id,
      name: result.name,
      email: result.email
    }
  };
}

// Generic handling function
function processResult<T>(result: TryResult<T, TryError>) {
  if (isTryError(result)) {
    console.error(\`Operation failed: \${result.message}\`);
    return null;
  }
  
  console.log('Operation succeeded');
  return result;
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                isTrySuccess Guard
              </h3>
              <p className="text-slate-600 mb-3">
                Alternative guard that checks for successful results, useful for
                filtering operations.
              </p>
              <CodeBlock
                language="typescript"
                title="isTrySuccess Type Guard"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { tryAsync, isTrySuccess, isTryError } from 'try-error';

async function fetchMultipleUsers(userIds: string[]) {
  const results = await Promise.all(
    userIds.map(id => tryAsync(() => fetchUser(id)))
  );
  
  // Filter successful results
  const successfulUsers = results.filter(isTrySuccess);
  // TypeScript knows successfulUsers is User[]
  
  // Filter failed results
  const failedResults = results.filter(isTryError);
  // TypeScript knows failedResults is TryError[]
  
  return {
    users: successfulUsers,
    errors: failedResults,
    successCount: successfulUsers.length,
    errorCount: failedResults.length
  };
}

// Processing with success guard
function processValidResults<T>(results: TryResult<T, TryError>[]) {
  return results
    .filter(isTrySuccess)
    .map(result => {
      // TypeScript knows result is T, not TryResult<T, TryError>
      return processSuccessfulResult(result);
    });
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                hasErrorType Guard
              </h3>
              <p className="text-slate-600 mb-3">
                Narrow errors by their specific type for targeted error
                handling. The <code>hasErrorType</code> guard works with custom
                error types that you define in your application.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  📝 Custom Error Types
                </h4>
                <p className="text-blue-700 text-sm mb-2">
                  The error types shown below (<code>ValidationError</code>,{" "}
                  <code>AuthenticationError</code>, <code>NetworkError</code>)
                  are examples of custom error types you would define in your
                  application. try-error doesn't provide these types built-in -
                  you create them based on your domain needs.
                </p>
                <div className="flex gap-2 text-sm">
                  <a
                    href="/docs/advanced/custom-errors"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Learn about Custom Errors →
                  </a>
                  <span className="text-blue-500">•</span>
                  <a
                    href="/docs/concepts/error-types"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Error Types Guide →
                  </a>
                </div>
              </div>

              <CodeBlock
                language="typescript"
                title="Defining Custom Error Types"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { createTryError } from 'try-error';

// Define your custom error types
export const createValidationError = (message: string, field: string) =>
  createTryError('ValidationError', message, { field });

export const createAuthenticationError = (message: string) =>
  createTryError('AuthenticationError', message);

export const createNetworkError = (message: string, status: number, url: string) =>
  createTryError('NetworkError', message, { status, url });

// Use them in your functions
async function performUserOperation(userId: string) {
  if (!userId) {
    throw createValidationError('User ID is required', 'userId');
  }
  
  const authResult = await checkAuthentication();
  if (!authResult.valid) {
    throw createAuthenticationError('Invalid credentials');
  }
  
  // ... rest of operation
}`}
              </CodeBlock>

              <CodeBlock
                language="typescript"
                title="hasErrorType Type Guard Usage"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { tryAsync, isTryError, hasErrorType } from 'try-error';

async function handleUserOperation(userId: string) {
  const result = await tryAsync(() => performUserOperation(userId));
  
  if (isTryError(result)) {
    // Handle different error types specifically
    if (hasErrorType(result, 'ValidationError')) {
      // TypeScript knows result.type is 'ValidationError'
      return {
        status: 'validation_failed',
        field: result.context?.field,
        message: result.message
      };
    }
    
    if (hasErrorType(result, 'AuthenticationError')) {
      return {
        status: 'auth_required',
        redirectTo: '/login'
      };
    }
    
    if (hasErrorType(result, 'NetworkError')) {
      return {
        status: 'network_error',
        retryable: true,
        retryAfter: 5000
      };
    }
    
    // Generic error handling for unknown types
    return {
      status: 'unknown_error',
      message: result.message
    };
  }
  
  return {
    status: 'success',
    data: result
  };
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Pattern Matching */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Pattern Matching Approaches
          </h2>

          <p className="text-slate-600 mb-4">
            Different ways to handle success and error cases based on your
            coding style and requirements.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Early Return Pattern
              </h3>
              <p className="text-slate-600 mb-3">
                Handle errors early and continue with the success case.
              </p>
              <CodeBlock
                language="typescript"
                title="Early Return Pattern"
                showLineNumbers={true}
                className="mb-4"
              >
                {`async function processUser(userId: string) {
  // Fetch user
  const userResult = await tryAsync(() => fetchUser(userId));
  if (isTryError(userResult)) {
    console.error('Failed to fetch user:', userResult.message);
    return null;
  }
  
  // Validate user
  const validationResult = await tryAsync(() => validateUser(userResult));
  if (isTryError(validationResult)) {
    console.error('User validation failed:', validationResult.message);
    return null;
  }
  
  // Process user
  const processResult = await tryAsync(() => processUserData(validationResult));
  if (isTryError(processResult)) {
    console.error('Processing failed:', processResult.message);
    return null;
  }
  
  // Success path
  console.log('User processed successfully');
  return processResult;
}

// Alternative with explicit error handling
async function processUserWithErrorHandling(userId: string) {
  const userResult = await tryAsync(() => fetchUser(userId));
  if (isTryError(userResult)) {
    await logError(userResult);
    await notifyAdmins(userResult);
    return { success: false, error: userResult };
  }
  
  const user = userResult; // TypeScript knows this is User
  
  // Continue processing...
  return { success: true, data: user };
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Match Expression Pattern
              </h3>
              <p className="text-slate-600 mb-3">
                Create a match function for more functional-style error
                handling.
              </p>
              <CodeBlock
                language="typescript"
                title="Match Expression Pattern"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Match utility function
function match<T, E extends TryError, R>(
  result: TryResult<T, E>,
  handlers: {
    success: (value: T) => R;
    error: (error: E) => R;
  }
): R {
  if (isTryError(result)) {
    return handlers.error(result);
  }
  return handlers.success(result);
}

// Usage
async function handleUserFetch(userId: string) {
  const result = await tryAsync(() => fetchUser(userId));
  
  return match(result, {
    success: (user) => ({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }),
    error: (error) => ({
      status: 'error',
      message: error.message,
      type: error.type,
      retryable: isRetryableError(error)
    })
  });
}

// Advanced match with error type handling
// Note: Uses the same custom error types (ValidationError, NetworkError, AuthenticationError)
// defined in the hasErrorType section above
function matchWithErrorTypes<T, R>(
  result: TryResult<T, TryError>,
  handlers: {
    success: (value: T) => R;
    validationError?: (error: TryError) => R;
    networkError?: (error: TryError) => R;
    authError?: (error: TryError) => R;
    defaultError: (error: TryError) => R;
  }
): R {
  if (isTryError(result)) {
    if (hasErrorType(result, 'ValidationError') && handlers.validationError) {
      return handlers.validationError(result);
    }
    if (hasErrorType(result, 'NetworkError') && handlers.networkError) {
      return handlers.networkError(result);
    }
    if (hasErrorType(result, 'AuthenticationError') && handlers.authError) {
      return handlers.authError(result);
    }
    return handlers.defaultError(result);
  }
  return handlers.success(result);
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Chain Pattern
              </h3>
              <p className="text-slate-600 mb-3">
                Chain operations while preserving error information.
              </p>
              <CodeBlock
                language="typescript"
                title="Chain Pattern"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { mapResult, flatMapResult } from 'try-error';

// Chain transformations
async function processUserChain(userId: string) {
  const userResult = await tryAsync(() => fetchUser(userId));
  
  // Transform user to profile data
  const profileResult = mapResult(userResult, user => ({
    id: user.id,
    displayName: \`\${user.firstName} \${user.lastName}\`,
    avatar: user.avatarUrl,
    isActive: user.status === 'active'
  }));
  
  // Chain dependent operation
  const enrichedResult = await (async () => {
    if (isTryError(profileResult)) {
      return profileResult;
    }
    
    return tryAsync(() => enrichProfile(profileResult));
  })();
  
  return enrichedResult;
}

// Using flatMapResult for cleaner chaining
async function processUserFlatMap(userId: string) {
  const userResult = await tryAsync(() => fetchUser(userId));
  
  const profileResult = flatMapResult(userResult, user =>
    tryAsync(() => createProfile(user))
  );
  
  const enrichedResult = flatMapResult(profileResult, profile =>
    tryAsync(() => enrichProfile(profile))
  );
  
  return enrichedResult;
}

// Pipeline pattern
async function processUserPipeline(userId: string) {
  return tryAsync(() => fetchUser(userId))
    .then(result => flatMapResult(result, user =>
      tryAsync(() => validateUser(user))
    ))
    .then(result => flatMapResult(result, user =>
      tryAsync(() => enrichUser(user))
    ))
    .then(result => flatMapResult(result, user =>
      tryAsync(() => saveUser(user))
    ));
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Error Recovery */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Recovery Strategies
          </h2>

          <p className="text-slate-600 mb-4">
            Different approaches for recovering from errors and providing
            fallback behavior.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Fallback Values
              </h3>
              <CodeBlock
                language="typescript"
                title="Fallback Value Strategies"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { unwrapOr } from 'try-error';

// Simple fallback
async function getUserWithFallback(userId: string) {
  const result = await tryAsync(() => fetchUser(userId));
  
  // Provide default user if fetch fails
  return unwrapOr(result, {
    id: userId,
    name: 'Unknown User',
    email: 'unknown@example.com',
    status: 'inactive'
  });
}

// Conditional fallback
function getUserOrGuest(userId: string) {
  const result = trySync(() => getCachedUser(userId));
  
  if (isTryError(result)) {
    if (hasErrorType(result, 'NotFoundError')) {
      return createGuestUser();
    }
    // For other errors, return null
    return null;
  }
  
  return result;
}

// Computed fallback
async function getUserWithComputedFallback(userId: string) {
  const result = await tryAsync(() => fetchUser(userId));
  
  if (isTryError(result)) {
    console.warn(\`Failed to fetch user \${userId}:\`, result.message);
    
    // Try to get from cache
    const cacheResult = await tryAsync(() => getCachedUser(userId));
    if (!isTryError(cacheResult)) {
      return cacheResult;
    }
    
    // Create minimal user
    return {
      id: userId,
      name: 'User',
      email: '',
      status: 'unknown'
    };
  }
  
  return result;
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Retry Strategies
              </h3>
              <CodeBlock
                language="typescript"
                title="Retry Strategies"
                showLineNumbers={true}
                className="mb-4"
              >
                {`// Simple retry
async function fetchUserWithRetry(userId: string, maxAttempts = 3) {
  let lastError: TryError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await tryAsync(() => fetchUser(userId));
    
    if (!isTryError(result)) {
      return result;
    }
    
    lastError = result;
    
    // Don't retry on certain error types
    if (hasErrorType(result, 'ValidationError') || 
        hasErrorType(result, 'AuthenticationError')) {
      break;
    }
    
    // Wait before retry
    if (attempt < maxAttempts) {
      await sleep(1000 * attempt); // Exponential backoff
    }
  }
  
  return lastError!;
}

// Conditional retry
async function fetchWithConditionalRetry(userId: string) {
  const result = await tryAsync(() => fetchUser(userId));
  
  if (isTryError(result)) {
    // Only retry network errors
    if (hasErrorType(result, 'NetworkError')) {
      console.log('Network error, retrying...');
      return tryAsync(() => fetchUser(userId));
    }
    
    // Don't retry other errors
    return result;
  }
  
  return result;
}

// Multiple fallback sources
async function fetchUserMultiSource(userId: string) {
  // Try primary source
  const primaryResult = await tryAsync(() => fetchUserFromPrimary(userId));
  if (!isTryError(primaryResult)) {
    return primaryResult;
  }
  
  // Try secondary source
  const secondaryResult = await tryAsync(() => fetchUserFromSecondary(userId));
  if (!isTryError(secondaryResult)) {
    return secondaryResult;
  }
  
  // Try cache
  const cacheResult = await tryAsync(() => fetchUserFromCache(userId));
  if (!isTryError(cacheResult)) {
    return cacheResult;
  }
  
  // All sources failed
  return primaryResult; // Return the first error
}`}
              </CodeBlock>
            </div>
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
                <li>• Always use type guards to narrow union types</li>
                <li>• Handle errors explicitly rather than ignoring them</li>
                <li>• Use early returns for cleaner error handling</li>
                <li>• Provide meaningful fallback values when appropriate</li>
                <li>• Log errors with sufficient context for debugging</li>
                <li>• Use specific error type guards for targeted handling</li>
                <li>
                  • Chain operations using flatMapResult for dependent calls
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Access properties without type guards</li>
                <li>• Ignore errors or fail silently</li>
                <li>• Use generic error handling for all error types</li>
                <li>• Retry operations that will never succeed</li>
                <li>• Create deeply nested if/else chains</li>
                <li>• Mix try/catch with try-error patterns</li>
                <li>
                  • Return undefined or null instead of proper error handling
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Tips</h4>
              <ul className="space-y-1 text-yellow-700 text-sm">
                <li>
                  • Use match expressions for complex error handling logic
                </li>
                <li>
                  • Consider creating domain-specific error handling utilities
                </li>
                <li>• Use mapResult for transforming successful values</li>
                <li>
                  • Implement circuit breaker patterns for external services
                </li>
                <li>• Create error recovery strategies based on error types</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related Pages
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
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
                Custom Errors
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Create domain-specific error types for better error handling
              </p>
              <a
                href="/docs/advanced/custom-errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Custom Errors →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Utilities API
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Type guards, transformers, and utility functions
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
