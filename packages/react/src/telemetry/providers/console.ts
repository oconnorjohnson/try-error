import { TryError } from "try-error";
import { ReactTryError } from "../../types";
import {
  TelemetryProvider,
  TelemetryContext,
  TelemetryUser,
  TelemetryBreadcrumb,
} from "../index";

/**
 * Console telemetry provider for development and debugging
 */
export class ConsoleProvider implements TelemetryProvider {
  public readonly name = "console";
  private enabled = true;
  private user: TelemetryUser | null = null;
  private tags: Record<string, string | number | boolean> = {};
  private contexts: Record<string, Record<string, unknown>> = {};

  constructor(
    private options: {
      /**
       * Whether to use console groups for better organization
       */
      useGroups?: boolean;
      /**
       * Whether to include timestamps
       */
      includeTimestamps?: boolean;
      /**
       * Custom log prefix
       */
      prefix?: string;
      /**
       * Log level filter
       */
      minLevel?: "debug" | "info" | "warning" | "error";
    } = {}
  ) {}

  private shouldLog(level: string): boolean {
    const levels = ["debug", "info", "warning", "error"];
    const minIndex = levels.indexOf(this.options.minLevel || "debug");
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  private formatMessage(message: string): string {
    const prefix = this.options.prefix || "[TryError]";
    const timestamp = this.options.includeTimestamps
      ? new Date().toISOString()
      : "";
    return timestamp
      ? `${prefix} ${timestamp} ${message}`
      : `${prefix} ${message}`;
  }

  reportError(
    error: Error | TryError | ReactTryError,
    context?: TelemetryContext
  ): void {
    if (!this.enabled) return;

    const level = context?.severity || "error";
    if (!this.shouldLog(level)) return;

    const message = this.formatMessage(
      `${level.toUpperCase()}: ${error.message}`
    );

    if (this.options.useGroups) {
      console.group(message);
    } else {
      switch (level) {
        case "warning":
          console.warn(message);
          break;
        case "error":
        case "fatal":
          console.error(message);
          break;
        case "debug":
          console.debug(message);
          break;
        default:
          console.info(message);
      }
    }

    // Log error details
    console.log("Error Type:", "type" in error ? error.type : "Error");

    if ("source" in error) {
      console.log("Source:", error.source);
    }

    if ("timestamp" in error) {
      console.log("Timestamp:", new Date(error.timestamp).toISOString());
    }

    if ("stack" in error && error.stack) {
      console.log("Stack Trace:");
      console.log(error.stack);
    }

    // Log context
    if (context) {
      if (context.component) {
        console.log("Component:", context.component);
      }

      if (context.componentStack) {
        console.log("Component Stack:");
        console.log(context.componentStack);
      }

      if (context.tags && Object.keys(context.tags).length > 0) {
        console.log("Tags:", context.tags);
      }

      if (context.metadata && Object.keys(context.metadata).length > 0) {
        console.log("Metadata:", context.metadata);
      }

      if (context.fingerprint) {
        console.log("Fingerprint:", context.fingerprint);
      }
    }

    // Log error context
    if ("context" in error && error.context) {
      console.log("Error Context:", error.context);
    }

    // Log current user if set
    if (this.user) {
      console.log("User:", this.user);
    }

    // Log global tags
    if (Object.keys(this.tags).length > 0) {
      console.log("Global Tags:", this.tags);
    }

    // Log global contexts
    if (Object.keys(this.contexts).length > 0) {
      console.log("Global Contexts:", this.contexts);
    }

    if (this.options.useGroups) {
      console.groupEnd();
    }
  }

  reportEvent(eventName: string, data?: Record<string, unknown>): void {
    if (!this.enabled || !this.shouldLog("info")) return;

    console.info(this.formatMessage(`Event: ${eventName}`), data || {});
  }

  setUser(user: TelemetryUser): void {
    this.user = user;
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("User set:"), user);
    }
  }

  clearUser(): void {
    this.user = null;
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("User cleared"));
    }
  }

  addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void {
    if (!this.enabled || !this.shouldLog(breadcrumb.level || "debug")) return;

    const level = breadcrumb.level || "info";
    const message = this.formatMessage(
      `Breadcrumb [${breadcrumb.category || "default"}]: ${breadcrumb.message}`
    );
    const data = breadcrumb.data || {};

    switch (level) {
      case "warning":
        console.warn(message, data);
        break;
      case "error":
      case "critical":
        console.error(message, data);
        break;
      case "debug":
        console.debug(message, data);
        break;
      default:
        console.info(message, data);
    }
  }

  setTags(tags: Record<string, string | number | boolean>): void {
    this.tags = { ...this.tags, ...tags };
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("Tags updated:"), this.tags);
    }
  }

  setContext(key: string, context: Record<string, unknown>): void {
    this.contexts[key] = context;
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage(`Context '${key}' updated:`), context);
    }
  }

  /**
   * Enable or disable the console provider
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

/**
 * Helper function to create a console provider
 *
 * @example
 * ```ts
 * import { createConsoleProvider, telemetry } from "@try-error/react";
 *
 * // For development
 * if (process.env.NODE_ENV === "development") {
 *   telemetry.registerProvider(createConsoleProvider({
 *     useGroups: true,
 *     includeTimestamps: true,
 *     minLevel: "debug"
 *   }));
 * }
 * ```
 */
export function createConsoleProvider(
  options?: ConstructorParameters<typeof ConsoleProvider>[0]
): ConsoleProvider {
  return new ConsoleProvider(options);
}
