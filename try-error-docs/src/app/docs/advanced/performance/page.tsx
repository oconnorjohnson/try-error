import { CodeBlock } from "../../../../components/EnhancedCodeBlock";

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
              <CodeBlock
                language="typescript"
                title="Stack Trace Configuration"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Production: Disable stack traces for performance
configureTryError({
  captureStackTrace: process.env.NODE_ENV !== 'production',
  stackTraceLimit: process.env.NODE_ENV === 'production' ? 0 : 10
});

// Alternative: Lazy stack trace capture
configureTryError({
  lazyStackTrace: true, // Only capture when accessed
  stackTraceLimit: 5    // Limit depth in production
});`}
              </CodeBlock>
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
              <CodeBlock
                language="typescript"
                title="Context Size Optimization"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Limit context size
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
}`}
              </CodeBlock>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Object Pooling
              </h3>
              <p className="text-slate-600 mb-3">
                For high-frequency error scenarios, consider object pooling to
                reduce GC pressure.
              </p>
              <CodeBlock
                language="typescript"
                title="Error Object Pooling"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Enable experimental object pooling
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

const errorPool = new ErrorPool();`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Implementation Guide */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Implementation Guide
          </h2>

          <p className="text-slate-600 mb-6">
            Here's exactly where to put these configurations in different types
            of projects.
          </p>

          {/* Quick Setup */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              ⚡ Quick Setup (Recommended)
            </h3>
            <p className="text-blue-800 mb-4">
              Use our one-liner setup utilities for instant optimization with
              sensible defaults:
            </p>
            <CodeBlock
              language="typescript"
              title="One-Liner Setup for Any Environment"
              showLineNumbers={true}
              className="mb-4"
            >
              {`// Node.js/Express - Automatic environment detection
import { setupNode } from 'try-error/setup';
setupNode(); // ✨ That's it! Optimized for dev/prod automatically

// React/Vite - Browser-optimized configuration  
import { setupReact } from 'try-error/setup';
setupReact(); // ✨ Perfect for client-side apps

// Next.js - Handles both SSR and client-side
import { setupNextJs } from 'try-error/setup';
setupNextJs(); // ✨ Works for both server and client

// Auto-detect environment (works everywhere)
import { autoSetup } from 'try-error/setup';
autoSetup(); // ✨ Detects Node.js, React, Next.js, etc.

// High-performance (for critical applications)
import { setupPerformance } from 'try-error/setup';
setupPerformance(); // ✨ Maximum performance, minimal overhead

// With custom options (still easy!)
setupNode({
  onError: (error) => sendToSentry(error) // Add your monitoring
});`}
            </CodeBlock>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">
                🎯 Benefits of Quick Setup
              </h4>
              <ul className="text-blue-800 text-sm space-y-1">
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
                  • <strong>Extensible:</strong> Easy to customize with your own
                  options
                </li>
                <li>
                  • <strong>Tree-shakeable:</strong> Only includes what you use
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Node.js/Express Applications
              </h3>
              <p className="text-slate-600 mb-3">
                Configure try-error early in your application startup, before
                importing other modules.
              </p>
              <CodeBlock
                language="typescript"
                title="Project Structure & Setup"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Project structure:
// src/
//   config/
//     try-error.config.ts
//   app.ts
//   server.ts

// src/config/try-error.config.ts
import { configureTryError, configurePerformance } from 'try-error';

export function initializeTryError() {
  // Configure based on environment
  configureTryError({
    captureStackTrace: process.env.NODE_ENV !== 'production',
    stackTraceLimit: process.env.NODE_ENV === 'production' ? 5 : 50,
    developmentMode: process.env.NODE_ENV === 'development',
    
    onError: (error) => {
      if (process.env.NODE_ENV === 'production') {
        // Send to monitoring service
        console.error(\`[ERROR] \${error.type}: \${error.message}\`);
      } else {
        // Detailed logging in development
        console.error('TryError Details:', {
          type: error.type,
          message: error.message,
          context: error.context,
          stack: error.stack
        });
      }
      return error;
    }
  });

  // Performance optimizations
  configurePerformance({
    contextCapture: {
      maxContextSize: 1024 * 10, // 10KB
      deepClone: false
    },
    memory: {
      maxErrorHistory: 50,
      useWeakRefs: true
    }
  });
}

// src/app.ts
import express from 'express';
import { initializeTryError } from './config/try-error.config';

// Initialize try-error FIRST, before other imports
initializeTryError();

// Now import your application modules
import { userRoutes } from './routes/users';
import { errorHandler } from './middleware/error-handler';

const app = express();

// Your middleware and routes
app.use('/api/users', userRoutes);
app.use(errorHandler);

export default app;

// src/server.ts
import app from './app';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`}
              </CodeBlock>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Next.js Applications
              </h3>
              <p className="text-slate-600 mb-3">
                Configure try-error in your Next.js app using the app directory
                structure and the instrumentation.ts file for server startup
                initialization.
              </p>
              <CodeBlock
                language="typescript"
                title="Next.js Setup"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Project structure:
