import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedCodeBlock } from "@/components/EnhancedCodeBlock";

export default function MiddlewarePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Middleware System</h1>
        <p className="text-xl text-muted-foreground">
          Extend tryError with custom logic using a powerful middleware pipeline
        </p>
      </div>

      <Alert>
        <AlertTitle>Flexible Extension</AlertTitle>
        <AlertDescription>
          The middleware system allows you to intercept and modify error
          handling behavior without modifying tryError's core. Perfect for
          logging, monitoring, transformation, and integration with external
          services.
        </AlertDescription>
      </Alert>

      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-semibold mb-4">Basic Concepts</h2>
          <p className="text-muted-foreground mb-6">
            Middleware functions intercept TryResult values and can modify them,
            log them, or perform side effects before passing control to the next
            middleware.
          </p>

          <EnhancedCodeBlock language="typescript" showLineNumbers>
            {`import { ErrorMiddleware, TryResult, TryError } from 'tryError';

// Basic middleware signature
type ErrorMiddleware<T = any, E extends TryError = TryError> = (
  result: TryResult<T, E>,
  next: () => TryResult<T, E>
) => TryResult<T, E>;

// Example: Simple logging middleware
const loggingMiddleware: ErrorMiddleware = (result, next) => {
  if (isTryError(result)) {
    console.error('Error occurred:', result);
  }
  return next(); // Pass control to next middleware
};`}
          </EnhancedCodeBlock>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Using Middleware</h2>

          <Tabs defaultValue="pipeline" className="mb-8">
            <TabsList>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="global">Global Registry</TabsTrigger>
              <TabsTrigger value="composition">Composition</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { MiddlewarePipeline } from 'tryError';

// Create a middleware pipeline
const pipeline = new MiddlewarePipeline();

// Add middleware to the pipeline
pipeline
  .use(loggingMiddleware)
  .use(retryMiddleware(3))
  .use(transformMiddleware);

// Execute with a result
const result = pipeline.execute(trySync(() => riskyOperation()));

// Or wrap a function
const safeFn = pipeline.wrap((x: number) => 
  trySync(() => {
    if (x < 0) throw new Error('Negative number');
    return Math.sqrt(x);
  })
);

const result = safeFn(16); // Middleware applied automatically`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="global">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { globalRegistry, MiddlewarePipeline } from 'tryError';

// Create named pipelines
const apiPipeline = new MiddlewarePipeline()
  .use(rateLimitMiddleware(1000, 100))
  .use(retryMiddleware(3))
  .use(loggingMiddleware);

const dbPipeline = new MiddlewarePipeline()
  .use(circuitBreakerMiddleware({ threshold: 5, timeout: 60000 }))
  .use(transformMiddleware);

// Register globally
globalRegistry.register('api', apiPipeline);
globalRegistry.register('database', dbPipeline);

