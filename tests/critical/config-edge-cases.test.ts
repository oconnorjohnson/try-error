import {
  configure,
  getConfig,
  resetConfig,
  ConfigPresets,
  getConfigVersion,
  addConfigChangeListener,
  removeConfigChangeListener,
} from "../../src/config";
import { createError } from "../../src/errors";

describe("Configuration Edge Cases", () => {
  // Save original env
  const originalEnv = process.env.NODE_ENV;
  // Track listeners to clean up
  const testListeners: Array<() => void> = [];

  beforeEach(() => {
    resetConfig();
    // Clear any leftover listeners
    testListeners.length = 0;
  });

  afterEach(() => {
    // Remove all test listeners before reset to prevent errors
    testListeners.forEach((listener) => {
      try {
        removeConfigChangeListener(listener);
      } catch {
        // Ignore errors during cleanup
      }
    });
    testListeners.length = 0;
    resetConfig();
    process.env.NODE_ENV = originalEnv;
  });

  describe("Config Validation Failures", () => {
    it("should handle invalid config object gracefully", () => {
      const invalidConfig = null;
      expect(() => configure(invalidConfig as any)).toThrow();
    });

    it("should handle config with invalid captureStackTrace type", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const invalidConfig = { captureStackTrace: "not-a-boolean" };
      expect(() => configure(invalidConfig as any)).toThrow();

      consoleSpy.mockRestore();
    });

    it("should handle config with invalid stackTraceLimit type", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const invalidConfig = { stackTraceLimit: "not-a-number" };
      expect(() => configure(invalidConfig as any)).toThrow();

      consoleSpy.mockRestore();
    });

    it("should handle config with invalid defaultErrorType type", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const invalidConfig = { defaultErrorType: 123 };
      expect(() => configure(invalidConfig as any)).toThrow();

      consoleSpy.mockRestore();
    });

    it("should handle config with invalid serializer type", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const invalidConfig = { serializer: "not-a-function" };
      expect(() => configure(invalidConfig as any)).toThrow();

      consoleSpy.mockRestore();
    });

    it("should handle config with invalid onError type", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const invalidConfig = { onError: "not-a-function" };
      expect(() => configure(invalidConfig as any)).toThrow();

      consoleSpy.mockRestore();
    });

    it("should handle unknown preset names", () => {
      expect(() => configure("unknown-preset" as any)).toThrow();
    });
  });

  describe("Config Change Listeners", () => {
    it("should handle listener that throws errors", () => {
      const faultyListener = jest.fn(() => {
        throw new Error("Listener failed");
      });

      testListeners.push(faultyListener);
      addConfigChangeListener(faultyListener);

      // Should not crash when listener throws
      expect(() => configure({ captureStackTrace: false })).not.toThrow();
      expect(faultyListener).toHaveBeenCalled();
    });

    it("should handle multiple listeners with some failing", () => {
      const goodListener = jest.fn();
      const faultyListener = jest.fn(() => {
        throw new Error("Listener failed");
      });

      testListeners.push(goodListener, faultyListener);
      addConfigChangeListener(goodListener);
      addConfigChangeListener(faultyListener);

      configure({ captureStackTrace: false });

      expect(goodListener).toHaveBeenCalled();
      expect(faultyListener).toHaveBeenCalled();
    });

    it("should handle removing listener that was never added", () => {
      const listener = jest.fn();
      expect(() => removeConfigChangeListener(listener)).not.toThrow();
    });

    it("should handle adding same listener multiple times", () => {
      const listener = jest.fn();
      testListeners.push(listener);
      addConfigChangeListener(listener);
      addConfigChangeListener(listener);

      configure({ captureStackTrace: false });

      // Should only be called once (set behavior)
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Config Cache Invalidation", () => {
    it("should invalidate cache when config changes", () => {
      configure({ captureStackTrace: true });
      const firstError = createError({ type: "Test", message: "Test" });

      configure({ captureStackTrace: false });
      const secondError = createError({ type: "Test", message: "Test" });

      expect(firstError.stack).toBeDefined();
      expect(secondError.stack).toBeUndefined();
    });

    it("should increment version on config change", () => {
      const version1 = getConfigVersion();
      configure({ captureStackTrace: false });
      const version2 = getConfigVersion();
      configure({ developmentMode: true });
      const version3 = getConfigVersion();

      expect(version2).toBeGreaterThan(version1);
      expect(version3).toBeGreaterThan(version2);
    });

    it("should increment version on reset", () => {
      const version1 = getConfigVersion();
      configure({ captureStackTrace: false });
      const version2 = getConfigVersion();
      resetConfig();
      const version3 = getConfigVersion();

      expect(version2).toBeGreaterThan(version1);
      expect(version3).toBeGreaterThan(version2);
    });
  });

  describe("Deep Merge Conflicts", () => {
    it("should handle overlapping nested config properties", () => {
      configure({
        performance: {
          errorCreation: {
            cacheConstructors: true,
            poolSize: 50,
          },
        },
      });

      configure({
        performance: {
          errorCreation: {
            poolSize: 100,
          },
          contextCapture: {
            maxContextSize: 1000,
          },
        },
      });

      const config = getConfig();
      expect(config.performance?.errorCreation?.cacheConstructors).toBe(true);
      expect(config.performance?.errorCreation?.poolSize).toBe(100);
      expect(config.performance?.contextCapture?.maxContextSize).toBe(1000);
    });

    it("should handle null and undefined values in merge", () => {
      configure({
        performance: {
          errorCreation: {
            cacheConstructors: true,
          },
        },
      });

      configure({
        performance: null as any,
      });

      const config = getConfig();
      expect(config.performance).toBeNull();
    });

    it("should handle array values in merge", () => {
      configure({
        sourceLocation: {
          format: "file:line",
        },
      });

      configure({
        sourceLocation: {
          format: "full",
        },
      });

      const config = getConfig();
      expect(config.sourceLocation?.format).toBe("full");
    });
  });

  describe("Environment Detection Failures", () => {
    it("should handle undefined NODE_ENV", () => {
      delete process.env.NODE_ENV;

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true); // Should default to true
    });

    it("should handle corrupted NODE_ENV", () => {
      process.env.NODE_ENV = "corrupted-value";

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true); // Should default to true for non-production
    });

    it("should handle missing process object", () => {
      const originalProcess = global.process;
      delete (global as any).process;

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true); // Should default to true

      global.process = originalProcess;
    });
  });

  describe("Preset Cache Overflow", () => {
    it("should handle LRU cache eviction", () => {
      // Create many different preset configurations to overflow cache
      const presets = [
        ConfigPresets.development,
        ConfigPresets.production,
        ConfigPresets.test,
        ConfigPresets.performance,
        ConfigPresets.minimal,
        ConfigPresets.serverProduction,
        ConfigPresets.clientProduction,
        ConfigPresets.edge,
        ConfigPresets.nextjs,
      ];

      // Call each preset multiple times to test cache behavior
      presets.forEach((preset) => {
        const config1 = preset();
        const config2 = preset();

        // Should return same object (cached)
        expect(config1).toBe(config2);
      });
    });

    it("should handle preset cache clear", () => {
      const config1 = ConfigPresets.development();
      resetConfig(); // This might clear internal caches
      const config2 = ConfigPresets.development();

      // Should still work correctly
      expect(config1.captureStackTrace).toBe(config2.captureStackTrace);
    });
  });

  describe("Config Version Edge Cases", () => {
    it("should handle version overflow", () => {
      const startVersion = getConfigVersion();

      // Trigger many version increments
      for (let i = 0; i < 1000; i++) {
        configure({ captureStackTrace: i % 2 === 0 });
      }

      const endVersion = getConfigVersion();
      expect(endVersion).toBeGreaterThan(startVersion);
      expect(endVersion).toBe(startVersion + 1000);
    });

    it("should handle concurrent listener notifications", () => {
      const listenerCalls: number[] = [];

      const listener1 = jest.fn(() => listenerCalls.push(1));
      const listener2 = jest.fn(() => listenerCalls.push(2));
      const listener3 = jest.fn(() => listenerCalls.push(3));

      testListeners.push(listener1, listener2, listener3);
      addConfigChangeListener(listener1);
      addConfigChangeListener(listener2);
      addConfigChangeListener(listener3);

      configure({ captureStackTrace: false });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();
      expect(listenerCalls.length).toBe(3);
    });
  });

  describe("Performance Config Edge Cases", () => {
    it("should handle negative pool size", () => {
      expect(() =>
        configure({
          performance: {
            errorCreation: {
              poolSize: -10,
            },
          },
        })
      ).not.toThrow();

      const config = getConfig();
      expect(config.performance?.errorCreation?.poolSize).toBe(-10);
    });

    it("should handle zero pool size", () => {
      configure({
        performance: {
          errorCreation: {
            poolSize: 0,
          },
        },
      });

      const config = getConfig();
      expect(config.performance?.errorCreation?.poolSize).toBe(0);
    });

    it("should handle extremely large pool size", () => {
      configure({
        performance: {
          errorCreation: {
            poolSize: Number.MAX_SAFE_INTEGER,
          },
        },
      });

      const config = getConfig();
      expect(config.performance?.errorCreation?.poolSize).toBe(
        Number.MAX_SAFE_INTEGER
      );
    });
  });

  describe("Runtime Handler Failures", () => {
    it("should handle environment handler that throws", () => {
      configure({
        runtimeDetection: true,
        environmentHandlers: {
          server: () => {
            throw new Error("Handler failed");
          },
        },
      });

      const config = getConfig();
      expect(config.environmentHandlers?.server).toBeDefined();
      expect(() =>
        config.environmentHandlers?.server?.(
          createError({ type: "Test", message: "Test" })
        )
      ).toThrow();
    });

    it("should handle missing environment handlers", () => {
      configure({
        runtimeDetection: true,
        environmentHandlers: {
          server: undefined as any,
        },
      });

      const config = getConfig();
      expect(config.environmentHandlers?.server).toBeUndefined();
    });
  });
});
