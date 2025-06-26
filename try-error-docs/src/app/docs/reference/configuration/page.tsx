import { CodeBlock } from "../../../../components/EnhancedCodeBlock";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

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
        <div className="mt-4 bg-slate-100 border border-slate-300 rounded-lg p-4">
          <p className="text-slate-700">
            <strong>📌 Quick Start:</strong> try-error is configured in your
            application code, not through config files. Call{" "}
            <code className="bg-slate-200 px-1 rounded">setupNode()</code>,{" "}
            <code className="bg-slate-200 px-1 rounded">setupReact()</code>, or{" "}
            <code className="bg-slate-200 px-1 rounded">configure()</code> at
            your app's entry point. See the{" "}
            <a
              href="#where-to-configure"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Where to Configure
            </a>{" "}
            section below.
          </p>
        </div>
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
        {/* Where to Configure */}
        <section
          id="where-to-configure"
          className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-purple-900 mb-4">
            📍 Where to Configure try-error
          </h2>

          <p className="text-purple-800 mb-4">
            <strong>Important:</strong> try-error does NOT use configuration
            files. Configuration happens in your application code at runtime.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-3">
                Option 1: Application Entry Point (Recommended)
              </h3>
              <p className="text-purple-700 mb-3">
                Configure try-error once at your application's entry point,
                before any other code runs.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">
                    Node.js/Express
                  </h4>
                  <CodeBlock
                    language="typescript"
                    title="index.ts or app.ts"
                    showLineNumbers={true}
                  >
                    {`// At the very top of your entry file
import { setupNode } from 'try-error/setup';

// Configure before anything else
setupNode();

// Now import and use your app
import express from 'express';
const app = express();
// ... rest of your app`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">
                    React/Vite
                  </h4>
                  <CodeBlock
                    language="typescript"
                    title="main.tsx or index.tsx"
                    showLineNumbers={true}
                  >
                    {`// At the very top of your entry file
import { setupReact } from 'try-error/setup';

// Configure before React
setupReact();

// Now import React
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(...).render(<App />);`}
                  </CodeBlock>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-purple-800 mb-2">Next.js</h4>
                <CodeBlock
                  language="typescript"
                  title="app/layout.tsx (App Router) or _app.tsx (Pages Router)"
                  showLineNumbers={true}
                >
                  {`// For App Router: app/layout.tsx
import { setupNextJs } from 'try-error/setup';

// Simple setup (same config for both server and client)
setupNextJs();

// Advanced: Separate server/client configurations
setupNextJs({
  server: {
    captureStackTrace: false,
    onError: (error) => {
      // Server-side logging
      console.error('[Server Error]', error);
    }
  },
  client: {
    captureStackTrace: false,
    onError: (error) => {
      // Client-side error tracking
      // window.Sentry?.captureException(error);
    }
  }
});

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
}`}
                </CodeBlock>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-3">
                Option 2: Dedicated Configuration Module
              </h3>
              <p className="text-purple-700 mb-3">
                For more complex configurations, create a dedicated module and
                import it early.
              </p>

              <CodeBlock
                language="typescript"
                title="config/try-error.config.ts"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Create a configuration module
import { configure } from 'try-error';

// Your custom configuration
configure({
  captureStackTrace: process.env.NODE_ENV !== 'production',
  onError: (error) => {
    // Custom error handling
    if (process.env.NODE_ENV === 'production') {
      sendToSentry(error);
    }
    return error;
  },
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    // Custom serialization
  })
});

// Export for testing or reconfiguration
export const tryErrorConfig = {
  isConfigured: true
};`}
              </CodeBlock>

              <CodeBlock
                language="typescript"
                title="index.ts (entry point)"
                showLineNumbers={true}
              >
                {`// Import configuration first
import './config/try-error.config';

// Then import everything else
import express from 'express';
import { routes } from './routes';

