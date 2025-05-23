export default function AsyncAPIPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Asynchronous Operations
        </h1>
        <p className="text-xl text-slate-600">
          API reference for handling asynchronous operations with try-error
        </p>
      </div>

      <div className="space-y-8">
        {/* tryAsync Function */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            tryAsync
          </h2>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`function tryAsync<T>(fn: () => Promise<T>): Promise<TryResult<T, TryError>>`}</code>
            </pre>
          </div>

          <p className="text-slate-600 mb-4">
            Executes an asynchronous function and returns a Promise that
            resolves to either the result or a TryError if the promise rejects.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Parameters
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <ul className="space-y-2">
              <li>
                <code className="bg-slate-200 px-2 py-1 rounded">
                  fn: () =&gt; Promise&lt;T&gt;
                </code>{" "}
                - The async function to execute
              </li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">Returns</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <p>
              <code className="bg-slate-200 px-2 py-1 rounded">
                Promise&lt;TryResult&lt;T, TryError&gt;&gt;
              </code>{" "}
              - Promise resolving to either the result or a TryError
            </p>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Examples
          </h3>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { tryAsync, isTryError } from 'try-error';

// API calls
const fetchUser = async (id: string) => {
  const result = await tryAsync(() => fetch(\`/api/users/\${id}\`));
  if (isTryError(result)) {
    console.error('Fetch failed:', result.message);
    return null;
  }
  
  const jsonResult = await tryAsync(() => result.json());
  if (isTryError(jsonResult)) {
    console.error('JSON parse failed:', jsonResult.message);
    return null;
  }
  
  return jsonResult;
};

// File operations (Node.js)
const readFileAsync = async (path: string) => {
  const fs = require('fs').promises;
  const result = await tryAsync(() => fs.readFile(path, 'utf8'));
  return result;
};

// Database operations
const saveUser = async (user: User) => {
  const result = await tryAsync(() => db.users.create(user));
  if (isTryError(result)) {
    console.error('Database error:', result.message);
    throw new Error('Failed to save user');
  }
  return result;
};`}</code>
            </pre>
          </div>
        </section>

        {/* Common Async Patterns */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Common Async Patterns
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Sequential Operations
          </h3>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`async function processUserData(userId: string) {
  // Step 1: Fetch user
  const userResult = await tryAsync(() => fetchUser(userId));
  if (isTryError(userResult)) return userResult;
  
  // Step 2: Fetch user preferences
  const prefsResult = await tryAsync(() => fetchPreferences(userResult.id));
  if (isTryError(prefsResult)) return prefsResult;
  
  // Step 3: Combine data
  const combinedResult = trySync(() => combineUserData(userResult, prefsResult));
  return combinedResult;
}`}</code>
            </pre>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Parallel Operations
          </h3>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`async function fetchUserProfile(userId: string) {
  // Start all operations in parallel
  const [userResult, prefsResult, postsResult] = await Promise.all([
    tryAsync(() => fetchUser(userId)),
    tryAsync(() => fetchPreferences(userId)),
    tryAsync(() => fetchUserPosts(userId))
  ]);
  
  // Check each result
  if (isTryError(userResult)) {
    console.error('User fetch failed:', userResult.message);
    return userResult;
  }
  
  if (isTryError(prefsResult)) {
    console.error('Preferences fetch failed:', prefsResult.message);
    // Continue with default preferences
  }
  
  if (isTryError(postsResult)) {
    console.error('Posts fetch failed:', postsResult.message);
    // Continue with empty posts
  }
  
  return {
    user: userResult,
    preferences: isTryError(prefsResult) ? defaultPrefs : prefsResult,
    posts: isTryError(postsResult) ? [] : postsResult
  };
}`}</code>
            </pre>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Retry Logic
          </h3>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<TryResult<T, TryError>> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await tryAsync(operation);
    
    if (!isTryError(result)) {
      return result; // Success
    }
    
    if (attempt === maxRetries) {
      return result; // Final attempt failed
    }
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
  }
  
  // This should never be reached, but TypeScript requires it
  return createTryError('RETRY_EXHAUSTED', 'All retry attempts failed');
}`}</code>
            </pre>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Timeout Handling
          </h3>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`async function fetchWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<TryResult<T, TryError>> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(\`Operation timed out after \${timeoutMs}ms\`)), timeoutMs);
  });
  
  const result = await tryAsync(() => 
    Promise.race([operation(), timeoutPromise])
  );
  
  return result;
}`}</code>
            </pre>
          </div>
        </section>

        {/* Error Handling Strategies */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Handling Strategies
          </h2>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Graceful Degradation
          </h3>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`async function loadDashboard(userId: string) {
  // Critical data - must succeed
  const userResult = await tryAsync(() => fetchUser(userId));
  if (isTryError(userResult)) {
    return { error: 'Failed to load user data', user: null };
  }
  
  // Optional data - can fail gracefully
  const [notificationsResult, analyticsResult] = await Promise.all([
    tryAsync(() => fetchNotifications(userId)),
    tryAsync(() => fetchAnalytics(userId))
  ]);
  
  return {
    user: userResult,
    notifications: isTryError(notificationsResult) ? [] : notificationsResult,
    analytics: isTryError(analyticsResult) ? null : analyticsResult,
    warnings: [
      ...(isTryError(notificationsResult) ? ['Failed to load notifications'] : []),
      ...(isTryError(analyticsResult) ? ['Failed to load analytics'] : [])
    ]
  };
}`}</code>
            </pre>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Circuit Breaker Pattern
          </h3>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute
  
  async execute<T>(operation: () => Promise<T>): Promise<TryResult<T, TryError>> {
    if (this.isOpen()) {
      return createTryError('CIRCUIT_OPEN', 'Circuit breaker is open');
    }
    
    const result = await tryAsync(operation);
    
    if (isTryError(result)) {
      this.recordFailure();
    } else {
      this.reset();
    }
    
    return result;
  }
  
  private isOpen(): boolean {
    return this.failures >= this.threshold && 
           Date.now() - this.lastFailureTime < this.timeout;
  }
  
  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }
  
  private reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
  }
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
                <li>• Always await tryAsync calls</li>
                <li>• Check for errors before using async results</li>
                <li>• Use Promise.all for parallel operations</li>
                <li>• Implement proper timeout handling</li>
                <li>• Consider retry logic for transient failures</li>
                <li>• Use graceful degradation for non-critical operations</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Forget to await tryAsync calls</li>
                <li>• Use tryAsync for synchronous operations</li>
                <li>• Ignore error cases in async flows</li>
                <li>
                  • Chain too many sequential operations without error handling
                </li>
                <li>• Mix tryAsync with traditional try/catch unnecessarily</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related APIs */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Related APIs
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">trySync</h3>
              <p className="text-slate-600 text-sm mb-3">
                For synchronous operations that might throw
              </p>
              <a
                href="/docs/api/sync"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View trySync →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Error Creation
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Creating custom errors and error factories
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
