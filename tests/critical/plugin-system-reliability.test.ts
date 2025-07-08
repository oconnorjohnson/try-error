import {
  PluginManager,
  pluginManager,
  Plugin,
  PluginMetadata,
} from "../../src/plugins";
import { configure, resetConfig } from "../../src/config";

describe("Plugin System Reliability", () => {
  let manager: PluginManager;

  beforeEach(() => {
    resetConfig();
    // Use a fresh plugin manager for each test
    manager = new PluginManager();
  });

  afterEach(() => {
    resetConfig();
  });

  describe("Plugin Dependency Resolution", () => {
    it("should handle circular dependencies gracefully", async () => {
      const pluginA: Plugin = {
        metadata: {
          name: "pluginA",
          version: "1.0.0",
          dependencies: ["pluginB"],
        },
      };

      const pluginB: Plugin = {
        metadata: {
          name: "pluginB",
          version: "1.0.0",
          dependencies: ["pluginA"], // Circular dependency
        },
      };

      await manager.install(pluginA);
      await expect(manager.install(pluginB)).rejects.toThrow(
        /requires.*to be installed first/i
      );
    });

    it("should handle missing dependencies", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "testPlugin",
          version: "1.0.0",
          dependencies: ["nonExistentPlugin"],
        },
      };

      await expect(manager.install(plugin)).rejects.toThrow(
        /requires.*to be installed first/i
      );
    });

    it("should handle deep dependency chains", async () => {
      const pluginA: Plugin = {
        metadata: {
          name: "pluginA",
          version: "1.0.0",
          dependencies: [],
        },
      };

      const pluginB: Plugin = {
        metadata: {
          name: "pluginB",
          version: "1.0.0",
          dependencies: ["pluginA"],
        },
      };

      const pluginC: Plugin = {
        metadata: {
          name: "pluginC",
          version: "1.0.0",
          dependencies: ["pluginB"],
        },
      };

      await manager.install(pluginA);
      await manager.install(pluginB);
      await manager.install(pluginC);

      const installed = manager.getInstalled();
      expect(installed.map((p) => p.name)).toContain("pluginA");
      expect(installed.map((p) => p.name)).toContain("pluginB");
      expect(installed.map((p) => p.name)).toContain("pluginC");
    });

    it("should handle version conflicts", () => {
      const pluginV1 = {
        name: "testPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
      };

      const pluginV2 = {
        name: "testPlugin",
        version: "2.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
      };

      expect(() => installPlugin(pluginV1)).not.toThrow();
      expect(() => installPlugin(pluginV2)).toThrow(/already installed/i);
    });
  });

  describe("Plugin Lifecycle Failures", () => {
    it("should handle plugin installation failures", () => {
      const faultyPlugin = {
        name: "faultyPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(() => {
          throw new Error("Installation failed");
        }),
        uninstall: jest.fn(),
      };

      expect(() => installPlugin(faultyPlugin)).toThrow("Installation failed");

      const installed = listInstalledPlugins();
      expect(installed).not.toContain("faultyPlugin");
    });

    it("should handle plugin uninstallation failures", () => {
      const plugin = {
        name: "testPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(() => {
          throw new Error("Uninstallation failed");
        }),
      };

      installPlugin(plugin);
      expect(() => uninstallPlugin("testPlugin")).toThrow(
        "Uninstallation failed"
      );

      // Plugin should still be in registry despite uninstall failure
      const installed = listInstalledPlugins();
      expect(installed).toContain("testPlugin");
    });

    it("should handle plugin enable/disable failures", () => {
      const plugin = {
        name: "testPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        enable: jest.fn(() => {
          throw new Error("Enable failed");
        }),
        disable: jest.fn(() => {
          throw new Error("Disable failed");
        }),
      };

      installPlugin(plugin);

      expect(() => enablePlugin("testPlugin")).toThrow("Enable failed");
      expect(() => disablePlugin("testPlugin")).toThrow("Disable failed");
    });

    it("should handle async plugin operations", async () => {
      const asyncPlugin = {
        name: "asyncPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }),
        uninstall: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }),
      };

      await expect(installPlugin(asyncPlugin)).resolves.not.toThrow();
      await expect(uninstallPlugin("asyncPlugin")).resolves.not.toThrow();
    });
  });

  describe("Plugin Capability Conflicts", () => {
    it("should handle multiple plugins modifying same configuration", () => {
      const plugin1 = {
        name: "plugin1",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          captureStackTrace: true,
          stackTraceLimit: 10,
        },
      };

      const plugin2 = {
        name: "plugin2",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          captureStackTrace: false, // Conflicting setting
          includeSource: true,
        },
      };

      installPlugin(plugin1);
      installPlugin(plugin2);

      const finalConfig = getPluginConfiguration();

      // Last installed should win for conflicts
      expect(finalConfig.captureStackTrace).toBe(false);
      expect(finalConfig.stackTraceLimit).toBe(10);
      expect(finalConfig.includeSource).toBe(true);
    });

    it("should handle plugins with conflicting middleware", () => {
      const middleware1 = jest.fn((error, next) => next());
      const middleware2 = jest.fn((error, next) => next());

      const plugin1 = {
        name: "plugin1",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        middleware: [middleware1],
      };

      const plugin2 = {
        name: "plugin2",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        middleware: [middleware2],
      };

      expect(() => installPlugin(plugin1)).not.toThrow();
      expect(() => installPlugin(plugin2)).not.toThrow();

      // Both middleware should be registered
      const registry = PluginRegistry.getInstance();
      const allMiddleware = registry.getAllMiddleware();
      expect(allMiddleware).toContain(middleware1);
      expect(allMiddleware).toContain(middleware2);
    });

    it("should handle plugins with conflicting error types", () => {
      const plugin1 = {
        name: "plugin1",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        errorTypes: {
          CustomError: {
            defaultMessage: "Plugin 1 error",
          },
        },
      };

      const plugin2 = {
        name: "plugin2",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        errorTypes: {
          CustomError: {
            defaultMessage: "Plugin 2 error", // Conflicting error type
          },
        },
      };

      installPlugin(plugin1);
      console.warn = jest.fn(); // Mock console.warn

      installPlugin(plugin2);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Error type 'CustomError' already registered")
      );
    });
  });

  describe("Plugin Registry Management", () => {
    it("should handle registry corruption", () => {
      const plugin = {
        name: "testPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
      };

      installPlugin(plugin);

      // Simulate registry corruption
      const registry = PluginRegistry.getInstance();
      (registry as any).plugins = "corrupted";

      expect(() => listInstalledPlugins()).not.toThrow();
      expect(listInstalledPlugins()).toEqual([]);
    });

    it("should handle concurrent plugin operations", async () => {
      const plugins = Array.from({ length: 10 }, (_, i) => ({
        name: `plugin${i}`,
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
      }));

      // Install all plugins concurrently
      const installPromises = plugins.map((plugin) =>
        Promise.resolve().then(() => installPlugin(plugin))
      );

      await Promise.all(installPromises);

      const installed = listInstalledPlugins();
      expect(installed).toHaveLength(10);

      // Uninstall all plugins concurrently
      const uninstallPromises = plugins.map((plugin) =>
        Promise.resolve().then(() => uninstallPlugin(plugin.name))
      );

      await Promise.all(uninstallPromises);

      const remaining = listInstalledPlugins();
      expect(remaining).toHaveLength(0);
    });

    it("should handle plugin state persistence", () => {
      const plugin = {
        name: "testPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        state: { initialized: false },
      };

      installPlugin(plugin);

      // Modify plugin state
      plugin.state.initialized = true;

      // Registry should maintain state reference
      const registry = PluginRegistry.getInstance();
      const registeredPlugin = registry.getPlugin("testPlugin");
      expect(registeredPlugin?.state?.initialized).toBe(true);
    });
  });

  describe("Configuration Merging", () => {
    it("should handle null and undefined configuration values", () => {
      const plugin1 = {
        name: "plugin1",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          captureStackTrace: null,
          stackTraceLimit: undefined,
        },
      };

      const plugin2 = {
        name: "plugin2",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          captureStackTrace: true,
          stackTraceLimit: 5,
        },
      };

      installPlugin(plugin1);
      installPlugin(plugin2);

      const config = getPluginConfiguration();
      expect(config.captureStackTrace).toBe(true);
      expect(config.stackTraceLimit).toBe(5);
    });

    it("should handle deep configuration merging", () => {
      const plugin1 = {
        name: "plugin1",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          performance: {
            errorCreation: {
              cacheConstructors: true,
              poolSize: 10,
            },
          },
        },
      };

      const plugin2 = {
        name: "plugin2",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          performance: {
            errorCreation: {
              poolSize: 20, // Override
            },
            contextCapture: {
              maxContextSize: 1000, // New property
            },
          },
        },
      };

      installPlugin(plugin1);
      installPlugin(plugin2);

      const config = getPluginConfiguration();
      expect(config.performance?.errorCreation?.cacheConstructors).toBe(true);
      expect(config.performance?.errorCreation?.poolSize).toBe(20);
      expect(config.performance?.contextCapture?.maxContextSize).toBe(1000);
    });

    it("should handle function configuration merging", () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const plugin1 = {
        name: "plugin1",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          onError: handler1,
        },
      };

      const plugin2 = {
        name: "plugin2",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          onError: handler2,
        },
      };

      installPlugin(plugin1);
      installPlugin(plugin2);

      const config = getPluginConfiguration();

      // Last installed function should win
      expect(config.onError).toBe(handler2);
    });

    it("should handle configuration change notifications", () => {
      const changeListener = jest.fn();

      const registry = PluginRegistry.getInstance();
      registry.onConfigurationChange(changeListener);

      const plugin = {
        name: "testPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        configuration: {
          captureStackTrace: true,
        },
      };

      installPlugin(plugin);

      expect(changeListener).toHaveBeenCalledWith(
        expect.objectContaining({
          captureStackTrace: true,
        })
      );
    });
  });

  describe("Plugin Isolation and Security", () => {
    it("should isolate plugin errors from affecting other plugins", () => {
      const goodPlugin = {
        name: "goodPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
      };

      const badPlugin = {
        name: "badPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(() => {
          throw new Error("Bad plugin error");
        }),
        uninstall: jest.fn(),
      };

      installPlugin(goodPlugin);

      expect(() => installPlugin(badPlugin)).toThrow("Bad plugin error");

      // Good plugin should still be installed
      const installed = listInstalledPlugins();
      expect(installed).toContain("goodPlugin");
      expect(installed).not.toContain("badPlugin");
    });

    it("should handle plugin memory leaks", () => {
      const plugin = {
        name: "memoryPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(),
        uninstall: jest.fn(),
        // Simulate memory-intensive plugin
        data: new Array(1000000).fill("memory"),
      };

      installPlugin(plugin);
      uninstallPlugin("memoryPlugin");

      // Plugin should be removed from registry
      const installed = listInstalledPlugins();
      expect(installed).not.toContain("memoryPlugin");
    });

    it("should validate plugin structure", () => {
      const invalidPlugin = {
        // Missing required fields
        version: "1.0.0",
        install: jest.fn(),
      };

      expect(() => installPlugin(invalidPlugin as any)).toThrow(
        /invalid plugin/i
      );
    });

    it("should handle malicious plugin attempts", () => {
      const maliciousPlugin = {
        name: "maliciousPlugin",
        version: "1.0.0",
        dependencies: [],
        install: jest.fn(() => {
          // Attempt to modify global objects
          (global as any).process = null;
          delete (global as any).console;
        }),
        uninstall: jest.fn(),
      };

      // Should isolate and handle malicious behavior
      expect(() => installPlugin(maliciousPlugin)).not.toThrow();

      // Global objects should be protected
      expect(global.process).toBeDefined();
      expect(global.console).toBeDefined();
    });
  });
});