// Use anywhere in your app
const apiMiddleware = globalRegistry.get('api');
const result = apiMiddleware.execute(tryAsync(() => fetchData()));`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="composition">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { compose, filterMiddleware } from 'tryError';

// Compose multiple middleware into one
const errorHandling = compose(
  loggingMiddleware,
  retryMiddleware(3),
  enrichContextMiddleware(() => ({
    timestamp: Date.now(),
    environment: process.env.NODE_ENV
  }))
);

// Apply middleware only to specific error types
const networkErrorHandler = filterMiddleware(
  ['NetworkError', 'TimeoutError'],
  compose(
    retryMiddleware(5, error => error.type === 'TimeoutError'),
    circuitBreakerMiddleware({ threshold: 3, timeout: 30000 })
  )
);

// Use the composed middleware
pipeline.use(errorHandling).use(networkErrorHandler);`}
              </EnhancedCodeBlock>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Built-in Middleware</h2>
          <p className="text-muted-foreground mb-6">
            tryError provides a collection of common middleware patterns ready
            to use.
          </p>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Logging Middleware</CardTitle>
                <CardDescription>
                  Log errors to console or external services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`import { loggingMiddleware } from 'tryError';

// Simple console logging
pipeline.use(loggingMiddleware(console.error));

// Custom logger
const customLogger = (error: TryError) => {
  myLoggingService.log({
    level: 'error',
    message: error.message,
    type: error.type,
    context: error.context,
    timestamp: error.timestamp
  });
};

pipeline.use(loggingMiddleware(customLogger));`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retry Middleware</CardTitle>
                <CardDescription>
                  Automatically retry failed operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`import { retryMiddleware } from 'tryError';

// Retry up to 3 times
pipeline.use(retryMiddleware(3));

// With custom retry logic
const shouldRetry = (error: TryError) => {
  // Only retry network errors
  return error.type === 'NetworkError' && 
         error.context?.statusCode !== 404;
};

pipeline.use(retryMiddleware(5, shouldRetry));

// Note: Retry middleware tracks attempts internally
// Each call to the pipeline counts as one attempt`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transform Middleware</CardTitle>
                <CardDescription>
                  Modify errors before they're returned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`import { transformMiddleware } from 'tryError';

// Add additional context
const addRequestId = transformMiddleware(error => ({
  ...error,
  context: {
    ...error.context,
    requestId: generateRequestId()
  }
}));

// Sanitize sensitive data
const sanitize = transformMiddleware(error => ({
  ...error,
  message: error.message.replace(/password=\S+/g, 'password=***'),
  context: omit(error.context, ['password', 'apiKey'])
}));

pipeline.use(addRequestId).use(sanitize);`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Circuit Breaker Middleware</CardTitle>
                <CardDescription>
                  Prevent cascading failures in distributed systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`import { circuitBreakerMiddleware } from 'tryError';

const circuitBreaker = circuitBreakerMiddleware({
  threshold: 5,        // Open after 5 failures
  timeout: 60000,      // Try again after 1 minute
  onOpen: () => {
    console.warn('Circuit breaker opened!');
    alertOpsTeam();
  },
  onClose: () => {
    console.info('Circuit breaker closed');
  }
});

pipeline.use(circuitBreaker);

