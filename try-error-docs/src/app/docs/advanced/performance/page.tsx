export default function PerformancePage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Performance & Best Practices
        </h1>
        <p className="text-xl text-slate-600">
          Optimize try-error for performance and follow best practices for
          robust error handling
        </p>
      </div>

      <div className="space-y-8">
        {/* Performance Optimization */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Performance Optimization
          </h2>

          <p className="text-slate-600 mb-6">
            try-error is designed to be lightweight and performant, but there
            are several ways to optimize it further for your specific use case.
          </p>

          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Stack Trace Optimization
              </h3>
              <p className="text-slate-600 mb-3">
                Stack trace capture can be expensive. Optimize based on your
                environment.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Production: Disable stack traces for performance
configureTryError({
  captureStackTrace: process.env.NODE_ENV !== 'production',
  stackTraceLimit: process.env.NODE_ENV === 'production' ? 0 : 10
});

// Alternative: Lazy stack trace capture
configureTryError({
  lazyStackTrace: true, // Only capture when accessed
  stackTraceLimit: 5    // Limit depth in production
});`}</code>
                </pre>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 text-sm mb-1">
                  Performance Impact
                </h4>
                <p className="text-green-700 text-sm">
                  Disabling stack traces can improve error creation performance
                  by 60-80% in production.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Context Size Management
              </h3>
              <p className="text-slate-600 mb-3">
                Large error contexts can impact memory usage and serialization
                performance.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Limit context size
configurePerformance({
  contextCapture: {
    maxContextSize: 1024 * 5, // 5KB limit
    deepClone: false,         // Avoid deep cloning large objects
    timeout: 50              // Timeout async context capture
  }
});

// Smart context filtering
function createOptimizedError(type: string, message: string, context: any) {
  // Filter out large or unnecessary context
  const filteredContext = {
    ...context,
    // Remove large arrays/objects
    largeData: context.largeData ? '[TRUNCATED]' : undefined,
    // Keep only essential fields
    userId: context.userId,
    requestId: context.requestId,
    timestamp: Date.now()
  };
  
  return createTryError(type, message, filteredContext);
}`}</code>
                </pre>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Object Pooling
              </h3>
              <p className="text-slate-600 mb-3">
                For high-frequency error scenarios, consider object pooling to
                reduce GC pressure.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Enable experimental object pooling
configurePerformance({
  errorCreation: {
    objectPooling: true,
    poolSize: 100
  }
});

// Manual pooling for critical paths
class ErrorPool {
  private pool: TryError[] = [];
  
  get(type: string, message: string, context?: any): TryError {
    const error = this.pool.pop() || this.createNew();
    this.reset(error, type, message, context);
    return error;
  }
  
  release(error: TryError): void {
    if (this.pool.length < 50) { // Max pool size
      this.pool.push(error);
    }
  }
  
  private createNew(): TryError {
    return createTryError('', '');
  }
  
  private reset(error: TryError, type: string, message: string, context?: any): void {
    (error as any).type = type;
    (error as any).message = message;
    (error as any).context = context;
    (error as any).timestamp = Date.now();
  }
}

const errorPool = new ErrorPool();`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Best Practices
          </h2>

          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Type Consistency
              </h3>
              <p className="text-slate-600 mb-3">
                Use consistent error types across your application for better
                error handling.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Define error types as constants
export const ErrorTypes = {
  VALIDATION: 'ValidationError',
  NETWORK: 'NetworkError',
  AUTH: 'AuthenticationError',
  PERMISSION: 'AuthorizationError',
  NOT_FOUND: 'NotFoundError',
  CONFLICT: 'ConflictError',
  RATE_LIMIT: 'RateLimitError'
} as const;

// Use type-safe error creation
function createValidationError(field: string, value: unknown, rule: string) {
  return createTryError(ErrorTypes.VALIDATION, \`Validation failed for \${field}\`, {
    field,
    value,
    rule
  });
}

// Centralized error handling
function handleApiError(error: TryError): ApiResponse {
  switch (error.type) {
    case ErrorTypes.VALIDATION:
      return { status: 400, message: error.message, details: error.context };
    case ErrorTypes.AUTH:
      return { status: 401, message: 'Authentication required' };
    case ErrorTypes.PERMISSION:
      return { status: 403, message: 'Insufficient permissions' };
    case ErrorTypes.NOT_FOUND:
      return { status: 404, message: 'Resource not found' };
    default:
      return { status: 500, message: 'Internal server error' };
  }
}`}</code>
                </pre>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Context Best Practices
              </h3>
              <p className="text-slate-600 mb-3">
                Include relevant context while avoiding sensitive or excessive
                data.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Good: Relevant, structured context
