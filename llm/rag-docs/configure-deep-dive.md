---
id: configure-deep-dive
title: configure() - Complete Implementation Guide
tags: [api, core, configuration, performance, optimization, presets]
related: [getConfig, resetConfig, ConfigPresets, performance, monitoring]
module: config
complexity: advanced
performance_impact: medium
stability: stable
---

# configure() - Complete Implementation Guide

## Quick Reference

Global configuration function that customizes try-error behavior for performance optimization, error handling, and environment-specific settings. Supports both preset configurations and custom configuration objects with deep merging capabilities.

## Signature

```typescript
function configure(config: TryErrorConfig | keyof typeof ConfigPresets): void;

// Configuration interface
interface TryErrorConfig {
  captureStackTrace?: boolean;
  stackTraceLimit?: number;
  includeSource?: boolean;
  minimalErrors?: boolean;
  skipTimestamp?: boolean;
  skipContext?: boolean;
  sourceLocation?: SourceLocationConfig;
  defaultErrorType?: string;
  developmentMode?: boolean;
  serializer?: (error: TryError) => Record<string, unknown>;
  onError?: (error: TryError) => TryError;
  runtimeDetection?: boolean;
  environmentHandlers?: EnvironmentHandlers;
  performance?: PerformanceConfig;
}

// Available presets
type ConfigPresets =
  | "development"
  | "production"
  | "test"
  | "performance"
  | "minimal"
  | "serverProduction"
  | "clientProduction"
  | "edge"
  | "nextjs";
```

## Purpose

- **Performance optimization**: Configure stack traces, source location, and pooling
- **Environment adaptation**: Different settings for development, production, testing
- **Error handling**: Global error transformation and monitoring integration
- **Framework integration**: Specialized configurations for Next.js, serverless, etc.
- **Runtime detection**: Automatic behavior based on execution environment

## Implementation Details

### Algorithm Flow

```
1. Configuration validation → 5-15ns
2. Preset resolution (if string) → 10-20ns
3. Deep merge with existing config → 20-100ns
4. Global state update → 1-2ns
5. Version increment → 5-10ns
6. Cache invalidation → 10-30ns
7. Change listener notification → 5-15ns per listener
```

### Performance Characteristics

- **Time Complexity**: O(depth) for deep merge operations
- **Space Complexity**: O(config size) for configuration storage
- **Configuration Overhead**: 40-180ns per configure() call
- **Memory Usage**: ~500 bytes for typical configuration
- **Cache Impact**: Invalidates error creation caches (forces recalculation)

### Configuration Storage

```typescript
// Global configuration state
let globalConfig: TryErrorConfig | null = null;

// Version tracking for cache invalidation
class ConfigVersionTracker {
  private version = 0;
  private listeners = new Set<() => void>();

  increment(): void {
    this.version++;
    this.listeners.forEach((listener) => listener());
  }
}

// LRU cache for preset configurations
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize = 20;

  // Cached preset configurations for fast access
}
```

## Configuration Options Deep Dive

### Core Error Behavior

```typescript
configure({
  // Stack trace capture (most expensive operation)
  captureStackTrace: true, // Default: true in dev, false in prod
  stackTraceLimit: 10, // Default: 10 frames

  // Source location detection
  includeSource: true, // Default: true
  sourceLocation: {
    defaultStackOffset: 3, // Skip wrapper frames
    format: "file:line:column", // Source format
    includeFullPath: false, // Just filename vs full path
    formatter: (file, line, col) => `${file}:${line}:${col}`,
  },

  // Error content
  defaultErrorType: "Error", // Default error type
  skipTimestamp: false, // Skip Date.now() calls
  skipContext: false, // Skip context processing
});
```

### Performance Optimization

```typescript
configure({
  // Minimal mode - ultra-lightweight errors
  minimalErrors: true, // ~70% performance improvement

  // Advanced performance options
  performance: {
    errorCreation: {
      cacheConstructors: true, // Cache error constructors
      lazyStackTrace: true, // Lazy stack trace evaluation
      objectPooling: true, // Reuse error objects
      poolSize: 100, // Pool size
    },

    contextCapture: {
      maxContextSize: 10240, // 10KB context limit
      deepClone: true, // Deep clone context objects
      timeout: 100, // Async context timeout
    },

    memory: {
      maxErrorHistory: 100, // Error history limit
      useWeakRefs: true, // Use WeakRef for large contexts
      gcHints: true, // Provide GC hints
    },
  },
});
```

### Error Handling Integration

```typescript
configure({
  // Global error transformation
  onError: (error: TryError) => {
    // Send to monitoring service
    sendToSentry(error);

    // Add application context
    return {
      ...error,
      context: {
        ...error.context,
        appVersion: process.env.VERSION,
        userId: getCurrentUserId(),
      },
    };
  },

  // Custom serialization
  serializer: (error: TryError) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    // Omit sensitive context
  }),

  // Development features
  developmentMode: true, // Enable dev features
});
```