// When circuit is open, requests fail fast with:
// { type: 'CircuitBreakerOpen', message: 'Circuit breaker is open' }`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limit Middleware</CardTitle>
                <CardDescription>
                  Limit error frequency to prevent spam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`import { rateLimitMiddleware } from 'tryError';

// Allow max 100 errors per second
const rateLimiter = rateLimitMiddleware(1000, 100);

pipeline.use(rateLimiter);

// Errors beyond limit return:
// { 
//   type: 'RateLimitExceeded',
//   message: 'Rate limit exceeded: 100 errors in 1000ms',
//   context: { windowMs: 1000, maxErrors: 100, currentCount: 100 }
// }`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Context Enrichment</CardTitle>
                <CardDescription>
                  Add contextual information to errors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`import { enrichContextMiddleware } from 'tryError';

// Add static context
pipeline.use(enrichContextMiddleware(() => ({
  service: 'api-gateway',
  version: process.env.APP_VERSION,
  region: process.env.AWS_REGION
})));

// Add dynamic context
pipeline.use(enrichContextMiddleware(() => ({
  timestamp: Date.now(),
  requestId: getCurrentRequestId(),
  userId: getCurrentUserId(),
  memory: process.memoryUsage()
})));`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">
            Creating Custom Middleware
          </h2>
          <p className="text-muted-foreground mb-6">
            Build your own middleware to handle specific requirements.
          </p>

          <Tabs defaultValue="monitoring" className="mb-8">
            <TabsList>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
              <TabsTrigger value="async">Async Operations</TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`// Send errors to monitoring service
const monitoringMiddleware: ErrorMiddleware = (result, next) => {
  if (isTryError(result)) {
    // Non-blocking send to monitoring
    sendToMonitoring({
      error: {
        type: result.type,
        message: result.message,
        stack: result.stack,
        context: result.context
      },
      metadata: {
        service: 'my-service',
        timestamp: result.timestamp,
        severity: getSeverity(result.type)
      }
    }).catch(console.error); // Don't let monitoring fail the request
  }
  
  return next();
};

// Metrics collection
const metricsMiddleware: ErrorMiddleware = (result, next) => {
  const start = performance.now();
  const nextResult = next();
  const duration = performance.now() - start;
  
  if (isTryError(nextResult)) {
    metrics.increment('errors.total', {
      type: nextResult.type,
      duration: Math.round(duration)
    });
  }
  
  return nextResult;
};`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="recovery">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`// Fallback to cached data on error
const cacheFailoverMiddleware: ErrorMiddleware = (result, next) => {
  const nextResult = next();
  
  if (isTryError(nextResult) && nextResult.type === 'NetworkError') {
    const cached = cache.get(nextResult.context?.cacheKey);
    if (cached) {
      console.warn('Using cached data due to network error');
      return cached; // Return success with cached data
    }
  }
  
  return nextResult;
};

// Graceful degradation
const degradationMiddleware: ErrorMiddleware = (result, next) => {
  const nextResult = next();
  
  if (isTryError(nextResult)) {
    // Return partial data instead of failing completely
    if (nextResult.context?.partialData) {
      return {
        ...nextResult.context.partialData,
        _degraded: true,
        _originalError: nextResult
      };
    }
  }
  
  return nextResult;
};`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="async">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`// Async middleware for external services
const asyncNotificationMiddleware: ErrorMiddleware = (result, next) => {
  if (isTryError(result) && result.type === 'CriticalError') {
    // Fire and forget
    (async () => {
      try {
        await notifyOpsTeam(result);
        await createJiraTicket(result);
        await updateStatusPage('degraded');
      } catch (e) {
        console.error('Failed to send notifications:', e);
      }
    })();
  }
  
  return next();
};

// Batch errors for efficient processing
const batchingMiddleware = (() => {
  const errorBatch: TryError[] = [];
  let timer: NodeJS.Timeout;
  
  const flush = async () => {
    if (errorBatch.length > 0) {
      const errors = [...errorBatch];
      errorBatch.length = 0;
      await sendBatchToAnalytics(errors);
    }
  };
  
  return (result: TryResult, next: () => TryResult) => {
    if (isTryError(result)) {
      errorBatch.push(result);
      
      clearTimeout(timer);
      timer = setTimeout(flush, 1000); // Flush every second
      
      if (errorBatch.length >= 100) {
        flush(); // Or when batch is full
      }
    }
    
    return next();
  };
})();`}
              </EnhancedCodeBlock>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Best Practices</h2>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Middleware Order Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Middleware executes in the order it's added:
                </p>
                <EnhancedCodeBlock language="typescript">
                  {`// ❌ Wrong order - retry happens after transform
pipeline
  .use(transformMiddleware)
  .use(retryMiddleware(3));

// ✅ Correct order - retry original operation
pipeline
  .use(retryMiddleware(3))
  .use(transformMiddleware);`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Always Call Next</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`// ❌ Forgetting to call next breaks the chain
const badMiddleware = (result, next) => {
  if (isTryError(result)) {
    console.error(result);
    // Missing: return next();
  }
  return result; // Wrong!
};

// ✅ Always call next or return a result
const goodMiddleware = (result, next) => {
  if (isTryError(result)) {
    console.error(result);
  }
  return next(); // Continue the chain
};`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Handle Middleware Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`// Wrap middleware operations in try-catch
const safeMiddleware: ErrorMiddleware = (result, next) => {
  try {
    if (isTryError(result)) {
      // Potentially failing operation
      externalService.logError(result);
    }
  } catch (e) {
    // Don't let middleware errors break the app
    console.error('Middleware error:', e);
  }
  
  return next();
};`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
