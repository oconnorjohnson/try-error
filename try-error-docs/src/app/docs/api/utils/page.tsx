import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function UtilsAPIPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Utilities API
        </h1>
        <p className="text-xl text-slate-600">
          API reference for tryError utility functions and helpers
        </p>
      </div>

      <div className="space-y-8">
        {/* Type Guards */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Type Guards
          </h2>

          <p className="text-slate-600 mb-4">
            Type guard functions help TypeScript narrow types and provide
            runtime type checking for tryError results.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                isTryError
              </h3>
              <p className="text-slate-600 mb-3">
                Check if a value is a TryError instance with proper type
                narrowing.
              </p>
              <CodeBlock
                language="typescript"
                title="isTryError Type Guard"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { isTryError } from 'tryError';

function isTryError<T = any>(value: unknown): value is TryError<T>

// Usage examples
const result = await tryAsync(() => fetchUser('123'));

if (isTryError(result)) {
  // TypeScript knows result is TryError
  console.error('Error:', result.message);
  console.error('Type:', result.type);
  console.error('Context:', result.context);
} else {
  // TypeScript knows result is User
  console.log('User:', result.name);
}

// Generic type checking
function handleResult<T>(result: TryResult<T, TryError>) {
  if (isTryError(result)) {
    return { success: false, error: result };
  }
  return { success: true, data: result };
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                isTrySuccess
              </h3>
              <p className="text-slate-600 mb-3">
                Check if a TryResult represents a successful operation.
              </p>
              <CodeBlock
                language="typescript"
                title="isTrySuccess Type Guard"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { isTrySuccess } from 'tryError';

function isTrySuccess<T, E extends TryError>(
  result: TryResult<T, E>
): result is T

// Usage examples
const results = await Promise.all([
  tryAsync(() => fetchUser('1')),
  tryAsync(() => fetchUser('2')),
  tryAsync(() => fetchUser('3'))
]);

const successfulResults = results.filter(isTrySuccess);
// TypeScript knows successfulResults is User[]

const users = results
  .filter(isTrySuccess)
  .map(user => user.name); // Type-safe access

// Conditional processing
function processResults<T>(results: TryResult<T, TryError>[]) {
  const successful = results.filter(isTrySuccess);
  const failed = results.filter(isTryError);
  
  return {
    successful,
    failed,
    successRate: successful.length / results.length
  };
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                hasErrorType
              </h3>
              <p className="text-slate-600 mb-3">
                Check if an error has a specific type with type narrowing.
              </p>
              <CodeBlock
                language="typescript"
                title="hasErrorType Type Guard"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { hasErrorType } from 'tryError';

function hasErrorType<T extends string>(
  error: TryError,
  type: T
): error is TryError & { type: T }

// Usage examples
const result = await tryAsync(() => validateUser(userData));

if (isTryError(result)) {
  if (hasErrorType(result, 'ValidationError')) {
    // Handle validation errors specifically
    console.log('Validation failed:', result.context.field);
  } else if (hasErrorType(result, 'NetworkError')) {
    // Handle network errors
    console.log('Network issue:', result.context.status);
  } else {
    // Handle other errors
    console.log('Unknown error:', result.type);
  }
}

// Multiple type checking
function isRetryableError(error: TryError): boolean {
  return hasErrorType(error, 'NetworkError') ||
         hasErrorType(error, 'TimeoutError') ||
         hasErrorType(error, 'RateLimitError');
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Result Transformers */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Result Transformers
          </h2>

          <p className="text-slate-600 mb-4">
            Transform and manipulate tryError results with functional
            programming patterns.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                mapResult
              </h3>
              <p className="text-slate-600 mb-3">
                Transform successful results while preserving errors.
              </p>
              <CodeBlock
                language="typescript"
                title="mapResult Transformer"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { mapResult } from 'tryError';

function mapResult<T, U, E extends TryError>(
  result: TryResult<T, E>,
  transform: (value: T) => U
): TryResult<U, E>

// Usage examples
const userResult = await tryAsync(() => fetchUser('123'));

// Transform user to display name
const nameResult = mapResult(userResult, user => user.name);

// Chain transformations
const upperNameResult = mapResult(nameResult, name => name.toUpperCase());

// Complex transformations
const userSummaryResult = mapResult(userResult, user => ({
  id: user.id,
  displayName: \`\${user.firstName} \${user.lastName}\`,
  isActive: user.status === 'active',
  memberSince: new Date(user.createdAt).getFullYear()
}));

// Async transformations
async function mapResultAsync<T, U, E extends TryError>(
  result: TryResult<T, E>,
  transform: (value: T) => Promise<U>
): Promise<TryResult<U, E>> {
  if (isTryError(result)) {
    return result;
  }
  return tryAsync(() => transform(result));
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                mapError
              </h3>
              <p className="text-slate-600 mb-3">
                Transform errors while preserving successful results.
              </p>
              <CodeBlock
                language="typescript"
                title="mapError Transformer"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { mapError } from 'tryError';

function mapError<T, E1 extends TryError, E2 extends TryError>(
  result: TryResult<T, E1>,
  transform: (error: E1) => E2
): TryResult<T, E2>

// Usage examples
const result = await tryAsync(() => fetchUser('123'));

// Transform network errors to user-friendly messages
const friendlyResult = mapError(result, error => {
  if (hasErrorType(error, 'NetworkError')) {
    return createTryError(
      'UserFriendlyError',
      'Unable to load user data. Please try again.',
      { originalError: error.type }
    );
  }
  return error;
});

// Add context to errors
const enrichedResult = mapError(result, error => 
  enrichError(error, {
    userId: '123',
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  })
);

// Convert errors to different types
const apiResult = mapError(result, error => {
  const statusCode = getHttpStatusForError(error);
  return createTryError('ApiError', error.message, {
    statusCode,
    originalType: error.type,
    context: error.context
  });
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                flatMapResult
              </h3>
              <p className="text-slate-600 mb-3">
                Chain operations that return TryResult, flattening nested
                results.
              </p>
              <CodeBlock
                language="typescript"
                title="flatMapResult Transformer"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { flatMapResult } from 'tryError';

function flatMapResult<T, U, E extends TryError>(
  result: TryResult<T, E>,
  transform: (value: T) => TryResult<U, E>
): TryResult<U, E>

// Usage examples
const userResult = await tryAsync(() => fetchUser('123'));

// Chain dependent operations
const profileResult = flatMapResult(userResult, user =>
  tryAsync(() => fetchUserProfile(user.id))
);

// Multiple chained operations
const fullUserData = await tryAsync(() => fetchUser('123'))
  .then(result => flatMapResult(result, user =>
    tryAsync(() => fetchUserProfile(user.id))
  ))
  .then(result => flatMapResult(result, profile =>
    tryAsync(() => fetchUserPreferences(profile.userId))
  ));

// Conditional chaining
const conditionalResult = flatMapResult(userResult, user => {
  if (user.isActive) {
    return tryAsync(() => fetchActiveUserData(user.id));
  } else {
    return tryAsync(() => fetchInactiveUserData(user.id));
  }
});

// Error propagation in chains
async function processUserWorkflow(userId: string) {
  return tryAsync(() => fetchUser(userId))
    .then(result => flatMapResult(result, user =>
      tryAsync(() => validateUser(user))
    ))
    .then(result => flatMapResult(result, user =>
      tryAsync(() => processUser(user))
    ))
    .then(result => flatMapResult(result, processed =>
      tryAsync(() => saveProcessedUser(processed))
    ));
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Result Combinators */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Result Combinators
          </h2>

          <p className="text-slate-600 mb-4">
            Combine multiple tryError results with various strategies.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                combineResults
              </h3>
              <p className="text-slate-600 mb-3">
                Combine multiple results into a single result containing all
                successful values.
              </p>
              <CodeBlock
                language="typescript"
                title="combineResults Combinator"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { combineResults } from 'tryError';

function combineResults<T extends readonly TryResult<any, any>[]>(
  results: T
): TryResult<UnwrapResults<T>, TryError>

// Usage examples
const userResult = await tryAsync(() => fetchUser('123'));
const profileResult = await tryAsync(() => fetchProfile('123'));
const prefsResult = await tryAsync(() => fetchPreferences('123'));

// Combine all results
const combinedResult = combineResults([userResult, profileResult, prefsResult]);

if (isTrySuccess(combinedResult)) {
  const [user, profile, preferences] = combinedResult;
  // All operations succeeded
  console.log('User data loaded:', { user, profile, preferences });
} else {
  // At least one operation failed
  console.error('Failed to load complete user data:', combinedResult.message);
}

// Named combination
const namedResult = combineResults({
  user: userResult,
  profile: profileResult,
  preferences: prefsResult
});

if (isTrySuccess(namedResult)) {
  const { user, profile, preferences } = namedResult;
  // Type-safe destructuring
}

// Partial success handling
function combineWithPartialSuccess<T extends Record<string, TryResult<any, any>>>(
  results: T
): { successful: Partial<UnwrapResults<T>>; failed: TryError[] } {
  const successful: any = {};
  const failed: TryError[] = [];
  
  for (const [key, result] of Object.entries(results)) {
    if (isTrySuccess(result)) {
      successful[key] = result;
    } else {
      failed.push(result);
    }
  }
  
  return { successful, failed };
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                raceResults
              </h3>
              <p className="text-slate-600 mb-3">
                Return the first successful result or all errors if all fail.
              </p>
              <CodeBlock
                language="typescript"
                title="raceResults Combinator"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { raceResults } from 'tryError';

function raceResults<T>(
  results: Promise<TryResult<T, TryError>>[]
): Promise<TryResult<T, TryError[]>>

// Usage examples
const primaryResult = tryAsync(() => fetchFromPrimaryAPI('123'));
const fallbackResult = tryAsync(() => fetchFromFallbackAPI('123'));
const cacheResult = tryAsync(() => fetchFromCache('123'));

// Race for first success
const fastestResult = await raceResults([
  primaryResult,
  fallbackResult,
  cacheResult
]);

if (isTrySuccess(fastestResult)) {
  console.log('Got data from fastest source:', fastestResult);
} else {
  console.error('All sources failed:', fastestResult);
}

// Timeout with fallback
async function fetchWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  fallback: () => Promise<T>
): Promise<TryResult<T, TryError>> {
  const timeoutPromise = new Promise<TryResult<T, TryError>>(resolve => {
    setTimeout(() => {
      resolve(createTryError('TimeoutError', \`Operation timed out after \${timeoutMs}ms\`));
    }, timeoutMs);
  });
  
  return raceResults([
    tryAsync(operation),
    timeoutPromise,
    tryAsync(fallback)
  ]);
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                sequenceResults
              </h3>
              <p className="text-slate-600 mb-3">
                Execute operations in sequence, stopping at the first error.
              </p>
              <CodeBlock
                language="typescript"
                title="sequenceResults Combinator"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { sequenceResults } from 'tryError';

function sequenceResults<T>(
  operations: (() => Promise<TryResult<T, TryError>>)[]
): Promise<TryResult<T[], TryError>>

// Usage examples
const operations = [
  () => tryAsync(() => validateInput(data)),
  () => tryAsync(() => processData(data)),
  () => tryAsync(() => saveData(data)),
  () => tryAsync(() => notifySuccess(data))
];

const sequenceResult = await sequenceResults(operations);

if (isTrySuccess(sequenceResult)) {
  console.log('All operations completed:', sequenceResult);
} else {
  console.error('Sequence failed at step:', sequenceResult);
}

// Pipeline with transformations
async function processPipeline<T>(
  input: T,
  steps: ((input: any) => Promise<TryResult<any, TryError>>)[]
): Promise<TryResult<any, TryError>> {
  let current: TryResult<any, TryError> = input;
  
  for (const step of steps) {
    if (isTryError(current)) {
      return current;
    }
    current = await step(current);
  }
  
  return current;
}

// Usage
const pipelineResult = await processPipeline(userData, [
  data => tryAsync(() => validateUser(data)),
  data => tryAsync(() => enrichUserData(data)),
  data => tryAsync(() => saveUser(data)),
  data => tryAsync(() => sendWelcomeEmail(data))
]);`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Utility Helpers */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Utility Helpers
          </h2>

          <p className="text-slate-600 mb-4">
            Additional helper functions for common tryError patterns and
            operations.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                unwrapOr
              </h3>
              <p className="text-slate-600 mb-3">
                Extract the value from a result or return a default value.
              </p>
              <CodeBlock
                language="typescript"
                title="unwrapOr Helper"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { unwrapOr } from 'tryError';

function unwrapOr<T>(result: TryResult<T, TryError>, defaultValue: T): T

// Usage examples
const userResult = await tryAsync(() => fetchUser('123'));

// Simple default
const user = unwrapOr(userResult, { id: '123', name: 'Unknown User' });

// Computed default
const userName = unwrapOr(
  mapResult(userResult, u => u.name),
  'Anonymous'
);

// Function-based default
function unwrapOrElse<T>(
  result: TryResult<T, TryError>,
  getDefault: (error: TryError) => T
): T {
  if (isTrySuccess(result)) {
    return result;
  }
  return getDefault(result);
}

const userWithFallback = unwrapOrElse(userResult, error => {
  console.warn('Failed to fetch user:', error.message);
  return createGuestUser();
});

// Nullable unwrap
function unwrapOrNull<T>(result: TryResult<T, TryError>): T | null {
  return isTrySuccess(result) ? result : null;
}

const maybeUser = unwrapOrNull(userResult);
if (maybeUser) {
  console.log('User found:', maybeUser.name);
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                retry
              </h3>
              <p className="text-slate-600 mb-3">
                Retry operations with configurable strategies and backoff.
              </p>
              <CodeBlock
                language="typescript"
                title="retry Helper"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { retry, RetryOptions } from 'tryError';

interface RetryOptions {
  maxAttempts: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  shouldRetry?: (error: TryError) => boolean;
}

function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<TryResult<T, TryError>>

// Usage examples
const result = await retry(
  () => fetchUser('123'),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential'
  }
);

// Custom retry logic
const customRetryResult = await retry(
  () => processPayment(paymentData),
  {
    maxAttempts: 5,
    delay: 500,
    shouldRetry: (error) => {
      // Only retry on network errors or rate limits
      return hasErrorType(error, 'NetworkError') ||
             hasErrorType(error, 'RateLimitError');
    }
  }
);

// Retry with jitter
async function retryWithJitter<T>(
  operation: () => Promise<T>,
  options: RetryOptions & { jitter?: boolean }
): Promise<TryResult<T, TryError>> {
  let lastError: TryError;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    const result = await tryAsync(operation);
    
    if (isTrySuccess(result)) {
      return result;
    }
    
    lastError = result;
    
    if (attempt < options.maxAttempts && 
        (!options.shouldRetry || options.shouldRetry(result))) {
      const delay = calculateDelay(attempt, options);
      const jitteredDelay = options.jitter ? 
        delay * (0.5 + Math.random() * 0.5) : delay;
      await sleep(jitteredDelay);
    }
  }
  
  return lastError!;
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                timeout
              </h3>
              <p className="text-slate-600 mb-3">
                Add timeout functionality to async operations.
              </p>
              <CodeBlock
                language="typescript"
                title="timeout Helper"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { timeout } from 'tryError';

function timeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<TryResult<T, TryError>>

// Usage examples
const result = await timeout(
  () => fetchLargeDataset(),
  5000, // 5 second timeout
  'Data fetch timed out'
);

// Timeout with cleanup
async function timeoutWithCleanup<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<TryResult<T, TryError>> {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  try {
    const result = await tryAsync(() => operation(controller.signal));
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      return createTryError('TimeoutError', \`Operation timed out after \${timeoutMs}ms\`);
    }
    throw error;
  }
}

// Progressive timeout
async function progressiveTimeout<T>(
  operation: () => Promise<T>,
  timeouts: number[]
): Promise<TryResult<T, TryError>> {
  for (const timeoutMs of timeouts) {
    const result = await timeout(operation, timeoutMs);
    if (isTrySuccess(result)) {
      return result;
    }
    
    // If it's not a timeout error, don't retry
    if (!hasErrorType(result, 'TimeoutError')) {
      return result;
    }
  }
  
  return createTryError(
    'TimeoutError',
    \`Operation failed after all timeout attempts: \${timeouts.join(', ')}ms\`
  );
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
                <li>• Use type guards for proper type narrowing</li>
                <li>
                  • Combine results when you need all operations to succeed
                </li>
                <li>• Use mapResult for transforming successful values</li>
                <li>• Use flatMapResult for chaining dependent operations</li>
                <li>• Implement retry logic for transient failures</li>
                <li>• Add timeouts to prevent hanging operations</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>
                  • Ignore type guards and manually check error properties
                </li>
                <li>
                  • Use unwrapOr with expensive default value computations
                </li>
                <li>• Retry operations that will never succeed</li>
                <li>• Set overly aggressive timeouts for normal operations</li>
                <li>• Chain too many operations without error handling</li>
                <li>
                  • Use combinators when simple sequential logic is clearer
                </li>
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
              <h3 className="font-semibold text-slate-900 mb-2">
                Error Creation API
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Learn about creating and working with TryError objects
              </p>
              <a
                href="/docs/api/errors"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error API →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                TypeScript Types
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Complete reference for all TypeScript types and interfaces
              </p>
              <a
                href="/docs/reference/types"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Types Reference →
              </a>
            </div>
          </div>
        </section>

        {/* Performance Optimization Utilities */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Performance Optimization
          </h2>

          <p className="text-slate-600 mb-4">
            Utilities for optimizing tryError performance in high-throughput
            scenarios.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Object Pooling
              </h3>
              <p className="text-slate-600 mb-3">
                Manage error object pools to reduce garbage collection pressure.
              </p>
              <CodeBlock
                language="typescript"
                title="Object Pooling API"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { 
  ErrorPool, 
  getGlobalErrorPool, 
  configureErrorPool, 
  resetErrorPool,
  getErrorPoolStats 
} from 'tryError';

// Create a custom pool
const pool = new ErrorPool(100); // Pool size

// Acquire and release errors
const error = pool.acquire();
error.type = 'CustomError';
error.message = 'Something went wrong';
// ... use the error
pool.release(error); // Return to pool

// Configure global pool
configureErrorPool({
  enabled: true,
  maxSize: 200
});

// Get pool statistics
const stats = getErrorPoolStats();
console.log({
  poolSize: stats.poolSize,
  activeCount: stats.activeCount,
  hitRate: stats.hitRate,
  hits: stats.hits,
  misses: stats.misses
});

// Reset global pool
resetErrorPool();

// Pool management methods
pool.clear();        // Empty the pool
pool.resize(50);     // Change pool size
const stats = pool.getStats(); // Get pool statistics`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Lazy Evaluation
              </h3>
              <p className="text-slate-600 mb-3">
                Create errors with lazy-evaluated properties for better
                performance.
              </p>
              <CodeBlock
                language="typescript"
                title="Lazy Evaluation API"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { 
  createLazyError, 
  makeLazy, 
  isLazyProperty, 
  forceLazyEvaluation,
  createDebugProxy 
} from 'tryError';

// Create error with lazy properties
const error = createLazyError({
  type: 'LazyError',
  message: 'Error message',
  getSource: () => {
    // Expensive computation only when accessed
    return computeSourceLocation();
  },
  getStack: () => {
    // Generate stack trace on demand
    return new Error().stack;
  },
  getTimestamp: () => Date.now(),
  context: { immediate: 'value' }
});

// Make existing error lazy
const lazyError = makeLazy(existingError, {
  source: () => computeSource(),
  stack: () => generateStack(),
  context: () => gatherContext()
});

// Check if property is lazy
if (isLazyProperty(error, 'stack')) {
  console.log('Stack will be computed on access');
}

// Force all lazy properties to evaluate
const evaluated = forceLazyEvaluation(error);

// Debug lazy property access
const debugError = createDebugProxy(error);
// Logs: "Lazy evaluation triggered for property: stack"
console.log(debugError.stack);`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Configuration Presets
              </h3>
              <p className="text-slate-600 mb-3">
                Pre-configured settings for different performance scenarios.
              </p>
              <CodeBlock
                language="typescript"
                title="Configuration Presets"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { configure, ConfigPresets } from 'tryError';

// Maximum performance - minimal features
configure(ConfigPresets.minimal());
// Enables: minimalErrors, skipTimestamp, skipContext, skipSourceLocation
// Disables: stack traces, context capture, source location

// Production - balanced performance and debugging
configure(ConfigPresets.production());
// Enables: lazy evaluation, object pooling
// Disables: verbose logging, debug features

// Development - full debugging features
configure(ConfigPresets.development());
// Enables: all debugging features, verbose logging
// Disables: performance optimizations

// Custom performance configuration
configure({
  performance: {
    errorCreation: {
      objectPooling: true,
      poolSize: 100,
      lazyStackTrace: true,
      lazySourceLocation: true
    },
    contextCapture: {
      maxDepth: 3,
      maxProperties: 50,
      excludePatterns: ['password', 'token']
    },
    memoryManagement: {
      maxErrorsInMemory: 1000,
      errorTTL: 60000 // 1 minute
    }
  }
});`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Middleware System */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Middleware System
          </h2>

          <p className="text-slate-600 mb-4">
            Extend tryError with custom logic using middleware pipelines.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                MiddlewarePipeline
              </h3>
              <p className="text-slate-600 mb-3">
                Create and manage middleware pipelines for error handling.
              </p>
              <CodeBlock
                language="typescript"
                title="Middleware Pipeline API"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { MiddlewarePipeline, ErrorMiddleware } from 'tryError';

// Create a pipeline
const pipeline = new MiddlewarePipeline();

// Add middleware
pipeline
  .use((result, next) => {
    console.log('Before:', result);
    const nextResult = next();
    console.log('After:', nextResult);
    return nextResult;
  })
  .use(loggingMiddleware)
  .use(retryMiddleware(3));

// Execute pipeline
const result = pipeline.execute(trySync(() => operation()));

// Wrap a function
const safeFn = pipeline.wrap((x: number) => 
  trySync(() => riskyOperation(x))
);

// Clone pipeline
const cloned = pipeline.clone();

// Pipeline properties
console.log(pipeline.length); // Number of middleware`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Built-in Middleware
              </h3>
              <p className="text-slate-600 mb-3">
                Common middleware implementations ready to use.
              </p>
              <CodeBlock
                language="typescript"
                title="Built-in Middleware"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { 
  loggingMiddleware,
  retryMiddleware,
  transformMiddleware,
  enrichContextMiddleware,
  circuitBreakerMiddleware,
  rateLimitMiddleware,
  filterMiddleware,
  compose
} from 'tryError';

// Logging
pipeline.use(loggingMiddleware(console.error));
pipeline.use(loggingMiddleware(customLogger));

// Retry with predicate
pipeline.use(retryMiddleware(3, error => 
  error.type === 'NetworkError'
));

// Transform errors
pipeline.use(transformMiddleware(error => ({
  ...error,
  message: sanitize(error.message)
})));

// Enrich context
pipeline.use(enrichContextMiddleware(() => ({
  requestId: getCurrentRequestId(),
  timestamp: Date.now()
})));

// Circuit breaker
pipeline.use(circuitBreakerMiddleware({
  threshold: 5,
  timeout: 60000,
  onOpen: () => console.warn('Circuit opened'),
  onClose: () => console.info('Circuit closed')
}));

// Rate limiting
pipeline.use(rateLimitMiddleware(1000, 100)); // 100/sec

// Filter by error type
pipeline.use(filterMiddleware(
  ['NetworkError', 'TimeoutError'],
  retryMiddleware(5)
));

// Compose multiple middleware
const errorHandling = compose(
  loggingMiddleware(logger),
  retryMiddleware(3),
  transformMiddleware(sanitize)
);`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Global Registry
              </h3>
              <p className="text-slate-600 mb-3">
                Register and manage named middleware pipelines globally.
              </p>
              <CodeBlock
                language="typescript"
                title="Global Middleware Registry"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { globalRegistry } from 'tryError';

// Create named pipelines
const apiPipeline = new MiddlewarePipeline()
  .use(rateLimitMiddleware(1000, 100))
  .use(retryMiddleware(3))
  .use(loggingMiddleware);

const dbPipeline = new MiddlewarePipeline()
  .use(circuitBreakerMiddleware({ threshold: 5 }))
  .use(transformMiddleware);

// Register pipelines
globalRegistry.register('api', apiPipeline);
globalRegistry.register('database', dbPipeline);

// Retrieve pipelines
const api = globalRegistry.get('api');
const db = globalRegistry.get('database');

// List registered pipelines
const names = globalRegistry.list(); // ['api', 'database']

// Remove pipeline
globalRegistry.remove('api'); // returns boolean`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Plugin System */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Plugin System
          </h2>

          <p className="text-slate-600 mb-4">
            Extend tryError with plugins that add new capabilities and
            integrations.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Plugin Manager
              </h3>
              <p className="text-slate-600 mb-3">
                Install, enable, and manage plugins for tryError.
              </p>
              <CodeBlock
                language="typescript"
                title="Plugin Manager API"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { pluginManager, Plugin } from 'tryError';

// Install a plugin
await pluginManager.install(myPlugin);

// Enable/disable plugins
await pluginManager.enable('plugin-name');
await pluginManager.disable('plugin-name');

// Uninstall plugin
await pluginManager.uninstall('plugin-name');

// Check plugin status
const isInstalled = pluginManager.isInstalled('plugin-name');
const isEnabled = pluginManager.isEnabled('plugin-name');

// Get plugin information
const plugin = pluginManager.get('plugin-name');
const installed = pluginManager.getInstalled();
const enabled = pluginManager.getEnabled();

// Get merged configuration from all plugins
const config = pluginManager.getMergedConfig();

// Get all middleware from plugins
const middleware = pluginManager.getAllMiddleware();

// Get custom error types from plugins
const errorTypes = pluginManager.getAllErrorTypes();

// Get utilities from plugins
const utilities = pluginManager.getAllUtilities();

// Notify plugins of config changes
await pluginManager.notifyConfigChange(newConfig);`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Creating Plugins
              </h3>
              <p className="text-slate-600 mb-3">
                Build custom plugins to extend tryError functionality.
              </p>
              <CodeBlock
                language="typescript"
                title="Plugin Creation API"
                showLineNumbers={true}
                className="mb-4"
              >
                {`import { createPlugin, Plugin, PluginAPI } from 'tryError';

// Using createPlugin helper
const myPlugin = createPlugin(
  {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My custom plugin',
    dependencies: ['other-plugin']
  },
  (api: PluginAPI) => ({
    // Add middleware
    middleware: api.addMiddleware(
      loggingMiddleware,
      retryMiddleware
    ),
    
    // Create error types
    errorTypes: {
      ...api.createErrorType('CustomError', (message, context) => ({
        [TRY_ERROR_BRAND]: true,
        type: 'CustomError',
        message,
        source: 'my-plugin',
        timestamp: Date.now(),
        context
      }))
    },
    
    // Add utilities
    utilities: {
      ...api.addUtility('myHelper', helperFunction)
    }
  })
);

// Manual plugin creation
const plugin: Plugin = {
  metadata: {
    name: 'manual-plugin',
    version: '1.0.0'
  },
  
  hooks: {
    onInstall: async () => console.log('Installing'),
    onUninstall: async () => console.log('Uninstalling'),
    onEnable: async () => console.log('Enabling'),
    onDisable: async () => console.log('Disabling'),
    onConfigChange: async (config) => console.log('Config:', config)
  },
  
  capabilities: {
    config: { customOption: true },
    middleware: [customMiddleware],
    errorTypes: { CustomError: customErrorFactory },
    utilities: { helper: helperFunction }
  }
};`}
              </CodeBlock>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
