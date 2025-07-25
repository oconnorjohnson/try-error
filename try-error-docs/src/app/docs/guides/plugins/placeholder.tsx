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

export default function PluginsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Plugin System</h1>
        <p className="text-xl text-muted-foreground">
          Extend tryError with reusable plugins that add new capabilities,
          integrations, and error types
        </p>
      </div>

      <Alert>
        <AlertTitle>Extensible Architecture</AlertTitle>
        <AlertDescription>
          The plugin system allows third-party packages to extend tryError
          without modifying its core. Plugins can add configuration, middleware,
          custom error types, utilities, and more.
        </AlertDescription>
      </Alert>

      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-semibold mb-4">Plugin Architecture</h2>
          <p className="text-muted-foreground mb-6">
            Plugins are self-contained modules that can hook into various
            aspects of tryError.
          </p>

          <EnhancedCodeBlock language="typescript" showLineNumbers>
            {`import { Plugin, PluginMetadata, PluginHooks, PluginCapabilities } from '@try-error/core';

interface Plugin {
  // Plugin identification and dependencies
  metadata: PluginMetadata;
  
  // Lifecycle hooks
  hooks?: PluginHooks;
  
  // Features the plugin provides
  capabilities?: PluginCapabilities;
}

interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[]; // Other plugins required
}

interface PluginHooks {
  onInstall?: () => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
  onEnable?: () => void | Promise<void>;
  onDisable?: () => void | Promise<void>;
  onConfigChange?: (config: TryErrorConfig) => void | Promise<void>;
}

interface PluginCapabilities {
  config?: Partial<TryErrorConfig>;
  middleware?: ErrorMiddleware[];
  errorTypes?: Record<string, (message: string, context?: any) => TryError>;
  utilities?: Record<string, Function>;
  transformers?: {
    error?: (error: TryError) => TryError;
    result?: <T>(result: TryResult<T>) => TryResult<T>;
  };
}`}
          </EnhancedCodeBlock>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Using Plugins</h2>

          <Tabs defaultValue="install" className="mb-8">
            <TabsList>
              <TabsTrigger value="install">Installation</TabsTrigger>
              <TabsTrigger value="manage">Management</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="install">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { pluginManager } from '@try-error/core';
import sentryPlugin from 'tryError-sentry';
import datadogPlugin from 'tryError-datadog';

// Install plugins
await pluginManager.install(sentryPlugin);
await pluginManager.install(datadogPlugin);

// Enable plugins
await pluginManager.enable('tryError-sentry');
await pluginManager.enable('tryError-datadog');

// Plugins with dependencies
import advancedPlugin from 'tryError-advanced';

// This plugin requires 'tryError-sentry'
// The plugin manager ensures dependencies are installed
await pluginManager.install(advancedPlugin);`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="manage">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`// List installed plugins
const installed = pluginManager.getInstalled();
console.log('Installed plugins:', installed);

// List enabled plugins
const enabled = pluginManager.getEnabled();
console.log('Active plugins:', enabled);

// Check plugin status
if (pluginManager.isInstalled('tryError-sentry')) {
  console.log('Sentry plugin is installed');
}

if (pluginManager.isEnabled('tryError-sentry')) {
  console.log('Sentry plugin is active');
}

// Disable a plugin temporarily
await pluginManager.disable('tryError-datadog');

// Uninstall a plugin
await pluginManager.uninstall('tryError-datadog');

// Get a specific plugin
const sentryPlugin = pluginManager.get('tryError-sentry');
console.log(sentryPlugin?.metadata);`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="config">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`// Plugins can modify configuration
const mergedConfig = pluginManager.getMergedConfig();
// Returns combined config from all enabled plugins

// Get all middleware from plugins
const middleware = pluginManager.getAllMiddleware();
// Returns array of middleware from all enabled plugins

// Get custom error types
const errorTypes = pluginManager.getAllErrorTypes();
// Returns map of error constructors

// Get utilities
const utilities = pluginManager.getAllUtilities();
// Returns map of utility functions

// Notify plugins of config changes
await pluginManager.notifyConfigChange(newConfig);`}
              </EnhancedCodeBlock>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Creating a Plugin</h2>
          <p className="text-muted-foreground mb-6">
            Build your own plugin to share functionality across projects or with
            the community.
          </p>

          <Tabs defaultValue="basic" className="mb-8">
            <TabsList>
              <TabsTrigger value="basic">Basic Plugin</TabsTrigger>
              <TabsTrigger value="helper">Using Helpers</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Plugin</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`// my-plugin.ts
