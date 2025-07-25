import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedCodeBlock } from "@/components/EnhancedCodeBlock";

export default function PerformanceOptimizationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Performance Optimization</h1>
        <p className="text-xl text-muted-foreground">
          Advanced techniques to optimize tryError for high-performance
          applications
        </p>
      </div>

      <Alert>
        <AlertTitle>Performance First</AlertTitle>
        <AlertDescription>
          tryError is designed with performance in mind. These optimization
          features allow you to fine-tune performance for your specific use case
          while maintaining zero overhead when not used.
        </AlertDescription>
      </Alert>

      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-semibold mb-4">Object Pooling</h2>
          <p className="text-muted-foreground mb-6">
            Reduce garbage collection pressure and improve performance in
            high-throughput scenarios by reusing error objects from a
            pre-allocated pool.
          </p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>When to Use Object Pooling</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>High-frequency error creation (1000+ errors/second)</li>
                <li>Memory-sensitive environments (edge computing, IoT)</li>
                <li>Real-time applications where GC pauses matter</li>
                <li>Microservices handling many concurrent requests</li>
              </ul>
            </CardContent>
          </Card>

          <Tabs defaultValue="basic" className="mb-8">
            <TabsList>
              <TabsTrigger value="basic">Basic Usage</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { configure, trySync } from '@try-error/core';

// Enable object pooling globally
configure({
  performance: {
    errorCreation: {
      objectPooling: true,
      poolSize: 100 // Default size
    }
  }
});

// Errors are now allocated from the pool
function processRequest(data: unknown) {
  const result = trySync(() => {
    // Your logic here
    if (!data) throw new Error('Invalid data');
    return processData(data);
  });
  
  // Error objects are automatically returned to the pool
  // when they go out of scope
  return result;
}`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="configuration">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { configureErrorPool, getErrorPoolStats } from '@try-error/core';

// Configure the global error pool
configureErrorPool({
  enabled: true,
  maxSize: 200  // Maximum pool size
});

// Or configure per-scope pools
import { ErrorPool } from '@try-error/core';

const requestPool = new ErrorPool(50);

function handleRequest() {
  const error = requestPool.acquire();
  try {
    // Use the error
    error.type = 'RequestError';
    error.message = 'Failed to process';
    // ...
  } finally {
    // Always release back to pool
    requestPool.release(error);
  }
}`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="monitoring">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { getErrorPoolStats } from '@try-error/core';

// Monitor pool performance
const stats = getErrorPoolStats();
console.log({
  poolSize: stats.poolSize,
  activeCount: stats.activeCount,
  hits: stats.hits,
  misses: stats.misses,
  hitRate: stats.hitRate,
  creates: stats.creates,
  returns: stats.returns
});

// Example output:
// {
//   poolSize: 95,
//   activeCount: 5,
//   hits: 9500,
//   misses: 500,
//   hitRate: 0.95,
//   creates: 100,
//   returns: 9400
// }`}
              </EnhancedCodeBlock>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Lazy Evaluation</h2>
          <p className="text-muted-foreground mb-6">
            Defer expensive computations like stack trace generation until
            they're actually needed, significantly reducing the cost of error
            creation.
          </p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performance Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Without Lazy Evaluation</p>
                  <ul className="text-sm text-muted-foreground mt-2">
                    <li>• Stack trace: ~0.5-2ms per error</li>
                    <li>• Source location: ~0.1-0.3ms</li>
                    <li>• Total: ~0.6-2.3ms per error</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">With Lazy Evaluation</p>
                  <ul className="text-sm text-muted-foreground mt-2">
                    <li>• Initial creation: ~0.01ms</li>
                    <li>• On-demand computation</li>
                    <li>• Zero cost if not accessed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="auto" className="mb-8">
            <TabsList>
              <TabsTrigger value="auto">Automatic</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="debugging">Debugging</TabsTrigger>
            </TabsList>

            <TabsContent value="auto">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { configure, trySync } from '@try-error/core';

// Enable lazy evaluation globally
configure({
  performance: {
    errorCreation: {
      lazyStackTrace: true,
      lazySourceLocation: true
    }
  }
});