### Runtime Environment Detection

```typescript
configure({
  runtimeDetection: true, // Enable runtime detection

  environmentHandlers: {
    server: (error: TryError) => {
      // Server-side error handling
      logger.error({
        type: error.type,
        message: error.message,
        context: error.context,
      });
      return error;
    },

    client: (error: TryError) => {
      // Client-side error handling
      if (window.Sentry) {
        window.Sentry.captureException(error);
      }
      return error;
    },

    edge: (error: TryError) => {
      // Edge runtime error handling
      console.log(
        JSON.stringify({
          type: error.type,
          message: error.message,
          timestamp: error.timestamp,
        })
      );
      return error;
    },
  },
});
```

## Configuration Presets

### Development Preset

```typescript
// Full debugging features
configure("development");

// Equivalent to:
configure({
  captureStackTrace: true,
  stackTraceLimit: 50,
  includeSource: true,
  developmentMode: true,
  onError: (error) => {
    console.group(`🚨 TryError: ${error.type}`);
    console.error("Message:", error.message);
    console.error("Source:", error.source);
    console.error("Context:", error.context);
    if (error.stack) console.error("Stack:", error.stack);
    console.groupEnd();
    return error;
  },
});
```

### Production Preset

```typescript
// Performance-optimized for production
configure("production");

// Equivalent to:
configure({
  captureStackTrace: false,
  stackTraceLimit: 0,
  includeSource: true, // Keep for log debugging
  developmentMode: false,
  serializer: (error) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    source: error.source,
    // Omit sensitive context
  }),
  onError: (error) => {
    // No console logging in production
    // Integrate with your error service here
    return error;
  },
});
```

### Performance Preset

```typescript
// Maximum performance optimization
configure("performance");

// Equivalent to:
configure({
  captureStackTrace: false,
  stackTraceLimit: 0,
  includeSource: false,
  developmentMode: false,
  performance: {
    errorCreation: {
      cacheConstructors: true,
      lazyStackTrace: true,
      objectPooling: true,
      poolSize: 100,
    },
    contextCapture: {
      maxContextSize: 5120, // 5KB limit
      deepClone: false,
      timeout: 50,
    },
    memory: {
      maxErrorHistory: 50,
      useWeakRefs: true,
      gcHints: true,
    },
  },
});
```

### Minimal Preset

```typescript
// Ultra-minimal for <50% overhead target
configure("minimal");

// Equivalent to:
configure({
  captureStackTrace: false,
  stackTraceLimit: 0,
  includeSource: false,
  developmentMode: false,
  minimalErrors: true,
  skipTimestamp: true,
  skipContext: true,
});
```

### Next.js Preset

```typescript
// Optimized for Next.js applications
configure("nextjs");

// Equivalent to:
configure({
  runtimeDetection: true,
  captureStackTrace: process.env.NODE_ENV !== "production",
  stackTraceLimit: process.env.NODE_ENV === "production" ? 5 : 20,
  includeSource: true,
  developmentMode: process.env.NODE_ENV === "development",

  environmentHandlers: {
    server: (error) => {
      if (process.env.NODE_ENV === "production") {
        console.error(`[Server Error] ${error.type}: ${error.message}`);
      } else {
        console.group(`🚨 [Server] TryError: ${error.type}`);
        console.error("Message:", error.message);
        console.error("Source:", error.source);
        console.error("Context:", error.context);
        console.groupEnd();
      }
      return error;
    },

    client: (error) => {
      if (process.env.NODE_ENV === "production") {
        // Send to error tracking service
        // No console output in production
      } else {
        console.group(`🚨 [Client] TryError: ${error.type}`);
        console.error("Message:", error.message);
        console.error("Context:", error.context);
        console.groupEnd();
      }
      return error;
    },

    edge: (error) => {
      console.log(
        JSON.stringify({
          type: error.type,
          message: error.message,
          timestamp: error.timestamp,
          runtime: "edge",
        })
      );
      return error;
    },
  },
});
```

## Real-World Integration Examples

### Sentry Integration

```typescript
import * as Sentry from "@sentry/node";

configure({
  captureStackTrace: false, // Sentry handles stack traces
  includeSource: true,

  onError: (error) => {
    Sentry.captureException(error, {
      tags: {
        errorType: error.type,
        source: error.source,
      },
      contexts: {
        tryError: {
          type: error.type,
          message: error.message,
          timestamp: error.timestamp,
          context: error.context,
        },
      },
    });

    return error;
  },

  serializer: (error) => ({
    type: error.type,
    message: error.message,
    timestamp: error.timestamp,
    // Don't include sensitive context in serialization
  }),
});
```

