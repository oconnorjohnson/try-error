import { createError } from "try-error";
import {
  telemetry,
  TelemetryProvider,
  TelemetryContext,
  TelemetryUser,
  TelemetryBreadcrumb,
  createConsoleProvider,
  createReactError,
} from "../../src";

// Mock provider for testing
class MockProvider implements TelemetryProvider {
  public readonly name = "mock";
  public errors: Array<{ error: any; context?: TelemetryContext }> = [];
  public events: Array<{ name: string; data?: any }> = [];
  public breadcrumbs: TelemetryBreadcrumb[] = [];
  public user: TelemetryUser | null = null;
  public tags: Record<string, any> = {};
  public contexts: Record<string, any> = {};

  reportError(error: any, context?: TelemetryContext): void {
    this.errors.push({ error, context });
  }

  reportEvent(eventName: string, data?: Record<string, unknown>): void {
    this.events.push({ name: eventName, data });
  }

  setUser(user: TelemetryUser): void {
    this.user = user;
  }

  clearUser(): void {
    this.user = null;
  }

  addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void {
    this.breadcrumbs.push(breadcrumb);
  }

  setTags(tags: Record<string, string | number | boolean>): void {
    this.tags = { ...this.tags, ...tags };
  }

  setContext(key: string, context: Record<string, unknown>): void {
    this.contexts[key] = context;
  }

  reset(): void {
    this.errors = [];
    this.events = [];
    this.breadcrumbs = [];
    this.user = null;
    this.tags = {};
    this.contexts = {};
  }
}