const result = await tryAsync(async () => {
  const user = await fetchUser(userId);
  if (!user) {
    throw createTryError('NotFoundError', 'User not found', {
      userId,
      requestId: getRequestId(),
      timestamp: Date.now(),
      searchCriteria: { id: userId }
    });
  }
  return user;
});

// Bad: Sensitive or excessive context
const badResult = await tryAsync(async () => {
  const user = await fetchUser(userId);
  if (!user) {
    throw createTryError('NotFoundError', 'User not found', {
      password: user?.password, // ❌ Sensitive data
      entireDatabase: database,  // ❌ Too much data
      randomData: Math.random()  // ❌ Irrelevant data
    });
  }
  return user;
});

// Context sanitization helper
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized = { ...context };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  sensitiveFields.forEach(field => delete sanitized[field]);
  
  // Truncate large strings
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
      sanitized[key] = sanitized[key].substring(0, 1000) + '...[truncated]';
    }
  });
  
  return sanitized;
}`}</code>
                </pre>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Propagation
              </h3>
              <p className="text-slate-600 mb-3">
                Handle errors at the appropriate level and avoid swallowing
                important errors.
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3">
                <pre>
                  <code>{`// Good: Handle errors at the right level
async function processUserData(userId: string): Promise<TryResult<ProcessedData, TryError>> {
  const userResult = await fetchUser(userId);
  if (isTryError(userResult)) {
    // Log but don't handle - let caller decide
    console.error('Failed to fetch user:', userResult);
    return userResult;
  }
  
  const validationResult = validateUser(userResult);
  if (isTryError(validationResult)) {
    // Handle validation errors here - they're specific to this function
    return createTryError('ProcessingError', 'User data validation failed', {
      userId,
      validationError: validationResult,
      step: 'validation'
    });
  }
  
  return processData(validationResult);
}

// Bad: Swallowing errors
async function badProcessUserData(userId: string): Promise<ProcessedData | null> {
  try {
    const user = await fetchUser(userId);
    return processData(user);
  } catch (error) {
    console.log('Something went wrong'); // ❌ Lost error information
    return null; // ❌ Caller can't distinguish between "no data" and "error"
  }
}

