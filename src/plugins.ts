/**
 * Plugin system for try-error
 *
 * This module provides a plugin architecture that allows third-party extensions
 * to add functionality to try-error in a structured way.
 */

import { TryError, TryResult } from "./types";
import { TryErrorConfig } from "./config";
import { ErrorMiddleware } from "./middleware";

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
  /**
   * Called when the plugin is installed
   */
  onInstall?: () => void | Promise<void>;

  /**
   * Called when the plugin is uninstalled
   */
  onUninstall?: () => void | Promise<void>;

  /**
   * Called when the plugin is enabled
   */
  onEnable?: () => void | Promise<void>;

  /**
   * Called when the plugin is disabled
   */
  onDisable?: () => void | Promise<void>;

  /**
   * Called when configuration changes
   */
  onConfigChange?: (config: TryErrorConfig) => void | Promise<void>;
}

/**
 * Plugin capabilities
 */
export interface PluginCapabilities {
  /**
   * Configuration modifications
   */
  config?: Partial<TryErrorConfig>;

  /**
   * Middleware to add
   */
  middleware?: ErrorMiddleware[];

  /**
   * Custom error types to register
   */
  errorTypes?: Record<string, (message: string, context?: any) => TryError>;

  /**
   * Custom utilities to expose
   */
  utilities?: Record<string, Function>;

  /**
   * Custom transformers
   */
  transformers?: {
    error?: (error: TryError) => TryError;
    result?: <T>(result: TryResult<T>) => TryResult<T>;
  };
}

/**
 * Plugin interface
 */
export interface Plugin {
  metadata: PluginMetadata;
  hooks?: PluginHooks;
  capabilities?: PluginCapabilities;
}

/**
 * Plugin manager
 */
export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private enabledPlugins = new Set<string>();
  private pluginOrder: string[] = [];

  /**
   * Install a plugin
   */
  async install(plugin: Plugin): Promise<void> {
    const { name } = plugin.metadata;

    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} is already installed`);
    }

    // Check dependencies
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `Plugin ${name} requires ${dep} to be installed first`
          );
        }
      }
    }

    // Install the plugin
    this.plugins.set(name, plugin);
    this.pluginOrder.push(name);

    // Call install hook
    if (plugin.hooks?.onInstall) {
      await plugin.hooks.onInstall();
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} is not installed`);
    }

    // Check if other plugins depend on this one
    for (const [otherName, otherPlugin] of this.plugins) {
      if (
        otherName !== name &&
        otherPlugin.metadata.dependencies?.includes(name)
      ) {
        throw new Error(`Cannot uninstall ${name}: ${otherName} depends on it`);
      }
    }

    // Disable if enabled
    if (this.enabledPlugins.has(name)) {
      await this.disable(name);
    }

    // Call uninstall hook
    if (plugin.hooks?.onUninstall) {
      await plugin.hooks.onUninstall();
    }

    // Remove the plugin
    this.plugins.delete(name);
    this.pluginOrder = this.pluginOrder.filter((n) => n !== name);
  }

  /**
   * Enable a plugin
   */
  async enable(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} is not installed`);
    }

    if (this.enabledPlugins.has(name)) {
      return; // Already enabled
    }

    // Enable dependencies first
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        if (!this.enabledPlugins.has(dep)) {
          await this.enable(dep);
        }
      }
    }

    // Call enable hook
    if (plugin.hooks?.onEnable) {
      await plugin.hooks.onEnable();
    }

    this.enabledPlugins.add(name);
  }

  /**
   * Disable a plugin
   */
  async disable(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} is not installed`);
    }

    if (!this.enabledPlugins.has(name)) {
      return; // Already disabled
    }

    // Check if other enabled plugins depend on this one
    for (const enabledName of this.enabledPlugins) {
      if (enabledName !== name) {
        const enabledPlugin = this.plugins.get(enabledName)!;
        if (enabledPlugin.metadata.dependencies?.includes(name)) {
          throw new Error(
            `Cannot disable ${name}: ${enabledName} depends on it`
          );
        }
      }
    }

    // Call disable hook
    if (plugin.hooks?.onDisable) {
      await plugin.hooks.onDisable();
    }

    this.enabledPlugins.delete(name);
  }

  /**
   * Get all installed plugins
   */
  getInstalled(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map((p) => p.metadata);
  }

  /**
   * Get all enabled plugins
   */
  getEnabled(): PluginMetadata[] {
    return Array.from(this.enabledPlugins).map(
      (name) => this.plugins.get(name)!.metadata
    );
  }

  /**
   * Get a specific plugin
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if a plugin is installed
   */
  isInstalled(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Check if a plugin is enabled
   */
  isEnabled(name: string): boolean {
    return this.enabledPlugins.has(name);
  }

  /**
   * Get merged configuration from all enabled plugins
   */
  getMergedConfig(): Partial<TryErrorConfig> {
    const configs: Partial<TryErrorConfig>[] = [];

    for (const name of this.pluginOrder) {
      if (this.enabledPlugins.has(name)) {
        const plugin = this.plugins.get(name)!;
        if (plugin.capabilities?.config) {
          configs.push(plugin.capabilities.config);
        }
      }
    }

    // Merge all configs
    return configs.reduce(
      (merged, config) => ({
        ...merged,
        ...config,
      }),
      {}
    );
  }

  /**
   * Get all middleware from enabled plugins
   */
  getAllMiddleware(): ErrorMiddleware[] {
    const middleware: ErrorMiddleware[] = [];

    for (const name of this.pluginOrder) {
      if (this.enabledPlugins.has(name)) {
        const plugin = this.plugins.get(name)!;
        if (plugin.capabilities?.middleware) {
          middleware.push(...plugin.capabilities.middleware);
        }
      }
    }

    return middleware;
  }

  /**
   * Get all custom error types from enabled plugins
   */
  getAllErrorTypes(): Record<
    string,
    (message: string, context?: any) => TryError
  > {
    const errorTypes: Record<
      string,
      (message: string, context?: any) => TryError
    > = {};

    for (const name of this.pluginOrder) {
      if (this.enabledPlugins.has(name)) {
        const plugin = this.plugins.get(name)!;
        if (plugin.capabilities?.errorTypes) {
          Object.assign(errorTypes, plugin.capabilities.errorTypes);
        }
      }
    }

    return errorTypes;
  }

  /**
   * Get all utilities from enabled plugins
   */
  getAllUtilities(): Record<string, Function> {
    const utilities: Record<string, Function> = {};

    for (const name of this.pluginOrder) {
      if (this.enabledPlugins.has(name)) {
        const plugin = this.plugins.get(name)!;
        if (plugin.capabilities?.utilities) {
          Object.assign(utilities, plugin.capabilities.utilities);
        }
      }
    }

    return utilities;
  }

  /**
   * Notify all plugins of a configuration change
   */
  async notifyConfigChange(config: TryErrorConfig): Promise<void> {
    for (const name of this.enabledPlugins) {
      const plugin = this.plugins.get(name)!;
      if (plugin.hooks?.onConfigChange) {
        await plugin.hooks.onConfigChange(config);
      }
    }
  }
}