import { Plugin } from '@try-error/core';

export const myPlugin: Plugin = {
  metadata: {
    name: 'my-custom-plugin',
    version: '1.0.0',
    description: 'Adds custom error handling features',
    author: 'Your Name'
  },
  
  hooks: {
    onInstall: async () => {
      console.log('My plugin installed!');
    },
    
    onEnable: async () => {
      console.log('My plugin enabled!');
      // Initialize resources
    },
    
    onDisable: async () => {
      console.log('My plugin disabled!');
      // Cleanup resources
    },
    
    onConfigChange: async (config) => {
      console.log('Config changed:', config);
      // React to configuration changes
    }
  },
  
  capabilities: {
    // Add custom configuration
    config: {
      customOption: true,
      debugMode: false
    },
    
    // Add middleware
    middleware: [
      (result, next) => {
        console.log('Plugin middleware executed');
        return next();
      }
    ],
    
    // Add custom error types
    errorTypes: {
      CustomError: (message, context) => ({
        [TRY_ERROR_BRAND]: true,
        type: 'CustomError',
        message,
        source: 'my-plugin',
        timestamp: Date.now(),
        context
      })
    },
    
    // Add utility functions
    utilities: {
      customHelper: (value: any) => {
        return \`Processed: \${value}\`;
      }
    }
  }
};`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="helper">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`import { createPlugin } from '@try-error/core';

// Use the helper function for better type safety
export const myPlugin = createPlugin(
  {
    name: 'my-plugin',
    version: '2.0.0',
    description: 'Enhanced plugin with helpers',
    dependencies: ['tryError-core'] // Require other plugins
  },
  (api) => {
    // api provides helper methods
    
    return {
      // Add multiple middleware at once
      middleware: api.addMiddleware(
        loggingMiddleware,
        retryMiddleware,
        transformMiddleware
      ),
      
      // Create error types with helper
      errorTypes: {
        ...api.createErrorType('NetworkError', (message, context) => ({
          [TRY_ERROR_BRAND]: true,
          type: 'NetworkError',
          message,
          source: 'network',
          timestamp: Date.now(),
          context: {
            ...context,
            retryable: true
          }
        })),
        
        ...api.createErrorType('ValidationError', (message, context) => ({
          [TRY_ERROR_BRAND]: true,
          type: 'ValidationError',
          message,
          source: 'validation',
          timestamp: Date.now(),
          context
        }))
      },
      
      // Add utilities
      utilities: {
        ...api.addUtility('validate', validateFunction),
        ...api.addUtility('sanitize', sanitizeFunction)
      }
    };
  }
);`}
              </EnhancedCodeBlock>
            </TabsContent>

            <TabsContent value="advanced">
              <EnhancedCodeBlock language="typescript" showLineNumbers>
                {`// Advanced plugin with external service integration
import { Plugin, TryError, isTryError } from '@try-error/core';
import { SentryClient } from '@sentry/node';

class SentryIntegrationPlugin implements Plugin {
  private client?: SentryClient;
  
  metadata = {
    name: 'tryError-sentry',
    version: '1.0.0',
    description: 'Sentry error reporting integration',
    author: 'tryError team'
  };
  
  hooks = {
    onInstall: async () => {
      // Validate Sentry is available
      if (!globalThis.Sentry) {
        throw new Error('Sentry SDK not found. Please install @sentry/node');
      }
    },
    
    onEnable: async () => {
      // Initialize Sentry client
      this.client = new SentryClient({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV
      });
    },
    
    onDisable: async () => {
      // Cleanup
      await this.client?.close();
      this.client = undefined;
    }
  };
  
  capabilities = {
    middleware: [
      // Report errors to Sentry
      (result, next) => {
        if (isTryError(result) && this.client) {
          // Send to Sentry asynchronously
          this.client.captureException(result, {
            tags: {
              errorType: result.type,
              source: result.source
            },
            extra: result.context
          });
        }
        return next();
      }
    ],
    
    utilities: {
      // Expose Sentry utilities
      captureError: (error: TryError) => {
        if (this.client) {
          this.client.captureException(error);
        }
      },
      
      setUser: (user: { id: string; email?: string }) => {
        if (this.client) {
          this.client.setUser(user);
        }
      },
      
      addBreadcrumb: (message: string, data?: any) => {
        if (this.client) {
          this.client.addBreadcrumb({
            message,
            data,
            timestamp: Date.now()
          });
        }
      }
    },
    
    config: {
      // Extend tryError config
      integrations: {
        sentry: {
          enabled: true,
          captureUnhandledRejections: true,
          beforeSend: (event: any) => {
            // Filter sensitive data
            if (event.request?.cookies) {
              delete event.request.cookies;
            }
            return event;
          }
        }
      }
    }
  };
}

export default new SentryIntegrationPlugin();`}
              </EnhancedCodeBlock>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Example Plugins</h2>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring & Observability</CardTitle>
                <CardDescription>
                  Integrate with APM and monitoring services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge className="mb-2">tryError-sentry</Badge>
                    <p className="text-sm text-muted-foreground">
                      Full Sentry integration with error tracking, breadcrumbs,
                      and user context
                    </p>
                  </div>
                  <div>
                    <Badge className="mb-2">tryError-datadog</Badge>
                    <p className="text-sm text-muted-foreground">
                      DataDog APM integration with custom metrics and
                      distributed tracing
                    </p>
                  </div>
                  <div>
                    <Badge className="mb-2">tryError-newrelic</Badge>
                    <p className="text-sm text-muted-foreground">
                      New Relic integration with error insights and custom
                      attributes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Development Tools</CardTitle>
                <CardDescription>
                  Enhance development experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge className="mb-2">tryError-devtools</Badge>
                    <p className="text-sm text-muted-foreground">
                      Browser DevTools extension for debugging tryError in
                      development
                    </p>
                  </div>
                  <div>
                    <Badge className="mb-2">tryError-prettier</Badge>
                    <p className="text-sm text-muted-foreground">
                      Pretty-print errors with syntax highlighting and
                      formatting
                    </p>
                  </div>
                  <div>
                    <Badge className="mb-2">tryError-testing</Badge>
                    <p className="text-sm text-muted-foreground">
                      Testing utilities and matchers for Jest, Vitest, and Mocha
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Framework Integrations</CardTitle>
                <CardDescription>
                  Seamless integration with popular frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge className="mb-2">tryError-nextjs</Badge>
                    <p className="text-sm text-muted-foreground">
                      Next.js integration with API routes and middleware support
                    </p>
                  </div>
                  <div>
                    <Badge className="mb-2">tryError-express</Badge>
                    <p className="text-sm text-muted-foreground">
                      Express middleware for automatic error handling in routes
                    </p>
                  </div>
                  <div>
                    <Badge className="mb-2">tryError-graphql</Badge>
                    <p className="text-sm text-muted-foreground">
                      GraphQL resolver error handling with proper error
                      formatting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">
            Plugin Development Best Practices
          </h2>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Version Compatibility</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`// Declare peer dependencies in package.json
{
  "peerDependencies": {
    "tryError": "^1.0.0"
  },
  "devDependencies": {
    "tryError": "^1.0.0"
  }
}

// Check version compatibility
if (!isCompatibleVersion(tryErrorVersion, '1.0.0')) {
  throw new Error('This plugin requires tryError v1.0.0 or higher');
}`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Handling</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`// Always handle errors gracefully
hooks: {
  onEnable: async () => {
    try {
      await initializePlugin();
    } catch (error) {
      console.error('Failed to initialize plugin:', error);
      // Optionally disable the plugin
      throw new Error('Plugin initialization failed');
    }
  }
}

// Don't let middleware break the application
middleware: [
  (result, next) => {
    try {
      // Plugin logic
      doSomethingRisky();
    } catch (error) {
      // Log but don't throw
      console.error('Plugin error:', error);
    }
    return next();
  }
]`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Management</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedCodeBlock language="typescript">
                  {`class MyPlugin implements Plugin {
  private resources: Resource[] = [];
  
  hooks = {
    onEnable: async () => {
      // Initialize resources
      this.resources.push(await createResource());
    },
    
    onDisable: async () => {
      // Always cleanup
      await Promise.all(
        this.resources.map(r => r.cleanup())
      );
      this.resources = [];
    },
    
    onUninstall: async () => {
      // Ensure cleanup even if not disabled first
      if (this.resources.length > 0) {
        await this.hooks.onDisable();
      }
    }
  };
}`}
                </EnhancedCodeBlock>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
