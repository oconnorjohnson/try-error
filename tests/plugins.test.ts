import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import {
  PluginManager,
  pluginManager,
  createPlugin,
  sentryPlugin,
  Plugin,
  PluginMetadata,
} from "../src/plugins";
import { TryError, TRY_ERROR_BRAND } from "../src/types";
import { TryErrorConfig } from "../src/config";

describe("PluginManager", () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe("plugin installation", () => {
    it("should install a plugin", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "test-plugin",
          version: "1.0.0",
        },
        hooks: {
          onInstall: jest.fn(() => {}),
        },
      };

      await manager.install(plugin);

      expect(manager.isInstalled("test-plugin")).toBe(true);
      expect(plugin.hooks!.onInstall).toHaveBeenCalled();
      expect(manager.getInstalled()).toContainEqual(plugin.metadata);
    });

    it("should prevent duplicate installation", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "duplicate-plugin",
          version: "1.0.0",
        },
      };

      await manager.install(plugin);
      await expect(manager.install(plugin)).rejects.toThrow(
        "Plugin duplicate-plugin is already installed"
      );
    });

    it("should check dependencies on install", async () => {
      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent",
          version: "1.0.0",
          dependencies: ["base-plugin"],
        },
      };

      await expect(manager.install(dependentPlugin)).rejects.toThrow(
        "Plugin dependent requires base-plugin to be installed first"
      );
    });

    it("should install plugins with satisfied dependencies", async () => {
      const basePlugin: Plugin = {
        metadata: {
          name: "base",
          version: "1.0.0",
        },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent",
          version: "1.0.0",
          dependencies: ["base"],
        },
      };

      await manager.install(basePlugin);
      await manager.install(dependentPlugin);

      expect(manager.isInstalled("dependent")).toBe(true);
    });
  });

  describe("plugin uninstallation", () => {
    it("should uninstall a plugin", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "removable",
          version: "1.0.0",
        },
        hooks: {
          onUninstall: jest.fn(() => {}),
        },
      };

      await manager.install(plugin);
      await manager.uninstall("removable");

      expect(manager.isInstalled("removable")).toBe(false);
      expect(plugin.hooks!.onUninstall).toHaveBeenCalled();
    });

    it("should disable before uninstalling if enabled", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "enabled-removable",
          version: "1.0.0",
        },
        hooks: {
          onEnable: jest.fn(() => {}),
          onDisable: jest.fn(() => {}),
          onUninstall: jest.fn(() => {}),
        },
      };

      await manager.install(plugin);
      await manager.enable("enabled-removable");
      await manager.uninstall("enabled-removable");

      expect(plugin.hooks!.onDisable).toHaveBeenCalled();
      expect(plugin.hooks!.onUninstall).toHaveBeenCalled();
    });

    it("should prevent uninstalling if other plugins depend on it", async () => {
      const basePlugin: Plugin = {
        metadata: {
          name: "base",
          version: "1.0.0",
        },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent",
          version: "1.0.0",
          dependencies: ["base"],
        },
      };

      await manager.install(basePlugin);
      await manager.install(dependentPlugin);

      await expect(manager.uninstall("base")).rejects.toThrow(
        "Cannot uninstall base: dependent depends on it"
      );
    });

    it("should throw when uninstalling non-existent plugin", async () => {
      await expect(manager.uninstall("non-existent")).rejects.toThrow(
        "Plugin non-existent is not installed"
      );
    });
  });

  describe("plugin enabling/disabling", () => {
    it("should enable a plugin", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "enableable",
          version: "1.0.0",
        },
        hooks: {
          onEnable: jest.fn(() => {}),
        },
      };

      await manager.install(plugin);
      await manager.enable("enableable");

      expect(manager.isEnabled("enableable")).toBe(true);
      expect(plugin.hooks!.onEnable).toHaveBeenCalled();
      expect(manager.getEnabled()).toContainEqual(plugin.metadata);
    });

    it("should enable dependencies automatically", async () => {
      const basePlugin: Plugin = {
        metadata: {
          name: "base",
          version: "1.0.0",
        },
        hooks: {
          onEnable: jest.fn(() => {}),
        },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent",
          version: "1.0.0",
          dependencies: ["base"],
        },
        hooks: {
          onEnable: jest.fn(() => {}),
        },
      };

      await manager.install(basePlugin);
      await manager.install(dependentPlugin);
      await manager.enable("dependent");

      expect(manager.isEnabled("base")).toBe(true);
      expect(manager.isEnabled("dependent")).toBe(true);
      expect(basePlugin.hooks!.onEnable).toHaveBeenCalled();
      expect(dependentPlugin.hooks!.onEnable).toHaveBeenCalled();
    });

    it("should disable a plugin", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "disableable",
          version: "1.0.0",
        },
        hooks: {
          onEnable: jest.fn(() => {}),
          onDisable: jest.fn(() => {}),
        },
      };

      await manager.install(plugin);
      await manager.enable("disableable");
      await manager.disable("disableable");

      expect(manager.isEnabled("disableable")).toBe(false);
      expect(plugin.hooks!.onDisable).toHaveBeenCalled();
    });

    it("should prevent disabling if other enabled plugins depend on it", async () => {
      const basePlugin: Plugin = {
        metadata: {
          name: "base",
          version: "1.0.0",
        },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent",
          version: "1.0.0",
          dependencies: ["base"],
        },
      };

      await manager.install(basePlugin);
      await manager.install(dependentPlugin);
      await manager.enable("dependent");

      await expect(manager.disable("base")).rejects.toThrow(
        "Cannot disable base: dependent depends on it"
      );
    });

    it("should handle enabling already enabled plugin", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "test",
          version: "1.0.0",
        },
        hooks: {
          onEnable: jest.fn(() => {}),
        },
      };

      await manager.install(plugin);
      await manager.enable("test");
      await manager.enable("test"); // Should not throw

      expect(plugin.hooks!.onEnable).toHaveBeenCalledTimes(1);
    });

    it("should handle disabling already disabled plugin", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "test",
          version: "1.0.0",
        },
        hooks: {
          onDisable: jest.fn(() => {}),
        },
      };

      await manager.install(plugin);
      await manager.disable("test"); // Should not throw

      expect(plugin.hooks!.onDisable).not.toHaveBeenCalled();
    });
  });

  describe("plugin capabilities", () => {
    it("should merge configurations from enabled plugins", async () => {
      const plugin1: Plugin = {
        metadata: {
          name: "config1",
          version: "1.0.0",
        },
        capabilities: {
          config: {
            captureStackTrace: true,
            stackTraceLimit: 10,
          },
        },
      };

      const plugin2: Plugin = {
        metadata: {
          name: "config2",
          version: "1.0.0",
        },
        capabilities: {
          config: {
            developmentMode: true,
            stackTraceLimit: 20, // Should override plugin1
          },
        },
      };

      await manager.install(plugin1);
      await manager.install(plugin2);
      await manager.enable("config1");
      await manager.enable("config2");

      const merged = manager.getMergedConfig();
      expect(merged).toEqual({
        captureStackTrace: true,
        stackTraceLimit: 20,
        developmentMode: true,
      });
    });

    it("should collect middleware from enabled plugins", async () => {
      const middleware1 = jest.fn((result: any, next: any) => next());
      const middleware2 = jest.fn((result: any, next: any) => next());

      const plugin1: Plugin = {
        metadata: {
          name: "middleware1",
          version: "1.0.0",
        },
        capabilities: {
          middleware: [middleware1],
        },
      };

      const plugin2: Plugin = {
        metadata: {
          name: "middleware2",
          version: "1.0.0",
        },
        capabilities: {
          middleware: [middleware2],
        },
      };

      await manager.install(plugin1);
      await manager.install(plugin2);
      await manager.enable("middleware1");
      await manager.enable("middleware2");

      const allMiddleware = manager.getAllMiddleware();
      expect(allMiddleware).toEqual([middleware1, middleware2]);
    });

    it("should collect error types from enabled plugins", async () => {
      const errorFactory1 = jest.fn(
        (message: string) =>
          ({
            [TRY_ERROR_BRAND]: true as true,
            type: "CustomError1",
            message,
            source: "plugin1",
            timestamp: Date.now(),
          } as TryError)
      );

      const errorFactory2 = jest.fn(
        (message: string) =>
          ({
            [TRY_ERROR_BRAND]: true as true,
            type: "CustomError2",
            message,
            source: "plugin2",
            timestamp: Date.now(),
          } as TryError)
      );

      const plugin1: Plugin = {
        metadata: {
          name: "errors1",
          version: "1.0.0",
        },
        capabilities: {
          errorTypes: {
            CustomError1: errorFactory1,
          },
        },
      };

      const plugin2: Plugin = {
        metadata: {
          name: "errors2",
          version: "1.0.0",
        },
        capabilities: {
          errorTypes: {
            CustomError2: errorFactory2,
          },
        },
      };

      await manager.install(plugin1);
      await manager.install(plugin2);
      await manager.enable("errors1");
      await manager.enable("errors2");

      const allErrorTypes = manager.getAllErrorTypes();
      expect(allErrorTypes).toHaveProperty("CustomError1");
      expect(allErrorTypes).toHaveProperty("CustomError2");
    });

    it("should collect utilities from enabled plugins", async () => {
      const utility1 = jest.fn();
      const utility2 = jest.fn();

      const plugin1: Plugin = {
        metadata: {
          name: "utils1",
          version: "1.0.0",
        },
        capabilities: {
          utilities: {
            doSomething: utility1,
          },
        },
      };

      const plugin2: Plugin = {
        metadata: {
          name: "utils2",
          version: "1.0.0",
        },
        capabilities: {
          utilities: {
            doSomethingElse: utility2,
          },
        },
      };

      await manager.install(plugin1);
      await manager.install(plugin2);
      await manager.enable("utils1");
      await manager.enable("utils2");

      const allUtilities = manager.getAllUtilities();
      expect(allUtilities).toHaveProperty("doSomething", utility1);
      expect(allUtilities).toHaveProperty("doSomethingElse", utility2);
    });
  });

  describe("configuration change notifications", () => {
    it("should notify all enabled plugins of config changes", async () => {
      const plugin1: Plugin = {
        metadata: {
          name: "listener1",
          version: "1.0.0",
        },
        hooks: {
          onConfigChange: jest.fn((config: TryErrorConfig) => {}),
        },
      };

      const plugin2: Plugin = {
        metadata: {
          name: "listener2",
          version: "1.0.0",
        },
        hooks: {
          onConfigChange: jest.fn((config: TryErrorConfig) => {}),
        },
      };

      const plugin3: Plugin = {
        metadata: {
          name: "listener3",
          version: "1.0.0",
        },
        hooks: {
          onConfigChange: jest.fn((config: TryErrorConfig) => {}),
        },
      };

      await manager.install(plugin1);
      await manager.install(plugin2);
      await manager.install(plugin3);
      await manager.enable("listener1");
      await manager.enable("listener2");
      // listener3 is installed but not enabled

      const newConfig = { captureStackTrace: false };
      await manager.notifyConfigChange(newConfig);

      expect(plugin1.hooks!.onConfigChange).toHaveBeenCalledWith(newConfig);
      expect(plugin2.hooks!.onConfigChange).toHaveBeenCalledWith(newConfig);
      expect(plugin3.hooks!.onConfigChange).not.toHaveBeenCalled();
    });
  });

  describe("plugin querying", () => {
    it("should get specific plugin", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "specific",
          version: "1.0.0",
          description: "A specific plugin",
        },
      };

      await manager.install(plugin);

      const retrieved = manager.get("specific");
      expect(retrieved).toBe(plugin);
      expect(manager.get("non-existent")).toBeUndefined();
    });
  });
});

