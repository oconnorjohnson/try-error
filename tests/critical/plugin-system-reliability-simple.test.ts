import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  createError,
  configure,
  getConfig,
  ConfigPresets,
  PluginManager,
  pluginManager,
  createPlugin,
  Plugin,
} from "../../src";

describe("Plugin System Reliability (Actual API)", () => {
  let originalConfig: any;
  let testManager: PluginManager;

  beforeEach(() => {
    originalConfig = getConfig();
    configure(ConfigPresets.development());
    testManager = new PluginManager();
  });

  afterEach(() => {
    configure(originalConfig);
    jest.clearAllMocks();
  });

  describe("Plugin Installation and Management", () => {
    it("should install and manage plugins correctly", async () => {
      const testPlugin: Plugin = {
        metadata: {
          name: "test-plugin",
          version: "1.0.0",
          description: "Test plugin",
        },
        capabilities: {
          config: {
            captureStackTrace: false,
          },
        },
      };

      // Initially no plugins
      expect(testManager.getInstalled()).toHaveLength(0);
      expect(testManager.isInstalled("test-plugin")).toBe(false);

      // Install plugin
      await testManager.install(testPlugin);

      expect(testManager.isInstalled("test-plugin")).toBe(true);
      expect(testManager.getInstalled()).toHaveLength(1);
      expect(testManager.getInstalled()[0].name).toBe("test-plugin");
    });

    it("should handle plugin dependencies", async () => {
      const basePlugin: Plugin = {
        metadata: {
          name: "base-plugin",
          version: "1.0.0",
        },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent-plugin",
          version: "1.0.0",
          dependencies: ["base-plugin"],
        },
      };

      // Install base plugin first
      await testManager.install(basePlugin);

      // Dependent plugin should install successfully
      await expect(testManager.install(dependentPlugin)).resolves.not.toThrow();

      expect(testManager.isInstalled("base-plugin")).toBe(true);
      expect(testManager.isInstalled("dependent-plugin")).toBe(true);
    });

    it("should prevent installation with missing dependencies", async () => {
      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent-plugin",
          version: "1.0.0",
          dependencies: ["missing-plugin"],
        },
      };

      // Should fail due to missing dependency
      await expect(testManager.install(dependentPlugin)).rejects.toThrow(
        /requires missing-plugin/
      );
    });

    it("should prevent duplicate installation", async () => {
      const testPlugin: Plugin = {
        metadata: {
          name: "duplicate-test",
          version: "1.0.0",
        },
      };

      await testManager.install(testPlugin);

      // Second installation should fail
      await expect(testManager.install(testPlugin)).rejects.toThrow(
        /already installed/
      );
    });
  });

  describe("Plugin Enable/Disable", () => {
    it("should enable and disable plugins", async () => {
      const testPlugin: Plugin = {
        metadata: {
          name: "enable-test",
          version: "1.0.0",
        },
        hooks: {
          onEnable: jest.fn(),
          onDisable: jest.fn(),
        },
      };

      await testManager.install(testPlugin);

      // Initially disabled
      expect(testManager.isEnabled("enable-test")).toBe(false);
      expect(testManager.getEnabled()).toHaveLength(0);

      // Enable plugin
      await testManager.enable("enable-test");

      expect(testManager.isEnabled("enable-test")).toBe(true);
      expect(testManager.getEnabled()).toHaveLength(1);
      expect(testPlugin.hooks!.onEnable).toHaveBeenCalled();

      // Disable plugin
      await testManager.disable("enable-test");

      expect(testManager.isEnabled("enable-test")).toBe(false);
      expect(testManager.getEnabled()).toHaveLength(0);
      expect(testPlugin.hooks!.onDisable).toHaveBeenCalled();
    });

    it("should handle dependency order in enable/disable", async () => {
      const basePlugin: Plugin = {
        metadata: {
          name: "base-enable",
          version: "1.0.0",
        },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent-enable",
          version: "1.0.0",
          dependencies: ["base-enable"],
        },
      };

      await testManager.install(basePlugin);
      await testManager.install(dependentPlugin);

      // Enable dependent should auto-enable base
      await testManager.enable("dependent-enable");

      expect(testManager.isEnabled("base-enable")).toBe(true);
      expect(testManager.isEnabled("dependent-enable")).toBe(true);

      // Cannot disable base while dependent is enabled
      await expect(testManager.disable("base-enable")).rejects.toThrow(
        /depends on it/
      );
    });
  });

  describe("Plugin Uninstallation", () => {
    it("should uninstall plugins safely", async () => {
      const testPlugin: Plugin = {
        metadata: {
          name: "uninstall-test",
          version: "1.0.0",
        },
        hooks: {
          onUninstall: jest.fn(),
        },
      };

      await testManager.install(testPlugin);
      await testManager.enable("uninstall-test");

      // Should disable and uninstall
      await testManager.uninstall("uninstall-test");

      expect(testManager.isInstalled("uninstall-test")).toBe(false);
      expect(testManager.isEnabled("uninstall-test")).toBe(false);
      expect(testPlugin.hooks!.onUninstall).toHaveBeenCalled();
    });

    it("should prevent uninstall with active dependencies", async () => {
      const basePlugin: Plugin = {
        metadata: {
          name: "base-uninstall",
          version: "1.0.0",
        },
      };

      const dependentPlugin: Plugin = {
        metadata: {
          name: "dependent-uninstall",
          version: "1.0.0",
          dependencies: ["base-uninstall"],
        },
      };

      await testManager.install(basePlugin);
      await testManager.install(dependentPlugin);

      // Cannot uninstall base while dependent exists
      await expect(testManager.uninstall("base-uninstall")).rejects.toThrow(
        /depends on it/
      );

      // Can uninstall after removing dependent
      await testManager.uninstall("dependent-uninstall");
      await expect(
        testManager.uninstall("base-uninstall")
      ).resolves.not.toThrow();
    });
  });

  describe("Plugin Capabilities", () => {
    it("should merge configurations from enabled plugins", async () => {
      const plugin1: Plugin = {
        metadata: { name: "config1", version: "1.0.0" },
        capabilities: {
          config: {
            captureStackTrace: false,
            stackTraceLimit: 5,
          },
        },
      };

      const plugin2: Plugin = {
        metadata: { name: "config2", version: "1.0.0" },
        capabilities: {
          config: {
            stackTraceLimit: 10,
            developmentMode: true,
          },
        },
      };

      await testManager.install(plugin1);
      await testManager.install(plugin2);
      await testManager.enable("config1");
      await testManager.enable("config2");

      const mergedConfig = testManager.getMergedConfig();

      expect(mergedConfig.captureStackTrace).toBe(false);
      expect(mergedConfig.stackTraceLimit).toBe(10); // plugin2 overrides plugin1
      expect(mergedConfig.developmentMode).toBe(true);
    });

    it("should collect middleware from enabled plugins", async () => {
      const middleware1 = jest.fn((result, next) => next());
      const middleware2 = jest.fn((result, next) => next());

      const plugin1: Plugin = {
        metadata: { name: "middleware1", version: "1.0.0" },
        capabilities: {
          middleware: [middleware1],
        },
      };

      const plugin2: Plugin = {
        metadata: { name: "middleware2", version: "1.0.0" },
        capabilities: {
          middleware: [middleware2],
        },
      };

      await testManager.install(plugin1);
      await testManager.install(plugin2);
      await testManager.enable("middleware1");
      await testManager.enable("middleware2");

      const allMiddleware = testManager.getAllMiddleware();

      expect(allMiddleware).toHaveLength(2);
      expect(allMiddleware).toContain(middleware1);
      expect(allMiddleware).toContain(middleware2);
    });

    it("should collect error types from enabled plugins", async () => {
      const customErrorFactory = jest.fn((message: string) =>
        createError({ type: "Custom", message })
      );

      const plugin: Plugin = {
        metadata: { name: "error-types", version: "1.0.0" },
        capabilities: {
          errorTypes: {
            CustomError: customErrorFactory,
          },
        },
      };

      await testManager.install(plugin);
      await testManager.enable("error-types");

      const errorTypes = testManager.getAllErrorTypes();

      expect(errorTypes).toHaveProperty("CustomError");
      expect(errorTypes.CustomError).toBe(customErrorFactory);
    });

    it("should collect utilities from enabled plugins", async () => {
      const customUtility = jest.fn();

      const plugin: Plugin = {
        metadata: { name: "utilities", version: "1.0.0" },
        capabilities: {
          utilities: {
            customFunction: customUtility,
          },
        },
      };

      await testManager.install(plugin);
      await testManager.enable("utilities");

      const utilities = testManager.getAllUtilities();

      expect(utilities).toHaveProperty("customFunction");
      expect(utilities.customFunction).toBe(customUtility);
    });
  });

  describe("Plugin Lifecycle Hooks", () => {
    it("should call lifecycle hooks at appropriate times", async () => {
      const hooks = {
        onInstall: jest.fn(),
        onUninstall: jest.fn(),
        onEnable: jest.fn(),
        onDisable: jest.fn(),
        onConfigChange: jest.fn(),
      };

      const plugin: Plugin = {
        metadata: { name: "lifecycle", version: "1.0.0" },
        hooks,
      };

      // Install
      await testManager.install(plugin);
      expect(hooks.onInstall).toHaveBeenCalled();

      // Enable
      await testManager.enable("lifecycle");
      expect(hooks.onEnable).toHaveBeenCalled();

      // Config change
      await testManager.notifyConfigChange(getConfig());
      expect(hooks.onConfigChange).toHaveBeenCalled();

      // Disable
      await testManager.disable("lifecycle");
      expect(hooks.onDisable).toHaveBeenCalled();

      // Uninstall
      await testManager.uninstall("lifecycle");
      expect(hooks.onUninstall).toHaveBeenCalled();
    });

    it("should handle async hooks", async () => {
      const asyncHook = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const plugin: Plugin = {
        metadata: { name: "async-hooks", version: "1.0.0" },
        hooks: {
          onInstall: asyncHook,
        },
      };

      await testManager.install(plugin);

      expect(asyncHook).toHaveBeenCalled();
    });
  });

  describe("Plugin Creation Helper", () => {
    it("should work with createPlugin helper", async () => {
      const testPlugin = createPlugin(
        {
          name: "helper-test",
          version: "1.0.0",
          description: "Test plugin created with helper",
        },
        (api) => ({
          errorTypes: api.createErrorType("HelperError", (message) =>
            createError({ type: "HelperError", message })
          ),
          middleware: api.addMiddleware(jest.fn((result, next) => next())),
          utilities: api.addUtility("helperFunction", jest.fn()),
        })
      );

      await testManager.install(testPlugin);
      await testManager.enable("helper-test");

      expect(testManager.isInstalled("helper-test")).toBe(true);
      expect(testManager.isEnabled("helper-test")).toBe(true);

      const errorTypes = testManager.getAllErrorTypes();
      const middleware = testManager.getAllMiddleware();
      const utilities = testManager.getAllUtilities();

      expect(errorTypes).toHaveProperty("HelperError");
      expect(middleware).toHaveLength(1);
      expect(utilities).toHaveProperty("helperFunction");
    });
  });

  describe("Global Plugin Manager", () => {
    it("should work with global pluginManager instance", async () => {
      const globalPlugin: Plugin = {
        metadata: { name: "global-test", version: "1.0.0" },
      };

      const initialCount = pluginManager.getInstalled().length;

      await pluginManager.install(globalPlugin);

      expect(pluginManager.isInstalled("global-test")).toBe(true);
      expect(pluginManager.getInstalled()).toHaveLength(initialCount + 1);

      // Cleanup
      await pluginManager.uninstall("global-test");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle operations on non-existent plugins", async () => {
      await expect(testManager.uninstall("non-existent")).rejects.toThrow(
        /not installed/
      );
      await expect(testManager.enable("non-existent")).rejects.toThrow(
        /not installed/
      );
      await expect(testManager.disable("non-existent")).rejects.toThrow(
        /not installed/
      );

      expect(testManager.get("non-existent")).toBeUndefined();
      expect(testManager.isInstalled("non-existent")).toBe(false);
      expect(testManager.isEnabled("non-existent")).toBe(false);
    });

    it("should handle plugins with empty capabilities", async () => {
      const emptyPlugin: Plugin = {
        metadata: { name: "empty", version: "1.0.0" },
      };

      await testManager.install(emptyPlugin);
      await testManager.enable("empty");

      const config = testManager.getMergedConfig();
      const middleware = testManager.getAllMiddleware();
      const errorTypes = testManager.getAllErrorTypes();
      const utilities = testManager.getAllUtilities();

      expect(config).toEqual({});
      expect(middleware).toEqual([]);
      expect(errorTypes).toEqual({});
      expect(utilities).toEqual({});
    });

    it("should handle circular dependencies gracefully", async () => {
      const plugin1: Plugin = {
        metadata: {
          name: "circular1",
          version: "1.0.0",
          dependencies: ["circular2"],
        },
      };

      const plugin2: Plugin = {
        metadata: {
          name: "circular2",
          version: "1.0.0",
          dependencies: ["circular1"],
        },
      };

      // Neither can be installed due to missing dependency
      await expect(testManager.install(plugin1)).rejects.toThrow();
      await expect(testManager.install(plugin2)).rejects.toThrow();
    });
  });
});