// src/
//   app/
//     layout.tsx
//     globals.css
//   lib/
//     try-error.config.ts
//   instrumentation.ts (for server initialization)

// src/lib/try-error.config.ts
import { configureTryError } from 'try-error';

export function initializeTryError() {
  configureTryError({
    captureStackTrace: process.env.NODE_ENV !== 'production',
    stackTraceLimit: process.env.NODE_ENV === 'production' ? 3 : 20,
    developmentMode: process.env.NODE_ENV === 'development',
    
    onError: (error) => {
      // Client-side error reporting
      if (typeof window !== 'undefined') {
        // Send to analytics or error reporting service
        if (process.env.NODE_ENV === 'production') {
          fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: error.type,
              message: error.message,
              url: window.location.href,
              userAgent: navigator.userAgent
            })
          }).catch(() => {}); // Silent fail
        }
      }
      return error;
    }
  });
}

// instrumentation.ts (in project root, for server-side initialization)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization - runs once on server startup
    const { initializeTryError } = await import('./src/lib/try-error.config');
    initializeTryError();
  }
}

// src/app/layout.tsx
import { initializeTryError } from '@/lib/try-error.config';
import './globals.css';

// Initialize try-error on client-side
if (typeof window !== 'undefined') {
  initializeTryError();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// src/app/api/users/route.ts
import { tryAsync, isTryError } from 'try-error';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const result = await tryAsync(async () => {
    // Your API logic here
    const users = await fetchUsers();
    return users;
  });

  if (isTryError(result)) {
    return NextResponse.json(
      { error: result.message },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}`}
              </CodeBlock>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <h4 className="font-semibold text-blue-800 mb-2">
                  📝 About instrumentation.ts
                </h4>
                <p className="text-blue-700 text-sm">
                  The <code>instrumentation.ts</code> file runs once on server
                  startup and is the correct place for server-side
                  initialization. Don't use <code>middleware.ts</code> for
                  initialization - it runs on every request!
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                React Applications (Vite/CRA)
              </h3>
              <p className="text-slate-600 mb-3">
                Configure try-error in your React app's entry point.
              </p>
              <CodeBlock
                language="typescript"
                title="React App Setup"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Project structure:
// src/
//   config/
//     try-error.config.ts
//   components/
//   hooks/
//   main.tsx (Vite) or index.tsx (CRA)
//   App.tsx

// src/config/try-error.config.ts
import { configureTryError } from 'try-error';

export function initializeTryError() {
  configureTryError({
    captureStackTrace: import.meta.env.DEV, // Vite
    // captureStackTrace: process.env.NODE_ENV === 'development', // CRA
    stackTraceLimit: import.meta.env.PROD ? 3 : 20,
    developmentMode: import.meta.env.DEV,
    
    onError: (error) => {
      // Client-side error tracking
      if (import.meta.env.PROD) {
        // Send to error tracking service
        window.gtag?.('event', 'exception', {
          description: \`\${error.type}: \${error.message}\`,
          fatal: false
        });
      } else {
        // Development logging
        console.group(\`🚨 TryError: \${error.type}\`);
        console.error('Message:', error.message);
        console.error('Context:', error.context);
        console.groupEnd();
      }
      return error;
    }
  });
}

// src/main.tsx (Vite) or src/index.tsx (CRA)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeTryError } from './config/try-error.config';
import App from './App';

// Initialize try-error BEFORE rendering
initializeTryError();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/App.tsx
import { TryErrorBoundary } from '@try-error/react';
import { UserProfile } from './components/UserProfile';

function App() {
  return (
    <TryErrorBoundary
      fallback={({ error, retry }) => (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={retry}>Try again</button>
        </div>
      )}
    >
      <UserProfile />
    </TryErrorBoundary>
  );
}

export default App;`}
              </CodeBlock>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Environment-Specific Configuration Files
              </h3>
              <p className="text-slate-600 mb-3">
                Use separate configuration files for different environments.
              </p>
              <CodeBlock
                language="typescript"
                title="Environment-Based Config"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// config/try-error/
//   index.ts
//   development.ts
//   production.ts
//   test.ts

// config/try-error/index.ts
import { TryErrorConfig } from 'try-error';

const env = process.env.NODE_ENV || 'development';

let config: TryErrorConfig;

switch (env) {
  case 'production':
    config = require('./production').default;
    break;
  case 'test':
    config = require('./test').default;
    break;
  default:
    config = require('./development').default;
}

export default config;

// config/try-error/development.ts
import { TryErrorConfig } from 'try-error';

const config: TryErrorConfig = {
  captureStackTrace: true,
  stackTraceLimit: 50,
  developmentMode: true,
  
  onError: (error) => {
    console.group(\`🚨 TryError: \${error.type}\`);
    console.error('Message:', error.message);
    console.error('Context:', error.context);
    console.error('Stack:', error.stack);
    console.groupEnd();
    return error;
  }
};

export default config;

// config/try-error/production.ts
import { TryErrorConfig } from 'try-error';

const config: TryErrorConfig = {
  captureStackTrace: false,
  stackTraceLimit: 0,
  developmentMode: false,
  
  onError: (error) => {
    // Send to monitoring service
    sendToSentry(error);
    sendToDatadog(error);
    
    // Minimal logging
    console.error(\`Error: \${error.type} - \${error.message}\`);
    return error;
  }
};

export default config;

// Usage in your app:
// src/app.ts
import { configureTryError } from 'try-error';
import tryErrorConfig from '../config/try-error';

// Apply configuration
configureTryError(tryErrorConfig);`}
              </CodeBlock>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Package.json Scripts Integration
              </h3>
              <p className="text-slate-600 mb-3">
                Set up npm scripts to handle different environments
                automatically.
              </p>
              <CodeBlock
                language="json"
                title="package.json Scripts"
                showLineNumbers={true}
                className="mb-3"
              >
                {`{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch src/server.ts",
    "build": "NODE_ENV=production tsc",
    "start": "NODE_ENV=production node dist/server.js",
    "test": "NODE_ENV=test jest",
    "start:staging": "NODE_ENV=staging node dist/server.js"
  },
  "dependencies": {
    "try-error": "^1.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}`}
              </CodeBlock>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-800 mb-2">
              🔑 Key Implementation Tips
            </h4>
            <ul className="space-y-1 text-blue-700 text-sm">
              <li>
                • <strong>Use Quick Setup:</strong> Start with setup utilities
                (setupNode, setupReact, etc.) for instant optimization
              </li>
              <li>
                • <strong>Initialize Early:</strong> Configure try-error before
                importing other modules
              </li>
              <li>
                • <strong>Environment Variables:</strong> Use NODE_ENV to switch
                between configurations
              </li>
              <li>
                • <strong>Separate Configs:</strong> Keep environment-specific
                settings in separate files for complex setups
              </li>
              <li>
                • <strong>Error Boundaries:</strong> Wrap React components with
                TryErrorBoundary
              </li>
              <li>
                • <strong>API Integration:</strong> Configure error reporting
                endpoints for production
              </li>
              <li>
                • <strong>Performance:</strong> Disable stack traces and limit
                context size in production
              </li>
            </ul>
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
              <CodeBlock
                language="typescript"
                title="Error Type Consistency"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Define error types as constants
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
}`}
              </CodeBlock>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Context Best Practices
              </h3>
              <p className="text-slate-600 mb-3">
                Include relevant context while avoiding sensitive or excessive
                data.
              </p>
              <CodeBlock
                language="typescript"
                title="Context Best Practices"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Good: Relevant, structured context
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
}`}
              </CodeBlock>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Error Propagation
              </h3>
              <p className="text-slate-600 mb-3">
                Handle errors at the appropriate level and avoid swallowing
                important errors.
              </p>
              <CodeBlock
                language="typescript"
                title="Error Propagation Patterns"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Good: Handle errors at the right level
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
}`}
              </CodeBlock>
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

          <CodeBlock
            language="typescript"
            title="Memory Management Configuration"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Configure memory limits
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
}, 300000); // Every 5 minutes`}
          </CodeBlock>
        </section>

        {/* Monitoring and Observability */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Monitoring and Observability
          </h2>

          <p className="text-slate-600 mb-4">
            Set up proper monitoring to track error patterns and performance.
          </p>

          <CodeBlock
            language="typescript"
            title="Error Monitoring and Metrics"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Error metrics collection
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
});`}
          </CodeBlock>
        </section>

        {/* Testing Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Testing Best Practices
          </h2>

          <p className="text-slate-600 mb-4">
            Comprehensive testing strategies for error handling code.
          </p>

          <CodeBlock
            language="typescript"
            title="Testing Error Handling"
            showLineNumbers={true}
            className="mb-4"
          >
            {`// Test error scenarios explicitly
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
});`}
          </CodeBlock>
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