describe("Telemetry System", () => {
  let mockProvider: MockProvider;

  beforeEach(() => {
    // Clear all providers
    telemetry.clearProviders();

    // Create and register mock provider
    mockProvider = new MockProvider();
    telemetry.registerProvider(mockProvider);
  });

  afterEach(() => {
    telemetry.clearProviders();
    // Reset global state
    telemetry.setGlobalTags({});
    telemetry.setEnabled(true);
  });

  describe("Provider Management", () => {
    it("should register providers", () => {
      const providers = telemetry.getProviders();
      expect(providers).toHaveLength(1);
      expect(providers[0]).toBe(mockProvider);
    });

    it("should not register duplicate providers", () => {
      telemetry.registerProvider(mockProvider);
      const providers = telemetry.getProviders();
      expect(providers).toHaveLength(1);
    });

    it("should unregister providers", () => {
      telemetry.unregisterProvider("mock");
      const providers = telemetry.getProviders();
      expect(providers).toHaveLength(0);
    });

    it("should clear all providers", () => {
      const anotherProvider = new MockProvider();
      telemetry.registerProvider(anotherProvider);

      telemetry.clearProviders();
      expect(telemetry.getProviders()).toHaveLength(0);
    });
  });

  describe("Error Reporting", () => {
    it("should report regular errors", () => {
      const error = new Error("Test error");
      telemetry.reportError(error);

      expect(mockProvider.errors).toHaveLength(1);
      expect(mockProvider.errors[0].error).toBe(error);
    });

    it("should report TryErrors", () => {
      const error = createError({
        type: "TestError",
        message: "Test try error",
      });
      telemetry.reportError(error);

      expect(mockProvider.errors).toHaveLength(1);
      expect(mockProvider.errors[0].error).toBe(error);
    });

    it("should report React errors with context", () => {
      const error = createReactError("ComponentError", "Component failed", {
        componentName: "TestComponent",
      });

      telemetry.reportError(error);

      expect(mockProvider.errors).toHaveLength(1);
      expect(mockProvider.errors[0].error).toBe(error);
      expect(mockProvider.errors[0].context?.component).toBe("TestComponent");
    });

    it("should include custom context", () => {
      const error = new Error("Test");
      const context: TelemetryContext = {
        severity: "warning",
        tags: { feature: "test" },
        metadata: { userId: 123 },
      };

      telemetry.reportError(error, context);

      expect(mockProvider.errors[0].context).toMatchObject(context);
    });

    it("should merge global tags and context", () => {
      telemetry.setGlobalTags({ app: "test-app" });
      telemetry.setGlobalContext("environment", { version: "1.0.0" });

      const error = new Error("Test");
      const context: TelemetryContext = {
        tags: { feature: "test" },
      };

      telemetry.reportError(error, context);

      const reportedContext = mockProvider.errors[0].context;
      expect(reportedContext?.tags).toEqual({
        app: "test-app",
        feature: "test",
      });
      expect(reportedContext?.metadata).toEqual({
        environment: { version: "1.0.0" },
      });
    });

    it("should not report errors when disabled", () => {
      telemetry.setEnabled(false);
      telemetry.reportError(new Error("Test"));

      expect(mockProvider.errors).toHaveLength(0);

      telemetry.setEnabled(true);
    });

    it("should handle provider errors gracefully", () => {
      const errorProvider = new MockProvider();
      errorProvider.reportError = jest.fn(() => {
        throw new Error("Provider error");
      });

      telemetry.registerProvider(errorProvider);

      // Should not throw
      expect(() => {
        telemetry.reportError(new Error("Test"));
      }).not.toThrow();

      // Should still report to other providers
      expect(mockProvider.errors).toHaveLength(1);
    });
  });

  describe("Event Reporting", () => {
    it("should report custom events", () => {
      telemetry.reportEvent("user_action", { action: "click" });

      expect(mockProvider.events).toHaveLength(1);
      expect(mockProvider.events[0]).toEqual({
        name: "user_action",
        data: { action: "click" },
      });
    });

    it("should not report events when disabled", () => {
      telemetry.setEnabled(false);
      telemetry.reportEvent("test_event");

      expect(mockProvider.events).toHaveLength(0);

      telemetry.setEnabled(true);
    });
  });

  describe("User Management", () => {
    it("should set user across all providers", () => {
      const user: TelemetryUser = {
        id: "123",
        email: "test@example.com",
        username: "testuser",
      };

      telemetry.setUser(user);
      expect(mockProvider.user).toEqual(user);
    });

    it("should clear user across all providers", () => {
      telemetry.setUser({ id: "123" });
      telemetry.clearUser();

      expect(mockProvider.user).toBeNull();
    });
  });

  describe("Breadcrumbs", () => {
    it("should add breadcrumbs with timestamp", () => {
      const breadcrumb: TelemetryBreadcrumb = {
        message: "User clicked button",
        category: "user",
        level: "info",
      };

      telemetry.addBreadcrumb(breadcrumb);

      expect(mockProvider.breadcrumbs).toHaveLength(1);
      expect(mockProvider.breadcrumbs[0]).toMatchObject(breadcrumb);
      expect(mockProvider.breadcrumbs[0].timestamp).toBeDefined();
    });

    it("should preserve existing timestamp", () => {
      const timestamp = Date.now() - 1000;
      const breadcrumb: TelemetryBreadcrumb = {
        message: "Test",
        timestamp,
      };

      telemetry.addBreadcrumb(breadcrumb);
      expect(mockProvider.breadcrumbs[0].timestamp).toBe(timestamp);
    });
  });

  describe("Tags and Context", () => {
    it("should set global tags", () => {
      const tags = {
        environment: "test",
        version: "1.0.0",
        feature: "telemetry",
      };

      telemetry.setGlobalTags(tags);
      expect(mockProvider.tags).toEqual(tags);
    });

    it("should merge new tags with existing", () => {
      telemetry.setGlobalTags({ env: "test" });
      telemetry.setGlobalTags({ version: "1.0.0" });

      expect(mockProvider.tags).toEqual({
        env: "test",
        version: "1.0.0",
      });
    });

    it("should set global context", () => {
      const context = { browser: "Chrome", os: "MacOS" };
      telemetry.setGlobalContext("device", context);

      expect(mockProvider.contexts.device).toEqual(context);
    });
  });

  describe("Console Provider", () => {
    let consoleSpy: {
      log: jest.SpyInstance;
      error: jest.SpyInstance;
      warn: jest.SpyInstance;
      info: jest.SpyInstance;
      debug: jest.SpyInstance;
      group: jest.SpyInstance;
      groupEnd: jest.SpyInstance;
    };

    beforeEach(() => {
      consoleSpy = {
        log: jest.spyOn(console, "log").mockImplementation(),
        error: jest.spyOn(console, "error").mockImplementation(),
        warn: jest.spyOn(console, "warn").mockImplementation(),
        info: jest.spyOn(console, "info").mockImplementation(),
        debug: jest.spyOn(console, "debug").mockImplementation(),
        group: jest.spyOn(console, "group").mockImplementation(),
        groupEnd: jest.spyOn(console, "groupEnd").mockImplementation(),
      };
    });

    afterEach(() => {
      Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
    });

    it("should log errors to console", () => {
      const consoleProvider = createConsoleProvider();
      telemetry.registerProvider(consoleProvider);

      const error = createError({
        type: "TestError",
        message: "Console test error",
      });

      telemetry.reportError(error);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining("ERROR: Console test error")
      );
      expect(consoleSpy.log).toHaveBeenCalledWith("Error Type:", "TestError");
    });

    it("should use console groups when enabled", () => {
      const consoleProvider = createConsoleProvider({ useGroups: true });
      telemetry.registerProvider(consoleProvider);

      telemetry.reportError(new Error("Test"));

      expect(consoleSpy.group).toHaveBeenCalled();
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    it("should respect log level filtering", () => {
      const consoleProvider = createConsoleProvider({ minLevel: "error" });
      telemetry.registerProvider(consoleProvider);

      telemetry.reportError(new Error("Error"), { severity: "error" });
      telemetry.reportError(new Error("Warning"), { severity: "warning" });
      telemetry.reportError(new Error("Info"), { severity: "info" });

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it("should include timestamps when enabled", () => {
      const consoleProvider = createConsoleProvider({
        includeTimestamps: true,
      });
      telemetry.registerProvider(consoleProvider);

      telemetry.reportError(new Error("Test"));

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[TryError\] \d{4}-\d{2}-\d{2}T/)
      );
    });
  });
});
