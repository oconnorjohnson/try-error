import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

export default function ConfigurationPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Configuration Reference
        </h1>
        <p className="text-xl text-slate-600">
          Configure try-error behavior and customize error handling for your
          application
        </p>
      </div>

      {/* When is configuration needed */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          💡 Do I need to configure try-error?
        </h2>
        <div className="space-y-3">
          <p className="text-blue-800 text-sm">
            <strong>Short answer:</strong> No! try-error works perfectly out of
            the box without any configuration.
          </p>
          <p className="text-blue-700 text-sm">
            Configuration is <strong>optional</strong> and only needed when you
            want to:
          </p>
          <ul className="text-blue-700 text-sm space-y-1 ml-4">
            <li>
              • Optimize performance for production (disable stack traces, etc.)
            </li>
            <li>• Set up error monitoring and reporting</li>
            <li>• Customize error behavior for your specific needs</li>
            <li>• Use environment-specific settings</li>
          </ul>
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-3">
            <p className="text-blue-800 text-sm">
              <strong>Getting started?</strong> Just import and use{" "}
              <code>trySync()</code>, <code>tryAsync()</code>, and{" "}
              <code>createTryError()</code> directly. Come back here when you
              need customization!
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quick Setup */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Quick Setup (Recommended)
          </h2>

          <p className="text-slate-600 mb-4">
            Use our one-liner setup utilities for instant optimization with
            sensible defaults. These functions automatically configure try-error
            for your environment.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              ⚡ Environment-Specific Setup
            </h3>
            <CodeBlock
              language="typescript"
              title="One-Liner Setup for Any Environment"
              showLineNumbers={true}
              className="mb-4"
            >
              {`// Import setup utilities (tree-shakeable)
import { setupNode, setupReact, setupNextJs, autoSetup } from 'try-error/setup';

// Node.js/Express - Automatic environment detection
setupNode(); // ✨ Optimized for dev/prod automatically

// React/Vite - Browser-optimized configuration  
setupReact(); // ✨ Perfect for client-side apps

// Next.js - Handles both SSR and client-side
setupNextJs(); // ✨ Works for both server and client

// Auto-detect environment (works everywhere)
autoSetup(); // ✨ Detects Node.js, React, Next.js, etc.

// High-performance (for critical applications)
import { setupPerformance } from 'try-error/setup';
setupPerformance(); // ✨ Maximum performance, minimal overhead

// Testing environment
import { setupTesting } from 'try-error/setup';
setupTesting(); // ✨ Test-friendly configuration`}
            </CodeBlock>
            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
              <h4 className="font-semibold text-green-900 text-sm mb-1">
                🎯 Benefits of Quick Setup
              </h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>
                  • <strong>Zero boilerplate:</strong> One line replaces 20+
                  lines of configuration
                </li>
                <li>
                  • <strong>Environment-aware:</strong> Automatically optimizes
                  for dev/prod/test
                </li>
                <li>
                  • <strong>Best practices:</strong> Includes performance
                  optimizations by default
                </li>
                <li>
                  • <strong>Tree-shakeable:</strong> Only includes what you use
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Setup with Custom Options
              </h3>
              <p className="text-slate-600 mb-3">
                All setup functions accept custom options to override defaults.
              </p>
              <CodeBlock
                language="typescript"
                title="Custom Setup Options"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Setup with custom error reporting
setupNode({
  onError: (error) => {
    // Send to your monitoring service
    sendToSentry(error);
    sendToDatadog(error);
    return error;
  }
});

// React setup with analytics
setupReact({
  onError: (error) => {
    // Send to analytics
    gtag('event', 'exception', {
      description: \`\${error.type}: \${error.message}\`,
      fatal: false
    });
    return error;
  }
});

// Next.js with custom serialization
setupNextJs({
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    timestamp: error.timestamp
  })
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Custom Setup Function
              </h3>
              <p className="text-slate-600 mb-3">
                Create your own setup function with organizational defaults.
              </p>
              <CodeBlock
                language="typescript"
                title="Organization-Specific Setup"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { createCustomSetup } from 'try-error/setup';

// Create your organization's standard setup
const setupMyApp = createCustomSetup({
  onError: (error) => sendToMyMonitoringService(error),
  serializer: (error) => myCustomSerializer(error),
  captureStackTrace: process.env.NODE_ENV !== 'production'
});

// Use in your applications
setupMyApp(); // Uses your defaults
setupMyApp({ developmentMode: true }); // Override specific options`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Configuration API */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Configuration API
          </h2>

          <p className="text-slate-600 mb-4">
            For advanced use cases, you can use the configuration API directly
            to customize try-error behavior.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                configure()
              </h3>
              <p className="text-slate-600 mb-3">
                Configure global settings for try-error behavior.
              </p>
              <CodeBlock
                language="typescript"
                title="Global Configuration"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { configure, TryErrorConfig } from 'try-error';

// Configure global settings
configure({
  // Enable/disable stack trace capture
  captureStackTrace: true,
  
  // Maximum stack trace depth
  stackTraceLimit: 10,
  
  // Include source location in errors
  includeSource: true,
  
  // Default error type for untyped errors
  defaultErrorType: 'Error',
  
  // Enable development mode features
  developmentMode: process.env.NODE_ENV === 'development',
  
  // Custom error serialization
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      context: error.context
    })
  }),
  
  // Error transformation hook
  onError: (error) => {
    // Log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      logToMonitoring(error);
    }
    return error;
  }
});

// Or use a preset
configure('production'); // Uses ConfigPresets.production()
configure('development'); // Uses ConfigPresets.development()`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Configuration Presets
              </h3>
              <p className="text-slate-600 mb-3">
                Pre-built configurations for common environments.
              </p>
              <CodeBlock
                language="typescript"
                title="Configuration Presets"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { ConfigPresets, configure } from 'try-error';

// Use built-in presets
configure(ConfigPresets.development()); // Full debugging features
configure(ConfigPresets.production());  // Performance optimized
configure(ConfigPresets.test());        // Test-friendly configuration
configure(ConfigPresets.performance()); // Maximum performance

// Customize presets
const customConfig = {
  ...ConfigPresets.production(),
  onError: (error) => sendToMyService(error)
};
configure(customConfig);

// Environment-based configuration
import { createEnvConfig } from 'try-error';

configure(createEnvConfig({
  development: ConfigPresets.development(),
  production: ConfigPresets.production(),
  test: ConfigPresets.test()
}));`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Scoped Configuration
              </h3>
              <p className="text-slate-600 mb-3">
                Create isolated configurations that don't affect global state.
              </p>
              <CodeBlock
                language="typescript"
                title="Scoped Configuration"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { createScope } from 'try-error';

// Create a scoped configuration
const { config, createError } = createScope({
  captureStackTrace: false,
  defaultErrorType: 'CustomError',
  onError: (error) => {
    console.log('Scoped error:', error.message);
    return error;
  }
});

// Use scoped error creation
const error = await createError({
  message: 'This uses scoped config',
  context: { scope: 'isolated' }
});

// Global config remains unchanged
const globalError = createTryError('GlobalError', 'Uses global config');`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Configuration Options */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Configuration Options
          </h2>

          <p className="text-slate-600 mb-4">
            Complete reference for all configuration options available in
            try-error.
          </p>

          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TryErrorConfig Interface
              </h3>
              <CodeBlock
                language="typescript"
                title="Configuration Interface"
                showLineNumbers={true}
                className="mb-3"
              >
                {`interface TryErrorConfig {
  /**
   * Whether to capture stack traces (expensive operation)
   * @default true in development, false in production
   */
  captureStackTrace?: boolean;

  /**
   * Maximum stack trace depth to capture
   * @default 10
   */
  stackTraceLimit?: number;

  /**
   * Include source location in errors
   * @default true
   */
  includeSource?: boolean;

  /**
   * Default error type for untyped errors
   * @default "Error"
   */
  defaultErrorType?: string;

  /**
   * Enable development mode features (verbose logging, etc.)
   * @default false
   */
  developmentMode?: boolean;

  /**
   * Custom error serialization function
   */
  serializer?: (error: TryError) => Record<string, unknown>;

  /**
   * Global error transformation hook
   */
  onError?: (error: TryError) => TryError;
}`}
              </CodeBlock>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Performance Configuration
              </h3>
              <p className="text-slate-600 mb-3">
                Advanced performance optimization settings for high-throughput
                applications.
              </p>
              <CodeBlock
                language="typescript"
                title="Performance Configuration"
                showLineNumbers={true}
                className="mb-3"
              >
                {`interface PerformanceConfig {
  /**
   * Error creation optimization settings
   */
  errorCreation?: {
    /**
     * Cache error constructors for reuse
     * @default false
     */
    cacheConstructors?: boolean;

    /**
     * Only capture stack trace when accessed (lazy)
     * @default false
     */
    lazyStackTrace?: boolean;

    /**
     * Enable experimental object pooling
     * @default false
     */
    objectPooling?: boolean;

    /**
     * Object pool size when pooling is enabled
     * @default 50
     */
    poolSize?: number;
  };

  /**
   * Context capture optimization settings
   */
  contextCapture?: {
    /**
     * Maximum context size in bytes
     * @default 10240 (10KB)
     */
    maxContextSize?: number;

    /**
     * Whether to deep clone context objects
     * @default true
     */
    deepClone?: boolean;

    /**
     * Timeout for async context capture in milliseconds
     * @default 100
     */
    timeout?: number;
  };

  /**
   * Memory management settings
   */
  memory?: {
    /**
     * Maximum number of errors to keep in history
     * @default 100
     */
    maxErrorHistory?: number;

    /**
     * Use weak references for large contexts
     * @default false
     */
    useWeakRefs?: boolean;

    /**
     * Provide garbage collection hints
     * @default false
     */
    gcHints?: boolean;
  };
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Environment-Specific Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Environment-Specific Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            Configure different behaviors for development, testing, and
            production environments.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Development Configuration
              </h3>
              <CodeBlock
                language="typescript"
                title="Development Setup"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// config/development.ts
import { configure } from 'try-error';

configure({
  captureStackTrace: true,
  stackTraceLimit: 50, // More detailed stack traces
  includeSource: true,
  developmentMode: true,
  
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    stack: error.stack,
    source: error.source,
    context: error.context,
    timestamp: error.timestamp,
    cause: error.cause
  }),
  
  onError: (error) => {
    // Detailed console logging in development
    console.group(\`🚨 TryError: \${error.type}\`);
    console.error('Message:', error.message);
    console.error('Source:', error.source);
    console.error('Context:', error.context);
    console.error('Stack:', error.stack);
    console.groupEnd();
    return error;
  }
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Production Configuration
              </h3>
              <CodeBlock
                language="typescript"
                title="Production Setup"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// config/production.ts
import { configure } from 'try-error';

configure({
  captureStackTrace: false, // Disable for performance
  stackTraceLimit: 5,
  includeSource: false, // Don't expose source paths
  developmentMode: false,
  
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    // Don't include sensitive information
  }),
  
  onError: (error) => {
    // Send to monitoring service
    sendToSentry(error);
    sendToDatadog(error);
    
    // Log minimal information
    console.error(\`Error: \${error.type} - \${error.message}\`);
    return error;
  }
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Testing Configuration
              </h3>
              <CodeBlock
                language="typescript"
                title="Testing Setup"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// config/testing.ts
import { configure } from 'try-error';

// Collect errors for test assertions
const testErrors: TryError[] = [];

configure({
  captureStackTrace: true,
  stackTraceLimit: 10,
  includeSource: true,
  developmentMode: true,
  
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    context: error.context,
    source: error.source,
    stack: error.stack
  }),
  
  onError: (error) => {
    testErrors.push(error);
    return error;
  }
});

// Helper for tests
export function getTestErrors(): TryError[] {
  return [...testErrors];
}

export function clearTestErrors(): void {
  testErrors.length = 0;
}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Performance Optimization */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Performance Optimization
          </h2>

          <p className="text-slate-600 mb-4">
            Advanced configuration for high-performance applications.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                High-Performance Configuration
              </h3>
              <CodeBlock
                language="typescript"
                title="Performance Optimization"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { configure, ConfigPresets } from 'try-error';

// Use the performance preset
configure(ConfigPresets.performance());

// Or configure manually
configure({
  captureStackTrace: false,
  stackTraceLimit: 0,
  includeSource: false,
  developmentMode: false,
  
  // Performance optimizations
  performance: {
    errorCreation: {
      cacheConstructors: true,
      lazyStackTrace: true,
      objectPooling: true,
      poolSize: 100
    },
    contextCapture: {
      maxContextSize: 1024 * 5, // 5KB limit
      deepClone: false,
      timeout: 50
    },
    memory: {
      maxErrorHistory: 50,
      useWeakRefs: true,
      gcHints: true
    }
  }
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Performance Monitoring
              </h3>
              <CodeBlock
                language="typescript"
                title="Performance Monitoring"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { Performance } from 'try-error';

// Measure error creation performance
const metrics = Performance.measureErrorCreation(1000);
console.log(\`Average error creation time: \${metrics.averageTime}ms\`);

// Monitor memory usage (Node.js only)
const memoryUsage = Performance.getMemoryUsage();
if (memoryUsage) {
  console.log('Memory usage:', memoryUsage);
}

// Set up performance monitoring
configure({
  onError: (error) => {
    // Track error creation time
    const creationTime = Date.now() - error.timestamp;
    if (creationTime > 10) { // Log slow error creation
      console.warn(\`Slow error creation: \${creationTime}ms for \${error.type}\`);
    }
    return error;
  }
});`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Configuration Best Practices
          </h2>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Do</h4>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>
                  • Use setup utilities for quick, optimized configuration
                </li>
                <li>• Configure try-error early in your application startup</li>
                <li>• Use environment-specific configurations</li>
                <li>• Disable stack traces in production for performance</li>
                <li>• Set up error monitoring and reporting</li>
                <li>• Use scoped configurations for isolated components</li>
                <li>• Test your error handling configuration</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Don't</h4>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>
                  • Configure try-error multiple times in the same application
                </li>
                <li>• Include sensitive data in error contexts</li>
                <li>• Use development configuration in production</li>
                <li>
                  • Ignore performance implications of stack trace capture
                </li>
                <li>• Set overly large context size limits</li>
                <li>• Forget to handle errors in your onError hook</li>
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
                Performance Guide
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Detailed performance optimization strategies and implementation
                examples
              </p>
              <a
                href="/docs/advanced/performance"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Performance Guide →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Utilities API
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                API reference for result manipulation and utility functions
              </p>
              <a
                href="/docs/api/utils"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Utilities API →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