// Stack traces are now computed on-demand
const result = trySync(() => riskyOperation());

if (isTryError(result)) {
  // Stack trace is computed only when accessed
  console.error(result.stack);
  
  // Source location is also lazy
  console.error(\`Error at \${result.source}\`);
}`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="manual">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { createLazyError, makeLazy, forceLazyEvaluation } from '@try-error/core';

// Create an error with lazy properties
const error = createLazyError({
  type: 'LazyError',
  message: 'Something went wrong',
  getSource: () => {
    // Expensive source location computation
    return computeSourceLocation();
  },
  getStack: () => {
    // Expensive stack trace generation
    return new Error().stack;
  },
  getTimestamp: () => Date.now()
});

// Make existing error lazy
const lazyError = makeLazy(existingError, {
  stack: () => expensiveStackComputation(),
  context: () => gatherContextData()
});

// Force all lazy properties to evaluate
const evaluatedError = forceLazyEvaluation(lazyError);`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="debugging">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { createDebugProxy, isLazyProperty } from '@try-error/core';

// Create a debug proxy to monitor property access
const debugError = createDebugProxy(error);

// Logs: "Lazy evaluation triggered for property: stack"
console.log(debugError.stack);

// Check if a property is lazy
if (isLazyProperty(error, 'source')) {
  console.log('Source will be computed on first access');
}

// In development, you can see what's being accessed
const monitoredError = createDebugProxy(error);
// Any lazy property access will be logged to console`}
              </EnhancedCodeBlock>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">
            Performance Configuration
          </h2>
          <p className="text-muted-foreground mb-6">
            Fine-tune tryError's performance characteristics for your specific
            use case.
          </p>

          <EnhancedCodeBlock language="typescript" showLineNumbers>
            {`import { configure, ConfigPresets } from '@try-error/core';

// Use preset configurations
configure(ConfigPresets.minimal()); // Maximum performance
configure(ConfigPresets.production()); // Balanced
configure(ConfigPresets.development()); // Full debugging

// Or create custom configuration
configure({
  performance: {
    errorCreation: {
      objectPooling: true,
      poolSize: 200,
      lazyStackTrace: true,
      lazySourceLocation: true
    },
    contextCapture: {
      maxDepth: 3,
      maxProperties: 50,
      excludePatterns: ['password', 'token', 'secret']
    },
    memoryManagement: {
      maxErrorsInMemory: 1000,
      errorTTL: 60000 // 1 minute
    }
  },
  
  // Minimal mode for maximum performance
  minimalErrors: true,
  skipTimestamp: true,
  skipContext: true,
  skipSourceLocation: true
});`}
          </EnhancedCodeBlock>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Benchmarks</h2>
          <p className="text-muted-foreground mb-6">
            Real-world performance measurements across different configurations.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Error Creation Performance</CardTitle>
              <CardDescription>
                Operations per second (higher is better)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Native throw/catch</span>
                  <Badge variant="outline">~500K ops/sec</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>tryError (minimal mode)</span>
                  <Badge variant="outline">~450K ops/sec</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>tryError (with pooling)</span>
                  <Badge variant="outline">~400K ops/sec</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>tryError (lazy evaluation)</span>
                  <Badge variant="outline">~420K ops/sec</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>tryError (default)</span>
                  <Badge variant="outline">~350K ops/sec</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>tryError (full features)</span>
                  <Badge variant="outline">~250K ops/sec</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Best Practices</h2>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose the Right Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    • Use <code>ConfigPresets.minimal()</code> for hot paths
                  </li>
                  <li>• Enable object pooling for high-frequency errors</li>
                  <li>
                    • Use lazy evaluation when stack traces are rarely needed
                  </li>
                  <li>
                    • Disable features you don't need (timestamps, context,
                    etc.)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`// Track error creation rate
let errorCount = 0;
setInterval(() => {
  console.log(\`Errors/sec: \${errorCount}\`);
  errorCount = 0;
}, 1000);

// Monitor pool efficiency
setInterval(() => {
  const stats = getErrorPoolStats();
  if (stats && stats.hitRate < 0.8) {
    console.warn('Pool hit rate low:', stats.hitRate);
  }
}, 5000);`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
