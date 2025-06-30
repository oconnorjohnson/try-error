import {
  configure,
  getConfig,
  resetConfig,
  ConfigPresets,
  Performance,
  getConfigVersion,
  addConfigChangeListener,
  removeConfigChangeListener,
} from "../src/config";

describe("Configuration", () => {
  // Save original env
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
    process.env.NODE_ENV = originalEnv;
  });

  describe("Basic Configuration", () => {
    it("should return default config when not configured", () => {
      const config = getConfig();
      expect(config).toBeDefined();
      expect(config.captureStackTrace).toBeDefined();
      expect(config.developmentMode).toBeDefined();
    });

    it("should update config with configure()", () => {
      configure({
        captureStackTrace: false,
        developmentMode: false,
        onError: (error) => error,
      });

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(false);
      expect(config.onError).toBeDefined();
    });

    it("should merge partial config updates", () => {
      configure({ captureStackTrace: false });
      configure({ developmentMode: false });

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(false);
    });

    it("should reset to defaults with resetConfig()", () => {
      configure({
        captureStackTrace: false,
        developmentMode: false,
      });

      resetConfig();

      const config = getConfig();
      // After reset, config should have default values
      expect(config.captureStackTrace).toBeDefined();
      expect(config.developmentMode).toBeDefined();
    });

    it("should accept preset names as strings", () => {
      configure("production");
      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(false);
    });
  });

  describe("Configuration Presets", () => {
    it("should apply development preset", () => {
      const devConfig = ConfigPresets.development();
      configure(devConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true);
      expect(config.developmentMode).toBe(true);
      expect(config.includeSource).toBe(true);
    });

    it("should apply production preset", () => {
      const prodConfig = ConfigPresets.production();
      configure(prodConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(false);
      expect(config.includeSource).toBe(true); // production keeps source for logs
    });

    it("should apply test preset", () => {
      const testConfig = ConfigPresets.test();
      configure(testConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBe(true);
      expect(config.developmentMode).toBe(true);
      expect(config.includeSource).toBe(true);
    });

    it("should apply performance preset", () => {
      const perfConfig = ConfigPresets.performance();
      configure(perfConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.includeSource).toBe(false);
      expect(config.performance).toBeDefined();
      expect(config.performance?.errorCreation?.objectPooling).toBe(true);
      expect(config.performance?.errorCreation?.poolSize).toBeGreaterThan(0);
    });

    it("should apply minimal preset", () => {
      const minimalConfig = ConfigPresets.minimal();
      configure(minimalConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.includeSource).toBe(false);
      expect(config.minimalErrors).toBe(true);
      expect(config.skipTimestamp).toBe(true);
      expect(config.skipContext).toBe(true);
    });

    it("should apply serverProduction preset", () => {
      const serverConfig = ConfigPresets.serverProduction();
      configure(serverConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(false);
      expect(config.includeSource).toBe(true);
    });

    it("should apply clientProduction preset", () => {
      const clientConfig = ConfigPresets.clientProduction();
      configure(clientConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(false);
      expect(config.includeSource).toBe(true);
    });

    it("should apply edge preset", () => {
      const edgeConfig = ConfigPresets.edge();
      configure(edgeConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBe(false);
      expect(config.developmentMode).toBe(false);
      expect(config.includeSource).toBe(true);
    });

    it("should apply nextjs preset", () => {
      const nextConfig = ConfigPresets.nextjs();
      configure(nextConfig);

      const config = getConfig();
      expect(config.captureStackTrace).toBeDefined();
      expect(config.developmentMode).toBeDefined();
    });
  });

  describe("Config Version Tracking", () => {
    it("should track config version", () => {
      const version1 = getConfigVersion();
      expect(typeof version1).toBe("number");

      configure({ captureStackTrace: false });

      const version2 = getConfigVersion();
      expect(version2).toBeGreaterThan(version1);
    });

    it("should notify listeners on config change", () => {
      const listener = jest.fn();
      addConfigChangeListener(listener);

      configure({ captureStackTrace: false });

      expect(listener).toHaveBeenCalled();

      removeConfigChangeListener(listener);
    });

    it("should remove listeners", () => {
      const listener = jest.fn();
      addConfigChangeListener(listener);
      removeConfigChangeListener(listener);

      configure({ captureStackTrace: false });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("Performance Utilities", () => {
    it("should provide performance timing", () => {
      const now = Performance.now();
      expect(typeof now).toBe("number");
      expect(now).toBeGreaterThan(0);
    });

    it("should measure error creation performance", async () => {
      const result = await Performance.measureErrorCreation(100);

      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.iterations).toBe(100);
      expect(result.errors).toBe(100);
    });

    it("should get memory usage (Node.js only)", () => {
      const memory = Performance.getMemoryUsage();

      if (memory) {
        // Running in Node.js
        expect(memory.heapUsed).toBeGreaterThan(0);
        expect(memory.heapTotal).toBeGreaterThan(0);
      } else {
        // Running in browser/other environment
        expect(memory).toBeNull();
      }
    });
  });

  describe("Config Caching", () => {
    it("should return cached config on subsequent calls", () => {
      const config1 = getConfig();
      const config2 = getConfig();

      // Should be the same object reference if cached
      expect(config1).toBe(config2);
    });

    it("should invalidate cache on configure", () => {
      const config1 = getConfig();

      configure({ developmentMode: false });

      const config2 = getConfig();
      // Should be different objects after configuration change
      expect(config1).not.toBe(config2);
      expect(config1.developmentMode).not.toBe(config2.developmentMode);
    });

    it("should invalidate cache on reset", () => {
      configure({ developmentMode: false });
      const config1 = getConfig();

      resetConfig();

      const config2 = getConfig();
      // Should be different objects after reset
      expect(config1).not.toBe(config2);
      expect(config1.developmentMode).not.toBe(config2.developmentMode);
    });
  });

  describe("Special Configuration Options", () => {
    it("should configure minimal errors", () => {
      configure({
        minimalErrors: true,
        skipTimestamp: true,
        skipContext: true,
      });

      const config = getConfig();
      expect(config.minimalErrors).toBe(true);
      expect(config.skipTimestamp).toBe(true);
      expect(config.skipContext).toBe(true);
    });

    it("should configure source location options", () => {
      configure({
        sourceLocation: {
          defaultStackOffset: 5,
          format: "file:line",
          includeFullPath: true,
        },
      });

      const config = getConfig();
      expect(config.sourceLocation).toBeDefined();
      expect(config.sourceLocation?.defaultStackOffset).toBe(5);
      expect(config.sourceLocation?.format).toBe("file:line");
      expect(config.sourceLocation?.includeFullPath).toBe(true);
    });

    it("should configure performance options", () => {
      configure({
        performance: {
          errorCreation: {
            cacheConstructors: true,
            lazyStackTrace: true,
            objectPooling: true,
            poolSize: 200,
          },
          contextCapture: {
            maxContextSize: 5000,
            deepClone: false,
            timeout: 50,
          },
          memory: {
            maxErrorHistory: 100,
            useWeakRefs: true,
            gcHints: true,
          },
        },
      });

      const config = getConfig();
      expect(config.performance).toBeDefined();
      expect(config.performance?.errorCreation?.poolSize).toBe(200);
      expect(config.performance?.contextCapture?.maxContextSize).toBe(5000);
      expect(config.performance?.memory?.maxErrorHistory).toBe(100);
    });

    it("should configure runtime detection", () => {
      configure({
        runtimeDetection: true,
        environmentHandlers: {
          server: (error) => ({ ...error, environment: "server" } as any),
          client: (error) => ({ ...error, environment: "client" } as any),
          edge: (error) => ({ ...error, environment: "edge" } as any),
        },
      });

      const config = getConfig();
      expect(config.runtimeDetection).toBe(true);
      expect(config.environmentHandlers).toBeDefined();
      expect(config.environmentHandlers?.server).toBeDefined();
      expect(config.environmentHandlers?.client).toBeDefined();
      expect(config.environmentHandlers?.edge).toBeDefined();
    });
  });
});
