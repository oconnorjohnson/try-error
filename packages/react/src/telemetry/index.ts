import React from "react";
import { TryError, isTryError } from "@try-error/core";
import { ReactTryError, isReactTryError } from "../types";

/**
 * Telemetry provider interface for error monitoring services
 */
export interface TelemetryProvider {
  /**
   * Name of the provider (e.g., "sentry", "bugsnag", "datadog")
   */
  name: string;

  /**
   * Report an error to the telemetry service
   */
  reportError(
    error: Error | TryError | ReactTryError,
    context?: TelemetryContext
  ): void;

  /**
   * Report a custom event
   */
  reportEvent?(eventName: string, data?: Record<string, unknown>): void;

  /**
   * Set user context for error tracking
   */
  setUser?(user: TelemetryUser): void;

  /**
   * Clear user context
   */
  clearUser?(): void;

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb?(breadcrumb: TelemetryBreadcrumb): void;

  /**
   * Set custom tags/labels
   */
  setTags?(tags: Record<string, string | number | boolean>): void;

  /**
   * Set custom context
   */
  setContext?(key: string, context: Record<string, unknown>): void;
}

/**
 * Context information for telemetry
 */
export interface TelemetryContext {
  /**
   * Component where the error occurred
   */
  component?: string;

  /**
   * React component stack
   */
  componentStack?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;

  /**
   * Error severity level
   */
  severity?: "fatal" | "error" | "warning" | "info" | "debug";

  /**
   * Whether this error should be fingerprinted differently
   */
  fingerprint?: string[];

  /**
   * Tags for categorization
   */
  tags?: Record<string, string | number | boolean>;
}

/**
 * User information for telemetry
 */
export interface TelemetryUser {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
}

/**
 * Breadcrumb for debugging
 */
export interface TelemetryBreadcrumb {
  message: string;
  category?: string;
  level?: "debug" | "info" | "warning" | "error" | "critical";
  type?: "default" | "http" | "navigation" | "user";
  timestamp?: number;
  data?: Record<string, unknown>;
}

/**
 * Global telemetry manager
 */
class TelemetryManager {
  private providers: TelemetryProvider[] = [];
  private enabled = true;
  private globalContext: Record<string, unknown> = {};
  private globalTags: Record<string, string | number | boolean> = {};

  /**
   * Register a telemetry provider
   */
  registerProvider(provider: TelemetryProvider): void {
    if (!this.providers.find((p) => p.name === provider.name)) {
      this.providers.push(provider);
    }
  }

  /**
   * Unregister a telemetry provider
   */
  unregisterProvider(providerName: string): void {
    this.providers = this.providers.filter((p) => p.name !== providerName);
  }

  /**
   * Report an error to all registered providers
   */
  reportError(
    error: Error | TryError | ReactTryError,
    context?: TelemetryContext
  ): void {
    if (!this.enabled) return;

    const enrichedContext: TelemetryContext = {
      ...context,
      metadata: {
        ...this.globalContext,
        ...context?.metadata,
      },
      tags: {
        ...this.globalTags,
        ...context?.tags,
      },
    };

    // Add React-specific context if it's a React error
    if (isReactTryError(error)) {
      enrichedContext.component = error.context?.componentName as string;
      enrichedContext.componentStack = error.context?.componentStack as string;
    }

    this.providers.forEach((provider) => {
      try {
        provider.reportError(error, enrichedContext);
      } catch (err) {
        console.error(`Failed to report error to ${provider.name}:`, err);
      }
    });
  }

  /**
   * Report a custom event to all providers that support it
   */
  reportEvent(eventName: string, data?: Record<string, unknown>): void {
    if (!this.enabled) return;

    this.providers.forEach((provider) => {
      if (provider.reportEvent) {
        try {
          provider.reportEvent(eventName, data);
        } catch (err) {
          console.error(`Failed to report event to ${provider.name}:`, err);
        }
      }
    });
  }

  /**
   * Set user context across all providers
   */
  setUser(user: TelemetryUser): void {
    this.providers.forEach((provider) => {
      if (provider.setUser) {
        try {
          provider.setUser(user);
        } catch (err) {
          console.error(`Failed to set user in ${provider.name}:`, err);
        }
      }
    });
  }

  /**
   * Clear user context across all providers
   */
  clearUser(): void {
    this.providers.forEach((provider) => {
      if (provider.clearUser) {
        try {
          provider.clearUser();
        } catch (err) {
          console.error(`Failed to clear user in ${provider.name}:`, err);
        }
      }
    });
  }

  /**
   * Add breadcrumb across all providers
   */
  addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void {
    const enrichedBreadcrumb: TelemetryBreadcrumb = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
    };

    this.providers.forEach((provider) => {
      if (provider.addBreadcrumb) {
        try {
          provider.addBreadcrumb(enrichedBreadcrumb);
        } catch (err) {
          console.error(`Failed to add breadcrumb to ${provider.name}:`, err);
        }
      }
    });
  }

  /**
   * Set global tags that will be added to all errors
   */
  setGlobalTags(tags: Record<string, string | number | boolean>): void {
    this.globalTags = { ...this.globalTags, ...tags };

    this.providers.forEach((provider) => {
      if (provider.setTags) {
        try {
          provider.setTags(this.globalTags);
        } catch (err) {
          console.error(`Failed to set tags in ${provider.name}:`, err);
        }
      }
    });
  }

  /**
   * Set global context that will be added to all errors
   */
  setGlobalContext(key: string, context: Record<string, unknown>): void {
    this.globalContext[key] = context;

    this.providers.forEach((provider) => {
      if (provider.setContext) {
        try {
          provider.setContext(key, context);
        } catch (err) {
          console.error(`Failed to set context in ${provider.name}:`, err);
        }
      }
    });
  }

  /**
   * Enable/disable telemetry
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get all registered providers
   */
  getProviders(): TelemetryProvider[] {
    return [...this.providers];
  }

  /**
   * Clear all providers
   */
  clearProviders(): void {
    this.providers = [];
  }

  /**
   * Clear global tags
   */
  clearGlobalTags(): void {
    this.globalTags = {};
  }

  /**
   * Clear global context
   */
  clearGlobalContext(): void {
    this.globalContext = {};
  }
}

// Global telemetry instance
export const telemetry = new TelemetryManager();

/**
 * React hook for telemetry
 */
export function useTelemetry() {
  return {
    reportError: (error: Error | TryError, context?: TelemetryContext) =>
      telemetry.reportError(error, context),
    reportEvent: (eventName: string, data?: Record<string, unknown>) =>
      telemetry.reportEvent(eventName, data),
    addBreadcrumb: (breadcrumb: TelemetryBreadcrumb) =>
      telemetry.addBreadcrumb(breadcrumb),
  };
}

/**
 * HOC to add telemetry to a component
 */
export function withTelemetry<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    React.useEffect(() => {
      telemetry.addBreadcrumb({
        message: `Component ${
          componentName || Component.displayName || Component.name
        } mounted`,
        category: "component",
        level: "info",
        type: "navigation",
      });

      return () => {
        telemetry.addBreadcrumb({
          message: `Component ${
            componentName || Component.displayName || Component.name
          } unmounted`,
          category: "component",
          level: "info",
          type: "navigation",
        });
      };
    }, []);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withTelemetry(${
    componentName || Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// Re-export for convenience
export type { TryError, ReactTryError };
