import { TryError } from "try-error";
import { ReactTryError } from "../../types";
import {
  TelemetryProvider,
  TelemetryContext,
  TelemetryUser,
  TelemetryBreadcrumb,
} from "../index";

/**
 * Sentry SDK types (simplified for our use)
 */
interface SentrySDK {
  captureException(
    exception: Error | string,
    captureContext?: {
      tags?: Record<string, string | number | boolean>;
      extra?: Record<string, unknown>;
      contexts?: Record<string, unknown>;
      fingerprint?: string[];
      level?: "fatal" | "error" | "warning" | "info" | "debug";
    }
  ): string;
  captureMessage(
    message: string,
    level?: "fatal" | "error" | "warning" | "info" | "debug"
  ): string;
  captureEvent(event: Record<string, unknown>): string;
  setUser(user: Record<string, unknown> | null): void;
  addBreadcrumb(breadcrumb: {
    message?: string;
    category?: string;
    level?: string;
    type?: string;
    timestamp?: number;
    data?: Record<string, unknown>;
  }): void;
  setTags(tags: Record<string, string | number | boolean>): void;
  setContext(key: string, context: Record<string, unknown> | null): void;
}

/**
 * Sentry telemetry provider for try-error React
 */
export class SentryProvider implements TelemetryProvider {
  public readonly name = "sentry";
  private sentry: SentrySDK;

  constructor(sentryInstance: SentrySDK) {
    this.sentry = sentryInstance;
  }

  reportError(
    error: Error | TryError | ReactTryError,
    context?: TelemetryContext
  ): void {
    // Convert TryError to a regular Error for Sentry
    const errorToReport =
      error instanceof Error ? error : new Error(error.message);

    // Preserve the original stack if available
    if ("stack" in error && error.stack) {
      errorToReport.stack = error.stack;
    }

    // Build Sentry context
    const sentryContext: Parameters<SentrySDK["captureException"]>[1] = {
      tags: context?.tags,
      extra: {
        ...context?.metadata,
        tryError: "type" in error ? error.type : undefined,
        source: "source" in error ? error.source : undefined,
        timestamp: "timestamp" in error ? error.timestamp : undefined,
        errorContext: "context" in error ? error.context : undefined,
      },
      contexts: {
        react: {
          componentName: context?.component,
          componentStack: context?.componentStack,
        },
      },
      fingerprint: context?.fingerprint,
      level: context?.severity,
    };

    // Remove undefined values
    Object.keys(sentryContext).forEach((key) => {
      if (sentryContext[key as keyof typeof sentryContext] === undefined) {
        delete sentryContext[key as keyof typeof sentryContext];
      }
    });

    this.sentry.captureException(errorToReport, sentryContext);
  }

  reportEvent(eventName: string, data?: Record<string, unknown>): void {
    this.sentry.captureMessage(eventName, "info");
    if (data) {
      this.sentry.addBreadcrumb({
        message: eventName,
        category: "custom",
        data,
      });
    }
  }

  setUser(user: TelemetryUser): void {
    this.sentry.setUser(user);
  }

  clearUser(): void {
    this.sentry.setUser(null);
  }

  addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void {
    this.sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level,
      type: breadcrumb.type,
      timestamp: breadcrumb.timestamp,
      data: breadcrumb.data,
    });
  }

  setTags(tags: Record<string, string | number | boolean>): void {
    this.sentry.setTags(tags);
  }

  setContext(key: string, context: Record<string, unknown>): void {
    this.sentry.setContext(key, context);
  }
}

/**
 * Helper function to create a Sentry provider
 *
 * @example
 * ```ts
 * import * as Sentry from "@sentry/react";
 * import { createSentryProvider, telemetry } from "@try-error/react";
 *
 * // Initialize Sentry
 * Sentry.init({
 *   dsn: "your-dsn",
 *   // ... other options
 * });
 *
 * // Register the provider
 * telemetry.registerProvider(createSentryProvider(Sentry));
 * ```
 */
export function createSentryProvider(
  sentryInstance: SentrySDK
): SentryProvider {
  return new SentryProvider(sentryInstance);
}
