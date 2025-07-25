import { CodeBlock } from "../../../../components/EnhancedCodeBlock";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SentryVercelIntegrationPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Sentry & Vercel Analytics Integration
        </h1>
        <p className="text-xl text-slate-600">
          Learn how to integrate tryError with popular error tracking and
          analytics services in your Next.js application.
        </p>
      </div>

      <Alert className="mb-8 border-blue-500/20 bg-blue-500/5">
        <AlertDescription>
          <strong>Why integrate?</strong> While tryError provides excellent
          error handling, services like Sentry and Vercel Analytics offer
          centralized dashboards, alerting, and team collaboration features that
          complement tryError perfectly.
        </AlertDescription>
      </Alert>

      {/* Sentry Integration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Sentry Integration
        </h2>

        <p className="text-slate-600 mb-6">
          Sentry provides comprehensive error tracking with features like
          release tracking, performance monitoring, and session replay. Here's
          how to integrate it with tryError.
        </p>

        <Tabs defaultValue="setup" className="mb-8">
          <TabsList>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="basic">Basic Integration</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Install Sentry</CardTitle>
                <CardDescription>
                  First, install and configure Sentry in your Next.js app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="bash"
                  title="Terminal"
                  showLineNumbers={true}
                >
                  {`# Install Sentry
pnpm add @sentry/nextjs

# Run the configuration wizard
npx @sentry/wizard@latest -i nextjs`}
                </CodeBlock>

                <p className="text-sm text-slate-600 mt-4">
                  The wizard will create the necessary configuration files and
                  set up your Sentry project.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Integration</CardTitle>
                <CardDescription>
                  Simple integration using tryError's configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="typescript"
                  title="app/layout.tsx"
                  showLineNumbers={true}
                >
                  {`import { setupNextJs } from 'tryError/setup';
import * as Sentry from '@sentry/nextjs';

// Configure tryError to send errors to Sentry
setupNextJs({
  environmentHandlers: {
    server: (error) => {
      // Server-side: Send to Sentry with server context
      Sentry.captureException(error, {
        tags: {
          runtime: 'server',
          errorType: error.type,
        },
        extra: {
          source: error.source,
          context: error.context,
        },
      });
      return error;
    },
    
    client: (error) => {
      // Client-side: Send to Sentry with user context
      Sentry.captureException(error, {
        tags: {
          runtime: 'client',
          errorType: error.type,
        },
        extra: {
          source: error.source,
          // Don't send sensitive context to client
        },
      });
      return error;
    },
    
    edge: (error) => {
      // Edge: Minimal Sentry integration
      Sentry.captureException(error, {
        tags: {
          runtime: 'edge',
          errorType: error.type,
        },
      });
      return error;
    },
  },
});`}
                </CodeBlock>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Integration</CardTitle>
                <CardDescription>
                  Full-featured integration with custom error enrichment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="typescript"
                  title="lib/error-tracking.ts"
                  showLineNumbers={true}
                >
                  {`import { TryError } from '@try-error/core';
import * as Sentry from '@sentry/nextjs';
import { track } from '@vercel/analytics';

// Custom error enrichment
export function enrichErrorForSentry(error: TryError) {
  // Set user context if available
  const user = getCurrentUser(); // Your auth logic
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  }

  // Add breadcrumbs based on error context
  if (error.context?.url) {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: \`Navigated to \${error.context.url}\`,
      level: 'info',
    });
  }

  // Set error fingerprint for better grouping
  const fingerprint = [error.type];
  if (error.source) {
    fingerprint.push(error.source);
  }
  
  return {
    fingerprint,
    level: getErrorLevel(error),
  };
}

// Determine error severity
function getErrorLevel(error: TryError): Sentry.SeverityLevel {
  // Critical errors
  if (error.type.includes('Critical') || error.type.includes('Fatal')) {
    return 'fatal';
  }
  
  // Authentication/Authorization errors
  if (error.type.includes('Auth')) {
    return 'warning';
  }
  
  // Validation errors
  if (error.type.includes('Validation')) {
    return 'info';
  }
  
  return 'error';
}

// Integrated error handler
export function handleErrorWithTracking(error: TryError) {
  const enrichment = enrichErrorForSentry(error);
  
  // Send to Sentry with enrichment
  Sentry.captureException(error, {
    ...enrichment,
    tags: {
      errorType: error.type,
      hasContext: !!error.context,
      hasStack: !!error.stack,
    },
    extra: {
      source: error.source,
      timestamp: error.timestamp,
      context: error.context,
    },
  });
  
  // Track error metrics in Vercel Analytics
  track('error', {
    type: error.type,
    source: error.source || 'unknown',
    severity: enrichment.level,
  });
  
  return error;
}`}
                </CodeBlock>

                <CodeBlock
                  language="typescript"
                  title="app/layout.tsx"
                  showLineNumbers={true}
                  className="mt-4"
                >
                  {`import { setupNextJs } from 'tryError/setup';
import { handleErrorWithTracking } from '@/lib/error-tracking';

// Use the advanced handler
setupNextJs({
  environmentHandlers: {
    server: handleErrorWithTracking,
    client: handleErrorWithTracking,
    edge: handleErrorWithTracking,
  },
});`}
                </CodeBlock>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Vercel Analytics Integration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Vercel Analytics Integration
        </h2>

        <p className="text-slate-600 mb-6">
          Track error metrics and patterns using Vercel Analytics custom events.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Error Metrics Tracking</CardTitle>
            <CardDescription>
              Send error data to Vercel Analytics for monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              language="typescript"
              title="lib/analytics-integration.ts"
              showLineNumbers={true}
            >
              {`import { track } from '@vercel/analytics';
import { TryError } from '@try-error/core';

export function trackError(error: TryError) {
  // Track basic error event
  track('error_occurred', {
    type: error.type,
    source: error.source || 'unknown',
    hasContext: !!error.context,
    timestamp: error.timestamp,
  });

  // Track specific error patterns
  if (error.type.includes('API')) {
    track('api_error', {
      endpoint: error.context?.endpoint as string,
      statusCode: error.context?.statusCode as number,
      duration: error.context?.duration as number,
    });
  }

  if (error.type.includes('Validation')) {
    track('validation_error', {
      fields: Object.keys(error.context?.errors || {}),
      formId: error.context?.formId as string,
    });
  }

  // Track error recovery attempts
  if (error.context?.retryCount) {
    track('error_retry', {
      type: error.type,
      attempt: error.context.retryCount as number,
      success: error.context.retrySuccess as boolean,
    });
  }
}`}
            </CodeBlock>
          </CardContent>
        </Card>
      </section>

      {/* Complete Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Complete Integration Example
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Production-Ready Setup</CardTitle>
            <CardDescription>
              A complete example integrating tryError with Sentry and Vercel
              Analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              language="typescript"
              title="lib/error-management.ts"
              showLineNumbers={true}
            >
              {`import { setupNextJs, TryError } from '@try-error/core';
import * as Sentry from '@sentry/nextjs';
import { track } from '@vercel/analytics';

// Initialize error management
export function initializeErrorManagement() {
  setupNextJs({
    // Base configuration
    captureStackTrace: process.env.NODE_ENV === 'development',
    includeSource: true,
    
    environmentHandlers: {
      server: createServerHandler(),
      client: createClientHandler(),
      edge: createEdgeHandler(),
    },
  });
}

// Server-side handler with logging
function createServerHandler() {
  return (error: TryError) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Server Error]', error);
    }
    
    // Send to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('runtime', 'server');
      scope.setLevel(getSeverityLevel(error));
      scope.setContext('error_details', {
        type: error.type,
        source: error.source,
        timestamp: error.timestamp,
      });
      
      Sentry.captureException(error);
    });
    
    // Track metrics
    track('server_error', {
      type: error.type,
      source: error.source || 'unknown',
    });
    
    // Log to your server logging service
    if (global.logger) {
      global.logger.error({
        message: error.message,
        type: error.type,
        context: error.context,
        stack: error.stack,
      });
    }
    
    return error;
  };
}

// Client-side handler with user context
function createClientHandler() {
  return (error: TryError) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.error('[Client Error]', error);
    }
    
    // Enrich with user context
    const user = getCurrentUser();
    if (user) {
      Sentry.setUser({ id: user.id, email: user.email });
    }
    
    // Send to Sentry
    Sentry.captureException(error, {
      tags: {
        runtime: 'client',
        errorType: error.type,
        browser: navigator.userAgent,
      },
      extra: {
        source: error.source,
        url: window.location.href,
      },
    });
    
    // Track in analytics
    track('client_error', {
      type: error.type,
      page: window.location.pathname,
    });
    
    return error;
  };
}

// Edge handler with minimal overhead
function createEdgeHandler() {
  return (error: TryError) => {
    // Minimal Sentry integration for edge
    Sentry.captureException(error, {
      tags: { runtime: 'edge' },
    });
    
    // Simple metrics
    track('edge_error', { type: error.type });
    
    return error;
  };
}

// Helper functions
function getSeverityLevel(error: TryError): Sentry.SeverityLevel {
  if (error.type.includes('Critical')) return 'fatal';
  if (error.type.includes('Warning')) return 'warning';
  if (error.type.includes('Info')) return 'info';
  return 'error';
}

function getCurrentUser() {
  // Your auth logic here
  return null;
}`}
            </CodeBlock>

            <CodeBlock
              language="typescript"
              title="app/layout.tsx"
              showLineNumbers={true}
              className="mt-4"
            >
              {`import { initializeErrorManagement } from '@/lib/error-management';

// Initialize once at the app entry point
initializeErrorManagement();

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
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Best Practices
        </h2>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1. Don't Send Sensitive Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-3">
                Be careful about what context you send to external services,
                especially on the client side.
              </p>
              <CodeBlock language="typescript" showLineNumbers={true}>
                {`// ❌ Bad: Sending sensitive data
const error = createError({
  type: 'PaymentError',
  message: 'Payment failed',
  context: {
    creditCardNumber: user.card, // Never do this!
    cvv: user.cvv,
  }
});

// ✅ Good: Send only necessary data
const error = createError({
  type: 'PaymentError',
  message: 'Payment failed',
  context: {
    userId: user.id,
    amount: transaction.amount,
    currency: transaction.currency,
  }
});`}
              </CodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Use Error Types for Grouping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-3">
                Consistent error types help with grouping and filtering in
                Sentry and analytics dashboards.
              </p>
              <CodeBlock language="typescript" showLineNumbers={true}>
                {`// Define consistent error types
export const ErrorTypes = {
  // API Errors
  API_TIMEOUT: 'ApiTimeoutError',
  API_VALIDATION: 'ApiValidationError',
  API_AUTH: 'ApiAuthError',
  
  // User Errors  
  USER_INPUT: 'UserInputError',
  USER_PERMISSION: 'UserPermissionError',
  
  // System Errors
  SYSTEM_DATABASE: 'SystemDatabaseError',
  SYSTEM_NETWORK: 'SystemNetworkError',
} as const;`}
              </CodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Add Meaningful Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-3">
                Context helps with debugging but should be structured and
                meaningful.
              </p>
              <CodeBlock language="typescript" showLineNumbers={true}>
                {`// ✅ Good: Structured, meaningful context
const error = createError({
  type: 'ApiError',
  message: 'Failed to fetch user data',
  context: {
    endpoint: '/api/users/123',
    method: 'GET',
    statusCode: 500,
    duration: 1234,
    retryCount: 3,
    userId: '123',
  }
});`}
              </CodeBlock>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