const app = express();
// ... rest of your app`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-3">
                Option 3: Environment-Based Configuration
              </h3>
              <p className="text-purple-700 mb-3">
                Use environment variables to switch between configurations.
              </p>

              <CodeBlock
                language="typescript"
                title="config/index.ts"
                showLineNumbers={true}
              >
                {`import { configure, ConfigPresets } from 'try-error';

// Configure based on environment
switch (process.env.NODE_ENV) {
  case 'production':
    configure(ConfigPresets.production());
    break;
  case 'test':
    configure(ConfigPresets.test());
    break;
  default:
    configure(ConfigPresets.development());
}

// Or use the auto-setup
import { autoSetup } from 'try-error/setup';
autoSetup(); // Automatically detects environment`}
              </CodeBlock>
            </div>
          </div>

          <div className="bg-purple-100 border border-purple-400 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-purple-900 mb-2">
              ⚠️ Important Configuration Rules
            </h3>
            <ul className="space-y-2 text-purple-800">
              <li>
                <strong>1. Configure Once:</strong> Configure try-error only
                once per application. Multiple configurations will override each
                other.
              </li>
              <li>
                <strong>2. Configure Early:</strong> Always configure before
                using any try-error functions (trySync, tryAsync, etc.).
              </li>
              <li>
                <strong>3. No Config Files:</strong> try-error doesn't read from
                .tryerrorrc or similar files. All configuration is done in code.
              </li>
              <li>
                <strong>4. Global Effect:</strong> Configuration affects all
                try-error usage globally in your application.
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800 mb-2">
              💡 Testing Tip
            </h3>
            <p className="text-yellow-700">
              For testing, you might want to reconfigure try-error. Use a test
              setup file:
            </p>
            <CodeBlock
              language="typescript"
              title="test/setup.ts (Jest/Vitest)"
              showLineNumbers={true}
              className="mt-2"
            >
              {`import { configure } from 'try-error';

beforeAll(() => {
  configure({
    captureStackTrace: true,
    developmentMode: true,
    onError: (error) => {
      // Collect errors for assertions
      global.testErrors.push(error);
      return error;
    }
  });
});

// Add to jest.config.js or vitest.config.ts:
// setupFilesAfterEnv: ['<rootDir>/test/setup.ts']`}
            </CodeBlock>
          </div>
        </section>

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

          {/* What happens under the hood */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              🔍 What happens under the hood?
            </h3>
            <p className="text-slate-600 mb-4">
              Here's exactly what each setup function does when you call it:
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">
                  setupNode()
                </h4>
                <CodeBlock
                  language="typescript"
                  title="What setupNode() actually does"
                  showLineNumbers={true}
                  className="mb-2"
                >
                  {`// Equivalent manual configuration:
configure({
  captureStackTrace: process.env.NODE_ENV !== 'production',
  stackTraceLimit: process.env.NODE_ENV === 'production' ? 5 : 50,
  developmentMode: process.env.NODE_ENV === 'development',
  
  onError: (error) => {
    if (process.env.NODE_ENV === 'production') {
      // Minimal production logging
      console.error(\`[ERROR] \${error.type}: \${error.message}\`);
    } else {
      // Detailed development logging
      console.group(\`🚨 TryError: \${error.type}\`);
      console.error('Message:', error.message);
      console.error('Context:', error.context);
      console.error('Stack:', error.stack);
      console.groupEnd();
    }
    return error;
  },
  
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    ...(process.env.NODE_ENV === 'development' && {
      context: error.context,
      stack: error.stack
    })
  })
});`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">
                  setupReact()
                </h4>
                <CodeBlock
                  language="typescript"
                  title="What setupReact() actually does"
                  showLineNumbers={true}
                  className="mb-2"
                >
                  {`// Equivalent manual configuration:
configure({
  captureStackTrace: import.meta.env.DEV, // Vite
  stackTraceLimit: import.meta.env.PROD ? 3 : 20,
  developmentMode: import.meta.env.DEV,
  
  onError: (error) => {
    if (import.meta.env.PROD) {
      // Send to analytics in production
      window.gtag?.('event', 'exception', {
        description: \`\${error.type}: \${error.message}\`,
        fatal: false
      });
    } else {
      // Development console logging
      console.group(\`🚨 TryError: \${error.type}\`);
      console.error('Message:', error.message);
      console.error('Context:', error.context);
      console.groupEnd();
    }
    return error;
  },
  
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: error.timestamp
  })
});`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">
                  setupPerformance()
                </h4>
                <CodeBlock
                  language="typescript"
                  title="What setupPerformance() actually does"
                  showLineNumbers={true}
                  className="mb-2"
                >
                  {`// Equivalent manual configuration:
configure({
  captureStackTrace: false,        // Disabled for max performance
  stackTraceLimit: 0,             // No stack traces
  developmentMode: false,         // Production mode
  
  onError: (error) => {
    // Minimal logging only
    console.error(\`Error: \${error.type}\`);
    return error;
  },
  
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp
    // No context or stack for performance
  })
});

// Also configures performance optimizations:
configurePerformance({
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
});`}
                </CodeBlock>
              </div>
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

        {/* Manual Configuration Guide */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Manual Configuration Guide
          </h2>

          <p className="text-slate-600 mb-4">
            Want complete control? Here's how to configure try-error manually
            with all available options.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">
              💡 When to use manual configuration
            </h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>
                • You need very specific behavior not covered by setup utilities
              </li>
              <li>
                • You're integrating with custom monitoring/logging systems
              </li>
              <li>• You want to understand exactly what's happening</li>
              <li>
                • You're building a library that uses try-error internally
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Complete Configuration Interface
              </h3>
              <CodeBlock
                language="typescript"
                title="TryErrorConfig Interface"
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
   * Enable minimal error mode for ultra-lightweight errors
   * Bypasses all expensive operations like stack trace capture
   * @default false
   */
  minimalErrors?: boolean;

  /**
   * Skip timestamp generation (Date.now() calls)
   * Useful for performance-critical paths
   * @default false
   */
  skipTimestamp?: boolean;

  /**
   * Skip context processing
   * Prevents deep cloning or processing of context objects
   * @default false
   */
  skipContext?: boolean;

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
   * Called when converting errors to JSON or for logging
   */
  serializer?: (error: TryError) => Record<string, unknown>;

  /**
   * Global error transformation hook
   * Called for every error created, allows modification
   */
  onError?: (error: TryError) => TryError;
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Step-by-Step Manual Setup
              </h3>
              <CodeBlock
                language="typescript"
                title="Manual Configuration Example"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { configure } from 'try-error';

// Step 1: Basic configuration
configure({
  // Performance settings
  captureStackTrace: process.env.NODE_ENV !== 'production',
  stackTraceLimit: process.env.NODE_ENV === 'production' ? 5 : 50,
  includeSource: true,
  
  // Behavior settings
  defaultErrorType: 'ApplicationError',
  developmentMode: process.env.NODE_ENV === 'development',
  
  // Custom serialization for logging/monitoring
  serializer: (error) => {
    const base = {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      source: error.source
    };
    
    // Include sensitive data only in development
    if (process.env.NODE_ENV === 'development') {
      return {
        ...base,
        context: error.context,
        stack: error.stack,
        cause: error.cause
      };
    }
    
    // Production: minimal data
    return base;
  },
  
  // Global error handling
  onError: (error) => {
    // Log to console
    if (process.env.NODE_ENV === 'development') {
      console.group(\`🚨 \${error.type}\`);
      console.error('Message:', error.message);
      console.error('Context:', error.context);
      console.error('Stack:', error.stack);
      console.groupEnd();
    } else {
      console.error(\`[\${error.type}] \${error.message}\`);
    }
    
    // Send to monitoring services
    if (process.env.NODE_ENV === 'production') {
      // Example integrations
      sendToSentry(error);
      sendToDatadog(error);
      sendToNewRelic(error);
    }
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: \`\${error.type}: \${error.message}\`,
        fatal: false
      });
    }
    
    // Must return the error (can be modified)
    return error;
  }
});`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Configuration Option Details
              </h3>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    captureStackTrace
                  </h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Controls whether stack traces are captured when errors are
                    created.
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>
                      • <strong>true:</strong> Full stack traces (useful for
                      debugging)
                    </li>
                    <li>
                      • <strong>false:</strong> No stack traces (better
                      performance)
                    </li>
                    <li>
                      • <strong>Recommendation:</strong> true in development,
                      false in production
                    </li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    stackTraceLimit
                  </h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Maximum number of stack frames to capture.
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>
                      • <strong>Higher values:</strong> More detailed traces,
                      slower performance
                    </li>
                    <li>
                      • <strong>Lower values:</strong> Less detail, better
                      performance
                    </li>
                    <li>
                      • <strong>Recommendation:</strong> 50 in development, 5 in
                      production
                    </li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    serializer
                  </h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Function that converts TryError objects to plain objects for
                    logging/JSON.
                  </p>
                  <CodeBlock
                    language="typescript"
                    title="Custom Serializer Example"
                    showLineNumbers={true}
                    className="mt-2"
                  >
                    {`serializer: (error) => ({
  // Always include these
  type: error.type,
  message: error.message,
  timestamp: error.timestamp,
  
  // Conditional fields
  ...(error.context && { context: error.context }),
  ...(error.source && { source: error.source }),
  ...(error.stack && { stack: error.stack }),
  
  // Custom fields
  severity: getSeverityLevel(error.type),
  userId: getCurrentUserId(),
  sessionId: getSessionId()
})`}
                  </CodeBlock>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2">onError</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Global hook called for every error. Use for logging,
                    monitoring, and analytics.
                  </p>
                  <CodeBlock
                    language="typescript"
                    title="Advanced onError Handler"
                    showLineNumbers={true}
                    className="mt-2"
                  >
                    {`onError: (error) => {
  // Rate limiting to prevent spam
  if (shouldRateLimit(error.type)) {
    return error;
  }
  
  // Error categorization
  const severity = categorizeError(error);
  
  // Different handling based on severity
  switch (severity) {
    case 'critical':
      sendToSlack(error);
      sendToSentry(error);
      break;
    case 'warning':
      sendToSentry(error);
      break;
    case 'info':
      logToFile(error);
      break;
  }
  
  // Enrich error with additional context
  return {
    ...error,
    context: {
      ...error.context,
      severity,
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION
    }
  };
}`}
                  </CodeBlock>
                </div>
              </div>
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

        {/* Next.js Configuration Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Next.js Configuration Guide
          </h2>

          <Alert className="mb-6 border-blue-500/20 bg-blue-500/5">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              <strong className="text-foreground">
                Next.js Apps Need Special Handling:
              </strong>{" "}
              Server components, API routes, and client components often need
              different error handling strategies. try-error makes this easy
              with environment-aware configuration.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Next.js Setup</CardTitle>
                <CardDescription>
                  The simplest approach - one configuration for both server and
                  client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="typescript"
                  title="app/layout.tsx"
                  showLineNumbers={true}
                >
                  {`import { setupNextJs } from 'try-error/setup';

// This runs on both server and client
// setupNextJs() automatically detects the environment
setupNextJs();

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
}`}
                </CodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced: Separate Server/Client Configs</CardTitle>
                <CardDescription>
                  Different error handling for server components, API routes,
                  and client components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  language="typescript"
                  title="app/layout.tsx - Production-Ready Setup"
                  showLineNumbers={true}
                >
                  {`import { setupNextJs, withErrorService } from 'try-error/setup';

// Configure with separate server and client settings
setupNextJs({
  // Shared configuration
  includeSource: true,
  developmentMode: process.env.NODE_ENV === 'development',
  
  // Server-specific (API routes, server components, server actions)
  server: {
    captureStackTrace: false, // Performance optimization
    onError: (error) => {
      // Log to your server-side logging service
      if (process.env.NODE_ENV === 'production') {
        // Example: Winston, Pino, or cloud logging
        logger.error({
          type: error.type,
          message: error.message,
          source: error.source,
          timestamp: error.timestamp,
          context: error.context,
        });
      }
      return error;
    }
  },
  
  // Client-specific (client components, browser code)
  client: {
    captureStackTrace: false, // Don't expose stack traces to users
    skipContext: true, // Don't send sensitive context to client
    onError: (error) => {
      // Send to client-side error tracking
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureException(error);
      }
      // No console output in production
      return error;
    }
  }
});`}
                </CodeBlock>

                <Alert>
                  <AlertDescription>
                    <strong>Pro tip:</strong> The configuration runs once per
                    environment. On the server, it runs when the server starts.
                    On the client, it runs when the page loads.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Server Actions & API Routes</CardTitle>
                <CardDescription>
                  Special considerations for Next.js server-side code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  language="typescript"
                  title="app/actions/user-actions.ts"
                  showLineNumbers={true}
                >
                  {`'use server';

import { tryAsync, isTryError } from 'try-error';
import { revalidatePath } from 'next/cache';

export async function updateUser(userId: string, data: UpdateUserData) {
  const result = await tryAsync(async () => {
    // Validate input
    const validation = validateUserData(data);
    if (!validation.valid) {
      throw createError({
        type: 'ValidationError',
        message: 'Invalid user data',
        context: { errors: validation.errors }
      });
    }
    
    // Update in database
    const user = await db.user.update({
      where: { id: userId },
      data: data
    });
    
    revalidatePath(\`/users/\${userId}\`);
    return user;
  });
  
  if (isTryError(result)) {
    // Server actions can't throw serializable errors
    // Return error as data
    return {
      success: false,
      error: {
        type: result.type,
        message: result.message,
        // Don't send full error details to client
      }
    };
  }
  
  return { success: true, data: result };
}`}
                </CodeBlock>

                <CodeBlock
                  language="typescript"
                  title="app/api/users/route.ts"
                  showLineNumbers={true}
                >
                  {`import { tryAsync, isTryError } from 'try-error';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const result = await tryAsync(async () => {
    const users = await fetchUsers();
    return users;
  });

  if (isTryError(result)) {
    // Log server-side error (will use server config)
    console.error('API Error:', result);
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}`}
                </CodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Monitoring Integration</CardTitle>
                <CardDescription>
                  Connect to popular error tracking services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="typescript"
                  title="lib/try-error-setup.ts"
                  showLineNumbers={true}
                >
                  {`import { setupNextJs } from 'try-error/setup';
import * as Sentry from '@sentry/nextjs';
import { Logger } from 'winston';

// Your server logger
const serverLogger = new Logger({
  // ... winston config
});

export function initializeTryError() {
  setupNextJs({
    server: {
      captureStackTrace: process.env.NODE_ENV === 'development',
      onError: (error) => {
        // Server: Use Winston or similar
        serverLogger.error('Application error', {
          error: {
            type: error.type,
            message: error.message,
            source: error.source,
            context: error.context,
            stack: error.stack,
          },
          timestamp: new Date().toISOString(),
        });
        
        // Also send to Sentry on server
        Sentry.captureException(error);
        return error;
      }
    },
    
    client: {
      captureStackTrace: false,
      skipContext: true, // Don't expose server context to client
      onError: (error) => {
        // Client: Send to Sentry
        Sentry.captureException(error, {
          tags: {
            errorType: error.type,
            source: 'client',
          },
          extra: {
            timestamp: error.timestamp,
          }
        });
        
        // In development, log to console
        if (process.env.NODE_ENV === 'development') {
          console.error('[Client Error]', error);
        }
        
        return error;
      }
    }
  });
}`}
                </CodeBlock>
              </CardContent>
            </Card>
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
   * Enable minimal error mode for ultra-lightweight errors
   * Bypasses all expensive operations like stack trace capture
   * @default false
   */
  minimalErrors?: boolean;

  /**
   * Skip timestamp generation (Date.now() calls)
   * Useful for performance-critical paths
   * @default false
   */
  skipTimestamp?: boolean;

  /**
   * Skip context processing
   * Prevents deep cloning or processing of context objects
   * @default false
   */
  skipContext?: boolean;

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

        {/* Ultra-Performance Configuration */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Ultra-Performance Configuration
          </h2>

          <p className="text-slate-600 mb-4">
            For performance-critical applications where even minimal overhead
            matters.
          </p>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-3">
              🚀 Performance Impact Overview
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">
                  Success Path Overhead
                </h4>
                <ul className="space-y-1 text-orange-700 text-sm">
                  <li>• Default config: ~3-5% overhead ✅</li>
                  <li>• Production config: ~2-3% overhead ✅</li>
                  <li>• Minimal config: &lt;1% overhead 🚀</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">
                  Error Path Overhead
                </h4>
                <ul className="space-y-1 text-orange-700 text-sm">
                  <li>• Default config: ~1700% overhead ❌</li>
                  <li>• Production config: ~400% overhead ⚠️</li>
                  <li>• Minimal config: ~50% overhead ✅</li>
                </ul>
              </div>
            </div>
            <p className="text-orange-700 text-sm mt-3">
              <strong>Note:</strong> Error path overhead is less critical since
              errors should be exceptional. Choose configuration based on your
              specific needs.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Minimal Configuration Preset
              </h3>
              <p className="text-slate-600 mb-3">
                The minimal preset achieves &lt;50% error overhead by disabling
                all expensive operations.
              </p>
              <CodeBlock
                language="typescript"
                title="Ultra-Minimal Configuration"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { configure, ConfigPresets } from 'try-error';

// Use the minimal preset for <50% overhead
configure(ConfigPresets.minimal());

// What this does internally:
configure({
  captureStackTrace: false,  // No stack trace capture
  stackTraceLimit: 0,        // Zero stack frames
  includeSource: false,      // No source location
  developmentMode: false,    // Production mode
  minimalErrors: true,       // Bypass expensive operations
  skipTimestamp: true,       // No Date.now() calls
  skipContext: true          // No context processing
});

// Result: Ultra-lightweight errors
const error = trySync(() => JSON.parse("invalid"));
// error = {
//   type: "SyntaxError",
//   message: "Unexpected token i in JSON",
//   source: "minimal",
//   timestamp: 0,
//   stack: undefined,
//   context: undefined
// }`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Direct Minimal Error API
              </h3>
              <p className="text-slate-600 mb-3">
                For the absolute lowest overhead, use the direct minimal error
                creation API.
              </p>
              <CodeBlock
                language="typescript"
                title="Direct Minimal Error Creation"
                showLineNumbers={true}
                className="mb-3"
              >
                {`import { createMinimalError } from 'try-error';

// Bypass all processing - near-zero overhead
const error = createMinimalError(
  "NetworkError",
  "Request failed"
);

// With optional context (still lightweight)
const errorWithContext = createMinimalError(
  "ValidationError",
  "Invalid email format",
  { email: userInput }
);

// Use in performance-critical loops
for (let i = 0; i < 1000000; i++) {
  const result = data[i];
  if (!isValid(result)) {
    errors.push(createMinimalError(
      "DataError",
      "Invalid data at index " + i
    ));
  }
}`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Performance Comparison
              </h3>
              <p className="text-slate-600 mb-3">
                Real-world benchmark results for different configurations (1M
                operations).
              </p>
              <CodeBlock
                language="typescript"
                title="Configuration Performance Impact"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Benchmark: JSON parsing with errors (1M iterations)

// Native try/catch baseline
try {
  JSON.parse("invalid");
} catch (e) {}
// Time: 4,708ms

// Default try-error configuration
const result1 = trySync(() => JSON.parse("invalid"));
// Time: 85,734ms (1720% overhead) ❌

// Production configuration
configure({ captureStackTrace: false, includeSource: false });
const result2 = trySync(() => JSON.parse("invalid"));
// Time: 23,544ms (400% overhead) ⚠️

// Minimal configuration
configure(ConfigPresets.minimal());
const result3 = trySync(() => JSON.parse("invalid"));
// Time: 7,062ms (50% overhead) ✅

// Direct minimal API
const error = createMinimalError("ParseError", "Invalid JSON");
// Time: 4,944ms (5% overhead) 🚀`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                When to Use Each Configuration
              </h3>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Default Configuration
                  </h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Use when you need full debugging capabilities and error
                    overhead is not a concern.
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>✅ Development environments</li>
                    <li>✅ Applications with infrequent errors</li>
                    <li>
                      ✅ When debugging is more important than performance
                    </li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Production Configuration
                  </h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Balanced approach for production applications.
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>✅ Standard web applications</li>
                    <li>✅ APIs with moderate error rates</li>
                    <li>✅ When you need some error context</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Minimal Configuration
                  </h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Maximum performance for error-heavy operations.
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>✅ High-frequency parsing operations</li>
                    <li>✅ Data validation loops</li>
                    <li>✅ Performance-critical paths</li>
                    <li>✅ When errors are expected and frequent</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Direct Minimal API
                  </h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Absolute minimum overhead for the most critical paths.
                  </p>
                  <ul className="text-slate-600 text-sm space-y-1">
                    <li>✅ Tight loops with millions of iterations</li>
                    <li>✅ Real-time systems</li>
                    <li>✅ When every microsecond counts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Gradual Performance Optimization
              </h3>
              <p className="text-slate-600 mb-3">
                Start with defaults and optimize based on profiling results.
              </p>
              <CodeBlock
                language="typescript"
                title="Progressive Optimization Strategy"
                showLineNumbers={true}
                className="mb-3"
              >
                {`// Step 1: Start with defaults in development
import { trySync } from 'try-error';

// Step 2: Profile and identify bottlenecks
if (process.env.NODE_ENV === 'production') {
  // Step 3: Apply production optimizations
  configure({
    captureStackTrace: false,
    includeSource: false
  });
}

// Step 4: For identified hot paths, use minimal config
function processLargeDataset(data: unknown[]) {
  // Temporarily switch to minimal for this operation
  const previousConfig = getConfig();
  configure(ConfigPresets.minimal());
  
  const errors: TryError[] = [];
  for (const item of data) {
    const result = trySync(() => validateItem(item));
    if (isTryError(result)) {
      errors.push(result);
    }
  }
  
  // Restore previous configuration
  configure(previousConfig);
  return errors;
}

// Step 5: For the most critical paths, use direct API
function ultraFastValidation(items: string[]) {
  return items
    .map((item, i) => {
      try {
        return JSON.parse(item);
      } catch {
        return createMinimalError("ParseError", "Invalid at " + i);
      }
    })
    .filter(isTryError);
}`}
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