### DataDog Integration

```typescript
import { datadogLogs } from "@datadog/browser-logs";

configure({
  captureStackTrace: false,
  includeSource: true,

  onError: (error) => {
    datadogLogs.logger.error("Application error", {
      error_type: error.type,
      error_message: error.message,
      error_source: error.source,
      error_timestamp: error.timestamp,
      error_context: error.context,
    });

    return error;
  },
});
```

### Winston Logger Integration

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.Console(),
  ],
});

configure({
  captureStackTrace: process.env.NODE_ENV !== "production",
  includeSource: true,

  onError: (error) => {
    logger.error("Application error", {
      type: error.type,
      message: error.message,
      source: error.source,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack,
    });

    return error;
  },
});
```

### Custom Analytics Integration

```typescript
import { analytics } from "./analytics";

configure({
  captureStackTrace: false,
  includeSource: true,

  onError: (error) => {
    // Track error metrics
    analytics.track("error_occurred", {
      error_type: error.type,
      error_source: error.source,
      timestamp: error.timestamp,
      user_id: getCurrentUserId(),
      session_id: getSessionId(),
    });

    // Track error patterns
    analytics.increment("errors.total");
    analytics.increment(`errors.by_type.${error.type}`);

    return error;
  },
});
```

## Advanced Configuration Patterns

### Environment-Based Configuration

```typescript
// Automatic environment detection
configure(
  createEnvConfig({
    development: {
      captureStackTrace: true,
      developmentMode: true,
      onError: (error) => {
        console.group(`🚨 Dev Error: ${error.type}`);
        console.error("Message:", error.message);
        console.error("Context:", error.context);
        console.groupEnd();
        return error;
      },
    },

    production: {
      captureStackTrace: false,
      onError: (error) => {
        sendToMonitoring(error);
        return error;
      },
    },

    test: {
      captureStackTrace: true,
      developmentMode: true,
      // No console output in tests
    },
  })
);
```

### Feature Flag Integration

```typescript
// Dynamic configuration based on feature flags
function createFeatureFlagConfig(): TryErrorConfig {
  return {
    captureStackTrace: featureFlags.isEnabled("detailed-errors"),
    includeSource: featureFlags.isEnabled("source-location"),
    developmentMode: featureFlags.isEnabled("debug-mode"),

    performance: {
      errorCreation: {
        objectPooling: featureFlags.isEnabled("error-pooling"),
        lazyStackTrace: featureFlags.isEnabled("lazy-stack-traces"),
      },
    },

    onError: (error) => {
      if (featureFlags.isEnabled("error-monitoring")) {
        sendToMonitoring(error);
      }

      if (featureFlags.isEnabled("error-analytics")) {
        trackErrorAnalytics(error);
      }

      return error;
    },
  };
}

// Update configuration when feature flags change
featureFlags.onChange(() => {
  configure(createFeatureFlagConfig());
});
```

### A/B Testing Integration

```typescript
// Different error handling for A/B test variants
configure({
  captureStackTrace: false,
  includeSource: true,

  onError: (error) => {
    const variant = getABTestVariant();

    // Enhanced error tracking for treatment group
    if (variant === "treatment") {
      sendDetailedErrorReport(error);
    } else {
      sendBasicErrorReport(error);
    }

    return {
      ...error,
      context: {
        ...error.context,
        abTestVariant: variant,
      },
    };
  },
});
```

### Multi-Tenant Configuration

```typescript
// Different configuration per tenant
class TenantConfigManager {
  private tenantConfigs = new Map<string, TryErrorConfig>();

  setTenantConfig(tenantId: string, config: TryErrorConfig) {
    this.tenantConfigs.set(tenantId, config);
  }

  applyTenantConfig(tenantId: string) {
    const baseConfig = {
      captureStackTrace: false,
      includeSource: true,

      onError: (error) => {
        // Add tenant context
        return {
          ...error,
          context: {
            ...error.context,
            tenantId,
          },
        };
      },
    };

    const tenantConfig = this.tenantConfigs.get(tenantId) || {};
    configure({ ...baseConfig, ...tenantConfig });
  }
}

// Usage
const tenantConfig = new TenantConfigManager();

tenantConfig.setTenantConfig("enterprise-client", {
  captureStackTrace: true, // Enhanced debugging for enterprise
  developmentMode: true,
});

tenantConfig.setTenantConfig("basic-client", {
  minimalErrors: true, // Minimal overhead for basic tier
});
```

## Performance Impact Analysis

### Configuration Overhead

```typescript
// Minimal configuration impact
configure("minimal");
// ~20ns overhead per error creation
// ~120 bytes per error object

// Standard configuration impact
configure("production");
// ~100ns overhead per error creation
// ~450 bytes per error object