/**
 * Global plugin manager instance
 */
export const pluginManager = new PluginManager();

/**
 * Create a plugin helper
 */
export function createPlugin(
  metadata: PluginMetadata,
  setup: (api: PluginAPI) => Plugin["capabilities"]
): Plugin {
  const capabilities = setup({
    createErrorType: (
      type: string,
      factory: (message: string, context?: any) => TryError
    ) => {
      return { [type]: factory };
    },
    addMiddleware: (...middleware: ErrorMiddleware[]) => middleware,
    addUtility: (name: string, fn: Function) => ({ [name]: fn }),
  });

  return {
    metadata,
    capabilities,
  };
}

/**
 * Plugin API provided to plugins during setup
 */
export interface PluginAPI {
  createErrorType: (
    type: string,
    factory: (message: string, context?: any) => TryError
  ) => Record<string, Function>;
  addMiddleware: (...middleware: ErrorMiddleware[]) => ErrorMiddleware[];
  addUtility: (name: string, fn: Function) => Record<string, Function>;
}

/**
 * Example plugin: Sentry integration
 */
export const sentryPlugin: Plugin = {
  metadata: {
    name: "try-error-sentry",
    version: "1.0.0",
    description: "Sentry integration for try-error",
    author: "try-error team",
  },
  hooks: {
    onInstall: async () => {
      console.log("Sentry plugin installed");
    },
    onEnable: async () => {
      console.log("Sentry plugin enabled");
    },
  },
  capabilities: {
    middleware: [
      // Sentry error reporting middleware
      (result, next) => {
        if (
          isTryError(result) &&
          typeof window !== "undefined" &&
          (window as any).Sentry
        ) {
          (window as any).Sentry.captureException(result);
        }
        return next();
      },
    ],
    utilities: {
      captureError: (error: TryError) => {
        if (typeof window !== "undefined" && (window as any).Sentry) {
          (window as any).Sentry.captureException(error);
        }
      },
    },
  },
};

// Import for type checking
import { isTryError } from "./types";
