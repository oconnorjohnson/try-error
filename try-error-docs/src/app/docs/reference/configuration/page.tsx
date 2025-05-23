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

      <div className="space-y-8">
        {/* Global Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Global Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            Configure global settings for try-error behavior across your
            application.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { configureTryError } from 'try-error';

// Configure global settings
configureTryError({
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
});`}</code>
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Configuration Options
            </h4>
            <ul className="space-y-1 text-blue-700 text-sm">
              <li>
                • <code>captureStackTrace</code> - Whether to capture stack
                traces (default: true)
              </li>
              <li>
                • <code>stackTraceLimit</code> - Maximum stack trace depth
                (default: 10)
              </li>
              <li>
                • <code>includeSource</code> - Include source location in errors
                (default: true)
              </li>
              <li>
                • <code>defaultErrorType</code> - Default type for untyped
                errors (default: 'Error')
              </li>
              <li>
                • <code>developmentMode</code> - Enable development features
                (default: false)
              </li>
              <li>
                • <code>serializer</code> - Custom error serialization function
              </li>
              <li>
                • <code>onError</code> - Global error transformation hook
              </li>
            </ul>
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
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// config/development.ts
import { configureTryError } from 'try-error';

configureTryError({
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
});`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Production Configuration
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// config/production.ts
import { configureTryError } from 'try-error';

configureTryError({
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
});`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Testing Configuration
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// config/test.ts
import { configureTryError } from 'try-error';

configureTryError({
  captureStackTrace: true,
  stackTraceLimit: 10,
  includeSource: true,
  developmentMode: true,
  
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    context: error.context,
    // Include enough info for test debugging
  }),
  
  onError: (error) => {
    // Store errors for test assertions
    if (global.testErrorCollector) {
      global.testErrorCollector.push(error);
    }
    return error;
  }
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Error Context Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Error Context Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            Configure how error context is captured and included in errors.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { configureErrorContext } from 'try-error';

configureErrorContext({
  // Automatically include request context in web applications
  includeRequestContext: true,
  
  // Include user context when available
  includeUserContext: true,
  
  // Include performance metrics
  includePerformanceMetrics: true,
  
  // Custom context providers
  contextProviders: [
    // Request context provider
    () => ({
      requestId: getCurrentRequestId(),
      userAgent: getCurrentUserAgent(),
      ip: getCurrentIP(),
      url: getCurrentURL()
    }),
    
    // User context provider
    () => ({
      userId: getCurrentUserId(),
      userRole: getCurrentUserRole(),
      sessionId: getCurrentSessionId()
    }),
    
    // Application context provider
    () => ({
      version: process.env.APP_VERSION,
      environment: process.env.NODE_ENV,
      buildId: process.env.BUILD_ID
    })
  ],
  
  // Context sanitization
  sanitizer: (context) => {
    // Remove sensitive information
    const sanitized = { ...context };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    return sanitized;
  }
});`}</code>
            </pre>
          </div>
        </section>

        {/* Logging Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Logging Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            Configure how errors are logged and where they are sent.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { configureLogging } from 'try-error';

configureLogging({
  // Log levels
  logLevel: 'error', // 'debug', 'info', 'warn', 'error'
  
  // Console logging
  console: {
    enabled: true,
    format: 'json', // 'json' | 'pretty' | 'minimal'
    colors: true
  },
  
  // File logging
  file: {
    enabled: process.env.NODE_ENV === 'production',
    path: './logs/errors.log',
    maxSize: '10MB',
    maxFiles: 5,
    format: 'json'
  },
  
  // External services
  services: [
    // Sentry integration
    {
      name: 'sentry',
      enabled: !!process.env.SENTRY_DSN,
      config: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: process.env.APP_VERSION
      },
      filter: (error) => error.type !== 'ValidationError' // Don't send validation errors
    },
    
    // Custom webhook
    {
      name: 'webhook',
      enabled: !!process.env.ERROR_WEBHOOK_URL,
      config: {
        url: process.env.ERROR_WEBHOOK_URL,
        headers: {
          'Authorization': \`Bearer \${process.env.ERROR_WEBHOOK_TOKEN}\`
        }
      },
      filter: (error) => error.type === 'CriticalError'
    }
  ]
});`}</code>
            </pre>
          </div>
        </section>

        {/* Performance Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Performance Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            Configure performance-related settings to optimize try-error for
            your use case.
          </p>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4">
            <pre>
              <code>{`import { configurePerformance } from 'try-error';

configurePerformance({
  // Error creation optimization
  errorCreation: {
    // Cache error constructors
    cacheConstructors: true,
    
    // Lazy stack trace capture
    lazyStackTrace: true,
    
    // Pool error objects for reuse
    objectPooling: false // Experimental
  },
  
  // Context capture optimization
  contextCapture: {
    // Maximum context size (bytes)
    maxContextSize: 1024 * 10, // 10KB
    
    // Deep clone context objects
    deepClone: false,
    
    // Async context capture timeout
    timeout: 100 // ms
  },
  
  // Serialization optimization
  serialization: {
    // Use fast JSON serialization
    fastJson: true,
    
    // Maximum serialization depth
    maxDepth: 5,
    
    // Circular reference handling
    handleCircular: true
  },
  
  // Memory management
  memory: {
    // Maximum number of errors to keep in memory
    maxErrorHistory: 100,
    
    // Garbage collection hints
    gcHints: true,
    
    // Weak references for large contexts
    useWeakRefs: true
  }
});`}</code>
            </pre>
          </div>
        </section>

        {/* Framework-Specific Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Framework-Specific Configuration
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Express.js Configuration
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// config/express.ts
import { configureExpress } from '@try-error/express';

configureExpress({
  // Automatic request context capture
  captureRequestContext: true,
  
  // Error response format
  errorResponse: {
    includeStack: process.env.NODE_ENV === 'development',
    includeContext: process.env.NODE_ENV === 'development',
    format: 'json'
  },
  
  // Status code mapping
  statusCodeMapping: {
    ValidationError: 400,
    AuthenticationError: 401,
    AuthorizationError: 403,
    NotFoundError: 404,
    ConflictError: 409,
    RateLimitError: 429
  },
  
  // Middleware options
  middleware: {
    // Skip certain routes
    skip: (req) => req.path.startsWith('/health'),
    
    // Custom error handler
    errorHandler: (error, req, res, next) => {
      // Custom logic before default handling
      logError(error, req);
      next(error);
    }
  }
});`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Next.js Configuration
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// config/nextjs.ts
import { configureNextJs } from '@try-error/nextjs';

configureNextJs({
  // API route error handling
  apiRoutes: {
    captureRequestContext: true,
    includeQueryParams: true,
    sanitizeHeaders: true
  },
  
  // Server-side rendering
  ssr: {
    captureRenderContext: true,
    fallbackToClientSide: true,
    errorBoundary: true
  },
  
  // Client-side configuration
  client: {
    captureUserAgent: true,
    captureUrl: true,
    reportToApi: '/api/errors'
  }
});`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                React Configuration
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// config/react.ts
import { configureReact } from '@try-error/react';

configureReact({
  // Error boundary configuration
  errorBoundary: {
    fallbackComponent: ErrorFallback,
    onError: (error, errorInfo) => {
      logError(error, errorInfo);
    },
    resetOnPropsChange: true
  },
  
  // Hook configuration
  hooks: {
    // Default retry configuration
    defaultRetry: {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential'
    },
    
    // Loading state management
    loadingStates: {
      showSpinner: true,
      minimumDuration: 200 // ms
    }
  },
  
  // Development tools
  devTools: {
    enabled: process.env.NODE_ENV === 'development',
    showErrorOverlay: true,
    logToConsole: true
  }
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration File Examples */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Configuration File Examples
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                JSON Configuration
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// try-error.config.json
{
  "captureStackTrace": true,
  "stackTraceLimit": 10,
  "includeSource": true,
  "defaultErrorType": "Error",
  "developmentMode": false,
  "logging": {
    "logLevel": "error",
    "console": {
      "enabled": true,
      "format": "json"
    },
    "file": {
      "enabled": true,
      "path": "./logs/errors.log"
    }
  },
  "performance": {
    "errorCreation": {
      "cacheConstructors": true,
      "lazyStackTrace": true
    },
    "contextCapture": {
      "maxContextSize": 10240
    }
  }
}`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                TypeScript Configuration
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg">
                <pre>
                  <code>{`// try-error.config.ts
import { TryErrorConfig } from 'try-error';

const config: TryErrorConfig = {
  captureStackTrace: process.env.NODE_ENV !== 'production',
  stackTraceLimit: process.env.NODE_ENV === 'development' ? 50 : 5,
  includeSource: process.env.NODE_ENV === 'development',
  defaultErrorType: 'Error',
  developmentMode: process.env.NODE_ENV === 'development',
  
  onError: (error) => {
    // Environment-specific error handling
    if (process.env.NODE_ENV === 'production') {
      sendToMonitoring(error);
    } else {
      console.error('TryError:', error);
    }
    return error;
  },
  
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      context: error.context,
      source: error.source
    })
  })
};

export default config;`}</code>
                </pre>
              </div>
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
                Integration Guides
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Framework-specific integration examples
              </p>
              <a
                href="/docs/guides/integration"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Integration →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Performance Guide
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                Optimize try-error for your use case
              </p>
              <a
                href="/docs/advanced/performance"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Performance →
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Error Codes</h3>
              <p className="text-slate-600 text-sm mb-3">
                Reference for standard error types
              </p>
              <a
                href="/docs/reference/error-codes"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Error Codes →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