// Full configuration impact
configure("development");
// ~400ns overhead per error creation
// ~1.2KB per error object
```

### Memory Usage by Configuration

```typescript
// Memory usage analysis
const memoryUsage = {
  minimal: {
    perError: 120, // bytes
    cacheSize: 0, // No caching
    poolSize: 0, // No pooling
  },

  production: {
    perError: 450, // bytes
    cacheSize: 10240, // 10KB cache
    poolSize: 0, // No pooling
  },

  performance: {
    perError: 300, // bytes (pooled)
    cacheSize: 20480, // 20KB cache
    poolSize: 51200, // 50KB pool (100 objects)
  },
};
```

### Performance Monitoring

```typescript
// Built-in performance monitoring
const performanceResults = await Performance.measureErrorCreation(1000);

console.log(`Average error creation time: ${performanceResults.averageTime}ms`);
console.log(`Total time for 1000 errors: ${performanceResults.totalTime}ms`);

// Memory monitoring (Node.js only)
const memoryUsage = Performance.getMemoryUsage();
if (memoryUsage) {
  console.log(`Heap used: ${memoryUsage.heapUsed / 1024 / 1024}MB`);
  console.log(`Heap total: ${memoryUsage.heapTotal / 1024 / 1024}MB`);
}
```

## Testing Configuration

### Unit Testing

```typescript
describe("configuration", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("should apply preset configurations", () => {
    configure("production");

    const config = getConfig();
    expect(config.captureStackTrace).toBe(false);
    expect(config.includeSource).toBe(true);
  });

  it("should merge custom configurations", () => {
    configure("production");
    configure({
      captureStackTrace: true,
      customField: "value",
    });

    const config = getConfig();
    expect(config.captureStackTrace).toBe(true);
    expect(config.includeSource).toBe(true);
  });

  it("should validate configuration", () => {
    expect(() => {
      configure({
        captureStackTrace: "invalid" as any,
      });
    }).toThrow("Invalid configuration object");
  });
});
```

### Integration Testing

```typescript
describe("configuration integration", () => {
  it("should affect error creation behavior", () => {
    configure({
      captureStackTrace: false,
      includeSource: false,
    });

    const error = createError({
      type: "TestError",
      message: "Test message",
    });

    expect(error.stack).toBeUndefined();
    expect(error.source).toBe("disabled");
  });

  it("should call onError handlers", () => {
    const onErrorSpy = jest.fn();

    configure({
      onError: onErrorSpy,
    });

    const error = createError({
      type: "TestError",
      message: "Test message",
    });

    expect(onErrorSpy).toHaveBeenCalledWith(error);
  });
});
```

## Migration and Compatibility

### Migrating from Other Libraries

```typescript
// Migrating from basic try-catch
// Before:
try {
  const result = riskyOperation();
  return result;
} catch (error) {
  console.error("Operation failed:", error);
  return null;
}

// After:
configure({
  onError: (error) => {
    console.error("Operation failed:", error);
    return error;
  },
});

const result = trySync(() => riskyOperation());
if (isTryError(result)) {
  return null;
}
return result;
```

### Upgrading Configuration

```typescript
// V1 configuration (deprecated)
configure({
  includeStackTrace: true, // Old property
  sourceLocation: true, // Old property
});

// V2 configuration (current)
configure({
  captureStackTrace: true, // New property
  includeSource: true, // New property
});
```

## Common Pitfalls

### 1. Over-Configuration

```typescript
// BAD: Too many configuration changes
configure("production");
configure({ captureStackTrace: true });
configure({ includeSource: false });
configure({ onError: handler });

// GOOD: Single configuration
configure({
  ...ConfigPresets.production(),
  captureStackTrace: true,
  includeSource: false,
  onError: handler,
});
```

### 2. Runtime Configuration Changes

```typescript
// BAD: Changing configuration frequently
function handleError(error: Error) {
  configure("debug"); // Don't do this
  const tryError = fromThrown(error);
  configure("production"); // Don't do this
  return tryError;
}

// GOOD: Stable configuration
configure("production");

function handleError(error: Error) {
  return fromThrown(error);
}
```

### 3. Missing Error Handlers

```typescript
// BAD: No error handling in production
configure("production");

// GOOD: Always include error handling
configure({
  ...ConfigPresets.production(),
  onError: (error) => {
    sendToMonitoring(error);
    return error;
  },
});
```

## See Also

- [Performance Configuration](./performance-configuration.md)
- [Error Monitoring Integration](./error-monitoring.md)
- [Environment Setup](./environment-setup.md)
- [ConfigPresets Reference](./config-presets.md)
- [getConfig() Function](./getConfig-deep-dive.md)
- [resetConfig() Function](./resetConfig-deep-dive.md)
- [createScope() Function](./createScope-deep-dive.md)
- [Framework Integration](./framework-integration.md)
