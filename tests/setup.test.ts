import {
  setupNode,
  setupReact,
  setupNextJs,
  setupPerformance,
  setupTesting,
  autoSetup,
  createCustomSetup,
  validateSetup,
  composeSetups,
  createDynamicSetup,
  teardownSetup,
} from "../src/setup";
import { getConfig, resetConfig, configure } from "../src/config";

// Mock environment variables and global objects
const originalEnv = process.env;
const originalWindow = global.window;
const originalDocument = global.document;
const originalNavigator = global.navigator;

describe("Setup Utilities", () => {
  beforeEach(() => {
    resetConfig();
    teardownSetup();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
    resetConfig();
    teardownSetup();
  });

  describe("setupNode", () => {
    it("should configure for development environment", () => {
      process.env = { ...originalEnv, NODE_ENV: "development" };
      setupNode();

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true);
      expect(config.stackTraceLimit).toBe(50);
      expect(config.developmentMode).toBe(true);
    });

    it("should configure for production environment", () => {
      process.env = { ...originalEnv, NODE_ENV: "production" };
      setupNode();

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.stackTraceLimit).toBe(0);
      expect(config.includeSource).toBe(false);
      expect(config.developmentMode).toBe(false);
    });

    it("should configure for test environment", () => {
      process.env = { ...originalEnv, NODE_ENV: "test" };
      setupNode();

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true);
      expect(config.stackTraceLimit).toBe(10);
      expect(config.developmentMode).toBe(true);
    });

    it("should apply custom options", () => {
      const customOnError = jest.fn();
      setupNode({
        onError: customOnError,
        stackTraceLimit: 100,
      });

      const config = getConfig();
      expect(config.onError).toBe(customOnError);
      expect(config.stackTraceLimit).toBe(100);
    });

    it("should track active setup", () => {
      setupNode();
      const validation = validateSetup();
      expect(validation.activeSetups).toContain("node");
    });
  });

  describe("setupReact", () => {
    beforeEach(() => {
      // Save original NODE_ENV
      process.env = { ...originalEnv };
      // Set to development for React tests
      process.env.NODE_ENV = "development";
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should detect development environment via localhost", () => {
      // @ts-ignore
      global.window = {
        location: {
          hostname: "localhost",
          href: "",
          origin: "",
          protocol: "",
          host: "",
          pathname: "",
          search: "",
          hash: "",
          port: "",
        } as any,
      };

      setupReact();
      const config = getConfig();
      expect(config.captureStackTrace).toBe(true);
      expect(config.developmentMode).toBe(true);
    });

    it("should detect development environment via 127.0.0.1", () => {
      // @ts-ignore
      global.window = {
        location: {
          hostname: "127.0.0.1",
          href: "",
          origin: "",
          protocol: "",
          host: "",
          pathname: "",
          search: "",
          hash: "",
          port: "",
        } as any,
      };

      setupReact();
      const config = getConfig();
      expect(config.developmentMode).toBe(true);
    });

    it("should detect development environment via local IP", () => {
      // @ts-ignore
      global.window = {
        location: {
          hostname: "192.168.1.100",
          href: "",
          origin: "",
          protocol: "",
          host: "",
          pathname: "",
          search: "",
          hash: "",
          port: "",
        } as any,
      };

      setupReact();
      const config = getConfig();
      expect(config.developmentMode).toBe(true);
    });

    it("should configure for production when not localhost", () => {
      // Set to production
      process.env.NODE_ENV = "production";

      // @ts-ignore
      global.window = {
        location: {
          hostname: "example.com",
          href: "",
          origin: "",
          protocol: "",
          host: "",
          pathname: "",
          search: "",
          hash: "",
          port: "",
        } as any,
      };

      setupReact();
      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(false);
    });

    it("should handle IPv6 localhost", () => {
      // @ts-ignore
      global.window = {
        location: {
          hostname: "[::1]",
          href: "",
          origin: "",
          protocol: "",
          host: "",
          pathname: "",
          search: "",
          hash: "",
          port: "",
        } as any,
      };

      setupReact();
      const config = getConfig();
      expect(config.developmentMode).toBe(true);
    });

    it("should apply custom options", () => {
      const customOnError = jest.fn();
      setupReact({ onError: customOnError });

      const config = getConfig();
      expect(config.onError).toBe(customOnError);
    });
  });

  describe("setupNextJs", () => {
    it("should detect Next.js via NEXT_RUNTIME", () => {
      process.env = { ...originalEnv, NEXT_RUNTIME: "nodejs" };
      setupNextJs();

      const config = getConfig();
      expect(config.runtimeDetection).toBe(true);
      expect(config.environmentHandlers).toBeDefined();
    });

    it("should detect Next.js via __NEXT_PRIVATE_PREBUNDLED_REACT", () => {
      process.env = {
        ...originalEnv,
        __NEXT_PRIVATE_PREBUNDLED_REACT: "true",
      };
      setupNextJs();

      const config = getConfig();
      expect(config.runtimeDetection).toBe(true);
    });

    it("should detect Next.js via NEXT_PUBLIC_VERCEL_ENV", () => {
      process.env = { ...originalEnv, NEXT_PUBLIC_VERCEL_ENV: "production" };
      setupNextJs();

      const config = getConfig();
      expect(config.runtimeDetection).toBe(true);
    });

    it("should warn when Next.js not detected", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      process.env = { ...originalEnv };
      delete process.env.NEXT_RUNTIME;

      setupNextJs();

      expect(consoleSpy).toHaveBeenCalledWith(
        "setupNextJs called but Next.js environment not detected"
      );
      consoleSpy.mockRestore();
    });

    it("should merge custom environment handlers", () => {
      const customServerHandler = jest.fn();
      const customClientHandler = jest.fn();

      setupNextJs({
        environmentHandlers: {
          server: customServerHandler,
          client: customClientHandler,
        },
      });

      const config = getConfig();
      expect(config.environmentHandlers?.server).toBe(customServerHandler);
      expect(config.environmentHandlers?.client).toBe(customClientHandler);
    });

    it("should apply custom options while preserving Next.js defaults", () => {
      process.env = { ...originalEnv, NEXT_RUNTIME: "nodejs" };
      setupNextJs({
        captureStackTrace: false,
        includeSource: true,
      });

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.includeSource).toBe(true);
      expect(config.runtimeDetection).toBe(true); // Preserved from preset
    });
  });

  describe("setupPerformance", () => {
    it("should configure for maximum performance", () => {
      setupPerformance();

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.stackTraceLimit).toBe(0);
      expect(config.includeSource).toBe(false);
      expect(config.developmentMode).toBe(false);
    });

    it("should provide minimal serializer", () => {
      setupPerformance();

      const config = getConfig();
      const error = {
        type: "TestError",
        message: "Test message",
        timestamp: Date.now(),
        source: "test.ts",
        context: { sensitive: "data" },
      };

      const serialized = config.serializer?.(error as any);
      expect(serialized).toEqual({
        type: error.type,
        message: error.message,
        timestamp: error.timestamp,
      });
      expect(serialized?.context).toBeUndefined();
    });

    it("should apply custom options", () => {
      const customOnError = jest.fn();
      setupPerformance({ onError: customOnError });

      const config = getConfig();
      expect(config.onError).toBe(customOnError);
    });
  });

  describe("setupTesting", () => {
    it("should configure for testing environment", () => {
      setupTesting();

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true);
      expect(config.stackTraceLimit).toBe(10);
      expect(config.includeSource).toBe(true);
      expect(config.developmentMode).toBe(true);
    });

    it("should provide comprehensive serializer", () => {
      setupTesting();

      const config = getConfig();
      const error = {
        type: "TestError",
        message: "Test message",
        context: { test: "data" },
        source: "test.ts",
        stack: "Error: Test\n    at test.ts:1:1",
      };

      const serialized = config.serializer?.(error as any);
      expect(serialized).toEqual({
        type: error.type,
        message: error.message,
        context: error.context,
        source: error.source,
        stack: error.stack,
      });
    });

    it("should collect errors when configured", () => {
      const errors: any[] = [];
      setupTesting({
        onError: (error) => {
          errors.push(error);
          return error;
        },
      });

      const config = getConfig();
      const testError = { type: "TestError" } as any;
      config.onError?.(testError);

      expect(errors).toContain(testError);
    });
  });

  describe("autoSetup", () => {
    let originalJestWorkerId: string | undefined;

    beforeEach(() => {
      // Save original values
      process.env = { ...originalEnv };
      originalJestWorkerId = process.env.JEST_WORKER_ID;

      // Clear test environment indicators for these tests
      delete process.env.JEST_WORKER_ID;
      delete process.env.NODE_ENV; // Remove test env
    });

    afterEach(() => {
      process.env = originalEnv;
      // Restore Jest worker ID
      if (originalJestWorkerId !== undefined) {
        process.env.JEST_WORKER_ID = originalJestWorkerId;
      }
      // Clean up any global modifications
      // @ts-ignore
      delete globalThis.Deno;
      // @ts-ignore
      delete globalThis.Bun;
    });

    it("should detect Node.js environment", () => {
      // @ts-ignore
      global.window = undefined;

      // Mock process.versions.node
      const originalVersions = process.versions;
      Object.defineProperty(process, "versions", {
        value: { ...originalVersions, node: "16.0.0" },
        configurable: true,
      });

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("node");

      // Restore
      Object.defineProperty(process, "versions", {
        value: originalVersions,
        configurable: true,
      });
    });

    it("should detect browser environment", () => {
      // @ts-ignore
      global.window = {};
      // @ts-ignore
      global.document = {};
      // @ts-ignore
      global.navigator = {};

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("react");
    });

    it("should detect Next.js environment", () => {
      process.env.NEXT_RUNTIME = "nodejs";
      // @ts-ignore
      global.window = undefined;

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("nextjs");
    });

    it("should detect test environment via NODE_ENV", () => {
      process.env.NODE_ENV = "test";

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("test");
    });

    it("should detect test environment via JEST_WORKER_ID", () => {
      process.env.JEST_WORKER_ID = "1";

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("test");
    });

    it("should detect Deno environment", () => {
      // @ts-ignore
      globalThis.Deno = {};

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("deno");
    });

    it("should detect Bun environment", () => {
      // @ts-ignore
      globalThis.Bun = {};

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("bun");
    });

    it("should detect React Native environment", () => {
      // @ts-ignore
      global.navigator = { product: "ReactNative" };

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("react-native");
    });

    it("should detect Electron environment", () => {
      // Mock process.versions.electron
      const originalVersions = process.versions;
      Object.defineProperty(process, "versions", {
        value: { ...originalVersions, electron: "13.0.0" },
        configurable: true,
      });

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("electron");

      // Restore
      Object.defineProperty(process, "versions", {
        value: originalVersions,
        configurable: true,
      });
    });

    it("should fall back to basic configuration", () => {
      // Clear all environment indicators
      // @ts-ignore
      global.window = undefined;
      // @ts-ignore
      global.document = undefined;
      // @ts-ignore
      global.navigator = undefined;

      // Mock empty process.versions
      const originalVersions = process.versions;
      Object.defineProperty(process, "versions", {
        value: {},
        configurable: true,
      });

      autoSetup();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("fallback");

      // Restore
      Object.defineProperty(process, "versions", {
        value: originalVersions,
        configurable: true,
      });
    });

    it("should apply custom options", () => {
      const customOnError = jest.fn();
      autoSetup({ onError: customOnError });

      const config = getConfig();
      expect(config.onError).toBe(customOnError);
    });
  });

  describe("createCustomSetup", () => {
    it("should create a setup function with base config", () => {
      const baseConfig = {
        captureStackTrace: false,
        developmentMode: true,
      };

      const customSetup = createCustomSetup(baseConfig);
      customSetup();

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(true);
    });

    it("should allow overriding base config", () => {
      const baseConfig = {
        captureStackTrace: false,
        developmentMode: true,
      };

      const customSetup = createCustomSetup(baseConfig);
      customSetup({ captureStackTrace: true });

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true);
      expect(config.developmentMode).toBe(true);
    });

    it("should work with organization-specific defaults", () => {
      const orgSetup = createCustomSetup({
        onError: (error) => {
          // Send to org monitoring service
          return error;
        },
        serializer: (error) => ({
          // Custom serialization
          type: error.type,
          message: error.message,
          orgId: "my-org",
        }),
      });

      orgSetup();

      const config = getConfig();
      expect(config.onError).toBeDefined();
      expect(config.serializer).toBeDefined();

      const serialized = config.serializer?.({
        type: "TestError",
        message: "Test",
      } as any);
      expect(serialized).toHaveProperty("orgId", "my-org");
    });
  });

  describe("validateSetup", () => {
    it("should return valid when setup is correct", () => {
      setupNode();

      const validation = validateSetup();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should warn when no setup was called", () => {
      const validation = validateSetup();
      expect(validation.warnings).toContain(
        "No setup function has been called"
      );
    });

    it("should warn about conflicting setups", () => {
      setupNode();
      setupReact();

      const validation = validateSetup();
      expect(validation.warnings).toContain(
        "Both Node.js and React setups are active"
      );
    });

    it("should track multiple active setups", () => {
      setupNode();
      setupPerformance();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("node");
      expect(validation.activeSetups).toContain("performance");
    });
  });

  describe("composeSetups", () => {
    it("should compose multiple setup functions", () => {
      const setup1 = jest.fn(() => setupNode());
      const setup2 = jest.fn(() => configure({ stackTraceLimit: 100 } as any));

      const composed = composeSetups([setup1, setup2]);
      composed();

      expect(setup1).toHaveBeenCalled();
      expect(setup2).toHaveBeenCalled();

      const validation = validateSetup();
      expect(validation.activeSetups).toContain("composed");
    });

    it("should pass options to all setups", () => {
      const options = { developmentMode: false };
      const setup1 = jest.fn();
      const setup2 = jest.fn();

      const composed = composeSetups([setup1, setup2]);
      composed(options);

      expect(setup1).toHaveBeenCalledWith(options);
      expect(setup2).toHaveBeenCalledWith(options);
    });
  });

  describe("createDynamicSetup", () => {
    it("should use true setup when condition is true", () => {
      const condition = jest.fn(() => true);
      const trueSetup = jest.fn(setupPerformance);
      const falseSetup = jest.fn(setupTesting);

      const dynamic = createDynamicSetup(condition, trueSetup, falseSetup);
      dynamic();

      expect(condition).toHaveBeenCalled();
      expect(trueSetup).toHaveBeenCalled();
      expect(falseSetup).not.toHaveBeenCalled();
    });

    it("should use false setup when condition is false", () => {
      const condition = jest.fn(() => false);
      const trueSetup = jest.fn(setupPerformance);
      const falseSetup = jest.fn(setupTesting);

      const dynamic = createDynamicSetup(condition, trueSetup, falseSetup);
      dynamic();

      expect(condition).toHaveBeenCalled();
      expect(trueSetup).not.toHaveBeenCalled();
      expect(falseSetup).toHaveBeenCalled();
    });

    it("should work with runtime conditions", () => {
      process.env = { ...originalEnv, NODE_ENV: "production" };

      const dynamic = createDynamicSetup(
        () => process.env.NODE_ENV === "production",
        setupPerformance,
        setupTesting
      );

      dynamic();

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false); // Performance config
    });
  });

  describe("teardownSetup", () => {
    it("should reset configuration and clear active setups", () => {
      setupNode();
      setupReact();

      let validation = validateSetup();
      expect(validation.activeSetups.length).toBeGreaterThan(0);

      teardownSetup();

      validation = validateSetup();
      expect(validation.activeSetups).toHaveLength(0);
      expect(validation.warnings).toContain(
        "No setup function has been called"
      );
    });

    it("should reset config to defaults", () => {
      setupPerformance();
      teardownSetup();

      const config = getConfig();
      // Should be back to defaults
      expect(config.captureStackTrace).toBe(true); // Default in non-production
    });
  });
});