// Error enrichment pattern
function enrichError(originalError: TryError, additionalContext: Record<string, any>): TryError {
  return createTryError(
    originalError.type,
    originalError.message,
    {
      ...originalError.context,
      ...additionalContext,
      originalError: {
        type: originalError.type,
        message: originalError.message,
        source: originalError.source
      }
    },
    originalError
  );
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Memory Management */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Memory Management
          </h2>

          <p className="text-slate-600 mb-4">
            Proper memory management is crucial for long-running applications.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// Configure memory limits
configurePerformance({
  memory: {
    maxErrorHistory: 50,     // Limit error history
    useWeakRefs: true,       // Use weak references for large contexts
    gcHints: true,           // Provide GC hints
    autoCleanup: true,       // Automatic cleanup of old errors
    cleanupInterval: 60000   // Cleanup every minute
  }
});

// Manual memory management
class ErrorManager {
  private errorHistory: TryError[] = [];
  private readonly maxHistory = 100;
  
  addError(error: TryError): void {
    this.errorHistory.push(error);
    
    // Cleanup old errors
    if (this.errorHistory.length > this.maxHistory) {
      const removed = this.errorHistory.splice(0, this.errorHistory.length - this.maxHistory);
      // Clear references to help GC
      removed.forEach(err => {
        (err as any).context = null;
        (err as any).cause = null;
      });
    }
  }
  
  getRecentErrors(count: number = 10): TryError[] {
    return this.errorHistory.slice(-count);
  }
  
  clearHistory(): void {
    this.errorHistory.forEach(err => {
      (err as any).context = null;
      (err as any).cause = null;
    });
    this.errorHistory.length = 0;
  }
}

// Avoid memory leaks in long-running processes
setInterval(() => {
  if (global.gc) {
    global.gc(); // Force garbage collection if available
  }
}, 300000); // Every 5 minutes`}</code>
            </pre>
          </div>
        </section>

        {/* Monitoring and Observability */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Monitoring and Observability
          </h2>

          <p className="text-slate-600 mb-4">
            Set up proper monitoring to track error patterns and performance.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// Error metrics collection
class ErrorMetrics {
  private metrics = new Map<string, number>();
  private performanceMetrics = new Map<string, number[]>();
  
  recordError(error: TryError): void {
    // Count by error type
    const count = this.metrics.get(error.type) || 0;
    this.metrics.set(error.type, count + 1);
    
    // Track performance impact
    const duration = Date.now() - error.timestamp;
    const durations = this.performanceMetrics.get(error.type) || [];
    durations.push(duration);
    this.performanceMetrics.set(error.type, durations.slice(-100)); // Keep last 100
  }
  
  getErrorCounts(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
  
  getAverageErrorDuration(type: string): number {
    const durations = this.performanceMetrics.get(type) || [];
    return durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;
  }
  
  exportMetrics(): any {
    return {
      errorCounts: this.getErrorCounts(),
      averageDurations: Object.fromEntries(
        Array.from(this.performanceMetrics.keys()).map(type => [
          type,
          this.getAverageErrorDuration(type)
        ])
      ),
      timestamp: Date.now()
    };
  }
}

const errorMetrics = new ErrorMetrics();

// Configure monitoring
configureTryError({
  onError: (error) => {
    errorMetrics.recordError(error);
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      sendToDatadog(error);
      sendToSentry(error);
    }
    
    return error;
  }
});

// Health check endpoint
app.get('/health/errors', (req, res) => {
  res.json(errorMetrics.exportMetrics());
});`}</code>
            </pre>
          </div>
        </section>

        {/* Testing Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Testing Best Practices
          </h2>

          <p className="text-slate-600 mb-4">
            Comprehensive testing strategies for error handling code.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`// Test error scenarios explicitly
describe('User Service', () => {
  it('should handle user not found', async () => {
    const result = await UserService.findById('non-existent');
    
    expect(result).toBeTryError();
    expect(result).toHaveErrorType('NotFoundError');
    expect(result.context).toEqual({
      userId: 'non-existent',
      searchCriteria: { id: 'non-existent' }
    });
  });
  
  it('should handle network errors', async () => {
    // Mock network failure
    jest.spyOn(fetch, 'fetch').mockRejectedValue(new Error('Network error'));
    
    const result = await UserService.fetchFromApi('123');
    
    expect(result).toBeTryError();
    expect(result).toHaveErrorType('NetworkError');
  });
  
  it('should preserve error context through transformations', async () => {
    const originalError = createTryError('ValidationError', 'Invalid email', {
      field: 'email',
      value: 'invalid'
    });
    
    const enrichedError = enrichError(originalError, { userId: '123' });
    
    expect(enrichedError.context.field).toBe('email');
    expect(enrichedError.context.userId).toBe('123');
    expect(enrichedError.cause).toBe(originalError);
  });
});

// Performance testing
describe('Error Performance', () => {
  it('should create errors efficiently', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      createTryError('TestError', 'Test message', { iteration: i });
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });
  
  it('should not leak memory', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Create many errors
    for (let i = 0; i < 10000; i++) {
      const error = createTryError('TestError', 'Test', { data: new Array(100).fill(i) });
      // Simulate error being processed and discarded
    }
    
    // Force garbage collection
    if (global.gc) global.gc();
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});`}</code>
            </pre>
          </div>
        </section>

        {/* Performance Checklist */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Performance Checklist
          </h2>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Disable stack traces in production
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Limit error context size (&lt; 5KB)
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Use consistent error types</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Sanitize sensitive data from context
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Configure appropriate logging levels
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Set up error monitoring and alerting
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Test error scenarios explicitly</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Monitor memory usage in long-running processes
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Use error pooling for high-frequency scenarios
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">
                  Configure environment-specific error handling
                </span>
              </label>
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
              <h3 className="font-semibold text-slate-900 mb-2">
                Configuration
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Detailed configuration options for optimization
              </p>
              <a
                href="/docs/reference/configuration"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Configuration →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Integration Guides
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Framework-specific optimization tips
              </p>
              <a
                href="/docs/guides/integration"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Integration →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Error Types</h3>
              <p className="text-slate-600 text-sm mb-3">
                Standard error types and their usage
              </p>
              <a
                href="/docs/reference/error-codes"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error Types →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