describe("createPlugin helper", () => {
  it("should create a plugin with the helper", () => {
    const middleware = jest.fn((result: any, next: any) => next());
    const errorFactory = jest.fn(
      (message: string) =>
        ({
          [TRY_ERROR_BRAND]: true as true,
          type: "HelperError",
          message,
          source: "helper",
          timestamp: Date.now(),
        } as TryError)
    );
    const utility = jest.fn();

    const plugin = createPlugin(
      {
        name: "helper-plugin",
        version: "1.0.0",
        description: "Created with helper",
      },
      (api) => {
        return {
          middleware: api.addMiddleware(middleware),
          errorTypes: api.createErrorType("HelperError", errorFactory),
          utilities: api.addUtility("helperUtil", utility),
        };
      }
    );

    expect(plugin.metadata.name).toBe("helper-plugin");
    expect(plugin.capabilities!.middleware).toEqual([middleware]);
    expect(plugin.capabilities!.errorTypes).toHaveProperty("HelperError");
    expect(plugin.capabilities!.utilities).toHaveProperty(
      "helperUtil",
      utility
    );
  });
});

describe("Global plugin manager", () => {
  afterEach(async () => {
    // Clean up global plugin manager
    const installed = pluginManager.getInstalled();
    for (const plugin of installed) {
      try {
        await pluginManager.uninstall(plugin.name);
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  it("should be a singleton instance", () => {
    expect(pluginManager).toBeDefined();
    expect(pluginManager).toBeInstanceOf(PluginManager);
  });
});

describe("Sentry plugin example", () => {
  it("should have correct metadata", () => {
    expect(sentryPlugin.metadata.name).toBe("try-error-sentry");
    expect(sentryPlugin.metadata.version).toBe("1.0.0");
    expect(sentryPlugin.metadata.description).toBe(
      "Sentry integration for try-error"
    );
  });

  it("should have middleware", () => {
    expect(sentryPlugin.capabilities!.middleware).toBeDefined();
    expect(sentryPlugin.capabilities!.middleware!.length).toBeGreaterThan(0);
  });

  it("should have utilities", () => {
    expect(sentryPlugin.capabilities!.utilities).toBeDefined();
    expect(sentryPlugin.capabilities!.utilities!.captureError).toBeDefined();
  });

  it("should log on install and enable", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await sentryPlugin.hooks!.onInstall!();
    expect(consoleSpy).toHaveBeenCalledWith("Sentry plugin installed");

    await sentryPlugin.hooks!.onEnable!();
    expect(consoleSpy).toHaveBeenCalledWith("Sentry plugin enabled");

    consoleSpy.mockRestore();
  });
});
