import { Plugin, PluginManager, PluginHooks } from "../../src/plugins";
import { TryErrorConfig } from "../../src/config";

describe("Plugin System Type Issues", () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe("Plugin Hook Type Safety", () => {
    it("should handle void-returning hooks correctly", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "void-hooks",
          version: "1.0.0",
        },
        hooks: {
          onInstall: () => {
            // Void return - this should be valid
          },
          onEnable: () => {
            // Void return - this should be valid
          },
          onDisable: () => {
            // Void return - this should be valid
          },
          onUninstall: () => {
            // Void return - this should be valid
          },
          onConfigChange: (config: TryErrorConfig) => {
            // Void return with parameter - this should be valid
          },
        },
      };

      // These should all work without type errors
      await manager.install(plugin);
      await manager.enable("void-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("void-hooks");
      await manager.uninstall("void-hooks");
    });

    it("should handle Promise-returning hooks correctly", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "promise-hooks",
          version: "1.0.0",
        },
        hooks: {
          onInstall: async () => {
            // Promise<void> return - this should be valid
            await new Promise((resolve) => setTimeout(resolve, 1));
          },
          onEnable: async () => {
            // Promise<void> return - this should be valid
            await new Promise((resolve) => setTimeout(resolve, 1));
          },
          onDisable: async () => {
            // Promise<void> return - this should be valid
            await new Promise((resolve) => setTimeout(resolve, 1));
          },
          onUninstall: async () => {
            // Promise<void> return - this should be valid
            await new Promise((resolve) => setTimeout(resolve, 1));
          },
          onConfigChange: async (config: TryErrorConfig) => {
            // Promise<void> return with parameter - this should be valid
            await new Promise((resolve) => setTimeout(resolve, 1));
          },
        },
      };

      // These should all work without type errors
      await manager.install(plugin);
      await manager.enable("promise-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("promise-hooks");
      await manager.uninstall("promise-hooks");
    });

    it("should handle mixed hook types correctly", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "mixed-hooks",
          version: "1.0.0",
        },
        hooks: {
          onInstall: () => {
            // Void return
          },
          onEnable: async () => {
            // Promise<void> return
            await new Promise((resolve) => setTimeout(resolve, 1));
          },
          onDisable: () => {
            // Void return
          },
          onUninstall: async () => {
            // Promise<void> return
            await new Promise((resolve) => setTimeout(resolve, 1));
          },
          onConfigChange: async (config: TryErrorConfig) => {
            // Promise<void> return with parameter
            await new Promise((resolve) => setTimeout(resolve, 1));
          },
        },
      };

      // These should all work without type errors
      await manager.install(plugin);
      await manager.enable("mixed-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("mixed-hooks");
      await manager.uninstall("mixed-hooks");
    });

    it("should handle hooks with proper Jest mock types", async () => {
      // Test the type issue that might occur with jest.fn()
      const mockHooks: PluginHooks = {
        onInstall: jest.fn((): void => {}),
        onEnable: jest.fn((): void => {}),
        onDisable: jest.fn((): void => {}),
        onUninstall: jest.fn((): void => {}),
        onConfigChange: jest.fn((config: TryErrorConfig): void => {}),
      };

      const plugin: Plugin = {
        metadata: {
          name: "mocked-hooks",
          version: "1.0.0",
        },
        hooks: mockHooks,
      };

      await manager.install(plugin);
      await manager.enable("mocked-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("mocked-hooks");
      await manager.uninstall("mocked-hooks");

      // Verify mocks were called
      expect(mockHooks.onInstall).toHaveBeenCalled();
      expect(mockHooks.onEnable).toHaveBeenCalled();
      expect(mockHooks.onConfigChange).toHaveBeenCalledWith({
        captureStackTrace: true,
      });
      expect(mockHooks.onDisable).toHaveBeenCalled();
      expect(mockHooks.onUninstall).toHaveBeenCalled();
    });

    it("should handle hooks with proper async Jest mock types", async () => {
      // Test the type issue that might occur with async jest.fn()
      const mockHooks: PluginHooks = {
        onInstall: jest.fn(async (): Promise<void> => {}),
        onEnable: jest.fn(async (): Promise<void> => {}),
        onDisable: jest.fn(async (): Promise<void> => {}),
        onUninstall: jest.fn(async (): Promise<void> => {}),
        onConfigChange: jest.fn(
          async (config: TryErrorConfig): Promise<void> => {}
        ),
      };

      const plugin: Plugin = {
        metadata: {
          name: "async-mocked-hooks",
          version: "1.0.0",
        },
        hooks: mockHooks,
      };

      await manager.install(plugin);
      await manager.enable("async-mocked-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("async-mocked-hooks");
      await manager.uninstall("async-mocked-hooks");

      // Verify mocks were called
      expect(mockHooks.onInstall).toHaveBeenCalled();
      expect(mockHooks.onEnable).toHaveBeenCalled();
      expect(mockHooks.onConfigChange).toHaveBeenCalledWith({
        captureStackTrace: true,
      });
      expect(mockHooks.onDisable).toHaveBeenCalled();
      expect(mockHooks.onUninstall).toHaveBeenCalled();
    });

    it("should handle hooks that throw errors gracefully", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "error-hooks",
          version: "1.0.0",
        },
        hooks: {
          onInstall: () => {
            throw new Error("Install failed");
          },
          onEnable: async () => {
            throw new Error("Enable failed");
          },
          onDisable: () => {
            throw new Error("Disable failed");
          },
          onUninstall: async () => {
            throw new Error("Uninstall failed");
          },
          onConfigChange: (config: TryErrorConfig) => {
            throw new Error("Config change failed");
          },
        },
      };

      // These should handle errors gracefully
      await expect(manager.install(plugin)).rejects.toThrow("Install failed");

      // Install a working plugin first
      const workingPlugin: Plugin = {
        metadata: {
          name: "working-plugin",
          version: "1.0.0",
        },
        hooks: {
          onEnable: async () => {
            throw new Error("Enable failed");
          },
          onDisable: () => {
            throw new Error("Disable failed");
          },
          onUninstall: async () => {
            throw new Error("Uninstall failed");
          },
          onConfigChange: (config: TryErrorConfig) => {
            throw new Error("Config change failed");
          },
        },
      };

      await manager.install(workingPlugin);
      await expect(manager.enable("working-plugin")).rejects.toThrow(
        "Enable failed"
      );
    });

    it("should handle optional hooks correctly", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "optional-hooks",
          version: "1.0.0",
        },
        hooks: {
          // Only provide some hooks, others are optional
          onInstall: () => {
            // Only install hook provided
          },
          onConfigChange: (config: TryErrorConfig) => {
            // Only config change hook provided
          },
        },
      };

      // Should work even with missing optional hooks
      await manager.install(plugin);
      await manager.enable("optional-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("optional-hooks");
      await manager.uninstall("optional-hooks");
    });
  });

  describe("Plugin API Type Safety", () => {
    it("should handle undefined/null hooks correctly", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "undefined-hooks",
          version: "1.0.0",
        },
        hooks: {
          onInstall: undefined,
          onEnable: undefined,
          onDisable: undefined,
          onUninstall: undefined,
          onConfigChange: undefined,
        },
      };

      // Should work with undefined hooks
      await manager.install(plugin);
      await manager.enable("undefined-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("undefined-hooks");
      await manager.uninstall("undefined-hooks");
    });

    it("should handle plugins with no hooks correctly", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "no-hooks",
          version: "1.0.0",
        },
        // No hooks property at all
      };

      // Should work with no hooks
      await manager.install(plugin);
      await manager.enable("no-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("no-hooks");
      await manager.uninstall("no-hooks");
    });

    it("should handle plugins with empty hooks correctly", async () => {
      const plugin: Plugin = {
        metadata: {
          name: "empty-hooks",
          version: "1.0.0",
        },
        hooks: {},
      };

      // Should work with empty hooks object
      await manager.install(plugin);
      await manager.enable("empty-hooks");
      await manager.notifyConfigChange({ captureStackTrace: true });
      await manager.disable("empty-hooks");
      await manager.uninstall("empty-hooks");
    });
  });
});
